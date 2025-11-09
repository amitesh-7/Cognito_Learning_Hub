import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { useSound } from "../hooks/useSound";
import LoadingSpinner from "../components/LoadingSpinner";
import LiveLeaderboard from "../components/LiveLeaderboard";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Volume2,
  VolumeX,
} from "lucide-react";

const LiveSessionJoin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { socket, isConnected, connectionError } = useSocket();
  const { user } = useAuth();
  const { play, toggleMute, isMuted } = useSound();

  // Join form state
  const [sessionCode, setSessionCode] = useState(
    searchParams.get("code") || ""
  );
  const [hasJoined, setHasJoined] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Session state
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizEnded, setQuizEnded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Connect socket when component mounts
  useEffect(() => {
    if (socket && !socket.connected) {
      console.log("🔌 Connecting socket for live session...");
      socket.connect();
    }

    return () => {
      // Disconnect when leaving the page
      if (socket && socket.connected) {
        console.log("🔌 Disconnecting socket...");
        socket.disconnect();
      }
    };
  }, [socket]);

  // Join session
  const handleJoinSession = useCallback(async () => {
    // Prevent duplicate joins
    if (hasJoined) {
      console.log("⚠️ Already joined, skipping duplicate join attempt");
      return;
    }

    if (!sessionCode || sessionCode.length !== 6) {
      setJoinError("Please enter a valid 6-character session code");
      return;
    }

    if (!socket || !isConnected) {
      setJoinError("Not connected to server. Please wait...");
      return;
    }

    // Handle both user.id and user._id formats
    const userId = user?._id || user?.id;

    if (!userId) {
      setJoinError("User not authenticated. Please log in.");
      return;
    }

    console.log("🎯 Joining session:", sessionCode);
    console.log("👤 User ID:", userId, "Name:", user.name);
    console.log("🔌 Socket ID:", socket.id, "Connected:", socket.connected);
    setJoinError("");

    socket.emit(
      "join-session",
      {
        sessionCode: sessionCode.toUpperCase(),
        userId: userId,
        username: user.name,
        avatar: user.profilePicture || null,
      },
      (response) => {
        console.log("📡 Join session response:", response);
        if (response.success) {
          console.log("✅ Joined session successfully");
          setSession(response.session);
          setHasJoined(true);
        } else {
          console.error("❌ Failed to join:", response.error);
          setJoinError(response.error || "Failed to join session");
        }
      }
    );
  }, [socket, isConnected, sessionCode, user, hasJoined]);

  // Auto-join if code in URL
  useEffect(() => {
    if (searchParams.get("code") && !hasJoined && socket && isConnected) {
      handleJoinSession();
    }
  }, [searchParams, hasJoined, socket, isConnected, handleJoinSession]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !hasJoined) return;

    // Quiz started
    socket.on(
      "quiz-started",
      ({ questionIndex, question, totalQuestions: total, timestamp }) => {
        console.log("🚀 Quiz started! Question:", questionIndex + 1);
        setCurrentQuestion(question);
        setCurrentQuestionIndex(questionIndex);
        setTotalQuestions(total);
        setHasAnswered(false);
        setSelectedAnswer("");
        setAnswerResult(null);
        setTimeLeft(30);
      }
    );

    // Next question
    socket.on(
      "question-started",
      ({ questionIndex, question, totalQuestions: total, timestamp }) => {
        console.log("➡️ Next question:", questionIndex + 1);
        setCurrentQuestion(question);
        setCurrentQuestionIndex(questionIndex);
        setTotalQuestions(total);
        setHasAnswered(false);
        setSelectedAnswer("");
        setAnswerResult(null);
        setTimeLeft(30);
      }
    );

    // Leaderboard updated
    socket.on(
      "leaderboard-updated",
      ({ leaderboard: newLeaderboard, questionIndex }) => {
        console.log("🏆 Leaderboard updated");
        setLeaderboard(newLeaderboard);
      }
    );

    // Session ended
    socket.on(
      "session-ended",
      ({
        leaderboard: finalLeaderboard,
        totalParticipants,
        totalQuestions: total,
      }) => {
        console.log("🏁 Quiz ended!");
        setLeaderboard(finalLeaderboard);
        setTotalQuestions(total);
        setQuizEnded(true);

        // Show confetti if user is in top 3
        const myRank =
          finalLeaderboard.findIndex((entry) => entry.userId === user._id) + 1;
        if (myRank > 0 && myRank <= 3) {
          setShowConfetti(true);
          // Stop confetti after 5 seconds
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    );

    // Host disconnected
    socket.on("host-disconnected", ({ message }) => {
      console.warn("⚠️ Host disconnected");
      alert(message);
      navigate("/dashboard");
    });

    return () => {
      socket.off("quiz-started");
      socket.off("question-started");
      socket.off("leaderboard-updated");
      socket.off("session-ended");
      socket.off("host-disconnected");
    };
  }, [socket, hasJoined, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!currentQuestion || hasAnswered || quizEnded) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit empty answer when time runs out
          handleSubmitAnswer("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, hasAnswered, quizEnded]);

  // Submit answer
  const handleSubmitAnswer = useCallback(
    (answer) => {
      if (hasAnswered || !currentQuestion) return;

      const timeTaken = 30 - timeLeft;
      const userId = user?._id || user?.id;

      console.log("📝 Submitting answer:", answer);
      console.log("👤 User ID for submission:", userId);

      if (!userId) {
        console.error("❌ No user ID available");
        return;
      }

      socket.emit(
        "submit-answer",
        {
          sessionCode: sessionCode.toUpperCase(),
          userId: userId,
          questionIndex: currentQuestionIndex,
          answer: answer,
          timeSpent: timeTaken,
        },
        (response) => {
          console.log("✅ Answer submitted:", response);

          if (!response.success) {
            console.error("❌ Answer submission failed:", response.error);
            return;
          }

          setHasAnswered(true);
          setAnswerResult(response);

          // Play sound effect based on correctness
          if (response.isCorrect) {
            play("correct");
          } else {
            play("incorrect");
          }
        }
      );
    },
    [
      socket,
      sessionCode,
      user,
      currentQuestionIndex,
      hasAnswered,
      currentQuestion,
      timeLeft,
      play,
    ]
  );

  // Handle answer selection
  const handleAnswerClick = (option) => {
    if (hasAnswered) return;
    setSelectedAnswer(option);
    handleSubmitAnswer(option);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-purple-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Login Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Please login to join a live session
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Join Form
  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Join Live Quiz
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enter the 6-character session code
            </p>
          </div>

          {connectionError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {connectionError}
              </p>
            </div>
          )}

          {joinError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {joinError}
              </p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Code
            </label>
            <input
              type="text"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white uppercase"
            />
          </div>

          <button
            onClick={handleJoinSession}
            disabled={!isConnected || sessionCode.length !== 6}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {!isConnected ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Join Session
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Waiting Room
  if (hasJoined && !currentQuestion && !quizEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-purple-900 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            You're In!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Waiting for the host to start the quiz...
          </p>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz Ended
  if (quizEnded) {
    const myRank =
      leaderboard.findIndex((entry) => entry.userId === user._id) + 1;
    const myScore =
      leaderboard.find((entry) => entry.userId === user._id)?.score || 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-8 px-4">
        {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center mb-6"
          >
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Quiz Complete!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Great job completing the quiz!
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Your Rank
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  #{myRank}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Your Score
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {myScore.toFixed(1)}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-bold transition shadow-lg hover:shadow-xl"
            >
              Back to Dashboard
            </button>
          </motion.div>

          <LiveLeaderboard leaderboard={leaderboard} />
        </div>
      </div>
    );
  }

  // Active Quiz
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} / {totalQuestions}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title={isMuted() ? "Unmute sounds" : "Mute sounds"}
              >
                {isMuted() ? (
                  <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <div className="flex items-center gap-2">
                <Clock
                  className={`w-5 h-5 ${
                    timeLeft <= 10
                      ? "text-red-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
                <span
                  className={`text-2xl font-bold ${
                    timeLeft <= 10
                      ? "text-red-500 animate-pulse"
                      : "text-gray-800 dark:text-white"
                  }`}
                >
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
            {currentQuestion?.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = answerResult?.correctAnswer === option;
              const showResult = hasAnswered;

              let buttonClass =
                "p-6 rounded-xl border-2 transition-all transform hover:scale-105 cursor-pointer ";

              if (showResult) {
                if (isCorrect) {
                  buttonClass +=
                    "border-green-500 bg-green-50 dark:bg-green-900/20";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20";
                } else {
                  buttonClass +=
                    "border-gray-300 dark:border-gray-600 opacity-60";
                }
              } else {
                buttonClass += isSelected
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105"
                  : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(option)}
                  disabled={hasAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        showResult && isCorrect
                          ? "bg-green-500 text-white"
                          : showResult && isSelected && !isCorrect
                          ? "bg-red-500 text-white"
                          : isSelected
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg font-medium text-gray-800 dark:text-white flex-1 text-left">
                      {option}
                    </span>
                    {showResult && isCorrect && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Answer Result */}
          {answerResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-6 rounded-xl ${
                answerResult.isCorrect
                  ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-500"
                  : "bg-red-50 dark:bg-red-900/20 border-2 border-red-500"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {answerResult.isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <h3
                  className={`text-xl font-bold ${
                    answerResult.isCorrect
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {answerResult.isCorrect ? "Correct!" : "Incorrect"}
                </h3>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    +{(answerResult.pointsEarned || 0).toFixed(1)} pts
                  </div>
                  {answerResult.streakBonus > 0 && (
                    <div className="text-sm text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1 justify-end">
                      🔥 +{answerResult.streakBonus} streak bonus!
                    </div>
                  )}
                </div>
              </div>
              {answerResult.explanation && (
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Explanation:</strong> {answerResult.explanation}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Mini Leaderboard */}
        {leaderboard.length > 0 && (
          <LiveLeaderboard leaderboard={leaderboard.slice(0, 5)} compact />
        )}
      </div>
    </div>
  );
};

export default LiveSessionJoin;
