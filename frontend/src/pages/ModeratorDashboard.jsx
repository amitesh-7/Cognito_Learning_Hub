import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReportsDashboard from "./ReportsDashboard";
import { 
  BookOpen, 
  AlertTriangle, 
  Shield, 
  ShieldCheck,
  Search, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Flag,
  User,
  HelpCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Eye
} from "lucide-react";

// --- Components & Variants ---
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
const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
};
const floatingAnimation = {
  y: [0, -8, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-auto border border-red-200/50 dark:border-red-700/50"
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
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Confirm Delete
              </span>
            </motion.button>
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
        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Prev</span>
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
        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm"
      >
        <span className="text-sm font-medium">Next</span>
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};

export default function ModeratorDashboard() {
  const [stats, setStats] = useState({ totalQuizzes: 0, pendingReports: 0 });
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quizzes");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [error, setError] = useState(null);

  const [quizPage, setQuizPage] = useState(1);
  const [quizTotalPages, setQuizTotalPages] = useState(1);
  const [quizSearch, setQuizSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("quizwise-token");
    try {
      const [quizzesRes, statsRes] = await Promise.all([
        fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/moderator/quizzes?page=${quizPage}&search=${quizSearch}`,
          { headers: { "x-auth-token": token } }
        ),
        fetch(`${import.meta.env.VITE_API_URL}/api/moderator/stats`, {
          headers: { "x-auth-token": token },
        }),
      ]);

      // Check if responses are OK
      if (!quizzesRes.ok) {
        console.error(
          "Quizzes fetch failed:",
          quizzesRes.status,
          quizzesRes.statusText
        );
        throw new Error(`Failed to fetch quizzes: ${quizzesRes.status}`);
      }
      if (!statsRes.ok) {
        console.error(
          "Stats fetch failed:",
          statsRes.status,
          statsRes.statusText
        );
        throw new Error(`Failed to fetch stats: ${statsRes.status}`);
      }

      // Check content type to ensure we're getting JSON
      const quizzesContentType = quizzesRes.headers.get("content-type");
      const statsContentType = statsRes.headers.get("content-type");

      if (!quizzesContentType?.includes("application/json")) {
        console.error("Quizzes response is not JSON:", quizzesContentType);
        throw new Error("Server returned non-JSON response for quizzes");
      }
      if (!statsContentType?.includes("application/json")) {
        console.error("Stats response is not JSON:", statsContentType);
        throw new Error("Server returned non-JSON response for stats");
      }

      const quizzesData = await quizzesRes.json();
      const statsData = await statsRes.json();

      setQuizzes(quizzesData.quizzes || []);
      setQuizTotalPages(quizzesData.totalPages || 1);
      setStats(statsData);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Failed to fetch moderator data", error);
      setError(
        error.message || "Failed to load moderator data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [quizPage, quizSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openDeleteModal = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    const token = localStorage.getItem("quizwise-token");
    await fetch(
      `${import.meta.env.VITE_API_URL}/api/moderator/quizzes/${
        quizToDelete._id
      }`,
      {
        method: "DELETE",
        headers: { "x-auth-token": token },
      }
    );
    setShowDeleteModal(false);
    setQuizToDelete(null);
    fetchData();
  };

  return (
    <>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteQuiz}
        title="Delete Quiz?"
        message={`Are you sure you want to permanently delete "${quizToDelete?.title}"? This action cannot be undone.`}
      />
      
      {/* Loading State */}
      {loading && (
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
              <ShieldCheck className="w-10 h-10 text-white" />
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-lg font-medium text-gray-600 dark:text-gray-400"
            >
              Loading moderator data...
            </motion.div>
          </motion.div>
        </div>
      )}

      {!loading && (
        <motion.div
          className="max-w-7xl mx-auto space-y-8 px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="relative">
            <motion.div animate={floatingAnimation} className="absolute -top-4 -right-4 opacity-20">
              <Shield className="w-24 h-24 text-indigo-500" />
            </motion.div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Moderator Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Review and manage platform content to ensure a safe environment
                </p>
              </div>
            </div>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div
              variants={itemVariants}
              className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-2xl p-5 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Error Loading Data
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchData}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-500 hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={itemVariants}
          >
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all"
                >
                  <BookOpen className="w-7 h-7 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Quizzes
                  </p>
                  <motion.p 
                    key={stats.totalQuizzes}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    {stats.totalQuizzes.toLocaleString()}
                  </motion.p>
                </div>
                <div className="text-indigo-400 opacity-20 group-hover:opacity-40 transition-opacity">
                  <FileText className="w-16 h-16" />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-amber-100 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all group relative overflow-hidden"
            >
              {stats.pendingReports > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-3 right-3 w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"
                />
              )}
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-all"
                >
                  <Flag className="w-7 h-7 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Pending Reports
                  </p>
                  <motion.p 
                    key={stats.pendingReports}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
                  >
                    {stats.pendingReports}
                  </motion.p>
                </div>
                <div className="text-amber-400 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Shield className="w-16 h-16" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={itemVariants}>
            <div className="flex space-x-2 p-1.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl w-fit">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("quizzes")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  activeTab === "quizzes"
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Quiz Management
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("reports")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                  activeTab === "reports"
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Flag className="w-4 h-4" />
                Reports
                {stats.pendingReports > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    {stats.pendingReports}
                  </span>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            variants={itemVariants}
          >
            <AnimatePresence mode="wait">
              {activeTab === "quizzes" && (
                <motion.div
                  key="quizzes"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="p-6">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search quizzes by title..."
                        onChange={(e) => {
                          setQuizSearch(e.target.value);
                          setQuizPage(1);
                        }}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      />
                    </div>
                    
                    {/* Quiz Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                              <span className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Title
                              </span>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                              <span className="flex items-center gap-2">
                                <User className="w-4 h-4" />
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
                                  <p className="text-lg font-medium">No quizzes found</p>
                                  <p className="text-sm">Try adjusting your search criteria</p>
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
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                                      {quiz.title?.charAt(0)?.toUpperCase() || "Q"}
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {quiz.title}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {quiz.createdBy?.name || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    {quiz.questions.length}
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
                  </div>
                </motion.div>
              )}
              {activeTab === "reports" && (
                <motion.div
                  key="reports"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="p-6">
                    <ReportsDashboard />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
