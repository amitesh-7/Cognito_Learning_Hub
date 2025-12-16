import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag,
  CheckCircle,
  XCircle,
  Trophy,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Star,
  FileText,
  Copy,
  Download,
  BarChart,
  Home,
  RotateCcw,
  Share2,
  Zap,
  Target,
  Flame,
  Sparkles,
  Brain,
  Award,
  TrendingUp,
  Heart,
} from "lucide-react";
import Confetti from "react-confetti";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Progress from "../components/ui/Progress";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { LoadingSpinner } from "../components/ui/Loading";
import { useToast } from "../components/ui/Toast";
import { cn, fadeInUp, staggerContainer, staggerItem } from "../lib/utils";
import ReportModal from "../components/ReportModal";
import TextToSpeech from "../components/TextToSpeech";
import { useGamification } from "../context/GamificationContext";

export default function QuizTaker() {
  const { quizId } = useParams();
  const { user } = useContext(AuthContext);
  const { success, error: showError } = useToast();
  const { refreshData } = useGamification();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Track all answers for detailed results
  const [questionResults, setQuestionResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const hasSubmittedRef = useRef(false);

  const [showReportModal, setShowReportModal] = useState(false);

  // Sound effects
  const correctSound = new Audio("/sounds/correct.mp3");
  const incorrectSound = new Audio("/sounds/incorrect.mp3");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("quizwise-token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/quizzes/${quizId}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        if (!response.ok) throw new Error("Quiz not found.");
        const data = await response.json();

        // Normalize question data - ensure correct_answer exists (backend sends correctAnswer)
        if (data.questions) {
          data.questions = data.questions.map((q) => ({
            ...q,
            correct_answer: q.correct_answer || q.correctAnswer,
            correctAnswer: q.correctAnswer || q.correct_answer,
          }));
        }

        setQuiz(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (isFinished && quiz && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true; // Prevent double submission

      console.log("🎮 Quiz finished! Preparing to submit...");
      console.log("Score:", score, "Questions:", quiz.questions.length);
      console.log("Question Results:", questionResults);

      const submitScore = async () => {
        try {
          const token = localStorage.getItem("quizwise-token");
          if (!token) {
            console.error("No auth token found!");
            return;
          }

          const API_URL = import.meta.env.VITE_API_URL;
          console.log("API URL:", API_URL);

          const percentage = Math.round((score / quiz.questions.length) * 100);
          const totalTimeTaken = questionResults.reduce(
            (acc, q) => acc + (q.timeTaken || 0),
            0
          );

          // XP calculation now handled by backend with proper difficulty multipliers

          // Build answers array in the format expected by result-service
          // Schema expects: questionId, selectedAnswer, isCorrect, points, timeSpent
          const answers =
            questionResults.length > 0
              ? questionResults.map((qr, index) => {
                  const question = quiz.questions[index];
                  const questionPoints = question?.points || 1; // Use actual question points
                  return {
                    questionId: question?._id || `q-${index}`,
                    selectedAnswer: qr.userAnswer,
                    isCorrect: qr.isCorrect,
                    points: qr.isCorrect ? questionPoints : 0,
                    timeSpent: Math.round((qr.timeTaken || 0) * 1000), // Convert to milliseconds
                  };
                })
              : quiz.questions.map((q, index) => ({
                  questionId: q._id || `q-${index}`,
                  selectedAnswer: "not_answered",
                  isCorrect: false,
                  points: 0,
                  timeSpent: 0,
                }));

          const now = new Date();
          const startTime = new Date(now.getTime() - (totalTimeTaken || 60000));

          const resultData = {
            quizId: quiz._id,
            answers: answers,
            startedAt: startTime.toISOString(),
            completedAt: now.toISOString(),
            quizMetadata: {
              title: quiz.title,
              category: quiz.category || "General",
              difficulty: quiz.difficulty || "medium",
            },
          };

          console.log("📤 Submitting quiz result:", resultData);

          // Submit quiz result to result-service
          const submitRes = await fetch(`${API_URL}/api/results/submit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
            body: JSON.stringify(resultData),
          });

          console.log("📥 Response status:", submitRes.status);

          if (submitRes.ok) {
            const submitData = await submitRes.json();
            console.log("✅ Quiz result submitted successfully:", submitData);

            // Complete quest if this was a quest quiz
            try {
              // Check if quiz has realm tag (realm quest)
              if (quiz.tags && quiz.tags.length > 0) {
                const realmName = quiz.tags.find(
                  (tag) =>
                    tag.includes("Kingdom") ||
                    tag.includes("Universe") ||
                    tag.includes("Lab") ||
                    tag.includes("Forest") ||
                    tag.includes("Hub") ||
                    tag.includes("Archives") ||
                    tag.includes("Realm") ||
                    tag.includes("Valley") ||
                    tag.includes("Wizardry") ||
                    tag.includes("Sanctuary") ||
                    tag.includes("Fortress") ||
                    tag.includes("Citadel") ||
                    tag.includes("Highlands")
                );

                // Extract quest number from title like "Mathematics Kingdom Quest 1 Quiz"
                const questMatch = quiz.title?.match(/Quest (\d+)/);
                if (realmName && questMatch) {
                  const questId = `demo-${realmName}-${questMatch[1]}`;
                  console.log("🏆 Completing quest:", questId);

                  const completeRes = await fetch(
                    `${API_URL}/api/gamification/quests/${encodeURIComponent(
                      questId
                    )}/complete`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": token,
                      },
                      body: JSON.stringify({
                        score: score,
                        maxScore: quiz.questions.length,
                        timeTaken: Math.floor((now - startTime) / 1000),
                        resultId: submitData.data?._id || submitData.resultId,
                      }),
                    }
                  );

                  if (completeRes.ok) {
                    console.log("✅ Quest marked as complete!");
                  } else if (completeRes.status === 404) {
                    // Demo quests are not stored server-side; ignore the missing quest gracefully
                    console.warn(
                      "⚠️ Quest completion skipped: demo quest not registered in gamification service"
                    );
                  } else {
                    console.warn(
                      "⚠️ Quest completion failed:",
                      completeRes.status,
                      await completeRes.text()
                    );
                  }
                }
              }
            } catch (questErr) {
              console.warn("⚠️ Failed to mark quest complete:", questErr);
            }

            // Result-service automatically notifies gamification-service
            // Just refresh UI and show success message
            if (refreshData) {
              // Delay refresh to allow gamification service to process
              setTimeout(() => refreshData(), 1000);
            }

            // Calculate XP earned (estimate based on score)
            const xpEarned = submitData.experienceGained || score * 10;
            success(`Quiz completed! +${xpEarned} XP earned!`);
          } else {
            let errorText;
            try {
              const errorData = await submitRes.json();
              errorText = JSON.stringify(errorData);
              console.error(
                "❌ Failed to submit quiz result:",
                submitRes.status,
                errorData
              );
            } catch (e) {
              errorText = await submitRes.text();
              console.error(
                "❌ Failed to submit quiz result:",
                submitRes.status,
                errorText
              );
            }
            // Still show completion even if submission failed
            success(
              `Quiz completed! (Score: ${score}/${quiz.questions.length})`
            );
          }
        } catch (err) {
          console.error("❌ Failed to submit score:", err);
          // Still show completion even if submission failed
          success(`Quiz completed! (Score: ${score}/${quiz.questions.length})`);
        }
      };
      submitScore();
    }
  }, [isFinished, quiz, score, questionResults, refreshData, success]);

  // Timer logic
  useEffect(() => {
    if (!selectedAnswer && !isFinished && quiz) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAnswerSelect(null); // Timeout counts as wrong answer
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, selectedAnswer, isFinished, quiz]);

  const handleAnswerSelect = (option) => {
    if (selectedAnswer) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.correct_answer;
    const isCorrect = option === correctAnswer;
    const timeTaken = (Date.now() - questionStartTime) / 1000;

    // Track this question result
    setQuestionResults((prev) => [
      ...prev,
      {
        questionId: currentQuestion._id,
        questionText: currentQuestion.question,
        userAnswer: option || "timeout",
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        timeTaken: timeTaken,
        options: currentQuestion.options,
      },
    ]);

    setSelectedAnswer(option || "timeout"); // Mark as timeout if no option
    if (isCorrect) {
      setScore((prev) => prev + 1);
      correctSound.play();
    } else {
      incorrectSound.play();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(30); // Reset timer
      setQuestionStartTime(Date.now()); // Reset question start time
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsFinished(false);
    setTimeLeft(30);
    setQuestionResults([]);
    setQuestionStartTime(Date.now());
    hasSubmittedRef.current = false; // Allow re-submission on restart
  };

  // Enhanced loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Card className="p-10 text-center shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl max-w-md">
            <div className="relative mb-8">
              {/* Animated brain icon */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <Brain className="w-20 h-20 mx-auto text-indigo-600 dark:text-indigo-400" />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-30"
                />
              </motion.div>

              {/* Floating sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [0, (Math.random() - 0.5) * 100],
                    y: [0, (Math.random() - 0.5) * 100],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  className="absolute top-1/2 left-1/2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </motion.div>
              ))}
            </div>

            <motion.h3
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3"
            >
              Preparing Your Quiz
            </motion.h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Loading questions and setting up your challenge...
            </p>

            {/* Animated progress dots */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.4, 1],
                    backgroundColor: ["#818cf8", "#c084fc", "#818cf8"],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-3 h-3 rounded-full bg-indigo-400"
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-red-200/20 to-orange-200/20 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Card className="p-10 text-center max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative mb-8"
            >
              <div className="relative">
                <AlertTriangle className="w-20 h-20 mx-auto text-red-500 dark:text-red-400" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20"
                />
              </div>
            </motion.div>

            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 px-4">
              {error}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg px-8"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="w-full sm:w-auto border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-8"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Enhanced results screen
  if (isFinished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const isExcellent = percentage >= 90;
    const isGood = percentage >= 70;
    const isPassing = percentage >= 50;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative overflow-hidden">
        <Confetti
          recycle={false}
          numberOfPieces={
            isExcellent ? 400 : isGood ? 200 : isPassing ? 100 : 30
          }
          colors={
            isExcellent
              ? ["#fbbf24", "#f59e0b", "#d97706", "#f472b6", "#c084fc"]
              : undefined
          }
        />

        {/* Animated background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.3, 1, 1.3],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
          />

          {/* Floating achievement icons */}
          {isExcellent &&
            [...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: "100vh", opacity: 0 }}
                animate={{
                  y: "-100vh",
                  opacity: [0, 1, 1, 0],
                  x: Math.sin(i) * 100,
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
                className="absolute"
                style={{ left: `${10 + i * 12}%` }}
              >
                {i % 3 === 0 ? (
                  <Star className="w-8 h-8 text-amber-400/60" />
                ) : i % 3 === 1 ? (
                  <Trophy className="w-8 h-8 text-yellow-400/60" />
                ) : (
                  <Award className="w-8 h-8 text-purple-400/60" />
                )}
              </motion.div>
            ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-12">
          <motion.div
            className="max-w-3xl w-full mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 md:p-12 shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl overflow-hidden">
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10" />

              <CardContent className="relative space-y-10">
                {/* Trophy animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 150,
                    damping: 15,
                  }}
                  className="relative"
                >
                  <div className="relative inline-block mx-auto">
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(251, 191, 36, 0.3)",
                          "0 0 60px rgba(251, 191, 36, 0.5)",
                          "0 0 20px rgba(251, 191, 36, 0.3)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="rounded-full p-6 bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/50 dark:to-yellow-800/50"
                    >
                      <Trophy className="w-20 h-20 mx-auto text-amber-500" />
                    </motion.div>

                    {/* Sparkle effects around trophy */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.25,
                        }}
                        className="absolute"
                        style={{
                          top: `${
                            50 + Math.sin((i * 60 * Math.PI) / 180) * 60
                          }%`,
                          left: `${
                            50 + Math.cos((i * 60 * Math.PI) / 180) * 60
                          }%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Title section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    {isExcellent
                      ? "🎉 Outstanding!"
                      : isGood
                      ? "👏 Great Job!"
                      : isPassing
                      ? "💪 Good Effort!"
                      : "📚 Keep Learning!"}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300">
                    You've completed "{quiz.title}"
                  </p>
                </motion.div>

                {/* Score display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="relative"
                >
                  <div
                    className={`
                    relative p-8 rounded-3xl border-2 mx-auto max-w-sm
                    ${
                      isExcellent
                        ? "bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-300 dark:border-amber-600"
                        : isGood
                        ? "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-600"
                        : isPassing
                        ? "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-300 dark:border-blue-600"
                        : "bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-orange-300 dark:border-orange-600"
                    }
                  `}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.9,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <div className="text-7xl md:text-8xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {percentage}%
                      </div>
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-300 mt-2">
                        {score} / {quiz.questions.length} correct
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Stats grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-5 text-center border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {score}
                    </div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">
                      Correct
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-2xl p-5 text-center border border-red-200 dark:border-red-800">
                    <XCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {quiz.questions.length - score}
                    </div>
                    <div className="text-sm font-medium text-red-700 dark:text-red-300">
                      Incorrect
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-5 text-center border border-amber-200 dark:border-amber-800">
                    <Zap className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      +{score * 10}
                    </div>
                    <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      XP Earned
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-2xl p-5 text-center border border-purple-200 dark:border-purple-800">
                    <Target className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {percentage}%
                    </div>
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Accuracy
                    </div>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={restartQuiz}
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-xl px-8 py-4 text-lg"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Play Again
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/leaderboard")}
                      className="w-full sm:w-auto border-2 border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 px-8 py-4 text-lg"
                    >
                      <Trophy className="w-5 h-5 mr-2" />
                      Leaderboard
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => navigate("/quizzes")}
                      className="w-full sm:w-auto px-8 py-4 text-lg"
                    >
                      <Home className="w-5 h-5 mr-2" />
                      More Quizzes
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main quiz interface
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage =
    ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const timePercentage = (timeLeft / 30) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 4 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-6 px-4 relative z-10">
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          quiz={quiz}
          questionText={quiz?.questions[currentQuestionIndex]?.question}
        />

        {/* Enhanced Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <CardHeader className="pb-4 pt-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </motion.div>
                    <CardTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {quiz.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-500" />
                      Question {currentQuestionIndex + 1} of{" "}
                      {quiz.questions.length}
                    </span>
                    <span className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Score:{" "}
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {score}
                      </span>
                    </span>
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  {/* Animated timer */}
                  <motion.div
                    animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : {}}
                    transition={{
                      duration: 0.5,
                      repeat: timeLeft <= 10 ? Infinity : 0,
                    }}
                    className={cn(
                      "flex items-center gap-2 px-5 py-3 rounded-2xl font-bold shadow-xl transition-all duration-300 border-2",
                      timeLeft <= 10
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-300 dark:border-red-700"
                        : timeLeft <= 20
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-amber-300 dark:border-amber-700"
                        : "bg-gradient-to-r from-emerald-400 to-green-500 text-white border-emerald-300 dark:border-emerald-700"
                    )}
                  >
                    <Clock className="w-5 h-5" />
                    <span className="text-xl font-black tabular-nums">
                      {timeLeft}s
                    </span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowReportModal(true)}
                      title="Report this question"
                      className="h-12 w-12 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-all"
                    >
                      <Flag className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Progress section */}
              <div className="space-y-4 mt-8">
                {/* Question progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Progress
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    />
                    {/* Progress markers */}
                    <div className="absolute inset-0 flex">
                      {quiz.questions.map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 border-r border-white/30 last:border-r-0",
                            i < currentQuestionIndex && "bg-indigo-300/20"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time Remaining
                    </span>
                    <span
                      className={cn(
                        "font-bold",
                        timeLeft <= 10
                          ? "text-red-500"
                          : timeLeft <= 20
                          ? "text-amber-500"
                          : "text-emerald-500"
                      )}
                    >
                      {timeLeft}s
                    </span>
                  </div>
                  <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${timePercentage}%` }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-colors duration-300",
                        timeLeft <= 10
                          ? "bg-gradient-to-r from-red-500 to-pink-500"
                          : timeLeft <= 20
                          ? "bg-gradient-to-r from-amber-400 to-orange-500"
                          : "bg-gradient-to-r from-emerald-400 to-green-500"
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Enhanced Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="overflow-hidden shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
              {/* Question number badge */}
              <div className="absolute top-4 left-4 z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                  Q{currentQuestionIndex + 1}
                </motion.div>
              </div>

              <CardHeader className="bg-gradient-to-r from-indigo-100/80 to-purple-100/80 dark:from-indigo-900/40 dark:to-purple-900/40 py-10 pt-14">
                <div className="flex items-start justify-between gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1"
                  >
                    <CardTitle className="text-xl md:text-2xl leading-relaxed font-bold text-gray-800 dark:text-white">
                      {currentQuestion.question}
                    </CardTitle>
                  </motion.div>
                  <TextToSpeech
                    text={currentQuestion.question}
                    autoPlay={false}
                    className="flex-shrink-0"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-6 md:p-8">
                <motion.div
                  className="grid gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                    },
                  }}
                >
                  {currentQuestion.options.map((option, index) => {
                    const isCorrect = option === currentQuestion.correct_answer;
                    const isSelected = option === selectedAnswer;
                    const showResult = !!selectedAnswer;

                    return (
                      <motion.div
                        key={index}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 },
                        }}
                      >
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "w-full h-auto text-left justify-start transition-all duration-300 shadow-md hover:shadow-lg",
                            "px-6 py-5 text-base font-medium",
                            isSelected && !showResult && "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 ring-2 ring-purple-400 ring-offset-2",
                            isSelected && showResult && isCorrect && "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 ring-2 ring-green-400 ring-offset-2",
                            isSelected && showResult && !isCorrect && "bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 ring-2 ring-red-400 ring-offset-2",
                            !isSelected && "hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950 dark:hover:to-pink-950"
                          )}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={!!selectedAnswer}
                        >
                          <span className="flex items-center gap-4">
                            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 font-bold">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="flex-1">{option}</span>
                          </span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Next button */}
                {selectedAnswer && (
                  <motion.div
                    className="flex justify-center mt-10"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleNextQuestion}
                        size="lg"
                        className="px-10 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-2xl text-lg font-bold rounded-2xl group"
                      >
                        {currentQuestionIndex < quiz.questions.length - 1 ? (
                          <>
                            Next Question
                            <motion.span
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="ml-2"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </motion.span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-6 h-6 mr-2" />
                            Complete Quiz
                            <Trophy className="w-6 h-6 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
