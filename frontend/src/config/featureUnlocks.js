/**
 * Feature Unlock Configuration
 * Defines criteria for unlocking features based on gamification progress
 * 
 * Unlock Types:
 * - level: Requires reaching a specific XP level
 * - quizzes: Requires completing X quizzes
 * - achievement: Requires unlocking a specific achievement
 * - streak: Requires maintaining X day streak
 * - duels: Requires winning X duels
 * - score: Requires achieving X average score
 * - xp: Requires earning X total XP
 */

export const FEATURE_UNLOCKS = {
  // === QUIZ CREATION FEATURES ===
  studentQuizCreation: {
    id: 'student-quiz-creation',
    name: 'Quiz Creation (Students)',
    description: 'Create your own quizzes and share them',
    icon: '✏️',
    criteria: {
      type: 'level',
      value: 8,
    },
    category: 'creation',
    tier: 'silver',
    reward: {
      xpBonus: 200,
      badge: 'creator-unlocked',
    }
  },

  aiQuizGeneration: {
    id: 'ai-quiz-generation',
    name: 'AI Quiz Generation',
    description: 'Generate quizzes using AI from any topic',
    icon: '🤖',
    criteria: {
      type: 'quizzes',
      value: 8,
    },
    category: 'creation',
    tier: 'silver',
    reward: {
      xpBonus: 300,
      badge: 'ai-master',
    }
  },

  pdfQuizGeneration: {
    id: 'pdf-quiz-generation',
    name: 'PDF Quiz Generation',
    description: 'Generate quizzes from PDF documents',
    icon: '📄',
    criteria: {
      type: 'level',
      value: 6,
    },
    category: 'creation',
    tier: 'silver',
  },

  youtubeQuizGeneration: {
    id: 'youtube-quiz-generation',
    name: 'YouTube Quiz Generation',
    description: 'Generate quizzes from YouTube videos',
    icon: '🎬',
    criteria: {
      type: 'quizzes',
      value: 10,
    },
    category: 'creation',
    tier: 'silver',
  },

  // === COMPETITIVE FEATURES ===
  duelMode: {
    id: 'duel-mode',
    name: '1v1 Duel Battles',
    description: 'Challenge friends to real-time quiz battles',
    icon: '⚔️',
    criteria: {
      type: 'quizzes',
      value: 5,
    },
    category: 'competitive',
    tier: 'bronze',
    reward: {
      xpBonus: 100,
    }
  },

  rankedDuels: {
    id: 'ranked-duels',
    name: 'Ranked Duels',
    description: 'Compete in ranked matches for leaderboard position',
    icon: '🏆',
    criteria: {
      type: 'duels',
      value: 5,
    },
    category: 'competitive',
    tier: 'silver',
    reward: {
      xpBonus: 150,
      badge: 'ranked-warrior',
    }
  },

  tournaments: {
    id: 'tournaments',
    name: 'Tournament Mode',
    description: 'Participate in multi-round tournaments',
    icon: '🎖️',
    criteria: {
      type: 'level',
      value: 15,
    },
    category: 'competitive',
    tier: 'gold',
    reward: {
      xpBonus: 500,
      badge: 'tournament-access',
    }
  },

  // === SOCIAL FEATURES ===
  studyBuddy: {
    id: 'study-buddy',
    name: 'Study Buddy',
    description: 'Find study partners and form study groups',
    icon: '👥',
    criteria: {
      type: 'quizzes',
      value: 10,
    },
    category: 'social',
    tier: 'silver',
    reward: {
      xpBonus: 200,
      badge: 'social-learner',
    }
  },

  studyGroups: {
    id: 'study-groups',
    name: 'Create Study Groups',
    description: 'Create and manage your own study groups',
    icon: '📚',
    criteria: {
      type: 'level',
      value: 5,
    },
    category: 'social',
    tier: 'bronze',
  },

  friendChallenges: {
    id: 'friend-challenges',
    name: 'Friend Challenges',
    description: 'Send quiz challenges to friends',
    icon: '🎯',
    criteria: {
      type: 'quizzes',
      value: 3,
    },
    category: 'social',
    tier: 'bronze',
  },

  globalChat: {
    id: 'global-chat',
    name: 'Global Chat',
    description: 'Access to global community chat',
    icon: '💬',
    criteria: {
      type: 'level',
      value: 5,
    },
    category: 'social',
    tier: 'bronze',
  },

  // === AI FEATURES ===
  aiTutor: {
    id: 'ai-tutor',
    name: 'AI Tutor',
    description: '24/7 AI-powered doubt solving assistant',
    icon: '🧠',
    criteria: {
      type: 'quizzes',
      value: 3,
    },
    category: 'ai',
    tier: 'bronze',
    reward: {
      xpBonus: 50,
    }
  },

  advancedAiTutor: {
    id: 'advanced-ai-tutor',
    name: 'Advanced AI Tutor',
    description: 'Access to advanced AI with detailed explanations',
    icon: '🎓',
    criteria: {
      type: 'level',
      value: 10,
    },
    category: 'ai',
    tier: 'silver',
    reward: {
      xpBonus: 200,
    }
  },

  aiStudyPlan: {
    id: 'ai-study-plan',
    name: 'AI Study Plan',
    description: 'Get personalized study plans from AI',
    icon: '📅',
    criteria: {
      type: 'streak',
      value: 7,
    },
    category: 'ai',
    tier: 'silver',
    reward: {
      xpBonus: 250,
    }
  },

  // === CUSTOMIZATION FEATURES ===
  avatarCustomization: {
    id: 'avatar-customization',
    name: 'Avatar Customization',
    description: 'Customize your avatar appearance',
    icon: '🎨',
    criteria: {
      type: 'level',
      value: 3,
    },
    category: 'customization',
    tier: 'bronze',
  },

  premiumAvatars: {
    id: 'premium-avatars',
    name: 'Premium Avatars',
    description: 'Unlock premium avatar skins and accessories',
    icon: '👑',
    criteria: {
      type: 'level',
      value: 20,
    },
    category: 'customization',
    tier: 'gold',
    reward: {
      xpBonus: 300,
      badge: 'fashion-icon',
    }
  },

  profileBadges: {
    id: 'profile-badges',
    name: 'Profile Badges',
    description: 'Display achievement badges on your profile',
    icon: '🏅',
    criteria: {
      type: 'achievement',
      value: 5, // Number of achievements
    },
    category: 'customization',
    tier: 'silver',
  },

  customThemes: {
    id: 'custom-themes',
    name: 'Custom Themes',
    description: 'Apply custom color themes to your dashboard',
    icon: '🎭',
    criteria: {
      type: 'level',
      value: 12,
    },
    category: 'customization',
    tier: 'silver',
  },

  // === LIVE SESSION FEATURES ===
  joinLiveSessions: {
    id: 'join-live-sessions',
    name: 'Join Live Sessions',
    description: 'Participate in live quiz sessions',
    icon: '📡',
    criteria: {
      type: 'quizzes',
      value: 1,
    },
    category: 'live',
    tier: 'bronze',
  },

  hostLiveSessions: {
    id: 'host-live-sessions',
    name: 'Host Live Sessions',
    description: 'Host your own live quiz sessions',
    icon: '🎙️',
    criteria: {
      type: 'level',
      value: 7,
    },
    category: 'live',
    tier: 'silver',
    reward: {
      xpBonus: 200,
      badge: 'session-host',
    }
  },

  // === ANALYTICS FEATURES ===
  basicAnalytics: {
    id: 'basic-analytics',
    name: 'Basic Analytics',
    description: 'View your quiz performance statistics',
    icon: '📊',
    criteria: {
      type: 'quizzes',
      value: 5,
    },
    category: 'analytics',
    tier: 'bronze',
  },

  advancedAnalytics: {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Detailed performance insights and trends',
    icon: '📈',
    criteria: {
      type: 'level',
      value: 10,
    },
    category: 'analytics',
    tier: 'silver',
  },

  exportData: {
    id: 'export-data',
    name: 'Export Data',
    description: 'Export your quiz results and analytics',
    icon: '💾',
    criteria: {
      type: 'quizzes',
      value: 12,
    },
    category: 'analytics',
    tier: 'silver',
  },

  // === LEADERBOARD FEATURES ===
  globalLeaderboard: {
    id: 'global-leaderboard',
    name: 'Global Leaderboard',
    description: 'Access to global rankings',
    icon: '🌍',
    criteria: {
      type: 'level',
      value: 5,
    },
    category: 'leaderboard',
    tier: 'bronze',
  },

  weeklyLeaderboard: {
    id: 'weekly-leaderboard',
    name: 'Weekly Competitions',
    description: 'Participate in weekly leaderboard resets',
    icon: '📆',
    criteria: {
      type: 'streak',
      value: 3,
    },
    category: 'leaderboard',
    tier: 'bronze',
  },

  // === VIDEO MEETING FEATURES ===
  videoMeetings: {
    id: 'video-meetings',
    name: 'Video Meetings',
    description: 'Join video study sessions',
    icon: '📹',
    criteria: {
      type: 'level',
      value: 4,
    },
    category: 'meetings',
    tier: 'bronze',
  },

  hostMeetings: {
    id: 'host-meetings',
    name: 'Host Meetings',
    description: 'Host your own video study sessions',
    icon: '🎥',
    criteria: {
      type: 'level',
      value: 9,
    },
    category: 'meetings',
    tier: 'silver',
    reward: {
      xpBonus: 200,
    }
  },

  screenSharing: {
    id: 'screen-sharing',
    name: 'Screen Sharing',
    description: 'Share your screen during meetings',
    icon: '🖥️',
    criteria: {
      type: 'quizzes',
      value: 8,
    },
    category: 'meetings',
    tier: 'silver',
  },
};

