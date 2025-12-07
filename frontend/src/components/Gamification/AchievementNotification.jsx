import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Sparkles, Star, Zap, Crown, Flame } from "lucide-react";
import { useGamification } from "../../context/GamificationContext";
import CelebrationModal from "./CelebrationModal";
import XPFloatingAnimation from "./XPFloatingAnimation";

/**
 * AchievementNotification
 * Enhanced global notification system for achievements, level-ups, and XP gains
 */
const AchievementNotification = () => {
  const { 
    achievementNotification, 
    clearAchievementNotification, 
    xpAnimation,
    userStats 
  } = useGamification();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState("achievement");
  const [celebrationData, setCelebrationData] = useState({});
  const [levelUpQueue, setLevelUpQueue] = useState([]);
  const [xpQueue, setXpQueue] = useState([]);
  const [previousLevel, setPreviousLevel] = useState(null);

  // Detect level up
  useEffect(() => {
    if (userStats?.level && previousLevel !== null && userStats.level > previousLevel) {
      setLevelUpQueue((prev) => [...prev, { 
        newLevel: userStats.level, 
        bonusXP: userStats.level * 50 
      }]);
    }
    if (userStats?.level) {
      setPreviousLevel(userStats.level);
    }
  }, [userStats?.level, previousLevel]);

  // Handle achievement notifications
  useEffect(() => {
    if (achievementNotification) {
      setCelebrationType("achievement");
      setCelebrationData(achievementNotification);
      setShowCelebration(true);
    }
  }, [achievementNotification]);

  // Handle level up queue
  useEffect(() => {
    if (levelUpQueue.length > 0 && !showCelebration) {
      const [current, ...rest] = levelUpQueue;
      setCelebrationType("levelUp");
      setCelebrationData(current);
      setShowCelebration(true);
      setLevelUpQueue(rest);
    }
  }, [levelUpQueue, showCelebration]);

  // Handle XP animations
  useEffect(() => {
    if (xpAnimation) {
      setXpQueue((prev) => [...prev, { ...xpAnimation, id: Date.now() }]);
    }
  }, [xpAnimation]);

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    if (celebrationType === "achievement") {
      clearAchievementNotification();
    }
  };

  const handleXPComplete = (id) => {
    setXpQueue((prev) => prev.filter((xp) => xp.id !== id));
  };

  return (
    <>
      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={handleCloseCelebration}
        type={celebrationType}
        data={celebrationData}
      />

      {/* XP Floating Animations */}
      <AnimatePresence>
        {xpQueue.map((xp, index) => (
          <XPFloatingAnimation
            key={xp.id}
            amount={xp.amount}
            position={index === 0 ? "bottom-right" : "bottom-left"}
            onComplete={() => handleXPComplete(xp.id)}
          />
        ))}
      </AnimatePresence>

      {/* Mini achievement toast (for less intrusive notifications) */}
      <MiniAchievementToast />
    </>
  );
};

/**
 * MiniAchievementToast
 * Small, less intrusive notification for minor achievements or updates
 */
const MiniAchievementToast = () => {
  const [toasts, setToasts] = useState([]);
  const { userStats } = useGamification();

  // Example: Add toasts for streak milestones
  useEffect(() => {
    if (userStats?.currentStreak && userStats.currentStreak % 5 === 0 && userStats.currentStreak > 0) {
      addToast({
        type: "streak",
        message: `🔥 ${userStats.currentStreak} day streak!`,
        icon: "🔥",
      });
    }
  }, [userStats?.currentStreak]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <div className="fixed top-20 right-4 z-[9996] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 max-w-xs"
          >
            <span className="text-2xl">{toast.icon}</span>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {toast.message}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AchievementNotification;
