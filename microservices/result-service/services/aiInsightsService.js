/**
 * AI Insights Service
 * Generates personalized learning insights using Gemini AI
 * Analyzes student performance patterns and provides recommendations
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const createLogger = require("../../shared/utils/logger");
const Result = require("../models/Result");
const mongoose = require("mongoose");

const logger = createLogger("ai-insights-service");

// Initialize Gemini AI (optional - fallback to rule-based if not available)
let genAI = null;
let model = null;

const apiKey = process.env.GOOGLE_API_KEY;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  });
  logger.info("Gemini AI initialized for personalized insights");
} else {
  logger.warn("GOOGLE_API_KEY not set - using rule-based insights only");
}

/**
 * Get comprehensive user analytics
 */
async function getUserAnalytics(userId) {
  try {
    const analytics = await Result.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          // Overall stats
          overall: [
            {
              $group: {
                _id: null,
                totalQuizzes: { $sum: 1 },
                averageScore: { $avg: "$percentage" },
                totalScore: { $sum: "$score" },
                bestScore: { $max: "$percentage" },
                worstScore: { $min: "$percentage" },
                totalCorrect: { $sum: "$correctAnswers" },
                totalQuestions: { $sum: "$totalQuestions" },
                totalTimeSpent: { $sum: "$totalTimeSpent" },
                averageTimePerQuiz: { $avg: "$totalTimeSpent" },
                averageTimePerQuestion: { $avg: "$averageTimePerQuestion" },
              },
            },
          ],

          // Performance by category
          byCategory: [
            { $match: { "quizMetadata.category": { $exists: true, $ne: null } } },
            {
              $group: {
                _id: "$quizMetadata.category",
                count: { $sum: 1 },
                avgScore: { $avg: "$percentage" },
                bestScore: { $max: "$percentage" },
                totalQuestions: { $sum: "$totalQuestions" },
                totalCorrect: { $sum: "$correctAnswers" },
              },
            },
            { $sort: { count: -1 } },
          ],

          // Performance by difficulty
          byDifficulty: [
            { $match: { "quizMetadata.difficulty": { $exists: true, $ne: null } } },
            {
              $group: {
                _id: "$quizMetadata.difficulty",
                count: { $sum: 1 },
                avgScore: { $avg: "$percentage" },
                avgTime: { $avg: "$averageTimePerQuestion" },
              },
            },
          ],

          // Weekly trend (last 8 weeks)
          weeklyTrend: [
            {
              $match: {
                completedAt: { $gte: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000) },
              },
            },
            {
              $group: {
                _id: {
                  week: { $isoWeek: "$completedAt" },
                  year: { $isoWeekYear: "$completedAt" },
                },
                quizCount: { $sum: 1 },
                avgScore: { $avg: "$percentage" },
                totalTime: { $sum: "$totalTimeSpent" },
              },
            },
            { $sort: { "_id.year": -1, "_id.week": -1 } },
            { $limit: 8 },
          ],

          // Daily activity (last 30 days)
          dailyActivity: [
            {
              $match: {
                completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              },
            },
            {
              $group: {
                _id: { $dayOfWeek: "$completedAt" },
                count: { $sum: 1 },
                avgScore: { $avg: "$percentage" },
              },
            },
            { $sort: { _id: 1 } },
          ],

          // Performance levels distribution
          performanceLevels: [
            {
              $group: {
                _id: "$performanceLevel",
                count: { $sum: 1 },
              },
            },
          ],

          // Recent results (last 20)
          recentResults: [
            { $sort: { completedAt: -1 } },
            { $limit: 20 },
            {
              $project: {
                percentage: 1,
                completedAt: 1,
                totalTimeSpent: 1,
                category: "$quizMetadata.category",
                difficulty: "$quizMetadata.difficulty",
                isPassed: 1,
              },
            },
          ],

          // Time of day analysis
          timeOfDayAnalysis: [
            {
              $group: {
                _id: { $hour: "$completedAt" },
                count: { $sum: 1 },
                avgScore: { $avg: "$percentage" },
              },
            },
            { $sort: { avgScore: -1 } },
          ],
        },
      },
    ]);

    return analytics[0];
  } catch (error) {
    logger.error("Error getting user analytics:", error);
    throw error;
  }
}

