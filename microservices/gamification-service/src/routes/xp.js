const express = require('express');
const router = express.Router();
const statsManager = require('../services/statsManager');
const achievementProcessor = require('../services/achievementProcessor');
const { authenticateToken } = require('../../../shared/middleware/auth');

/**
 * POST /api/award-xp
 * Award XP to current user
 */
router.post('/award-xp', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid XP amount',
      });
    }

    // Update stats
    const resultData = {
      experienceGained: amount,
      pointsEarned: amount,
      bonusPoints: 0,
      passed: true,
      percentage: 0,
      totalTimeTaken: 0,
    };

    await statsManager.updateStats(userId, resultData);
    const stats = await statsManager.getStats(userId);

    // Check for level up
    const oldLevel = Math.floor((stats.experience - amount) / 100) + 1;
    const newLevel = Math.floor(stats.experience / 100) + 1;
    const levelUp = newLevel > oldLevel;

    // Auto-unlock level-based avatar items if leveled up
    let avatarUnlocks = [];
    if (levelUp) {
      try {
        const { unlockLevelBasedItems } = require('../services/avatarService');
        const avatarResult = await unlockLevelBasedItems(userId, newLevel);
        if (avatarResult.unlocked && avatarResult.items?.length > 0) {
          avatarUnlocks = avatarResult.items;
          console.log(`🎁 Unlocked ${avatarResult.items.length} avatar item(s) at level ${newLevel}`);
        }
      } catch (avatarError) {
        console.error('Error unlocking level-based avatar items:', avatarError);
      }
    }

    res.json({
      success: true,
      message: `Awarded ${amount} XP for ${reason}`,
      stats: {
        experience: stats.experience,
        totalPoints: stats.totalPoints,
        level: stats.level || newLevel,
      },
      xpGained: amount,
      levelUp,
      avatarUnlocks: avatarUnlocks.length > 0 ? avatarUnlocks : undefined,
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    next(error);
  }
});

/**
 * POST /api/check-achievements
 * Check achievements for current user
 */
router.post('/check-achievements', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const eventData = req.body;

    // Check achievements
    const unlockedAchievements = await achievementProcessor.checkAchievements(userId, eventData);

    res.json({
      success: true,
      message: 'Achievements checked',
      unlockedCount: unlockedAchievements.length,
      achievements: unlockedAchievements.map(ua => ({
        id: ua.achievement._id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        points: ua.achievement.points,
        rarity: ua.achievement.rarity,
      })),
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    next(error);
  }
});

module.exports = router;