// Tier configuration
export const TIERS = {
  bronze: {
    name: 'Bronze',
    color: 'from-amber-600 to-amber-800',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-400',
    icon: '🥉',
    minLevel: 1,
  },
  silver: {
    name: 'Silver',
    color: 'from-slate-400 to-slate-600',
    bgColor: 'bg-slate-100 dark:bg-slate-800/50',
    textColor: 'text-slate-600 dark:text-slate-300',
    icon: '🥈',
    minLevel: 5,
  },
  gold: {
    name: 'Gold',
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    icon: '🥇',
    minLevel: 15,
  },
  platinum: {
    name: 'Platinum',
    color: 'from-cyan-400 to-blue-600',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    textColor: 'text-cyan-700 dark:text-cyan-400',
    icon: '💎',
    minLevel: 25,
  },
  diamond: {
    name: 'Diamond',
    color: 'from-violet-400 to-purple-600',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    textColor: 'text-violet-700 dark:text-violet-400',
    icon: '💠',
    minLevel: 40,
  },
};

// Category configuration
export const CATEGORIES = {
  creation: {
    name: 'Quiz Creation',
    icon: '✏️',
    description: 'Create and generate quizzes',
  },
  competitive: {
    name: 'Competitive',
    icon: '⚔️',
    description: 'Battle and compete with others',
  },
  social: {
    name: 'Social',
    icon: '👥',
    description: 'Connect and collaborate',
  },
  ai: {
    name: 'AI Features',
    icon: '🤖',
    description: 'AI-powered learning tools',
  },
  customization: {
    name: 'Customization',
    icon: '🎨',
    description: 'Personalize your experience',
  },
  live: {
    name: 'Live Sessions',
    icon: '📡',
    description: 'Real-time quiz sessions',
  },
  analytics: {
    name: 'Analytics',
    icon: '📊',
    description: 'Track your progress',
  },
  leaderboard: {
    name: 'Leaderboards',
    icon: '🏆',
    description: 'Rankings and competitions',
  },
  meetings: {
    name: 'Video Meetings',
    icon: '📹',
    description: 'Video study sessions',
  },
};