/**
 * Calculate learning patterns from analytics
 */
function calculateLearningPatterns(analytics) {
  const patterns = {
    strengths: [],
    weaknesses: [],
    bestTimeToStudy: null,
    bestDay: null,
    improvementRate: 0,
    consistency: 0,
    speedVsAccuracy: null,
  };

  // Identify strengths and weaknesses by category
  if (analytics.byCategory && analytics.byCategory.length > 0) {
    const sortedCategories = [...analytics.byCategory].sort(
      (a, b) => b.avgScore - a.avgScore
    );

    // Top 3 categories as strengths
    patterns.strengths = sortedCategories
      .filter((c) => c.avgScore >= 70 && c.count >= 2)
      .slice(0, 3)
      .map((c) => ({
        category: c._id,
        avgScore: Math.round(c.avgScore),
        quizCount: c.count,
      }));

    // Bottom categories as weaknesses
    patterns.weaknesses = sortedCategories
      .filter((c) => c.avgScore < 70 && c.count >= 2)
      .slice(-3)
      .reverse()
      .map((c) => ({
        category: c._id,
        avgScore: Math.round(c.avgScore),
        quizCount: c.count,
        improvement: Math.round(70 - c.avgScore),
      }));
  }

  // Best time to study
  if (analytics.timeOfDayAnalysis && analytics.timeOfDayAnalysis.length > 0) {
    const bestHour = analytics.timeOfDayAnalysis[0];
    const hourLabels = {
      5: "Early Morning (5-6 AM)",
      6: "Early Morning (6-7 AM)",
      7: "Morning (7-8 AM)",
      8: "Morning (8-9 AM)",
      9: "Morning (9-10 AM)",
      10: "Late Morning (10-11 AM)",
      11: "Late Morning (11 AM-12 PM)",
      12: "Noon (12-1 PM)",
      13: "Afternoon (1-2 PM)",
      14: "Afternoon (2-3 PM)",
      15: "Afternoon (3-4 PM)",
      16: "Late Afternoon (4-5 PM)",
      17: "Evening (5-6 PM)",
      18: "Evening (6-7 PM)",
      19: "Evening (7-8 PM)",
      20: "Night (8-9 PM)",
      21: "Night (9-10 PM)",
      22: "Late Night (10-11 PM)",
      23: "Late Night (11 PM-12 AM)",
    };
    patterns.bestTimeToStudy = {
      hour: bestHour._id,
      label: hourLabels[bestHour._id] || `${bestHour._id}:00`,
      avgScore: Math.round(bestHour.avgScore),
    };
  }

  // Best day of week
  if (analytics.dailyActivity && analytics.dailyActivity.length > 0) {
    const dayNames = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const bestDay = analytics.dailyActivity.reduce((best, day) =>
      day.avgScore > (best?.avgScore || 0) ? day : best
    , null);
    
    if (bestDay) {
      patterns.bestDay = {
        day: dayNames[bestDay._id],
        avgScore: Math.round(bestDay.avgScore),
        quizCount: bestDay.count,
      };
    }
  }

  // Calculate improvement rate from weekly trend
  if (analytics.weeklyTrend && analytics.weeklyTrend.length >= 2) {
    const recentWeeks = analytics.weeklyTrend.slice(0, 4);
    const olderWeeks = analytics.weeklyTrend.slice(4);
    
    if (recentWeeks.length > 0 && olderWeeks.length > 0) {
      const recentAvg = recentWeeks.reduce((sum, w) => sum + w.avgScore, 0) / recentWeeks.length;
      const olderAvg = olderWeeks.reduce((sum, w) => sum + w.avgScore, 0) / olderWeeks.length;
      patterns.improvementRate = Math.round(recentAvg - olderAvg);
    }
  }

  // Calculate consistency (how regular the study pattern is)
  if (analytics.weeklyTrend && analytics.weeklyTrend.length > 0) {
    const weeksWithActivity = analytics.weeklyTrend.length;
    patterns.consistency = Math.min(100, Math.round((weeksWithActivity / 8) * 100));
  }

  // Speed vs Accuracy analysis
  if (analytics.overall && analytics.overall.length > 0) {
    const overall = analytics.overall[0];
    const avgTimePerQuestion = overall.averageTimePerQuestion || 0;
    const avgScore = overall.averageScore || 0;

    if (avgTimePerQuestion < 15000 && avgScore < 60) {
      patterns.speedVsAccuracy = "rushing";
    } else if (avgTimePerQuestion > 45000 && avgScore >= 80) {
      patterns.speedVsAccuracy = "thorough";
    } else if (avgTimePerQuestion < 20000 && avgScore >= 75) {
      patterns.speedVsAccuracy = "efficient";
    } else {
      patterns.speedVsAccuracy = "balanced";
    }
  }

  return patterns;
}

