import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Flame,
  Trophy,
  Target,
  Crown,
  Star,
  TrendingUp,
  Award,
  Sparkles,
  Gift,
  Medal,
  Users,
  ChevronRight,
  Lock,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { useGamification } from "../../context/GamificationContext";
import { Link } from "react-router-dom";

// Animated counter component for smooth number transitions
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const startValue = displayValue;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(
        Math.floor(startValue + (value - startValue) * easeOutQuart)
      );

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

// XP Gain floating animation
const XPGainNotification = ({ amount, onComplete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.5 }}
    animate={{ opacity: 1, y: -30, scale: 1 }}
    exit={{ opacity: 0, y: -60, scale: 0.8 }}
    onAnimationComplete={onComplete}
    className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-bold shadow-lg z-50 flex items-center gap-1"
  >
    <Sparkles className="w-4 h-4" />+{amount} XP
  </motion.div>
);

// Level up celebration modal
const LevelUpCelebration = ({ level, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ type: "spring", damping: 15 }}
      className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: 3 }}
      >
        <Crown className="w-20 h-20 text-yellow-300 mx-auto mb-4" />
      </motion.div>
      <h2 className="text-3xl font-black text-white mb-2">LEVEL UP!</h2>
      <motion.p
        className="text-6xl font-black text-yellow-300 mb-4"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {level}
      </motion.p>
      <p className="text-white/80 text-lg">Congratulations! Keep learning!</p>
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            initial={{
              left: "50%",
              top: "50%",
            }}
            animate={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: [1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.05,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  </motion.div>
);

// Daily Challenge Card
const DailyChallenge = ({ challenge, progress, completed }) => (
  <motion.div
    className={`p-3 rounded-xl border ${
      completed
        ? "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200/60 dark:border-emerald-700/40"
        : "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/60 dark:border-amber-700/40"
    }`}
    whileHover={{ scale: 1.01 }}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        {completed ? (
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        ) : (
          <Target className="w-5 h-5 text-amber-500" />
        )}
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {challenge.title}
        </span>
      </div>
      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded-full">
        <Zap className="w-3 h-3 text-amber-600" />
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
          +{challenge.xpReward}
        </span>
      </div>
    </div>
    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${
          completed
            ? "bg-gradient-to-r from-emerald-500 to-green-500"
            : "bg-gradient-to-r from-amber-500 to-orange-500"
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
      {progress}% complete • {challenge.description}
    </p>
  </motion.div>
);

// Achievement Badge Component
const AchievementBadge = ({ achievement, unlocked, progress = 0 }) => {
  const rarityColors = {
    common: "from-gray-400 to-gray-500",
    uncommon: "from-green-400 to-emerald-500",
    rare: "from-blue-400 to-indigo-500",
    epic: "from-purple-400 to-pink-500",
    legendary: "from-yellow-400 to-orange-500",
  };

  const bgColor = rarityColors[achievement?.rarity] || rarityColors.common;

  return (
    <motion.div
      className={`relative p-3 rounded-xl ${
        unlocked
          ? "bg-white dark:bg-gray-700/50"
          : "bg-gray-100 dark:bg-gray-800/50"
      } border border-gray-200/60 dark:border-gray-700/60`}
      whileHover={{ scale: unlocked ? 1.05 : 1, y: unlocked ? -2 : 0 }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg ${
            unlocked
              ? `bg-gradient-to-br ${bgColor}`
              : "bg-gray-300 dark:bg-gray-600"
          } flex items-center justify-center shadow-md`}
        >
          {unlocked ? (
            <span className="text-lg">{achievement?.icon || "🏆"}</span>
          ) : (
            <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold ${
              unlocked
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            } truncate`}
          >
            {achievement?.name || "Achievement"}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
            {achievement?.description || "Complete to unlock"}
          </p>
          {!unlocked && progress > 0 && (
            <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
      {unlocked && (
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <CheckCircle className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Leaderboard Preview
const LeaderboardPreview = ({ leaderboard, currentUserId }) => {
  const topThree = leaderboard.slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-2">
      {topThree.map((entry, index) => (
        <motion.div
          key={entry.userId || index}
          className={`flex items-center gap-3 p-2.5 rounded-xl ${
            entry.userId === currentUserId
              ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200/60 dark:border-indigo-700/40"
              : "bg-gray-50 dark:bg-gray-700/50"
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <span className="text-lg">{medals[index]}</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            {entry.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {entry.name || "Anonymous"}
              {entry.userId === currentUserId && (
                <span className="ml-1 text-xs text-indigo-500">(You)</span>
              )}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Level {entry.level || 1}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {entry.totalPoints?.toLocaleString() || 0}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">XP</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Main RealTimeStats Component
export const RealTimeStats = ({ variant = "full", className = "" }) => {
  const {
    userStats,
    currentLevel,
    totalXP,
    currentStreak,
    unlockedCount,
    totalAchievements,
    getLevelProgress,
    loading,
    xpAnimation,
    achievements,
    userAchievements,
    leaderboard,
  } = useGamification();

  const [showXPGain, setShowXPGain] = useState(false);
  const [lastXPGain, setLastXPGain] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const levelProgress = getLevelProgress();

  // Handle XP animation from context
  useEffect(() => {
    if (xpAnimation?.amount) {
      setLastXPGain(xpAnimation.amount);
      setShowXPGain(true);

      if (xpAnimation.levelUp) {
        setTimeout(() => setShowLevelUp(true), 500);
      }
    }
  }, [xpAnimation]);

  // Real-time reset timer calculation
  const [resetTimer, setResetTimer] = useState("");

  useEffect(() => {
    const updateResetTimer = () => {
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      const diff = tomorrow - now;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setResetTimer(`${hours}h ${minutes}m`);
    };

    updateResetTimer();
    const interval = setInterval(updateResetTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Daily challenges based on actual user stats
  const dailyChallenges = [
    {
      id: 1,
      title: "Complete 3 Quizzes",
      description: "Take any 3 quizzes total",
      xpReward: 50,
      target: 3,
    },
    {
      id: 2,
      title: "Reach 80% Average",
      description: "Achieve 80% or higher average score",
      xpReward: 30,
      target: 80,
    },
  ];

  // Calculate challenge progress based on user stats
  const getChallengeProgress = (challenge) => {
    if (!userStats) return 0;

    if (challenge.id === 1) {
      // Use total quizzes taken
      const quizzesTaken = userStats.totalQuizzesTaken || 0;
      const progress = Math.min(quizzesTaken, challenge.target);
      return Math.round((progress / challenge.target) * 100);
    }
    if (challenge.id === 2) {
      // Use average score
      const avgScore = userStats.averageScore || 0;
      return Math.min(Math.round((avgScore / challenge.target) * 100), 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!userStats && !loading) {
    return null;
  }

  // Compact variant for navbar
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <motion.div
          className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full shadow-lg"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Crown className="w-4 h-4 text-yellow-300" />
          <span className="text-white text-sm font-bold">
            Lv.
            <AnimatedCounter value={currentLevel} />
          </span>
          <AnimatePresence>
            {showXPGain && (
              <XPGainNotification
                amount={lastXPGain}
                onComplete={() => setShowXPGain(false)}
              />
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </motion.div>
          <span className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            <AnimatedCounter value={totalXP} /> XP
          </span>
        </motion.div>

        {currentStreak > 0 && (
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              animate={{ y: [-1, 1, -1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Flame className="w-4 h-4 text-orange-500" />
            </motion.div>
            <span className="text-sm font-bold text-orange-500">
              {currentStreak}
            </span>
          </motion.div>
        )}
      </div>
    );
  }

  // Mini variant for sidebars
  if (variant === "mini") {
    return (
      <motion.div
        className={`p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 ${className}`}
        whileHover={{ y: -2, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      >
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
            whileHover={{ rotate: 5, scale: 1.05 }}
          >
            <span className="text-white font-black text-xl">
              {currentLevel}
            </span>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 -z-10" />
          </motion.div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Level
            </p>
            <p className="font-black text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              <AnimatedCounter value={totalXP} /> XP
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {levelProgress.current} / {levelProgress.next} XP
            </p>
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {Math.round(levelProgress.percentage)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-800/30"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              animate={{ y: [-1, 1, -1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Flame className="w-6 h-6 text-orange-500 mx-auto" />
            </motion.div>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {currentStreak}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Day Streak
            </p>
          </motion.div>
          <motion.div
            className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/30"
            whileHover={{ scale: 1.02 }}
          >
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto" />
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {unlockedCount}
              <span className="text-sm text-gray-400">
                /{totalAchievements}
              </span>
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Achievements
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Full variant - comprehensive gamification hub
  return (
    <div className={className}>
      {/* Level Up Celebration Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <LevelUpCelebration
            level={currentLevel}
            onClose={() => setShowLevelUp(false)}
          />
        )}
      </AnimatePresence>

      {/* Header with Level & XP */}
      <div className="relative mb-6">
        <div className="flex items-center gap-4">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring" }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">
                {currentLevel}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-40 -z-10" />

            {/* Crown for high levels */}
            {currentLevel >= 5 && (
              <motion.div
                className="absolute -top-3 -right-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
              </motion.div>
            )}
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Level {currentLevel}
              </h3>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
                <Zap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <AnimatedCounter value={totalXP} /> XP
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress.percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                  />
                </motion.div>
              </div>
              <AnimatePresence>
                {showXPGain && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-1 right-0 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full"
                  >
                    +{lastXPGain}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {levelProgress.current} / {levelProgress.next} XP to Level{" "}
                {currentLevel + 1}
              </p>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                {Math.round(levelProgress.percentage)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <motion.div
          className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/40"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <motion.div
            animate={{ y: [-1, 1, -1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Flame className="w-5 h-5 text-orange-500 mx-auto" />
          </motion.div>
          <p className="text-xl font-black text-gray-900 dark:text-white mt-1">
            {currentStreak}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            Streak
          </p>
        </motion.div>

        <motion.div
          className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-700/40"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Trophy className="w-5 h-5 text-yellow-500 mx-auto" />
          <p className="text-xl font-black text-gray-900 dark:text-white mt-1">
            {userStats?.achievementsUnlocked ?? unlockedCount}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            Badges
          </p>
        </motion.div>

        <motion.div
          className="text-center p-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/40"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto" />
          <p className="text-xl font-black text-gray-900 dark:text-white mt-1">
            {userStats?.averageScore?.toFixed(0) || 0}%
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            Avg
          </p>
        </motion.div>

        <motion.div
          className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/40"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Target className="w-5 h-5 text-blue-500 mx-auto" />
          <p className="text-xl font-black text-gray-900 dark:text-white mt-1">
            {userStats?.totalQuizzesTaken || 0}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            Quizzes
          </p>
        </motion.div>
      </div>

      {/* Daily Challenges Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Daily Challenges
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Resets in {resetTimer}
          </span>
        </div>
        <div className="space-y-2">
          {dailyChallenges.map((challenge) => {
            const progress = getChallengeProgress(challenge);
            return (
              <DailyChallenge
                key={challenge.id}
                challenge={challenge}
                progress={progress}
                completed={progress >= 100}
              />
            );
          })}
        </div>
      </div>

      {/* Recent Achievements */}
      {userAchievements && userAchievements.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Recent Achievements
            </h4>
            <Link
              to="/achievements"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {userAchievements.slice(0, 4).map((ua, index) => (
              <AchievementBadge
                key={ua.achievement?._id || index}
                achievement={
                  ua.achievement || {
                    name: "Achievement",
                    description: "Unlocked!",
                  }
                }
                unlocked={true}
                progress={100}
              />
            ))}
            {/* Show locked achievements if less than 4 unlocked */}
            {achievements &&
              userAchievements.length < 4 &&
              achievements
                .filter(
                  (a) =>
                    !userAchievements.some(
                      (ua) => (ua.achievement?._id || ua._id) === a._id
                    )
                )
                .slice(0, 4 - userAchievements.length)
                .map((achievement, index) => (
                  <AchievementBadge
                    key={achievement._id || index}
                    achievement={achievement}
                    unlocked={false}
                    progress={0}
                  />
                ))}
          </div>
        </div>
      )}

      {/* Leaderboard Preview - Only show if there's valid data with real users */}
      {leaderboard &&
        leaderboard.length > 0 &&
        leaderboard.some(
          (entry) =>
            entry.name && entry.name !== "Anonymous" && entry.totalPoints > 0
        ) && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Leaderboard
              </h4>
              <Link
                to="/leaderboard"
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
              >
                Full Rankings <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <LeaderboardPreview
              leaderboard={leaderboard}
              currentUserId={userStats?.userId}
            />
          </div>
        )}
    </div>
  );
};

export default RealTimeStats;
