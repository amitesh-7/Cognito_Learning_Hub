const express = require("express");
const router = express.Router();
const Avatar = require("../models/Avatar");
const { verifyToken } = require("../middleware/auth");
const { LearningStyleAnalyzer } = require("../services/learningStyleService");

const analyzer = new LearningStyleAnalyzer();

/**
 * @route   GET /api/learning-style
 * @desc    Get user's learning style profile
 * @access  Private
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    res.json({
      success: true,
      learningStyle: avatar.learningStyle,
      personality: avatar.personality,
      recommendations: analyzer.generateRecommendations(avatar.learningStyle),
    });
  } catch (error) {
    console.error("Error fetching learning style:", error);
    res.status(500).json({ success: false, error: "Failed to fetch learning style" });
  }
});

/**
 * @route   POST /api/learning-style/analyze
 * @desc    Analyze and update learning style based on quiz performance
 * @access  Private
 */
router.post("/analyze", verifyToken, async (req, res) => {
  try {
    const { quizData } = req.body;
    
    if (!quizData) {
      return res.status(400).json({ success: false, error: "Quiz data is required" });
    }
    
    let avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      avatar = await Avatar.createDefaultAvatar(req.user.id);
    }
    
    // Analyze quiz performance
    const analysis = analyzer.analyzeQuizPerformance(quizData, avatar.learningStyle);
    
    // Update learning style based on analysis
    if (analysis.paceUpdate) {
      avatar.learningStyle.preferredPace = analysis.paceUpdate;
    }
    
    if (analysis.averageTimePerQuestion) {
      // Running average
      const currentAvg = avatar.learningStyle.averageTimePerQuestion;
      const totalQuizzes = avatar.evolution.totalQuizzesTaken;
      avatar.learningStyle.averageTimePerQuestion = 
        ((currentAvg * totalQuizzes) + analysis.averageTimePerQuestion) / (totalQuizzes + 1);
    }
    
    // Update category proficiency
    if (quizData.category) {
      const categoryScore = (quizData.correctAnswers / quizData.totalQuestions) * 100;
      
      // Find or create category entry
      let categoryEntry = avatar.learningStyle.strongCategories.find(
        c => c.category === quizData.category
      ) || avatar.learningStyle.weakCategories.find(
        c => c.category === quizData.category
      );
      
      if (categoryEntry) {
        // Update existing
        const oldProficiency = categoryEntry.proficiency;
        const oldCount = categoryEntry.questionsAnswered;
        categoryEntry.proficiency = 
          ((oldProficiency * oldCount) + categoryScore) / (oldCount + quizData.totalQuestions);
        categoryEntry.questionsAnswered += quizData.totalQuestions;
      } else {
        // Create new
        const newEntry = {
          category: quizData.category,
          proficiency: categoryScore,
          questionsAnswered: quizData.totalQuestions,
        };
        
        if (categoryScore >= 70) {
          avatar.learningStyle.strongCategories.push(newEntry);
        } else {
          avatar.learningStyle.weakCategories.push(newEntry);
        }
      }
      
      // Reorganize categories based on proficiency
      const allCategories = [
        ...avatar.learningStyle.strongCategories,
        ...avatar.learningStyle.weakCategories,
      ];
      
      avatar.learningStyle.strongCategories = allCategories.filter(c => c.proficiency >= 70);
      avatar.learningStyle.weakCategories = allCategories.filter(c => c.proficiency < 70);
    }
    
    // Update difficulty comfort zone
    if (quizData.difficulty) {
      const difficultyScores = {
        Easy: quizData.difficulty === "Easy" ? quizData.percentage : null,
        Medium: quizData.difficulty === "Medium" ? quizData.percentage : null,
        Hard: quizData.difficulty === "Hard" ? quizData.percentage : null,
      };
      
      // Find best performing difficulty
      const bestDifficulty = Object.entries(difficultyScores)
        .filter(([_, score]) => score !== null)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (bestDifficulty && bestDifficulty[1] >= 80) {
        avatar.learningStyle.comfortZone = bestDifficulty[0];
      }
    }
    
    // Update challenge acceptance
    if (quizData.difficulty === "Hard") {
      avatar.learningStyle.challengeAcceptance = Math.min(100, avatar.learningStyle.challengeAcceptance + 5);
    }
    
    // Detect patterns
    if (quizData.hintsUsed > 0) {
      avatar.learningStyle.usesHints = true;
    }
    
    if (quizData.reviewedExplanations) {
      avatar.learningStyle.reviewsExplanations = true;
    }
    
    // Update session duration tracking
    if (quizData.sessionDuration) {
      const currentAvg = avatar.learningStyle.averageSessionDuration;
      const sessions = avatar.evolution.totalQuizzesTaken;
      avatar.learningStyle.averageSessionDuration = 
        ((currentAvg * sessions) + quizData.sessionDuration) / (sessions + 1);
    }
    
    await avatar.save();
    
    res.json({
      success: true,
      analysis,
      updatedLearningStyle: avatar.learningStyle,
      recommendations: analyzer.generateRecommendations(avatar.learningStyle),
    });
  } catch (error) {
    console.error("Error analyzing learning style:", error);
    res.status(500).json({ success: false, error: "Failed to analyze learning style" });
  }
});