/**
 * Generate AI-powered personalized insights
 */
async function generateAIInsights(analytics, patterns, userName) {
  // If Gemini is not available, return rule-based insights
  if (!model) {
    return generateRuleBasedInsights(analytics, patterns, userName);
  }

  try {
    const overall = analytics.overall[0] || {};
    
    const prompt = `You are an encouraging and insightful learning coach analyzing a student's quiz performance data.

Student: ${userName || "Student"}
Performance Summary:
- Total Quizzes Taken: ${overall.totalQuizzes || 0}
- Average Score: ${Math.round(overall.averageScore || 0)}%
- Best Score: ${overall.bestScore || 0}%
- Total Questions Answered: ${overall.totalQuestions || 0}
- Accuracy: ${overall.totalQuestions ? Math.round((overall.totalCorrect / overall.totalQuestions) * 100) : 0}%

Strong Categories: ${patterns.strengths.map(s => `${s.category} (${s.avgScore}%)`).join(", ") || "Not enough data yet"}
Weak Categories: ${patterns.weaknesses.map(w => `${w.category} (${w.avgScore}%)`).join(", ") || "None identified"}

Learning Patterns:
- Best Time to Study: ${patterns.bestTimeToStudy?.label || "Not enough data"}
- Best Day: ${patterns.bestDay?.day || "Not enough data"}
- Study Consistency: ${patterns.consistency}%
- Recent Improvement: ${patterns.improvementRate > 0 ? "+" : ""}${patterns.improvementRate}%
- Study Style: ${patterns.speedVsAccuracy}

Based on this data, provide a JSON response with exactly this structure:
{
  "summary": "A brief 2-sentence personalized summary of their performance",
  "encouragement": "An encouraging message (1-2 sentences)",
  "insights": [
    "First specific insight about their learning pattern",
    "Second insight about what's working well",
    "Third insight about potential areas to improve"
  ],
  "recommendations": [
    {
      "title": "Short recommendation title",
      "description": "Specific actionable recommendation",
      "priority": "high" or "medium" or "low"
    }
  ],
  "goalSuggestions": [
    "Specific achievable goal 1",
    "Specific achievable goal 2"
  ],
  "motivationalQuote": "A relevant motivational quote for learners"
}

Keep the tone positive, encouraging, and constructive. Be specific to their data.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const aiInsights = JSON.parse(jsonMatch[0]);
      return {
        ...aiInsights,
        generatedBy: "ai",
        generatedAt: new Date(),
      };
    }

    throw new Error("Could not parse AI response");
  } catch (error) {
    logger.error("AI insights generation failed, using rule-based:", error.message);
    return generateRuleBasedInsights(analytics, patterns, userName);
  }
}

/**
 * Generate rule-based insights (fallback when AI is unavailable)
 */
function generateRuleBasedInsights(analytics, patterns, userName) {
  const overall = analytics.overall[0] || {};
  const avgScore = overall.averageScore || 0;
  const totalQuizzes = overall.totalQuizzes || 0;

  const insights = [];
  const recommendations = [];

  // Generate insights based on patterns
  if (patterns.bestTimeToStudy) {
    insights.push(
      `You perform best when studying during ${patterns.bestTimeToStudy.label}, with an average score of ${patterns.bestTimeToStudy.avgScore}%.`
    );
  }

  if (patterns.strengths.length > 0) {
    insights.push(
      `You excel in ${patterns.strengths.map((s) => s.category).join(", ")}. Keep building on these strengths!`
    );
  }

  if (patterns.improvementRate > 0) {
    insights.push(
      `Great progress! Your scores have improved by ${patterns.improvementRate}% in recent weeks.`
    );
  } else if (patterns.improvementRate < -5) {
    insights.push(
      `Your recent scores have dipped slightly. Consider revisiting fundamentals in challenging topics.`
    );
  }

  // Generate recommendations
  if (patterns.weaknesses.length > 0) {
    recommendations.push({
      title: "Focus on Weak Areas",
      description: `Spend extra time on ${patterns.weaknesses[0].category}. Take 2-3 practice quizzes this week.`,
      priority: "high",
    });
  }

  if (patterns.speedVsAccuracy === "rushing") {
    recommendations.push({
      title: "Slow Down for Accuracy",
      description: "Take more time on each question. Speed isn't everything - accuracy matters more!",
      priority: "high",
    });
  }

  if (patterns.consistency < 50) {
    recommendations.push({
      title: "Build a Study Routine",
      description: "Try to take at least 3 quizzes per week to maintain momentum.",
      priority: "medium",
    });
  }

  if (avgScore >= 80 && totalQuizzes >= 10) {
    recommendations.push({
      title: "Challenge Yourself",
      description: "You're doing great! Try harder difficulty quizzes to push your limits.",
      priority: "medium",
    });
  }

  // Summary
  let summary = "";
  if (avgScore >= 80) {
    summary = `Excellent work, ${userName || "Student"}! You're maintaining a strong ${Math.round(avgScore)}% average across ${totalQuizzes} quizzes.`;
  } else if (avgScore >= 60) {
    summary = `Good progress, ${userName || "Student"}! With a ${Math.round(avgScore)}% average, you're on the right track.`;
  } else {
    summary = `Keep going, ${userName || "Student"}! Every quiz is a learning opportunity. Focus on understanding concepts deeply.`;
  }

  // Encouragement
  const encouragements = [
    "Every expert was once a beginner. Keep pushing forward!",
    "Your dedication to learning is inspiring. Stay curious!",
    "Small consistent efforts lead to big achievements. You've got this!",
    "Learning is a journey, not a destination. Enjoy the process!",
  ];

  // Goal suggestions
  const goalSuggestions = [];
  if (avgScore < 70) {
    goalSuggestions.push(`Aim to improve your average score to 70% this month`);
  } else if (avgScore < 85) {
    goalSuggestions.push(`Target an 85% average score in your next 5 quizzes`);
  } else {
    goalSuggestions.push(`Maintain your excellent performance above 85%`);
  }

  if (totalQuizzes < 10) {
    goalSuggestions.push(`Complete ${10 - totalQuizzes} more quizzes to unlock detailed analytics`);
  } else {
    goalSuggestions.push(`Try a new category you haven't explored yet`);
  }

  return {
    summary,
    encouragement: encouragements[Math.floor(Math.random() * encouragements.length)],
    insights,
    recommendations,
    goalSuggestions,
    motivationalQuote: "The beautiful thing about learning is that nobody can take it away from you.",
    generatedBy: "rules",
    generatedAt: new Date(),
  };
}

