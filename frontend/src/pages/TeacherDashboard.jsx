import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import {
  Edit3,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Plus,
  Search,
  FileText,
  Radio,
  History,
} from "lucide-react";

// Enhanced ConfirmationModal with modern styling
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      ></div>
      <motion.div
        className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md mx-4"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {message}
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalTakes: 0,
    uniqueStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("overview"); // 'overview', 'detailed'

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem("quizwise-token");
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/quizzes/my-quizzes?sortBy=${sortBy}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch your data.");
        const data = await response.json();
        setQuizzes(data.quizzes || []);
        setStats(
          data.stats || { totalQuizzes: 0, totalTakes: 0, uniqueStudents: 0 }
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherData();
  }, [sortBy]);

  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter((quiz) =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "timesTaken") return b.timesTaken - a.timesTaken;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [quizzes, searchTerm, sortBy]);

  const chartData = quizzes.slice(0, 5).map((quiz) => ({
    name:
      quiz.title.length > 15 ? quiz.title.substring(0, 15) + "..." : quiz.title,
    timesTaken: quiz.timesTaken,
  }));

  const performanceData =
    quizzes.length > 0
      ? [
          {
            name: "High Engagement (10+ takes)",
            value: quizzes.filter((q) => q.timesTaken >= 10).length,
            color: "#10b981",
          },
          {
            name: "Medium Engagement (5-9 takes)",
            value: quizzes.filter((q) => q.timesTaken >= 5 && q.timesTaken < 10)
              .length,
            color: "#f59e0b",
          },
          {
            name: "Low Engagement (<5 takes)",
            value: quizzes.filter((q) => q.timesTaken < 5).length,
            color: "#ef4444",
          },
        ].filter((item) => item.value > 0)
      : [];

  const openDeleteModal = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quizzes/${quizToDelete._id}`,
        {
          method: "DELETE",
          headers: { "x-auth-token": token },
        }
      );
      if (!response.ok) throw new Error("Failed to delete quiz.");
      setQuizzes(quizzes.filter((q) => q._id !== quizToDelete._id));
      setStats((prev) => ({ ...prev, totalQuizzes: prev.totalQuizzes - 1 }));
      setShowDeleteModal(false);
      setQuizToDelete(null);
    } catch (err) {
      alert("Error deleting quiz: " + err.message);
    }
  };

  const handleShare = async (quizId) => {
    try {
      const shareUrl = `${window.location.origin}/quiz/${quizId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy quiz link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-500"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading Teacher Dashboard
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Preparing your analytics...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md w-full bg-white/80 dark:bg-gray-800 backdrop-blur-xl border-0 shadow-2xl">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteQuiz}
        title="Delete Quiz?"
        message={`Are you sure you want to permanently delete "${quizToDelete?.title}"? This action cannot be undone.`}
      />

      <div className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Header Section */}
        <motion.div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 bg-white dark:bg-gray-800 backdrop-blur-xl rounded-2xl border border-white dark:border-gray-700 shadow-xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              📊 Manage and analyze your quiz performance
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={viewMode === "overview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("overview")}
              className={
                viewMode === "overview"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }
            >
              📈 Overview
            </Button>
            <Button
              variant={viewMode === "detailed" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("detailed")}
              className={
                viewMode === "detailed"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }
            >
              📋 Detailed
            </Button>
            <Link to="/quiz-maker">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
            </Link>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === "overview" ? (
            <motion.div
              key="overview"
              className="grid grid-cols-1 xl:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Left Column: Stats & Quick Actions */}
              <motion.div
                className="xl:col-span-1 space-y-6"
                variants={itemVariants}
              >
                {/* Quick Stats */}
                <Card className="bg-white dark:bg-gray-800 backdrop-blur-xl border-0 shadow-2xl">
                  <div className="p-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                      📊 Quick Overview
                    </h3>
                    <div className="space-y-6">
                      <motion.div
                        className="group hover:bg-blue-50 dark:hover:bg-blue-900 p-4 rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <BookOpen className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Total Quizzes
                            </p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {stats.totalQuizzes}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="group hover:bg-green-50 dark:hover:bg-green-900 p-4 rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <TrendingUp className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Total Takes
                            </p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              {stats.totalTakes}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="group hover:bg-purple-50 dark:hover:bg-purple-900 p-4 rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <Users className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Unique Students
                            </p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                              {stats.uniqueStudents}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-2xl">
                  <div className="p-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                      ⚡ Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Link to="/manual-quiz-creator">
                        <Button
                          className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900 dark:hover:to-indigo-900 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 transition-all duration-300"
                          variant="outline"
                        >
                          <Edit3 className="w-4 h-4 mr-3" />
                          ✏️ Manual Creator
                        </Button>
                      </Link>
                      <Link to="/file-quiz-generator">
                        <Button
                          className="w-full justify-start bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900 dark:hover:to-pink-900 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 transition-all duration-300"
                          variant="outline"
                        >
                          <BookOpen className="w-4 h-4 mr-3" />
                          📁 File Generator
                        </Button>
                      </Link>
                      <Link to="/topic-quiz-generator">
                        <Button
                          className="w-full justify-start bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900 dark:hover:to-orange-900 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 transition-all duration-300"
                          variant="outline"
                        >
                          <Award className="w-4 h-4 mr-3" />
                          🎯 Topic Generator
                        </Button>
                      </Link>
                      <Link to="/pdf-quiz-generator">
                        <Button
                          className="w-full justify-start bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900 dark:hover:to-emerald-900 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 transition-all duration-300"
                          variant="outline"
                        >
                          <FileText className="w-4 h-4 mr-3" />
                          🤖 AI PDF Generator
                        </Button>
                      </Link>
                      <Link to="/live/history">
                        <Button
                          className="w-full justify-start bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900 dark:to-rose-900 hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-900 dark:hover:to-rose-900 border-pink-200 dark:border-pink-700 text-pink-700 dark:text-pink-300 transition-all duration-300"
                          variant="outline"
                        >
                          <History className="w-4 h-4 mr-3" />
                          📊 Live Session History
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Right Column: Charts & Performance */}
              <div className="xl:col-span-3 space-y-6">
                {/* Enhanced Stat Cards */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  variants={itemVariants}
                >
                  <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-10"></div>
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
                        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          My Quizzes
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.totalQuizzes}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Published content
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-10"></div>
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 dark:bg-green-900 p-3 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total Attempts
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.totalTakes}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Avg:{" "}
                          {stats.totalQuizzes > 0
                            ? (stats.totalTakes / stats.totalQuizzes).toFixed(1)
                            : 0}{" "}
                          per quiz
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-10"></div>
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-xl">
                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Reach
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.uniqueStudents}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Unique learners
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Most Popular Quizzes */}
                  <motion.div variants={itemVariants}>
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Most Popular Quizzes
                      </h3>
                      {chartData.length > 0 ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={chartData}
                              margin={{
                                top: 5,
                                right: 20,
                                left: -10,
                                bottom: 5,
                              }}
                            >
                              <XAxis
                                dataKey="name"
                                tick={{ fill: "#9ca3af", fontSize: 11 }}
                              />
                              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1f2937",
                                  border: "1px solid #4b5563",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                }}
                              />
                              <Bar
                                dataKey="timesTaken"
                                fill="#4f46e5"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Create quizzes to see engagement!</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>

                  {/* Engagement Distribution */}
                  <motion.div variants={itemVariants}>
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Engagement Distribution
                      </h3>
                      {performanceData.length > 0 ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={performanceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
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
                          <div className="mt-4 space-y-2">
                            {performanceData.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-sm"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {item.name}: {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Need more quiz data for analysis!</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                </div>

                {/* Recent Quizzes */}
                <motion.div variants={itemVariants}>
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Quizzes
                      </h3>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="text"
                            placeholder="Search quizzes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-48"
                            size="sm"
                          />
                        </div>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="createdAt">Newest First</option>
                          <option value="timesTaken">Most Popular</option>
                          <option value="title">Alphabetical</option>
                        </select>
                      </div>
                    </div>

                    {filteredQuizzes.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No quizzes found
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          {searchTerm
                            ? `No quizzes match "${searchTerm}"`
                            : "Create your first quiz to get started!"}
                        </p>
                        <Link to="/quiz-maker">
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Quiz
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredQuizzes.slice(0, 5).map((quiz, index) => (
                          <motion.div
                            key={quiz._id}
                            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {quiz.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {quiz.questions?.length || 0} questions •{" "}
                                  {quiz.timesTaken} takes
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link to={`/live/host/${quiz._id}`}>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                                >
                                  <Radio className="w-4 h-4 mr-1 animate-pulse" />
                                  Host Live
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShare(quiz._id)}
                                className={
                                  copied
                                    ? "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800"
                                    : ""
                                }
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                {copied ? "Copied!" : "Share"}
                              </Button>
                              <Link to={`/quiz/edit/${quiz._id}`}>
                                <Button variant="outline" size="sm">
                                  <Edit3 className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openDeleteModal(quiz)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                        {filteredQuizzes.length > 5 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setViewMode("detailed")}
                            >
                              View All {filteredQuizzes.length} Quizzes
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              </div>
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    All Quizzes
                  </h3>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search quizzes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="createdAt">Newest First</option>
                      <option value="timesTaken">Most Popular</option>
                      <option value="title">Alphabetical</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Quiz
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Questions
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Engagement
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Created
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredQuizzes.map((quiz) => (
                        <tr
                          key={quiz._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                <BookIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {quiz.title}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">
                              {quiz.questions?.length || 0} questions
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {quiz.timesTaken} takes
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {quiz.timesTaken >= 10
                                ? "High"
                                : quiz.timesTaken >= 5
                                ? "Medium"
                                : "Low"}{" "}
                              engagement
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(quiz.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShare(quiz._id)}
                              >
                                Share
                              </Button>
                              <Link to={`/quiz/edit/${quiz._id}`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openDeleteModal(quiz)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {copied && (
          <motion.div
            className="fixed bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full shadow-lg z-50"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            Link Copied! ✅
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
