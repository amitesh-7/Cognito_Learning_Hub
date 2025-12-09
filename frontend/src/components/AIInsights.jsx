import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import {
  Sparkles,
  Lightbulb,
  Target,
  ChevronRight,
  RefreshCw,
  Trophy,
  TrendingUp,
  Users,
  Star,
  Flame,
  Award,
  ArrowUp,
  Quote,
  Brain,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

/**
 * AI Insights Card Component
 * Displays AI-generated personalized learning insights
 */
export function AIInsightsCard({ insights, onRefresh, isLoading }) {
  const [expanded, setExpanded] = useState(false);

  if (!insights || insights.hasData === false) {
    return (
      <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            AI Learning Coach
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {insights?.message ||
            "Take a few quizzes to unlock personalized AI insights about your learning journey!"}
        </p>
      </Card>
    );
  }

  const insightsData = insights.insights || {};
  const priorityColors = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    medium:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-fuchsia-900/20 border-0 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-fuchsia-400/20 to-pink-600/20 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Brain className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                AI Learning Coach
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by{" "}
                {insightsData.generatedBy === "ai"
                  ? "Gemini AI ✨"
                  : "Smart Analytics"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Summary */}
        {insightsData.summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-purple-100 dark:border-purple-800/30"
          >
            <p className="text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
              {insightsData.summary}
            </p>
            {insightsData.encouragement && (
              <p className="text-purple-600 dark:text-purple-400 text-sm mt-3 italic flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {insightsData.encouragement}
              </p>
            )}
          </motion.div>
        )}

        {/* Key Insights */}
        {insightsData.insights && insightsData.insights.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Key Insights
              </h4>
            </div>
            <div className="space-y-2">
              {insightsData.insights
                .slice(0, expanded ? undefined : 3)
                .map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 bg-white/40 dark:bg-gray-800/40 rounded-lg p-3 border border-purple-100/50 dark:border-purple-800/20"
                  >
                    <span className="text-purple-500 mt-0.5">💡</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {insight}
                    </p>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insightsData.recommendations &&
          insightsData.recommendations.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-green-500" />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Action Steps
                </h4>
              </div>
              <div className="space-y-2">
                {insightsData.recommendations
                  .slice(0, expanded ? undefined : 3)
                  .map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className={`rounded-lg p-3 border ${
                        priorityColors[rec.priority || "medium"]
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
                          {rec.priority === "high" && (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          {rec.priority !== "high" && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {rec.title}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase`}
                        >
                          {rec.priority || "medium"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {rec.description}
                      </p>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

        {/* Goal Suggestions */}
        {insightsData.goalSuggestions &&
          insightsData.goalSuggestions.length > 0 &&
          expanded && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-orange-500" />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Suggested Goals
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {insightsData.goalSuggestions.map((goal, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 text-orange-700 dark:text-orange-300 text-xs px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/30"
                  >
                    <Star className="w-3 h-3" />
                    {goal}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

        {/* Motivational Quote */}
        {insightsData.motivationalQuote && expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 mb-4 border border-purple-200 dark:border-purple-800/30"
          >
            <div className="flex gap-3">
              <Quote className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
              <p className="text-sm italic text-purple-700 dark:text-purple-300 leading-relaxed">
                "{insightsData.motivationalQuote}"
              </p>
            </div>
          </motion.div>
        )}

        {/* Expand/Collapse button */}
        {(insightsData.insights?.length > 3 ||
          insightsData.recommendations?.length > 3 ||
          insightsData.goalSuggestions?.length > 0) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium mt-2 transition-colors"
          >
            {expanded ? "Show less" : "Show all insights"}
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
            />
          </button>
        )}

        {/* Expand/Collapse button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium mt-2"
        >
          {expanded ? "Show less" : "Show more insights"}
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </button>
      </div>
    </Card>
  );
}

/**
 * Peer Comparison Component
 * Shows how the student ranks compared to peers
 */
export function PeerComparisonCard({ comparison }) {
  if (!comparison || !comparison.hasEnoughData) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Peer Comparison
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {comparison?.message ||
            "Complete at least 3 quizzes to see how you compare with peers!"}
        </p>
      </Card>
    );
  }

  const getPercentileColor = (percentile) => {
    if (percentile >= 90) return "from-yellow-400 to-amber-500";
    if (percentile >= 75) return "from-green-400 to-emerald-500";
    if (percentile >= 50) return "from-blue-400 to-indigo-500";
    return "from-purple-400 to-pink-500";
  };

  const getPercentileEmoji = (percentile) => {
    if (percentile >= 95) return "🏆";
    if (percentile >= 90) return "⭐";
    if (percentile >= 75) return "🎯";
    if (percentile >= 50) return "💪";
    return "📈";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-cyan-900/20 border-0 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Peer Comparison
          </h3>
        </div>

        {/* Percentile Circle */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="url(#percentileGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={251.2}
                initial={{ strokeDashoffset: 251.2 }}
                animate={{
                  strokeDashoffset:
                    251.2 - (comparison.percentile / 100) * 251.2,
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient
                  id="percentileGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {comparison.percentile}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                percentile
              </span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {getPercentileEmoji(comparison.percentile)} {comparison.message}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Rank:</span>{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  #{comparison.rank}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">of:</span>{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {comparison.totalUsers}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        {comparison.scoreDistribution && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
              Score Distribution
            </h4>
            <div className="space-y-2">
              {Object.entries(comparison.scoreDistribution).map(
                ([range, count]) => {
                  const percentage = Math.round(
                    (count / comparison.totalUsers) * 100
                  );
                  return (
                    <div key={range} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-16">
                        {range}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                        {count} users
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Weekly Activity Heatmap Component
 */
export function WeeklyActivityCard({ dailyActivity, weeklyTrend }) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Create activity map
  const activityMap = {};
  if (dailyActivity) {
    dailyActivity.forEach((day) => {
      activityMap[day._id] = {
        count: day.count,
        avgScore: day.avgScore,
      };
    });
  }

  const getActivityColor = (count) => {
    if (!count || count === 0) return "bg-gray-100 dark:bg-gray-800";
    if (count >= 5) return "bg-green-500";
    if (count >= 3) return "bg-green-400";
    if (count >= 2) return "bg-green-300";
    return "bg-green-200";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Weekly Activity
        </h3>
      </div>

      {/* Day heatmap */}
      <div className="flex justify-between gap-2 mb-4">
        {dayNames.map((day, index) => {
          const dayIndex = index + 1; // MongoDB uses 1-7 for days
          const activity = activityMap[dayIndex] || { count: 0, avgScore: 0 };

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex-1 text-center"
            >
              <div
                className={`w-full aspect-square rounded-lg ${getActivityColor(
                  activity.count
                )} flex items-center justify-center mb-1 transition-all hover:scale-105`}
                title={`${day}: ${activity.count} quizzes, ${Math.round(
                  activity.avgScore
                )}% avg`}
              >
                <span className="text-xs font-bold text-white opacity-90">
                  {activity.count || ""}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {day}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly trend */}
      {weeklyTrend && weeklyTrend.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              This week's quizzes
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
              {weeklyTrend[0]?.quizCount || 0}
              {weeklyTrend[1] &&
                weeklyTrend[0]?.quizCount > weeklyTrend[1]?.quizCount && (
                  <ArrowUp className="w-4 h-4 text-green-500" />
                )}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="w-3 h-3 rounded bg-green-200" />
        <div className="w-3 h-3 rounded bg-green-300" />
        <div className="w-3 h-3 rounded bg-green-400" />
        <div className="w-3 h-3 rounded bg-green-500" />
        <span>More</span>
      </div>
    </Card>
  );
}

export default { AIInsightsCard, PeerComparisonCard, WeeklyActivityCard };
