import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Unlock, Star, Sparkles, ChevronRight, X, Gift, Trophy, Zap } from 'lucide-react';
import Confetti from 'react-confetti';
import { FEATURE_UNLOCKS, TIERS } from '../../config/featureUnlocks';

/**
 * Unlock Notification Component
 * Shows celebration animation when a feature is unlocked
 */
export function UnlockNotification({ 
  featureId, 
  onClose, 
  onNavigate,
  autoClose = true,
  autoCloseDelay = 8000 
}) {
  const [showRewards, setShowRewards] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const feature = FEATURE_UNLOCKS[featureId];

  useEffect(() => {
    if (!feature) return;

    // Handle window resize for confetti
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    // Show rewards after a delay
    setTimeout(() => setShowRewards(true), 1000);
    
    // Stop confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000);

    // Auto close
    if (autoClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timer);
      };
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [feature, autoClose, autoCloseDelay, onClose]);

  if (!feature) return null;

  const tier = TIERS[feature.tier];

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* React Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#fbbf24', '#a855f7', '#22d3ee', '#34d399', '#f472b6', '#f97316']}
        />
      )}
      
      {/* Backdrop with particles */}
      <motion.div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Radial glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r ${tier.color} opacity-20 blur-3xl`} />
      </motion.div>

      {/* Main modal */}
      <motion.div
        className="relative w-full max-w-md"
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 50 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Close button */}
        <motion.button
          className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/70 z-10 transition-colors"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Card */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Animated border */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${tier.color.includes('amber') ? '#fbbf24' : '#a855f7'}, transparent)`,
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          
          <div className="relative bg-slate-900/95 m-0.5 rounded-3xl">
            {/* Header */}
            <div className="relative p-8 text-center overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '32px 32px'
                }} />
              </div>

              {/* Unlock icon with animation */}
              <motion.div
                className="relative inline-block mb-6"
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", damping: 10 }}
              >
                <motion.div
                  className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-2xl`}
                  animate={{
                    boxShadow: [
                      '0 0 30px rgba(251,191,36,0.3)',
                      '0 0 60px rgba(251,191,36,0.5)',
                      '0 0 30px rgba(251,191,36,0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <Unlock className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>

                {/* Sparkle effects */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: Math.cos((i * 60 * Math.PI) / 180) * 60 - 10,
                      y: Math.sin((i * 60 * Math.PI) / 180) * 60 - 10,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.5 + i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-2">
                  🎉 Feature Unlocked!
                </p>
                <h2 className="text-3xl font-black text-white mb-2">{feature.name}</h2>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            </div>

            {/* Feature preview */}
            <div className="px-8 pb-4">
              <motion.div
                className={`p-4 rounded-xl bg-gradient-to-r ${tier.color} bg-opacity-10 border border-white/10`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase bg-gradient-to-r ${tier.color} text-white`}>
                        {tier.icon} {tier.name} Tier
                      </span>
                    </div>
                    <p className="text-white/80 text-sm">
                      {feature.category.charAt(0).toUpperCase() + feature.category.slice(1)} Feature
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Rewards section */}
            <AnimatePresence>
              {showRewards && feature.reward && (
                <motion.div
                  className="px-8 pb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-pink-400" />
                    Rewards Earned
                  </h3>
                  
                  <div className="flex flex-wrap gap-3">
                    {feature.reward.xpBonus && (
                      <motion.div
                        className="flex-1 min-w-[120px] p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.3 }}
                      >
                        <Zap className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                        <p className="text-amber-300 font-bold text-lg">+{feature.reward.xpBonus}</p>
                        <p className="text-amber-400/70 text-xs">XP Bonus</p>
                      </motion.div>
                    )}
                    
                    {feature.reward.badge && (
                      <motion.div
                        className="flex-1 min-w-[120px] p-3 bg-violet-500/20 border border-violet-500/30 rounded-xl text-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.4 }}
                      >
                        <Trophy className="w-6 h-6 text-violet-400 mx-auto mb-1" />
                        <p className="text-violet-300 font-bold text-sm">{feature.reward.badge}</p>
                        <p className="text-violet-400/70 text-xs">New Badge</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="p-6 pt-0 flex gap-3">
              <motion.button
                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Later
              </motion.button>
              
              <motion.button
                className={`flex-1 py-3 px-4 bg-gradient-to-r ${tier.color} rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2`}
                onClick={() => {
                  onNavigate?.(feature);
                  onClose();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Now
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Toast notification for feature unlocks
 * Smaller, less intrusive notification
 */
export function UnlockToast({ featureId, onClose, onClick }) {
  const feature = FEATURE_UNLOCKS[featureId];
  if (!feature) return null;

  const tier = TIERS[feature.tier];

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[9999] max-w-sm"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
    >
      <motion.div
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden cursor-pointer"
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
      >
        {/* Gradient border animation */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${tier.color} opacity-50`}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <div className="relative bg-slate-900/90 m-0.5 rounded-2xl p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <motion.div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}
              animate={{
                rotate: [0, -5, 5, 0],
              }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {feature.icon}
            </motion.div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Unlock className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-xs font-bold uppercase">Unlocked!</span>
              </div>
              <h4 className="text-white font-bold truncate">{feature.name}</h4>
              <p className="text-slate-400 text-sm truncate">{feature.description}</p>
            </div>
            
            {/* Close */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
          
          {/* Rewards preview */}
          {feature.reward?.xpBonus && (
            <motion.div
              className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">+{feature.reward.xpBonus} XP earned!</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/50" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default UnlockNotification;
