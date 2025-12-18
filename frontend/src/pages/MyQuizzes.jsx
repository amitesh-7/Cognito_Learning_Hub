import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Clock,
  Users,
  TrendingUp,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Copy,
  Share2,
  BarChart3,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  ArrowLeft,
  Plus,
  Download,
  RefreshCw,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import QuizModeSelector from "../components/QuizModeSelector";

const MyQuizzes = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterQuizType, setFilterQuizType] = useState("all");
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    uniqueStudents: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Quiz mode selector states
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    fetchMyQuizzes();
  }, [sortBy]);

  useEffect(() => {
    filterQuizzes();
  }, [quizzes, searchTerm, filterDifficulty, filterQuizType]);

  const fetchMyQuizzes = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/quizzes/my-quizzes?sortBy=${sortBy}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch quizzes");

      const responseData = await response.json();
      const data = responseData.data || responseData;

      console.log("📚 My Quizzes Data:", data);

      setQuizzes(data.quizzes || []);
      setStats(
        data.stats || { totalQuizzes: 0, totalAttempts: 0, uniqueStudents: 0 }
      );
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to load your quizzes");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = [...quizzes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Difficulty filter
    if (filterDifficulty !== "all") {
      filtered = filtered.filter(
        (quiz) =>
          quiz.difficulty?.toLowerCase() === filterDifficulty.toLowerCase()
      );
    }

    // Quiz type filter (for speech-based quizzes)
    if (filterQuizType !== "all") {
      filtered = filtered.filter(
        (quiz) => quiz.quizType === filterQuizType
      );
    }

    setFilteredQuizzes(filtered);
  };

  const handleDeleteQuiz = async () => {
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

      if (!response.ok) throw new Error("Failed to delete quiz");

      toast.success("Quiz deleted successfully");
      setQuizzes(quizzes.filter((q) => q._id !== quizToDelete._id));
      setStats((prev) => ({ ...prev, totalQuizzes: prev.totalQuizzes - 1 }));
      setShowDeleteModal(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  const handleDuplicateQuiz = async (quiz) => {
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quizzes/${quiz._id}/duplicate`,
        {
          method: "POST",
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to duplicate quiz");

      toast.success("Quiz duplicated successfully");
      fetchMyQuizzes();
    } catch (error) {
      console.error("Error duplicating quiz:", error);
      toast.error("Failed to duplicate quiz");
    }
  };

  const handleModeSelect = (mode) => {
    if (!selectedQuiz) return;
    
    if (mode === "normal") {
      navigate(`/quizzes/${selectedQuiz._id}`);
    } else if (mode === "speech") {
      navigate(`/quiz/${selectedQuiz._id}/speech`);
    }
    
    setShowModeSelector(false);
    setSelectedQuiz(null);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: "bg-green-500/20 text-green-600 border-green-500/30",
      Medium: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      Hard: "bg-red-500/20 text-red-600 border-red-500/30",
      Mixed: "bg-purple-500/20 text-purple-600 border-purple-500/30",
    };
    return colors[difficulty] || colors.Mixed;
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">{trend}</span>
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const QuizCard = ({ quiz }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {quiz.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
                  quiz.difficulty
                )}`}
              >
                {quiz.difficulty || "Mixed"}
              </span>
              {quiz.category && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-600 border border-blue-500/30">
                  {quiz.category}
                </span>
              )}
              {quiz.quizType === "speech" && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-600 border border-purple-500/30 flex items-center gap-1">
                  🎤 Speech Quiz
                </span>
              )}
              {quiz.isPublic ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-600 border border-green-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Public
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-600 border border-gray-500/30 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Private
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-gray-200/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs">Questions</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {quiz.questions?.length || 0}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Attempts</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {quiz.stats?.timesTaken || 0}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs">Avg Score</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {quiz.stats?.averageScore
                ? `${Math.round(quiz.stats.averageScore)}%`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Calendar className="w-4 h-4" />
          <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedQuiz(quiz);
              setShowModeSelector(true);
            }}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => navigate(`/quiz-results/${quiz._id}`)}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            <BarChart3 className="w-4 h-4" />
            Results
          </button>
          <button
            onClick={() => handleDuplicateQuiz(quiz)}
            className="px-4 py-2 bg-blue-500/10 text-blue-600 rounded-xl font-semibold hover:bg-blue-500/20 transition-all duration-300 border border-blue-500/30"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setQuizToDelete(quiz);
              setShowDeleteModal(true);
            }}
            className="px-4 py-2 bg-red-500/10 text-red-600 rounded-xl font-semibold hover:bg-red-500/20 transition-all duration-300 border border-red-500/30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                My Quizzes
              </h1>
              <p className="text-gray-600">
                Manage and track your created quizzes
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchMyQuizzes}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={() => navigate("/quiz-maker")}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Create Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            label="Total Quizzes"
            value={stats.totalQuizzes}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            icon={Users}
            label="Total Attempts"
            value={stats.totalAttempts || stats.totalTakes || 0}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Unique Students"
            value={stats.uniqueStudents}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="createdAt">Newest First</option>
              <option value="-createdAt">Oldest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="-title">Title (Z-A)</option>
              <option value="-stats.timesTaken">Most Attempts</option>
            </select>

            {/* Filter by Difficulty */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>

            {/* Filter by Quiz Type */}
            <select
              value={filterQuizType}
              onChange={(e) => setFilterQuizType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="all">All Types</option>
              <option value="standard">Standard Quizzes</option>
              <option value="speech">🎤 Speech Quizzes</option>
              <option value="pdf">PDF Quizzes</option>
              <option value="file">File-based Quizzes</option>
              <option value="adaptive">Adaptive Quizzes</option>
            </select>
          </div>
        </div>

        {/* Quiz Grid */}
        {filteredQuizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/50 shadow-lg text-center"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Quizzes Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterDifficulty !== "all"
                ? "Try adjusting your filters"
                : "Create your first quiz to get started!"}
            </p>
            <button
              onClick={() => navigate("/quiz-maker")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Create Your First Quiz
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredQuizzes.map((quiz) => (
                <QuizCard key={quiz._id} quiz={quiz} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Delete Quiz?
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to delete "{quizToDelete?.title}"? This
                  action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteQuiz}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Mode Selector */}
      <QuizModeSelector
        isOpen={showModeSelector}
        onClose={() => {
          setShowModeSelector(false);
          setSelectedQuiz(null);
        }}
        onSelect={handleModeSelect}
        quizTitle={selectedQuiz?.title || ""}
      />
    </div>
  );
};

export default MyQuizzes;
