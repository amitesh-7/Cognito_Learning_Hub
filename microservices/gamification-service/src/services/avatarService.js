/**
 * Avatar Service
 * Helper functions for avatar-related operations
 */

const Avatar = require('../models/Avatar');
const { Achievement } = require('../models/Achievement');
const logger = require('../config/logger');

/**
 * Auto-unlock avatar items when achievement is earned
 * This should be called from the achievement unlock flow
 */
async function unlockAvatarRewards(userId, achievementId) {
  try {
    // Get achievement with rewards
    const achievement = await Achievement.findById(achievementId);
    
    if (!achievement || !achievement.rewards?.avatarItems?.length) {
      return { unlocked: false, message: 'No avatar rewards for this achievement' };
    }

    // Get or create user's avatar
    const avatar = await Avatar.getOrCreate(userId);
    
    const unlockedItems = [];
    
    // Unlock each avatar item reward
    for (const reward of achievement.rewards.avatarItems) {
      const { itemId, itemType } = reward;
      
      // Determine category
      const category = itemType === 'baseCharacter' ? 'baseCharacters' : 
                       itemType === 'headAccessory' || itemType === 'faceAccessory' || itemType === 'badge' ? 'accessories' :
                       itemType === 'background' ? 'backgrounds' :
                       itemType === 'hairStyle' ? 'hairStyles' :
                       itemType === 'expression' ? 'expressions' : null;
      
      if (!category) {
        logger.warn(`Invalid item type ${itemType} for achievement ${achievement.name}`);
        continue;
      }
      
      // Check if already unlocked
      if (avatar.hasUnlocked(category, itemId)) {
        logger.info(`Item ${itemId} already unlocked for user ${userId}`);
        continue;
      }
      
      // Unlock the item
      await avatar.unlockItem(category, itemId);
      unlockedItems.push({ itemId, itemType, category });
      
      logger.info(`Unlocked ${itemType} '${itemId}' for user ${userId} via achievement '${achievement.name}'`);
    }
    
    return {
      unlocked: true,
      items: unlockedItems,
      message: `Unlocked ${unlockedItems.length} avatar item(s)!`,
    };
    
  } catch (error) {
    logger.error('Error unlocking avatar rewards:', error);
    return { unlocked: false, error: error.message };
  }
}

/**
 * Auto-unlock avatar items based on user level
 * This should be called when user levels up
 */
async function unlockLevelBasedItems(userId, newLevel) {
  try {
    const { getAllItems, checkUnlockRequirement } = require('../config/avatarItems');
    const avatar = await Avatar.getOrCreate(userId);
    
    // Get all items that unlock at this level
    const allItems = getAllItems();
    const levelUnlocks = allItems.filter(item => 
      item.unlockType === 'level' && item.unlockLevel === newLevel
    );
    
    if (levelUnlocks.length === 0) {
      return { unlocked: false, message: 'No items unlock at this level' };
    }
    
    const unlockedItems = [];
    
    for (const item of levelUnlocks) {
      const category = item.category === 'base' ? 'baseCharacters' :
                       item.slot === 'head' || item.slot === 'face' || item.slot === 'badge' ? 'accessories' :
                       item.category === 'background' ? 'backgrounds' :
                       item.category === 'hairStyles' ? 'hairStyles' :
                       item.category === 'expressions' ? 'expressions' : null;
      
      if (!category) continue;
      
      // Check if already unlocked
      if (avatar.hasUnlocked(category, item.id)) {
        continue;
      }
      
      // Unlock the item
      await avatar.unlockItem(category, item.id);
      unlockedItems.push({ itemId: item.id, itemName: item.name, category });
      
      logger.info(`Unlocked ${item.name} for user ${userId} at level ${newLevel}`);
    }
    
    return {
      unlocked: true,
      items: unlockedItems,
      message: `Unlocked ${unlockedItems.length} new item(s) at level ${newLevel}!`,
    };
    
  } catch (error) {
    logger.error('Error unlocking level-based items:', error);
    return { unlocked: false, error: error.message };
  }
}

/**
 * Update avatar mood based on activity
 */
async function updateAvatarMood(userId, mood) {
  try {
    const avatar = await Avatar.findOne({ userId });
    
    if (!avatar) {
      logger.warn(`Avatar not found for user ${userId}`);
      return { updated: false, message: 'Avatar not found' };
    }
    
    await avatar.setMood(mood);
    
    return { updated: true, mood, message: 'Avatar mood updated' };
    
  } catch (error) {
    logger.error('Error updating avatar mood:', error);
    return { updated: false, error: error.message };
  }
}

/**
 * Get user's avatar collection progress
 */
async function getAvatarProgress(userId) {
  try {
    const { getAllItems } = require('../config/avatarItems');
    const avatar = await Avatar.findOne({ userId }) || await Avatar.getOrCreate(userId);
    const allItems = getAllItems();
    
    const totalUnlocked = avatar.unlockedItems.baseCharacters.length +
                          avatar.unlockedItems.accessories.length +
                          avatar.unlockedItems.backgrounds.length +
                          avatar.unlockedItems.hairStyles.length +
                          avatar.unlockedItems.expressions.length;
    
    const progress = {
      totalItems: allItems.length,
      unlockedCount: totalUnlocked,
      percentage: Math.round((totalUnlocked / allItems.length) * 100),
      breakdown: {
        characters: {
          unlocked: avatar.unlockedItems.baseCharacters.length,
          total: allItems.filter(i => i.category === 'base').length,
        },
        accessories: {
          unlocked: avatar.unlockedItems.accessories.length,
          total: allItems.filter(i => i.slot === 'head' || i.slot === 'face' || i.slot === 'badge').length,
        },
        backgrounds: {
          unlocked: avatar.unlockedItems.backgrounds.length,
          total: allItems.filter(i => i.category === 'background').length,
        },
        hairStyles: {
          unlocked: avatar.unlockedItems.hairStyles.length,
          total: allItems.filter(i => i.category === 'hairStyles').length,
        },
        expressions: {
          unlocked: avatar.unlockedItems.expressions.length,
          total: allItems.filter(i => i.category === 'expressions').length,
        },
      },
    };
    
    return progress;
    
  } catch (error) {
    logger.error('Error getting avatar progress:', error);
    throw error;
  }
}

module.exports = {
  unlockAvatarRewards,
  unlockLevelBasedItems,
  updateAvatarMood,
  getAvatarProgress,
};
