import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatar } from '../../context/AvatarContext';
import AvatarDisplay from './AvatarDisplay';
import { Minimize2, Maximize2, X, Sparkles, Heart, Zap, MessageCircle } from 'lucide-react';

/**
 * QuizAvatarCompanion Component
 * An animated avatar companion that appears during quiz taking
 * - Provides emotional reactions based on performance
 * - Shows encouragement messages
 * - Can be minimized or closed
 */
const QuizAvatarCompanion = ({
  position = 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  minimized = false,
  onMinimize,
  onClose,
  currentMood = 'idle',
  message = '',
  showEncouragement = true,
}) => {
  const { avatar, stats } = useAvatar();
  const [isMinimized, setIsMinimized] = useState(minimized);
  const [currentMessage, setCurrentMessage] = useState(message);
  const [showMessage, setShowMessage] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);

  // Position styles
  const positionStyles = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  // Mood-based messages
  const moodMessages = {
    idle: [
      "Let's do this! 💪",
      "You've got this!",
      "Focus and breathe ✨",
    ],
    correct: [
      "Amazing! Keep it up! 🎉",
      "That's right! You're on fire! 🔥",
      "Brilliant answer! 🌟",
      "Perfect! You're crushing it! 💯",
    ],
    wrong: [
      "Don't worry, keep trying! 💙",
      "Learn from this and move on! 🌱",
      "Mistakes help us grow! 🌟",
      "You'll get the next one! 💪",
    ],
    streak: [
      "Incredible streak! 🔥",
      "Unstoppable! Keep going! ⚡",
      "You're on a roll! 🎯",
    ],
    thinking: [
      "Take your time... 🤔",
      "Think it through carefully 💭",
      "You can figure this out! 🧠",
    ],
    celebrate: [
      "Woohoo! Fantastic! 🎊",
      "You did it! Amazing! 🏆",
      "Legendary performance! ⭐",
    ],
  };

  // Update message when mood changes
  useEffect(() => {
    if (currentMood && moodMessages[currentMood]) {
      const messages = moodMessages[currentMood];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCurrentMessage(randomMessage);
      setShowMessage(true);
      setPulseEffect(true);

      // Hide message after 3 seconds
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);

      // Remove pulse effect
      const pulseTimer = setTimeout(() => {
        setPulseEffect(false);
      }, 500);

      return () => {
        clearTimeout(timer);
        clearTimeout(pulseTimer);
      };
    }
  }, [currentMood]);

  // Update external message prop
  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setShowMessage(true);
    }
  }, [message]);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (onMinimize) onMinimize(!isMinimized);
  };

  if (!avatar) return null;

  return (
    <motion.div
      className={`fixed ${positionStyles[position]} z-50`}
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Minimized State */}
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="relative"
          >
            {/* Minimized Avatar Button */}
            <motion.button
              onClick={handleMinimize}
              className={`relative ${pulseEffect ? 'animate-bounce' : ''}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <AvatarDisplay
                avatar={avatar}
                size="sm"
                animated={true}
                className="ring-4 ring-indigo-500/50 shadow-2xl shadow-indigo-500/50"
              />
              
              {/* Level Badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg ring-2 ring-white">
                {stats?.level || 1}
              </div>

              {/* Pulse Ring Effect */}
              {pulseEffect && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-indigo-500"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.button>

            {/* Notification Badge */}
            {showMessage && (
              <motion.div
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 10 }}
                className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
              >
                !
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-4 border-indigo-500/30 dark:border-indigo-400/30 overflow-hidden"
            style={{ width: '320px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-white" />
                <div>
                  <h3 className="text-white font-bold text-sm">Study Companion</h3>
                  <p className="text-white/80 text-xs">Level {stats?.level || 1}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleMinimize}
                  className="text-white/80 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Minimize2 className="w-4 h-4" />
                </motion.button>
                {onClose && (
                  <motion.button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Avatar Display */}
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900/20 relative">
              {/* Decorative Background */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <motion.div
                  className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"
                  animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                />
              </div>

              {/* Avatar */}
              <div className="relative z-10 flex justify-center">
                <motion.div
                  animate={
                    currentMood === 'celebrate'
                      ? { rotate: [0, -5, 5, -5, 5, 0], y: [0, -10, 0] }
                      : currentMood === 'correct'
                      ? { y: [0, -5, 0] }
                      : currentMood === 'thinking'
                      ? { x: [0, -3, 3, -3, 3, 0] }
                      : {}
                  }
                  transition={{ duration: 0.6 }}
                >
                  <AvatarDisplay
                    avatar={avatar}
                    size="lg"
                    animated={true}
                    showMood={true}
                    className="shadow-2xl ring-4 ring-white dark:ring-gray-800"
                  />
                </motion.div>
              </div>
            </div>

            {/* Message Section */}
            <AnimatePresence mode="wait">
              {showMessage && currentMessage && (
                <motion.div
                  key={currentMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-indigo-100 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                    >
                      {currentMood === 'correct' && <Heart className="w-5 h-5 text-green-500" />}
                      {currentMood === 'wrong' && <MessageCircle className="w-5 h-5 text-blue-500" />}
                      {currentMood === 'streak' && <Zap className="w-5 h-5 text-orange-500" />}
                      {currentMood === 'celebrate' && <Sparkles className="w-5 h-5 text-purple-500" />}
                      {!['correct', 'wrong', 'streak', 'celebrate'].includes(currentMood) && (
                        <MessageCircle className="w-5 h-5 text-indigo-500" />
                      )}
                    </motion.div>
                    
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                      {currentMessage}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats Bar */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 flex items-center justify-around border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">XP</p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {stats?.experience || 0}
                </p>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
                <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {stats?.level || 1}
                </p>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Collection</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {stats?.completionPercentage || 0}%
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizAvatarCompanion;
