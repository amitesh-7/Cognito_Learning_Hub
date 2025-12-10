import React, { useState, useEffect, useMemo, useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
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
  AreaChart,
  Area,
} from "recharts";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  Edit3,
  Trash2,
  AlertTriangle,
  Users,
  BookOpen,
  TrendingUp,
  Plus,
  Search,
  FileText,
  Radio,
  History,
  Video,
  Target,
  ChevronRight,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Brain,
  Rocket,
  GraduationCap,
  Grid3X3,
  List,
  RefreshCw,
  Share2,
  Zap,
  Eye,
  Clock,
} from "lucide-react";
import AnimatedCounter from "../components/AnimatedCounter";

// Floating Particle Effect
const FloatingParticle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-purple-400 opacity-60"
    initial={{ y: 100, x: Math.random() * 100, opacity: 0 }}
    animate={{
      y: -20,
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.5],
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
    style={{ left: `${Math.random() * 100}%` }}
  />
);

// Modern Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        className="relative bg-white dark:bg-slate-900 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            {message}
          </p>
          <div className="flex gap-4">
            <motion.button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Delete
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Stat Card Component with Animations
const StatCard = ({ icon: Icon, label, value, trend, gradient, delay = 0 }) => (
  <motion.div
    className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.02 }}
  >
    {/* Background gradient on hover */}
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500`} />
    
    {/* Floating orb */}
    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

    <div className="relative flex items-center gap-3 sm:gap-4">
      <motion.div
        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
        whileHover={{ rotate: 10, scale: 1.1 }}
        transition={{ type: "spring" }}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
      </motion.div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1 truncate">
          {label}
        </p>
        <div className="flex items-end gap-2 sm:gap-3">
          <motion.span
            className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: delay + 0.2 }}
          >
            <AnimatedCounter end={value} duration={2} />
          </motion.span>
          {trend !== undefined && trend !== null && (
            <motion.span
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                trend > 0 
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' 
                  : trend < 0
                  ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.4 }}
            >
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </motion.span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// Quick Action Card
const QuickActionCard = ({ icon: Icon, label, gradient, link, emoji, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 * index }}
  >
    <Link to={link}>
      <motion.div
        className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 md:p-5 cursor-pointer transition-all duration-500"
        whileHover={{ scale: 1.03, y: -3 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Hover gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500`} />
        
        <div className="relative flex items-center gap-2 sm:gap-3 md:gap-4">
          <motion.div
            className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-white" />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-all truncate">
              <span className="hidden sm:inline">{emoji} </span>{label}
            </p>
          </div>
          
          <motion.div
            className="text-slate-400 dark:text-slate-500"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%", skewX: -20 }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />
      </motion.div>
    </Link>
  </motion.div>
);

