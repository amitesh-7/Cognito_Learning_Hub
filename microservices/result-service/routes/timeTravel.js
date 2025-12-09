const express = require("express");
const router = express.Router();
const Result = require("../models/Result");
const Quiz = require("../../quiz-service/models/Quiz");

/**
 * @route   GET /api/time-travel/analyze/:userId
 * @desc    Analyze user's past performance to generate time-travel quizzes
 * @access  Private
 */
router.get("/analyze/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { days = 30, limit = 10 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.setDate() - parseInt(days));

    // Get past results
    const pastResults = await Result.find({
      user: userId,
      createdAt: { $gte: cutoffDate },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("quiz", "title category difficulty");

    // Analyze weak areas
    const weakAreas = analyzeWeakAreas(pastResults);
    const improvementTopics = identifyImprovementOpportunities(pastResults);
    const mistakePatterns = extractMistakePatterns(pastResults);

    res.json({
      success: true,
      data: {
        totalQuizzesTaken: pastResults.length,
        weakAreas,
        improvementTopics,
        mistakePatterns,
        analysisDate: new Date(),
      },
    });
  } catch (error) {
    console.error("Error analyzing time-travel data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze performance",
    });
  }
});

/**
 * @route   POST /api/time-travel/generate
 * @desc    Generate a time-travel quiz based on past performance
 * @access  Private
 */
router.post("/generate", async (req, res) => {
  try {
    const { userId, category, difficulty, questionCount = 10 } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    // Get user's weak questions from past 30 days
    const weakQuestions = await getWeakQuestions(
      userId,
      category,
      difficulty,
      questionCount
    );

    if (weakQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No past performance data found. Take some quizzes first!",
      });
    }

    // Generate time-travel questions
    const timeTravelQuiz = {
      title: `🕰️ Time-Travel Challenge: ${category || "Mixed Topics"}`,
      description:
        "Can you beat your past self? These questions are based on topics you struggled with before.",
      questions: weakQuestions.map((wq, index) => ({
        questionIndex: index,
        question: wq.question,
        type: wq.type,
        options: wq.options,
        correct_answer: wq.correct_answer,
        difficulty: wq.difficulty,
        points: wq.points,
        timeTravelMetadata: {
          previousAttemptDate: wq.previousAttemptDate,
          previousAnswer: wq.previousAnswer,
          previousScore: wq.previousScore,
          attemptsCount: wq.attemptsCount,
          improvementHint: wq.improvementHint,
        },
      })),
      metadata: {
        isTimeTravelQuiz: true,
        generatedDate: new Date(),
        category,
        difficulty,
      },
    };

    res.json({
      success: true,
      data: timeTravelQuiz,
    });
  } catch (error) {
    console.error("Error generating time-travel quiz:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate time-travel quiz",
    });
  }
});

/**
 * @route   GET /api/time-travel/comparison/:userId/:quizId
 * @desc    Compare current attempt with past attempts
 * @access  Private
 */
router.get("/comparison/:userId/:quizId", async (req, res) => {
  try {
    const { userId, quizId } = req.params;

    const attempts = await Result.find({
      user: userId,
      quiz: quizId,
    })
      .sort({ createdAt: 1 })
      .limit(10);

    if (attempts.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No previous attempts found",
      });
    }

    const comparison = {
      totalAttempts: attempts.length,
      firstAttempt: {
        date: attempts[0].createdAt,
        score: attempts[0].score,
        percentage: attempts[0].percentage,
      },
      latestAttempt: {
        date: attempts[attempts.length - 1].createdAt,
        score: attempts[attempts.length - 1].score,
        percentage: attempts[attempts.length - 1].percentage,
      },
      improvement: {
        scoreChange: attempts[attempts.length - 1].score - attempts[0].score,
        percentageChange:
          attempts[attempts.length - 1].percentage - attempts[0].percentage,
      },
      progressGraph: attempts.map((a) => ({
        date: a.createdAt,
        score: a.score,
        percentage: a.percentage,
      })),
      bestAttempt: attempts.reduce((best, current) =>
        current.score > best.score ? current : best
      ),
    };

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    console.error("Error fetching comparison:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch comparison",
    });
  }
});

/**
 * @route   GET /api/time-travel/progress/:userId
 * @desc    Get overall progress visualization
 * @access  Private
 */
router.get("/progress/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { period = "30" } = req.query; // days

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));

    const results = await Result.find({
      user: userId,
      createdAt: { $gte: cutoffDate },
    })
      .sort({ createdAt: 1 })
      .populate("quiz", "category difficulty");

    // Group by week
    const weeklyProgress = groupByWeek(results);

    // Category-wise improvement
    const categoryProgress = groupByCategory(results);

    // Difficulty progression
    const difficultyProgress = groupByDifficulty(results);

    res.json({
      success: true,
      data: {
        weeklyProgress,
        categoryProgress,
        difficultyProgress,
        totalQuizzes: results.length,
        averageImprovement: calculateAverageImprovement(results),
      },
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch progress",
    });
  }
});

/**
 * Helper functions
 */