// Level milestones with rewards - as array for easier iteration
export const LEVEL_MILESTONES = [
  { level: 3, title: 'Newcomer', reward: { xpBonus: 50, badge: 'level-3-badge' }, unlocks: ['avatarCustomization'] },
  { level: 5, title: 'Beginner Graduate', reward: { xpBonus: 100, badge: 'level-5-badge' }, unlocks: ['globalLeaderboard', 'globalChat', 'studyGroups'] },
  { level: 8, title: 'Dedicated Learner', reward: { xpBonus: 200, badge: 'level-8-badge', avatarItem: 'cool-glasses' }, unlocks: ['studentQuizCreation'] },
  { level: 10, title: 'Knowledge Seeker', reward: { xpBonus: 300, badge: 'level-10-badge' }, unlocks: ['advancedAiTutor', 'advancedAnalytics'] },
  { level: 15, title: 'Quiz Master', reward: { xpBonus: 500, badge: 'level-15-badge', avatarItem: 'wizard-hat' }, unlocks: ['tournaments'] },
  { level: 20, title: 'Scholar', reward: { xpBonus: 750, badge: 'level-20-badge' }, unlocks: ['premiumAvatars'] },
  { level: 30, title: 'Grand Master', reward: { xpBonus: 1500, badge: 'level-30-badge', avatarItem: 'legendary-skin' }, unlocks: [] },
  { level: 50, title: 'Legend', reward: { xpBonus: 5000, badge: 'legendary-badge', avatarItem: 'legendary-aura' }, unlocks: [] },
];

