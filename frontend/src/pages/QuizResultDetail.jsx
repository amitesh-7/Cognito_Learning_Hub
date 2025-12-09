import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import {
  Trophy,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Star,
  Award,
  BarChart3,
  Calendar,
  Timer,
  TrendingUp,
  Share2,
  Download,
  RotateCcw,
  Home,
  MessageCircle,
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

export default function QuizResultDetail() {
  const { resultId } = useParams();
  const { user } = useContext(AuthContext);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview, questions

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/results/${resultId}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch result");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error fetching result:", err);
      setError("Failed to load quiz result");
    } finally {
      setLoading(false);
    }
  };

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

  const getRankEmoji = (rank) => {
    switch (rank) {
      case "A+":
        return "🏆";
      case "A":
        return "🥇";
      case "B+":
        return "🥈";
      case "B":
        return "🥉";
      default:
        return "📝";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
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

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-violet-950 flex items-center justify-center">
        <Card className="p-8 text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Result</h2>
          <p className="text-gray-500 mb-4">{error || "Result not found"}</p>
          <Link to="/quiz-history">
            <Button>Back to History</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const percentage =
    result.percentage ||
    Math.round((result.score / result.totalQuestions) * 100);
  const passed = percentage >= 60;
  const isPerfect = result.score === result.totalQuestions;
  const rank =
    result.rank ||
    (percentage >= 90
      ? "A+"
      : percentage >= 80
      ? "A"
      : percentage >= 70
      ? "B+"
      : percentage >= 60
      ? "B"
      : "C");

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-violet-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/quiz-history">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to History
            </Button>
          </Link>
        </motion.div>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            className={`mb-8 overflow-hidden border-2 ${
              passed ? "border-green-200" : "border-red-200"
            }`}
          >
            <div
              className={`h-2 bg-gradient-to-r ${
                passed
                  ? "from-green-400 to-emerald-500"
                  : "from-red-400 to-rose-500"
              }`}
            />
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Quiz Info */}
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {result.quiz?.title || "Quiz Result"}
                  </h1>
                  <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(result.createdAt)}
                  </p>
                </div>

                {/* Score Circle */}
                <div className="relative">
                  <div
                    className={`w-32 h-32 rounded-full bg-gradient-to-br ${getRankColor(
                      rank
                    )} flex items-center justify-center shadow-2xl`}
                  >
                    <div className="text-center text-white">
                      <div className="text-4xl font-bold">{percentage}%</div>
                      <div className="text-sm opacity-80">
                        {getRankEmoji(rank)} {rank}
                      </div>
                    </div>
                  </div>
                  {isPerfect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg"
                    >
                      <Star className="w-6 h-6 text-yellow-900 fill-yellow-900" />
                    </motion.div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-2xl font-bold">{result.score}</span>
                    </div>
                    <p className="text-sm text-gray-500">Correct</p>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                      <XCircle className="w-5 h-5" />
                      <span className="text-2xl font-bold">
                        {result.totalQuestions - result.score}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Wrong</p>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                      <Timer className="w-5 h-5" />
                      <span className="text-2xl font-bold">
                        {formatTime(result.totalTimeTaken)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Total Time</p>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                      <Star className="w-5 h-5" />
                      <span className="text-2xl font-bold">
                        +{result.experienceGained || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">XP Earned</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-6"
        >
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className={
              activeTab === "overview"
                ? "bg-violet-600 hover:bg-violet-700"
                : ""
            }
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === "questions" ? "default" : "outline"}
            onClick={() => setActiveTab("questions")}
            className={
              activeTab === "questions"
                ? "bg-violet-600 hover:bg-violet-700"
                : ""
            }
          >
            <Target className="w-4 h-4 mr-2" />
            All Questions ({result.totalQuestions})
          </Button>
        </motion.div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Performance Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-600" />
                    Performance Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Accuracy
                      </span>
                      <span className="font-semibold">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                            {result.score}
                          </p>
                          <p className="text-sm text-green-600">
                            Correct Answers
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                            {result.totalQuestions - result.score}
                          </p>
                          <p className="text-sm text-red-600">
                            Incorrect Answers
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                            {formatTime(result.averageTimePerQuestion)}
                          </p>
                          <p className="text-sm text-blue-600">
                            Avg per Question
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to={`/quiz/${result.quiz?._id}`}>
                  <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                    <RotateCcw className="w-4 h-4" />
                    Retry Quiz
                  </Button>
                </Link>
                <Link
                  to="/dashboard"
                  state={{
                    openStudyBuddy: true,
                    quizContext: {
                      quizTitle: result.quiz?.title,
                      score: result.score,
                      totalQuestions: result.totalQuestions,
                      percentage,
                    },
                  }}
                >
                  <Button className="gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white">
                    <MessageCircle className="w-4 h-4" />
                    Ask Study Buddy
                  </Button>
                </Link>
                <Link to="/quizzes">
                  <Button variant="outline" className="gap-2">
                    <Target className="w-4 h-4" />
                    Try Another Quiz
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" className="gap-2">
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {result.questionResults && result.questionResults.length > 0 ? (
                result.questionResults.map((qr, index) => (
                  <motion.div
                    key={qr.questionId || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`border-2 ${
                        qr.isCorrect
                          ? "border-green-200 bg-green-50/50"
                          : "border-red-200 bg-red-50/50"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Question Number */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                              qr.isCorrect ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div className="flex-1">
                            {/* Question Text */}
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                              {qr.questionText || `Question ${index + 1}`}
                            </h3>

                            {/* Options */}
                            <div className="grid gap-2 mb-4">
                              {qr.options?.map((option, optIndex) => {
                                const isUserAnswer = option === qr.userAnswer;
                                const isCorrectAnswer =
                                  option === qr.correctAnswer;
                                let optionClass =
                                  "p-3 rounded-lg border-2 transition-all ";

                                if (isCorrectAnswer) {
                                  optionClass +=
                                    "border-green-400 bg-green-100 dark:bg-green-900/30";
                                } else if (isUserAnswer && !qr.isCorrect) {
                                  optionClass +=
                                    "border-red-400 bg-red-100 dark:bg-red-900/30";
                                } else {
                                  optionClass +=
                                    "border-gray-200 bg-white dark:bg-gray-800";
                                }

                                return (
                                  <div key={optIndex} className={optionClass}>
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={
                                          isCorrectAnswer
                                            ? "font-semibold text-green-700 dark:text-green-400"
                                            : isUserAnswer && !qr.isCorrect
                                            ? "text-red-700 dark:text-red-400"
                                            : ""
                                        }
                                      >
                                        {option}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        {isCorrectAnswer && (
                                          <Badge className="bg-green-100 text-green-800">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Correct
                                          </Badge>
                                        )}
                                        {isUserAnswer && (
                                          <Badge
                                            className={
                                              qr.isCorrect
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }
                                          >
                                            Your Answer
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Time taken */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Timer className="w-4 h-4" />
                                Time: {formatTime(qr.timeTaken)}
                              </span>
                              <span
                                className={`flex items-center gap-1 ${
                                  qr.isCorrect
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {qr.isCorrect ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Correct
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4" />
                                    Incorrect
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Detailed Results Not Available
                  </h3>
                  <p className="text-gray-500">
                    Question-by-question breakdown is only available for quizzes
                    taken after the latest update.
                  </p>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
