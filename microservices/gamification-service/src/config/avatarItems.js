/**
 * Avatar Unlockables Configuration
 * Defines all items that can be unlocked and their requirements
 */

const AVATAR_ITEMS = {
  // Base Characters - Unlock by level
  baseCharacters: {
    robot: {
      id: 'robot',
      name: 'Robot',
      description: 'Default character',
      unlockLevel: 1,
      unlockType: 'default',
      category: 'base',
    },
    astronaut: {
      id: 'astronaut',
      name: 'Astronaut',
      description: 'Space explorer',
      unlockLevel: 10,
      unlockType: 'level',
      category: 'base',
    },
    wizard: {
      id: 'wizard',
      name: 'Wizard',
      description: 'Master of knowledge',
      unlockLevel: 20,
      unlockType: 'level',
      category: 'base',
    },
    scientist: {
      id: 'scientist',
      name: 'Scientist',
      description: 'Lab genius',
      unlockLevel: 30,
      unlockType: 'level',
      category: 'base',
    },
    ninja: {
      id: 'ninja',
      name: 'Ninja',
      description: 'Speed master',
      unlockLevel: 40,
      unlockType: 'achievement',
      requiredAchievement: 'speed-demon',
      category: 'base',
    },
    knight: {
      id: 'knight',
      name: 'Knight',
      description: 'Defender of knowledge',
      unlockLevel: 50,
      unlockType: 'level',
      category: 'base',
    },
    explorer: {
      id: 'explorer',
      name: 'Explorer',
      description: 'Adventure seeker',
      unlockLevel: 60,
      unlockType: 'level',
      category: 'base',
    },
    scholar: {
      id: 'scholar',
      name: 'Scholar',
      description: 'Ultimate learner',
      unlockLevel: 70,
      unlockType: 'level',
      category: 'base',
    },
  },

  // Accessories - Head slot
  headAccessories: {
    'graduation-cap': {
      id: 'graduation-cap',
      name: 'Graduation Cap',
      description: 'Complete 50 quizzes',
      unlockType: 'achievement',
      requiredAchievement: 'quiz-master-50',
      slot: 'head',
      rarity: 'common',
    },
    'wizard-hat': {
      id: 'wizard-hat',
      name: 'Wizard Hat',
      description: 'Get 10 perfect scores',
      unlockType: 'achievement',
      requiredAchievement: 'perfectionist',
      slot: 'head',
      rarity: 'rare',
    },
    'crown': {
      id: 'crown',
      name: 'Golden Crown',
      description: 'Reach #1 on leaderboard',
      unlockType: 'achievement',
      requiredAchievement: 'top-rank',
      slot: 'head',
      rarity: 'legendary',
    },
    'headphones': {
      id: 'headphones',
      name: 'Cool Headphones',
      description: 'Join 25 live sessions',
      unlockType: 'achievement',
      requiredAchievement: 'live-participant',
      slot: 'head',
      rarity: 'common',
    },
    'halo': {
      id: 'halo',
      name: 'Angel Halo',
      description: 'Maintain 100 day streak',
      unlockType: 'achievement',
      requiredAchievement: 'streak-100',
      slot: 'head',
      rarity: 'epic',
    },
  },

  // Accessories - Face slot
  faceAccessories: {
    'cool-glasses': {
      id: 'cool-glasses',
      name: 'Cool Glasses',
      description: 'Reach level 5',
      unlockType: 'level',
      unlockLevel: 5,
      slot: 'face',
      rarity: 'common',
    },
    'nerd-glasses': {
      id: 'nerd-glasses',
      name: 'Nerd Glasses',
      description: 'Complete 100 quizzes',
      unlockType: 'achievement',
      requiredAchievement: 'quiz-master-100',
      slot: 'face',
      rarity: 'rare',
    },
    'party-glasses': {
      id: 'party-glasses',
      name: 'Party Glasses',
      description: 'Win 50 duels',
      unlockType: 'achievement',
      requiredAchievement: 'duel-champion',
      slot: 'face',
      rarity: 'epic',
    },
    'monocle': {
      id: 'monocle',
      name: 'Fancy Monocle',
      description: 'Reach level 50',
      unlockType: 'level',
      unlockLevel: 50,
      slot: 'face',
      rarity: 'rare',
    },
  },

  // Badges - Body slot
  badges: {
    'first-quiz-badge': {
      id: 'first-quiz-badge',
      name: 'Beginner Badge',
      description: 'Complete first quiz',
      unlockType: 'achievement',
      requiredAchievement: 'first-quiz',
      slot: 'badge',
      rarity: 'common',
    },
    'perfect-score-badge': {
      id: 'perfect-score-badge',
      name: 'Perfect Score Badge',
      description: 'Get first perfect score',
      unlockType: 'achievement',
      requiredAchievement: 'flawless-victory',
      slot: 'badge',
      rarity: 'rare',
    },
    'streak-badge': {
      id: 'streak-badge',
      name: 'Streak Flame Badge',
      description: '7 day streak',
      unlockType: 'achievement',
      requiredAchievement: 'week-warrior',
      slot: 'badge',
      rarity: 'rare',
    },
    'social-badge': {
      id: 'social-badge',
      name: 'Social Butterfly Badge',
      description: 'Add 10 friends',
      unlockType: 'achievement',
      requiredAchievement: 'social-butterfly',
      slot: 'badge',
      rarity: 'common',
    },
    'legendary-badge': {
      id: 'legendary-badge',
      name: 'Legendary Badge',
      description: 'Reach level 100',
      unlockType: 'level',
      unlockLevel: 100,
      slot: 'badge',
      rarity: 'legendary',
    },
  },

  // Backgrounds
  backgrounds: {
    'gradient-blue': {
      id: 'gradient-blue',
      name: 'Ocean Gradient',
      description: 'Default background',
      unlockType: 'default',
      category: 'background',
      rarity: 'common',
    },
    'solid-white': {
      id: 'solid-white',
      name: 'Clean White',
      description: 'Default background',
      unlockType: 'default',
      category: 'background',
      rarity: 'common',
    },
    'gradient-purple': {
      id: 'gradient-purple',
      name: 'Purple Dreams',
      description: 'Reach level 15',
      unlockType: 'level',
      unlockLevel: 15,
      category: 'background',
      rarity: 'common',
    },
    'gradient-sunset': {
      id: 'gradient-sunset',
      name: 'Sunset Vibes',
      description: 'Reach level 25',
      unlockType: 'level',
      unlockLevel: 25,
      category: 'background',
      rarity: 'rare',
    },
    'space-stars': {
      id: 'space-stars',
      name: 'Starry Night',
      description: 'Complete 200 quizzes',
      unlockType: 'achievement',
      requiredAchievement: 'quiz-veteran',
      category: 'background',
      rarity: 'epic',
    },
    'neon-city': {
      id: 'neon-city',
      name: 'Neon City',
      description: 'Win 100 duels',
      unlockType: 'achievement',
      requiredAchievement: 'duel-master',
      category: 'background',
      rarity: 'epic',
    },
    'golden-shine': {
      id: 'golden-shine',
      name: 'Golden Glory',
      description: 'Get top 3 on global leaderboard',
      unlockType: 'achievement',
      requiredAchievement: 'top-3-global',
      category: 'background',
      rarity: 'legendary',
    },
  },

  // Hair Styles
  hairStyles: {
    short: {
      id: 'short',
      name: 'Short Hair',
      unlockType: 'default',
    },
    medium: {
      id: 'medium',
      name: 'Medium Hair',
      unlockType: 'default',
    },
    long: {
      id: 'long',
      name: 'Long Hair',
      unlockLevel: 10,
      unlockType: 'level',
    },
    spiky: {
      id: 'spiky',
      name: 'Spiky Hair',
      unlockLevel: 20,
      unlockType: 'level',
    },
    curly: {
      id: 'curly',
      name: 'Curly Hair',
      unlockLevel: 30,
      unlockType: 'level',
    },
    bald: {
      id: 'bald',
      name: 'Bald',
      unlockLevel: 5,
      unlockType: 'level',
    },
  },

  // Expressions
  expressions: {
    smile: {
      id: 'smile',
      name: 'Smile',
      unlockType: 'default',
    },
    neutral: {
      id: 'neutral',
      name: 'Neutral',
      unlockType: 'default',
    },
    happy: {
      id: 'happy',
      name: 'Happy',
      unlockLevel: 5,
      unlockType: 'level',
    },
    excited: {
      id: 'excited',
      name: 'Excited',
      unlockLevel: 15,
      unlockType: 'level',
    },
    thinking: {
      id: 'thinking',
      name: 'Thinking',
      unlockLevel: 25,
      unlockType: 'level',
    },
    cool: {
      id: 'cool',
      name: 'Cool',
      unlockLevel: 35,
      unlockType: 'level',
    },
  },
};

