import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  Star, 
  Sparkles, 
  TrendingUp, 
  Filter,
  ChevronRight,
  Trophy,
  Zap,
  Target,
  Gift
} from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { 
  FEATURE_UNLOCKS, 
  TIERS, 
  CATEGORIES,
  checkFeatureUnlock,
  getFeaturesByCategory 
} from '../../config/featureUnlocks';

/**
 * Feature Progress Dashboard
 * Shows all features, their unlock status, and progress
 * @param {boolean} lightMode - Use light glassmorphism theme (for AchievementDashboard)
 * @param {boolean} compact - Show compact version without stats header
 */
export function FeatureProgressDashboard({ lightMode = false, compact = false }) {
  const { userStats, currentLevel, totalXP, quizzesCompleted, currentStreak } = useGamification();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLocked, setShowLocked] = useState(true);
  const [showUnlocked, setShowUnlocked] = useState(true);

  // Theme classes based on mode
  const theme = lightMode ? {
    container: 'bg-white/50 backdrop-blur-sm border-violet-200/50',
    text: 'text-gray-800',
    textMuted: 'text-gray-600',
    textSubtle: 'text-gray-500',
    statBg: 'bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/50',
    progressBg: 'bg-gray-200',
    cardBg: 'bg-white/70 backdrop-blur-sm border-gray-200/50',
    cardBgUnlocked: 'bg-gradient-to-br from-green-50 to-emerald-50/50 border-green-300/50',
    inputBg: 'bg-white border-gray-300 text-gray-800',
    borderColor: 'border-gray-200/50',
  } : {
    container: 'bg-slate-800/50 border-slate-700/50',
    text: 'text-white',
    textMuted: 'text-slate-300',
    textSubtle: 'text-slate-400',
    statBg: 'bg-slate-800/50',
    progressBg: 'bg-slate-700',
    cardBg: 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50',
    cardBgUnlocked: 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30',
    inputBg: 'bg-slate-800 border-slate-700 text-white',
    borderColor: 'border-slate-700/50',
  };

  // Get stats object for checking
  const statsObject = useMemo(() => ({
    ...userStats,
    level: currentLevel,
    experience: totalXP,
    quizzesCompleted: quizzesCompleted || userStats?.quizzesCompleted || 0,
    currentStreak: currentStreak || userStats?.currentStreak || 0,
    duelsWon: userStats?.duelsWon || 0,
    liveSessionsHosted: userStats?.liveSessionsHosted || 0,
    friendsReferred: userStats?.friendsReferred || 0,
    meetingsHosted: userStats?.meetingsHosted || 0,
  }), [userStats, currentLevel, totalXP, quizzesCompleted, currentStreak]);

  // Filter features
  const filteredFeatures = useMemo(() => {
    let features = Object.values(FEATURE_UNLOCKS);
    
    if (selectedCategory !== 'all') {
      features = getFeaturesByCategory(selectedCategory);
    }

    return features.map(feature => ({
      ...feature,
      status: checkFeatureUnlock(feature.id, statsObject),
    })).filter(feature => {
      if (feature.status.unlocked && !showUnlocked) return false;
      if (!feature.status.unlocked && !showLocked) return false;
      return true;
    }).sort((a, b) => {
      // Sort: Closest to unlock first, then unlocked
      if (a.status.unlocked && !b.status.unlocked) return 1;
      if (!a.status.unlocked && b.status.unlocked) return -1;
      return b.status.progress - a.status.progress;
    });
  }, [selectedCategory, showLocked, showUnlocked, statsObject]);

  // Stats summary
  const summary = useMemo(() => {
    const all = Object.values(FEATURE_UNLOCKS).map(f => ({
      ...f,
      status: checkFeatureUnlock(f.id, statsObject),
    }));
    
    return {
      total: all.length,
      unlocked: all.filter(f => f.status.unlocked).length,
      locked: all.filter(f => !f.status.unlocked).length,
      almostUnlocked: all.filter(f => !f.status.unlocked && f.status.progress >= 80).length,
    };
  }, [statsObject]);

  return (
    <div className="space-y-6">
      {/* Header Stats - hidden in compact mode */}
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={<Trophy className="w-5 h-5" />}
            label="Total Features"
            value={summary.total}
            color="from-violet-500 to-purple-600"
          />
          <StatCard 
            icon={<Unlock className="w-5 h-5" />}
            label="Unlocked"
            value={summary.unlocked}
            color="from-green-500 to-emerald-600"
          />
          <StatCard 
            icon={<Lock className="w-5 h-5" />}
            label="Locked"
            value={summary.locked}
            color="from-slate-500 to-slate-600"
          />
          <StatCard 
            icon={<TrendingUp className="w-5 h-5" />}
            label="Almost There!"
            value={summary.almostUnlocked}
            color="from-amber-500 to-orange-600"
          />
        </div>
      )}

      {/* Your Progress Summary - hidden in compact mode */}
      {!compact && (
        <div className={`rounded-2xl p-6 border ${theme.container}`}>
          <h3 className={`${theme.text} font-bold mb-4 flex items-center gap-2`}>
            <Target className="w-5 h-5 text-cyan-500" />
            Your Progress
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className={`${theme.statBg} rounded-xl p-3`}>
              <p className="text-2xl font-bold text-amber-500">{currentLevel}</p>
              <p className={`text-xs ${theme.textSubtle}`}>Level</p>
            </div>
            <div className={`${theme.statBg} rounded-xl p-3`}>
              <p className="text-2xl font-bold text-violet-500">{totalXP.toLocaleString()}</p>
              <p className={`text-xs ${theme.textSubtle}`}>Total XP</p>
            </div>
            <div className={`${theme.statBg} rounded-xl p-3`}>
              <p className="text-2xl font-bold text-cyan-500">{statsObject.quizzesCompleted}</p>
              <p className={`text-xs ${theme.textSubtle}`}>Quizzes</p>
            </div>
            <div className={`${theme.statBg} rounded-xl p-3`}>
              <p className="text-2xl font-bold text-orange-500">{statsObject.currentStreak}</p>
              <p className={`text-xs ${theme.textSubtle}`}>Day Streak</p>
            </div>
            <div className={`${theme.statBg} rounded-xl p-3`}>
              <p className="text-2xl font-bold text-pink-500">{statsObject.duelsWon}</p>
              <p className={`text-xs ${theme.textSubtle}`}>Duels Won</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex items-center gap-2 ${theme.textSubtle}`}>
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        
        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`${theme.inputBg} border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500`}
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <option key={key} value={key}>{cat.icon} {cat.name}</option>
          ))}
        </select>

        {/* Status toggles */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnlocked}
            onChange={(e) => setShowUnlocked(e.target.checked)}
            className="w-4 h-4 rounded bg-gray-200 border-gray-300 text-green-500 focus:ring-green-500"
          />
          <span className={`text-sm ${theme.textMuted}`}>Unlocked</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLocked}
            onChange={(e) => setShowLocked(e.target.checked)}
            className="w-4 h-4 rounded bg-gray-200 border-gray-300 text-amber-500 focus:ring-amber-500"
          />
          <span className={`text-sm ${theme.textMuted}`}>Locked</span>
        </label>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredFeatures.map((feature) => (
            <FeatureCard 
              key={feature.id} 
              feature={feature} 
              status={feature.status}
              lightMode={lightMode}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredFeatures.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>No features match your filters</p>
        </div>
      )}
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      className={`bg-gradient-to-br ${color} rounded-xl p-4 shadow-lg`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-white/80">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Feature Card Component
 */
function FeatureCard({ feature, status, lightMode = false }) {
  const [expanded, setExpanded] = useState(false);
  const tier = TIERS[feature.tier];
  const category = CATEGORIES[feature.category];

  // Theme classes
  const theme = lightMode ? {
    cardBase: 'bg-white/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg',
    cardUnlocked: 'bg-gradient-to-br from-green-50 to-emerald-50/70 border-green-300/50 hover:shadow-green-100',
    text: 'text-gray-800',
    textMuted: 'text-gray-600',
    textSubtle: 'text-gray-500',
    iconBg: 'bg-gray-100',
    progressBg: 'bg-gray-200',
    expandedBg: 'bg-gray-100/50',
    borderColor: 'border-gray-200/50',
  } : {
    cardBase: 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50',
    cardUnlocked: 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30',
    text: 'text-white',
    textMuted: 'text-slate-300',
    textSubtle: 'text-slate-400',
    iconBg: 'bg-slate-700',
    progressBg: 'bg-slate-700',
    expandedBg: 'bg-slate-800/50',
    borderColor: 'border-slate-700/50',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative overflow-hidden rounded-xl border transition-all cursor-pointer ${
        status.unlocked 
          ? theme.cardUnlocked 
          : theme.cardBase
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Tier badge */}
      <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${tier.color} text-white`}>
        {tier.icon}
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
            status.unlocked 
              ? `bg-gradient-to-br ${tier.color}` 
              : theme.iconBg
          }`}>
            {feature.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {status.unlocked ? (
                <Unlock className="w-4 h-4 text-green-500" />
              ) : (
                <Lock className={`w-4 h-4 ${theme.textSubtle}`} />
              )}
              <span className={`text-xs font-medium ${status.unlocked ? 'text-green-500' : theme.textSubtle}`}>
                {status.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
            <h3 className={`${theme.text} font-bold truncate`}>{feature.name}</h3>
          </div>
        </div>

        {/* Description */}
        <p className={`${theme.textSubtle} text-sm mb-3 line-clamp-2`}>{feature.description}</p>

        {/* Category */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs ${theme.textSubtle}`}>{category?.icon}</span>
          <span className={`text-xs ${theme.textSubtle}`}>{category?.name}</span>
        </div>

        {/* Progress (for locked features) */}
        {!status.unlocked && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className={theme.textSubtle}>{status.remaining}</span>
              <span className={`${theme.textSubtle} font-medium`}>{Math.round(status.progress)}%</span>
            </div>
            <div className={`h-2 ${theme.progressBg} rounded-full overflow-hidden`}>
              <motion.div 
                className={`h-full bg-gradient-to-r ${tier.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${status.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={`mt-4 pt-4 border-t ${theme.borderColor} space-y-3`}>
                {/* Requirements */}
                <div>
                  <p className={`text-xs ${theme.textSubtle} uppercase mb-2 flex items-center gap-1`}>
                    <Target className="w-3 h-3" />
                    Requirement
                  </p>
                  <div className={`${theme.expandedBg} rounded-lg p-3`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme.textMuted}`}>
                        {getCriteriaLabel(feature.criteria)}
                      </span>
                      <span className={`text-sm font-bold ${theme.text}`}>
                        {status.currentValue} / {status.targetValue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reward preview */}
                {feature.reward && (
                  <div>
                    <p className={`text-xs ${theme.textSubtle} uppercase mb-2 flex items-center gap-1`}>
                      <Gift className="w-3 h-3" />
                      Unlock Reward
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {feature.reward.xpBonus && (
                        <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs text-amber-600">
                          <Zap className="w-3 h-3 inline mr-1" />
                          +{feature.reward.xpBonus} XP
                        </span>
                      )}
                      {feature.reward.badge && (
                        <span className="px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded-lg text-xs text-violet-600">
                          <Star className="w-3 h-3 inline mr-1" />
                          Badge
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand indicator */}
        <div className="flex justify-center mt-3">
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            className={theme.textSubtle}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Get human-readable criteria label
 */
function getCriteriaLabel(criteria) {
  const labels = {
    level: 'Reach Level',
    quizzes: 'Complete Quizzes',
    streak: 'Maintain Streak (Days)',
    duels: 'Win Duels',
    xp: 'Earn XP',
    score: 'Achieve Score',
    achievement: 'Unlock Achievement',
    liveSessionsHosted: 'Host Live Sessions',
    friendsReferred: 'Refer Friends',
    meetingsHosted: 'Host Meetings',
    liveSessionsJoined: 'Join Live Sessions',
    quizzesShared: 'Share Quizzes',
    participations: 'Participate in Quizzes',
  };
  
  return labels[criteria.type] || criteria.type;
}

/**
 * Compact feature list for sidebar
 */
export function FeatureProgressList({ limit = 5 }) {
  const { userStats, currentLevel, totalXP, upcomingFeatures } = useGamification();

  if (!upcomingFeatures || upcomingFeatures.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400 text-sm">
        Keep playing to unlock features!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {upcomingFeatures.slice(0, limit).map((feature) => {
        const tier = TIERS[feature.tier];
        return (
          <div 
            key={feature.id}
            className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-lg"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center text-sm`}>
              {feature.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{feature.name}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${tier.color}`}
                    style={{ width: `${feature.progress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{Math.round(feature.progress)}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FeatureProgressDashboard;
