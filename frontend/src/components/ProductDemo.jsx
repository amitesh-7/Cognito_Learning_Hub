import React, { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Brain,
  FileText,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Trophy,
  Swords,
  Radio,
  Play,
  Pause,
  ListChecks,
  ToggleLeft,
  AlignLeft,
  Crown,
  Mic,
  Volume2,
} from "lucide-react";

// ==================== ANIMATION VARIANTS ====================
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

// ==================== DEMO 1: AI QUIZ GENERATOR ====================
const QuizGeneratorDemo = memo(() => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    const interval = setInterval(() => setStep((p) => (p + 1) % 3), 3000);
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  const sources = [
    { icon: Brain, label: "Topic", color: "from-blue-500 to-cyan-500" },
    { icon: FileText, label: "PDF Upload", color: "from-green-500 to-emerald-500" },
    { icon: Sparkles, label: "Speech Input", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div ref={ref} className="relative max-w-5xl mx-auto">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">AI Quiz Generator</h3>
              <p className="text-white/70 text-xs">Create quizzes in seconds</p>
            </div>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 lg:p-12">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step-0" {...fadeInUp} className="space-y-8">
                <div className="text-center mb-8">
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Choose Your Source
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Select how you want to create your quiz
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  {sources.map((source, idx) => (
                    <motion.div
                      key={source.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="group relative cursor-pointer"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${source.color} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all`} />
                      <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-transparent transition-all">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${source.color} flex items-center justify-center mb-4`}>
                          <source.icon className="w-7 h-7 text-white" />
                        </div>
                        <h5 className="font-bold text-gray-900 dark:text-white mb-1">{source.label}</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Quick & Easy</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  {[ListChecks, ToggleLeft, AlignLeft].map((Icon, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700"
                    >
                      <Icon className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {["MCQ", "True/False", "Descriptive"][idx]}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step-1" {...fadeInUp} className="flex flex-col items-center justify-center py-8 sm:py-12">
                <motion.div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-8">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
                  </motion.div>
                </motion.div>
                
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Processing</h4>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 text-center">Analyzing content and generating questions</p>
                
                <div className="space-y-3 w-full max-w-md">
                  {["Extracting key concepts", "Generating questions", "Adding explanations"].map((text, idx) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.3 }}
                      className="flex items-center gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300"
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: idx * 0.3 }}
                      />
                      <span>{text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" {...fadeInUp} className="space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz Ready!</h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">10 questions generated in 15 seconds</p>
                </motion.div>

                <div className="space-y-3">
                  {[1, 2, 3].map((num, idx) => (
                    <motion.div
                      key={num}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          {num}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                            Sample Question {num}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Multiple Choice • Medium</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-6">
          {[0, 1, 2].map((idx) => (
            <motion.div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                step === idx ? "w-8 bg-purple-600" : "w-2 bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

QuizGeneratorDemo.displayName = "QuizGeneratorDemo";

// ==================== DEMO 2: 1V1 DUEL BATTLES ====================
const DuelBattleDemo = memo(() => {
  const [phase, setPhase] = useState(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    const interval = setInterval(() => {
      setPhase((p) => {
        const next = (p + 1) % 4;
        if (next === 0) {
          setPlayer1Score(0);
          setPlayer2Score(0);
        }
        if (p === 2) {
          setPlayer1Score((s) => s + 100);
          setPlayer2Score((s) => s + 50);
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <div ref={ref} className="relative max-w-5xl mx-auto">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">1v1 Duel Arena</h3>
              <p className="text-white/70 text-xs">Real-time quiz battles</p>
            </div>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 lg:p-12">
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div key="phase-0" {...fadeInUp} className="text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl sm:text-6xl mb-6"
                >
                  ⚔️
                </motion.div>
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Waiting for Opponent</h4>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Matching you with a player...</p>
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div key="phase-1" {...fadeInUp} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
                  {[{ name: "You", score: player1Score, color: "blue" }, { name: "Opponent", score: player2Score, color: "red" }].map((player, idx) => (
                    <motion.div
                      key={player.name}
                      initial={{ opacity: 0, x: idx === 0 ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-center"
                    >
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${
                        player.color === "blue" ? "from-blue-500 to-cyan-500" : "from-red-500 to-orange-500"
                      } mx-auto mb-3 flex items-center justify-center`}>
                        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <h5 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">{player.name}</h5>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">{player.score}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 sm:p-6 rounded-2xl bg-gray-100 dark:bg-gray-700">
                  <p className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">What is the capital of France?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Paris", "London", "Berlin", "Madrid"].map((option) => (
                      <button
                        key={option}
                        className="p-3 rounded-xl bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all text-sm sm:text-base"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {(phase === 2 || phase === 3) && (
              <motion.div key="phase-end" {...fadeInUp} className="text-center py-8 sm:py-12">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring" }}
                  className="text-5xl sm:text-7xl mb-6"
                >
                  🏆
                </motion.div>
                <h4 className="text-2xl sm:text-3xl font-bold text-yellow-500 mb-2">Victory!</h4>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">You won: {player1Score} - {player2Score}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">+250 XP Earned</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

DuelBattleDemo.displayName = "DuelBattleDemo";

// ==================== DEMO 3: LIVE SESSIONS ====================
const LiveSessionDemo = memo(() => {
  const [participants, setParticipants] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    const interval = setInterval(() => {
      setParticipants((p) => {
        if (p >= 8) return 0;
        return p + Math.floor(Math.random() * 2) + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <div ref={ref} className="relative max-w-5xl mx-auto">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Live Quiz Session</h3>
              <p className="text-white/70 text-xs">Session Code: ABC123</p>
            </div>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 lg:p-12">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Teacher View */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Teacher Dashboard</h4>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Participants</span>
                  <motion.span
                    key={participants}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-xl sm:text-2xl font-bold text-green-600"
                  >
                    {participants}/10
                  </motion.span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(participants / 10) * 100}%` }}
                  />
                </div>
              </div>

              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm sm:text-base font-bold hover:scale-105 transition-all">
                Start Quiz
              </button>
            </div>

            {/* Live Leaderboard */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Live Leaderboard</h4>
              </div>

              <div className="space-y-2">
                {Array.from({ length: Math.min(participants, 5) }, (_, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-700"
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold ${
                      idx === 0 ? "bg-yellow-500 text-white" :
                      idx === 1 ? "bg-gray-400 text-white" :
                      idx === 2 ? "bg-orange-600 text-white" :
                      "bg-gray-300 text-gray-700"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Student {idx + 1}</p>
                    </div>
                    <span className="font-bold text-purple-600 text-sm sm:text-base">{(5 - idx) * 100}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

LiveSessionDemo.displayName = "LiveSessionDemo";

// ==================== DEMO 4: SPEECH-BASED QUIZ ====================
const SpeechQuizDemo = memo(() => {
  const [phase, setPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [waveHeight, setWaveHeight] = useState([20, 40, 60, 40, 20]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    const interval = setInterval(() => setPhase((p) => (p + 1) % 4), 3000);
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  useEffect(() => {
    if (phase !== 1 || !isPlaying) return;
    const waveInterval = setInterval(() => {
      setWaveHeight(prev => prev.map(() => Math.random() * 80 + 20));
    }, 150);
    return () => clearInterval(waveInterval);
  }, [phase, isPlaying]);

  return (
    <div ref={ref} className="relative max-w-5xl mx-auto">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Speech-Based Quiz</h3>
              <p className="text-white/70 text-xs">Voice-powered learning</p>
            </div>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 lg:p-12">
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div key="phase-0" {...fadeInUp} className="text-center py-8 sm:py-12">
                <motion.div
                  className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </motion.div>
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Ready to Listen
                </h4>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  Tap the mic to start speaking your quiz topic
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:scale-105 transition-all">
                  Start Recording
                </button>
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div key="phase-1" {...fadeInUp} className="space-y-6">
                <div className="text-center mb-6">
                  <motion.div
                    className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </motion.div>
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Listening...
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Speak clearly about your topic
                  </p>
                </div>

                {/* Waveform Visualization */}
                <div className="flex items-center justify-center gap-1 h-24 sm:h-32">
                  {waveHeight.map((height, idx) => (
                    <motion.div
                      key={idx}
                      className="w-2 sm:w-3 bg-gradient-to-t from-violet-600 to-fuchsia-600 rounded-full"
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.15 }}
                    />
                  ))}
                </div>

                {/* Live Transcript */}
                <div className="p-4 sm:p-6 rounded-2xl bg-gray-100 dark:bg-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Volume2 className="w-5 h-5 text-violet-600" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Transcript</span>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-900 dark:text-white text-sm sm:text-base"
                  >
                    "Photosynthesis is the process by which plants convert sunlight into energy..."
                  </motion.p>
                </div>
              </motion.div>
            )}

            {phase === 2 && (
              <motion.div key="phase-2" {...fadeInUp} className="flex flex-col items-center justify-center py-8 sm:py-12">
                <motion.div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-8">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-violet-600" />
                  </motion.div>
                </motion.div>
                
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Processing Speech
                </h4>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 text-center">
                  Converting your speech into quiz questions
                </p>
                
                <div className="space-y-3 w-full max-w-md">
                  {["Transcribing audio", "Analyzing content", "Generating questions"].map((text, idx) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.3 }}
                      className="flex items-center gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300"
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: idx * 0.3 }}
                      />
                      <span>{text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 3 && (
              <motion.div key="phase-3" {...fadeInUp} className="space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Speech Quiz Ready!
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    8 questions generated from your speech
                  </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {["Voice answers supported", "Text answers available", "Instant feedback", "Progress tracking"].map((feature, idx) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                          {feature}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm sm:text-base font-bold hover:scale-105 transition-all">
                  Start Quiz with Voice
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-6">
          {[0, 1, 2, 3].map((idx) => (
            <motion.div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                phase === idx ? "w-8 bg-violet-600" : "w-2 bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

SpeechQuizDemo.displayName = "SpeechQuizDemo";

// ==================== MAIN COMPONENT ====================
export default function ProductDemo() {
  const [activeDemo, setActiveDemo] = useState(0);

  const demos = [
    { id: 0, title: "AI Quiz Generator", icon: Brain, color: "indigo", Component: QuizGeneratorDemo },
    { id: 1, title: "1v1 Duel Battles", icon: Swords, color: "red", Component: DuelBattleDemo },
    { id: 2, title: "Live Sessions", icon: Radio, color: "green", Component: LiveSessionDemo },
    { id: 3, title: "Speech-Based Quiz", icon: Mic, color: "violet", Component: SpeechQuizDemo },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10 sm:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Interactive Product Demos
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            See Our{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Features
            </span>{" "}
            in Action
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Every feature is fully built and ready to use. Try our interactive demos below.
          </p>
        </motion.div>

        {/* Demo Selector */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-12">
          {demos.map((demo) => (
            <motion.button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all text-sm sm:text-base ${
                activeDemo === demo.id
                  ? `bg-gradient-to-r ${
                      demo.color === "indigo" ? "from-indigo-600 to-purple-600" :
                      demo.color === "red" ? "from-red-600 to-orange-600" :
                      demo.color === "green" ? "from-green-600 to-emerald-600" :
                      "from-violet-600 to-fuchsia-600"
                    } text-white shadow-xl`
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <demo.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{demo.title}</span>
              <span className="sm:hidden">{demo.title.split(" ")[0]}</span>
            </motion.button>
          ))}
        </div>

        {/* Demo Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDemo}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {React.createElement(demos[activeDemo].Component)}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          className="text-center mt-10 sm:mt-12 lg:mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
