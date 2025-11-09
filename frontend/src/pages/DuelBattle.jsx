import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Trophy,
  Zap,
  Clock,
  Target,
  User,
  X,
  Check,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import Confetti from "react-confetti";

const DuelBattle = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [matchState, setMatchState] = useState("searching"); // searching, waiting, ready, active, ended
  const [matchId, setMatchId] = useState(null);
  const [role, setRole] = useState(null); // player1 or player2
  const [opponent, setOpponent] = useState(null);
  const [quiz, setQuiz] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const [myScore, setMyScore] = useState({ score: 0, correct: 0, time: 0 });
  const [opponentScore, setOpponentScore] = useState({
    score: 0,
    correct: 0,
    time: 0,
  });

  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  const questionStartTime = useRef(null);
  const timerInterval = useRef(null);

  // Find match
  useEffect(() => {
    if (!socket || !isConnected || !user || !quizId) return;

    console.log("🔍 Searching for duel opponent...");

    socket.emit(
      "find-duel-match",
      {
        quizId,
        userId: user._id || user.id,
        username: user.name,
        avatar: user.profilePicture,
      },
      (response) => {
        if (response.success) {
          setMatchId(response.matchId);
          setRole(response.role);

          if (response.waiting) {
            setMatchState("waiting");
            console.log("⏳ Waiting for opponent...");
          } else {
            setMatchState("matched");
            console.log("✅ Opponent found!");
          }
        } else {
          console.error("❌ Failed to find match:", response.error);
          alert("Failed to find match: " + response.error);
          navigate("/duel");
        }
      }
    );
  }, [socket, isConnected, user, quizId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("match-found", (data) => {
      console.log("🎮 Match found:", data);
      setQuiz(data.quiz);

      const userId = user._id || user.id;
      if (data.opponent.player1.userId === userId) {
        setOpponent(data.opponent.player2);
      } else {
        setOpponent(data.opponent.player1);
      }

      setMatchState("ready");
    });

    socket.on("player-ready", (data) => {
      console.log("✅ Player ready:", data.userId);
    });

    socket.on("duel-started", (data) => {
      console.log("🎯 Duel started!");
      setCurrentQuestion(data.currentQuestion);
      setQuestionIndex(data.currentQuestion.index);
      setTimeLeft(data.currentQuestion.timeLimit);
      setMatchState("active");
      questionStartTime.current = Date.now();
      setHasAnswered(false);
      setSelectedAnswer(null);
    });

    socket.on("next-question", (data) => {
      console.log("➡️ Next question");
      setCurrentQuestion(data.currentQuestion);
      setQuestionIndex(data.currentQuestion.index);
      setTimeLeft(data.currentQuestion.timeLimit);
      questionStartTime.current = Date.now();
      setHasAnswered(false);
      setSelectedAnswer(null);
      setWaitingForOpponent(false); // Reset waiting state
    });

    socket.on("player-completed", (data) => {
      console.log("✅ You finished! Waiting for opponent...");
      setWaitingForOpponent(true);
    });

    socket.on("duel-ended", (data) => {
      console.log("🏁 Duel ended:", data);
      const userId = user._id || user.id;
      const myData =
        data.finalScores.player1.userId === userId
          ? data.finalScores.player1
          : data.finalScores.player2;
      const oppData =
        data.finalScores.player1.userId === userId
          ? data.finalScores.player2
          : data.finalScores.player1;

      setMyScore(myData);
      setOpponentScore(oppData);
      setWinner(data.winner);
      setMatchState("ended");

      if (data.winner === userId) {
        setShowConfetti(true);
      }
    });

    socket.on("opponent-disconnected", (data) => {
      console.log("🚪 Opponent disconnected");
      setWinner(data.winner);
      setMatchState("ended");

      const userId = user._id || user.id;
      if (data.winner === userId) {
        setShowConfetti(true);
      }
    });

    return () => {
      socket.off("match-found");
      socket.off("player-ready");
      socket.off("duel-started");
      socket.off("next-question");
      socket.off("player-completed");
      socket.off("duel-ended");
      socket.off("opponent-disconnected");
    };
  }, [socket, user]);

  // Timer
  useEffect(() => {
    if (matchState === "active" && !hasAnswered) {
      timerInterval.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval.current);
            // Auto-submit empty answer
            handleSubmitAnswer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval.current);
    }
  }, [matchState, hasAnswered]);

  const handleReady = () => {
    socket.emit(
      "duel-ready",
      {
        matchId,
        userId: user._id || user.id,
      },
      (response) => {
        if (response.success) {
          console.log("✅ Marked as ready");
        }
      }
    );
  };

  const handleSubmitAnswer = (answer) => {
    if (hasAnswered) return;

    const timeSpent = Math.floor(
      (Date.now() - questionStartTime.current) / 1000
    );
    setHasAnswered(true);
    setSelectedAnswer(answer);
    clearInterval(timerInterval.current);

    socket.emit(
      "duel-answer",
      {
        matchId,
        userId: user._id || user.id,
        questionIndex,
        answer,
        timeSpent,
      },
      (response) => {
        if (response.success) {
          console.log(`${response.isCorrect ? "✅" : "❌"} Answer submitted`);

          setMyScore((prev) => ({
            score:
              prev.score + (response.isCorrect ? response.pointsEarned : 0),
            correct: prev.correct + (response.isCorrect ? 1 : 0),
            time: prev.time + timeSpent,
          }));
        }
      }
    );
  };

  const cancelMatch = () => {
    if (matchId) {
      socket.emit("cancel-duel", { matchId });
    }
    navigate("/duel");
  };

  // Searching state
  if (matchState === "searching" || !matchId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-red-50 dark:from-gray-900 dark:to-red-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Swords className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Searching for Opponent...
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Finding a worthy challenger...
          </p>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Waiting state
  if (matchState === "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-red-50 dark:from-gray-900 dark:to-red-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Waiting for Opponent...
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Match ID: <span className="font-mono font-bold">{matchId}</span>
          </p>
          <button
            onClick={cancelMatch}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-bold transition"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  // Ready state
  if (matchState === "ready" || matchState === "matched") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-red-50 dark:from-gray-900 dark:to-red-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl"
        >
          <div className="text-center mb-6">
            <Swords className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Opponent Found!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{quiz?.title}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4 text-center">
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="font-bold text-gray-800 dark:text-white">
                {user.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">You</p>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold text-red-500">VS</div>
            </div>

            <div className="bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl p-4 text-center">
              <User className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <p className="font-bold text-gray-800 dark:text-white">
                {opponent?.username || "Opponent"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Opponent
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-3">
              Battle Rules:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Most correct answers wins
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Fastest total time breaks ties
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                30 seconds per question
              </li>
            </ul>
          </div>

          <button
            onClick={handleReady}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl"
          >
            <Check className="w-6 h-6" />
            I'm Ready!
          </button>
        </motion.div>
      </div>
    );
  }

  // Active state
  if (matchState === "active" && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-red-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Score Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-500 text-white rounded-xl p-4 text-center">
              <p className="text-sm mb-1">You</p>
              <p className="text-2xl font-bold">{myScore.score}</p>
              <p className="text-xs opacity-80">{myScore.correct} correct</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-center">
              <div className="text-center">
                <Clock className="w-8 h-8 text-red-500 mx-auto mb-1" />
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {timeLeft}s
                </p>
              </div>
            </div>

            <div className="bg-red-500 text-white rounded-xl p-4 text-center">
              <p className="text-sm mb-1">Opponent</p>
              <p className="text-2xl font-bold">{opponentScore.score}</p>
              <p className="text-xs opacity-80">
                {opponentScore.correct} correct
              </p>
            </div>
          </div>

          {/* Question */}
          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6"
          >
            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Question {questionIndex + 1} / {quiz?.totalQuestions}
              </p>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmitAnswer(option)}
                  disabled={hasAnswered}
                  className={`p-6 rounded-xl text-left font-semibold transition shadow-lg hover:shadow-xl ${
                    hasAnswered
                      ? selectedAnswer === option
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-800 dark:text-white"
                  } disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              ))}
            </div>

            {waitingForOpponent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-center"
              >
                <p className="text-yellow-800 dark:text-yellow-300 font-semibold">
                  🎉 You've completed all questions!
                </p>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                  Waiting for opponent to finish...
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Ended state
  if (matchState === "ended") {
    const userId = user._id || user.id;
    const isWinner = winner === userId;
    const isTie = !winner;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-red-900 py-8 px-4">
        {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
          >
            <Trophy
              className={`w-20 h-20 mx-auto mb-4 ${
                isWinner
                  ? "text-yellow-500"
                  : isTie
                  ? "text-gray-400"
                  : "text-gray-300"
              }`}
            />

            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              {isWinner
                ? "🎉 Victory!"
                : isTie
                ? "🤝 Draw!"
                : "💪 Better Luck Next Time"}
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {isWinner
                ? "You won the duel!"
                : isTie
                ? "It's a tie!"
                : "Your opponent won this round"}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div
                className={`p-6 rounded-xl ${
                  isWinner
                    ? "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-500"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  You
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                  {myScore.score}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {myScore.correct} correct
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {myScore.time}s total
                </p>
              </div>

              <div
                className={`p-6 rounded-xl ${
                  !isWinner && !isTie
                    ? "bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border-2 border-red-500"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Opponent
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                  {opponentScore.score}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {opponentScore.correct} correct
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {opponentScore.time}s total
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/duel")}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold transition"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-bold transition"
              >
                Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return <LoadingSpinner />;
};

export default DuelBattle;
