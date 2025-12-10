/**
 * Avatar Routes
 * Handles avatar creation, customization, and unlockables
 */

const express = require('express');
const router = express.Router();
const Avatar = require('../models/Avatar');
const { UserStats } = require('../models/Achievement');
const { getAllItems, getItemById, checkUnlockRequirement } = require('../config/avatarItems');
const { authenticateToken } = require('../../../shared/middleware/auth');
const asyncHandler = require('express-async-handler');

/**
 * @route   GET /api/avatar/me
 * @desc    Get user's avatar (creates if doesn't exist)
 * @access  Private
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  // Get or create avatar
  const avatar = await Avatar.getOrCreate(userId);

  // Get user stats for level info
  const userStats = await UserStats.findOne({ user: userId });
  const userLevel = userStats?.level || 1;

  res.json({
    success: true,
    data: {
      avatar,
      level: userLevel,
      xp: userStats?.experience || 0,
    },
    message: 'Avatar retrieved successfully',
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   PUT /api/avatar/customize
 * @desc    Update avatar customization
 * @access  Private
 */
router.put('/customize', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { customization } = req.body;

  if (!customization) {
    return res.status(400).json({
      success: false,
      message: 'Customization data is required',
    });
  }

  // Get avatar
  let avatar = await Avatar.findOne({ userId });
  if (!avatar) {
    avatar = await Avatar.getOrCreate(userId);
  }

  // Validate unlocked items
  const { accessories = [], background } = customization;
  
  // Check if user has unlocked accessories
  for (const accessoryId of accessories) {
    if (!avatar.hasUnlocked('accessories', accessoryId)) {
      return res.status(403).json({
        success: false,
        message: `Accessory '${accessoryId}' is not unlocked`,
      });
    }
  }

  // Check if user has unlocked background
  if (background && !avatar.hasUnlocked('backgrounds', background)) {
    return res.status(403).json({
      success: false,
      message: `Background '${background}' is not unlocked`,
    });
  }

  // Update customization
  await avatar.updateCustomization(customization);

  res.json({
    success: true,
    data: { avatar },
    message: 'Avatar customized successfully',
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   PUT /api/avatar/character
 * @desc    Change base character
 * @access  Private
 */
router.put('/character', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { characterId } = req.body;

  if (!characterId) {
    return res.status(400).json({
      success: false,
      message: 'Character ID is required',
    });
  }

  // Get avatar
  let avatar = await Avatar.findOne({ userId });
  if (!avatar) {
    avatar = await Avatar.getOrCreate(userId);
  }

  // Check if character is unlocked
  if (!avatar.hasUnlocked('baseCharacters', characterId)) {
    return res.status(403).json({
      success: false,
      message: `Character '${characterId}' is not unlocked`,
    });
  }

  // Update base character
  avatar.baseCharacter = characterId;
  await avatar.save();

  res.json({
    success: true,
    data: { avatar },
    message: 'Character changed successfully',
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   PUT /api/avatar/mood
 * @desc    Update avatar mood
 * @access  Private
 */
router.put('/mood', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { mood } = req.body;

  if (!mood) {
    return res.status(400).json({
      success: false,
      message: 'Mood is required',
    });
  }

  // Get avatar
  let avatar = await Avatar.findOne({ userId });
  if (!avatar) {
    avatar = await Avatar.getOrCreate(userId);
  }

  // Update mood
  await avatar.setMood(mood);

  res.json({
    success: true,
    data: { avatar },
    message: 'Mood updated successfully',
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   POST /api/avatar/unlock
 * @desc    Unlock avatar item (called by achievement system)
 * @access  Private
 */
router.post('/unlock', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { itemId, itemType } = req.body;

  if (!itemId || !itemType) {
    return res.status(400).json({
      success: false,
      message: 'Item ID and type are required',
    });
  }

  // Get avatar
  let avatar = await Avatar.findOne({ userId });
  if (!avatar) {
    avatar = await Avatar.getOrCreate(userId);
  }

  // Check if already unlocked
  const category = itemType === 'baseCharacter' ? 'baseCharacters' : 
                   itemType === 'headAccessory' || itemType === 'faceAccessory' || itemType === 'badge' ? 'accessories' :
                   itemType === 'background' ? 'backgrounds' :
                   itemType === 'hairStyle' ? 'hairStyles' :
                   itemType === 'expression' ? 'expressions' : null;

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Invalid item type',
    });
  }

  if (avatar.hasUnlocked(category, itemId)) {
    return res.json({
      success: true,
      data: { avatar, alreadyUnlocked: true },
      message: 'Item was already unlocked',
      timestamp: new Date().toISOString(),
    });
  }

  // Unlock item
  await avatar.unlockItem(category, itemId);

  res.json({
    success: true,
    data: { avatar, newUnlock: true },
    message: `${itemType} '${itemId}' unlocked successfully!`,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   GET /api/avatar/items
 * @desc    Get all avatar items with unlock status
 * @access  Private
 */
router.get('/items', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  // Get avatar and user stats
  const avatar = await Avatar.findOne({ userId }) || await Avatar.getOrCreate(userId);
  const userStats = await UserStats.findOne({ user: userId });
  const userLevel = userStats?.level || 1;
  const userAchievements = userStats?.achievements || [];

  // Get all items
  const allItems = getAllItems();

  // Add unlock status to each item
  const itemsWithStatus = allItems.map(item => {
    const category = item.category === 'base' ? 'baseCharacters' :
                     item.slot === 'head' || item.slot === 'face' || item.slot === 'badge' ? 'accessories' :
                     item.category === 'background' ? 'backgrounds' :
                     item.category === 'hairStyles' ? 'hairStyles' :
                     item.category === 'expressions' ? 'expressions' : null;

    const isUnlocked = avatar.hasUnlocked(category, item.id);
    const canUnlock = checkUnlockRequirement(item, userLevel, userAchievements);

    return {
      ...item,
      isUnlocked,
      canUnlock,
      requiresLevel: item.unlockLevel,
      requiresAchievement: item.requiredAchievement,
    };
  });

  // Group by category
  const groupedItems = {
    baseCharacters: itemsWithStatus.filter(i => i.category === 'base'),
    headAccessories: itemsWithStatus.filter(i => i.slot === 'head'),
    faceAccessories: itemsWithStatus.filter(i => i.slot === 'face'),
    badges: itemsWithStatus.filter(i => i.slot === 'badge'),
    backgrounds: itemsWithStatus.filter(i => i.category === 'background'),
    hairStyles: itemsWithStatus.filter(i => i.category === 'hairStyles'),
    expressions: itemsWithStatus.filter(i => i.category === 'expressions'),
  };

  res.json({
    success: true,
    data: {
      items: groupedItems,
      userLevel,
      totalItems: allItems.length,
      unlockedCount: allItems.filter(i => {
        const category = i.category === 'base' ? 'baseCharacters' :
                         i.slot === 'head' || i.slot === 'face' || i.slot === 'badge' ? 'accessories' :
                         i.category === 'background' ? 'backgrounds' :
                         i.category === 'hairStyles' ? 'hairStyles' :
                         i.category === 'expressions' ? 'expressions' : null;
        return avatar.hasUnlocked(category, i.id);
      }).length,
    },
    message: 'Items retrieved successfully',
    timestamp: new Date().toISOString(),
  });
}));

/**
 * @route   GET /api/avatar/stats
 * @desc    Get avatar collection statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const avatar = await Avatar.findOne({ userId }) || await Avatar.getOrCreate(userId);
  const allItems = getAllItems();

  const stats = {
    totalItems: allItems.length,
    unlockedItems: {
      baseCharacters: avatar.unlockedItems.baseCharacters.length,
      accessories: avatar.unlockedItems.accessories.length,
      backgrounds: avatar.unlockedItems.backgrounds.length,
      hairStyles: avatar.unlockedItems.hairStyles.length,
      expressions: avatar.unlockedItems.expressions.length,
      total: avatar.unlockedItems.baseCharacters.length +
             avatar.unlockedItems.accessories.length +
             avatar.unlockedItems.backgrounds.length +
             avatar.unlockedItems.hairStyles.length +
             avatar.unlockedItems.expressions.length,
    },
    completionPercentage: Math.round(
      ((avatar.unlockedItems.baseCharacters.length +
        avatar.unlockedItems.accessories.length +
        avatar.unlockedItems.backgrounds.length +
        avatar.unlockedItems.hairStyles.length +
        avatar.unlockedItems.expressions.length) / allItems.length) * 100
    ),
    currentCharacter: avatar.baseCharacter,
    currentMood: avatar.currentMood,
  };

  res.json({
    success: true,
    data: stats,
    message: 'Stats retrieved successfully',
    timestamp: new Date().toISOString(),
  });
}));

module.exports = router;
