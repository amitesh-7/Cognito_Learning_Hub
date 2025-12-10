import React from 'react';
import { motion } from 'framer-motion';
import { useAvatar } from '../../context/AvatarContext';
import AvatarDisplay from './AvatarDisplay';
import { useNavigate } from 'react-router-dom';

/**
 * AvatarProfile Component
 * Shows user's avatar with level and XP info
 * Clickable to navigate to customization page
 */
const AvatarProfile = ({ 
  size = 'md', 
  showInfo = true,
  showLevel = true,
  className = '',
}) => {
  const { avatar, stats, loading, error } = useAvatar();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full ${getSizeClass(size)}`} />
        {showInfo && (
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  // If there's an error or no avatar, show a simple fallback
  if (error || !avatar) {
    return (
      <motion.div
        className={`flex items-center gap-3 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div 
          onClick={() => navigate('/avatar/customize')}
          className={`${getSizeClass(size)} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform shadow-lg`}
        >
          {stats?.level || '?'}
        </div>
        {showInfo && (
          <button
            onClick={() => navigate('/avatar/customize')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Create Avatar
          </button>
        )}
      </motion.div>
    );
  }

  const handleClick = () => {
    navigate('/avatar/customize');
  };

  const level = stats?.level || 1;
  const completionPercentage = stats?.completionPercentage || 0;

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar Display */}
      <div className="relative">
        <AvatarDisplay
          avatar={avatar}
          size={size}
          showMood={true}
          animated={true}
          onClick={handleClick}
          className="ring-2 ring-white dark:ring-gray-800 shadow-lg"
        />
        
        {/* Level Badge */}
        {showLevel && (
          <motion.div
            className="absolute -bottom-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-30 ring-2 ring-white dark:ring-gray-800"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {level}
          </motion.div>
        )}
      </div>

      {/* Info Section */}
      {showInfo && (
        <div className="flex flex-col gap-1">
          {/* Level Info */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Level {level}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {completionPercentage}% Collection
            </span>
          </div>

          {/* Collection Progress Bar */}
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Customize Link */}
          <button
            onClick={handleClick}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors"
          >
            Customize Avatar
          </button>
        </div>
      )}
    </motion.div>
  );
};

function getSizeClass(size) {
  const sizes = {
    xs: 'w-12 h-12',
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };
  return sizes[size] || sizes.md;
}

export default AvatarProfile;
