import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Clock,
  CheckCircle,
  XCircle,
  Headphones,
  Play,
  Pause,
  SkipForward,
  Info,
} from "lucide-react";
import Confetti from "react-confetti";
import { useToast } from "../components/ui/Toast";
import { useAccessibility } from "../context/AccessibilityContext";

/**
 * Specialized Quiz Taker for Visually Impaired Users
 * Features:
 * - Instructions window first (skippable)
 * - Question read first, then options one by one
 * - Timer starts AFTER reading completes (like KBC)
 * - Clean, simple UI focused on audio experience
 * - Same keyboard shortcuts (1-4, R, O, H)
 */
export default function VisuallyImpairedQuizTaker() {
  const { quizId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { settings } = useAccessibility();

  // Quiz data
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [questionResults, setQuestionResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerStarted, setTimerStarted] = useState(false);
  const [score, setScore] = useState(0);

  // Audio state
  const [isReading, setIsReading] = useState(false);
  const [readingStage, setReadingStage] = useState("none"); // "none", "question", "option1", "option2", "option3", "option4", "complete"
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  // UI state
  const [showInstructions, setShowInstructions] = useState(true);
  const [quizEnded, setQuizEnded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initialize speech synthesis
  useEffect(() => {
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("quizwise-token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/quizzes/${quizId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch quiz");

        const data = await response.json();
        
        // Normalize question data - ensure correct_answer exists (backend sends correctAnswer)
        const normalizedQuiz = {
          ...data,
          questions: data.questions.map((q) => ({
            ...q,
            correct_answer: q.correct_answer || q.correctAnswer,
            correctAnswer: q.correctAnswer || q.correct_answer,
          })),
        };
        
        setQuiz(normalizedQuiz);
        setLoading(false);
      } catch (err) {
        showError(err.message || "Failed to load quiz");
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Read instructions automatically when quiz loads
  useEffect(() => {
    if (quiz && showInstructions && !isReading) {
      setTimeout(() => {
        speakText(
          `Welcome to ${quiz.title}. This is an accessible audio quiz. Listen carefully to each question and all four options before selecting your answer. Press Enter to start the quiz, or press Escape to skip these instructions.`,
          null
        );
      }, 1000);
    }
  }, [quiz, showInstructions]);

  // Speak text with Web Speech API
  const speakText = (text, onEnd) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.textToSpeech ? 0.9 : 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => {
      setIsReading(false);
      if (onEnd) onEnd();
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Read question and all options sequentially (KBC style)
  const readQuestionAndOptions = (questionIndex = currentQuestionIndex) => {
    const currentQuestion = quiz.questions[questionIndex];
    setReadingStage("question");
    setTimerStarted(false);
    setTimeLeft(30);

    // Read question first
    speakText(`Question ${questionIndex + 1}. ${currentQuestion.question}`, () => {
      // Wait 500ms, then read option A
      setTimeout(() => {
        setReadingStage("option1");
        speakText(`Option 1. ${currentQuestion.options[0]}`, () => {
          // Read option B
          setTimeout(() => {
            setReadingStage("option2");
            speakText(`Option 2. ${currentQuestion.options[1]}`, () => {
              // Read option C
              setTimeout(() => {
                setReadingStage("option3");
                speakText(`Option 3. ${currentQuestion.options[2]}`, () => {
                  // Read option D
                  setTimeout(() => {
                    setReadingStage("option4");
                    speakText(`Option 4. ${currentQuestion.options[3]}`, () => {
                      // All options read, start timer
                      setReadingStage("complete");
                      speakText("Timer starting now. Make your selection.", () => {
                        setTimerStarted(true);
                      });
                    });
                  }, 500);
                });
              }, 500);
            });
          }, 500);
        });
      }, 500);
    });
  };

  // Start quiz (after instructions)
  const startQuiz = () => {
    setShowInstructions(false);
    // Announce quiz start
    speakText(
      `Starting ${quiz.title}. ${quiz.questions.length} questions. Get ready.`,
      () => {
        setTimeout(() => readQuestionAndOptions(0), 1000);
      }
    );
  };

  // Skip instructions
  const skipInstructions = () => {
    setShowInstructions(false);
    setTimeout(() => readQuestionAndOptions(0), 500);
  };

  // Timer countdown
  useEffect(() => {
    if (!timerStarted || timeLeft <= 0 || selectedAnswer) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted, timeLeft, selectedAnswer]);

  // Handle timeout
  const handleTimeout = () => {
    speakText("Time's up!");
    setQuestionResults((prev) => [
      ...prev,
      {
        question: quiz.questions[currentQuestionIndex].question,
        selectedAnswer: "",
        correctAnswer: quiz.questions[currentQuestionIndex].correct_answer,
        isCorrect: false,
        timeTaken: 30,
      },
    ]);

    setTimeout(() => moveToNextQuestion(), 2000);
  };

  // Handle answer selection
  const handleAnswerSelect = (option) => {
    if (selectedAnswer || !timerStarted) return;

    setSelectedAnswer(option);
    setTimerStarted(false);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correct_answer;
    const timeTaken = 30 - timeLeft;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      speakText("Correct answer! Well done.");
    } else {
      speakText(`Incorrect. The correct answer was ${currentQuestion.correct_answer}.`);
    }

    setQuestionResults((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        selectedAnswer: option,
        correctAnswer: currentQuestion.correct_answer,
        isCorrect,
        timeTaken,
      },
    ]);

    setTimeout(() => moveToNextQuestion(), 3000);
  };

  // Move to next question
  const moveToNextQuestion = () => {
    setSelectedAnswer("");
    setReadingStage("none");

    if (currentQuestionIndex + 1 < quiz.questions.length) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeout(() => readQuestionAndOptions(nextIndex), 1000);
    } else {
      endQuiz();
    }
  };

  // End quiz
  const endQuiz = () => {
    setQuizEnded(true);
    setShowConfetti(true);

    const percentage = Math.round((score / quiz.questions.length) * 100);
    speakText(
      `Quiz completed! You scored ${score} out of ${quiz.questions.length}. That's ${percentage} percent.`
    );

    // Submit results
    submitResults();
  };

  // Submit quiz results
  const submitResults = async () => {
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/results/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quizId,
          score,
          totalQuestions: quiz.questions.length,
          results: questionResults,
        }),
      });

      if (response.ok) {
        success("Quiz results saved successfully!");
      }
    } catch (err) {
      console.error("Failed to submit results:", err);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showInstructions) {
        if (e.key === "Enter") startQuiz();
        if (e.key === "Escape") skipInstructions();
        return;
      }

      if (quizEnded) return;

      // Option selection (1-4)
      if (["1", "2", "3", "4"].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        if (quiz?.questions[currentQuestionIndex]?.options[optionIndex]) {
          handleAnswerSelect(quiz.questions[currentQuestionIndex].options[optionIndex]);
        }
      }

      // R - Re-read question
      if (e.key === "r" || e.key === "R") {
        const currentQuestion = quiz?.questions[currentQuestionIndex];
        if (currentQuestion) {
          speakText(currentQuestion.question);
        }
      }

      // O - Read all options
      if (e.key === "o" || e.key === "O") {
        readQuestionAndOptions();
      }

      // P - Pause/Resume reading
      if (e.key === "p" || e.key === "P") {
        if (synthRef.current) {
          if (isPaused) {
            synthRef.current.resume();
            setIsPaused(false);
          } else {
            synthRef.current.pause();
            setIsPaused(true);
          }
        }
      }

      // S - Stop reading
      if (e.key === "s" || e.key === "S") {
        if (synthRef.current) {
          synthRef.current.cancel();
          setIsReading(false);
          setReadingStage("complete");
          if (!timerStarted) setTimerStarted(true);
        }
      }

      // H - Help
      if (e.key === "h" || e.key === "H") {
        speakText(
          "Keyboard shortcuts: Press 1, 2, 3, or 4 to select options. Press R to repeat question. Press O to read all options again. Press P to pause or resume. Press S to skip reading and start timer."
        );
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showInstructions, quiz, currentQuestionIndex, selectedAnswer, quizEnded, isPaused, timerStarted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Headphones className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-2xl font-bold">Loading Accessible Quiz...</p>
        </div>
      </div>
    );
  }

  // Quiz failed to load
  if (!quiz) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-2xl font-bold mb-4">Quiz Not Found</p>
          <p className="text-gray-400 mb-8">The quiz you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/quiz")}
            className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Instructions Modal
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl bg-gray-900 rounded-3xl p-12 border-4 border-yellow-400"
        >
          <div className="text-center mb-8">
            <Headphones className="w-20 h-20 mx-auto mb-6 text-yellow-400" />
            <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>
            <p className="text-xl text-gray-300">Accessible Audio Quiz</p>
          </div>

          <div className="space-y-6 text-lg bg-gray-800 p-8 rounded-2xl mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              <Info className="inline w-6 h-6 mr-2" />
              How This Quiz Works
            </h2>

            <div className="space-y-4">
              <p className="flex items-start">
                <span className="text-yellow-400 font-bold mr-3">1.</span>
                Each question will be read aloud first
              </p>
              <p className="flex items-start">
                <span className="text-yellow-400 font-bold mr-3">2.</span>
                Then options 1, 2, 3, and 4 will be read one by one
              </p>
              <p className="flex items-start">
                <span className="text-yellow-400 font-bold mr-3">3.</span>
                Timer starts AFTER all options are read
              </p>
              <p className="flex items-start">
                <span className="text-yellow-400 font-bold mr-3">4.</span>
                You have 30 seconds per question
              </p>
              <p className="flex items-start">
                <span className="text-yellow-400 font-bold mr-3">5.</span>
                Press 1, 2, 3, or 4 to select your answer
              </p>
            </div>

            <div className="border-t-2 border-gray-700 pt-6 mt-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">Keyboard Controls</h3>
              <div className="grid grid-cols-2 gap-3 text-base">
                <p><kbd className="bg-yellow-400 text-black px-3 py-1 rounded font-bold">1-4</kbd> Select answer</p>
                <p><kbd className="bg-yellow-400 text-black px-3 py-1 rounded font-bold">R</kbd> Repeat question</p>
                <p><kbd className="bg-yellow-400 text-black px-3 py-1 rounded font-bold">O</kbd> Read options again</p>
                <p><kbd className="bg-yellow-400 text-black px-3 py-1 rounded font-bold">P</kbd> Pause/Resume</p>
                <p><kbd className="bg-yellow-400 text-black px-3 py-1 rounded font-bold">S</kbd> Skip reading</p>
                <p><kbd className="bg-yellow-400 text-black px-3 py-1 rounded font-bold">H</kbd> Help</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={startQuiz}
              className="flex-1 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl text-2xl font-bold transition shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <Play className="inline w-8 h-8 mr-3" />
              Start Quiz (Press Enter)
            </button>
            <button
              onClick={skipInstructions}
              className="px-8 py-6 bg-gray-700 hover:bg-gray-600 rounded-2xl text-xl font-bold transition"
            >
              <SkipForward className="inline w-6 h-6 mr-2" />
              Skip (Press Esc)
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz Ended
  if (quizEnded) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl bg-gray-900 rounded-3xl p-12 border-4 border-yellow-400 text-center"
        >
          <CheckCircle className="w-24 h-24 mx-auto mb-6 text-yellow-400" />
          <h1 className="text-5xl font-bold mb-4">Quiz Complete!</h1>
          <p className="text-3xl mb-8">
            Score: <span className="text-yellow-400 font-bold">{score}</span> / {quiz.questions.length}
          </p>
          <p className="text-2xl mb-8">Percentage: {percentage}%</p>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-xl font-bold transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-xl font-bold transition"
            >
              Retake Quiz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8 border-2 border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </h2>
              <p className="text-gray-400">Current Score: {score}</p>
            </div>
            <div className="text-center">
              <Clock className={`w-12 h-12 mx-auto mb-2 ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-yellow-400"}`} />
              <p className={`text-4xl font-bold ${timeLeft <= 10 ? "text-red-500" : "text-yellow-400"}`}>
                {timeLeft}s
              </p>
            </div>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Audio Status */}
        <AnimatePresence>
          {isReading && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-8 flex items-center justify-between"
            >
              <div className="flex items-center">
                <Volume2 className="w-8 h-8 mr-4 animate-pulse" />
                <div>
                  <p className="text-xl font-bold">Reading: {readingStage}</p>
                  <p className="text-sm opacity-80">Press P to pause, S to skip</p>
                </div>
              </div>
              {isPaused ? (
                <Play className="w-10 h-10" />
              ) : (
                <Pause className="w-10 h-10 animate-pulse" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8 border-2 border-yellow-400">
          <h3 className="text-3xl font-bold mb-4">{currentQuestion.question}</h3>
          <p className="text-gray-400 text-lg">Press R to repeat question</p>
        </div>

        {/* Options */}
        <div className="grid gap-4 mb-8">
          {currentQuestion.options.map((option, index) => {
            const optionNumber = index + 1;
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correct_answer;
            const showResult = selectedAnswer !== "";

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== "" || !timerStarted}
                className={`p-6 rounded-xl text-left text-xl font-semibold transition-all transform hover:scale-105 disabled:cursor-not-allowed ${
                  showResult
                    ? isCorrect
                      ? "bg-green-600 border-4 border-green-400"
                      : isSelected
                      ? "bg-red-600 border-4 border-red-400"
                      : "bg-gray-800 opacity-50"
                    : readingStage === `option${optionNumber}`
                    ? "bg-purple-600 border-4 border-purple-400 scale-105"
                    : timerStarted
                    ? "bg-gray-800 hover:bg-gray-700 border-2 border-gray-600"
                    : "bg-gray-800 opacity-50 border-2 border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 bg-yellow-400 text-black rounded-full flex items-center justify-center text-2xl font-bold">
                      {optionNumber}
                    </span>
                    <span>{option}</span>
                  </div>
                  {showResult && isCorrect && <CheckCircle className="w-8 h-8" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-8 h-8" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Help */}
        <div className="bg-gray-900 rounded-xl p-4 text-center text-gray-400">
          <p className="text-sm">
            Press <kbd className="bg-gray-700 px-2 py-1 rounded">H</kbd> for help |
            Press <kbd className="bg-gray-700 px-2 py-1 rounded">1-4</kbd> to select |
            Press <kbd className="bg-gray-700 px-2 py-1 rounded">O</kbd> to read options again
          </p>
        </div>
      </div>
    </div>
  );
}
