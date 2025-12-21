import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  Radio,
  Users,
  Swords,
  GraduationCap,
  TrendingUp,
  Calendar,
  BookOpen,
  FileText,
  Award,
  Settings,
  Plus,
  X,
  ArrowRight,
  Zap,
} from "lucide-react";
import AdvancedQuestionCreator from "../components/Teacher/AdvancedQuestionCreator";
import { useTheme } from "../context/ThemeContext";

const TeachingHub = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeStudents: 0,
    liveSessions: 0,
    avgPerformance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAdvancedCreator, setShowAdvancedCreator] = useState(false);

  // Fetch real stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("quizwise-token");

        // Fetch ALL quizzes count from database (public quizzes)
        const allQuizzesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/quizzes?limit=1`
        );

        if (!allQuizzesResponse.ok) throw new Error("Failed to fetch quizzes");
        const allQuizzesData = await allQuizzesResponse.json();

        // Fetch real analytics stats
        const analyticsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/analytics/teacher/stats`,
          {
            headers: { "x-auth-token": token },
          }
        );

        let realStats = { totalAttempts: 0, uniqueStudents: 0 };
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          realStats =
            analyticsData.data?.stats || analyticsData.stats || realStats;
        }

        // Get total count of ALL quizzes in the database
        const totalQuizCount =
          allQuizzesData.data?.pagination?.total ||
          allQuizzesData.pagination?.total ||
          0;

        setStats({
          totalQuizzes: totalQuizCount,
          activeStudents: realStats.uniqueStudents || 0,
          liveSessions: 0, // TODO: Add live sessions endpoint
          avgPerformance: 0, // TODO: Add performance calculation
        });
      } catch (error) {
        console.error("Error fetching teaching hub stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      title: "My Dashboard",
      description:
        "View and manage all your quizzes, track student performance",
      icon: LayoutDashboard,
      link: "/teacher-dashboard",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      title: "My Quizzes",
      description: "View, edit, and manage all your created quizzes",
      icon: BookOpen,
      link: "/quizzes/my-quizzes",
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-500/10 to-purple-500/10",
    },
    {
      title: "Quiz Generator",
      description: "Create AI-powered quizzes with topic or file upload",
      icon: Sparkles,
      link: "/quiz-maker",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
    },
    {
      title: "Session History",
      description: "View all past live quiz sessions and analytics",
      icon: Radio,
      link: "/live/history",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-500/10 to-red-500/10",
    },
    {
      title: "Video Meeting",
      description: "Start video conferences with your students",
      icon: Users,
      link: "/meeting/create",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/10",
    },
    {
      title: "Duel Battles",
      description: "Create competitive 1v1 quiz battles for students",
      icon: Swords,
      link: "/duel",
      gradient: "from-red-500 to-rose-500",
      bgGradient: "from-red-500/10 to-rose-500/10",
    },
    {
      title: "Start Live Quiz",
      description: "Host real-time quiz sessions - select a quiz to begin",
      icon: Calendar,
      link: "/live/start",
      gradient: "from-indigo-500 to-blue-500",
      bgGradient: "from-indigo-500/10 to-blue-500/10",
    },
  ];

  const statsDisplay = [
    {
      label: "Total Quizzes",
      value: loading ? "..." : stats.totalQuizzes.toString(),
      icon: BookOpen,
    },
    {
      label: "Active Students",
      value: loading ? "..." : stats.activeStudents.toString(),
      icon: Users,
    },
    {
      label: "Live Sessions",
      value: loading ? "..." : stats.liveSessions.toString(),
      icon: Radio,
    },
    {
      label: "Avg Performance",
      value: loading
        ? "..."
        : stats.avgPerformance
        ? `${stats.avgPerformance}%`
        : "N/A",
      icon: TrendingUp,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
      isDark 
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" 
        : "bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/50"
    }`}>
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-purple-500/10" : "bg-purple-400/20"
        }`} />
        <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-indigo-500/10" : "bg-indigo-400/20"
        }`} style={{ animationDelay: "1s" }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="flex items-center justify-center gap-3 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl shadow-purple-500/25">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-4 ${
            isDark 
              ? "bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent" 
              : "bg-gradient-to-r from-slate-900 via-indigo-700 to-purple-700 bg-clip-text text-transparent"
          }`}>
            Teaching Hub
          </h1>
          <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}>
            Your complete teaching toolkit - Create quizzes, host live sessions,
            and track student progress
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {statsDisplay.map((stat, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative overflow-hidden backdrop-blur-xl rounded-2xl p-6 border shadow-xl transition-all duration-300 ${
                isDark 
                  ? "bg-slate-800/60 border-white/10 hover:border-purple-500/30" 
                  : "bg-white/80 border-white/60 hover:border-purple-300"
              }`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className={`text-3xl sm:text-4xl font-bold mb-1 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {stat.value}
                </p>
                <p className={`text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Link to={feature.link}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full ${
                    isDark 
                      ? "bg-slate-800/60 border-white/10 hover:border-purple-500/30" 
                      : "bg-white/80 border-white/60 hover:border-purple-300"
                  }`}
                >
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className={`inline-flex p-3 sm:p-4 bg-gradient-to-br ${feature.gradient} rounded-xl sm:rounded-2xl mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h3 className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className={`text-sm sm:text-base leading-relaxed ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {feature.description}
                    </p>

                    {/* Arrow indicator */}
                    <div className="mt-4 flex items-center gap-2 font-semibold group-hover:gap-3 transition-all duration-300">
                      <span className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                        Get Started
                      </span>
                      <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-300 ${
                        isDark ? "text-purple-400" : "text-purple-600"
                      }`} />
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-xl" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <Zap className="w-6 h-6 text-yellow-300" />
                <h3 className="text-2xl sm:text-3xl font-bold">Ready to create?</h3>
              </div>
              <p className="text-indigo-100 text-sm sm:text-base">
                Start with AI-powered quiz generation or host a live session
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link to="/quiz-maker">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg text-sm sm:text-base"
                >
                  Create Quiz
                </motion.button>
              </Link>
              <motion.button
                onClick={() => setShowAdvancedCreator(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg border border-white/30 flex items-center gap-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Advanced
              </motion.button>
              <Link to="/teacher-dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-800/80 text-white font-bold rounded-xl hover:bg-indigo-900 transition-all duration-200 shadow-lg border border-white/20 text-sm sm:text-base"
                >
                  Dashboard
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Advanced Question Creator Modal */}
      <AnimatePresence>
        {showAdvancedCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAdvancedCreator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
            >
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Create Advanced Question
                    </h2>
                    <p className="text-purple-100 mt-1">
                      Code, Reasoning, or Scenario questions
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAdvancedCreator(false)}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <AdvancedQuestionCreator
                  onQuestionCreated={async (questionData) => {
                    try {
                      const token = localStorage.getItem("quizwise-token");
                      const response = await fetch(
                        `${
                          import.meta.env.VITE_API_URL
                        }/api/quizzes/advanced-question`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "x-auth-token": token,
                          },
                          body: JSON.stringify(questionData),
                        }
                      );

                      if (response.ok) {
                        alert("Advanced question created successfully!");
                        setShowAdvancedCreator(false);
                      } else {
                        const error = await response.json();
                        alert(
                          `Error: ${
                            error.message || "Failed to create question"
                          }`
                        );
                      }
                    } catch (error) {
                      console.error("Error creating question:", error);
                      alert("Failed to create question. Please try again.");
                    }
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeachingHub;