/**
 * Get peer comparison stats (percentile ranking)
 */
async function getPeerComparison(userId) {
  try {
    // Get user's stats
    const userStats = await Result.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$percentage" },
          totalQuizzes: { $sum: 1 },
          totalScore: { $sum: "$score" },
        },
      },
    ]);

    if (!userStats.length || userStats[0].totalQuizzes < 3) {
      return {
        hasEnoughData: false,
        message: "Complete at least 3 quizzes to see peer comparison",
      };
    }

    const userAvg = userStats[0].avgScore;

    // Get all users' average scores (anonymized)
    const allUserStats = await Result.aggregate([
      {
        $group: {
          _id: "$userId",
          avgScore: { $avg: "$percentage" },
          quizCount: { $sum: 1 },
        },
      },
      { $match: { quizCount: { $gte: 3 } } }, // Only users with 3+ quizzes
      { $sort: { avgScore: -1 } },
    ]);

    const totalUsers = allUserStats.length;
    const userRank = allUserStats.findIndex(
      (u) => u._id.toString() === userId.toString()
    ) + 1;

    // Calculate percentile
    const percentile = Math.round(((totalUsers - userRank + 1) / totalUsers) * 100);

    // Score distribution
    const scoreRanges = {
      "90-100%": allUserStats.filter((u) => u.avgScore >= 90).length,
      "80-89%": allUserStats.filter((u) => u.avgScore >= 80 && u.avgScore < 90).length,
      "70-79%": allUserStats.filter((u) => u.avgScore >= 70 && u.avgScore < 80).length,
      "60-69%": allUserStats.filter((u) => u.avgScore >= 60 && u.avgScore < 70).length,
      "<60%": allUserStats.filter((u) => u.avgScore < 60).length,
    };

    return {
      hasEnoughData: true,
      rank: userRank,
      totalUsers,
      percentile,
      userAverage: Math.round(userAvg),
      message: getPercentileMessage(percentile),
      scoreDistribution: scoreRanges,
    };
  } catch (error) {
    logger.error("Error getting peer comparison:", error);
    throw error;
  }
}

