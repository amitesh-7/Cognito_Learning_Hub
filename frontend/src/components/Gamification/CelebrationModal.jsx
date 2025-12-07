import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Sparkles,
  X,
  Zap,
  Crown,
  Flame,
  Gift,
  Medal,
  Target,
  Award,
  TrendingUp,
  PartyPopper,
} from "lucide-react";

/**
 * CelebrationModal
 * A beautiful fullscreen celebration modal for achievements, level-ups, and XP gains
 */
const CelebrationModal = ({
  isOpen,
  onClose,
  type = "achievement", // "achievement", "levelUp", "xpGain", "streak", "milestone"
  data = {},
}) => {
  const [particles, setParticles] = useState([]);
  const [showContent, setShowContent] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Generate particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 12 + 4,
        color: getRandomColor(),
        delay: Math.random() * 0.5,
        duration: Math.random() * 2 + 2,
      }));
      setParticles(newParticles);

      // Show content after a brief delay
      setTimeout(() => setShowContent(true), 300);

      // Play celebration sound
      try {
        audioRef.current = new Audio("/sounds/celebration.mp3");
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(() => {});
      } catch (e) {}

      // Auto close after delay for XP gains
      if (type === "xpGain") {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setShowContent(false);
    }
  }, [isOpen, type, onClose]);

  const getRandomColor = () => {
    const colors = [
      "#FFD700", // Gold
      "#FF6B6B", // Coral
      "#4ECDC4", // Teal
      "#A855F7", // Purple
      "#3B82F6", // Blue
      "#10B981", // Emerald
      "#F59E0B", // Amber
      "#EC4899", // Pink
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getModalConfig = () => {
    switch (type) {
      case "achievement":
        return {
          title: "🎉 Achievement Unlocked!",
          subtitle: data.name || "New Achievement",
          description: data.description || "You've earned a new achievement!",
          icon: data.icon || "🏆",
          points: data.points,
          rarity: data.rarity || "common",
          gradient: getRarityGradient(data.rarity),
          glow: getRarityGlow(data.rarity),
        };
      case "levelUp":
        return {
          title: "⬆️ Level Up!",
          subtitle: `Level ${data.newLevel}`,
          description: `Congratulations! You've reached Level ${data.newLevel}!`,
          icon: "👑",
          points: data.bonusXP,
          gradient: "from-indigo-600 via-purple-600 to-pink-600",
          glow: "shadow-purple-500/50",
        };
      case "xpGain":
        return {
          title: "⚡ XP Earned!",
          subtitle: `+${data.amount} XP`,
          description: data.reason || "Keep up the great work!",
          icon: "✨",
          gradient: "from-blue-500 via-cyan-500 to-teal-500",
          glow: "shadow-cyan-500/50",
        };
      case "streak":
        return {
          title: "🔥 Streak Milestone!",
          subtitle: `${data.days} Day Streak!`,
          description: `You've been learning for ${data.days} days in a row!`,
          icon: "🔥",
          points: data.bonusXP,
          gradient: "from-orange-500 via-red-500 to-pink-500",
          glow: "shadow-orange-500/50",
        };
      case "milestone":
        return {
          title: "🎯 Milestone Reached!",
          subtitle: data.name || "New Milestone",
          description: data.description || "Amazing progress!",
          icon: "🌟",
          points: data.points,
          gradient: "from-emerald-500 via-teal-500 to-cyan-500",
          glow: "shadow-emerald-500/50",
        };
      default:
        return {
          title: "🎊 Congratulations!",
          subtitle: "Great Job!",
          description: "You're making excellent progress!",
          icon: "🎉",
          gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
          glow: "shadow-violet-500/50",
        };
    }
  };

  const getRarityGradient = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "from-amber-400 via-orange-500 to-red-600";
      case "epic":
        return "from-purple-500 via-pink-500 to-rose-500";
      case "rare":
        return "from-blue-500 via-cyan-500 to-teal-500";
      default:
        return "from-gray-400 via-slate-500 to-gray-600";
    }
  };

  const getRarityGlow = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "shadow-amber-500/60";
      case "epic":
        return "shadow-purple-500/60";
      case "rare":
        return "shadow-blue-500/60";
      default:
        return "shadow-gray-500/40";
    }
  };

  const getRarityLabel = (rarity) => {
    const labels = {
      legendary: { text: "LEGENDARY", color: "text-amber-400", bg: "bg-amber-500/20" },
      epic: { text: "EPIC", color: "text-purple-400", bg: "bg-purple-500/20" },
      rare: { text: "RARE", color: "text-blue-400", bg: "bg-blue-500/20" },
      common: { text: "COMMON", color: "text-gray-400", bg: "bg-gray-500/20" },
    };
    return labels[rarity] || labels.common;
  };

  const config = getModalConfig();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          onClick={type !== "xpGain" ? onClose : undefined}
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(12px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            className="absolute inset-0 bg-black/60"
          />

          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  x: `${particle.x}vw`,
                  y: "110vh",
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  y: "-10vh",
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1, 0.5],
                  rotate: [0, 360, 720],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: "easeOut",
                }}
                style={{
                  position: "absolute",
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                }}
              />
            ))}
          </div>

          {/* Radial glow effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2, opacity: 0.3 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute w-96 h-96 bg-gradient-to-r ${config.gradient} rounded-full blur-3xl`}
          />

          {/* Main modal content */}
          <motion.div
            initial={{ scale: 0, y: 50, rotateX: 45 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0, y: 50, rotateX: -45 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className={`relative max-w-lg w-full bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl ${config.glow}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient bar */}
            <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />

            {/* Animated border glow */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-20`}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Close button */}
            {type !== "xpGain" && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Icon with animation */}
              <AnimatePresence>
                {showContent && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 200 }}
                    className="relative inline-block mb-6"
                  >
                    {/* Glow ring */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-full blur-xl`}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Icon container */}
                    <div className={`relative w-32 h-32 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center shadow-2xl`}>
                      <span className="text-6xl filter drop-shadow-lg">{config.icon}</span>
                    </div>

                    {/* Sparkles around icon */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 6)}%`,
                          left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 6)}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      >
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rarity badge for achievements */}
              {type === "achievement" && data.rarity && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4"
                >
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getRarityLabel(data.rarity).bg} ${getRarityLabel(data.rarity).color}`}>
                    ✨ {getRarityLabel(data.rarity).text}
                  </span>
                </motion.div>
              )}

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-black text-white mb-2"
              >
                {config.title}
              </motion.h2>

              {/* Subtitle */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-3`}
              >
                {config.subtitle}
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 text-lg mb-6 max-w-sm mx-auto"
              >
                {config.description}
              </motion.p>

              {/* Points/XP reward */}
              {config.points && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", damping: 10 }}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-2xl mb-6"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                  <div className="text-left">
                    <p className="text-yellow-400 text-xs font-medium uppercase tracking-wide">Reward</p>
                    <p className="text-2xl font-black text-white">+{config.points} XP</p>
                  </div>
                </motion.div>
              )}

              {/* Action button */}
              {type !== "xpGain" && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className={`px-8 py-4 bg-gradient-to-r ${config.gradient} text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <span className="flex items-center gap-2">
                    <PartyPopper className="w-5 h-5" />
                    Awesome!
                  </span>
                </motion.button>
              )}
            </div>

            {/* Bottom decoration */}
            <div className="h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationModal;
