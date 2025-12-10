/**
 * Avatar Items Configuration (Frontend)
 * Defines visual properties and metadata for avatar items
 */

// Rarity colors for UI
export const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
    glow: 'shadow-gray-500/20',
    gradient: 'from-gray-400 to-gray-600',
  },
  rare: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-400 dark:border-blue-600',
    text: 'text-blue-700 dark:text-blue-300',
    glow: 'shadow-blue-500/30',
    gradient: 'from-blue-400 to-blue-600',
  },
  epic: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-400 dark:border-purple-600',
    text: 'text-purple-700 dark:text-purple-300',
    glow: 'shadow-purple-500/40',
    gradient: 'from-purple-400 to-purple-600',
  },
  legendary: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-400 dark:border-amber-600',
    text: 'text-amber-700 dark:text-amber-300',
    glow: 'shadow-amber-500/50',
    gradient: 'from-amber-400 to-amber-600',
  },
};

// Character metadata
export const CHARACTERS = {
  robot: {
    id: 'robot',
    name: 'Robot',
    emoji: '🤖',
    description: 'Default tech companion',
  },
  astronaut: {
    id: 'astronaut',
    name: 'Astronaut',
    emoji: '👨‍🚀',
    description: 'Space explorer',
  },
  wizard: {
    id: 'wizard',
    name: 'Wizard',
    emoji: '🧙',
    description: 'Master of knowledge',
  },
  scientist: {
    id: 'scientist',
    name: 'Scientist',
    emoji: '👨‍🔬',
    description: 'Lab genius',
  },
  ninja: {
    id: 'ninja',
    name: 'Ninja',
    emoji: '🥷',
    description: 'Speed master',
  },
  knight: {
    id: 'knight',
    name: 'Knight',
    emoji: '🛡️',
    description: 'Defender of knowledge',
  },
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    emoji: '🧭',
    description: 'Adventure seeker',
  },
  scholar: {
    id: 'scholar',
    name: 'Scholar',
    emoji: '📚',
    description: 'Ultimate learner',
  },
};

// Mood emojis
export const MOODS = {
  happy: '😊',
  excited: '🤩',
  thinking: '🤔',
  celebrating: '🎉',
  determined: '😤',
  neutral: '😐',
  tired: '😴',
  confident: '😎',
};

// Color presets for customization
export const COLOR_PRESETS = {
  primary: [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Green', value: '#10B981' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Indigo', value: '#6366F1' },
  ],
  secondary: [
    { name: 'Light Blue', value: '#60A5FA' },
    { name: 'Light Purple', value: '#A78BFA' },
    { name: 'Light Pink', value: '#F472B6' },
    { name: 'Light Red', value: '#F87171' },
    { name: 'Light Orange', value: '#FBBF24' },
    { name: 'Light Green', value: '#34D399' },
    { name: 'Light Teal', value: '#2DD4BF' },
    { name: 'Light Indigo', value: '#818CF8' },
  ],
  hair: [
    { name: 'Black', value: '#1F2937' },
    { name: 'Brown', value: '#92400E' },
    { name: 'Blonde', value: '#FCD34D' },
    { name: 'Red', value: '#DC2626' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'White', value: '#F3F4F6' },
  ],
  skin: [
    { name: 'Light', value: '#FDE68A' },
    { name: 'Tan', value: '#FCA5A5' },
    { name: 'Medium', value: '#FBBF24' },
    { name: 'Dark', value: '#92400E' },
  ],
};

// Background gradients
export const BACKGROUNDS = {
  'gradient-blue': {
    id: 'gradient-blue',
    name: 'Ocean Gradient',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  'solid-white': {
    id: 'solid-white',
    name: 'Clean White',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
  },
  'gradient-purple': {
    id: 'gradient-purple',
    name: 'Purple Dreams',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  },
  'gradient-sunset': {
    id: 'gradient-sunset',
    name: 'Sunset Vibes',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  'space-stars': {
    id: 'space-stars',
    name: 'Starry Night',
    gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  },
  'neon-city': {
    id: 'neon-city',
    name: 'Neon City',
    gradient: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
  },
  'golden-shine': {
    id: 'golden-shine',
    name: 'Golden Glory',
    gradient: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
  },
};

// Accessory icons/emojis
export const ACCESSORIES = {
  // Head accessories
  'graduation-cap': { emoji: '🎓', name: 'Graduation Cap' },
  'wizard-hat': { emoji: '🎩', name: 'Wizard Hat' },
  'crown': { emoji: '👑', name: 'Golden Crown' },
  'headphones': { emoji: '🎧', name: 'Cool Headphones' },
  'halo': { emoji: '😇', name: 'Angel Halo' },
  
  // Face accessories
  'cool-glasses': { emoji: '😎', name: 'Cool Glasses' },
  'nerd-glasses': { emoji: '🤓', name: 'Nerd Glasses' },
  'party-glasses': { emoji: '🥳', name: 'Party Glasses' },
  'monocle': { emoji: '🧐', name: 'Fancy Monocle' },
  
  // Badges
  'first-quiz-badge': { emoji: '🏅', name: 'Beginner Badge' },
  'perfect-score-badge': { emoji: '💯', name: 'Perfect Score Badge' },
  'streak-badge': { emoji: '🔥', name: 'Streak Flame Badge' },
  'social-badge': { emoji: '🦋', name: 'Social Butterfly Badge' },
  'legendary-badge': { emoji: '⭐', name: 'Legendary Badge' },
};

// Helper function to get rarity styling
export const getRarityStyle = (rarity) => {
  return RARITY_COLORS[rarity] || RARITY_COLORS.common;
};

// Helper function to format unlock requirement text
export const getUnlockRequirementText = (item) => {
  if (item.unlockType === 'default') return 'Available by default';
  if (item.unlockType === 'level') return `Unlock at Level ${item.unlockLevel}`;
  if (item.unlockType === 'achievement') {
    return `Unlock via achievement: ${item.requiredAchievement}`;
  }
  return 'Unknown requirement';
};

// Helper function to check if item can be unlocked
export const canUnlockItem = (item, userLevel, userAchievements) => {
  if (item.isUnlocked) return true;
  if (item.unlockType === 'default') return true;
  if (item.unlockType === 'level') return userLevel >= item.unlockLevel;
  if (item.unlockType === 'achievement') {
    return userAchievements?.includes(item.requiredAchievement);
  }
  return false;
};

export default {
  RARITY_COLORS,
  CHARACTERS,
  MOODS,
  COLOR_PRESETS,
  BACKGROUNDS,
  ACCESSORIES,
  getRarityStyle,
  getUnlockRequirementText,
  canUnlockItem,
};
