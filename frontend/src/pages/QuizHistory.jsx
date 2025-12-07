import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import {
  History,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  Star,
  Award,
  BarChart3,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Progress from "../components/ui/Progress";
import { LoadingSpinner } from "../components/ui/Loading";
import { Input } from "../components/ui/Input";

export default function QuizHistory() {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // all, passed, failed
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    avgScore: 0,
    totalXP: 0,
    bestScore: 0,
    perfectQuizzes: 0,
  });

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/results/my-results`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch results");

      const data = await response.json();
      setResults(data);

      // Calculate stats
      if (data.length > 0) {
        const totalScore = data.reduce((acc, r) => acc + (r.percentage || Math.round((r.score / r.totalQuestions) * 100)), 0);
        const perfectCount = data.filter((r) => r.score === r.totalQuestions).length;
        const totalXP = data.reduce((acc, r) => acc + (r.experienceGained || 0), 0);
        const bestScore = Math.max(...data.map((r) => r.percentage || Math.round((r.score / r.totalQuestions) * 100)));

        setStats({
          totalQuizzes: data.length,
          avgScore: Math.round(totalScore / data.length),
          totalXP,
          bestScore,
          perfectQuizzes: perfectCount,
        });
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to load quiz history");
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((result) => {
    const percentage = result.percentage || Math.round((result.score / result.totalQuestions) * 100);
    const matchesSearch = result.quiz?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "passed" && percentage >= 60) ||
      (filterBy === "failed" && percentage < 60);
    return matchesSearch && matchesFilter;
  });

  const getRankColor = (rank) => {
    switch (rank) {
      case "A+":
        return "from-yellow-400 to-amber-500";
      case "A":
        return "from-green-400 to-emerald-500";
      case "B+":
        return "from-blue-400 to-indigo-500";
      case "B":
        return "from-purple-400 to-violet-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-violet-950 flex items-center justify-center">
        <LoadingSpinner size="xl" className="text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-violet-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
              <History className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Quiz History
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your progress and review past attempts
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
                  <p className="text-xs opacity-80">Quizzes Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgScore}%</p>
                  <p className="text-xs opacity-80">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalXP}</p>
                  <p className="text-xs opacity-80">Total XP</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{stats.bestScore}%</p>
                  <p className="text-xs opacity-80">Best Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{stats.perfectQuizzes}</p>
                  <p className="text-xs opacity-80">Perfect Scores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "passed", "failed"].map((filter) => (
              <Button
                key={filter}
                variant={filterBy === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterBy(filter)}
                className={filterBy === filter ? "bg-violet-600 hover:bg-violet-700" : ""}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchResults}
              className="ml-2"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Results List */}
        {filteredResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <History className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No quiz history yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start taking quizzes to see your results here!
            </p>
            <Link to="/quizzes">
              <Button className="bg-violet-600 hover:bg-violet-700">
                Browse Quizzes
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredResults.map((result, index) => {
              const percentage = result.percentage || Math.round((result.score / result.totalQuestions) * 100);
              const passed = percentage >= 60;
              const isPerfect = result.score === result.totalQuestions;

              return (
                <motion.div
                  key={result._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/quiz/result/${result._id}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-violet-300 group cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {/* Rank Badge */}
                            <div
                              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getRankColor(
                                result.rank || (percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" : percentage >= 60 ? "B" : "C")
                              )} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                            >
                              {result.rank || (percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" : percentage >= 60 ? "B" : "C")}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-violet-600 transition-colors">
                                  {result.quiz?.title || "Unknown Quiz"}
                                </h3>
                                {isPerfect && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    ⭐ Perfect
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(result.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatTime(result.totalTimeTaken)}
                                </span>
                                {result.experienceGained > 0 && (
                                  <span className="flex items-center gap-1 text-amber-600">
                                    <Star className="w-4 h-4" />
                                    +{result.experienceGained} XP
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Score Section */}
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                {passed ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                )}
                                <span
                                  className={`text-2xl font-bold ${
                                    passed ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {percentage}%
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {result.score}/{result.totalQuestions} correct
                              </p>
                            </div>

                            <div className="w-24">
                              <Progress
                                value={percentage}
                                className={`h-2 ${passed ? "bg-green-100" : "bg-red-100"}`}
                              />
                            </div>

                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
