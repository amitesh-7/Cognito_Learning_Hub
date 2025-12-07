const express = require("express");
const router = express.Router();
const Avatar = require("../models/Avatar");
const { verifyToken } = require("../middleware/auth");
const { AvatarEvolutionService } = require("../services/evolutionService");

const evolutionService = new AvatarEvolutionService();

/**
 * @route   GET /api/evolution/status
 * @desc    Get avatar's evolution status and progress
 * @access  Private
 */
router.get("/status", verifyToken, async (req, res) => {
  try {
    let avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      avatar = await Avatar.createDefaultAvatar(req.user.id);
    }
    
    const evolution = avatar.evolution;
    const nextStageInfo = evolutionService.getNextStageInfo(evolution.evolutionStage, evolution.currentLevel);
    
    res.json({
      success: true,
      evolution: {
        currentLevel: evolution.currentLevel,
        evolutionStage: evolution.evolutionStage,
        experiencePoints: evolution.experiencePoints,
        experienceToNextLevel: evolution.experienceToNextLevel,
        progressToNextLevel: Math.round((evolution.experiencePoints / evolution.experienceToNextLevel) * 100),
        unlockedItems: evolution.unlockedItems,
        milestones: evolution.milestones,
        stats: {
          totalQuestionsAnswered: evolution.totalQuestionsAnswered,
          totalCorrectAnswers: evolution.totalCorrectAnswers,
          totalQuizzesTaken: evolution.totalQuizzesTaken,
          totalPerfectScores: evolution.totalPerfectScores,
          longestStreak: evolution.longestStreak,
          totalStudyTime: evolution.totalStudyTime,
          accuracy: evolution.totalQuestionsAnswered > 0 
            ? Math.round((evolution.totalCorrectAnswers / evolution.totalQuestionsAnswered) * 100) 
            : 0,
        },
      },
      nextStage: nextStageInfo,
    });
  } catch (error) {
    console.error("Error fetching evolution status:", error);
    res.status(500).json({ success: false, error: "Failed to fetch evolution status" });
  }
});

/**
 * @route   POST /api/evolution/add-experience
 * @desc    Add experience points to avatar (called after quiz completion)
 * @access  Private
 */
router.post("/add-experience", verifyToken, async (req, res) => {
  try {
    const { 
      amount, 
      source, 
      quizStats 
    } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid experience amount is required",
      });
    }
    
    let avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      avatar = await Avatar.createDefaultAvatar(req.user.id);
    }
    
    const previousLevel = avatar.evolution.currentLevel;
    const previousStage = avatar.evolution.evolutionStage;
    
    // Update quiz stats if provided
    if (quizStats) {
      if (quizStats.questionsAnswered) {
        avatar.evolution.totalQuestionsAnswered += quizStats.questionsAnswered;
      }
      if (quizStats.correctAnswers) {
        avatar.evolution.totalCorrectAnswers += quizStats.correctAnswers;
      }
      if (quizStats.quizCompleted) {
        avatar.evolution.totalQuizzesTaken += 1;
      }
      if (quizStats.isPerfectScore) {
        avatar.evolution.totalPerfectScores += 1;
      }
      if (quizStats.streak && quizStats.streak > avatar.evolution.longestStreak) {
        avatar.evolution.longestStreak = quizStats.streak;
      }
      if (quizStats.timeSpent) {
        avatar.evolution.totalStudyTime += quizStats.timeSpent;
      }
    }
    
    // Add experience
    await avatar.addExperience(amount, source);
    
    // Check for level up
    const leveledUp = avatar.evolution.currentLevel > previousLevel;
    const evolvedStage = avatar.evolution.evolutionStage !== previousStage;
    
    // Check for new item unlocks based on level
    const newUnlocks = await evolutionService.checkForUnlocks(avatar);
    
    // Generate response
    const response = {
      success: true,
      experienceAdded: amount,
      evolution: {
        currentLevel: avatar.evolution.currentLevel,
        evolutionStage: avatar.evolution.evolutionStage,
        experiencePoints: avatar.evolution.experiencePoints,
        experienceToNextLevel: avatar.evolution.experienceToNextLevel,
      },
      events: [],
    };
    
    if (leveledUp) {
      response.events.push({
        type: "levelUp",
        previousLevel,
        newLevel: avatar.evolution.currentLevel,
        message: `Level Up! You are now level ${avatar.evolution.currentLevel}!`,
      });
    }
    
    if (evolvedStage) {
      response.events.push({
        type: "evolution",
        previousStage,
        newStage: avatar.evolution.evolutionStage,
        message: `Congratulations! Your avatar has evolved to ${avatar.evolution.evolutionStage}!`,
      });
    }
    
    if (newUnlocks.length > 0) {
      response.events.push({
        type: "itemUnlock",
        items: newUnlocks,
        message: `You unlocked ${newUnlocks.length} new item(s)!`,
      });
    }
    
    res.json(response);
  } catch (error) {
    console.error("Error adding experience:", error);
    res.status(500).json({ success: false, error: "Failed to add experience" });
  }
});

