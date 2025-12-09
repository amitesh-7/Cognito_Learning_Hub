import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, BookOpen, Lightbulb, Zap, CheckCircle, Loader2 } from 'lucide-react';

// Loading messages that cycle through during generation
const loadingMessages = [
  { icon: Brain, text: "AI is analyzing your topic...", color: "from-purple-500 to-indigo-500" },
  { icon: Sparkles, text: "Generating intelligent questions...", color: "from-pink-500 to-purple-500" },
  { icon: BookOpen, text: "Crafting answer options...", color: "from-blue-500 to-cyan-500" },
  { icon: Lightbulb, text: "Adding explanations...", color: "from-amber-500 to-orange-500" },
  { icon: Zap, text: "Optimizing difficulty levels...", color: "from-emerald-500 to-teal-500" },
  { icon: CheckCircle, text: "Finalizing your quiz...", color: "from-green-500 to-emerald-500" },
];

// Fun tips displayed during loading
const funTips = [
  "💡 Did you know? Active recall improves memory retention by 50%!",
  "🎯 Tip: Taking quizzes regularly helps build long-term memory.",
  "🧠 Fun fact: Your brain creates new neural pathways while learning!",
  "⚡ Pro tip: Review mistakes to learn faster and better.",
  "🌟 Studies show spaced repetition boosts learning efficiency.",
  "📚 Fact: Teaching others is one of the best ways to learn!",
];

export default function LoadingSpinner({ message, showProgress = true }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(messageInterval);
  }, []);

  // Cycle through tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % funTips.length);
    }, 5000);

    return () => clearInterval(tipInterval);
  }, []);

  // Simulate progress (for visual feedback)
  useEffect(() => {
    if (!showProgress) return;
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Cap at 95% until actually done
        const increment = Math.random() * 8 + 2;
        return Math.min(prev + increment, 95);
      });
    }, 800);

    return () => clearInterval(progressInterval);
  }, [showProgress]);

  const currentMessage = loadingMessages[currentMessageIndex];
  const CurrentIcon = currentMessage.icon;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        {/* Main Loading Card */}
        <motion.div 
          className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          {/* Animated Background Gradient */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${currentMessage.color} opacity-5`}
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-indigo-400/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            {/* Animated Icon */}
            <div className="flex justify-center mb-8">
              <motion.div
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {/* Outer Ring */}
                <motion.div
                  className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentMessage.color} p-1`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    {/* Inner Spinning Ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Icon */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentMessageIndex}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", damping: 15 }}
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentMessage.color} flex items-center justify-center shadow-lg`}
                      >
                        <CurrentIcon className="w-8 h-8 text-white" />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Pulse Effect */}
                <motion.div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentMessage.color} opacity-20`}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>

            {/* Loading Message */}
            <div className="text-center mb-6">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                >
                  {message || currentMessage.text}
                </motion.h2>
              </AnimatePresence>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Our AI is crafting the perfect quiz for you
              </p>
            </div>

            {/* Progress Bar */}
            {showProgress && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${currentMessage.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Fun Tip */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTipIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50"
              >
                <p className="text-sm text-center text-indigo-700 dark:text-indigo-300 font-medium">
                  {funTips[currentTipIndex]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom Decorative Elements */}
        <motion.div 
          className="flex justify-center mt-6 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-indigo-500"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}