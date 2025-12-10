import React, { useState, useEffect, useContext, useMemo, useCallback, memo, lazy, Suspense } from "react";
import { AuthContext } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";
import { Link, Navigate, useLocation } from "react-router-dom";
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
  Video,
  Zap,
  Trophy,
  Sparkles,
  Brain,
  BarChart3,
  Activity,
  Gamepad2,
  Users,
  Lightbulb,
  MessageCircle,
  Rocket,
} from "lucide-react";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "../components/ui/PullToRefreshIndicator";
import { useHaptic } from "../hooks/useHaptic";

// Lazy load heavy components
const EnhancedStatsGrid = lazy(() => import("../components/EnhancedStats").then(m => ({ default: m.EnhancedStatsGrid })));
const CategoryPerformance = lazy(() => import("../components/EnhancedStats").then(m => ({ default: m.CategoryPerformance })));
const LearningPatterns = lazy(() => import("../components/EnhancedStats").then(m => ({ default: m.LearningPatterns })));
const AIInsightsCard = lazy(() => import("../components/AIInsightsNew").then(m => ({ default: m.AIInsightsCard })));
const PeerComparisonCard = lazy(() => import("../components/AIInsightsNew").then(m => ({ default: m.PeerComparisonCard })));
const LearningPatternsCard = lazy(() => import("../components/AIInsightsNew").then(m => ({ default: m.LearningPatternsCard })));
const WeeklyActivityCard = lazy(() => import("../components/AIInsights").then(m => ({ default: m.WeeklyActivityCard })));
const RealTimeStats = lazy(() => import("../components/Gamification").then(m => ({ default: m.RealTimeStats })));
const StudyBuddyChat = lazy(() => import("../components/StudyBuddy/StudyBuddyChat"));
const StudyGoals = lazy(() => import("../components/StudyBuddy/StudyGoals"));
const QuestMap = lazy(() => import("../components/Quests/QuestMap"));
const WorldEventsPage = lazy(() => import("../components/WorldEvents/WorldEventsPage"));
const TimeTravelMode = lazy(() => import("../components/TimeTravel/TimeTravelMode"));
const PerformanceCharts = lazy(() => import("../components/Dashboard/PerformanceCharts"));

// Animation Variants - Memoized
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

// Memoized Loading Component
const LoadingState = memo(() => (
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
));

// Memoized Error Component
const ErrorState = memo(({ error }) => (
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
));

// Memoized Floating Background
const FloatingBackground = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
  </div>
));

