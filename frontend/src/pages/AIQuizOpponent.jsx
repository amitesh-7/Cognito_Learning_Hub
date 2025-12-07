import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Brain,
  Zap,
  Target,
  Trophy,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Flame,
  Crown,
  Sparkles,
  User,
  ArrowRight,
  RotateCcw,
  Home,
} from "lucide-react";
import Confetti from "react-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Progress from "../components/ui/Progress";
import Badge from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/Loading";
import { useToast } from "../components/ui/Toast";

/**
 * AI Opponent Personalities
 */
const AI_PERSONALITIES = {
  einstein: {
    id: "einstein",
    name: "Einstein",
    emoji: "🧠",
    description: "Genius-level AI that rarely makes mistakes",
    accuracy: 0.95, // 95% accuracy
    speedRange: [3, 8], // 3-8 seconds to answer
    color: "from-purple-500 to-indigo-600",
    textColor: "text-purple-600",
    bgColor: "bg-purple-100",
    traits: ["Methodical", "Precise", "Rarely wrong"],
    tauntMessages: {
      correct: ["Elementary, my dear player.", "As I calculated.", "Precisely as expected."],
      wrong: ["Even geniuses make errors...", "A minor miscalculation.", "Interesting outcome..."],
      winning: ["Your intellect is admirable, but insufficient.", "The outcome was predetermined."],
      losing: ["A rare occurrence. Well played.", "You've earned my respect."],
    },
  },
  speedy: {
    id: "speedy",
    name: "Speedy",
    emoji: "⚡",
    description: "Lightning fast but makes more mistakes",
    accuracy: 0.65, // 65% accuracy
    speedRange: [1, 3], // 1-3 seconds to answer
    color: "from-yellow-400 to-orange-500",
    textColor: "text-orange-600",
    bgColor: "bg-orange-100",
    traits: ["Ultra fast", "Impulsive", "Risk taker"],
    tauntMessages: {
      correct: ["Zoom! Got it!", "Too fast for ya!", "Speed is everything!"],
      wrong: ["Oops! Too hasty!", "Gotta go fast... maybe too fast!", "Next one, quick!"],
      winning: ["Speed wins! Always!", "Can't keep up? 😏"],
      losing: ["You're faster than I thought!", "Okay, you got me this time!"],
    },
  },
  careful: {
    id: "careful",
    name: "Careful",
    emoji: "🎯",
    description: "Slow and methodical but highly accurate",
    accuracy: 0.88, // 88% accuracy
    speedRange: [8, 15], // 8-15 seconds to answer
    color: "from-green-500 to-teal-600",
    textColor: "text-green-600",
    bgColor: "bg-green-100",
    traits: ["Thoughtful", "Precise", "Patient"],
    tauntMessages: {
      correct: ["Patience pays off.", "Measured and accurate.", "Slow and steady."],
      wrong: ["Hmm, let me reconsider...", "An unexpected outcome.", "Back to analysis..."],
      winning: ["Careful planning always wins.", "Strategy over speed."],
      losing: ["Your patience matches mine.", "A worthy opponent indeed."],
    },
  },
  adaptive: {
    id: "adaptive",
    name: "Adaptive",
    emoji: "🤖",
    description: "Learns from your performance and adapts",
    accuracy: 0.75, // Base 75%, adapts based on player
    speedRange: [4, 10], // Adapts based on player
    color: "from-cyan-500 to-blue-600",
    textColor: "text-cyan-600",
    bgColor: "bg-cyan-100",
    traits: ["Learning", "Adaptive", "Unpredictable"],
    tauntMessages: {
      correct: ["Learning your patterns...", "Adapting...", "Getting stronger."],
      wrong: ["Recalibrating...", "Adjusting strategy...", "New data acquired."],
      winning: ["I've learned your weaknesses.", "Adaptation complete."],
      losing: ["You're unpredictable. I like it.", "Time to upgrade my algorithms!"],
    },
  },
};

/**
 * AI Opponent Selection Screen
 */
