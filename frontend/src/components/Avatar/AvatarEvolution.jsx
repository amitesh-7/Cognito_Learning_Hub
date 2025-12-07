import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Zap,
  TrendingUp,
  Gift,
  Lock,
  Unlock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAvatar } from "../../context/AvatarContext";
import LearningAvatar from "./LearningAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import Progress from "../ui/Progress";
import Badge from "../ui/Badge";

/**
 * Avatar Evolution Dashboard
 * Shows avatar progression, unlocks, and milestones
 */
const AvatarEvolution = () => {
  const { avatar } = useAvatar();
  const [activeTab, setActiveTab] = useState("progress");
  const [milestones, setMilestones] = useState({ achieved: [], upcoming: [] });

  const evolution = avatar?.evolution || {};
  const level = evolution.currentLevel || 1;
  const stage = evolution.evolutionStage || "novice";
  const exp = evolution.experiencePoints || 0;
  const expToNext = evolution.experienceToNextLevel || 100;
  const progressPercent = Math.round((exp / expToNext) * 100);

  // Evolution stages with requirements
  const stages = [
    { name: "novice", displayName: "Novice", level: 1, icon: "🌱", color: "#9CA3AF" },
    { name: "learner", displayName: "Learner", level: 5, icon: "📚", color: "#10B981" },
    { name: "scholar", displayName: "Scholar", level: 15, icon: "🎓", color: "#3B82F6" },
    { name: "expert", displayName: "Expert", level: 30, icon: "⭐", color: "#8B5CF6" },
    { name: "master", displayName: "Master", level: 50, icon: "👑", color: "#F59E0B" },
    { name: "legend", displayName: "Legend", level: 75, icon: "🏆", color: "#EF4444" },
  ];

  // Get current and next stage info
  const currentStageInfo = stages.find((s) => s.name === stage) || stages[0];
  const currentStageIndex = stages.findIndex((s) => s.name === stage);
  const nextStageInfo = stages[currentStageIndex + 1];

  // Recent unlocks
  const recentUnlocks = (evolution.unlockedItems || [])
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
    .slice(0, 5);

  // Stats
  const stats = {
    totalQuestions: evolution.totalQuestionsAnswered || 0,
    correctAnswers: evolution.totalCorrectAnswers || 0,
    quizzesTaken: evolution.totalQuizzesTaken || 0,
    perfectScores: evolution.totalPerfectScores || 0,
    longestStreak: evolution.longestStreak || 0,
    studyTime: evolution.totalStudyTime || 0,
    accuracy: evolution.totalQuestionsAnswered > 0
      ? Math.round((evolution.totalCorrectAnswers / evolution.totalQuestionsAnswered) * 100)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Evolution Overview */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <LearningAvatar size="large" showName={false} showLevel={false} />
            </div>

            {/* Evolution Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{currentStageInfo.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold">{avatar?.name || "My Avatar"}</h2>
                  <p className="text-indigo-100">
                    Level {level} {currentStageInfo.displayName}
                  </p>
                </div>
              </div>

              {/* XP Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Level Progress</span>
                  <span>
                    {exp} / {expToNext} XP
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <motion.div
                    className="bg-white h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Next Stage */}
              {nextStageInfo && (
                <div className="mt-3 flex items-center gap-2 text-sm text-indigo-100">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    {nextStageInfo.level - level} levels until {nextStageInfo.displayName}{" "}
                    {nextStageInfo.icon}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stage Progress Bar */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            {stages.map((s, index) => {
              const isAchieved = level >= s.level;
              const isCurrent = s.name === stage;
              
              return (
                <React.Fragment key={s.name}>
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        isAchieved
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      } ${isCurrent ? "ring-4 ring-indigo-300 ring-offset-2" : ""}`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {s.icon}
                    </motion.div>
                    <span
                      className={`text-xs mt-1 ${
                        isAchieved
                          ? "text-indigo-600 dark:text-indigo-400 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {s.displayName}
                    </span>
                    <span className="text-xs text-gray-400">Lv.{s.level}</span>
                  </div>
                  
                  {index < stages.length - 1 && (
                    <div className="flex-1 mx-2">
                      <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded">
                        <motion.div
                          className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded"
                          initial={{ width: 0 }}
                          animate={{
                            width: level >= stages[index + 1].level
                              ? "100%"
                              : level > s.level
                              ? `${((level - s.level) / (stages[index + 1].level - s.level)) * 100}%`
                              : "0%",
                          }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Stats & Recent Unlocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Your Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <StatItem
                icon={<Zap className="w-4 h-4 text-blue-500" />}
                label="Questions Answered"
                value={stats.totalQuestions}
              />
              <StatItem
                icon={<Star className="w-4 h-4 text-yellow-500" />}
                label="Accuracy"
                value={`${stats.accuracy}%`}
              />
              <StatItem
                icon={<Trophy className="w-4 h-4 text-purple-500" />}
                label="Quizzes Completed"
                value={stats.quizzesTaken}
              />
              <StatItem
                icon={<Sparkles className="w-4 h-4 text-pink-500" />}
                label="Perfect Scores"
                value={stats.perfectScores}
              />
              <StatItem
                icon={<TrendingUp className="w-4 h-4 text-green-500" />}
                label="Longest Streak"
                value={`${stats.longestStreak} days`}
              />
              <StatItem
                icon={<Star className="w-4 h-4 text-indigo-500" />}
                label="Study Time"
                value={`${Math.round(stats.studyTime / 60)}h ${stats.studyTime % 60}m`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Unlocks Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-500" />
              Recent Unlocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentUnlocks.length > 0 ? (
              <div className="space-y-3">
                {recentUnlocks.map((item, index) => (
                  <motion.div
                    key={item.itemId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <Unlock className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                        {formatItemName(item.itemId)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(item.unlockedAt)}
                      </p>
                    </div>
                    <Badge variant="success" className="text-xs">
                      {item.itemType}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Lock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No items unlocked yet</p>
                <p className="text-sm">Complete quizzes to unlock rewards!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getMilestones(stats).map((milestone, index) => (
              <MilestoneCard key={milestone.id} milestone={milestone} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper Components
const StatItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
    {icon}
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-bold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  </div>
);

const MilestoneCard = ({ milestone, index }) => {
  const isAchieved = milestone.progress >= 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 rounded-lg border-2 ${
        isAchieved
          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{milestone.icon}</span>
        {isAchieved && (
          <Badge variant="success" className="text-xs">
            Completed
          </Badge>
        )}
      </div>
      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
        {milestone.name}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {milestone.description}
      </p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${
            isAchieved
              ? "bg-green-500"
              : "bg-gradient-to-r from-indigo-500 to-purple-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(milestone.progress, 100)}%` }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-right">
        {Math.round(milestone.progress)}%
      </p>
    </motion.div>
  );
};

// Helper functions
function formatItemName(itemId) {
  return itemId
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getMilestones(stats) {
  return [
    {
      id: "first_quiz",
      name: "First Steps",
      description: "Complete your first quiz",
      icon: "🚀",
      progress: Math.min(stats.quizzesTaken * 100, 100),
    },
    {
      id: "quiz_enthusiast",
      name: "Quiz Enthusiast",
      description: "Complete 10 quizzes",
      icon: "📚",
      progress: (stats.quizzesTaken / 10) * 100,
    },
    {
      id: "quiz_master",
      name: "Quiz Master",
      description: "Complete 50 quizzes",
      icon: "🎯",
      progress: (stats.quizzesTaken / 50) * 100,
    },
    {
      id: "perfect_score",
      name: "Perfectionist",
      description: "Get 5 perfect scores",
      icon: "💯",
      progress: (stats.perfectScores / 5) * 100,
    },
    {
      id: "century",
      name: "Century",
      description: "Answer 100 questions",
      icon: "💪",
      progress: (stats.totalQuestions / 100) * 100,
    },
    {
      id: "streak_week",
      name: "Week Warrior",
      description: "Achieve a 7-day streak",
      icon: "🔥",
      progress: (stats.longestStreak / 7) * 100,
    },
  ];
}

export default AvatarEvolution;