/**
 * @route   GET /api/evolution/leaderboard
 * @desc    Get evolution leaderboard
 * @access  Private
 */
router.get("/leaderboard", verifyToken, async (req, res) => {
  try {
    const { limit = 10, stage } = req.query;
    
    const query = {};
    if (stage) {
      query["evolution.evolutionStage"] = stage;
    }
    
    const avatars = await Avatar.find(query)
      .sort({ "evolution.currentLevel": -1, "evolution.experiencePoints": -1 })
      .limit(parseInt(limit))
      .populate("user", "name picture")
      .select("name customization evolution user");
    
    const leaderboard = avatars.map((avatar, index) => ({
      rank: index + 1,
      avatarName: avatar.name,
      userName: avatar.user?.name || "Anonymous",
      userPicture: avatar.user?.picture,
      level: avatar.evolution.currentLevel,
      stage: avatar.evolution.evolutionStage,
      experience: avatar.evolution.experiencePoints,
      customization: {
        outfit: avatar.customization.outfit,
        frame: avatar.customization.frame,
        aura: avatar.customization.aura,
      },
    }));
    
    // Find current user's rank
    const userAvatar = await Avatar.findOne({ user: req.user.id });
    let userRank = null;
    
    if (userAvatar) {
      const higherRanked = await Avatar.countDocuments({
        $or: [
          { "evolution.currentLevel": { $gt: userAvatar.evolution.currentLevel } },
          {
            "evolution.currentLevel": userAvatar.evolution.currentLevel,
            "evolution.experiencePoints": { $gt: userAvatar.evolution.experiencePoints },
          },
        ],
      });
      userRank = higherRanked + 1;
    }
    
    res.json({
      success: true,
      leaderboard,
      userRank,
      totalAvatars: await Avatar.countDocuments(),
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ success: false, error: "Failed to fetch leaderboard" });
  }
});

/**
 * @route   GET /api/evolution/stages
 * @desc    Get information about all evolution stages
 * @access  Public
 */
router.get("/stages", async (req, res) => {
  try {
    const stages = [
      {
        name: "novice",
        displayName: "Novice",
        levelRange: "1-4",
        description: "Just starting your learning journey",
        icon: "🌱",
        color: "#9CA3AF",
        benefits: ["Basic customization options", "Default animations"],
      },
      {
        name: "learner",
        displayName: "Learner",
        levelRange: "5-14",
        description: "Growing and absorbing knowledge",
        icon: "📚",
        color: "#10B981",
        benefits: ["Glow aura unlock", "Bronze frame unlock", "New outfit options"],
      },
      {
        name: "scholar",
        displayName: "Scholar",
        levelRange: "15-29",
        description: "Dedicated to the pursuit of knowledge",
        icon: "🎓",
        color: "#3B82F6",
        benefits: ["Academic robes unlock", "Silver frame unlock", "Sparkle aura"],
      },
      {
        name: "expert",
        displayName: "Expert",
        levelRange: "30-49",
        description: "Mastering subjects with expertise",
        icon: "⭐",
        color: "#8B5CF6",
        benefits: ["Futuristic glasses", "Gold frame unlock", "Electric aura"],
      },
      {
        name: "master",
        displayName: "Master",
        levelRange: "50-74",
        description: "Teaching others with mastery",
        icon: "👑",
        color: "#F59E0B",
        benefits: ["Astronaut outfit", "Platinum frame", "Rainbow aura"],
      },
      {
        name: "legend",
        displayName: "Legend",
        levelRange: "75+",
        description: "A true legend of learning",
        icon: "🏆",
        color: "#EF4444",
        benefits: ["All items unlocked", "Legendary frame", "Cosmic aura", "Crown hat"],
      },
    ];
    
    res.json({
      success: true,
      stages,
    });
  } catch (error) {
    console.error("Error fetching stages:", error);
    res.status(500).json({ success: false, error: "Failed to fetch stages" });
  }
});