const AIOpponentSelect = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Choose Your AI Opponent
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Each AI has unique personality and play style. Choose wisely!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(AI_PERSONALITIES).map((ai, index) => (
            <motion.div
              key={ai.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="cursor-pointer"
              onClick={() => onSelect(ai)}
            >
              <Card className="h-full overflow-hidden border-2 hover:border-indigo-400 transition-all duration-300">
                <div className={`h-2 bg-gradient-to-r ${ai.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl ${ai.bgColor} flex items-center justify-center text-4xl`}>
                      {ai.emoji}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{ai.name}</CardTitle>
                      <p className="text-gray-500 dark:text-gray-400">{ai.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {ai.traits.map((trait) => (
                        <Badge key={trait} variant="secondary" className="text-sm">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Target className="w-4 h-4" />
                          Accuracy
                        </div>
                        <Progress value={ai.accuracy * 100} className="h-2" />
                        <span className={`text-sm font-bold ${ai.textColor}`}>
                          {Math.round(ai.accuracy * 100)}%
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Zap className="w-4 h-4" />
                          Speed
                        </div>
                        <Progress 
                          value={100 - ((ai.speedRange[0] + ai.speedRange[1]) / 2) * 5} 
                          className="h-2" 
                        />
                        <span className={`text-sm font-bold ${ai.textColor}`}>
                          {ai.speedRange[0]}-{ai.speedRange[1]}s
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * AI vs Player Battle Screen
 */
const AIBattle = ({ quiz, aiOpponent, playerStats, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswer, setPlayerAnswer] = useState(null);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [playerStreak, setPlayerStreak] = useState(0);
  const [aiStreak, setAiStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gamePhase, setGamePhase] = useState("playing"); // playing, questionResult, finished
  const [adaptiveAccuracy, setAdaptiveAccuracy] = useState(aiOpponent.accuracy);
  
  const aiTimerRef = useRef(null);
  const questionTimerRef = useRef(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  // Simulate AI answering
  const simulateAIAnswer = useCallback(() => {
    const ai = aiOpponent;
    let accuracy = ai.accuracy;
    
    // Adaptive AI adjusts based on player performance
    if (ai.id === "adaptive") {
      const playerAccuracy = playerStats.correct / Math.max(1, playerStats.total);
      accuracy = Math.min(0.95, Math.max(0.5, playerAccuracy + 0.1)); // Stay slightly ahead
      setAdaptiveAccuracy(accuracy);
    }

    // Calculate AI response time
    const [minTime, maxTime] = ai.speedRange;
    const aiResponseTime = Math.random() * (maxTime - minTime) + minTime;

    setIsAiThinking(true);

    aiTimerRef.current = setTimeout(() => {
      // Determine if AI gets it right
      const isCorrect = Math.random() < accuracy;
      const correctAnswer = currentQuestion.correct_answer || currentQuestion.correctAnswer;
      
      let aiSelectedAnswer;
      if (isCorrect) {
        aiSelectedAnswer = correctAnswer;
      } else {
        // Pick a wrong answer
        const wrongOptions = currentQuestion.options.filter(opt => opt !== correctAnswer);
        aiSelectedAnswer = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
      }

      setAiAnswer({
        answer: aiSelectedAnswer,
        isCorrect,
        timeTaken: aiResponseTime,
      });

      if (isCorrect) {
        setAiScore((prev) => prev + (currentQuestion.points || 10));
        setAiStreak((prev) => prev + 1);
        setAiMessage(ai.tauntMessages.correct[Math.floor(Math.random() * ai.tauntMessages.correct.length)]);
      } else {
        setAiStreak(0);
        setAiMessage(ai.tauntMessages.wrong[Math.floor(Math.random() * ai.tauntMessages.wrong.length)]);
      }

      setIsAiThinking(false);
    }, aiResponseTime * 1000);
  }, [aiOpponent, currentQuestion, playerStats, adaptiveAccuracy]);

  // Start AI timer when question loads
  useEffect(() => {
    if (gamePhase === "playing" && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 30);
      setQuestionStartTime(Date.now());
      setPlayerAnswer(null);
      setAiAnswer(null);
      setAiMessage("");
      simulateAIAnswer();
    }

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [currentQuestionIndex, gamePhase, simulateAIAnswer]);

  // Question timer
  useEffect(() => {
    if (gamePhase !== "playing" || timeLeft <= 0) return;

    questionTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit if player hasn't answered
          if (!playerAnswer) {
            handlePlayerAnswer(null);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [gamePhase, timeLeft, playerAnswer]);

  const handlePlayerAnswer = (answer) => {
    if (playerAnswer) return;

    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const correctAnswer = currentQuestion.correct_answer || currentQuestion.correctAnswer;
    const isCorrect = answer === correctAnswer;

    setPlayerAnswer({
      answer,
      isCorrect,
      timeTaken,
    });

    if (isCorrect) {
      // Time bonus
      const timeBonus = Math.floor((timeLeft / (currentQuestion.timeLimit || 30)) * 5);
      setPlayerScore((prev) => prev + (currentQuestion.points || 10) + timeBonus);
      setPlayerStreak((prev) => prev + 1);
    } else {
      setPlayerStreak(0);
    }

    // Wait for AI to finish, then show result
    setTimeout(() => {
      setGamePhase("questionResult");
    }, aiAnswer ? 0 : 500);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex >= totalQuestions - 1) {
      setGamePhase("finished");
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setGamePhase("playing");
    }
  };

  // Game finished
  if (gamePhase === "finished") {
    const playerWon = playerScore > aiScore;
    const isDraw = playerScore === aiScore;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 p-6">
        {playerWon && <Confetti width={window.innerWidth} height={window.innerHeight} />}
        
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              playerWon ? "bg-yellow-100" : isDraw ? "bg-gray-100" : "bg-red-100"
            }`}>
              {playerWon ? (
                <Crown className="w-12 h-12 text-yellow-500" />
              ) : isDraw ? (
                <Target className="w-12 h-12 text-gray-500" />
              ) : (
                <Bot className="w-12 h-12 text-red-500" />
              )}
            </div>

            <h1 className="text-4xl font-bold mb-2">
              {playerWon ? "🎉 Victory!" : isDraw ? "🤝 It's a Draw!" : "😔 Defeat"}
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {playerWon 
                ? aiOpponent.tauntMessages.losing[Math.floor(Math.random() * aiOpponent.tauntMessages.losing.length)]
                : isDraw
                ? "A battle of equals!"
                : aiOpponent.tauntMessages.winning[Math.floor(Math.random() * aiOpponent.tauntMessages.winning.length)]
              }
            </p>

            {/* Score Comparison */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="font-bold text-lg">You</p>
                    <p className="text-3xl font-bold text-indigo-600">{playerScore}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-400">VS</p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full ${aiOpponent.bgColor} flex items-center justify-center text-3xl`}>
                      {aiOpponent.emoji}
                    </div>
                    <p className="font-bold text-lg">{aiOpponent.name}</p>
                    <p className={`text-3xl font-bold ${aiOpponent.textColor}`}>{aiScore}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={() => onComplete({ playerScore, aiScore, playerWon })}>
                <Home className="w-4 h-4 mr-2" />
                Back to Quiz
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with scores */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Player Score */}
          <Card className="border-2 border-indigo-400">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <User className="w-6 h-6 text-indigo-600" />
                <span className="font-bold">You</span>
                {playerStreak >= 3 && (
                  <Badge className="bg-orange-500">
                    <Flame className="w-3 h-3 mr-1" />
                    {playerStreak}
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-indigo-600">{playerScore}</p>
            </CardContent>
          </Card>

          {/* Timer & Progress */}
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className={`w-5 h-5 ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-gray-500"}`} />
                <span className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-500" : ""}`}>
                  {timeLeft}s
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>

          {/* AI Score */}
          <Card className={`border-2 ${aiOpponent.textColor.replace('text', 'border')}`}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{aiOpponent.emoji}</span>
                <span className="font-bold">{aiOpponent.name}</span>
                {aiStreak >= 3 && (
                  <Badge className="bg-orange-500">
                    <Flame className="w-3 h-3 mr-1" />
                    {aiStreak}
                  </Badge>
                )}
              </div>
              <p className={`text-3xl font-bold ${aiOpponent.textColor}`}>{aiScore}</p>
              {isAiThinking && (
                <p className="text-xs text-gray-500 animate-pulse">Thinking...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Message */}
        <AnimatePresence>
          {aiMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-4 p-3 rounded-lg ${aiOpponent.bgColor} text-center`}
            >
              <span className="text-lg mr-2">{aiOpponent.emoji}</span>
              <span className={`font-medium ${aiOpponent.textColor}`}>"{aiMessage}"</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {currentQuestion.difficulty || "Medium"}
              </Badge>
              <Badge variant="secondary">
                <Star className="w-3 h-3 mr-1" />
                {currentQuestion.points || 10} pts
              </Badge>
            </div>
            <CardTitle className="text-xl mt-4">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.options.map((option, index) => {
                const isPlayerSelected = playerAnswer?.answer === option;
                const isAiSelected = aiAnswer?.answer === option;
                const correctAnswer = currentQuestion.correct_answer || currentQuestion.correctAnswer;
                const isCorrectOption = option === correctAnswer;
                const showResults = gamePhase === "questionResult";

                let buttonClass = "p-4 text-left border-2 rounded-xl transition-all duration-300 ";
                
                if (showResults) {
                  if (isCorrectOption) {
                    buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/30";
                  } else if (isPlayerSelected || isAiSelected) {
                    buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/30";
                  } else {
                    buttonClass += "border-gray-200 dark:border-gray-700 opacity-50";
                  }
                } else if (isPlayerSelected) {
                  buttonClass += "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30";
                } else {
                  buttonClass += "border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50";
                }

                return (
                  <motion.button
                    key={index}
                    whileHover={!playerAnswer ? { scale: 1.02 } : {}}
                    whileTap={!playerAnswer ? { scale: 0.98 } : {}}
                    className={buttonClass}
                    onClick={() => !playerAnswer && handlePlayerAnswer(option)}
                    disabled={!!playerAnswer}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      <div className="flex gap-2">
                        {showResults && isPlayerSelected && (
                          <Badge className={isCorrectOption ? "bg-green-500" : "bg-red-500"}>
                            <User className="w-3 h-3" />
                          </Badge>
                        )}
                        {showResults && isAiSelected && (
                          <Badge className={`${aiOpponent.color.includes('purple') ? 'bg-purple-500' : aiOpponent.color.includes('orange') ? 'bg-orange-500' : aiOpponent.color.includes('green') ? 'bg-green-600' : 'bg-cyan-500'}`}>
                            {aiOpponent.emoji}
                          </Badge>
                        )}
                        {showResults && isCorrectOption && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Next button after showing results */}
            {gamePhase === "questionResult" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <Button onClick={nextQuestion} size="lg">
                  {currentQuestionIndex >= totalQuestions - 1 ? "See Results" : "Next Question"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Main AI Quiz Opponent Page
 */
export default function AIQuizOpponent() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAI, setSelectedAI] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerStats, setPlayerStats] = useState({ correct: 0, total: 0 });

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
          data.questions = data.questions.map(q => ({
            ...q,
            correct_answer: q.correct_answer || q.correctAnswer,
            correctAnswer: q.correctAnswer || q.correct_answer,
          }));
        }

        setQuiz(data);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        showError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleSelectAI = (ai) => {
    setSelectedAI(ai);
    setGameStarted(true);
  };

  const handleGameComplete = (result) => {
    if (result.playerWon) {
      success(`🎉 You beat ${selectedAI.name}! Great job!`);
    }
    navigate(`/quiz/${quizId}`);
  };

  if (loading) return <LoadingSpinner />;

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Quiz not found</h2>
          <Button onClick={() => navigate("/quizzes")}>Back to Quizzes</Button>
        </Card>
      </div>
    );
  }

  if (!gameStarted) {
    return <AIOpponentSelect onSelect={handleSelectAI} />;
  }

  return (
    <AIBattle
      quiz={quiz}
      aiOpponent={selectedAI}
      playerStats={playerStats}
      onComplete={handleGameComplete}
    />
  );
}

export { AI_PERSONALITIES };
