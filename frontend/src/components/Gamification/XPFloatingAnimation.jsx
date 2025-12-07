import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, Star, ArrowUp } from "lucide-react";

/**
 * XPFloatingAnimation
 * Floating XP gain indicator that appears when XP is earned
 */
const XPFloatingAnimation = ({ amount, position = "bottom-right", onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [floatingNumbers, setFloatingNumbers] = useState([]);

  useEffect(() => {
    if (amount) {
      // Create multiple floating number particles
      const numbers = Array.from({ length: Math.min(amount / 10, 5) + 1 }, (_, i) => ({
        id: i,
        value: Math.floor(amount / (i + 1)),
        delay: i * 0.1,
        x: (Math.random() - 0.5) * 100,
      }));
      setFloatingNumbers(numbers);

      // Hide after animation
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [amount, onComplete]);

  const positionClasses = {
    "bottom-right": "bottom-8 right-8",
    "bottom-left": "bottom-8 left-8",
    "top-right": "top-24 right-8",
    "top-left": "top-24 left-8",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  if (!amount) return null;

  return (
    <AnimatePresence>
      {visible && (
        <div className={`fixed ${positionClasses[position]} z-[9997] pointer-events-none`}>
          {/* Main XP gain card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ type: "spring", damping: 12 }}
            className="relative"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Card content */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-5 shadow-2xl border border-white/20">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />

              <div className="relative flex items-center gap-4">
                {/* Animated icon */}
                <motion.div
                  className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                  </motion.div>
                </motion.div>

                {/* XP text */}
                <div>
                  <motion.p
                    className="text-white/80 text-sm font-medium uppercase tracking-wide"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Experience Gained
                  </motion.p>
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-4xl font-black text-white">+{amount}</span>
                    <span className="text-xl font-bold text-yellow-300">XP</span>
                  </motion.div>
                </div>

                {/* Trending up icon */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="ml-auto"
                >
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowUp className="w-8 h-8 text-green-400" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Progress indicator */}
              <motion.div
                className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-400 via-green-400 to-cyan-400"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Floating number particles */}
          {floatingNumbers.map((num) => (
            <motion.div
              key={num.id}
              initial={{ opacity: 0, y: 0, x: num.x }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: -150 - num.id * 30,
                x: num.x + (Math.random() - 0.5) * 50,
              }}
              transition={{ duration: 2, delay: num.delay, ease: "easeOut" }}
              className="absolute top-0 left-1/2 pointer-events-none"
            >
              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/90 rounded-full shadow-lg">
                <Star className="w-4 h-4 text-white fill-white" />
                <span className="text-white font-bold text-sm">+{num.value}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

/**
 * PointsCounter
 * Animated counter that shows points incrementing
 */
export const PointsCounter = ({ value, previousValue = 0, duration = 1 }) => {
  const [displayValue, setDisplayValue] = useState(previousValue);

  useEffect(() => {
    if (value === previousValue) return;

    const diff = value - previousValue;
    const steps = Math.min(Math.abs(diff), 30);
    const increment = diff / steps;
    let current = previousValue;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      setDisplayValue(Math.round(current));

      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(interval);
      }
    }, (duration * 1000) / steps);

    return () => clearInterval(interval);
  }, [value, previousValue, duration]);

  return (
    <motion.span
      key={value}
      initial={{ scale: 1.2, color: "#22c55e" }}
      animate={{ scale: 1, color: "inherit" }}
      transition={{ duration: 0.3 }}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  );
};

/**
 * XPProgressRing
 * Circular progress indicator for XP/Level
 */
export const XPProgressRing = ({
  current,
  max,
  size = 80,
  strokeWidth = 6,
  className = "",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((current / max) * 100, 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#xpGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
        <defs>
          <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

export default XPFloatingAnimation;