/**
 * @route   GET /api/learning-style/insights
 * @desc    Get AI-generated insights about learning patterns
 * @access  Private
 */
router.get("/insights", verifyToken, async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    const insights = analyzer.generateInsights(avatar.learningStyle, avatar.evolution);
    
    res.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({ success: false, error: "Failed to generate insights" });
  }
});

/**
 * @route   PUT /api/learning-style/preferences
 * @desc    Update learning style preferences manually
 * @access  Private
 */
router.put("/preferences", verifyToken, async (req, res) => {
  try {
    const { preferredPace, preferredEncouragement, peakPerformanceTime } = req.body;
    
    let avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    if (preferredPace) {
      const validPaces = ["fast", "moderate", "slow", "adaptive"];
      if (validPaces.includes(preferredPace)) {
        avatar.learningStyle.preferredPace = preferredPace;
      }
    }
    
    if (preferredEncouragement) {
      const validStyles = ["motivational", "factual", "humorous", "gentle", "competitive"];
      if (validStyles.includes(preferredEncouragement)) {
        avatar.learningStyle.preferredEncouragement = preferredEncouragement;
        
        // Also update personality to match
        switch (preferredEncouragement) {
          case "motivational":
            avatar.personality.enthusiasm = 80;
            avatar.personality.supportiveness = 85;
            break;
          case "humorous":
            avatar.personality.humor = 85;
            avatar.personality.enthusiasm = 75;
            break;
          case "competitive":
            avatar.personality.competitiveness = 85;
            avatar.personality.enthusiasm = 80;
            break;
          case "gentle":
            avatar.personality.patience = 90;
            avatar.personality.supportiveness = 90;
            break;
          case "factual":
            avatar.personality.enthusiasm = 50;
            avatar.personality.humor = 30;
            break;
        }
      }
    }
    
    if (peakPerformanceTime) {
      const validTimes = ["morning", "afternoon", "evening", "night", "any"];
      if (validTimes.includes(peakPerformanceTime)) {
        avatar.learningStyle.peakPerformanceTime = peakPerformanceTime;
      }
    }
    
    await avatar.save();
    
    res.json({
      success: true,
      message: "Preferences updated",
      learningStyle: avatar.learningStyle,
      personality: avatar.personality,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ success: false, error: "Failed to update preferences" });
  }
});

/**
 * @route   GET /api/learning-style/quiz-recommendations
 * @desc    Get personalized quiz recommendations based on learning style
 * @access  Private
 */
router.get("/quiz-recommendations", verifyToken, async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    const style = avatar.learningStyle;
    
    // Generate recommendations
    const recommendations = {
      categories: {
        strengthen: style.weakCategories.slice(0, 3).map(c => ({
          name: c.category,
          currentProficiency: Math.round(c.proficiency),
          reason: "Needs improvement",
        })),
        challenge: style.strongCategories.slice(0, 2).map(c => ({
          name: c.category,
          currentProficiency: Math.round(c.proficiency),
          reason: "Ready for harder questions",
        })),
      },
      difficulty: {
        recommended: style.comfortZone,
        challenge: style.challengeAcceptance > 60 ? "Hard" : 
                   style.comfortZone === "Easy" ? "Medium" : "Hard",
      },
      timing: {
        optimalSessionLength: Math.max(10, Math.min(60, style.averageSessionDuration)),
        suggestedPace: style.preferredPace,
        bestTimeOfDay: style.peakPerformanceTime,
      },
      study: {
        useHints: !style.usesHints && style.weakCategories.length > 0,
        reviewExplanations: true,
        focusAreas: style.weakCategories.slice(0, 2).map(c => c.category),
      },
    };
    
    res.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ success: false, error: "Failed to generate recommendations" });
  }
});

module.exports = router;