// Quiz Card Component
const QuizCard = ({ quiz, index, onShare, onDelete, copied }) => (
  <motion.div
    className="group relative"
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.08 }}
    whileHover={{ x: 5 }}
  >
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 transition-all duration-500 hover:shadow-2xl hover:border-violet-300 dark:hover:border-violet-600">
      {/* Status bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 via-purple-500 to-indigo-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
      
      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-purple-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-4 sm:p-5 md:p-6">
        <div className="flex items-start gap-3 sm:gap-4 md:gap-5">
          {/* Quiz icon */}
          <motion.div
            className="relative flex-shrink-0"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
            {/* Engagement indicator */}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-white">
                {quiz.timesTaken > 99 ? '99+' : quiz.timesTaken}
              </span>
            </div>
          </motion.div>

          {/* Quiz info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-all line-clamp-2">
              {quiz.title}
            </h4>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {/* Questions badge */}
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs sm:text-sm font-medium border border-violet-200 dark:border-violet-700">
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">{quiz.questions?.length || 0} questions</span>
                <span className="sm:hidden">{quiz.questions?.length || 0}Q</span>
              </span>

              {/* Attempts badge */}
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-medium border border-purple-200 dark:border-purple-700">
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">{quiz.timesTaken} attempts</span>
                <span className="sm:hidden">{quiz.timesTaken}</span>
              </span>

              {/* Status badge */}
              <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border ${
                quiz.timesTaken >= 10
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                  : quiz.timesTaken >= 5
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  quiz.timesTaken >= 10 ? 'bg-emerald-500 animate-pulse' : quiz.timesTaken >= 5 ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                {quiz.timesTaken >= 10 ? '🔥 Hot' : quiz.timesTaken >= 5 ? '✨ Active' : '🆕 New'}
              </span>

              {/* Date */}
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(quiz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Host Live - Primary */}
              <Link to={`/live/host/${quiz._id}`}>
                <motion.button
                  className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg sm:rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all flex items-center gap-1.5 sm:gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                  <span className="hidden xs:inline">Host Live</span>
                  <span className="xs:hidden">Live</span>
                </motion.button>
              </Link>

              {/* Share */}
              <motion.button
                onClick={() => onShare(quiz._id)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 transition-all flex items-center gap-1.5 sm:gap-2 font-medium ${
                  copied 
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' 
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{copied ? 'Copied!' : 'Share'}</span>
              </motion.button>

              {/* Edit */}
              <Link to={`/quiz/edit/${quiz._id}`}>
                <motion.button
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg sm:rounded-xl bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:border-purple-300 dark:hover:border-purple-600 transition-all flex items-center gap-1.5 sm:gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Edit</span>
                </motion.button>
              </Link>

              {/* Delete */}
              <motion.button
                onClick={() => onDelete(quiz)}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-100 dark:bg-red-900/50 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
        initial={{ x: "-100%", skewX: -20 }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.8 }}
      />
    </div>
  </motion.div>
);

// Main Component
export default function TeacherDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalTakes: 0,
    uniqueStudents: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect non-teachers
  if (!authLoading && user && user.role !== "Teacher") {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch teacher data
  useEffect(() => {
    console.log("👨‍🏫 User Info:", { name: user?.name, role: user?.role, id: user?.id });
    fetchTeacherData();
  }, [sortBy]);

  const fetchTeacherData = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quizzes/my-quizzes?sortBy=${sortBy}`,
        { headers: { "x-auth-token": token } }
      );
      if (!response.ok) throw new Error("Failed to fetch your data.");
      const responseData = await response.json();
      
      // Handle ApiResponse wrapper format
      const data = responseData.data || responseData;
      
      console.log("📊 Teacher Dashboard Data:", data);
      console.log("📚 Quizzes:", data.quizzes);
      console.log("📈 Stats:", data.stats);
      
      setQuizzes(data.quizzes || []);
      setStats(data.stats || { totalQuizzes: 0, totalTakes: 0, uniqueStudents: 0 });
      
      // Generate weekly performance data from actual quiz data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toISOString().split('T')[0],
          quizzes: 0,
          attempts: 0,
        };
      });

      // Count quizzes created in last 7 days
      (data.quizzes || []).forEach(quiz => {
        const quizDate = new Date(quiz.createdAt).toISOString().split('T')[0];
        const dayData = last7Days.find(d => d.date === quizDate);
        if (dayData) {
          dayData.quizzes += 1;
          dayData.attempts += quiz.timesTaken || 0;
        }
      });

      setWeeklyData(last7Days);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

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

  const engagementData = quizzes.length > 0
    ? [
        { name: "High (10+)", value: quizzes.filter((q) => q.timesTaken >= 10).length, color: "#10b981" },
        { name: "Medium (5-9)", value: quizzes.filter((q) => q.timesTaken >= 5 && q.timesTaken < 10).length, color: "#f59e0b" },
        { name: "Low (<5)", value: quizzes.filter((q) => q.timesTaken < 5).length, color: "#6366f1" },
      ].filter((item) => item.value > 0)
    : [];

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
        { method: "DELETE", headers: { "x-auth-token": token } }
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

  // Quick actions configuration
  const quickActions = [
    { icon: Edit3, label: "Manual Creator", emoji: "✏️", gradient: "from-blue-500 to-indigo-600", link: "/quiz-maker/manual" },
    { icon: BookOpen, label: "File Generator", emoji: "📁", gradient: "from-purple-500 to-pink-600", link: "/quiz-maker/file" },
    { icon: Target, label: "Topic Generator", emoji: "🎯", gradient: "from-amber-500 to-orange-600", link: "/quiz-maker/topic" },
    { icon: Brain, label: "AI PDF Generator", emoji: "🤖", gradient: "from-emerald-500 to-teal-600", link: "/pdf-quiz-generator" },
    { icon: History, label: "Session History", emoji: "📊", gradient: "from-rose-500 to-pink-600", link: "/live/history" },
    { icon: Video, label: "Video Meeting", emoji: "🎥", gradient: "from-violet-500 to-fuchsia-600", link: "/meeting/create" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full bg-white dark:bg-slate-900"
              animate={{ scale: [1, 0.9, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <GraduationCap className="absolute inset-0 m-auto w-10 h-10 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Loading Teacher Hub
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Preparing your dashboard...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-white dark:bg-slate-900 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Oops! Something went wrong
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      <AnimatePresence>
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteQuiz}
          title="Delete Quiz?"
          message={`Are you sure you want to permanently delete "${quizToDelete?.title}"? This action cannot be undone.`}
        />
      </AnimatePresence>

      {/* Floating Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.5} />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Header */}
        <motion.header
          className="relative overflow-hidden rounded-3xl mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 shadow-2xl"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Gradient orbs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-violet-500/30 to-purple-600/30 rounded-full blur-3xl dark:opacity-50" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-indigo-500/30 to-pink-600/30 rounded-full blur-3xl dark:opacity-50" />

          <div className="relative p-4 sm:p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              {/* Left section */}
              <div className="flex items-center gap-3 sm:gap-5">
                <motion.div
                  className="relative"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring" }}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/40">
                    <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500"
                    animate={{ opacity: [0, 0.5, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                
                <div>
                  <motion.h1
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Teacher Hub
                  </motion.h1>
                  <motion.p
                    className="text-slate-600 dark:text-slate-300 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Welcome back, <span className="font-semibold text-violet-600 dark:text-violet-400">{user?.name}</span> ✨
                  </motion.p>
                </div>
              </div>

              {/* Right section - Actions */}
              <motion.div
                className="flex flex-wrap items-center gap-2 sm:gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {/* Live indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-xs sm:text-sm">Live Dashboard</span>
                </div>

                {/* Refresh button */}
                <motion.button
                  onClick={fetchTeacherData}
                  disabled={isRefreshing}
                  className="p-2 sm:p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </motion.button>

                {/* Create Quiz Button */}
                <Link to="/quiz-maker">
                  <motion.button
                    className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Create Quiz</span>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={BookOpen}
            label="Total Quizzes"
            value={stats.totalQuizzes}
            trend={12}
            gradient="from-violet-500 to-purple-600"
            delay={0}
          />
          <StatCard
            icon={Users}
            label="Unique Students"
            value={stats.uniqueStudents}
            trend={8}
            gradient="from-emerald-500 to-teal-600"
            delay={0.1}
          />
          <StatCard
            icon={Activity}
            label="Total Attempts"
            value={stats.totalTakes}
            trend={23}
            gradient="from-amber-500 to-orange-600"
            delay={0.2}
          />
          <Link to="/quiz-maker" className="block">
            <motion.div
              className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 shadow-xl cursor-pointer group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Animated circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative flex flex-col h-full justify-between">
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xl"
                  whileHover={{ rotate: 90 }}
                  transition={{ type: "spring" }}
                >
                  <Plus className="w-8 h-8 text-white" />
                </motion.div>
                
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-white mb-1">Create New Quiz</h3>
                  <p className="text-white/70 text-sm">Start building instantly ✨</p>
                </div>

                <motion.div
                  className="absolute bottom-4 right-4 text-white/50"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.div>
              </div>

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%", skewX: -20 }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8 }}
              />
            </motion.div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Quick Actions */}
          <motion.div
            className="xl:col-span-1 space-y-4 sm:space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Quick Actions Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Quick Actions</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Create & manage content</p>
                </div>
              </div>

              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <QuickActionCard key={action.label} {...action} index={index} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Charts & Quizzes */}
          <div className="xl:col-span-3 space-y-4 sm:space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Weekly Performance Chart */}
              <motion.div
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Weekly Performance</h3>
                  </div>
                </div>

                {weeklyData.length > 0 ? (
                  <div className="h-48 sm:h-56 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData}>
                        <defs>
                          <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="day" 
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis 
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={{ stroke: '#e2e8f0' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            color: '#fff',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="attempts"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorAttempts)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-slate-500 dark:text-slate-400">Create quizzes to see analytics!</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Engagement Distribution */}
              <motion.div
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Engagement Distribution</h3>
                  </div>
                </div>

                {engagementData.length > 0 ? (
                  <div className="h-48 sm:h-56 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={engagementData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {engagementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            color: '#fff',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {engagementData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-600 dark:text-slate-400">{item.name}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <PieChartIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-slate-500 dark:text-slate-400">Need more data for analysis!</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Recent Quizzes */}
            <motion.div
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Recent Quizzes</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{filteredQuizzes.length} quizzes found</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Search */}
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 w-full sm:w-40 md:w-48 text-sm rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="createdAt">Newest First</option>
                    <option value="timesTaken">Most Popular</option>
                    <option value="title">Alphabetical</option>
                  </select>

                  {/* View toggle */}
                  <div className="flex rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-0.5 sm:p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-violet-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                      <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-violet-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                      <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quiz List */}
              {filteredQuizzes.length === 0 ? (
                <div className="text-center py-16">
                  <motion.div
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <BookOpen className="w-12 h-12 text-violet-500 dark:text-violet-400" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {searchTerm ? `No quizzes match "${searchTerm}"` : "No quizzes yet"}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {searchTerm ? "Try a different search term" : "Create your first quiz to get started!"}
                  </p>
                  {!searchTerm && (
                    <Link to="/quiz-maker">
                      <motion.button
                        className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/30 inline-flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-5 h-5" />
                        Create Your First Quiz
                      </motion.button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuizzes.slice(0, 6).map((quiz, index) => (
                    <QuizCard
                      key={quiz._id}
                      quiz={quiz}
                      index={index}
                      onShare={handleShare}
                      onDelete={openDeleteModal}
                      copied={copied}
                    />
                  ))}
                  
                  {filteredQuizzes.length > 6 && (
                    <motion.div
                      className="text-center pt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <button className="px-6 py-3 rounded-xl bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-semibold hover:bg-violet-200 dark:hover:bg-violet-900 transition-all inline-flex items-center gap-2">
                        View All {filteredQuizzes.length} Quizzes
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Toast notification for copied link */}
      <AnimatePresence>
        {copied && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl z-50 flex items-center gap-2"
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold">Link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