// Memoized Quick Action Card
const QuickActionCard = memo(({ to, gradient, borderColor, Icon, title, subtitle, badge, animate: animateProps }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`p-5 bg-gradient-to-br ${gradient} border ${borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group rounded-2xl relative overflow-hidden h-full`}>
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`}></div>
        {badge && (
          <motion.div
            className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            {badge}
          </motion.div>
        )}
        <div className="relative text-center">
          <motion.div
            className={`w-16 h-16 mx-auto bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg mb-4`}
            {...animateProps}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
      </Card>
    </motion.div>
  </Link>
));

// Memoized View Mode Button
const ViewModeButton = memo(({ mode, currentMode, onClick, Icon, label, gradient }) => (
  <motion.button
    onClick={onClick}
    aria-label={label}
    aria-pressed={currentMode === mode}
    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${
      currentMode === mode
        ? `bg-gradient-to-r ${gradient} text-white shadow-md`
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
    }`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </motion.button>
));

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
  const [viewMode, setViewMode] = useState("overview");
  const { success } = useHaptic();

  // AI Insights state
  const [aiInsights, setAiInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Redirect teachers to teacher dashboard
  if (!authLoading && user?.role === "Teacher") {
    return <Navigate to="/teacher-dashboard" replace />;
  }

  // Memoized fetch functions
  const fetchAIInsights = useCallback(async (forceRefresh = false) => {
    if (!user?._id) return;
    
    try {
      setInsightsLoading(true);
      const token = localStorage.getItem("quizwise-token");
      const endpoint = forceRefresh
        ? `${import.meta.env.VITE_API_URL}/api/analytics/user/${user._id}/refresh-insights`
        : `${import.meta.env.VITE_API_URL}/api/analytics/user/${user._id}/insights`;

      const response = await fetch(endpoint, {
        method: forceRefresh ? "POST" : "GET",
        headers: { "x-auth-token": token },
      });

      if (response.ok) {
        const data = await response.json();
        const insightsData = data.data?.insights || data.insights || data.data || data;
        setAiInsights(insightsData);
      } else {
        setAiInsights({
          hasData: false,
          message: "Failed to load insights. Please try again.",
        });
      }
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
    } finally {
      setInsightsLoading(false);
    }
  }, [user?._id]);

  const fetchResults = useCallback(async () => {
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

      // Calculate streak
      const sortedResults = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const uniqueDays = new Set();
      sortedResults.forEach((result) => {
        const date = new Date(result.createdAt);
        date.setHours(0, 0, 0, 0);
        uniqueDays.add(date.getTime());
      });

      const sortedUniqueDays = Array.from(uniqueDays).sort((a, b) => b - a);
      let streak = 0;
      let expectedDate = new Date();
      expectedDate.setHours(0, 0, 0, 0);

      for (let dayTimestamp of sortedUniqueDays) {
        const resultDate = new Date(dayTimestamp);
        const daysDiff = Math.floor((expectedDate - resultDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0 || (streak === 0 && daysDiff === 1)) {
          streak++;
          expectedDate = new Date(resultDate);
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else if (daysDiff === 1) {
          streak++;
          expectedDate = new Date(resultDate);
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break;
        }
      }
      setStreakCount(streak);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (location.state?.openStudyBuddy) {
      setViewMode("study-buddy");
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const loadData = async () => {
      await fetchResults();
      if (user?._id) {
        await fetchAIInsights();
      }
    };
    loadData();
  }, [fetchResults, fetchAIInsights, user?._id]);

  // Refresh insights when switching to insights view
  useEffect(() => {
    if (viewMode === "insights" && user?._id && !insightsLoading) {
      fetchAIInsights();
    }
  }, [viewMode, user?._id, fetchAIInsights, insightsLoading]);

  // Memoized calculated stats
  const stats = useMemo(() => {
    const quizzesCompleted = userStats?.totalQuizzesTaken || results.length;
    const averageScore =
      userStats?.averageScore ||
      (results.length > 0
        ? results.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / results.length
        : 0);

    const actualResultsCount = userStats?.totalQuizzesTaken || results.length;
    const trackedResults = results.slice(0, actualResultsCount);

    const totalQuestions = trackedResults.reduce((acc, r) => acc + r.totalQuestions, 0);
    const totalCorrect = trackedResults.reduce((acc, r) => acc + (r.correctAnswers || 0), 0);
    const totalPoints = userStats?.totalPoints || totalCorrect;
    const recentResults = trackedResults.slice(0, 5);

    const excellent = trackedResults.filter((r) => (r.percentage || 0) >= 90).length;
    const good = trackedResults.filter((r) => (r.percentage || 0) >= 70 && (r.percentage || 0) < 90).length;
    const needsWork = trackedResults.filter((r) => (r.percentage || 0) < 70).length;

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

    const performanceData = [
      { name: "Excellent (90%+)", value: excellent, color: "#10b981" },
      { name: "Good (70-89%)", value: good, color: "#f59e0b" },
      { name: "Needs Work (<70%)", value: needsWork, color: "#ef4444" },
    ].filter((item) => item.value > 0);

    return {
      quizzesCompleted,
      averageScore,
      trackedResults,
      totalQuestions,
      totalCorrect,
      totalPoints,
      recentResults,
      excellent,
      good,
      needsWork,
      chartData,
      performanceData,
    };
  }, [userStats, results]);

  // Memoized achievements
  const achievements = useMemo(() => {
    const { quizzesCompleted } = stats;
    const achList = [];

    if (userAchievements && userAchievements.length > 0) {
      userAchievements.slice(0, 5).forEach((ua) => {
        const ach = ua.achievement || ua;
        achList.push({
          icon: Award,
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
      if (quizzesCompleted > 0)
        achList.push({
          icon: Award,
          title: "First Quiz!",
          description: "You completed your first quiz.",
          color: "yellow",
          progress: 100,
        });
      if (quizzesCompleted >= 5)
        achList.push({
          icon: Target,
          title: "Quiz Novice",
          description: "Completed 5 quizzes.",
          color: "blue",
          progress: 100,
        });
      if (quizzesCompleted >= 10)
        achList.push({
          icon: CheckCircle,
          title: "Quiz Expert",
          description: "Completed 10 quizzes.",
          color: "green",
          progress: 100,
        });
      if (results.some((r) => r.score === r.totalQuestions))
        achList.push({
          icon: Flame,
          title: "Perfectionist",
          description: "Achieved a perfect score!",
          color: "red",
          progress: 100,
        });
      if (streakCount >= 3)
        achList.push({
          icon: Calendar,
          title: "Consistent Learner",
          description: `${streakCount} day learning streak!`,
          color: "purple",
          progress: 100,
        });
    }

    return achList;
  }, [userAchievements, stats.quizzesCompleted, results, streakCount]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    success();
    setLoading(true);
    await fetchResults();
    if (user?._id && viewMode === "insights") {
      await fetchAIInsights();
    }
  }, [success, fetchResults, fetchAIInsights, user?._id, viewMode]);

  const { isPulling, pullDistance, isRefreshing, pullProgress } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    enabled: !loading,
  });

  // View mode handlers
  const setViewModeHandler = useCallback((mode) => {
    setViewMode(mode);
    if (mode === "insights" && user?._id) {
      fetchAIInsights();
    }
  }, [user?._id, fetchAIInsights]);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", emoji: "🌅" };
    if (hour < 18) return { text: "Good Afternoon", emoji: "☀️" };
    return { text: "Good Evening", emoji: "🌙" };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950/30 relative overflow-hidden pb-8 px-2 sm:px-4">
      <FloatingBackground />
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        pullProgress={pullProgress}
        isRefreshing={isRefreshing}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
        {/* Header */}
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
              <div className="flex items-center gap-3 mb-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <span className="text-5xl">{greeting.emoji}</span>
                </motion.div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent leading-tight">
                      {greeting.text}, {user?.name?.split(" ")[0] || "Student"}!
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

              {stats.quizzesCompleted > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full border border-indigo-200/50 dark:border-indigo-700/50"
                >
                  <Rocket className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    {stats.quizzesCompleted >= 50
                      ? "🏆 Master Learner"
                      : stats.quizzesCompleted >= 20
                      ? "⭐ Expert Student"
                      : stats.quizzesCompleted >= 10
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

          {/* View Mode Selector */}
          <div className="flex gap-1 sm:gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-1.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg overflow-x-auto scrollbar-hide">
            <ViewModeButton
              mode="overview"
              currentMode={viewMode}
              onClick={() => setViewModeHandler("overview")}
              Icon={BarChart3}
              label="Overview"
              gradient="from-indigo-500 to-purple-600"
            />
            <ViewModeButton
              mode="insights"
              currentMode={viewMode}
              onClick={() => setViewModeHandler("insights")}
              Icon={Brain}
              label="AI Insights"
              gradient="from-violet-500 to-purple-600"
            />
            <ViewModeButton
              mode="detailed"
              currentMode={viewMode}
              onClick={() => setViewModeHandler("detailed")}
              Icon={ClipboardList}
              label="Details"
              gradient="from-indigo-500 to-purple-600"
            />
            <ViewModeButton
              mode="study-buddy"
              currentMode={viewMode}
              onClick={() => setViewModeHandler("study-buddy")}
              Icon={MessageCircle}
              label="Study Buddy"
              gradient="from-pink-500 to-rose-600"
            />
            <ViewModeButton
              mode="goals"
              currentMode={viewMode}
              onClick={() => setViewModeHandler("goals")}
              Icon={Target}
              label="Goals"
              gradient="from-green-500 to-emerald-600"
            />
            <ViewModeButton
              mode="quests"
              currentMode={viewMode}
              onClick={() => setViewModeHandler("quests")}
              Icon={Gamepad2}
              label="Quests"
              gradient="from-purple-500 to-indigo-600"
            />
            <ViewModeButton
              mode="world-events"
              currentMode={viewMode}
              onClick={() => setViewModeHandler("world-events")}
              Icon={Users}
              label="World Events"
              gradient="from-blue-500 to-cyan-600"
            />
            <ViewModeButton
              mode="time-travel"
              currentMode={viewMode}
              onClick={() => setViewModeHandler("time-travel")}
              Icon={Clock}
              label="Time Travel"
              gradient="from-amber-500 to-orange-600"
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
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
            <QuickActionCard
              to="/quick-actions"
              gradient="from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
              borderColor="border-amber-200/60 dark:border-amber-700/40"
              Icon={Zap}
              title="Learning Toolkit 🚀"
              subtitle="All tools in one place"
              animate={{ whileHover: { rotate: [0, -10, 10, -10, 0] }, transition: { duration: 0.5 } }}
            />
            <QuickActionCard
              to="/live/join"
              gradient="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
              borderColor="border-purple-200/60 dark:border-purple-700/40"
              Icon={Video}
              title="Join Live Quiz 🎮"
              subtitle="Compete in real-time"
              badge="LIVE"
              animate={{ animate: { scale: [1, 1.05, 1] }, transition: { duration: 2, repeat: Infinity } }}
            />
            <QuickActionCard
              to="/duel"
              gradient="from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20"
              borderColor="border-rose-200/60 dark:border-rose-700/40"
              Icon={Gamepad2}
              title="1v1 Duel Battle ⚔️"
              subtitle="Challenge a friend"
              animate={{ whileHover: { rotate: [0, -15, 15, -15, 0] }, transition: { duration: 0.6 } }}
            />
            <QuickActionCard
              to="/doubt-solver"
              gradient="from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20"
              borderColor="border-cyan-200/60 dark:border-cyan-700/40"
              Icon={Lightbulb}
              title="AI Doubt Solver 🤖"
              subtitle="Get instant answers"
              animate={{ animate: { y: [0, -3, 0] }, transition: { duration: 2, repeat: Infinity } }}
            />
          </div>
        </motion.div>

        {/* View Content - Lazy Loaded */}
        <Suspense fallback={<LoadingState />}>
          <AnimatePresence mode="wait">
            {viewMode === "study-buddy" && <StudyBuddyChat key="study-buddy" />}
            {viewMode === "goals" && <StudyGoals key="goals" />}
            {viewMode === "quests" && <QuestMap key="quests" />}
            {viewMode === "world-events" && <WorldEventsPage key="world-events" />}
            {viewMode === "time-travel" && <TimeTravelMode key="time-travel" />}
            {viewMode === "insights" && (
              <motion.div key="insights" className="space-y-6">
                <AIInsightsCard insights={aiInsights} loading={insightsLoading} />
                <PeerComparisonCard insights={aiInsights} />
                <LearningPatternsCard insights={aiInsights} />
              </motion.div>
            )}
            {viewMode === "overview" && (
              <motion.div key="overview" className="space-y-6">
                <EnhancedStatsGrid stats={stats} currentLevel={currentLevel} totalXP={totalXP} streakCount={streakCount} />
                <PerformanceCharts chartData={stats.chartData} performanceData={stats.performanceData} />
                <RealTimeStats />
              </motion.div>
            )}
            {viewMode === "detailed" && (
              <motion.div key="detailed" className="space-y-6">
                <CategoryPerformance results={stats.trackedResults} />
                <LearningPatterns results={stats.trackedResults} />
                <WeeklyActivityCard results={stats.trackedResults} />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
}
