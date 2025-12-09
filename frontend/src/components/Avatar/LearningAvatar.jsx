import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAvatar } from "../../context/AvatarContext";
import { useSound } from "../../hooks/useSound";

/**
 * LearningAvatar - Customizable SVG avatar
 */
const LearningAvatar = ({
  size = "medium",
  showName = true,
  showLevel = true,
  interactive = true,
  className = "",
  onReactionComplete,
  customConfig = null, // Allow passing custom configuration for preview
}) => {
  const { avatar, currentReaction, isAvatarEnabled } = useAvatar();
  const { playSound } = useSound();
  const [showMessage, setShowMessage] = useState(null);

  // Size mappings
  const sizeMap = {
    small: 80,
    medium: 150,
    large: 220,
    xl: 300,
  };

  const avatarSize = sizeMap[size] || sizeMap.medium;

  // Handle reactions
  useEffect(() => {
    if (currentReaction) {
      if (currentReaction.message) {
        setShowMessage(currentReaction.message);
      }

      if (currentReaction.soundEffect) {
        playSound(currentReaction.soundEffect);
      }

      const timer = setTimeout(() => {
        setShowMessage(null);
        onReactionComplete?.();
      }, currentReaction.duration || 2000);

      return () => clearTimeout(timer);
    }
  }, [currentReaction, playSound, onReactionComplete]);

  // Allow preview mode even without avatar enabled
  const shouldRender = (isAvatarEnabled && avatar) || customConfig;

  if (!shouldRender) {
    return null;
  }

  // Get avatar customization or use defaults
  const customization = customConfig || avatar?.customization || {};
  const skinTone = customization.skinTone || "#F5D6C6";
  const hairColor = customization.hairColor || "#4A3728";
  const hairStyle = customization.hairStyle || "short";
  const eyeColor = customization.eyeColor || "#4A3728";
  const shirtColor = customization.shirtColor || "#6366F1";

  // Achievement-based unlockables
  const achievements = avatar?.achievements || [];
  const totalQuizzes = avatar?.stats?.totalQuizzesTaken || 0;
  const currentLevel = avatar?.evolution?.currentLevel || 1;

  // Unlockable accessories - use custom config if provided, otherwise check achievements
  const hasGlasses =
    customization.glasses !== undefined
      ? customization.glasses
      : achievements.includes("first_quiz") || totalQuizzes >= 1;
  const hasHat =
    customization.hat !== undefined
      ? customization.hat
      : currentLevel >= 5 && !customization.crown;
  const hasCrown =
    customization.crown !== undefined
      ? customization.crown
      : currentLevel >= 10;
  const hasNecklace =
    customization.necklace !== undefined
      ? customization.necklace
      : achievements.includes("streak_master") || totalQuizzes >= 20;
  const hasEarrings =
    customization.earrings !== undefined
      ? customization.earrings
      : achievements.includes("quiz_master") || totalQuizzes >= 10;
  const glassesStyle = customization.glassesStyle || "round";
  const hatStyle = customization.hatStyle || "cap";

  // Avatar expressions based on reactions
  const getExpression = () => {
    if (
      currentReaction?.type === "happy" ||
      currentReaction?.type === "excited"
    ) {
      return "happy";
    }
    if (
      currentReaction?.type === "thinking" ||
      currentReaction?.type === "confused"
    ) {
      return "thinking";
    }
    return "neutral";
  };

  const expression = getExpression();

  // More realistic hair paths
  const getHairPath = () => {
    switch (hairStyle) {
      case "short":
        return {
          main: "M25 28 Q20 18, 25 12 Q30 8, 35 10 Q40 6, 45 8 Q50 5, 55 8 Q60 6, 65 10 Q70 8, 75 12 Q80 18, 75 28 Z",
          bangs: "M35 20 Q40 18, 45 20 M50 18 Q55 17, 60 19",
        };
      case "medium":
        return {
          main: "M24 28 Q19 18, 24 12 Q30 8, 40 10 Q50 6, 60 10 Q70 8, 76 12 Q81 18, 76 28 L76 40 Q72 43, 50 42 Q28 43, 24 40 Z",
          bangs: "M32 22 Q38 20, 44 22 M48 20 Q54 19, 60 21",
        };
      case "long":
        return {
          main: "M22 28 Q18 18, 22 12 Q30 8, 40 10 Q50 5, 60 10 Q70 8, 78 12 Q82 18, 78 28 L78 45 Q75 52, 70 55 L30 55 Q25 52, 22 45 Z",
          bangs:
            "M30 22 Q35 20, 40 22 M45 20 Q50 19, 55 21 M60 22 Q65 21, 70 23",
        };
      case "curly":
        return {
          main: "M25 28 Q20 22, 23 18 C23 15, 28 13, 32 15 C35 12, 40 12, 43 15 C47 12, 52 12, 55 15 C58 12, 63 12, 67 15 C70 13, 75 15, 77 18 Q80 22, 75 28 Z",
          curls:
            "M28 16 Q30 14, 32 16 M38 14 Q40 12, 42 14 M48 13 Q50 11, 52 13 M58 13 Q60 11, 62 13 M68 15 Q70 13, 72 15",
        };
      case "bald":
        return { main: "", bangs: "" };
      case "wavy":
        return {
          main: "M24 28 Q19 19, 24 13 Q32 8, 42 11 Q50 6, 58 11 Q68 8, 76 13 Q81 19, 76 28 L76 42 Q72 48, 50 45 Q28 48, 24 42 Z",
          waves:
            "M30 25 Q35 23, 40 25 M45 24 Q50 22, 55 24 M60 25 Q65 23, 70 25",
        };
      case "ponytail":
        return {
          main: "M25 28 Q20 18, 25 12 Q30 8, 35 10 Q40 6, 45 8 Q50 5, 55 8 Q60 6, 65 10 Q70 8, 75 12 Q80 18, 75 28 L72 35 Q70 40, 68 45 L68 55",
          bangs: "M35 20 Q40 18, 45 20 M50 18 Q55 17, 60 19",
          tail: "M68 40 Q66 50, 68 60",
        };
      case "bun":
        return {
          main: "M25 28 Q20 18, 25 12 Q30 8, 35 10 Q40 6, 45 8 Q50 5, 55 8 Q60 6, 65 10 Q70 8, 75 12 Q80 18, 75 28 Z",
          bangs: "M35 20 Q40 18, 45 20 M50 18 Q55 17, 60 19",
          bun: "M45 15 Q50 10, 55 15 Q58 18, 55 20 Q50 22, 45 20 Q42 18, 45 15",
        };
      case "afro":
        return {
          main: "M25 35 Q18 25, 20 18 Q22 12, 28 10 Q35 8, 40 12 Q45 8, 50 8 Q55 8, 60 12 Q65 8, 72 10 Q78 12, 80 18 Q82 25, 75 35 Q70 40, 50 38 Q30 40, 25 35 Z",
          texture:
            "M28 20 Q30 18, 32 20 M35 18 Q37 16, 39 18 M42 17 Q44 15, 46 17 M48 16 Q50 14, 52 16 M54 17 Q56 15, 58 17 M61 18 Q63 16, 65 18 M68 20 Q70 18, 72 20",
        };
      case "braids":
        return {
          main: "M25 28 Q20 18, 25 12 Q30 8, 35 10 Q40 6, 45 8 Q50 5, 55 8 Q60 6, 65 10 Q70 8, 75 12 Q80 18, 75 28 Z",
          leftBraid: "M30 30 L28 45 L26 60",
          rightBraid: "M70 30 L72 45 L74 60",
          bangs: "M40 20 Q45 18, 50 20 M52 18 Q57 17, 62 19",
        };
      default:
        return {
          main: "M25 28 Q20 18, 25 12 Q30 8, 35 10 Q40 6, 45 8 Q50 5, 55 8 Q60 6, 65 10 Q70 8, 75 12 Q80 18, 75 28 Z",
          bangs: "M35 20 Q40 18, 45 20 M50 18 Q55 17, 60 19",
        };
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar SVG */}
      <motion.div
        className="relative"
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          width={avatarSize}
          height={avatarSize}
          viewBox="0 0 100 100"
          className="drop-shadow-xl"
        >
          {/* Background circle */}
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background */}
          <circle cx="50" cy="50" r="48" fill="url(#bgGradient)" />

          {/* Neck */}
          <ellipse
            cx="50"
            cy="72"
            rx="8"
            ry="10"
            fill={skinTone}
            opacity="0.9"
          />

          {/* Face - more detailed */}
          <ellipse cx="50" cy="48" rx="22" ry="26" fill={skinTone} />

          {/* Face shadow for depth */}
          <ellipse
            cx="50"
            cy="50"
            rx="22"
            ry="24"
            fill={skinTone}
            opacity="0.3"
          />

          {/* Cheeks */}
          {expression === "happy" && (
            <>
              <circle cx="35" cy="52" r="3.5" fill="#FF9AA2" opacity="0.4" />
              <circle cx="65" cy="52" r="3.5" fill="#FF9AA2" opacity="0.4" />
            </>
          )}

          {/* Hair back layer */}
          {hairStyle !== "bald" && (
            <path
              d={getHairPath().main}
              fill={hairColor}
              opacity="0.9"
              filter="url(#shadow)"
            />
          )}

          {/* Ears */}
          <ellipse
            cx="28"
            cy="48"
            rx="3"
            ry="5"
            fill={skinTone}
            opacity="0.95"
          />
          <ellipse
            cx="72"
            cy="48"
            rx="3"
            ry="5"
            fill={skinTone}
            opacity="0.95"
          />
          <ellipse
            cx="28"
            cy="48"
            rx="1.5"
            ry="3"
            fill={skinTone}
            style={{ filter: "brightness(0.9)" }}
          />
          <ellipse
            cx="72"
            cy="48"
            rx="1.5"
            ry="3"
            fill={skinTone}
            style={{ filter: "brightness(0.9)" }}
          />

          {/* Earrings (unlockable) */}
          {hasEarrings && (
            <>
              <circle
                cx="28"
                cy="52"
                r="2"
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth="0.5"
              />
              <circle
                cx="72"
                cy="52"
                r="2"
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth="0.5"
              />
            </>
          )}

          {/* Eyebrows */}
          <path
            d={
              expression === "thinking"
                ? "M35 40 Q38 39, 41 40"
                : "M35 41 Q38 40, 41 41"
            }
            stroke={hairColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={
              expression === "thinking"
                ? "M59 40 Q62 39, 65 40"
                : "M59 41 Q62 40, 65 41"
            }
            stroke={hairColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Eyes - more realistic */}
          {expression === "happy" ? (
            <>
              {/* Happy eyes (closed/smiling) */}
              <path
                d="M33 45 Q38 48, 43 45"
                stroke={eyeColor}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M57 45 Q62 48, 67 45"
                stroke={eyeColor}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </>
          ) : expression === "thinking" ? (
            <>
              {/* Thinking eyes */}
              <ellipse cx="38" cy="46" rx="4" ry="5" fill="white" />
              <ellipse cx="38" cy="46" rx="2.5" ry="3" fill={eyeColor} />
              <circle cx="37" cy="45" r="0.8" fill="white" opacity="0.9" />

              <ellipse cx="62" cy="46" rx="4" ry="5" fill="white" />
              <ellipse cx="62" cy="46" rx="2.5" ry="3" fill={eyeColor} />
              <circle cx="61" cy="45" r="0.8" fill="white" opacity="0.9" />
            </>
          ) : (
            <>
              {/* Normal eyes with detailed iris */}
              <ellipse cx="38" cy="46" rx="5" ry="6" fill="white" />
              <ellipse cx="38" cy="46" rx="3" ry="4" fill={eyeColor} />
              <ellipse cx="38" cy="46" rx="1.5" ry="2" fill="#000000" />
              <circle cx="37.5" cy="45" r="1" fill="white" opacity="0.9" />
              <ellipse
                cx="38"
                cy="47.5"
                rx="2"
                ry="1"
                fill={eyeColor}
                opacity="0.3"
              />

              <ellipse cx="62" cy="46" rx="5" ry="6" fill="white" />
              <ellipse cx="62" cy="46" rx="3" ry="4" fill={eyeColor} />
              <ellipse cx="62" cy="46" rx="1.5" ry="2" fill="#000000" />
              <circle cx="61.5" cy="45" r="1" fill="white" opacity="0.9" />
              <ellipse
                cx="62"
                cy="47.5"
                rx="2"
                ry="1"
                fill={eyeColor}
                opacity="0.3"
              />

              {/* Eyelashes */}
              <path
                d="M33 44 L32 42 M35 43 L34 41 M37 43 L37 41"
                stroke={hairColor}
                strokeWidth="0.5"
                opacity="0.6"
              />
              <path
                d="M67 44 L68 42 M65 43 L66 41 M63 43 L63 41"
                stroke={hairColor}
                strokeWidth="0.5"
                opacity="0.6"
              />
            </>
          )}

          {/* Nose - more realistic */}
          <path
            d="M50 48 L48 54"
            stroke={skinTone}
            strokeWidth="1.5"
            fill="none"
            style={{ filter: "brightness(0.85)" }}
            strokeLinecap="round"
          />
          <path
            d="M48 54 Q48 56, 46 55.5"
            stroke={skinTone}
            strokeWidth="1"
            fill="none"
            style={{ filter: "brightness(0.85)" }}
            strokeLinecap="round"
          />
          <path
            d="M52 54 Q52 56, 54 55.5"
            stroke={skinTone}
            strokeWidth="1"
            fill="none"
            style={{ filter: "brightness(0.85)" }}
            strokeLinecap="round"
          />
          {/* Nostrils */}
          <ellipse
            cx="47"
            cy="55"
            rx="1.2"
            ry="0.8"
            fill={skinTone}
            style={{ filter: "brightness(0.7)" }}
          />
          <ellipse
            cx="53"
            cy="55"
            rx="1.2"
            ry="0.8"
            fill={skinTone}
            style={{ filter: "brightness(0.7)" }}
          />

          {/* Mouth - more expressive */}
          {expression === "happy" ? (
            <>
              <path
                d="M40 60 Q50 68, 60 60"
                stroke="#DC143C"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path d="M42 61 Q50 67, 58 61" fill="#FF6B9D" opacity="0.6" />
              {/* Teeth */}
              <rect
                x="45"
                y="62"
                width="10"
                height="3"
                fill="white"
                opacity="0.9"
                rx="1"
              />
            </>
          ) : expression === "thinking" ? (
            <path
              d="M43 62 L57 62"
              stroke="#DC143C"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path
                d="M42 61 Q50 64, 58 61"
                stroke="#DC143C"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path d="M44 61.5 Q50 63, 56 61.5" fill="#FF6B9D" opacity="0.4" />
            </>
          )}

          {/* Hair front layer / bangs */}
          {hairStyle !== "bald" && getHairPath().bangs && (
            <path
              d={getHairPath().bangs}
              stroke={hairColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {hairStyle === "curly" && getHairPath().curls && (
            <path
              d={getHairPath().curls}
              stroke={hairColor}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {hairStyle === "wavy" && getHairPath().waves && (
            <path
              d={getHairPath().waves}
              stroke={hairColor}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
            />
          )}
          {hairStyle === "ponytail" && getHairPath().tail && (
            <path
              d={getHairPath().tail}
              stroke={hairColor}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {hairStyle === "bun" && getHairPath().bun && (
            <path
              d={getHairPath().bun}
              fill={hairColor}
              stroke={hairColor}
              strokeWidth="1"
            />
          )}
          {hairStyle === "afro" && getHairPath().texture && (
            <path
              d={getHairPath().texture}
              stroke={hairColor}
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
              opacity="0.6"
            />
          )}
          {hairStyle === "braids" && (
            <>
              {getHairPath().leftBraid && (
                <path
                  d={getHairPath().leftBraid}
                  stroke={hairColor}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              {getHairPath().rightBraid && (
                <path
                  d={getHairPath().rightBraid}
                  stroke={hairColor}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
            </>
          )}

          {/* Glasses (unlockable) */}
          {hasGlasses && (
            <g stroke="#333333" strokeWidth="1.5" fill="none">
              {glassesStyle === "round" ? (
                <>
                  <circle
                    cx="38"
                    cy="46"
                    r="7"
                    opacity="0.3"
                    fill="rgba(200,200,255,0.1)"
                  />
                  <circle
                    cx="62"
                    cy="46"
                    r="7"
                    opacity="0.3"
                    fill="rgba(200,200,255,0.1)"
                  />
                  <path d="M45 46 L55 46" />
                  <path d="M31 46 L28 44" />
                  <path d="M69 46 L72 44" />
                </>
              ) : (
                <>
                  <rect
                    x="31"
                    y="42"
                    width="14"
                    height="8"
                    rx="2"
                    opacity="0.3"
                    fill="rgba(200,200,255,0.1)"
                  />
                  <rect
                    x="55"
                    y="42"
                    width="14"
                    height="8"
                    rx="2"
                    opacity="0.3"
                    fill="rgba(200,200,255,0.1)"
                  />
                  <path d="M45 46 L55 46" />
                  <path d="M31 46 L28 44" />
                  <path d="M69 46 L72 44" />
                </>
              )}
            </g>
          )}

          {/* Body/Shirt */}
          <path
            d="M30 72 Q35 75, 50 78 Q65 75, 70 72 L70 95 Q65 98, 50 95 Q35 98, 30 95 Z"
            fill={shirtColor}
            filter="url(#shadow)"
          />

          {/* Shirt collar */}
          <path
            d="M35 72 L40 68 L45 72"
            stroke={shirtColor}
            strokeWidth="2"
            fill="none"
            style={{ filter: "brightness(0.8)" }}
            strokeLinecap="round"
          />
          <path
            d="M65 72 L60 68 L55 72"
            stroke={shirtColor}
            strokeWidth="2"
            fill="none"
            style={{ filter: "brightness(0.8)" }}
            strokeLinecap="round"
          />

          {/* Shirt buttons */}
          <circle cx="50" cy="80" r="1.5" fill="white" opacity="0.8" />
          <circle cx="50" cy="86" r="1.5" fill="white" opacity="0.8" />

          {/* Necklace (unlockable) */}
          {hasNecklace && (
            <>
              <path
                d="M40 70 Q50 73, 60 70"
                stroke="#FFD700"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="50"
                cy="74"
                r="3"
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth="0.8"
              />
              <circle cx="50" cy="74" r="1.5" fill="#FF6347" />
            </>
          )}

          {/* Hat (unlockable) */}
          {hasHat && !hasCrown && (
            <g>
              {hatStyle === "cap" ? (
                <>
                  <ellipse cx="50" cy="25" rx="25" ry="5" fill="#E74C3C" />
                  <path d="M25 25 Q25 15, 50 12 Q75 15, 75 25" fill="#E74C3C" />
                  <ellipse cx="50" cy="12" rx="8" ry="3" fill="#C0392B" />
                  <path d="M35 25 L15 28 L15 30 L35 27 Z" fill="#E74C3C" />
                </>
              ) : (
                <>
                  <rect
                    x="35"
                    y="18"
                    width="30"
                    height="8"
                    fill="#34495E"
                    rx="2"
                  />
                  <path d="M30 26 L70 26 L68 28 L32 28 Z" fill="#2C3E50" />
                </>
              )}
            </g>
          )}

          {/* Crown (unlockable at level 10) */}
          {hasCrown && (
            <g>
              <path
                d="M30 22 L35 12 L40 20 L50 10 L60 20 L65 12 L70 22 L68 26 L32 26 Z"
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth="1"
              />
              <circle cx="35" cy="12" r="2" fill="#FF6347" />
              <circle cx="50" cy="10" r="2" fill="#FF6347" />
              <circle cx="65" cy="12" r="2" fill="#FF6347" />
              <path d="M33 24 L67 24" stroke="#FFA500" strokeWidth="1.5" />
            </g>
          )}
        </svg>

        {/* Level Badge */}
        {showLevel && avatar?.evolution?.currentLevel && (
          <motion.div
            className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {avatar.evolution.currentLevel}
          </motion.div>
        )}
      </motion.div>

      {/* Name */}
      {showName && avatar?.name && (
        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {avatar.name}
          </p>
          {avatar?.evolution?.evolutionStage && (
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {avatar.evolution.evolutionStage}
            </p>
          )}
        </motion.div>
      )}

      {/* Reaction Message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg whitespace-nowrap z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {showMessage}
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white dark:border-t-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningAvatar;
