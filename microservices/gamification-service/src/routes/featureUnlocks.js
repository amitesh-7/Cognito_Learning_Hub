const express = require("express");
const router = express.Router();
const { UserStats } = require("../models/Achievement");
const { authenticateToken } = require("../../../shared/middleware/auth");

// Feature unlock requirements configuration - matches frontend config
const FEATURE_REQUIREMENTS = {
  // Quiz Creation Features
  studentQuizCreation: {
    type: 'level',
    requirement: 8,
    name: 'Quiz Creation (Students)',
    description: 'Create your own quizzes and share them'
  },
  aiQuizGeneration: {
    type: 'quizzes',
    requirement: 8,
    name: 'AI Quiz Generation',
    description: 'Generate quizzes using AI from any topic'
  },
  pdfQuizGeneration: {
    type: 'level',
    requirement: 6,
    name: 'PDF Quiz Generation',
    description: 'Create quizzes from PDF documents'
  },
  youtubeQuizGeneration: {
    type: 'quizzes',
    requirement: 10,
    name: 'YouTube Quiz Generation',
    description: 'Generate quizzes from YouTube videos'
  },
  
  // Competitive Features
  duelMode: {
    type: 'quizzes',
    requirement: 5,
    name: '1v1 Duel Battles',
    description: 'Challenge friends to real-time quiz battles'
  },
  rankedDuels: {
    type: 'duels',
    requirement: 5,
    name: 'Ranked Duels',
    description: 'Compete in ranked matches for leaderboard position'
  },
  tournaments: {
    type: 'level',
    requirement: 15,
    name: 'Tournament Mode',
    description: 'Participate in multi-round tournaments'
  },
  
  // Social Features
  studyBuddy: {
    type: 'quizzes',
    requirement: 10,
    name: 'Study Buddy',
    description: 'Find study partners and form study groups'
  },
  studyGroups: {
    type: 'level',
    requirement: 5,
    name: 'Create Study Groups',
    description: 'Create and manage your own study groups'
  },
  friendChallenges: {
    type: 'quizzes',
    requirement: 3,
    name: 'Friend Challenges',
    description: 'Send quiz challenges to friends'
  },
  globalChat: {
    type: 'level',
    requirement: 5,
    name: 'Global Chat',
    description: 'Access to global community chat'
  },
  
  // AI Features
  aiTutor: {
    type: 'quizzes',
    requirement: 3,
    name: 'AI Tutor',
    description: '24/7 AI-powered doubt solving assistant'
  },
  advancedAiTutor: {
    type: 'level',
    requirement: 10,
    name: 'Advanced AI Tutor',
    description: 'Access to advanced AI with detailed explanations'
  },
  aiStudyPlan: {
    type: 'streak',
    requirement: 7,
    name: 'AI Study Plan',
    description: 'Get personalized study plans from AI'
  },
  
  // Customization Features
  avatarCustomization: {
    type: 'level',
    requirement: 3,
    name: 'Avatar Customization',
    description: 'Customize your avatar appearance'
  },
  premiumAvatars: {
    type: 'level',
    requirement: 20,
    name: 'Premium Avatars',
    description: 'Unlock premium avatar skins and accessories'
  },
  profileBadges: {
    type: 'achievement',
    requirement: 5,
    name: 'Profile Badges',
    description: 'Display achievement badges on your profile'
  },
  customThemes: {
    type: 'level',
    requirement: 12,
    name: 'Custom Themes',
    description: 'Apply custom color themes to your dashboard'
  },
  
  // Live Session Features
  joinLiveSessions: {
    type: 'quizzes',
    requirement: 1,
    name: 'Join Live Sessions',
    description: 'Participate in live quiz sessions'
  },
  hostLiveSessions: {
    type: 'level',
    requirement: 7,
    name: 'Host Live Sessions',
    description: 'Host your own live quiz sessions'
  },
  
  // Analytics Features
  basicAnalytics: {
    type: 'quizzes',
    requirement: 5,
    name: 'Basic Analytics',
    description: 'View your quiz performance statistics'
  },
  advancedAnalytics: {
    type: 'level',
    requirement: 10,
    name: 'Advanced Analytics',
    description: 'Detailed performance insights and trends'
  },
  exportData: {
    type: 'quizzes',
    requirement: 12,
    name: 'Export Data',
    description: 'Export your quiz results and analytics'
  },
  
  // Leaderboard Features
  globalLeaderboard: {
    type: 'level',
    requirement: 5,
    name: 'Global Leaderboard',
    description: 'Access to global rankings'
  },
  
  // Quest System
  questSystem: {
    type: 'level',
    requirement: 4,
    name: 'Quest Realms',
    description: 'Embark on narrative-driven learning quests'
  }
};