/**
 * @route   GET /api/evolution/milestones
 * @desc    Get user's achieved and upcoming milestones
 * @access  Private
 */
router.get("/milestones", verifyToken, async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    const allMilestones = [
      { id: "first_quiz", name: "First Quiz", description: "Complete your first quiz", requirement: { quizzesTaken: 1 } },
      { id: "quiz_enthusiast", name: "Quiz Enthusiast", description: "Complete 10 quizzes", requirement: { quizzesTaken: 10 } },
      { id: "quiz_addict", name: "Quiz Addict", description: "Complete 50 quizzes", requirement: { quizzesTaken: 50 } },
      { id: "quiz_legend", name: "Quiz Legend", description: "Complete 100 quizzes", requirement: { quizzesTaken: 100 } },
      { id: "first_perfect", name: "Perfect!", description: "Get your first perfect score", requirement: { perfectScores: 1 } },
      { id: "perfectionist", name: "Perfectionist", description: "Get 10 perfect scores", requirement: { perfectScores: 10 } },
      { id: "streak_starter", name: "Streak Starter", description: "Achieve a 3-day streak", requirement: { streak: 3 } },
      { id: "streak_keeper", name: "Streak Keeper", description: "Achieve a 7-day streak", requirement: { streak: 7 } },
      { id: "streak_master", name: "Streak Master", description: "Achieve a 30-day streak", requirement: { streak: 30 } },
      { id: "question_century", name: "Century", description: "Answer 100 questions", requirement: { questionsAnswered: 100 } },
      { id: "question_thousand", name: "Millennial", description: "Answer 1000 questions", requirement: { questionsAnswered: 1000 } },
      { id: "study_hour", name: "Dedicated Hour", description: "Study for 60 minutes", requirement: { studyTime: 60 } },
      { id: "study_day", name: "Full Day", description: "Study for 8 hours total", requirement: { studyTime: 480 } },
    ];
    
    const stats = avatar.evolution;
    const achieved = [];
    const upcoming = [];
    
    for (const milestone of allMilestones) {
      const req = milestone.requirement;
      let isAchieved = false;
      let progress = 0;
      
      if (req.quizzesTaken) {
        progress = Math.min(100, (stats.totalQuizzesTaken / req.quizzesTaken) * 100);
        isAchieved = stats.totalQuizzesTaken >= req.quizzesTaken;
      } else if (req.perfectScores) {
        progress = Math.min(100, (stats.totalPerfectScores / req.perfectScores) * 100);
        isAchieved = stats.totalPerfectScores >= req.perfectScores;
      } else if (req.streak) {
        progress = Math.min(100, (stats.longestStreak / req.streak) * 100);
        isAchieved = stats.longestStreak >= req.streak;
      } else if (req.questionsAnswered) {
        progress = Math.min(100, (stats.totalQuestionsAnswered / req.questionsAnswered) * 100);
        isAchieved = stats.totalQuestionsAnswered >= req.questionsAnswered;
      } else if (req.studyTime) {
        progress = Math.min(100, (stats.totalStudyTime / req.studyTime) * 100);
        isAchieved = stats.totalStudyTime >= req.studyTime;
      }
      
      const milestoneData = {
        ...milestone,
        progress: Math.round(progress),
        isAchieved,
      };
      
      if (isAchieved) {
        achieved.push(milestoneData);
      } else {
        upcoming.push(milestoneData);
      }
    }
    
    res.json({
      success: true,
      achieved,
      upcoming: upcoming.slice(0, 5), // Show next 5 upcoming
      totalAchieved: achieved.length,
      totalMilestones: allMilestones.length,
    });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ success: false, error: "Failed to fetch milestones" });
  }
});

module.exports = router;
