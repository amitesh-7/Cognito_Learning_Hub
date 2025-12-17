import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Star, Sparkles, TrendingUp, ChevronRight, X } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { 
  FEATURE_UNLOCKS, 
  TIERS, 
  checkFeatureUnlock,
  getUpcomingFeatures 
} from '../config/featureUnlocks';

/**
 * FeatureGate Component
 * Wraps features that require unlocking based on gamification progress
 * Shows lock overlay for locked features with progress and requirements
 */
export function FeatureGate({ 
  featureId, 
  children, 
  fallback = null,
  showLockOverlay = true,
  onLockedClick = null,
}) {
  const { userStats, currentLevel, totalXP } = useGamification();
  const [showModal, setShowModal] = useState(false);

  const feature = FEATURE_UNLOCKS[featureId];
  if (!feature) {
    // Feature not in config, allow access
    return <>{children}</>;
  }

  const status = checkFeatureUnlock(featureId, {
    ...userStats,
    level: currentLevel,
    experience: totalXP,
  });

  if (status.unlocked) {
    return <>{children}</>;
  }

  // Feature is locked
  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showLockOverlay) {
    return null;
  }

  const tier = TIERS[feature.tier];

  return (
    <>
      <div 
        className="relative cursor-pointer group"
        onClick={() => {
          setShowModal(true);
          onLockedClick?.();
        }}
      >
        {/* Locked content with blur overlay */}
        <div className="relative">
          <div className="filter blur-sm opacity-50 pointer-events-none">
            {children}
          </div>
          
          {/* Lock overlay */}
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 backdrop-blur-sm rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg mb-3`}
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 20px rgba(255,255,255,0.1)',
                  '0 0 30px rgba(255,255,255,0.2)',
                  '0 0 20px rgba(255,255,255,0.1)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="w-8 h-8 text-white" />
            </motion.div>
            
            <h3 className="text-white font-bold text-lg mb-1">{feature.name}</h3>
            <p className="text-slate-300 text-sm text-center px-4 mb-3">
              {feature.description}
            </p>
            
            {/* Progress bar */}
            <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
              <motion.div 
                className={`h-full bg-gradient-to-r ${tier.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${status.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            <p className="text-slate-400 text-xs">
              {Math.round(status.progress)}% complete
            </p>
            
            <motion.button
              className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Requirements
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Unlock requirements modal */}
      <AnimatePresence>
        {showModal && (
          <FeatureUnlockModal 
            feature={feature}
            status={status}
            tier={tier}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Feature Unlock Modal
 * Shows detailed unlock requirements and progress
 */
function FeatureUnlockModal({ feature, status, tier, onClose }) {
  const { userStats, currentLevel } = useGamification();
  const upcomingFeatures = getUpcomingFeatures({
    ...userStats,
    level: currentLevel,
  }, 3);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        {/* Header with gradient */}
        <div className={`p-6 bg-gradient-to-br ${tier.color} relative overflow-hidden`}>
          <motion.div
            className="absolute inset-0 bg-white/10"
            animate={{
              background: [
                'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                'linear-gradient(45deg, transparent 100%, rgba(255,255,255,0.1) 150%, transparent 200%)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
                {feature.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold text-white uppercase">
                    {tier.icon} {tier.name}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{feature.name}</h2>
              </div>
            </div>
            <p className="text-white/90">{feature.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Unlock Requirements */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Unlock Requirement
            </h3>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-300">{status.remaining}</span>
                <span className="text-white font-bold">
                  {status.currentValue} / {status.targetValue}
                </span>
              </div>
              
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full bg-gradient-to-r ${tier.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${status.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              <p className="text-right text-sm text-slate-400 mt-2">
                {Math.round(status.progress)}% complete
              </p>
            </div>
          </div>

          {/* Rewards Preview */}
          {feature.reward && (
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Unlock Rewards
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {feature.reward.xpBonus && (
                  <div className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 font-medium">+{feature.reward.xpBonus} XP</span>
                  </div>
                )}
                {feature.reward.badge && (
                  <div className="px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-lg flex items-center gap-2">
                    <Star className="w-4 h-4 text-violet-400" />
                    <span className="text-violet-300 font-medium">Special Badge</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other Upcoming Features */}
          {upcomingFeatures.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Almost Unlocked
              </h3>
              
              <div className="space-y-2">
                {upcomingFeatures.filter(f => f.id !== feature.id).slice(0, 2).map(f => {
                  const fTier = TIERS[f.tier];
                  return (
                    <div 
                      key={f.id}
                      className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30"
                    >
                      <div className="text-xl">{f.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{f.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${fTier.color}`}
                              style={{ width: `${f.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{Math.round(f.progress)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <motion.button
            className={`w-full py-3 px-4 bg-gradient-to-r ${tier.color} rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-shadow`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
          >
            Keep Playing to Unlock! 🎮
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Locked Feature Card
 * A standalone card showing a locked feature
 */
export function LockedFeatureCard({ featureId, className = '' }) {
  const { userStats, currentLevel, totalXP } = useGamification();
  const [showModal, setShowModal] = useState(false);

  const feature = FEATURE_UNLOCKS[featureId];
  if (!feature) return null;

  const status = checkFeatureUnlock(featureId, {
    ...userStats,
    level: currentLevel,
    experience: totalXP,
  });

  if (status.unlocked) return null;

  const tier = TIERS[feature.tier];

  return (
    <>
      <motion.div
        className={`relative cursor-pointer group ${className}`}
        onClick={() => setShowModal(true)}
        whileHover={{ y: -4 }}
      >
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50 overflow-hidden">
          {/* Animated border glow */}
          <motion.div
            className={`absolute inset-0 opacity-30 bg-gradient-to-r ${tier.color}`}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-xl shadow-lg`}>
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-400 uppercase">Locked</span>
                </div>
                <h3 className="text-white font-bold truncate">{feature.name}</h3>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{feature.description}</p>
            
            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">{status.remaining}</span>
                <span className="text-slate-400 font-medium">{Math.round(status.progress)}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full bg-gradient-to-r ${tier.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${status.progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <FeatureUnlockModal 
            feature={feature}
            status={status}
            tier={tier}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Feature Unlock Badge
 * Small badge showing lock status
 */
export function FeatureUnlockBadge({ featureId, className = '' }) {
  const { userStats, currentLevel, totalXP } = useGamification();

  const feature = FEATURE_UNLOCKS[featureId];
  if (!feature) return null;

  const status = checkFeatureUnlock(featureId, {
    ...userStats,
    level: currentLevel,
    experience: totalXP,
  });

  const tier = TIERS[feature.tier];

  if (status.unlocked) {
    return (
      <motion.div
        className={`inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full ${className}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <Unlock className="w-3 h-3 text-green-400" />
        <span className="text-xs font-medium text-green-400">Unlocked</span>
      </motion.div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded-full ${className}`}>
      <Lock className="w-3 h-3 text-slate-400" />
      <span className="text-xs font-medium text-slate-400">{Math.round(status.progress)}%</span>
    </div>
  );
}

/**
 * useFeatureUnlock Hook
 * Check if a feature is unlocked
 */
export function useFeatureUnlock(featureId) {
  const { userStats, currentLevel, totalXP } = useGamification();

  const feature = FEATURE_UNLOCKS[featureId];
  if (!feature) {
    return { 
      unlocked: true, 
      progress: 100, 
      feature: null,
      status: null 
    };
  }

  const status = checkFeatureUnlock(featureId, {
    ...userStats,
    level: currentLevel,
    experience: totalXP,
  });

  return {
    unlocked: status.unlocked,
    progress: status.progress,
    feature,
    status,
    tier: TIERS[feature.tier],
  };
}

export default FeatureGate;
