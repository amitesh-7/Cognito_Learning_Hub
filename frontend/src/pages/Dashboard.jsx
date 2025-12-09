import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";
import { Link, Navigate, useLocation } from "react-router-dom";
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
  ChevronRight,
  Star,
  BarChart3,
  Activity,
  Gamepad2,
  Users,
  Lightbulb,
  MessageCircle,
  Coffee,
  Rocket,
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
  LearningPatternsCard,
} from "../components/AIInsightsNew";
import { WeeklyActivityCard } from "../components/AIInsights";
import { RealTimeStats } from "../components/Gamification";
import StudyBuddyChat from "../components/StudyBuddy/StudyBuddyChat";
import StudyGoals from "../components/StudyBuddy/StudyGoals";
import QuestMap from "../components/Quests/QuestMap";
import WorldEventsPage from "../components/WorldEvents/WorldEventsPage";
import TimeTravelMode from "../components/TimeTravel/TimeTravelMode";

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
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [viewMode, setViewMode] = useState("overview"); // 'overview', 'detailed', 'insights', 'study-buddy', 'goals', 'quests', 'world-events', 'time-travel'
  const { success } = useHaptic();

  // AI Insights state
  const [aiInsights, setAiInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Check if user came from quiz results wanting to open Study Buddy
  useEffect(() => {
    if (location.state?.openStudyBuddy) {
      setViewMode("study-buddy");
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

      console.log("📊 Fetching AI Insights from:", endpoint);

      const response = await fetch(endpoint, {
        method: forceRefresh ? "POST" : "GET",
        headers: { "x-auth-token": token },
      });

      console.log("📊 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(
          "📊 AI Insights Full Response:",
          JSON.stringify(data, null, 2)
        );
        console.log("📊 Response data.data:", data.data);
        console.log("📊 Response data.data.insights:", data.data?.insights);

        // API returns: { success, message, data: { insights: {...}, cached: bool } }
        // We need the insights object
        const insightsData =
          data.data?.insights || data.insights || data.data || data;
        console.log(
          "📊 Final insights data:",
          JSON.stringify(insightsData, null, 2)
        );
        console.log("📊 Has insights data?", insightsData.hasData);
        console.log("📊 Insights object?", insightsData.insights);
        setAiInsights(insightsData);
      } else {
        console.error(
          "❌ AI Insights API error:",
          response.status,
          response.statusText
        );
        try {
          const errorText = await response.text();
          console.error("❌ Error response body:", errorText);
        } catch (e) {
          console.error("❌ Could not read error response");
        }
        // Set empty insights to show "no data" state
        setAiInsights({
          hasData: false,
          message: "Failed to load insights. Please try again.",
        });
      }
    } catch (err) {
      console.error("❌ Failed to fetch AI insights:", err);
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
      // Streak logic: Count how many consecutive days (starting from today or yesterday) you took quizzes
      // Example: If you took quizzes today, yesterday, and day before yesterday = 3 day streak
      const sortedResults = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      console.log("🔥 Calculating streak from results:", sortedResults.length);

      // Group results by unique days to avoid counting multiple quizzes on same day
      const uniqueDays = new Set();
      sortedResults.forEach((result) => {
        const date = new Date(result.createdAt);
        date.setHours(0, 0, 0, 0);
        uniqueDays.add(date.getTime());
      });

      const sortedUniqueDays = Array.from(uniqueDays).sort((a, b) => b - a);
      console.log("🔥 Unique days with quizzes:", sortedUniqueDays.length);

      let streak = 0;
      let expectedDate = new Date();
      expectedDate.setHours(0, 0, 0, 0);

      for (let dayTimestamp of sortedUniqueDays) {
        const resultDate = new Date(dayTimestamp);
        const daysDiff = Math.floor(
          (expectedDate - resultDate) / (1000 * 60 * 60 * 24)
        );

        console.log(
          `🔥 Checking day: Date=${resultDate.toLocaleDateString()}, DaysDiff=${daysDiff}, ExpectedDiff=${streak}`
        );

        // Accept today (0) or yesterday (1) for first day, then must be consecutive
        if (daysDiff === 0 || (streak === 0 && daysDiff === 1)) {
          streak++;
          expectedDate = new Date(resultDate);
          expectedDate.setDate(expectedDate.getDate() - 1); // Next expected is previous day
          console.log(`✅ Streak continues! New streak: ${streak} days`);
        } else if (daysDiff === 1) {
          // Consecutive day
          streak++;
          expectedDate = new Date(resultDate);
          expectedDate.setDate(expectedDate.getDate() - 1);
          console.log(`✅ Streak continues! New streak: ${streak} days`);
        } else {
          console.log(`❌ Streak broken at ${streak} days (gap found)`);
          break;
        }
      }
      console.log(`🔥 Final streak count: ${streak} consecutive days`);
      setStreakCount(streak);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchResults();
      if (user?._id) {
        await fetchAIInsights();
      }
    };
    loadData();
  }, [user?._id]);

  // Refresh AI insights when results count changes (new quiz completed)
  useEffect(() => {
    if (user?._id && results.length > 0 && !insightsLoading) {
      console.log(
        "📊 Results changed, refreshing AI insights...",
        results.length
      );
      fetchAIInsights();
    }
  }, [results.length]);

  // Refresh insights when user returns to dashboard (after quiz)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?._id && viewMode === "insights") {
        console.log("👁️ Dashboard visible again, refreshing AI insights...");
        fetchAIInsights();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user?._id, viewMode]);

  // Pull-to-refresh functionality
  const handleRefresh = async () => {
    success(); // Haptic feedback on refresh
    setLoading(true);
    await fetchResults();
    // Also refresh AI insights if user is on insights view
    if (user?._id && viewMode === "insights") {
      console.log("🔄 Pull-to-refresh: Updating AI insights...");
      await fetchAIInsights();
    }
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
  const totalCorrect = trackedResults.reduce(
    (acc, r) => acc + (r.correctAnswers || 0),
    0
  );
  // Use gamification points as primary source for consistency
  const totalPoints = userStats?.totalPoints || totalCorrect;
  const recentResults = trackedResults.slice(0, 5);

  // Performance categories - only count tracked quizzes
  const excellent = trackedResults.filter(
    (r) => (r.percentage || 0) >= 90
  ).length;
  const good = trackedResults.filter(
    (r) => (r.percentage || 0) >= 70 && (r.percentage || 0) < 90
  ).length;
  const needsWork = trackedResults.filter(
    (r) => (r.percentage || 0) < 70
  ).length;

  // --- Chart Data with proper dates - only tracked quizzes ---
  const chartData = trackedResults
    .slice(0, 10)
    .reverse()
    .map((r) => {
      const date = new Date(r.createdAt);
      return {
        name: `${date.getMonth() + 1}/${date.getDate()}`,
        score: parseFloat((r.percentage || 0).toFixed(1)),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950/30 relative overflow-hidden pb-8 px-2 sm:px-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
        {/* Enhanced Header Section with time-based greeting */}
        <motion.div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex-1">
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Time-based greeting */}
              <div className="flex items-center gap-3 mb-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {new Date().getHours() < 12 ? (
                    <span className="text-5xl">🌅</span>
                  ) : new Date().getHours() < 18 ? (
                    <span className="text-5xl">☀️</span>
                  ) : (
                    <span className="text-5xl">🌙</span>
                  )}
                </motion.div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent leading-tight">
                      {new Date().getHours() < 12
                        ? "Good Morning"
                        : new Date().getHours() < 18
                        ? "Good Afternoon"
                        : "Good Evening"}
                      , {user?.name?.split(" ")[0] || "Student"}!
                    </span>
                  </h1>
                  <p className="text-slate-600 dark:text-slate-300 font-medium text-base sm:text-lg mt-1">
                    Ready to{" "}
                    <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent font-semibold">
                      level up
                    </span>{" "}
                    your learning today? ✨
                  </p>
                </div>
              </div>

              {/* Motivational badge based on activity */}
              {quizzesCompleted > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full border border-indigo-200/50 dark:border-indigo-700/50"
                >
                  <Rocket className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    {quizzesCompleted >= 50
                      ? "🏆 Master Learner"
                      : quizzesCompleted >= 20
                      ? "⭐ Expert Student"
                      : quizzesCompleted >= 10
                      ? "🎯 Rising Star"
                      : "🌱 Learning Journey"}
                  </span>
                  <div className="w-px h-4 bg-indigo-300 dark:bg-indigo-600"></div>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Level {currentLevel || 1}
                  </span>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Enhanced view mode selector with better visuals */}
          <div className="flex gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-1.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg">
            <motion.button
              onClick={() => setViewMode("overview")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                viewMode === "overview"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </motion.button>
            <motion.button
              onClick={() => {
                setViewMode("insights");
                // Refresh insights when switching to insights view
                if (user?._id) {
                  console.log(
                    "🔄 Switching to insights view, refreshing data..."
                  );
                  fetchAIInsights();
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                viewMode === "insights"
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </motion.button>
            <motion.button
              onClick={() => setViewMode("detailed")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                viewMode === "detailed"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Details</span>
            </motion.button>
            <motion.button
              onClick={() => setViewMode("study-buddy")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                viewMode === "study-buddy"
                  ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Study Buddy</span>
            </motion.button>
            <motion.button
              onClick={() => setViewMode("goals")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                viewMode === "goals"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Goals</span>
            </motion.button>
            <motion.button
              onClick={() => setViewMode("quests")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                viewMode === "quests"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Quests</span>
            </motion.button>
            <motion.button
              onClick={() => setViewMode("world-events")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                viewMode === "world-events"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">World Events</span>
            </motion.button>
            <motion.button
              onClick={() => setViewMode("time-travel")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                viewMode === "time-travel"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Time Travel</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions Section - Top Center */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <div className="text-center mb-4">
            <motion.h2
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent inline-flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Zap className="w-6 h-6 text-amber-500" />
              Quick Actions
            </motion.h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Jump right into your learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {/* Learning Toolkit */}
            <Link to="/quick-actions">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/60 dark:border-amber-700/40 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group rounded-2xl relative overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-100/0 via-amber-100/50 to-amber-100/0 dark:from-amber-500/0 dark:via-amber-500/10 dark:to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="relative text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4"
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Zap className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Learning Toolkit 🚀
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      All tools in one place
                    </p>
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* Live Quiz */}
            <Link to="/live/join">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/60 dark:border-purple-700/40 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group rounded-2xl relative overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100/0 via-purple-100/50 to-purple-100/0 dark:from-purple-500/0 dark:via-purple-500/10 dark:to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <motion.div
                    className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </motion.div>
                  <div className="relative text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mb-4"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Video className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Join Live Quiz 🎮
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Compete in real-time
                    </p>
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* 1v1 Duel Battle */}
            <Link to="/duel">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-5 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border border-rose-200/60 dark:border-rose-700/40 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group rounded-2xl relative overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-100/0 via-rose-100/50 to-rose-100/0 dark:from-rose-500/0 dark:via-rose-500/10 dark:to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="relative text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg mb-4"
                      whileHover={{ rotate: [0, -15, 15, -15, 0] }}
                      transition={{ duration: 0.6 }}
                    >
                      <Gamepad2 className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      1v1 Duel Battle ⚔️
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Challenge a friend
                    </p>
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* AI Doubt Solver */}
            <Link to="/doubt-solver">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-5 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200/60 dark:border-cyan-700/40 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group rounded-2xl relative overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-100/0 via-cyan-100/50 to-cyan-100/0 dark:from-cyan-500/0 dark:via-cyan-500/10 dark:to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="relative text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg mb-4"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Lightbulb className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      AI Doubt Solver 🤖
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Get instant answers
                    </p>
                  </div>
                </Card>
              </motion.div>
            </Link>
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
                <Card className="text-center p-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl border border-indigo-200/50 dark:border-indigo-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl relative overflow-hidden group">
                  {/* Animated decorative gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ backgroundSize: "200% 200%" }}
                  />
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
                      {streakCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg animate-pulse z-20">
                          <Flame className="w-3 h-3" />
                          {streakCount}
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

                {/* Enhanced Achievements Section */}
                <Card className="p-5 bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-lg rounded-2xl overflow-hidden relative">
                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-amber-300/20 dark:from-yellow-600/10 dark:to-amber-700/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                        >
                          <Trophy className="w-5 h-5 text-amber-500" />
                        </motion.div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          Achievements
                        </h3>
                      </div>
                      {achievements.length > 0 && (
                        <Link to="/achievements">
                          <motion.div
                            className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                            whileHover={{ x: 3 }}
                          >
                            <span className="text-xs font-semibold">
                              {achievements.length} total
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </motion.div>
                        </Link>
                      )}
                    </div>

                    {achievements.length > 0 ? (
                      <div className="space-y-2.5">
                        {achievements.slice(0, 3).map((ach, index) => {
                          const Icon = ach.icon;
                          return (
                            <motion.div
                              key={index}
                              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-700/30 hover:from-gray-100 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-700 border border-gray-200/50 dark:border-gray-600/30 transition-all duration-200 group cursor-pointer"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, x: 4 }}
                            >
                              <motion.div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center relative shadow-md ${
                                  ach.color === "yellow"
                                    ? "bg-gradient-to-br from-amber-400 to-amber-500"
                                    : ach.color === "blue"
                                    ? "bg-gradient-to-br from-blue-400 to-blue-500"
                                    : ach.color === "green"
                                    ? "bg-gradient-to-br from-emerald-400 to-emerald-500"
                                    : ach.color === "red"
                                    ? "bg-gradient-to-br from-rose-400 to-rose-500"
                                    : "bg-gradient-to-br from-violet-400 to-violet-500"
                                }`}
                                whileHover={{
                                  rotate: [0, -5, 5, -5, 0],
                                  scale: 1.1,
                                }}
                                transition={{ duration: 0.5 }}
                              >
                                <Icon className="w-5 h-5 text-white" />
                                {/* Shine effect */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 rounded-xl"
                                  animate={{ x: ["-100%", "100%"] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                  }}
                                />
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">
                                  {ach.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                  {ach.description}
                                </p>
                              </div>
                              <motion.div
                                className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: index * 0.1 + 0.3,
                                  type: "spring",
                                  stiffness: 200,
                                }}
                              >
                                <CheckCircle className="w-4 h-4 text-white" />
                              </motion.div>
                            </motion.div>
                          );
                        })}

                        {/* View All Button */}
                        {achievements.length > 3 && (
                          <Link to="/achievements" className="block">
                            <motion.div
                              className="mt-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-700/30 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all cursor-pointer group"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                    +{achievements.length - 3} more achievements
                                  </span>
                                </div>
                                <motion.div
                                  animate={{ x: [0, 4, 0] }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                  }}
                                >
                                  <ChevronRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </motion.div>
                              </div>
                            </motion.div>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        className="text-center py-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        </motion.div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          No achievements yet
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Complete quizzes to unlock rewards!
                        </p>
                        <Link to="/quizzes">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-indigo-500 to-purple-600"
                          >
                            Start Learning
                          </Button>
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Right Column: Main Content */}
              <div className="lg:col-span-2 space-y-5">
                {/* Enhanced Stat Cards with Progress Rings */}
                <motion.div
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                  variants={itemVariants}
                >
                  {/* Quizzes Completed Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/30 dark:from-gray-800 dark:via-emerald-900/20 dark:to-emerald-900/30 border border-emerald-200/60 dark:border-emerald-700/40 shadow-xl hover:shadow-2xl transition-all duration-300 p-5 rounded-2xl group relative overflow-hidden">
                      {/* Animated background particles */}
                      <motion.div
                        className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/20 rounded-full blur-2xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <motion.div
                            className="w-14 h-14 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg relative"
                            whileHover={{
                              rotate: [0, -10, 10, -10, 0],
                              scale: 1.1,
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            <CheckCircle className="w-7 h-7 text-white relative z-10" />
                            {/* Glow effect */}
                            <motion.div
                              className="absolute inset-0 bg-emerald-300 rounded-xl blur-md opacity-0 group-hover:opacity-50"
                              animate={{ scale: [0.8, 1.2, 0.8] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>
                          {quizzesCompleted >= 10 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="text-xl"
                            >
                              🎉
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider mb-1">
                            Quizzes Done
                          </p>
                          <div className="flex items-end gap-2">
                            <motion.p
                              className="text-4xl font-black bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-600 bg-clip-text text-transparent"
                              key={quizzesCompleted}
                              initial={{ scale: 1.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              {quizzesCompleted}
                            </motion.p>
                            <motion.span
                              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1.5"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              total
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Average Score Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 dark:from-gray-800 dark:via-blue-900/20 dark:to-blue-900/30 border border-blue-200/60 dark:border-blue-700/40 shadow-xl hover:shadow-2xl transition-all duration-300 p-5 rounded-2xl group relative overflow-hidden">
                      <motion.div
                        className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: 0.5,
                        }}
                      />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <motion.div
                            className="w-14 h-14 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg relative"
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Target className="w-7 h-7 text-white" />
                            <motion.div
                              className="absolute inset-0 bg-blue-300 rounded-xl blur-md opacity-0 group-hover:opacity-50"
                              animate={{ scale: [0.8, 1.2, 0.8] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>
                          {averageScore >= 80 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 }}
                              className="text-xl"
                            >
                              ⭐
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider mb-1">
                            Avg Score
                          </p>
                          <div className="flex items-end gap-1">
                            <motion.p
                              className="text-4xl font-black bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent"
                              key={averageScore}
                              initial={{ scale: 1.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              {averageScore.toFixed(0)}
                            </motion.p>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Total Points Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="bg-gradient-to-br from-white via-violet-50/50 to-violet-100/30 dark:from-gray-800 dark:via-violet-900/20 dark:to-violet-900/30 border border-violet-200/60 dark:border-violet-700/40 shadow-xl hover:shadow-2xl transition-all duration-300 p-5 rounded-2xl group relative overflow-hidden">
                      <motion.div
                        className="absolute top-0 right-0 w-20 h-20 bg-violet-400/20 rounded-full blur-2xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <motion.div
                            className="w-14 h-14 bg-gradient-to-br from-violet-400 via-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg relative"
                            animate={{ y: [-2, 2, -2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <TrendingUp className="w-7 h-7 text-white" />
                            <motion.div
                              className="absolute inset-0 bg-violet-300 rounded-xl blur-md opacity-0 group-hover:opacity-50"
                              animate={{ scale: [0.8, 1.2, 0.8] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>
                          {totalPoints >= 1000 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 }}
                              className="text-xl"
                            >
                              💎
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-violet-700 dark:text-violet-300 font-bold uppercase tracking-wider mb-1">
                            Total Points
                          </p>
                          <div className="flex items-end gap-2">
                            <motion.p
                              className="text-4xl font-black bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800 dark:from-violet-400 dark:via-violet-500 dark:to-violet-600 bg-clip-text text-transparent"
                              key={totalPoints}
                              initial={{ scale: 1.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              {totalPoints.toLocaleString()}
                            </motion.p>
                            <motion.span
                              className="text-xs text-violet-600 dark:text-violet-400 font-semibold mb-1.5"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              pts
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Streak Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="bg-gradient-to-br from-white via-orange-50/50 to-red-100/30 dark:from-gray-800 dark:via-orange-900/20 dark:to-red-900/30 border border-orange-200/60 dark:border-orange-700/40 shadow-xl hover:shadow-2xl transition-all duration-300 p-5 rounded-2xl group relative overflow-hidden">
                      <motion.div
                        className="absolute top-0 right-0 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: 1.5,
                        }}
                      />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <motion.div
                            className="w-14 h-14 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg relative"
                            animate={{ rotate: [0, -5, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <Flame className="w-7 h-7 text-white" />
                            {streakCount > 0 && (
                              <>
                                <motion.span
                                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white dark:border-gray-800"
                                  animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [1, 0.6, 1],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                  }}
                                />
                                <motion.div
                                  className="absolute inset-0 bg-orange-300 rounded-xl blur-md opacity-0 group-hover:opacity-60"
                                  animate={{ scale: [0.8, 1.3, 0.8] }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                  }}
                                />
                              </>
                            )}
                          </motion.div>
                          {streakCount >= 7 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1, rotate: [0, 20, -20, 0] }}
                              transition={{ delay: 0.3, duration: 0.6 }}
                              className="text-xl"
                            >
                              🔥
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-orange-700 dark:text-orange-300 font-bold uppercase tracking-wider mb-1">
                            Daily Streak
                          </p>
                          <div className="flex items-end gap-2">
                            <motion.p
                              className="text-4xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-red-700 dark:from-orange-400 dark:via-red-500 dark:to-red-600 bg-clip-text text-transparent"
                              key={streakCount}
                              initial={{ scale: 1.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              {streakCount}
                            </motion.p>
                            <motion.span
                              className="text-xs text-orange-600 dark:text-orange-400 font-semibold mb-1.5"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              days
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
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
                          console.log("📊 Result data:", result);

                          // Calculate correct answers from percentage if correctAnswers is 0 or missing
                          let correctCount = result.correctAnswers;
                          if (!correctCount || correctCount === 0) {
                            // Calculate from percentage: (percentage/100) * totalQuestions
                            correctCount = Math.round(
                              (result.percentage / 100) * result.totalQuestions
                            );
                          }

                          // Use percentage from database
                          const scorePercentage = result.percentage || 0;
                          const isExcellent = scorePercentage >= 90;
                          const isGood = scorePercentage >= 70;
                          // Points earned (score field contains the points like 40, 50)
                          const pointsEarned = result.score || 0;

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
                                    {correctCount}/{result.totalQuestions}
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
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {pointsEarned} pts
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
            /* AI Insights View - Completely Rebuilt */
            <motion.div
              key="insights"
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {console.log("🎯 Rendering insights view with data:", aiInsights)}

              {/* Loading State */}
              {insightsLoading && !aiInsights && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                      <Brain className="absolute inset-0 m-auto w-6 h-6 text-purple-600 animate-pulse" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      Analyzing your learning patterns with AI...
                    </p>
                  </div>
                </div>
              )}

              {/* Has Data - Show Insights */}
              {!insightsLoading && aiInsights && aiInsights.hasData && (
                <>
                  {/* Main Insights Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AIInsightsCard
                      insights={aiInsights}
                      onRefresh={() => fetchAIInsights(true)}
                      isLoading={insightsLoading}
                    />
                    <PeerComparisonCard
                      comparison={aiInsights.peerComparison}
                    />
                  </div>

                  {/* Learning Patterns Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LearningPatternsCard patterns={aiInsights.patterns} />
                    <CategoryPerformance
                      categories={aiInsights.analytics?.byCategory}
                    />
                  </div>

                  {/* Weekly Activity */}
                  {aiInsights.analytics?.weeklyTrend && (
                    <WeeklyActivityCard
                      dailyActivity={aiInsights.analytics.dailyActivity}
                      weeklyTrend={aiInsights.analytics.weeklyTrend}
                    />
                  )}
                </>
              )}

              {/* No Data State */}
              {!insightsLoading &&
                (!aiInsights || aiInsights.hasData === false) && (
                  <div className="text-center py-20">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Unlock AI-Powered Insights
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                      {aiInsights?.message ||
                        "Take your first quiz to unlock personalized learning insights powered by AI!"}
                    </p>
                    <Link to="/quizzes">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Start Your First Quiz
                      </Button>
                    </Link>
                  </div>
                )}
            </motion.div>
          ) : viewMode === "study-buddy" ? (
            /* AI Study Buddy Chat View */
            <motion.div
              key="study-buddy"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <StudyBuddyChat context={location.state?.quizContext} />
            </motion.div>
          ) : viewMode === "goals" ? (
            /* Study Goals View */
            <motion.div
              key="goals"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <StudyGoals />
            </motion.div>
          ) : viewMode === "quests" ? (
            /* Quest System View */
            <motion.div
              key="quests"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <QuestMap />
            </motion.div>
          ) : viewMode === "world-events" ? (
            /* World Events View */
            <motion.div
              key="world-events"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <WorldEventsPage />
            </motion.div>
          ) : viewMode === "time-travel" ? (
            /* Time Travel Mode View */
            <motion.div
              key="time-travel"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <TimeTravelMode />
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
                        {results.map((result) => {
                          // Calculate correct answers from percentage if correctAnswers is 0 or missing
                          const correctCount =
                            result.correctAnswers > 0
                              ? result.correctAnswers
                              : Math.round(
                                  (result.percentage / 100) *
                                    result.totalQuestions
                                );
                          const pointsEarned =
                            result.pointsEarned || result.score || 0;

                          return (
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
                                  {correctCount} / {result.totalQuestions}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {(result.percentage || 0).toFixed(0)}%
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  {pointsEarned} pts
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge
                                  variant={
                                    (result.percentage || 0) >= 90
                                      ? "default"
                                      : (result.percentage || 0) >= 70
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {(result.percentage || 0) >= 90
                                    ? "Excellent"
                                    : (result.percentage || 0) >= 70
                                    ? "Good"
                                    : "Needs Work"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(
                                  result.createdAt
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/quiz/${result.quiz?._id}`}>
                                  <Button variant="outline" size="sm">
                                    Play Again
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
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
