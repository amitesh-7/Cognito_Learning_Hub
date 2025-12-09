import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Target,
  Award,
  Sparkles,
  Zap,
  History,
  RefreshCw,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useToast } from "../ui/Toast";
import { useNavigate } from "react-router-dom";

const TimeTravelMode = () => {
  const [pastAttempts, setPastAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retaking, setRetaking] = useState(false);
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPastAttempts();
  }, []);

  const fetchPastAttempts = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("quizwise-token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(
        `${API_URL}/api/results/time-travel/history`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPastAttempts(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Failed to load past attempts");
        setPastAttempts([]);
      }
    } catch (error) {
      console.error("Error fetching past attempts:", error);
      setPastAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeImprovement = async (quizId) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("quizwise-token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(
        `${API_URL}/api/results/time-travel/analyze/${quizId}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.data);
      } else {
        showError("Failed to analyze improvement");
      }
    } catch (error) {
      console.error("Error analyzing improvement:", error);
      showError("Failed to analyze improvement");
    }
  };

  const retakeQuiz = async (attempt) => {
    setRetaking(true);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("quizwise-token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(
        `${API_URL}/api/results/time-travel/retake/${attempt.quizId}`,
        {
          method: "POST",
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        success("Time travel initiated! Good luck!");
        navigate(`/quiz/${attempt.quizId}`, {
          state: { timeTravelMode: true, originalAttempt: attempt },
        });
      } else {
        const data = await response.json();
        showError(data.error || "Failed to initiate time travel");
      }
    } catch (error) {
      console.error("Error retaking quiz:", error);
      showError("Failed to initiate time travel");
    } finally {
      setRetaking(false);
    }
  };

  const getScoreTrend = (attempt) => {
    if (!attempt.previousAttempts || attempt.previousAttempts.length === 0) {
      return null;
    }

    const lastScore =
      attempt.previousAttempts[attempt.previousAttempts.length - 1].score;
    const currentScore = attempt.score;
    const diff = currentScore - lastScore;

    if (diff > 0) {
      return { direction: "up", value: diff, color: "text-green-600" };
    } else if (diff < 0) {
      return {
        direction: "down",
        value: Math.abs(diff),
        color: "text-red-600",
      };
    }
    return { direction: "same", value: 0, color: "text-gray-600" };
  };

  const AttemptCard = ({ attempt }) => {
    const trend = getScoreTrend(attempt);
    const attemptDate = new Date(attempt.completedAt);
    const isRecent = Date.now() - attemptDate < 7 * 24 * 60 * 60 * 1000; // Within 7 days

    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card className="p-6 hover:shadow-xl transition-all border-2 hover:border-purple-500">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{attempt.quizTitle}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{attemptDate.toLocaleDateString()}</span>
                {isRecent && (
                  <Badge className="bg-green-100 text-green-800 ml-2">
                    Recent
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">
                {attempt.score}%
              </div>
              {trend && trend.direction !== "same" && (
                <div className={`flex items-center gap-1 ${trend.color}`}>
                  {trend.direction === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {trend.direction === "up" ? "+" : "-"}
                    {trend.value}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Target className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <p className="text-lg font-bold">
                {attempt.correctAnswers}/{attempt.totalQuestions}
              </p>
              <p className="text-xs text-gray-600">Correct</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-purple-600" />
              <p className="text-lg font-bold">
                {Math.floor(attempt.timeTaken / 60)}m
              </p>
              <p className="text-xs text-gray-600">Time</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <History className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
              <p className="text-lg font-bold">{attempt.attemptNumber || 1}</p>
              <p className="text-xs text-gray-600">Attempt</p>
            </div>
          </div>

          {/* Improvement Potential */}
          {attempt.improvementPotential && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <p className="font-semibold text-purple-800 dark:text-purple-300">
                  Improvement Potential: {attempt.improvementPotential}%
                </p>
              </div>
              {attempt.weakTopics && attempt.weakTopics.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {attempt.weakTopics.slice(0, 3).map((topic, idx) => (
                    <Badge key={idx} className="bg-orange-100 text-orange-800">
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setSelectedAttempt(attempt);
                analyzeImprovement(attempt.quizId);
              }}
              variant="outline"
              className="flex-1"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analyze
            </Button>
            <Button
              onClick={() => retakeQuiz(attempt)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={retaking}
            >
              {retaking ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Time Travel
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white">
        <div className="flex items-center gap-4">
          <Clock className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">Time Travel Mode</h2>
            <p className="opacity-90">
              Revisit past quizzes, analyze your growth, and prove your
              improvement!
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pastAttempts.length}</p>
              <p className="text-sm text-gray-600">Total Attempts</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {
                  pastAttempts.filter(
                    (a) => getScoreTrend(a)?.direction === "up"
                  ).length
                }
              </p>
              <p className="text-sm text-gray-600">Improvements</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {pastAttempts.filter((a) => a.score >= 90).length}
              </p>
              <p className="text-sm text-gray-600">Perfect Scores</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {pastAttempts.reduce(
                  (sum, a) => sum + (a.improvementPotential || 0),
                  0
                )}
              </p>
              <p className="text-sm text-gray-600">Total Potential</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Past Attempts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : pastAttempts.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">No Past Attempts</h3>
          <p className="text-gray-600">
            Complete some quizzes to unlock Time Travel mode!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastAttempts.map((attempt) => (
            <AttemptCard key={attempt._id} attempt={attempt} />
          ))}
        </div>
      )}

      {/* Analysis Modal */}
      <AnimatePresence>
        {selectedAttempt && analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setSelectedAttempt(null);
              setAnalysis(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            >
              <Card className="border-0">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">Performance Analysis</h3>
                  </div>
                  <p className="opacity-90">{selectedAttempt.quizTitle}</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Score Comparison */}
                  <div>
                    <h4 className="font-bold text-lg mb-3">Score Progress</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-8 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedAttempt.score}%` }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                      <span className="text-2xl font-bold">
                        {selectedAttempt.score}%
                      </span>
                    </div>
                  </div>

                  {/* Strengths */}
                  {analysis.strengths && analysis.strengths.length > 0 && (
                    <div>
                      <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-green-600" />
                        Strengths
                      </h4>
                      <div className="space-y-2">
                        {analysis.strengths.map((strength, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                          >
                            <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {analysis.improvements &&
                    analysis.improvements.length > 0 && (
                      <div>
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-orange-600" />
                          Focus Areas
                        </h4>
                        <div className="space-y-2">
                          {analysis.improvements.map((improvement, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                            >
                              <ChevronRight className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm">{improvement}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAttempt(null);
                      setAnalysis(null);
                    }}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeTravelMode;