function analyzeWeakAreas(results) {
  const categoryScores = {};

  results.forEach((result) => {
    const category = result.quiz?.category || "Unknown";
    if (!categoryScores[category]) {
      categoryScores[category] = { total: 0, count: 0, scores: [] };
    }
    categoryScores[category].total += result.percentage;
    categoryScores[category].count += 1;
    categoryScores[category].scores.push(result.percentage);
  });

  return Object.entries(categoryScores)
    .map(([category, data]) => ({
      category,
      averageScore: Math.round(data.total / data.count),
      attemptsCount: data.count,
      trend: calculateTrend(data.scores),
    }))
    .filter((area) => area.averageScore < 70)
    .sort((a, b) => a.averageScore - b.averageScore);
}

function identifyImprovementOpportunities(results) {
  const opportunities = [];

  results.forEach((result) => {
    if (result.percentage < 60 && result.percentage > 40) {
      opportunities.push({
        quiz: result.quiz?.title,
        category: result.quiz?.category,
        score: result.percentage,
        date: result.createdAt,
        message: "Close to passing! One more try could do it.",
      });
    } else if (result.percentage < 40) {
      opportunities.push({
        quiz: result.quiz?.title,
        category: result.quiz?.category,
        score: result.percentage,
        date: result.createdAt,
        message: "Needs review. Consider revisiting the basics.",
      });
    }
  });

  return opportunities.slice(0, 10);
}

function extractMistakePatterns(results) {
  const patterns = {
    timeManagement: 0,
    conceptual: 0,
    calculation: 0,
    reading: 0,
  };

  results.forEach((result) => {
    if (
      result.timeSpent &&
      result.timeSpent < result.quiz?.estimatedTime * 0.5
    ) {
      patterns.timeManagement++;
    }
    if (result.percentage < 50) {
      patterns.conceptual++;
    }
  });

  return patterns;
}

async function getWeakQuestions(userId, category, difficulty, count) {
  const query = { user: userId };
  if (category) query["quiz.category"] = category;

  const results = await Result.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("quiz");

  const weakQuestions = [];
  const questionMap = new Map();

  results.forEach((result) => {
    if (!result.quiz || !result.answers) return;

    result.answers.forEach((answer, index) => {
      if (!answer.isCorrect && result.quiz.questions[index]) {
        const question = result.quiz.questions[index];
        const questionKey = question.question;

        if (!questionMap.has(questionKey)) {
          questionMap.set(questionKey, {
            ...question.toObject(),
            previousAttemptDate: result.createdAt,
            previousAnswer: answer.answer,
            previousScore: answer.points || 0,
            attemptsCount: 1,
            improvementHint: `You answered "${answer.answer}" before. Think about why that wasn't correct.`,
          });
        } else {
          const existing = questionMap.get(questionKey);
          existing.attemptsCount++;
        }
      }
    });
  });

  return Array.from(questionMap.values())
    .sort((a, b) => b.attemptsCount - a.attemptsCount)
    .slice(0, count);
}

function calculateTrend(scores) {
  if (scores.length < 2) return "stable";

  const recent =
    scores.slice(-3).reduce((sum, score) => sum + score, 0) /
    Math.min(3, scores.length);
  const older =
    scores.slice(0, 3).reduce((sum, score) => sum + score, 0) /
    Math.min(3, scores.length);

  if (recent > older + 10) return "improving";
  if (recent < older - 10) return "declining";
  return "stable";
}

function groupByWeek(results) {
  const weeks = {};

  results.forEach((result) => {
    const weekKey = getWeekKey(result.createdAt);
    if (!weeks[weekKey]) {
      weeks[weekKey] = { scores: [], count: 0 };
    }
    weeks[weekKey].scores.push(result.percentage);
    weeks[weekKey].count++;
  });

  return Object.entries(weeks).map(([week, data]) => ({
    week,
    averageScore: Math.round(
      data.scores.reduce((sum, s) => sum + s, 0) / data.count
    ),
    quizCount: data.count,
  }));
}

function groupByCategory(results) {
  const categories = {};

  results.forEach((result) => {
    const category = result.quiz?.category || "Unknown";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(result.percentage);
  });

  return Object.entries(categories).map(([category, scores]) => ({
    category,
    averageScore: Math.round(
      scores.reduce((sum, s) => sum + s, 0) / scores.length
    ),
    trend: calculateTrend(scores),
  }));
}

function groupByDifficulty(results) {
  const difficulties = { Easy: [], Medium: [], Hard: [], Expert: [] };

  results.forEach((result) => {
    const diff = result.quiz?.difficulty || "Medium";
    if (difficulties[diff]) {
      difficulties[diff].push(result.percentage);
    }
  });

  return Object.entries(difficulties)
    .filter(([_, scores]) => scores.length > 0)
    .map(([difficulty, scores]) => ({
      difficulty,
      averageScore: Math.round(
        scores.reduce((sum, s) => sum + s, 0) / scores.length
      ),
      attemptsCount: scores.length,
    }));
}

function calculateAverageImprovement(results) {
  if (results.length < 2) return 0;

  const firstHalf = results.slice(0, Math.floor(results.length / 2));
  const secondHalf = results.slice(Math.floor(results.length / 2));

  const avgFirst =
    firstHalf.reduce((sum, r) => sum + r.percentage, 0) / firstHalf.length;
  const avgSecond =
    secondHalf.reduce((sum, r) => sum + r.percentage, 0) / secondHalf.length;

  return Math.round(avgSecond - avgFirst);
}

function getWeekKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const week = Math.ceil(d.getDate() / 7);
  return `${year}-W${week}`;
}

module.exports = router;
