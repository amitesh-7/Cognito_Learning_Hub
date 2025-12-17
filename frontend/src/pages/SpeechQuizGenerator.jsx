import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Mic,
  Play,
  Pause,
  StopCircle,
  Headphones,
  Brain,
  Settings,
  CheckCircle,
  XCircle,
  Trophy,
  BarChart,
  Plus,
  Trash2,
  Sparkles,
  Languages,
  Clock,
  Target,
  Save,
  Loader,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";

// Gamification component for answer feedback
const AnswerFeedback = ({ isCorrect, onClose }) => {
  React.useEffect(() => {
    if (isCorrect) {
      // Confetti for correct answer
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

export default function SpeechQuizGenerator() {
  const { user } = useContext(AuthContext);

  // Quiz configuration (initialize with saved preferences)
  const [quizConfig, setQuizConfig] = useState({
    title: "",
    topic: "",
    language: "en-US",
    difficulty: "medium",
    questionCount: 5,
    timePerQuestion: 30,
    voiceName: localStorage.getItem('preferredVoice') || "",
    speechRate: parseFloat(localStorage.getItem('speechRate')) || 0.9,
    speechPitch: parseFloat(localStorage.getItem('speechPitch')) || 1.0,
  });

  // Voice options
  const [availableVoices, setAvailableVoices] = useState([]);
  const [filteredVoices, setFilteredVoices] = useState([]);

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Quiz taker states
  const [quizMode, setQuizMode] = useState("setup"); // setup, taking, results
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Save quiz state
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedQuizId, setSavedQuizId] = useState(null);

  // Gamification state
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  // Refs
  const speechSynthesisRef = useRef(null);
  const recognitionRef = useRef(null);

  // Language options
  const languages = [
    { code: "en-US", name: "English (US)", flag: "🇺🇸" },
    { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
    { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
    { code: "mr-IN", name: "Marathi", flag: "🇮🇳" },
    { code: "ta-IN", name: "Tamil", flag: "🇮🇳" },
    { code: "te-IN", name: "Telugu", flag: "🇮🇳" },
    { code: "kn-IN", name: "Kannada", flag: "🇮🇳" },
    { code: "bn-IN", name: "Bengali", flag: "🇮🇳" },
  ];

  // Load available voices
  React.useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Filter voices for current language
      const filtered = voices.filter(voice => 
        voice.lang.startsWith(quizConfig.language.split('-')[0])
      );
      setFilteredVoices(filtered);
      
      // Set default voice if not set
      if (!quizConfig.voiceName && filtered.length > 0) {
        setQuizConfig(prev => ({ ...prev, voiceName: filtered[0].name }));
      }
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Update filtered voices when language changes
  React.useEffect(() => {
    const filtered = availableVoices.filter(voice => 
      voice.lang.startsWith(quizConfig.language.split('-')[0])
    );
    setFilteredVoices(filtered);
    
    // Set first available voice for new language
    if (filtered.length > 0) {
      setQuizConfig(prev => ({ ...prev, voiceName: filtered[0].name }));
    }
  }, [quizConfig.language, availableVoices]);

  // Generate questions with AI
  const generateQuestions = async () => {
    if (!quizConfig.topic.trim()) {
      alert("Please enter a quiz topic");
      return;
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-pdf-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          topic: quizConfig.topic,
          numQuestions: quizConfig.questionCount,
          difficulty: quizConfig.difficulty,
          questionTypes: ["mcq", "truefalse"],
          language: quizConfig.language,
          speechEnabled: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      const generatedQuestions = data.questions.map((q, index) => ({
        id: Date.now() + index,
        question: q.question,
        type: q.type,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
      }));

      setQuestions(generatedQuestions);
      toast.success(`Successfully generated ${generatedQuestions.length} speech-enabled questions!`);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error(`Failed to generate questions: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save quiz to database
  const saveQuiz = async () => {
    if (!quizConfig.title.trim()) {
      toast.error("Please enter a quiz title before saving");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please generate questions before saving");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("quizwise-token");
      
      // Format questions for backend
      const formattedQuestions = questions.map((q) => ({
        question: q.question,
        type: q.type === "mcq" ? "multiple-choice" : "true-false",
        options: q.options,
        correct_answer: q.correctAnswer,
        explanation: q.explanation || "",
        timeLimit: quizConfig.timePerQuestion,
      }));

      const quizData = {
        title: quizConfig.title,
        description: `Speech-based quiz on ${quizConfig.topic}`,
        questions: formattedQuestions,
        difficulty: quizConfig.difficulty.charAt(0).toUpperCase() + quizConfig.difficulty.slice(1),
        category: "Speech Quiz",
        quizType: "speech",
        speechSettings: {
          voiceName: quizConfig.voiceName,
          speechRate: quizConfig.speechRate,
          speechPitch: quizConfig.speechPitch,
          language: quizConfig.language,
        },
        isPublic: true,
        gameSettings: {
          enableHints: false,
          enableTimeBonuses: true,
          enableStreakBonuses: true,
          showLeaderboard: true,
        },
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save quiz");
      }

      const result = await response.json();
      const savedQuiz = result.data?.quiz || result.quiz || result;
      
      setSavedQuizId(savedQuiz._id);
      setShowSaveModal(true);
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#f472b6'],
      });

      toast.success("🎉 Quiz saved successfully!");
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error(`Failed to save quiz: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Speech functions
  const speakText = (text) => {
    return new Promise((resolve) => {
      const synthesis = window.speechSynthesis;
      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = quizConfig.language;
      utterance.rate = quizConfig.speechRate;
      utterance.pitch = quizConfig.speechPitch;

      // Apply selected voice if available
      if (quizConfig.voiceName) {
        const selectedVoice = availableVoices.find(voice => voice.name === quizConfig.voiceName);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
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
    if (index >= questions.length) return;

    const question = questions[index];
    let textToSpeak = `Question ${index + 1}. ${question.question}`;

    if (question.type === "mcq") {
      textToSpeak += " The options are: ";
      question.options.forEach((option, i) => {
        textToSpeak += `Option ${String.fromCharCode(65 + i)}, ${option}. `;
      });
    } else if (question.type === "truefalse") {
      textToSpeak += " Answer True or False.";
    }

    await speakText(textToSpeak);
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = quizConfig.language;
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
      alert("Could not recognize speech. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const processAnswer = (spokenText) => {
    const question = questions[currentQuestionIndex];
    let answer = spokenText;
    let isCorrect = false;

    if (question.type === "mcq") {
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
    } else if (question.type === "truefalse") {
      const lowerText = spokenText.toLowerCase();
      if (lowerText.includes("true") || lowerText.includes("yes")) {
        answer = "True";
      } else if (lowerText.includes("false") || lowerText.includes("no")) {
        answer = "False";
      }
      isCorrect = answer === question.correctAnswer;
    }

    const newAnswer = {
      questionId: question.id,
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
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeout(() => speakQuestion(currentQuestionIndex + 1), 500);
    } else {
      finishQuiz();
    }
  };

  const startQuiz = () => {
    if (questions.length === 0) {
      alert("Please generate questions first");
      return;
    }

    setQuizMode("taking");
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore({ correct: 0, total: 0 });
    speakQuestion(0);
  };

  const finishQuiz = async () => {
    setQuizMode("results");
    const percentage = score.total > 0 ? ((score.correct / score.total) * 100).toFixed(1) : 0;
    await speakText(`Quiz completed! You scored ${score.correct} out of ${score.total}. That's ${percentage} percent.`);
  };

  const resetQuiz = () => {
    setQuizMode("setup");
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore({ correct: 0, total: 0 });
    setTranscript("");
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsSpeaking(false);
    setIsListening(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Speech-Based Quiz Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                <Headphones className="w-4 h-4 text-purple-500" />
                Create and take interactive voice-enabled quizzes
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Setup Mode */}
      {quizMode === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quiz Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={quizConfig.title}
                    onChange={(e) => setQuizConfig({ ...quizConfig, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., Science Quiz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic *
                  </label>
                  <input
                    type="text"
                    value={quizConfig.topic}
                    onChange={(e) => setQuizConfig({ ...quizConfig, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., Solar System, World War 2, Photosynthesis"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Speech Language
                    </label>
                    <select
                      value={quizConfig.language}
                      onChange={(e) => setQuizConfig({ ...quizConfig, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Questions
                    </label>
                    <select
                      value={quizConfig.questionCount}
                      onChange={(e) =>
                        setQuizConfig({ ...quizConfig, questionCount: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {[3, 5, 8, 10, 15].map((num) => (
                        <option key={num} value={num}>
                          {num} questions
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={quizConfig.difficulty}
                      onChange={(e) => setQuizConfig({ ...quizConfig, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time per Question (seconds)
                    </label>
                    <input
                      type="number"
                      value={quizConfig.timePerQuestion}
                      onChange={(e) =>
                        setQuizConfig({ ...quizConfig, timePerQuestion: parseInt(e.target.value) })
                      }
                      min="10"
                      max="120"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Accessibility Settings - Voice Selection */}
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Accessibility Settings
                  </h3>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Voice Type ({filteredVoices.length} available)
                    </label>
                    <select
                      value={quizConfig.voiceName}
                      onChange={(e) => setQuizConfig({ ...quizConfig, voiceName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={filteredVoices.length === 0}
                    >
                      {filteredVoices.length === 0 ? (
                        <option>Loading voices...</option>
                      ) : (
                        filteredVoices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} {voice.localService ? '(Local)' : '(Online)'} 
                            {voice.default ? ' ⭐' : ''}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose from male, female, or different accent voices
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Speech Rate: {quizConfig.speechRate}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={quizConfig.speechRate}
                        onChange={(e) => setQuizConfig({ ...quizConfig, speechRate: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Slower (0.5x)</span>
                        <span>Normal (1x)</span>
                        <span>Faster (2x)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Speech Pitch: {quizConfig.speechPitch}
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={quizConfig.speechPitch}
                        onChange={(e) => setQuizConfig({ ...quizConfig, speechPitch: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Lower (0.5)</span>
                        <span>Normal (1)</span>
                        <span>Higher (2)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => speakText("This is a test of the selected voice settings. How does it sound?")}
                    disabled={isSpeaking || filteredVoices.length === 0}
                    className="text-sm px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {isSpeaking ? 'Speaking...' : 'Test Voice Settings'}
                  </button>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                  <p className="text-sm text-purple-900 dark:text-purple-100">
                    <Headphones className="w-4 h-4 inline mr-2" />
                    <strong>Speech Quiz Features:</strong> Questions will be read aloud, students can
                    answer using voice commands, and automatic speech recognition will evaluate
                    responses.
                  </p>
                </div>

                <Button
                  onClick={generateQuestions}
                  disabled={isGenerating || !quizConfig.topic.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Speech Quiz with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Questions Preview */}
            {questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generated Questions ({questions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={question.type === "mcq" ? "default" : "secondary"}>
                              Q{index + 1}: {question.type.toUpperCase()}
                            </Badge>
                          </div>
                          <button
                            onClick={() => setQuestions(questions.filter((q) => q.id !== question.id))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          {question.question}
                        </p>

                        {question.type === "mcq" && (
                          <div className="space-y-1 ml-4">
                            {question.options.map((option, i) => (
                              <div
                                key={i}
                                className={`text-sm ${
                                  option === question.correctAnswer
                                    ? "text-green-600 dark:text-green-400 font-semibold"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {String.fromCharCode(65 + i)}. {option}
                                {option === question.correctAnswer && " ✓"}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === "truefalse" && (
                          <div className="ml-4 text-sm">
                            <span
                              className={
                                question.correctAnswer === "True"
                                  ? "text-green-600 dark:text-green-400 font-semibold"
                                  : "text-gray-600 dark:text-gray-400"
                              }
                            >
                              True {question.correctAnswer === "True" && "✓"}
                            </span>
                            {" / "}
                            <span
                              className={
                                question.correctAnswer === "False"
                                  ? "text-green-600 dark:text-green-400 font-semibold"
                                  : "text-gray-600 dark:text-gray-400"
                              }
                            >
                              False {question.correctAnswer === "False" && "✓"}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={startQuiz}
                  disabled={questions.length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Speech Quiz
                </Button>

                <Button
                  onClick={saveQuiz}
                  disabled={questions.length === 0 || isSaving}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Saving Quiz...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Quiz to My Quizzes
                    </>
                  )}
                </Button>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>📝 {questions.length} questions ready</p>
                  <p>🎤 Voice interaction enabled</p>
                  <p>⏱️ {quizConfig.timePerQuestion}s per question</p>
                  <p>🌍 Language: {languages.find((l) => l.code === quizConfig.language)?.name}</p>
                  {quizConfig.voiceName && (
                    <p className="text-xs">
                      🔊 Voice: {quizConfig.voiceName.split(' ')[0]} ({quizConfig.speechRate}x speed)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex gap-2">
                  <span className="text-purple-600 font-bold">1.</span>
                  <span>Questions are read aloud automatically</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-600 font-bold">2.</span>
                  <span>Click "Speak Answer" and say your response</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-600 font-bold">3.</span>
                  <span>
                    Say "Option A", "Option B", or "True"/"False"
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-600 font-bold">4.</span>
                  <span>Get instant feedback and move to next question</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-600 font-bold">5.</span>
                  <span>View your complete results at the end</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Quiz Taking Mode */}
      <AnimatePresence>
        {quizMode === "taking" && questions[currentQuestionIndex] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-4 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isSpeaking ? "default" : isListening ? "success" : "outline"}
                      className="px-4 py-2"
                    >
                      {isSpeaking ? (
                        <>
                          <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                          Speaking...
                        </>
                      ) : isListening ? (
                        <>
                          <Mic className="w-4 h-4 mr-2 animate-pulse" />
                          Listening...
                        </>
                      ) : (
                        "Ready"
                      )}
                    </Badge>
                    <Button onClick={() => { stopSpeech(); resetQuiz(); }} variant="outline" size="sm">
                      <StopCircle className="w-4 h-4 mr-2" />
                      Exit
                    </Button>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-purple-50 dark:bg-purple-900 p-6 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {questions[currentQuestionIndex].question}
                  </h3>

                  {questions[currentQuestionIndex].type === "mcq" && (
                    <div className="space-y-3 mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Options:
                      </p>
                      {questions[currentQuestionIndex].options.map((option, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                        >
                          <span className="font-bold text-purple-600 text-lg">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          <span className="text-gray-900 dark:text-white text-lg">{option}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {questions[currentQuestionIndex].type === "truefalse" && (
                    <div className="flex gap-4 mt-4">
                      <div className="flex-1 p-6 bg-green-100 dark:bg-green-900 rounded-lg text-center border-2 border-green-300 dark:border-green-700">
                        <span className="text-2xl font-bold text-green-800 dark:text-green-200">
                          TRUE
                        </span>
                      </div>
                      <div className="flex-1 p-6 bg-red-100 dark:bg-red-900 rounded-lg text-center border-2 border-red-300 dark:border-red-700">
                        <span className="text-2xl font-bold text-red-800 dark:text-red-200">
                          FALSE
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {transcript && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      You said:
                    </p>
                    <p className="text-lg text-blue-700 dark:text-blue-300">"{transcript}"</p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => speakQuestion(currentQuestionIndex)}
                    disabled={isSpeaking || isListening}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    {isSpeaking ? "Speaking..." : "Repeat Question"}
                  </Button>

                  <Button
                    onClick={startListening}
                    disabled={isSpeaking || isListening}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    {isListening ? "Listening..." : "Speak Your Answer"}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>💡 Tip: Speak clearly and say "Option A", "Option B", "True", or "False"</p>
                  <p>🎯 Score: {score.correct}/{score.total}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Mode */}
      {quizMode === "results" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-4 border-green-200 dark:border-green-800">
            <CardHeader>
              <div className="text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <CardTitle className="text-3xl mb-2">Quiz Completed!</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Great job! Here are your results:
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Total Questions
                  </p>
                  <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                    {score.total}
                  </p>
                </div>

                <div className="p-6 bg-green-50 dark:bg-green-900 rounded-lg text-center">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                    Correct Answers
                  </p>
                  <p className="text-4xl font-bold text-green-900 dark:text-green-100">
                    {score.correct}
                  </p>
                </div>

                <div className="p-6 bg-purple-50 dark:bg-purple-900 rounded-lg text-center">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                    Score
                  </p>
                  <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">
                    {score.total > 0 ? ((score.correct / score.total) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Answer Review
                </h3>

                {answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      answer.isCorrect
                        ? "bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-700"
                        : "bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={answer.isCorrect ? "success" : "destructive"}>
                          Q{index + 1}
                        </Badge>
                        {answer.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>

                    <p className="font-medium text-gray-900 dark:text-white mb-2">
                      {answer.questionText}
                    </p>

                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">You said:</span> "{answer.transcript}"
                      </p>
                      <p>
                        <span className="font-medium">Interpreted as:</span> {answer.userAnswer}
                      </p>
                      {!answer.isCorrect && (
                        <p className="text-green-700 dark:text-green-300 font-semibold">
                          <span className="font-medium">Correct answer:</span>{" "}
                          {answer.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={resetQuiz} variant="outline" className="flex-1">
                  Create New Quiz
                </Button>
                <Button onClick={startQuiz} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                  <Play className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Answer Feedback Gamification */}
      <AnimatePresence>
        {showFeedback && (
          <AnswerFeedback isCorrect={lastAnswerCorrect} onClose={handleFeedbackClose} />
        )}
      </AnimatePresence>

      {/* Save Success Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border-4 border-purple-400"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mb-6"
                >
                  <CheckCircle className="w-24 h-24 mx-auto text-green-500" />
                </motion.div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  🎊 Quiz Saved Successfully!
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Your speech quiz "{quizConfig.title}" has been saved to your quiz library.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowSaveModal(false);
                      resetQuiz();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Create Another
                  </Button>
                  <Button
                    onClick={() => navigate('/quizzes/my-quizzes')}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    View My Quizzes
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
