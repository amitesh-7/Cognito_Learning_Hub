import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Brain,
  FileText,
  Youtube,
  Sparkles,
  CheckCircle,
  Circle,
  ArrowRight,
  Zap,
  Users,
  Trophy,
  Swords,
  Video,
  MessageSquare,
  Play,
  Pause,
  ChevronRight,
  ListChecks,
  ToggleLeft,
  AlignLeft,
  Clock,
  Target,
  Crown,
  Medal,
  Star,
  Mic,
  Camera,
  ScreenShare,
  Hand,
  Send,
  Radio,
} from "lucide-react";
import { useRef } from "react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

// ==================== DEMO 1: AI QUIZ GENERATION ====================
const QuizGenerationDemo = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const steps = [
    { id: 0, label: "Choose Source", icon: Brain },
    { id: 1, label: "AI Processing", icon: Sparkles },
    { id: 2, label: "Quiz Ready", icon: CheckCircle },
  ];

  const sources = [
    { icon: Brain, label: "Topic", desc: "Enter any topic", color: "indigo" },
    { icon: FileText, label: "PDF", desc: "Upload documents", color: "green" },
    { icon: Youtube, label: "YouTube", desc: "Paste video URL", color: "red" },
  ];

  const questionTypes = [
    { icon: ListChecks, label: "MCQ", desc: "Multiple Choice" },
    { icon: ToggleLeft, label: "True/False", desc: "Binary Questions" },
    { icon: AlignLeft, label: "Descriptive", desc: "Long Answers" },
  ];

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <div ref={ref} className="relative">
      {/* Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-4">
          <Brain className="w-4 h-4" />
          AI Quiz Generator
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Create Quizzes in{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            30 Seconds
          </span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Transform any content into engaging quizzes with our AI. Support for topics, PDFs, and YouTube videos.
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex justify-center gap-4 mb-12">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-500 ${
              activeStep >= idx
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}
            animate={activeStep === idx ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <step.icon className="w-5 h-5" />
            <span className="font-semibold hidden sm:block">{step.label}</span>
            {idx < 2 && <ChevronRight className="w-4 h-4 ml-2 hidden sm:block" />}
          </motion.div>
        ))}
      </div>

      {/* Demo Area */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Browser Chrome */}
        <div className="bg-gray-100 dark:bg-gray-900 px-6 py-4 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-500">
            cognito-learning-hub.com/quiz-maker
          </div>
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-8"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Choose Your Source
                </h3>
                
                {/* Source Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  {sources.map((source, idx) => (
                    <motion.div
                      key={source.label}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className={`p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 hover:scale-105 ${
                        source.color === "indigo"
                          ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:border-indigo-500"
                          : source.color === "green"
                          ? "border-green-300 bg-green-50 dark:bg-green-900/20 hover:border-green-500"
                          : "border-red-300 bg-red-50 dark:bg-red-900/20 hover:border-red-500"
                      }`}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                      >
                        <source.icon className={`w-12 h-12 mb-4 ${
                          source.color === "indigo" ? "text-indigo-600" :
                          source.color === "green" ? "text-green-600" : "text-red-600"
                        }`} />
                      </motion.div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{source.label}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{source.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Question Types */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Question Types Supported:
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {questionTypes.map((type, idx) => (
                      <motion.div
                        key={type.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl"
                      >
                        <type.icon className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col items-center justify-center py-12"
              >
                {/* AI Processing Animation */}
                <motion.div
                  className="relative w-40 h-40 mb-8"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-300 dark:border-indigo-700" />
                  
                  {/* Middle ring */}
                  <motion.div
                    className="absolute inset-4 rounded-full border-4 border-purple-400"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Inner glow */}
                  <motion.div
                    className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Brain className="w-12 h-12 text-white" />
                  </motion.div>

                  {/* Orbiting particles */}
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-lg"
                      style={{
                        top: "50%",
                        left: "50%",
                      }}
                      animate={{
                        x: [0, Math.cos((i * Math.PI) / 2) * 70, 0],
                        y: [0, Math.sin((i * Math.PI) / 2) * 70, 0],
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  ))}
                </motion.div>

                <motion.h3
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  AI is Generating Your Quiz...
                </motion.h3>

                {/* Processing steps */}
                <div className="space-y-3 text-left w-full max-w-md">
                  {["Analyzing content...", "Extracting key concepts...", "Generating questions...", "Adding explanations..."].map((text, idx) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.4 }}
                      className="flex items-center gap-3"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.5, delay: idx * 0.4 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </motion.div>
                      <span className="text-gray-700 dark:text-gray-300">{text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                {/* Success Banner */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-green-700 dark:text-green-400">Quiz Generated Successfully!</h4>
                    <p className="text-sm text-green-600 dark:text-green-500">10 questions ready in 28 seconds</p>
                  </div>
                </motion.div>

                {/* Generated Questions Preview */}
                <div className="space-y-4">
                  {[
                    { type: "MCQ", q: "What is the primary function of mitochondria?", difficulty: "Medium" },
                    { type: "True/False", q: "Photosynthesis occurs only in green plants.", difficulty: "Easy" },
                    { type: "Descriptive", q: "Explain the process of cellular respiration.", difficulty: "Hard" },
                  ].map((question, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold">
                          {question.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          question.difficulty === "Easy" ? "bg-green-100 text-green-600" :
                          question.difficulty === "Medium" ? "bg-yellow-100 text-yellow-600" :
                          "bg-red-100 text-red-600"
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">{question.q}</p>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex justify-center pt-4"
                >
                  <Link
                    to="/quiz-maker"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  >
                    Try Quiz Maker Now
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ==================== DEMO 2: 1v1 DUEL BATTLE ====================
const DuelBattleDemo = () => {
  const [battlePhase, setBattlePhase] = useState(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    
    const interval = setInterval(() => {
      setBattlePhase((prev) => {
        const next = (prev + 1) % 4;
        if (next === 2) {
          setPlayer1Score((s) => s + (Math.random() > 0.4 ? 100 : 0));
          setPlayer2Score((s) => s + (Math.random() > 0.5 ? 100 : 0));
        }
        if (next === 0) {
          setPlayer1Score(0);
          setPlayer2Score(0);
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <div ref={ref} className="relative">
      {/* Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 text-sm font-semibold mb-4">
          <Swords className="w-4 h-4" />
          1v1 Duel Arena
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Real-Time{" "}
          <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Quiz Battles
          </span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Challenge friends to intense 1v1 quiz battles. Answer faster, score higher, claim victory!
        </p>
      </motion.div>

      {/* Battle Arena */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-purple-500/30">
        {/* Arena Header */}
        <div className="bg-black/30 px-6 py-4 flex items-center justify-between border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
            <span className="text-white font-semibold">LIVE DUEL</span>
          </div>
          <div className="flex items-center gap-2 text-purple-300">
            <Clock className="w-4 h-4" />
            <span>Question 5/10</span>
          </div>
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            whileHover={{ scale: 1.1 }}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Battle Content */}
        <div className="p-8">
          {/* VS Display */}
          <div className="flex items-center justify-between gap-8 mb-8">
            {/* Player 1 */}
            <motion.div
              className="flex-1 text-center"
              animate={battlePhase === 2 ? { scale: [1, 1.1, 1] } : {}}
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/50"
                animate={{ boxShadow: player1Score > player2Score ? ["0 0 20px #3B82F6", "0 0 40px #3B82F6", "0 0 20px #3B82F6"] : {} }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Y
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">You</h3>
              <motion.div
                className="text-4xl font-black text-blue-400"
                key={player1Score}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
              >
                {player1Score}
              </motion.div>
            </motion.div>

            {/* VS Badge */}
            <motion.div
              className="relative"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center shadow-2xl shadow-red-500/50">
                <Swords className="w-10 h-10 text-white" />
              </div>
              <motion.div
                className="absolute -inset-4 rounded-full border-2 border-red-500/50"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Player 2 */}
            <motion.div
              className="flex-1 text-center"
              animate={battlePhase === 2 ? { scale: [1, 1.1, 1] } : {}}
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-red-500/50"
                animate={{ boxShadow: player2Score > player1Score ? ["0 0 20px #EF4444", "0 0 40px #EF4444", "0 0 20px #EF4444"] : {} }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                O
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Opponent</h3>
              <motion.div
                className="text-4xl font-black text-red-400"
                key={player2Score}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
              >
                {player2Score}
              </motion.div>
            </motion.div>
          </div>

          {/* Question Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={battlePhase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              {battlePhase === 0 && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                    className="text-6xl font-black text-white mb-4"
                  >
                    3...2...1...
                  </motion.div>
                  <p className="text-purple-300">Get Ready!</p>
                </div>
              )}
              
              {battlePhase === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-4">
                    <Zap className="w-5 h-5" />
                    <span className="font-semibold">Question 5</span>
                  </div>
                  <h4 className="text-xl text-white font-medium">
                    What is the capital of France?
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {["Paris", "London", "Berlin", "Madrid"].map((opt, idx) => (
                      <motion.button
                        key={opt}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-xl border-2 text-white font-medium transition-all ${
                          idx === 0
                            ? "border-green-500 bg-green-500/20"
                            : "border-white/30 bg-white/5 hover:bg-white/10"
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {battlePhase === 2 && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    className="text-6xl mb-4"
                  >
                    ⚡
                  </motion.div>
                  <h4 className="text-2xl font-bold text-green-400">Correct!</h4>
                  <p className="text-white/70">+100 points</p>
                </div>
              )}

              {battlePhase === 3 && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-6xl mb-4"
                  >
                    🏆
                  </motion.div>
                  <h4 className="text-2xl font-bold text-yellow-400">Battle Complete!</h4>
                  <p className="text-white/70">Winner: {player1Score >= player2Score ? "You!" : "Opponent"}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* CTA */}
          <motion.div className="flex justify-center mt-8">
            <Link
              to="/duel-arena"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Enter Duel Arena
              <Swords className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ==================== DEMO 3: LIVE SESSION (Teacher Hosts, Students Join) ====================
const LiveSessionDemo = () => {
  const [phase, setPhase] = useState(0);
  const [participants, setParticipants] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const participantNames = ["Alex", "Sam", "Jordan", "Casey", "Riley", "Morgan", "Taylor", "Quinn"];

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4);
      if (phase === 1) {
        setParticipants((p) => Math.min(p + Math.floor(Math.random() * 3) + 1, 8));
      }
      if (phase === 3) {
        setParticipants(0);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying, isInView, phase]);

  return (
    <div ref={ref} className="relative">
      {/* Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 text-sm font-semibold mb-4">
          <Radio className="w-4 h-4" />
          Live Sessions
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Host{" "}
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Multiplayer Quizzes
          </span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Teachers host live quiz sessions. Students join with a code and compete in real-time!
        </p>
      </motion.div>

      {/* Demo Container */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Teacher View */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-300" />
              <span className="text-white font-bold">Teacher Dashboard</span>
            </div>
            <motion.button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </motion.button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {phase === 0 && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Radio className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Creating Session...</h3>
                  <p className="text-gray-500">Generating join code</p>
                </motion.div>
              )}

              {(phase === 1 || phase === 2) && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Share this code with students:</p>
                    <motion.div
                      className="text-4xl font-black tracking-widest text-green-600 bg-green-50 dark:bg-green-900/20 py-4 rounded-xl"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      QUIZ-7842
                    </motion.div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Participants</span>
                      <span className="text-green-600 font-bold">{participants}/30</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {participantNames.slice(0, participants).map((name, idx) => (
                        <motion.div
                          key={name}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium"
                        >
                          {name}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {phase === 2 && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl"
                    >
                      Start Quiz →
                    </motion.button>
                  )}
                </motion.div>
              )}

              {phase === 3 && (
                <motion.div
                  key="live"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quiz Live!</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-2xl font-bold text-green-600">{participants}</p>
                      <p className="text-xs text-gray-500">Playing</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">Q3</p>
                      <p className="text-xs text-gray-500">Current</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-2xl font-bold text-purple-600">15s</p>
                      <p className="text-xs text-gray-500">Left</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Student View */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
            <Users className="w-6 h-6 text-white" />
            <span className="text-white font-bold">Student View</span>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {phase === 0 && (
                <motion.div
                  key="join"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Join a Session</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Enter join code..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700"
                      value="QUIZ-7842"
                      readOnly
                    />
                    <motion.button
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl"
                      whileHover={{ scale: 1.02 }}
                    >
                      Join Quiz
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {phase === 1 && (
                <motion.div
                  key="waiting-student"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto mb-6 border-4 border-blue-200 border-t-blue-600 rounded-full"
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're In!</h3>
                  <p className="text-gray-500">Waiting for teacher to start...</p>
                </motion.div>
              )}

              {(phase === 2 || phase === 3) && (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Question 3/10</span>
                    <span className="text-red-500 font-bold">15s</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    Which planet is known as the Red Planet?
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {["Mars", "Venus", "Jupiter", "Saturn"].map((opt, idx) => (
                      <motion.button
                        key={opt}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-xl font-medium transition-all ${
                          idx === 0
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CTA */}
      <motion.div className="flex justify-center mt-8">
        <Link
          to="/live/create"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
        >
          Host Live Session
          <Radio className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
};

// ==================== DEMO 4: VIDEO MEETING ====================
const MeetingDemo = () => {
  const [phase, setPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <div ref={ref} className="relative">
      {/* Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 text-sm font-semibold mb-4">
          <Video className="w-4 h-4" />
          Video Meetings
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Built-in{" "}
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Video Conferencing
          </span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Host video meetings with screen sharing, chat, and interactive features—all within the platform.
        </p>
      </motion.div>

      {/* Video Meeting Demo */}
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Meeting Header */}
        <div className="bg-black/50 px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
            <span className="text-white font-semibold">Study Session: Physics Revision</span>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              6 participants
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              45:32
            </span>
          </div>
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Meeting Content */}
        <div className="p-8">
          {/* Video Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Main Speaker */}
            <div className="col-span-2 row-span-2 relative">
              <div className="aspect-video bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center overflow-hidden">
                <motion.div
                  className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center"
                  animate={phase === 1 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <span className="text-5xl font-bold text-white">T</span>
                </motion.div>
                
                {/* Speaking indicator */}
                {phase === 1 && (
                  <motion.div
                    className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-500 px-3 py-1 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    />
                    <span className="text-white text-sm font-medium">Speaking</span>
                  </motion.div>
                )}

                {/* Screen share indicator */}
                {phase === 2 && (
                  <motion.div
                    className="absolute inset-4 border-2 border-blue-400 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="absolute top-2 left-2 flex items-center gap-2 bg-blue-500 px-3 py-1 rounded-full">
                      <ScreenShare className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">Screen Shared</span>
                    </div>
                  </motion.div>
                )}
              </div>
              <p className="text-white font-medium mt-2 ml-2">Teacher (Host)</p>
            </div>

            {/* Other Participants */}
            {["Alex", "Sam", "Jordan", "Casey"].map((name, idx) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className={`aspect-video rounded-xl flex items-center justify-center ${
                  ["bg-gradient-to-br from-blue-500 to-cyan-600",
                   "bg-gradient-to-br from-green-500 to-emerald-600",
                   "bg-gradient-to-br from-orange-500 to-red-600",
                   "bg-gradient-to-br from-pink-500 to-rose-600"][idx]
                }`}>
                  <span className="text-2xl font-bold text-white">{name[0]}</span>
                </div>
                <p className="text-white/70 text-sm mt-1 ml-1">{name}</p>
                
                {/* Random hand raise */}
                {idx === 2 && phase === 0 && (
                  <motion.div
                    className="absolute top-2 right-2 bg-yellow-500 p-1.5 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Hand className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Control Bar */}
          <div className="flex items-center justify-center gap-4">
            {[
              { icon: Mic, label: "Mute", active: true },
              { icon: Camera, label: "Camera", active: true },
              { icon: ScreenShare, label: "Share", active: phase === 2 },
              { icon: Hand, label: "Raise Hand", active: false },
              { icon: MessageSquare, label: "Chat", active: false },
            ].map((control, idx) => (
              <motion.button
                key={control.label}
                className={`p-4 rounded-xl transition-all ${
                  control.active
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/50 hover:bg-white/15"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <control.icon className="w-6 h-6" />
              </motion.button>
            ))}
            <motion.button
              className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              Leave
            </motion.button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <motion.div className="flex justify-center mt-8">
        <Link
          to="/meeting/create"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
        >
          Start a Meeting
          <Video className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
};

// ==================== MAIN PRODUCT DEMO COMPONENT ====================
export default function ProductDemo() {
  const [activeDemo, setActiveDemo] = useState(0);
  
  const demos = [
    { id: 0, label: "AI Quiz Generator", icon: Brain, color: "indigo" },
    { id: 1, label: "1v1 Duel Battles", icon: Swords, color: "red" },
    { id: 2, label: "Live Sessions", icon: Radio, color: "green" },
    { id: 3, label: "Video Meetings", icon: Video, color: "purple" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Interactive Product Demos
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            See{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Real Features
            </span>{" "}
            in Action
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Every feature shown here is fully built and working. Explore our interactive demos to see what Cognito Learning Hub can do.
          </p>
        </motion.div>

        {/* Demo Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {demos.map((demo) => (
            <motion.button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                activeDemo === demo.id
                  ? `bg-gradient-to-r ${
                      demo.color === "indigo" ? "from-indigo-600 to-purple-600" :
                      demo.color === "red" ? "from-red-600 to-orange-600" :
                      demo.color === "green" ? "from-green-600 to-emerald-600" :
                      "from-purple-600 to-pink-600"
                    } text-white shadow-xl`
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <demo.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{demo.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Demo Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDemo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeDemo === 0 && <QuizGenerationDemo />}
            {activeDemo === 1 && <DuelBattleDemo />}
            {activeDemo === 2 && <LiveSessionDemo />}
            {activeDemo === 3 && <MeetingDemo />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
