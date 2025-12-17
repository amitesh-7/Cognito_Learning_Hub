import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Mic,
  Play,
  Pause,
  StopCircle,
  CheckCircle,
  XCircle,
  Trophy,
  BarChart,
  ArrowLeft,
  Loader,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";

// Gamification feedback component (reused from SpeechQuizGenerator)
const AnswerFeedback = ({ isCorrect, onClose }) => {
  React.useEffect(() => {
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    }
  }, [isCorrect]);

  const messages = isCorrect
    ? [
        "🎉 Brilliant! You're on fire!",
        "⭐ Outstanding! Keep it up!",
        "🚀 Perfect! You're a genius!",
        "💎 Excellent work!",
        "🏆 Correct! You're amazing!",
      ]
    : [
        "💪 Don't worry! Learn and try again!",
        "🌟 Mistakes help us grow!",
        "🎯 You're getting closer! Keep going!",
        "💡 Great effort! You'll get it next time!",
        "🌱 Every mistake is a learning opportunity!",
      ];

  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className={`relative p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 ${
          isCorrect
            ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-4 border-green-400'
            : 'bg-gradient-to-br from-orange-50 to-yellow-100 border-4 border-yellow-400'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="mb-6"
          >
            {isCorrect ? (
              <CheckCircle className="w-24 h-24 mx-auto text-green-500" />
            ) : (
              <XCircle className="w-24 h-24 mx-auto text-orange-500" />
            )}
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-3"
          >
            {isCorrect ? '🎊 Correct!' : '📚 Keep Learning!'}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg mb-6 font-medium"
          >
            {message}
          </motion.p>
          {isCorrect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-gray-600 mb-4"
            >
              <span className="text-2xl">+10 XP</span>
            </motion.div>
          )}
          <Button
            onClick={onClose}
            className={`w-full py-3 text-lg font-semibold ${
              isCorrect
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                : 'bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700'
            }`}
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function SpeechQuizTaker() {
  const { quizId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Quiz states
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizFinished, setQuizFinished] = useState(false);

  // Gamification state
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  // Speech settings (using default voice)
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const speechRate = 0.9;
  const speechPitch = 1;

  // Refs
  const speechSynthesisRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoice) {
        setSelectedVoice(voices[0]);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Fetch quiz
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

        if (!response.ok) throw new Error("Failed to fetch quiz");

        const data = await response.json();

        // Normalize question data
        if (data.questions) {
          data.questions = data.questions.map((q) => ({
            ...q,
            correctAnswer: q.correctAnswer || q.correct_answer,
            type: q.type || "multiple-choice",
          }));
        }

        setQuiz(data);
        
        // Start reading first question after a delay
        setTimeout(() => {
          speakQuestion(0);
        }, 1000);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error("Failed to load quiz");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Speech functions
  const speakText = (text) => {
    return new Promise((resolve) => {
      const synthesis = window.speechSynthesis;
      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      synthesis.speak(utterance);
      speechSynthesisRef.current = utterance;
    });
  };

  const speakQuestion = async (index) => {
    if (!quiz || index >= quiz.questions.length) return;

    const question = quiz.questions[index];
    let textToSpeak = `Question ${index + 1}. ${question.question}`;

    if (question.type === "multiple-choice" && question.options) {
      textToSpeak += " The options are: ";
      question.options.forEach((option, i) => {
        textToSpeak += `Option ${String.fromCharCode(65 + i)}, ${option}. `;
      });
    } else if (question.type === "true-false") {
      textToSpeak += " Answer True or False.";
    }

    await speakText(textToSpeak);
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();
      setTranscript(spokenText);
      processAnswer(spokenText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      toast.error("Could not recognize speech. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const processAnswer = (spokenText) => {
    if (!quiz) return;
    
    const question = quiz.questions[currentQuestionIndex];
    let answer = spokenText;
    let isCorrect = false;

    if (question.type === "multiple-choice") {
      const lowerText = spokenText.toLowerCase();

      // Check if they said "option A", "A", etc.
      const optionMatch = lowerText.match(/option\s*([a-d])|^([a-d])$/i);
      if (optionMatch) {
        const optionIndex = (optionMatch[1] || optionMatch[2]).toUpperCase().charCodeAt(0) - 65;
        answer = question.options[optionIndex] || spokenText;
      } else {
        // Try to match the transcript to an option
        const matchedOption = question.options.find(
          (opt) =>
            opt.toLowerCase().includes(lowerText) || lowerText.includes(opt.toLowerCase())
        );
        answer = matchedOption || spokenText;
      }

      isCorrect = answer === question.correctAnswer;
    } else if (question.type === "true-false") {
      const lowerText = spokenText.toLowerCase();
      if (lowerText.includes("true") || lowerText.includes("yes")) {
        answer = "True";
      } else if (lowerText.includes("false") || lowerText.includes("no")) {
        answer = "False";
      }
      isCorrect = answer === question.correctAnswer;
    }

    const newAnswer = {
      questionId: question._id,
      questionText: question.question,
      userAnswer: answer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      transcript: spokenText,
    };

    setAnswers((prev) => [...prev, newAnswer]);

    if (isCorrect) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setScore((prev) => ({ ...prev, total: prev.total + 1 }));
    }

    // Show gamification feedback
    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    
    // Move to next question after feedback
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeout(() => speakQuestion(currentQuestionIndex + 1), 500);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    window.speechSynthesis.cancel();
    setQuizFinished(true);
    
    if (score.correct / score.total >= 0.7) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });
    }

    // Submit results to backend
    submitQuizResults();
  };

  const submitQuizResults = async () => {
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          quizId: quiz._id,
          score: score.correct,
          totalQuestions: score.total,
          answers: answers.map(a => ({
            questionId: a.questionId,
            selectedAnswer: a.userAnswer,
            isCorrect: a.isCorrect,
          })),
        }),
      });

      if (response.ok) {
        toast.success("Quiz results saved!");
      }
    } catch (error) {
      console.error("Error submitting results:", error);
    }
  };

  const repeatQuestion = () => {
    speakQuestion(currentQuestionIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <Loader className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    const percentage = Math.round((score.correct / score.total) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white text-center">
              <Trophy className="w-20 h-20 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
              <p className="text-xl text-purple-100">Great job completing the speech quiz!</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-green-50 rounded-2xl">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-green-600">{score.correct}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-2xl">
                  <XCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-red-600">{score.total - score.correct}</div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-2xl">
                  <BarChart className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-bold text-gray-900">Your Answers</h3>
                {answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 ${
                      answer.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {answer.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-2">{answer.questionText}</p>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">You said:</span> "{answer.transcript}"
                          </p>
                          <p>
                            <span className="font-medium">Interpreted as:</span> {answer.userAnswer}
                          </p>
                          {!answer.isCorrect && (
                            <p className="text-green-700 font-semibold">
                              <span className="font-medium">Correct answer:</span> {answer.correctAnswer}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => navigate('/quizzes')}
                  variant="outline"
                  className="flex-1"
                >
                  Browse Quizzes
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Retake Quiz
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => {
            window.speechSynthesis.cancel();
            navigate(-1);
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Exit Speech Quiz
        </button>

        <Card className="border-4 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </Badge>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full">
                <Volume2 className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-600">Speech Mode</span>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <motion.div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <CardTitle className="text-2xl text-gray-900">{currentQuestion.question}</CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-gray-300 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={repeatQuestion}
                disabled={isSpeaking}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSpeaking ? (
                  <>
                    <Pause className="w-5 h-5 mr-2 animate-pulse" />
                    Speaking...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Repeat Question
                  </>
                )}
              </Button>

              <Button
                onClick={startListening}
                disabled={isListening || isSpeaking}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isListening ? (
                  <>
                    <Mic className="w-5 h-5 mr-2 animate-pulse" />
                    Listening...
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Speak Answer
                  </>
                )}
              </Button>
            </div>

            {transcript && (
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">You said:</p>
                <p className="text-lg font-semibold text-purple-900">"{transcript}"</p>
              </div>
            )}

            <div className="text-center text-sm text-gray-600">
              <p>🎤 Click "Speak Answer" and say your response</p>
              <p className="mt-1">
                For multiple choice, say the letter (A, B, C, D) or the full answer
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Answer Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <AnswerFeedback isCorrect={lastAnswerCorrect} onClose={handleFeedbackClose} />
        )}
      </AnimatePresence>
    </div>
  );
}