function getPercentileMessage(percentile) {
  if (percentile >= 95) return "Outstanding! You're in the top 5% of all learners! 🏆";
  if (percentile >= 90) return "Excellent! You're in the top 10% of learners! ⭐";
  if (percentile >= 75) return "Great job! You're performing better than 75% of learners! 🎯";
  if (percentile >= 50) return "Good work! You're in the top half of all learners! 💪";
  if (percentile >= 25) return "Keep practicing! You're making progress! 📈";
  return "Every quiz you take helps you improve. Keep going! 🌱";
}

/**
 * Main function: Get complete personalized insights
 */
async function getPersonalizedInsights(userId, userName) {
  try {
    logger.info(`Generating personalized insights for user: ${userId}`);

    // Get comprehensive analytics
    const analytics = await getUserAnalytics(userId);

    if (!analytics.overall.length || analytics.overall[0].totalQuizzes < 1) {
      return {
        hasData: false,
        message: "Take your first quiz to unlock personalized insights!",
        analytics: null,
        patterns: null,
        insights: null,
        peerComparison: null,
      };
    }

    // Calculate learning patterns
    const patterns = calculateLearningPatterns(analytics);

    // Generate AI insights
    const insights = await generateAIInsights(analytics, patterns, userName);

    // Get peer comparison
    const peerComparison = await getPeerComparison(userId);

    return {
      hasData: true,
      analytics: {
        overall: analytics.overall[0],
        byCategory: analytics.byCategory,
        byDifficulty: analytics.byDifficulty,
        weeklyTrend: analytics.weeklyTrend,
        dailyActivity: analytics.dailyActivity,
        performanceLevels: analytics.performanceLevels,
        recentResults: analytics.recentResults,
      },
      patterns,
      insights,
      peerComparison,
      generatedAt: new Date(),
    };
  } catch (error) {
    logger.error("Error generating personalized insights:", error);
    throw error;
  }
}

module.exports = {
  getPersonalizedInsights,
  getUserAnalytics,
  calculateLearningPatterns,
  generateAIInsights,
  getPeerComparison,
};