/**
 * GET /api/feature-unlocks/check
 * Check which features are unlocked for the current user
 */
router.get("/check", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User ID not found in token"
      });
    }

    // Get user stats
    let userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      // Create default stats if not found
      userStats = new UserStats({
        userId,
        xp: 0,
        level: 1,
        totalQuizzesTaken: 0,
        currentStreak: 0,
        duelsPlayed: 0,
        duelsWon: 0,
        unlockedFeatures: []
      });
      await userStats.save();
    }

    const unlockedFeatures = [];
    const lockedFeatures = [];
    const newlyUnlocked = [];

    // Check each feature
    for (const [featureId, config] of Object.entries(FEATURE_REQUIREMENTS)) {
      const isUnlocked = checkFeatureUnlocked(userStats, config);
      const alreadyRecorded = userStats.unlockedFeatures?.some(f => f.featureId === featureId);
      
      const featureInfo = {
        id: featureId,
        ...config,
        isUnlocked,
        progress: getProgress(userStats, config)
      };

      if (isUnlocked) {
        unlockedFeatures.push(featureInfo);
        
        // Record newly unlocked features
        if (!alreadyRecorded) {
          newlyUnlocked.push({
            featureId,
            unlockedAt: new Date(),
            unlockedByAction: config.type
          });
        }
      } else {
        lockedFeatures.push(featureInfo);
      }
    }

    // Update database with newly unlocked features
    if (newlyUnlocked.length > 0) {
      await UserStats.updateOne(
        { userId },
        { 
          $push: { unlockedFeatures: { $each: newlyUnlocked } },
          $set: { lastUnlockCheck: new Date() }
        }
      );
    }

    res.json({
      success: true,
      userId,
      stats: {
        level: userStats.level,
        xp: userStats.xp,
        totalQuizzesTaken: userStats.totalQuizzesTaken,
        currentStreak: userStats.currentStreak,
        duelsPlayed: userStats.duelsPlayed || 0,
        duelsWon: userStats.duelsWon || 0
      },
      unlockedFeatures,
      lockedFeatures,
      newlyUnlocked: newlyUnlocked.map(f => f.featureId),
      totalUnlocked: unlockedFeatures.length,
      totalFeatures: Object.keys(FEATURE_REQUIREMENTS).length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feature-unlocks/:featureId
 * Check if a specific feature is unlocked
 */
router.get("/:featureId", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { featureId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User ID not found in token"
      });
    }

    const config = FEATURE_REQUIREMENTS[featureId];
    if (!config) {
      return res.status(404).json({
        success: false,
        error: "Feature not found"
      });
    }

    let userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      userStats = {
        level: 1,
        xp: 0,
        totalQuizzesTaken: 0,
        currentStreak: 0,
        duelsPlayed: 0,
        duelsWon: 0
      };
    }

    const isUnlocked = checkFeatureUnlocked(userStats, config);
    const progress = getProgress(userStats, config);

    res.json({
      success: true,
      featureId,
      feature: {
        ...config,
        isUnlocked,
        progress
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feature-unlocks/requirements/all
 * Get all feature requirements (public info)
 */
router.get("/requirements/all", async (req, res) => {
  res.json({
    success: true,
    features: FEATURE_REQUIREMENTS
  });
});

// Helper function to check if feature is unlocked
function checkFeatureUnlocked(stats, config) {
  switch (config.type) {
    case 'level':
      return stats.level >= config.requirement;
    case 'quizzes':
      return stats.totalQuizzesTaken >= config.requirement;
    case 'streak':
      return stats.currentStreak >= config.requirement || stats.bestStreak >= config.requirement;
    case 'duels':
      return (stats.duelsPlayed || 0) >= config.requirement;
    case 'xp':
      return stats.xp >= config.requirement;
    default:
      return false;
  }
}

// Helper function to calculate progress
function getProgress(stats, config) {
  let current = 0;
  switch (config.type) {
    case 'level':
      current = stats.level;
      break;
    case 'quizzes':
      current = stats.totalQuizzesTaken;
      break;
    case 'streak':
      current = Math.max(stats.currentStreak || 0, stats.bestStreak || 0);
      break;
    case 'duels':
      current = stats.duelsPlayed || 0;
      break;
    case 'xp':
      current = stats.xp;
      break;
  }
  
  return {
    current,
    required: config.requirement,
    percentage: Math.min(100, Math.round((current / config.requirement) * 100))
  };
}

module.exports = router;
