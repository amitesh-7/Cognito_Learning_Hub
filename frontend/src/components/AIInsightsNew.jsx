import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  Calendar,
  Award,
  Users,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Star,
  AlertCircle,
} from "lucide-react";

/**
 * Simple AI Insights Card - Rebuilt from scratch
 */
export function AIInsightsCard({ insights, onRefresh, isLoading }) {
  const [expanded, setExpanded] = useState(false);

  console.log("🎨 AIInsightsCard received:", insights);

  // Handle no data
  if (!insights || insights.hasData === false) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            AI Learning Coach
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {insights?.message ||
            "Take your first quiz to unlock AI-powered insights!"}
        </p>
      </div>
    );
  }

  const data = insights.insights || {};

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Learning Coach
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data.generatedBy === "ai"
                ? "✨ Powered by Gemini AI"
                : "📊 Smart Analytics"}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
        >
          <RefreshCw
            className={`w-5 h-5 text-purple-600 dark:text-purple-400 ${
              isLoading ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Summary Box */}
      {data.summary && (
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 mb-4 backdrop-blur-sm">
          <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
            {data.summary}
          </p>
          {data.encouragement && (
            <p className="text-purple-600 dark:text-purple-400 text-sm italic flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {data.encouragement}
            </p>
          )}
        </div>
      )}

      {/* Key Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
              Key Insights
            </h4>
          </div>
          <div className="space-y-2">
            {data.insights.map((insight, index) => (
              <div
                key={index}
                className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 flex items-start gap-2"
              >
                <span className="text-lg">💡</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
              Recommendations
            </h4>
          </div>
          <div className="space-y-2">
            {data.recommendations
              .slice(0, expanded ? undefined : 2)
              .map((rec, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-3 ${
                    rec.priority === "high"
                      ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                      : rec.priority === "medium"
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                      : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800 dark:text-white text-sm">
                      {rec.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium uppercase ${
                        rec.priority === "high"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : rec.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {rec.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Goals */}
      {data.goalSuggestions && data.goalSuggestions.length > 0 && expanded && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-orange-500" />
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
              Goals for You
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.goalSuggestions.map((goal, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full text-xs font-medium"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quote */}
      {data.motivationalQuote && expanded && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 mb-4">
          <p className="text-sm italic text-purple-700 dark:text-purple-300">
            "{data.motivationalQuote}"
          </p>
        </div>
      )}

      {/* Expand Button */}
      {(data.recommendations?.length > 2 ||
        data.goalSuggestions?.length > 0) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show more
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Simple Peer Comparison Card
 */
export function PeerComparisonCard({ comparison }) {
  console.log("👥 PeerComparisonCard received:", comparison);

  if (!comparison || !comparison.hasEnoughData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Peer Comparison
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {comparison?.message ||
            "Complete at least 3 quizzes to see how you compare!"}
        </p>
      </div>
    );
  }

  const getPerformanceLevel = (percentile) => {
    if (percentile >= 90)
      return {
        label: "Top Performer",
        color: "from-green-500 to-emerald-500",
        bg: "bg-green-50 dark:bg-green-900/20",
      };
    if (percentile >= 75)
      return {
        label: "Excellent",
        color: "from-blue-500 to-cyan-500",
        bg: "bg-blue-50 dark:bg-blue-900/20",
      };
    if (percentile >= 50)
      return {
        label: "Above Average",
        color: "from-purple-500 to-pink-500",
        bg: "bg-purple-50 dark:bg-purple-900/20",
      };
    return {
      label: "Keep Going",
      color: "from-orange-500 to-yellow-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    };
  };

  const level = getPerformanceLevel(comparison.percentile);

  return (
    <div
      className={`${level.bg} rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 bg-gradient-to-br ${level.color} rounded-xl`}>
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Peer Comparison
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {comparison.totalUsers} students analyzed
          </p>
        </div>
      </div>

      {/* Percentile Circle */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 mb-3">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={351.68}
              strokeDashoffset={351.68 - (comparison.percentile / 100) * 351.68}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  className="text-purple-500"
                  stopColor="currentColor"
                />
                <stop
                  offset="100%"
                  className="text-pink-500"
                  stopColor="currentColor"
                />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {Math.round(comparison.percentile)}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              percentile
            </span>
          </div>
        </div>
        <div
          className={`px-4 py-2 bg-gradient-to-r ${level.color} text-white rounded-full font-semibold`}
        >
          {level.label}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Your Average
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(comparison.userAvgScore)}%
          </p>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Global Average
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(comparison.globalAverage)}%
          </p>
        </div>
      </div>

      {comparison.message && (
        <div className="mt-4 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
            {comparison.message}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Simple Learning Patterns Card
 */
export function LearningPatternsCard({ patterns }) {
  console.log("📈 LearningPatternsCard received:", patterns);

  if (!patterns) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Learning Patterns
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Not enough data yet to analyze patterns.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 shadow-lg border border-indigo-100 dark:border-indigo-800/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Learning Patterns
        </h3>
      </div>

      <div className="space-y-4">
        {/* Strengths */}
        {patterns.strengths && patterns.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-500" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Strengths
              </h4>
            </div>
            <div className="space-y-1">
              {patterns.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {strength.category}
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {strength.avgScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {patterns.weaknesses && patterns.weaknesses.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Areas to Improve
              </h4>
            </div>
            <div className="space-y-1">
              {patterns.weaknesses.map((weakness, index) => (
                <div
                  key={index}
                  className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {weakness.category}
                  </span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {weakness.avgScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Time */}
        {patterns.bestTimeToStudy && (
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Best Study Time
              </p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {patterns.bestTimeToStudy.label}
              </p>
            </div>
          </div>
        )}

        {/* Best Day */}
        {patterns.bestDay && (
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Best Study Day
              </p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {patterns.bestDay.day}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default { AIInsightsCard, PeerComparisonCard, LearningPatternsCard };
