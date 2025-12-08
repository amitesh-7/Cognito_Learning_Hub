import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";
import { Link, Navigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  Award,
  CheckCircle,
  Target,
  ClipboardList,
  TrendingUp,
  Calendar,
  Flame,
  AlertTriangle,
  BookOpen,
  Clock,
  User,
  Eye,
  EyeOff,
  Video,
  Zap,
  Trophy,
  ArrowLeft,
  Sparkles,
  Brain,
} from "lucide-react";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "../components/ui/PullToRefreshIndicator";
import { useHaptic } from "../hooks/useHaptic";
import {
  EnhancedStatsGrid,
  CategoryPerformance,
  LearningPatterns,
} from "../components/EnhancedStats";
import {
  AIInsightsCard,
  PeerComparisonCard,
  WeeklyActivityCard,
} from "../components/AIInsights";
import { RealTimeStats } from "../components/Gamification";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const {
    userStats,
    currentLevel,
    totalXP,
    currentStreak: gamificationStreak,
    userAchievements,
  } = useGamification();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [viewMode, setViewMode] = useState("overview"); // 'overview', 'detailed', 'insights'
  const { success } = useHaptic();

  // AI Insights state
  const [aiInsights, setAiInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Redirect teachers to teacher dashboard (only after auth is loaded)
  if (!authLoading && user?.role === "Teacher") {
    return <Navigate to="/teacher-dashboard" replace />;
  }

  // Fetch AI-powered personalized insights
  const fetchAIInsights = async (forceRefresh = false) => {
    try {
      setInsightsLoading(true);
      const token = localStorage.getItem("quizwise-token");
      const endpoint = forceRefresh
        ? `${import.meta.env.VITE_API_URL}/api/analytics/user/${
            user?._id
          }/refresh-insights`
        : `${import.meta.env.VITE_API_URL}/api/analytics/user/${
            user?._id
          }/insights`;

      const response = await fetch(endpoint, {
        method: forceRefresh ? "POST" : "GET",
        headers: { "x-auth-token": token },
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.data?.insights || data.insights);
      }
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/results/my-results`,
        {
          headers: { "x-auth-token": token },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch your results.");
      const data = await response.json();
      setResults(data);

      // Calculate streak (consecutive days with quiz attempts)
      const sortedResults = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < sortedResults.length; i++) {
        const resultDate = new Date(sortedResults[i].createdAt);
        resultDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor(
          (currentDate - resultDate) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === streak) {
          streak++;
          currentDate = new Date(resultDate);
        } else if (daysDiff > streak) {
          break;
        }
      }
      setStreakCount(streak);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    if (user?._id) {
      fetchAIInsights();
    }
  }, [user?._id]);

  // Pull-to-refresh functionality
  const handleRefresh = async () => {
    success(); // Haptic feedback on refresh
    setLoading(true);
    await fetchResults();
  };

  const { isPulling, pullDistance, isRefreshing, pullProgress } =
    usePullToRefresh({
      onRefresh: handleRefresh,
      threshold: 80,
      enabled: !loading,
    });

  // --- Calculated Stats - Use gamification stats as primary source ---
  const quizzesCompleted = userStats?.totalQuizzesTaken || results.length;
  const averageScore =
    userStats?.averageScore ||
    (results.length > 0
      ? results.reduce(
          (acc, r) => acc + (r.score / r.totalQuestions) * 100,
          0
        ) / results.length
      : 0);

  // Only show results that match gamification count (real-time data)
  const actualResultsCount = userStats?.totalQuizzesTaken || results.length;
  const trackedResults = results.slice(0, actualResultsCount);

  const totalQuestions = trackedResults.reduce(
    (acc, r) => acc + r.totalQuestions,
    0
  );
  const totalCorrect = trackedResults.reduce((acc, r) => acc + r.score, 0);
  // Use gamification points as primary source for consistency
  const totalPoints = userStats?.totalPoints || totalCorrect;
  const recentResults = trackedResults.slice(0, 5);

  // Performance categories - only count tracked quizzes
  const excellent = trackedResults.filter(
    (r) => r.score / r.totalQuestions >= 0.9
  ).length;
  const good = trackedResults.filter(
    (r) => r.score / r.totalQuestions >= 0.7 && r.score / r.totalQuestions < 0.9
  ).length;
  const needsWork = trackedResults.filter(
    (r) => r.score / r.totalQuestions < 0.7
  ).length;

  // --- Chart Data with proper dates - only tracked quizzes ---
  const chartData = trackedResults
    .slice(0, 10)
    .reverse()
    .map((r) => {
      const date = new Date(r.createdAt);
      return {
        name: `${date.getMonth() + 1}/${date.getDate()}`,
        score: parseFloat(((r.score / r.totalQuestions) * 100).toFixed(1)),
        quizTitle: r.quiz?.title || "Deleted Quiz",
        date: date.toLocaleDateString(),
      };
    });

  // Performance distribution for pie chart
  const performanceData = [
    { name: "Excellent (90%+)", value: excellent, color: "#10b981" },
    { name: "Good (70-89%)", value: good, color: "#f59e0b" },
    { name: "Needs Work (<70%)", value: needsWork, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  // --- Achievements Logic - Use gamification context for consistency ---
  const achievements = [];

  // Use gamification userAchievements if available, otherwise calculate from results
  if (userAchievements && userAchievements.length > 0) {
    // Map gamification achievements to display format
    userAchievements.slice(0, 5).forEach((ua) => {
      const ach = ua.achievement || ua;
      achievements.push({
        icon: Award, // Can map icon based on type later
        title: ach.name || "Achievement",
        description: ach.description || "Unlocked!",
        color:
          ach.rarity === "legendary"
            ? "yellow"
            : ach.rarity === "epic"
            ? "purple"
            : ach.rarity === "rare"
            ? "blue"
            : "green",
        progress: 100,
      });
    });
  } else {
    // Fallback to local calculation
    if (quizzesCompleted > 0)
      achievements.push({
        icon: Award,
        title: "First Quiz!",
        description: "You completed your first quiz.",
        color: "yellow",
        progress: 100,
      });
    if (quizzesCompleted >= 5)
      achievements.push({
        icon: Target,
        title: "Quiz Novice",
        description: "Completed 5 quizzes.",
        color: "blue",
        progress: 100,
      });
    if (quizzesCompleted >= 10)
      achievements.push({
        icon: CheckCircle,
        title: "Quiz Expert",
        description: "Completed 10 quizzes.",
        color: "green",
        progress: 100,
      });
    if (results.some((r) => r.score === r.totalQuestions))
      achievements.push({
        icon: Flame,
        title: "Perfectionist",
        description: "Achieved a perfect score!",
        color: "red",
        progress: 100,
      });
    if (streakCount >= 3)
      achievements.push({
        icon: Calendar,
        title: "Consistent Learner",
        description: `${streakCount} day learning streak!`,
        color: "purple",
        progress: 100,
      });
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Loading Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing your learning insights...
          </p>
        </motion.div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 max-w-md"
        >
          <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
            >
              Try Again
            </Button>
          </Card>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/50 relative overflow-hidden py-8">
      {/* Animated floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orbs */}
        <motion.div
          className="absolute top-10 right-[10%] w-72 h-72 bg-gradient-to-br from-violet-500/30 to-purple-600/30 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-[5%] w-80 h-80 bg-gradient-to-br from-pink-500/25 to-rose-600/25 rounded-full blur-3xl"
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        {/* Small floating particles */}
        <motion.div
          className="absolute top-1/4 right-1/3 w-4 h-4 bg-indigo-400/60 rounded-full"
          animate={{ y: [0, -100, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-2/3 left-1/3 w-3 h-3 bg-purple-400/60 rounded-full"
          animate={{ y: [0, -80, 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/2 w-2 h-2 bg-pink-400/70 rounded-full"
          animate={{ y: [0, -60, 0], opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Pull-to-refresh indicator */}
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        pullProgress={pullProgress}
        isRefreshing={isRefreshing}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
        {/* Header Section */}
        <motion.div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
            </motion.h1>
            <motion.p
              className="text-slate-600 dark:text-slate-400 font-medium mt-2 text-base sm:text-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Here's your{" "}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent font-semibold">
                learning progress
              </span>{" "}
              overview ✨
            </motion.p>
          </div>

          <div className="flex gap-3">
            <Button
              variant={viewMode === "overview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("overview")}
              className={
                viewMode === "overview"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  : ""
              }
            >
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={viewMode === "insights" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("insights")}
              className={
                viewMode === "insights"
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  : ""
              }
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Insights
            </Button>
            <Button
              variant={viewMode === "detailed" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("detailed")}
              className={
                viewMode === "detailed"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  : ""
              }
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Detailed
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === "overview" ? (
            <motion.div
              key="overview"
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Left Column: User Profile & Quick Stats */}
              <motion.div className="space-y-5" variants={itemVariants}>
                {/* Enhanced Profile Card with Level System */}
                <Card className="text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg rounded-2xl relative overflow-hidden">
                  {/* Subtle decorative gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>

                  <div className="relative">
                    {/* Avatar with level ring */}
                    <div className="relative inline-block mb-4">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white text-3xl font-bold flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300 relative z-10">
                        {user?.name?.[0] || "U"}
                      </div>
                      {/* Level ring animation */}
                      <svg
                        className="absolute inset-0 w-full h-full -rotate-90 transform scale-125"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${
                            (Math.min(quizzesCompleted, 20) / 20) * 283
                          } 283`}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Level badge */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
                          Lv. {currentLevel || 1}
                        </div>
                      </div>
                      {(gamificationStreak || streakCount) > 0 && (
                        <Badge className="absolute -top-2 -right-2 flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg animate-pulse z-20">
                          <Flame className="w-3 h-3" />
                          {gamificationStreak || streakCount}
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {user?.name}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {user?.email}
                    </p>

                    {/* Quick Stats - Only quiz-related stats */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <motion.div
                          className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors duration-200"
                          whileHover={{ scale: 1.02 }}
                        >
                          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {quizzesCompleted}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                            Quizzes
                          </p>
                        </motion.div>
                        <motion.div
                          className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors duration-200"
                          whileHover={{ scale: 1.02 }}
                        >
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {averageScore.toFixed(0)}%
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                            Avg Score
                          </p>
                        </motion.div>
                      </div>
                      {userStats?.totalQuizzesTaken === 0 &&
                        results.length > 0 && (
                          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                              ℹ️ Showing {results.length} historical quizzes.
                              Take new quizzes to update gamification stats.
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </Card>

                {/* Gamification Hub - All gamification stats in one place */}
                <RealTimeStats
                  variant="full"
                  className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-lg rounded-2xl p-5"
                />

                {/* Learning Toolkit */}
                <Link to="/quick-actions">
                  <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/60 dark:border-amber-700/40 shadow-md hover:shadow-lg transition-all duration-200 hover:border-amber-300 dark:hover:border-amber-600 cursor-pointer group rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                            Learning Toolkit{" "}
                            <span className="text-base">🚀</span>
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Access all your learning tools
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <span className="text-xs font-medium">View All</span>
                        <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>

                {/* Quick Actions Card */}
                <Link to="/live-quiz">
                  <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/60 dark:border-purple-700/40 shadow-md hover:shadow-lg transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer group rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                            Join Live Quiz <span className="text-base">🎮</span>
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Compete in real-time
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                        <span className="text-xs font-medium">Join</span>
                        <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>

                {/* Achievements - Compact Version */}
                <Card className="p-5 bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Achievements
                    </h3>
                    {achievements.length > 4 && (
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {achievements.length} total
                      </span>
                    )}
                  </div>
                  {achievements.length > 0 ? (
                    <div className="space-y-2">
                      {achievements.slice(0, 4).map((ach, index) => {
                        const Icon = ach.icon;
                        return (
                          <motion.div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                ach.color === "yellow"
                                  ? "bg-amber-100 dark:bg-amber-900/40"
                                  : ach.color === "blue"
                                  ? "bg-blue-100 dark:bg-blue-900/40"
                                  : ach.color === "green"
                                  ? "bg-emerald-100 dark:bg-emerald-900/40"
                                  : ach.color === "red"
                                  ? "bg-rose-100 dark:bg-rose-900/40"
                                  : "bg-violet-100 dark:bg-violet-900/40"
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 ${
                                  ach.color === "yellow"
                                    ? "text-amber-600 dark:text-amber-400"
                                    : ach.color === "blue"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : ach.color === "green"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : ach.color === "red"
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-violet-600 dark:text-violet-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {ach.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {ach.description}
                              </p>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          </motion.div>
                        );
                      })}
                      {achievements.length > 4 && (
                        <Link to="/achievements" className="block">
                          <div className="text-center py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer">
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              +{achievements.length - 4} more • View All
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Complete quizzes to unlock achievements!
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Right Column: Main Content */}
              <div className="lg:col-span-2 space-y-5">
                {/* Stat Cards - Clean and Modern */}
                <motion.div
                  className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                  variants={itemVariants}
                >
                  <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-md hover:shadow-lg transition-all duration-200 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Completed
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {quizzesCompleted}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-md hover:shadow-lg transition-all duration-200 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Avg Score
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {averageScore.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-md hover:shadow-lg transition-all duration-200 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Total Points
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {totalPoints}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-md hover:shadow-lg transition-all duration-200 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center relative">
                        <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        {(gamificationStreak || streakCount) > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Streak
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {gamificationStreak || streakCount} 🔥
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* Score Progression Chart */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-md rounded-2xl p-5">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        Score Progression
                      </h3>
                      {chartData.length > 0 ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={chartData}
                              margin={{
                                top: 5,
                                right: 20,
                                left: -10,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(128, 128, 128, 0.2)"
                              />
                              <XAxis
                                dataKey="name"
                                tick={{ fill: "#9ca3af", fontSize: 12 }}
                              />
                              <YAxis
                                tick={{ fill: "#9ca3af", fontSize: 12 }}
                                unit="%"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1f2937",
                                  border: "1px solid #4b5563",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                }}
                                labelStyle={{ color: "#d1d5db" }}
                                formatter={(value, name, props) => [
                                  `${value}%`,
                                  props.payload.quizTitle,
                                ]}
                              />
                              <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#4f46e5" }}
                                activeDot={{ r: 6, fill: "#6366f1" }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Take quizzes to see your progress!</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>

                  {/* Performance Distribution */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-md rounded-2xl p-5">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        Performance Distribution
                      </h3>
                      {performanceData.length > 0 ? (
                        <div>
                          <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={performanceData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={70}
                                  dataKey="value"
                                  label={({ name, percent }) =>
                                    `${(percent * 100).toFixed(0)}%`
                                  }
                                >
                                  {performanceData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#1f2937",
                                    border: "1px solid #4b5563",
                                    borderRadius: "8px",
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-6 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                            {performanceData.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  ></div>
                                  <span className="text-gray-600 dark:text-gray-400 text-xs">
                                    {item.name}
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Complete more quizzes to analyze performance!</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                </div>

                {/* Recent Results */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-md rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Recent Results
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                          ({trackedResults.length})
                        </span>
                      </h3>
                      <Link to="/quiz-history">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                        >
                          View All History
                        </Button>
                      </Link>
                    </div>
                    {trackedResults.length === 0 ? (
                      <div className="text-center py-12">
                        <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No quizzes taken yet
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Start your learning journey today!
                        </p>
                        <Link to="/quizzes">
                          <Button>Browse Quizzes</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentResults.map((result, index) => {
                          const scorePercentage =
                            (result.score / result.totalQuestions) * 100;
                          const isExcellent = scorePercentage >= 90;
                          const isGood = scorePercentage >= 70;

                          return (
                            <motion.div
                              key={result._id}
                              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    isExcellent
                                      ? "bg-emerald-100 dark:bg-emerald-900/40"
                                      : isGood
                                      ? "bg-blue-100 dark:bg-blue-900/40"
                                      : "bg-orange-100 dark:bg-orange-900/40"
                                  }`}
                                >
                                  {isExcellent ? (
                                    <Trophy
                                      className={`w-5 h-5 ${
                                        isExcellent
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : ""
                                      }`}
                                    />
                                  ) : isGood ? (
                                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                    {result.quiz?.title || "Quiz Unavailable"}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(
                                      result.createdAt
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                    <span className="mx-1">•</span>
                                    {result.totalQuestions} Qs
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {result.score}/{result.totalQuestions}
                                  </p>
                                  <p
                                    className={`text-xs font-semibold ${
                                      isExcellent
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : isGood
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-orange-600 dark:text-orange-400"
                                    }`}
                                  >
                                    {scorePercentage.toFixed(0)}%
                                  </p>
                                </div>
                                <Badge
                                  className={`text-xs font-medium px-2 py-0.5 ${
                                    isExcellent
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                      : isGood
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                      : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                                  }`}
                                >
                                  {isExcellent
                                    ? "Excellent"
                                    : isGood
                                    ? "Good"
                                    : "Keep Going"}
                                </Badge>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          ) : viewMode === "insights" ? (
            /* AI Insights View */
            <motion.div
              key="insights"
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Enhanced Stats Grid */}
              {aiInsights?.analytics && (
                <motion.div variants={itemVariants}>
                  <EnhancedStatsGrid
                    analytics={aiInsights.analytics}
                    patterns={aiInsights.patterns}
                  />
                </motion.div>
              )}

              {/* Main Insights Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Insights Card */}
                <motion.div variants={itemVariants}>
                  <AIInsightsCard
                    insights={aiInsights?.insights}
                    onRefresh={() => fetchAIInsights(true)}
                    isLoading={insightsLoading}
                  />
                </motion.div>

                {/* Peer Comparison */}
                <motion.div variants={itemVariants}>
                  <PeerComparisonCard comparison={aiInsights?.peerComparison} />
                </motion.div>
              </div>

              {/* Second Row: Learning Patterns & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Learning Patterns */}
                <motion.div variants={itemVariants}>
                  <LearningPatterns patterns={aiInsights?.patterns} />
                </motion.div>

                {/* Category Performance */}
                <motion.div variants={itemVariants}>
                  <CategoryPerformance
                    categories={aiInsights?.analytics?.byCategory}
                  />
                </motion.div>
              </div>

              {/* Weekly Activity */}
              <motion.div variants={itemVariants}>
                <WeeklyActivityCard
                  dailyActivity={aiInsights?.analytics?.dailyActivity}
                  weeklyTrend={aiInsights?.analytics?.weeklyTrend}
                />
              </motion.div>

              {/* Loading State */}
              {insightsLoading && !aiInsights && (
                <motion.div
                  className="flex items-center justify-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                      <Brain className="absolute inset-0 m-auto w-6 h-6 text-purple-600 animate-pulse" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      Analyzing your learning patterns...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* No Data State */}
              {!insightsLoading && !aiInsights?.hasData && (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Unlock AI Insights
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {aiInsights?.message ||
                      "Complete a few quizzes to unlock personalized AI-powered learning insights!"}
                  </p>
                  <Link to="/quizzes">
                    <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-600">
                      Start a Quiz
                    </Button>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detailed"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Detailed Results
                </h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Quiz Title
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Score
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Performance
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Date Taken
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {results.map((result) => (
                          <tr
                            key={result._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                  <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {result.quiz?.title || "Deleted Quiz"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {result.score} / {result.totalQuestions}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {(
                                  (result.score / result.totalQuestions) *
                                  100
                                ).toFixed(0)}
                                %
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant={
                                  result.score / result.totalQuestions >= 0.9
                                    ? "default"
                                    : result.score / result.totalQuestions >=
                                      0.7
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {result.score / result.totalQuestions >= 0.9
                                  ? "Excellent"
                                  : result.score / result.totalQuestions >= 0.7
                                  ? "Good"
                                  : "Needs Work"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(result.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link to={`/quiz/${result.quiz?._id}`}>
                                <Button variant="outline" size="sm">
                                  Play Again
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile scroll indicator */}
                  <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 sm:hidden">
                    ← Swipe to see more →
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