// Quiz milestones - as array for easier iteration
export const QUIZ_MILESTONES = [
  { quizzes: 1, title: 'First Quiz', reward: { xpBonus: 25 }, unlocks: ['joinLiveSessions'] },
  { quizzes: 3, title: 'Getting Started', reward: { xpBonus: 50 }, unlocks: ['aiTutor', 'friendChallenges'] },
  { quizzes: 5, title: 'Quiz Explorer', reward: { xpBonus: 100 }, unlocks: ['duelMode', 'basicAnalytics'] },
  { quizzes: 10, title: 'Quiz Enthusiast', reward: { xpBonus: 200 }, unlocks: ['studyBuddy', 'youtubeQuizGeneration'] },
  { quizzes: 25, title: 'Quiz Master', reward: { xpBonus: 500 }, unlocks: [] },
  { quizzes: 50, title: 'Quiz Expert', reward: { xpBonus: 1000 }, unlocks: [] },
  { quizzes: 100, title: 'Quiz Legend', reward: { xpBonus: 2500 }, unlocks: [] },
];

// Streak milestones - as array for easier iteration
export const STREAK_MILESTONES = [
  { days: 3, title: 'Dedicated', reward: { xpBonus: 50 }, unlocks: ['weeklyLeaderboard'] },
  { days: 7, title: 'Committed', reward: { xpBonus: 150 }, unlocks: ['aiStudyPlan'] },
  { days: 14, title: 'Devoted', reward: { xpBonus: 300 }, unlocks: [] },
  { days: 30, title: 'Legendary', reward: { xpBonus: 750 }, unlocks: [] },
  { days: 100, title: 'Immortal', reward: { xpBonus: 2500 }, unlocks: [] },
];

/**
 * Check if a feature is unlocked based on user stats
 * @param {string} featureId - The feature ID to check
 * @param {object} userStats - User's current stats
 * @returns {object} - { unlocked: boolean, progress: number, remaining: string }
 */
export function checkFeatureUnlock(featureId, userStats) {
  const feature = FEATURE_UNLOCKS[featureId];
  if (!feature) return { unlocked: true, progress: 100, remaining: null };

  const { type, value } = feature.criteria;
  let currentValue = 0;
  let remaining = '';

  switch (type) {
    case 'level':
      currentValue = userStats?.level || 1;
      remaining = `Reach level ${value}`;
      break;
    case 'quizzes':
      currentValue = userStats?.quizzesCompleted || userStats?.totalQuizzesTaken || 0;
      remaining = `Complete ${Math.max(0, value - currentValue)} more quizzes`;
      break;
    case 'streak':
      currentValue = userStats?.currentStreak || 0;
      remaining = `Maintain ${value}-day streak`;
      break;
    case 'duels':
      currentValue = userStats?.duelsWon || 0;
      remaining = `Win ${Math.max(0, value - currentValue)} more duels`;
      break;
    case 'xp':
      currentValue = userStats?.experience || userStats?.totalXP || 0;
      remaining = `Earn ${Math.max(0, value - currentValue)} more XP`;
      break;
    case 'achievement':
      currentValue = userStats?.achievementCount || userStats?.unlockedAchievements?.length || 0;
      remaining = `Unlock ${Math.max(0, value - currentValue)} more achievements`;
      break;
    case 'score':
      currentValue = userStats?.averageScore || 0;
      remaining = `Achieve ${value}% average score`;
      break;
    default:
      return { unlocked: true, progress: 100, remaining: null };
  }

  const unlocked = currentValue >= value;
  const progress = Math.min((currentValue / value) * 100, 100);

  return {
    unlocked,
    progress,
    remaining: unlocked ? null : remaining,
    currentValue,
    targetValue: value,
  };
}

/**
 * Get all unlocked features for a user
 * @param {object} userStats - User's current stats
 * @returns {string[]} - Array of unlocked feature IDs
 */
export function getUnlockedFeatures(userStats) {
  return Object.keys(FEATURE_UNLOCKS).filter(featureId => {
    const { unlocked } = checkFeatureUnlock(featureId, userStats);
    return unlocked;
  });
}

/**
 * Get upcoming features (close to unlock)
 * @param {object} userStats - User's current stats
 * @param {number} limit - Max features to return
 * @returns {object[]} - Array of feature objects with progress
 */
export function getUpcomingFeatures(userStats, limit = 5) {
  const features = Object.entries(FEATURE_UNLOCKS)
    .map(([id, feature]) => {
      const status = checkFeatureUnlock(id, userStats);
      return { id, ...feature, ...status };
    })
    .filter(f => !f.unlocked && f.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit);

  return features;
}

/**
 * Get features by category
 * @param {string} category - Category name
 * @param {object} userStats - User's current stats (optional)
 * @returns {object[]} - Array of features in category
 */
export function getFeaturesByCategory(category, userStats = null) {
  return Object.entries(FEATURE_UNLOCKS)
    .filter(([_, feature]) => feature.category === category)
    .map(([id, feature]) => {
      const status = userStats ? checkFeatureUnlock(id, userStats) : { unlocked: false, progress: 0 };
      return { id, ...feature, ...status };
    });
}

export default FEATURE_UNLOCKS;
