import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ReportsDashboard from "./ReportsDashboard";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import {
  Users,
  BookOpen,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  Search,
  Edit3,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserCog,
  FileText,
  Flag,
  LayoutDashboard,
  Sparkles,
  Crown,
  GraduationCap,
  UserCheck,
  RefreshCw,
  Loader2,
  HelpCircle,
  Calendar,
  Mail,
  Settings,
} from "lucide-react";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};
const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } },
};
const floatingAnimation = {
  y: [0, -8, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
};
const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
};

// Components
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-red-200/50 dark:border-red-700/50"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 flex items-center justify-center"
          >
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <div className="flex justify-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="destructive"
                onClick={onConfirm}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Confirm Delete
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <motion.div
      className="flex justify-center items-center gap-3 mt-6 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <motion.button
        whileHover={{ scale: 1.05, x: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </motion.button>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200 dark:border-indigo-700">
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          {currentPage}
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {totalPages}
        </span>
      </div>
      <motion.button
        whileHover={{ scale: 1.05, x: 2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState({ userSignups: [] });
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalModerators: 0,
    totalAdmins: 0,
  });
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [quizPage, setQuizPage] = useState(1);
  const [quizTotalPages, setQuizTotalPages] = useState(1);
  const [quizSearch, setQuizSearch] = useState("");

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("quizwise-token");
    try {
      const [usersRes, quizzesRes, reportsRes, analyticsRes] =
        await Promise.all([
          fetch(
            `${
              import.meta.env.VITE_API_URL
            }/api/admin/users?page=${userPage}&search=${userSearch}`,
            { headers: { "x-auth-token": token } }
          ),
          fetch(
            `${
              import.meta.env.VITE_API_URL
            }/api/admin/quizzes?page=${quizPage}&search=${quizSearch}`,
            { headers: { "x-auth-token": token } }
          ),
          fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
            headers: { "x-auth-token": token },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, {
            headers: { "x-auth-token": token },
          }),
        ]);
      const usersData = await usersRes.json();
      const quizzesData = await quizzesRes.json();
      const reportsData = await reportsRes.json();
      const analyticsData = await analyticsRes.json();

      setUsers(usersData.users || []);
      setUserTotalPages(usersData.totalPages || 1);
      setUserStats(
        usersData.stats || {
          totalUsers: 0,
          totalStudents: 0,
          totalTeachers: 0,
          totalModerators: 0,
          totalAdmins: 0,
        }
      );
      setQuizzes(quizzesData.quizzes || []);
      setQuizTotalPages(quizzesData.totalPages || 1);
      setTotalQuizzes(quizzesData.totalQuizzes || 0);
      setReports(reportsData || []);
      setAnalytics(analyticsData || { userSignups: [] });
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  }, [userPage, userSearch, quizPage, quizSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem("quizwise-token");
    await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/role`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify({ role: newRole }),
      }
    );
    fetchData();
  };

  const openDeleteModal = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    const token = localStorage.getItem("quizwise-token");
    await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/quizzes/${quizToDelete._id}`,
      {
        method: "DELETE",
        headers: { "x-auth-token": token },
      }
    );
    setShowDeleteModal(false);
    setQuizToDelete(null);
    fetchData();
  };

  const totalTeachers = userStats.totalTeachers;
  const totalStudents = userStats.totalStudents;
  const totalModerators = userStats.totalModerators;
  const totalAdmins = userStats.totalAdmins;

  const chartData = analytics.userSignups.map((item) => ({
    name: new Date(item._id).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    signups: item.count,
  }));

  const roleData = [
    { name: "Students", value: totalStudents, color: "#3b82f6" },
    { name: "Teachers", value: totalTeachers, color: "#10b981" },
    { name: "Moderators", value: totalModerators, color: "#f59e0b" },
    { name: "Admins", value: totalAdmins, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-lg font-medium text-gray-600 dark:text-gray-400"
          >
            Loading admin data...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteQuiz}
        title="Delete Quiz?"
        message={`Are you sure you want to permanently delete "${quizToDelete?.title}"? This action cannot be undone.`}
      />

      <motion.div
        className="space-y-8 max-w-7xl mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="relative">
          <motion.div
            animate={floatingAnimation}
            className="absolute -top-4 -right-4 opacity-20"
          >
            <Crown className="w-24 h-24 text-indigo-500" />
          </motion.div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Manage users, quizzes, and platform settings
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="outline" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  System Health
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-blue-100 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
                >
                  <Users className="w-7 h-7 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Users
                  </p>
                  <motion.p
                    key={userStats.totalUsers}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                  >
                    {userStats.totalUsers.toLocaleString()}
                  </motion.p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />+
                    {analytics.userSignups?.reduce(
                      (acc, item) => acc + item.count,
                      0
                    ) || 0}{" "}
                    this week
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
                >
                  <BookOpen className="w-7 h-7 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Quizzes
                  </p>
                  <motion.p
                    key={totalQuizzes}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    {totalQuizzes.toLocaleString()}
                  </motion.p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Across all subjects
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                >
                  <GraduationCap className="w-7 h-7 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Teachers
                  </p>
                  <motion.p
                    key={totalTeachers}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
                  >
                    {totalTeachers}
                  </motion.p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Active educators
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-red-100 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-700 transition-all group">
              {reports.length > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"
                />
              )}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-red-400 to-pink-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/30"
                >
                  <Flag className="w-7 h-7 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Pending Reports
                  </p>
                  <motion.p
                    key={reports.length}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    {reports.length}
                  </motion.p>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {reports.length > 0 ? "Requires attention" : "All clear!"}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
        {/* Charts Row */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  User Registrations
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  Last 7 Days
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(128, 128, 128, 0.1)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(31, 41, 55, 0.95)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(75, 85, 99, 0.5)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                      }}
                    />
                    <Bar
                      dataKey="signups"
                      fill="url(#colorGradient)"
                      radius={[8, 8, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id="colorGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  User Role Distribution
                </h2>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(31, 41, 55, 0.95)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(75, 85, 99, 0.5)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl w-fit mb-6">
            {[
              { id: "users", label: "User Management", icon: Users },
              { id: "quizzes", label: "Quiz Management", icon: BookOpen },
              { id: "reports", label: "Reports", icon: Flag },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === "reports" && reports.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                      {reports.length}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <Card className="p-0 overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-indigo-500" />
                      User Management
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users by name..."
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setUserPage(1);
                        }}
                        className="w-full lg:w-72 pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              User
                            </span>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email
                            </span>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Role
                            </span>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Joined
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center">
                              <div className="text-gray-400">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-lg font-medium">
                                  No users found
                                </p>
                                <p className="text-sm">
                                  Try adjusting your search criteria
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          users.map((user, index) => (
                            <motion.tr
                              key={user._id}
                              variants={tableRowVariants}
                              initial="hidden"
                              animate="visible"
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {user.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={user.role}
                                  onChange={(e) =>
                                    handleRoleChange(user._id, e.target.value)
                                  }
                                  className={`text-sm font-medium border-2 rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
                                    user.role === "Admin"
                                      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                                      : user.role === "Moderator"
                                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                      : user.role === "Teacher"
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                      : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                >
                                  <option>Student</option>
                                  <option>Teacher</option>
                                  <option>Moderator</option>
                                  <option>Admin</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={userPage}
                    totalPages={userTotalPages}
                    onPageChange={setUserPage}
                  />
                </motion.div>
              )}

              {activeTab === "quizzes" && (
                <motion.div
                  key="quizzes"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-500" />
                      Quiz Management
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search quizzes by title..."
                        value={quizSearch}
                        onChange={(e) => {
                          setQuizSearch(e.target.value);
                          setQuizPage(1);
                        }}
                        className="w-full lg:w-72 pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Quiz
                            </span>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Created By
                            </span>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4" />
                              Questions
                            </span>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {quizzes.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center">
                              <div className="text-gray-400">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-lg font-medium">
                                  No quizzes found
                                </p>
                                <p className="text-sm">
                                  Try adjusting your search criteria
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          quizzes.map((quiz, index) => (
                            <motion.tr
                              key={quiz._id}
                              variants={tableRowVariants}
                              initial="hidden"
                              animate="visible"
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                    <BookOpen className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {quiz.title}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(
                                        quiz.createdAt
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {quiz.createdBy?.name || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  {quiz.questions?.length || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Link
                                    to={`/quiz/${quiz._id}`}
                                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                                    title="View Quiz"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <Link
                                    to={`/quiz/edit/${quiz._id}`}
                                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                                    title="Edit Quiz"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Link>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => openDeleteModal(quiz)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                    title="Delete Quiz"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={quizPage}
                    totalPages={quizTotalPages}
                    onPageChange={setQuizPage}
                  />
                </motion.div>
              )}

              {activeTab === "reports" && (
                <motion.div
                  key="reports"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-6"
                >
                  <ReportsDashboard />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