// Rarity colors for UI
const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
    glow: 'shadow-gray-500/20',
  },
  rare: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-400 dark:border-blue-600',
    text: 'text-blue-700 dark:text-blue-300',
    glow: 'shadow-blue-500/30',
  },
  epic: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-400 dark:border-purple-600',
    text: 'text-purple-700 dark:text-purple-300',
    glow: 'shadow-purple-500/40',
  },
  legendary: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-400 dark:border-amber-600',
    text: 'text-amber-700 dark:text-amber-300',
    glow: 'shadow-amber-500/50',
  },
};

// Helper functions
const getAllItems = () => {
  const allItems = [];
  
  Object.entries(AVATAR_ITEMS).forEach(([category, items]) => {
    Object.values(items).forEach(item => {
      allItems.push({
        ...item,
        category: item.category || category,
      });
    });
  });
  
  return allItems;
};

const getItemById = (itemId) => {
  const allItems = getAllItems();
  return allItems.find(item => item.id === itemId);
};

const getItemsByUnlockType = (unlockType) => {
  const allItems = getAllItems();
  return allItems.filter(item => item.unlockType === unlockType);
};

const getItemsByCategory = (category) => {
  return Object.values(AVATAR_ITEMS[category] || {});
};

const checkUnlockRequirement = (item, userLevel, userAchievements) => {
  if (item.unlockType === 'default') return true;
  
  if (item.unlockType === 'level') {
    return userLevel >= item.unlockLevel;
  }
  
  if (item.unlockType === 'achievement') {
    return userAchievements.includes(item.requiredAchievement);
  }
  
  return false;
};

module.exports = {
  AVATAR_ITEMS,
  RARITY_COLORS,
  getAllItems,
  getItemById,
  getItemsByUnlockType,
  getItemsByCategory,
  checkUnlockRequirement,
};
