import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Flame,
  TrendingUp,
  Zap,
  Award,
  Target,
  Crown,
  Sparkles,
  ChevronUp,
} from "lucide-react";
import { useGamification } from "../../context/GamificationContext";

/**
 * Animated Counter Component
 */
const AnimatedCounter = ({ value, duration = 1 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousRef = useRef(0);

  useEffect(() => {
    const previous = previousRef.current;
    const diff = value - previous;
    
    if (diff === 0) return;

    const steps = Math.min(Math.abs(diff), 30);
    const increment = diff / steps;
    let current = previous;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      setDisplayValue(Math.round(current));

      if (step >= steps) {
        setDisplayValue(value);
        previousRef.current = value;
        clearInterval(interval);
      }
    }, (duration * 1000) / steps);

    return () => clearInterval(interval);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

/**
 * RealTimeStats
 * Displays user's gamification stats with real-time updates and animations
 */
const RealTimeStats = ({ variant = "full", className = "", showDetailed = false }) => {
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
  } = useGamification();

  const [showXPGain, setShowXPGain] = useState(false);
  const [lastXPGain, setLastXPGain] = useState(0);
  const levelProgress = getLevelProgress();

  // Show XP gain animation
  useEffect(() => {
    if (xpAnimation?.amount) {
      setLastXPGain(xpAnimation.amount);
      setShowXPGain(true);
      const timer = setTimeout(() => setShowXPGain(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [xpAnimation]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl" />
      </div>
    );
  }

  if (!userStats) return null;

  // Compact variant for navbar/header
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Level Badge with animation */}
        <motion.div
          className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)" }}
          whileTap={{ scale: 0.95 }}
        >
          <Crown className="w-4 h-4 text-yellow-300" />
          <span className="text-white text-sm font-bold">Lv.<AnimatedCounter value={currentLevel} /></span>
          
          {/* XP gain indicator */}
          <AnimatePresence>
            {showXPGain && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -20, scale: 1 }}
                exit={{ opacity: 0, y: -30 }}
                className="absolute -top-2 right-0 px-2 py-0.5 bg-green-500 rounded-full text-white text-xs font-bold"
              >
                +{lastXPGain}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* XP with sparkle */}
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

        {/* Streak with fire animation */}
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
            <span className="text-sm font-bold text-orange-500">{currentStreak}</span>
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
            <span className="text-white font-black text-xl">{currentLevel}</span>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 -z-10" />
          </motion.div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Level</p>
            <p className="font-black text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              <AnimatedCounter value={totalXP} /> XP
            </p>
          </div>
          
          {/* XP gain indicator */}
          <AnimatePresence>
            {showXPGain && (
              <motion.div
                initial={{ opacity: 0, scale: 0, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0, y: -10 }}
                className="ml-auto px-3 py-1 bg-green-500 rounded-full text-white text-sm font-bold shadow-lg"
              >
                +{lastXPGain} ⚡
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Level progress bar */}
        <div className="mb-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Shimmer effect */}
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
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{currentStreak}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Day Streak</p>
          </motion.div>
          <motion.div 
            className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/30"
            whileHover={{ scale: 1.02 }}
          >
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto" />
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {unlockedCount}<span className="text-sm text-gray-400">/{totalAchievements}</span>
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Achievements</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Full variant - detailed stats
  return (
    <motion.div 
      className={`relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative p-6">
        {/* Header with Level */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-5">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {/* Level badge */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-black text-3xl">{currentLevel}</span>
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 -z-10" />
              </div>
              
              {/* Level ring */}
              <svg className="absolute -inset-2 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-gray-200 dark:text-gray-700"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="44"
                  fill="none"
                  stroke="url(#levelGradientFull)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${levelProgress.percentage * 2.76} 276`}
                  transform="rotate(-90 48 48)"
                  initial={{ strokeDasharray: "0 276" }}
                  animate={{ strokeDasharray: `${levelProgress.percentage * 2.76} 276` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="levelGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Crown for high levels */}
              {currentLevel >= 10 && (
                <motion.div
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                </motion.div>
              )}
            </motion.div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Level {currentLevel}
                </h3>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  <AnimatedCounter value={levelProgress.current} />
                </span> / {levelProgress.next} XP to next level
              </p>
              
              {/* XP gain indicator */}
              <AnimatePresence>
                {showXPGain && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 rounded-full text-white text-sm font-bold shadow-lg"
                  >
                    <ChevronUp className="w-4 h-4" />
                    +{lastXPGain} XP
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Streak */}
          <AnimatePresence>
            {currentStreak > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 20 }}
                className="text-center"
              >
                <motion.div
                  className="relative flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-lg"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Fire glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl blur-lg opacity-50 -z-10" />
                  <motion.div
                    animate={{ y: [-2, 2, -2], rotate: [-5, 5, -5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Flame className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className="text-white font-black text-2xl">{currentStreak}</span>
                </motion.div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">🔥 Day Streak</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-600 dark:text-gray-400">Experience Progress</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {Math.round(levelProgress.percentage)}%
            </span>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem
            icon={<Zap className="w-5 h-5" />}
            label="Total XP"
            value={<AnimatedCounter value={totalXP} />}
            color="blue"
          />
          <StatItem
            icon={<Trophy className="w-5 h-5" />}
            label="Achievements"
            value={`${unlockedCount}/${totalAchievements}`}
            color="yellow"
          />
          <StatItem
            icon={<Target className="w-5 h-5" />}
            label="Quizzes"
            value={userStats?.totalQuizzesTaken || 0}
            color="green"
          />
          <StatItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="Avg Score"
            value={`${Math.round(userStats?.averageScore || 0)}%`}
            color="purple"
          />
        </div>
      </div>
    </motion.div>
  );
};

const StatItem = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30",
    yellow: "bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-800/30",
    green: "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400 border-green-200/50 dark:border-green-800/30",
    purple: "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/30",
    orange: "bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/30",
  };

  const bgClasses = {
    blue: "bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20",
    yellow: "bg-gradient-to-br from-gray-50 to-yellow-50/50 dark:from-gray-800/50 dark:to-yellow-900/20",
    green: "bg-gradient-to-br from-gray-50 to-green-50/50 dark:from-gray-800/50 dark:to-green-900/20",
    purple: "bg-gradient-to-br from-gray-50 to-purple-50/50 dark:from-gray-800/50 dark:to-purple-900/20",
    orange: "bg-gradient-to-br from-gray-50 to-orange-50/50 dark:from-gray-800/50 dark:to-orange-900/20",
  };

  return (
    <motion.div
      className={`p-4 ${bgClasses[color]} rounded-xl border border-gray-200/50 dark:border-gray-700/50`}
      whileHover={{ scale: 1.03, y: -3 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 border ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    </motion.div>
  );
};

export default RealTimeStats;
