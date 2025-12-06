import React from "react";
import { motion } from "framer-motion";
import { Card } from "./ui/Card";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Zap,
  Award,
  BookOpen,
  BarChart3,
  Calendar,
  Sun,
  Moon,
  Sunrise,
} from "lucide-react";

/**
 * Enhanced Stats Grid Component
 * Displays detailed learning statistics with beautiful visualizations
 */
export function EnhancedStatsGrid({ analytics, patterns }) {
  if (!analytics?.overall) {
    return null;
  }

  const overall = analytics.overall;
  const accuracy = overall.totalQuestions
    ? Math.round((overall.totalCorrect / overall.totalQuestions) * 100)
    : 0;

  // Format time nicely
  const formatTime = (ms) => {
    if (!ms) return "0s";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const stats = [
    {
      icon: BookOpen,
      label: "Total Quizzes",
      value: overall.totalQuizzes || 0,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Target,
      label: "Average Score",
      value: `${Math.round(overall.averageScore || 0)}%`,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      trend: patterns?.improvementRate,
    },
    {
      icon: Zap,
      label: "Accuracy",
      value: `${accuracy}%`,
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      icon: Award,
      label: "Best Score",
      value: `${overall.bestScore || 0}%`,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: BarChart3,
      label: "Questions Answered",
      value: overall.totalQuestions || 0,
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
    },
    {
      icon: Clock,
      label: "Avg Time/Question",
      value: formatTime(overall.averageTimePerQuestion),
      color: "from-rose-500 to-red-600",
      bgColor: "bg-rose-50 dark:bg-rose-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className={`p-4 ${stat.bgColor} border-0 relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
            <div className="relative z-10">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} mb-2`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                {stat.trend !== undefined && stat.trend !== 0 && (
                  <span
                    className={`flex items-center text-xs font-semibold ${
                      stat.trend > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {Math.abs(stat.trend)}%
                  </span>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Category Performance Component
 * Shows performance breakdown by quiz category
 */
export function CategoryPerformance({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Category Performance
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Take more quizzes to see category breakdown
        </p>
      </Card>
    );
  }

  const getColorClass = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📊 Category Performance
      </h3>
      <div className="space-y-4">
        {categories.slice(0, 6).map((cat, index) => (
          <motion.div
            key={cat._id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {cat._id || "General"}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {Math.round(cat.avgScore)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getColorClass(cat.avgScore)}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(cat.avgScore)}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {cat.count} quiz{cat.count > 1 ? "zes" : ""} • Best: {cat.bestScore}%
            </p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Learning Patterns Component
 * Shows when and how the student learns best
 */
export function LearningPatterns({ patterns }) {
  if (!patterns) {
    return null;
  }

  const getTimeIcon = (hour) => {
    if (hour >= 5 && hour < 12) return Sunrise;
    if (hour >= 12 && hour < 18) return Sun;
    return Moon;
  };

  const getSpeedMessage = (type) => {
    switch (type) {
      case "rushing":
        return { text: "You tend to rush through questions", color: "text-orange-600", emoji: "⚡" };
      case "thorough":
        return { text: "You take time to think carefully", color: "text-blue-600", emoji: "🎯" };
      case "efficient":
        return { text: "Perfect balance of speed & accuracy", color: "text-green-600", emoji: "🚀" };
      default:
        return { text: "Balanced approach", color: "text-purple-600", emoji: "⚖️" };
    }
  };

  const speedInfo = getSpeedMessage(patterns.speedVsAccuracy);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🧠 Learning Patterns
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Best Study Time */}
        {patterns.bestTimeToStudy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              {React.createElement(getTimeIcon(patterns.bestTimeToStudy.hour), {
                className: "w-5 h-5 text-orange-500",
              })}
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                BEST TIME
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {patterns.bestTimeToStudy.label}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Avg score: {patterns.bestTimeToStudy.avgScore}%
            </p>
          </motion.div>
        )}

        {/* Best Day */}
        {patterns.bestDay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                BEST DAY
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {patterns.bestDay.day}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Avg score: {patterns.bestDay.avgScore}%
            </p>
          </motion.div>
        )}

        {/* Study Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              STUDY STYLE
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {speedInfo.emoji} {patterns.speedVsAccuracy}
          </p>
          <p className={`text-xs ${speedInfo.color} mt-1`}>{speedInfo.text}</p>
        </motion.div>

        {/* Consistency */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-500" />
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              CONSISTENCY
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {patterns.consistency}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Study regularity
          </p>
        </motion.div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {patterns.strengths.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
              💪 Strengths
            </h4>
            <div className="space-y-1">
              {patterns.strengths.map((s, i) => (
                <p key={i} className="text-xs text-gray-700 dark:text-gray-300">
                  • {s.category} ({s.avgScore}%)
                </p>
              ))}
            </div>
          </div>
        )}
        {patterns.weaknesses.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2">
              🎯 Focus Areas
            </h4>
            <div className="space-y-1">
              {patterns.weaknesses.map((w, i) => (
                <p key={i} className="text-xs text-gray-700 dark:text-gray-300">
                  • {w.category} ({w.avgScore}%)
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default { EnhancedStatsGrid, CategoryPerformance, LearningPatterns };
