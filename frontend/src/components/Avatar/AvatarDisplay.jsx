import React from 'react';
import { motion } from 'framer-motion';
import { CHARACTERS, MOODS, BACKGROUNDS, ACCESSORIES } from '../../config/avatarConfig';

/**
 * AvatarDisplay Component
 * Renders a 2D SVG avatar with customization
 * Can be used as a small profile picture or large display
 */
const AvatarDisplay = ({ 
  avatar, 
  size = 'md',
  showMood = false,
  showAccessories = true,
  animated = true,
  className = '',
  onClick,
}) => {
  if (!avatar) {
    return (
      <div className={`flex items-center justify-center ${getSizeClasses(size)} ${className}`}>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    );
  }

  const character = CHARACTERS[avatar.baseCharacter] || CHARACTERS.robot;
  const mood = avatar.currentMood || 'happy';
  const customization = avatar.customization || {};
  const background = BACKGROUNDS[customization.background] || BACKGROUNDS['gradient-blue'];

  // Get equipped accessories
  const equippedAccessories = customization.accessories || [];
  const headAccessory = equippedAccessories.find(id => 
    ['graduation-cap', 'wizard-hat', 'crown', 'headphones', 'halo'].includes(id)
  );
  const faceAccessory = equippedAccessories.find(id => 
    ['cool-glasses', 'nerd-glasses', 'party-glasses', 'monocle'].includes(id)
  );
  const badge = equippedAccessories.find(id => 
    id.includes('badge')
  );

  const sizeClasses = getSizeClasses(size);
  const avatarSize = getSizeValue(size);

  const containerVariants = animated ? {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
  } : {};

  return (
    <motion.div
      className={`relative ${sizeClasses} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover={onClick ? "hover" : undefined}
      onClick={onClick}
    >
      {/* Background Circle with Gradient */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{ background: background.gradient }}
      />

      {/* Avatar SVG Container */}
      <svg
        viewBox="0 0 200 200"
        className="relative z-10 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main Character Circle */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill={customization.primaryColor || '#3B82F6'}
          className="transition-all duration-300"
        />

        {/* Character Body */}
        <circle
          cx="100"
          cy="140"
          r="45"
          fill={customization.secondaryColor || '#10B981'}
          className="transition-all duration-300"
        />

        {/* Face - Eyes */}
        <circle
          cx="85"
          cy="90"
          r="8"
          fill={customization.eyeColor || '#1F2937'}
        />
        <circle
          cx="115"
          cy="90"
          r="8"
          fill={customization.eyeColor || '#1F2937'}
        />

        {/* Face - Mouth based on mood */}
        {renderMouth(mood, customization)}

        {/* Hair */}
        {renderHair(customization)}

        {/* Character-specific details */}
        {renderCharacterDetails(character.id, customization)}
      </svg>

      {/* Accessories Overlays */}
      {showAccessories && (
        <>
          {/* Head Accessory */}
          {headAccessory && ACCESSORIES[headAccessory] && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-4xl z-20">
              {ACCESSORIES[headAccessory].emoji}
            </div>
          )}

          {/* Face Accessory */}
          {faceAccessory && ACCESSORIES[faceAccessory] && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl z-20">
              {ACCESSORIES[faceAccessory].emoji}
            </div>
          )}

          {/* Badge */}
          {badge && ACCESSORIES[badge] && (
            <div className="absolute bottom-2 right-2 text-2xl z-20">
              {ACCESSORIES[badge].emoji}
            </div>
          )}
        </>
      )}

      {/* Mood Indicator */}
      {showMood && (
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg z-20">
          <span className="text-xl">{MOODS[mood]}</span>
        </div>
      )}

      {/* Character Emoji Badge */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg z-20 border-2 border-gray-200 dark:border-gray-700">
        <span className="text-2xl">{character.emoji}</span>
      </div>
    </motion.div>
  );
};

// Helper function to get size classes
function getSizeClasses(size) {
  const sizes = {
    xs: 'w-12 h-12',
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
    '2xl': 'w-64 h-64',
  };
  return sizes[size] || sizes.md;
}

// Helper function to get numeric size
function getSizeValue(size) {
  const sizes = {
    xs: 48,
    sm: 64,
    md: 96,
    lg: 128,
    xl: 192,
    '2xl': 256,
  };
  return sizes[size] || sizes.md;
}

// Render mouth based on mood
function renderMouth(mood, customization) {
  const mouthColor = customization.mouthColor || '#DC2626';
  
  switch (mood) {
    case 'happy':
    case 'celebrating':
      return (
        <path
          d="M 85 110 Q 100 120 115 110"
          stroke={mouthColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'excited':
      return (
        <>
          <circle cx="100" cy="115" r="8" fill={mouthColor} />
          <path
            d="M 85 110 Q 100 125 115 110"
            stroke={mouthColor}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case 'thinking':
      return (
        <line
          x1="85"
          y1="110"
          x2="115"
          y2="110"
          stroke={mouthColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    case 'determined':
    case 'confident':
      return (
        <path
          d="M 85 115 L 115 110"
          stroke={mouthColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    case 'tired':
      return (
        <path
          d="M 85 115 Q 100 110 115 115"
          stroke={mouthColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'neutral':
    default:
      return (
        <line
          x1="90"
          y1="110"
          x2="110"
          y2="110"
          stroke={mouthColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
  }
}

// Render hair
function renderHair(customization) {
  const hairColor = customization.hairColor || '#1F2937';
  const hairStyle = customization.hairStyle || 'short';

  switch (hairStyle) {
    case 'short':
      return (
        <path
          d="M 60 70 Q 70 50 100 50 Q 130 50 140 70"
          fill={hairColor}
          stroke={hairColor}
          strokeWidth="2"
        />
      );
    case 'medium':
      return (
        <path
          d="M 55 75 Q 65 40 100 40 Q 135 40 145 75 L 145 90 Q 140 85 135 85 L 65 85 Q 60 85 55 90 Z"
          fill={hairColor}
          stroke={hairColor}
          strokeWidth="2"
        />
      );
    case 'long':
      return (
        <path
          d="M 50 80 Q 60 35 100 35 Q 140 35 150 80 L 150 120 Q 145 115 140 115 L 60 115 Q 55 115 50 120 Z"
          fill={hairColor}
          stroke={hairColor}
          strokeWidth="2"
        />
      );
    case 'spiky':
      return (
        <>
          <path d="M 80 60 L 75 40 L 80 50" fill={hairColor} />
          <path d="M 95 55 L 95 35 L 100 45" fill={hairColor} />
          <path d="M 110 55 L 115 35 L 115 45" fill={hairColor} />
          <path d="M 125 60 L 130 40 L 125 50" fill={hairColor} />
        </>
      );
    case 'curly':
      return (
        <>
          <circle cx="75" cy="60" r="12" fill={hairColor} />
          <circle cx="95" cy="55" r="13" fill={hairColor} />
          <circle cx="115" cy="55" r="13" fill={hairColor} />
          <circle cx="135" cy="60" r="12" fill={hairColor} />
        </>
      );
    case 'bald':
      return null;
    default:
      return null;
  }
}

// Render character-specific details
function renderCharacterDetails(characterId, customization) {
  switch (characterId) {
    case 'robot':
      return (
        <>
          {/* Antenna */}
          <line x1="100" y1="30" x2="100" y2="50" stroke="#6B7280" strokeWidth="2" />
          <circle cx="100" cy="28" r="4" fill="#EF4444" />
        </>
      );
    case 'wizard':
      return (
        <>
          {/* Stars around */}
          <text x="70" y="70" fontSize="12" fill="#FCD34D">✨</text>
          <text x="125" y="75" fontSize="12" fill="#FCD34D">✨</text>
        </>
      );
    case 'ninja':
      return (
        <>
          {/* Mask */}
          <rect x="75" y="85" width="50" height="15" fill="#1F2937" opacity="0.8" rx="2" />
        </>
      );
    default:
      return null;
  }
}

export default AvatarDisplay;
