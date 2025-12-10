/**
 * Daily Quest Routes
 * Handles daily challenges for avatar item rewards
 */

const express = require('express');
const router = express.Router();
const DailyQuest = require('../models/DailyQuest');
const Avatar = require('../models/Avatar');
const { UserStats } = require('../models/Achievement');
const { getItemById } = require('../config/avatarItems');
const { authenticateToken } = require('../../../shared/middleware/auth');
const asyncHandler = require('express-async-handler');

/**
 * @route   GET /api/quests/daily
 * @desc    Get user's daily quests (generates if not exist)
 * @access  Private
 */
router.get('/daily', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  // Expire old quests first
  await DailyQuest.expireOldQuests();

  // Get or generate today's quests
  let quests = await DailyQuest.getActiveQuests(userId);

  if (quests.length === 0) {
    quests = await DailyQuest.generateDailyQuests(userId);
  }

  res.json({
    success: true,
    data: {
      quests,
      totalActive: quests.filter(q => q.status === 'active').length,
      totalCompleted: quests.filter(q => q.status === 'completed').length,
    },
    message: 'Daily quests retrieved successfully',
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   POST /api/quests/progress
 * @desc    Update quest progress
 * @access  Private
 */
router.post('/progress', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { questType, value = 1 } = req.body;

  if (!questType) {
    return res.status(400).json({
      success: false,
      message: 'Quest type is required',
    });
  }

  // Find active quests of this type
  const quests = await DailyQuest.find({
    user: userId,
    questType,
    status: 'active',
    expiresAt: { $gt: new Date() },
  });

  const updatedQuests = [];
  const completedQuests = [];

  for (const quest of quests) {
    const wasCompleted = quest.status === 'completed';
    await quest.updateProgress(value);
    updatedQuests.push(quest);

    if (!wasCompleted && quest.status === 'completed') {
      completedQuests.push({
        title: quest.title,
        reward: quest.reward,
      });
    }
  }

  res.json({
    success: true,
    data: {
      updatedQuests,
      completedQuests,
    },
    message: completedQuests.length > 0 
      ? `Quest${completedQuests.length > 1 ? 's' : ''} completed! Claim your reward${completedQuests.length > 1 ? 's' : ''}!`
      : 'Progress updated',
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   POST /api/quests/:questId/claim
 * @desc    Claim quest reward
 * @access  Private
 */
router.post('/:questId/claim', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { questId } = req.params;

  // Find the quest
  const quest = await DailyQuest.findOne({
    _id: questId,
    user: userId,
  });

  if (!quest) {
    return res.status(404).json({
      success: false,
      message: 'Quest not found',
    });
  }

  if (quest.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Quest not completed yet',
    });
  }

  if (quest.status === 'claimed') {
    return res.status(400).json({
      success: false,
      message: 'Reward already claimed',
    });
  }

  // Claim the quest
  await quest.claimReward();

  // Award the reward
  const rewards = {
    xp: quest.reward.xpBonus || 0,
    coins: quest.reward.coinBonus || 0,
  };

  // Get or create avatar
  const avatar = await Avatar.getOrCreate(userId);

  // Unlock the avatar item if specified
  let unlockedItem = null;
  if (quest.reward.itemId && quest.reward.itemType) {
    const item = getItemById(quest.reward.itemId);
    
    if (item) {
      const categoryMap = {
        headAccessories: 'accessories',
        faceAccessories: 'accessories',
        badges: 'accessories',
        backgrounds: 'backgrounds',
        hairStyles: 'hairStyles',
        expressions: 'expressions',
      };

      const unlockCategory = categoryMap[quest.reward.itemType];
      
      if (unlockCategory && !avatar.unlockedItems[unlockCategory]?.includes(quest.reward.itemId)) {
        await avatar.unlockItem(quest.reward.itemId, unlockCategory);
        unlockedItem = {
          id: item.id,
          name: item.name,
          type: quest.reward.itemType,
          rarity: item.rarity,
        };
      }
    }
  }

  // Award XP
  if (rewards.xp > 0) {
    const userStats = await UserStats.findOne({ user: userId });
    if (userStats) {
      userStats.experience += rewards.xp;
      userStats.coins = (userStats.coins || 0) + (rewards.coins || 0);
      await userStats.save();
    }
  }

  res.json({
    success: true,
    data: {
      quest,
      rewards,
      unlockedItem,
    },
    message: 'Reward claimed successfully!',
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   GET /api/quests/history
 * @desc    Get quest completion history
 * @access  Private
 */
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { limit = 20, page = 1 } = req.query;

  const quests = await DailyQuest.find({
    user: userId,
    status: { $in: ['completed', 'claimed'] },
  })
    .sort({ completedAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await DailyQuest.countDocuments({
    user: userId,
    status: { $in: ['completed', 'claimed'] },
  });

  // Calculate stats
  const stats = {
    totalCompleted: total,
    totalRewardsEarned: quests.reduce((sum, q) => sum + (q.reward.xpBonus || 0), 0),
    byDifficulty: {
      easy: await DailyQuest.countDocuments({ user: userId, difficulty: 'easy', status: 'claimed' }),
      medium: await DailyQuest.countDocuments({ user: userId, difficulty: 'medium', status: 'claimed' }),
      hard: await DailyQuest.countDocuments({ user: userId, difficulty: 'hard', status: 'claimed' }),
    },
  };

  res.json({
    success: true,
    data: {
      quests,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
    message: 'Quest history retrieved successfully',
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   GET /api/quests/stats
 * @desc    Get quest statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const [totalQuests, completedQuests, activeQuests] = await Promise.all([
    DailyQuest.countDocuments({ user: userId }),
    DailyQuest.countDocuments({ user: userId, status: { $in: ['completed', 'claimed'] } }),
    DailyQuest.countDocuments({ user: userId, status: 'active', expiresAt: { $gt: new Date() } }),
  ]);

  const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  // Get streak (consecutive days with at least one quest completed)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const recentQuests = await DailyQuest.find({
    user: userId,
    status: { $in: ['completed', 'claimed'] },
    completedAt: { $gte: last7Days },
  }).select('completedAt').sort({ completedAt: -1 });

  // Calculate streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const nextDay = new Date(checkDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const questsOnDay = recentQuests.filter(q => {
      const qDate = new Date(q.completedAt);
      return qDate >= checkDate && qDate < nextDay;
    });

    if (questsOnDay.length > 0) {
      currentStreak++;
    } else if (i > 0) {
      break; // Streak broken
    }
  }

  res.json({
    success: true,
    data: {
      totalQuests,
      completedQuests,
      activeQuests,
      completionRate,
      currentStreak,
    },
    message: 'Quest stats retrieved successfully',
    timestamp: new Date().toISOString(),
  });
}));

module.exports = router;
