import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAvatar } from "../../context/AvatarContext";
import { useSound } from "../../hooks/useSound";

/**
 * LearningAvatar - AI-Generated Personalized Learning Avatar
 * 
 * Features:
 * - Customizable appearance (skin, hair, eyes, accessories, outfits)
 * - Emotional reactions during quizzes
 * - Evolution based on performance
 * - Voice-cloned explanations
 */
const LearningAvatar = ({
  size = "medium",
  showName = true,
  showLevel = true,
  interactive = true,
  className = "",
  onReactionComplete,
}) => {
  const { avatar, currentReaction, emotionalState, isAvatarEnabled } = useAvatar();
  const { playSound } = useSound();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState("idle");
  const [showMessage, setShowMessage] = useState(null);
  const avatarRef = useRef(null);

  // Size configurations
  const sizeConfig = {
    small: { width: 60, height: 60, fontSize: "text-xs" },
    medium: { width: 120, height: 120, fontSize: "text-sm" },
    large: { width: 200, height: 200, fontSize: "text-base" },
    xl: { width: 280, height: 280, fontSize: "text-lg" },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // Handle reactions
  useEffect(() => {
    if (currentReaction) {
      setIsAnimating(true);
      setCurrentAnimation(currentReaction.animation);
      
      if (currentReaction.message) {
        setShowMessage(currentReaction.message);
      }
      
      // Play sound effect
      if (currentReaction.soundEffect) {
        playSound(currentReaction.soundEffect);
      }
      
      // Reset after animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setCurrentAnimation("idle");
        setShowMessage(null);
        onReactionComplete?.();
      }, currentReaction.duration || 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentReaction, playSound, onReactionComplete]);

  if (!isAvatarEnabled || !avatar) {
    return null;
  }

  const { customization, evolution } = avatar;

  // Get animation variants
  const getAnimationVariants = () => {
    switch (currentAnimation) {
      case "bounce":
        return {
          animate: {
            y: [0, -10, 0],
            transition: { duration: 0.5, repeat: 3 },
          },
        };
      case "dance":
        return {
          animate: {
            rotate: [-5, 5, -5, 5, 0],
            y: [0, -5, 0, -5, 0],
            transition: { duration: 0.8, repeat: 2 },
          },
        };
      case "jump":
        return {
          animate: {
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
            transition: { duration: 0.6, repeat: 2 },
          },
        };
      case "nod":
        return {
          animate: {
            rotate: [-3, 3, -3, 0],
            transition: { duration: 0.4, repeat: 2 },
          },
        };
      case "thinking":
        return {
          animate: {
            scale: [1, 0.98, 1],
            transition: { duration: 1.5, repeat: Infinity },
          },
        };
      case "celebrate":
        return {
          animate: {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
            transition: { duration: 0.8 },
          },
        };
      case "fireworks":
        return {
          animate: {
            scale: [1, 1.3, 1.1, 1.2, 1],
            rotate: [0, 5, -5, 5, 0],
            transition: { duration: 1.2 },
          },
        };
      default: // idle
        return {
          animate: {
            y: [0, -3, 0],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          },
        };
    }
  };

  // Get expression based on emotional state
  const getExpression = () => {
    const mood = emotionalState?.mood || "neutral";
    
    const expressions = {
      happy: { eyes: "sparkle", mouth: "smile", blush: true },
      excited: { eyes: "wide", mouth: "open_smile", blush: true },
      proud: { eyes: "confident", mouth: "smirk", blush: false },
      encouraging: { eyes: "warm", mouth: "gentle_smile", blush: false },
      focused: { eyes: "focused", mouth: "neutral", blush: false },
      determined: { eyes: "determined", mouth: "set", blush: false },
      curious: { eyes: "questioning", mouth: "slight_open", blush: false },
      neutral: { eyes: "normal", mouth: "neutral", blush: false },
    };
    
    return expressions[mood] || expressions.neutral;
  };

  // Get frame color based on evolution stage
  const getFrameColor = () => {
    const frames = {
      none: "transparent",
      bronze: "#CD7F32",
      silver: "#C0C0C0",
      gold: "#FFD700",
      platinum: "#E5E4E2",
      diamond: "#B9F2FF",
      legendary: "linear-gradient(135deg, #FFD700, #FF6B6B, #9B59B6, #3498DB)",
    };
    return frames[customization?.frame] || frames.none;
  };

  // Get aura effect
  const getAuraEffect = () => {
    const auras = {
      none: null,
      glow: "0 0 20px rgba(255, 255, 255, 0.5)",
      sparkle: "0 0 30px rgba(255, 215, 0, 0.6)",
      fire: "0 0 25px rgba(255, 100, 0, 0.7)",
      ice: "0 0 25px rgba(100, 200, 255, 0.6)",
      electric: "0 0 30px rgba(255, 255, 0, 0.7)",
      rainbow: "0 0 35px rgba(255, 0, 255, 0.5), 0 0 50px rgba(0, 255, 255, 0.3)",
      cosmic: "0 0 40px rgba(150, 100, 255, 0.8), 0 0 60px rgba(100, 50, 200, 0.4)",
    };
    return auras[customization?.aura] || null;
  };

  const expression = getExpression();
  const frameColor = getFrameColor();
  const auraEffect = getAuraEffect();
  const animationVariants = getAnimationVariants();

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Aura Effect */}
      {auraEffect && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: auraEffect,
            width: config.width + 20,
            height: config.height + 20,
            left: -10,
            top: -10,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Avatar Container */}
      <motion.div
        ref={avatarRef}
        className="relative cursor-pointer"
        style={{
          width: config.width,
          height: config.height,
        }}
        variants={animationVariants}
        animate="animate"
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
      >
        {/* Frame */}
        {customization?.frame && customization.frame !== "none" && (
          <div
            className="absolute inset-0 rounded-full border-4"
            style={{
              borderColor: typeof frameColor === "string" && !frameColor.includes("gradient") 
                ? frameColor 
                : undefined,
              background: frameColor.includes("gradient") ? frameColor : undefined,
              padding: frameColor.includes("gradient") ? 2 : 0,
            }}
          />
        )}

        {/* Avatar SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ filter: isAnimating ? "brightness(1.1)" : "brightness(1)" }}
        >
          {/* Background */}
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
            <clipPath id="avatarClip">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
          </defs>

          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="url(#bgGradient)"
          />

          {/* Avatar Body */}
          <g clipPath="url(#avatarClip)">
            {/* Skin */}
            <ellipse
              cx="50"
              cy="45"
              rx="25"
              ry="28"
              fill={getSkinColor(customization?.skinTone)}
            />
            
            {/* Hair */}
            <path
              d={getHairPath(customization?.hairStyle)}
              fill={getHairColor(customization?.hairColor)}
            />
            
            {/* Face */}
            <g>
              {/* Eyes */}
              <g>
                {/* Left Eye */}
                <ellipse
                  cx="40"
                  cy="42"
                  rx={expression.eyes === "wide" ? 5 : 4}
                  ry={expression.eyes === "closed_happy" ? 1 : expression.eyes === "wide" ? 5 : 4}
                  fill="white"
                />
                <circle
                  cx="40"
                  cy="42"
                  r={expression.eyes === "closed_happy" ? 0 : 2}
                  fill={getEyeColor(customization?.eyeColor)}
                />
                {expression.eyes === "sparkle" && (
                  <circle cx="38" cy="40" r="1" fill="white" />
                )}
                
                {/* Right Eye */}
                <ellipse
                  cx="60"
                  cy="42"
                  rx={expression.eyes === "wide" ? 5 : 4}
                  ry={expression.eyes === "closed_happy" ? 1 : expression.eyes === "wide" ? 5 : 4}
                  fill="white"
                />
                <circle
                  cx="60"
                  cy="42"
                  r={expression.eyes === "closed_happy" ? 0 : 2}
                  fill={getEyeColor(customization?.eyeColor)}
                />
                {expression.eyes === "sparkle" && (
                  <circle cx="58" cy="40" r="1" fill="white" />
                )}
              </g>
              
              {/* Mouth */}
              <path
                d={getMouthPath(expression.mouth)}
                fill={expression.mouth.includes("smile") ? "#FF6B6B" : "#D35400"}
                stroke={expression.mouth.includes("smile") ? "#E74C3C" : "none"}
                strokeWidth="0.5"
              />
              
              {/* Blush */}
              {expression.blush && (
                <>
                  <circle cx="32" cy="50" r="4" fill="rgba(255, 150, 150, 0.5)" />
                  <circle cx="68" cy="50" r="4" fill="rgba(255, 150, 150, 0.5)" />
                </>
              )}
            </g>
            
            {/* Glasses */}
            {customization?.glasses && customization.glasses !== "none" && (
              <g stroke="#333" strokeWidth="1.5" fill="none">
                <circle cx="40" cy="42" r="8" />
                <circle cx="60" cy="42" r="8" />
                <path d="M48 42 L52 42" />
              </g>
            )}
            
            {/* Hat */}
            {customization?.hat && customization.hat !== "none" && (
              <g>
                {renderHat(customization.hat)}
              </g>
            )}
          </g>

          {/* Level Badge */}
          {showLevel && (
            <g>
              <circle cx="85" cy="85" r="12" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
              <text
                x="85"
                y="89"
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#333"
              >
                {evolution?.currentLevel || 1}
              </text>
            </g>
          )}
        </svg>

        {/* Particle Effects */}
        <AnimatePresence>
          {isAnimating && currentReaction?.visualEffect && (
            <ParticleEffect type={currentReaction.visualEffect} />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Name */}
      {showName && avatar?.name && (
        <div className={`text-center mt-2 ${config.fontSize} font-medium text-gray-700 dark:text-gray-300`}>
          {avatar.name}
        </div>
      )}

      {/* Message Bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-lg max-w-xs text-center"
          >
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {showMessage}
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper functions for avatar rendering
function getSkinColor(skinTone) {
  const colors = {
    light: "#FFDFC4",
    fair: "#F0D5BE",
    medium: "#D4A574",
    tan: "#C68642",
    brown: "#8D5524",
    dark: "#5C3317",
  };
  return colors[skinTone] || colors.medium;
}

function getHairColor(hairColor) {
  const colors = {
    black: "#1a1a1a",
    brown: "#4a3728",
    blonde: "#d4a76a",
    red: "#922724",
    gray: "#808080",
    white: "#f0f0f0",
    blue: "#3498db",
    purple: "#9b59b6",
    green: "#27ae60",
    pink: "#e91e63",
  };
  return colors[hairColor] || colors.black;
}

function getEyeColor(eyeColor) {
  const colors = {
    brown: "#4a3728",
    blue: "#3498db",
    green: "#27ae60",
    hazel: "#8B7355",
    gray: "#708090",
    amber: "#FFBF00",
  };
  return colors[eyeColor] || colors.brown;
}

function getHairPath(hairStyle) {
  const paths = {
    short: "M25 35 Q30 15 50 10 Q70 15 75 35 Q65 25 50 22 Q35 25 25 35",
    medium: "M20 40 Q25 10 50 5 Q75 10 80 40 Q70 20 50 15 Q30 20 20 40",
    long: "M15 60 Q20 10 50 5 Q80 10 85 60 Q75 30 50 20 Q25 30 15 60",
    curly: "M20 45 Q15 20 35 10 Q50 5 65 10 Q85 20 80 45 Q75 25 50 18 Q25 25 20 45 M25 35 Q30 30 35 35 Q40 30 45 35 Q50 30 55 35 Q60 30 65 35 Q70 30 75 35",
    wavy: "M20 45 Q25 15 50 8 Q75 15 80 45 Q70 28 50 20 Q30 28 20 45 M25 38 Q40 32 50 35 Q60 32 75 38",
    bald: "",
    ponytail: "M25 35 Q30 15 50 10 Q70 15 75 35 Q65 25 50 22 Q35 25 25 35 M65 30 Q80 35 85 55 Q82 65 75 70",
    bun: "M25 35 Q30 15 50 10 Q70 15 75 35 Q65 25 50 22 Q35 25 25 35 M40 8 A15 12 0 1 1 60 8 A15 12 0 1 1 40 8",
    afro: "M10 55 Q5 30 20 15 Q35 0 50 0 Q65 0 80 15 Q95 30 90 55 Q85 35 50 25 Q15 35 10 55",
    braids: "M25 35 Q30 15 50 10 Q70 15 75 35 Q65 25 50 22 Q35 25 25 35 M30 35 L25 65 M70 35 L75 65",
  };
  return paths[hairStyle] || paths.short;
}

function getMouthPath(mouthType) {
  const paths = {
    neutral: "M42 55 Q50 57 58 55",
    smile: "M40 53 Q50 60 60 53",
    open_smile: "M40 53 Q50 62 60 53 Q50 58 40 53",
    smirk: "M42 55 Q50 56 60 52",
    gentle_smile: "M42 54 Q50 58 58 54",
    slight_open: "M44 54 Q50 57 56 54 Q50 55 44 54",
    set: "M42 55 L58 55",
    pout: "M44 56 Q50 54 56 56",
  };
  return paths[mouthType] || paths.neutral;
}

function renderHat(hatType) {
  switch (hatType) {
    case "cap":
      return (
        <>
          <ellipse cx="50" cy="18" rx="25" ry="8" fill="#3498db" />
          <rect x="25" y="10" width="50" height="10" rx="5" fill="#3498db" />
          <rect x="50" y="15" width="25" height="5" rx="2" fill="#2980b9" />
        </>
      );
    case "beanie":
      return (
        <>
          <ellipse cx="50" cy="15" rx="22" ry="12" fill="#e74c3c" />
          <circle cx="50" cy="5" r="4" fill="#e74c3c" />
        </>
      );
    case "graduation":
      return (
        <>
          <rect x="30" y="10" width="40" height="5" fill="#333" />
          <polygon points="50,0 25,15 75,15" fill="#333" />
          <circle cx="65" cy="15" r="2" fill="#FFD700" />
          <path d="M65 15 L70 25" stroke="#FFD700" strokeWidth="1" />
        </>
      );
    case "crown":
      return (
        <path
          d="M25 20 L30 8 L40 15 L50 5 L60 15 L70 8 L75 20 L25 20"
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth="1"
        />
      );
    case "wizard":
      return (
        <polygon
          points="50,0 30,25 70,25"
          fill="#9b59b6"
          stroke="#7d3c98"
          strokeWidth="1"
        />
      );
    case "headphones":
      return (
        <>
          <path d="M25 40 Q25 15 50 15 Q75 15 75 40" stroke="#333" strokeWidth="4" fill="none" />
          <ellipse cx="25" cy="42" rx="6" ry="8" fill="#333" />
          <ellipse cx="75" cy="42" rx="6" ry="8" fill="#333" />
        </>
      );
    case "halo":
      return (
        <ellipse
          cx="50"
          cy="5"
          rx="18"
          ry="5"
          fill="none"
          stroke="#FFD700"
          strokeWidth="3"
          opacity="0.8"
        />
      );
    default:
      return null;
  }
}

// Particle Effect Component
const ParticleEffect = ({ type }) => {
  const particles = Array.from({ length: type === "confetti" ? 20 : 10 }, (_, i) => i);
  
  const getParticleStyle = (index) => {
    switch (type) {
      case "sparkle":
        return {
          background: "radial-gradient(circle, #FFD700 0%, transparent 70%)",
          width: 8,
          height: 8,
        };
      case "confetti":
        const colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181"];
        return {
          background: colors[index % colors.length],
          width: 6,
          height: 10,
          borderRadius: 2,
        };
      case "glow":
        return {
          background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
          width: 20,
          height: 20,
        };
      case "fire":
        return {
          background: `radial-gradient(circle, ${index % 2 === 0 ? "#FF6B35" : "#FFC300"} 0%, transparent 70%)`,
          width: 10,
          height: 15,
        };
      default:
        return {
          background: "#FFD700",
          width: 6,
          height: 6,
          borderRadius: "50%",
        };
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            ...getParticleStyle(i),
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            y: type === "confetti" ? [0, 50] : [-20, -40],
            x: type === "confetti" ? [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50] : 0,
            rotate: type === "confetti" ? [0, 360] : 0,
          }}
          transition={{
            duration: type === "confetti" ? 1.5 : 1,
            delay: i * 0.05,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export default LearningAvatar;
