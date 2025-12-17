import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Check, 
  Sparkles, 
  Trophy, 
  Zap, 
  Star,
  ChevronRight,
  MapPin,
  Map,
  ArrowRight,
  Crown,
  Target,
  Gift
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { FEATURE_UNLOCKS, TIERS, checkFeatureUnlock } from '../config/featureUnlocks';

/**
 * Feature Unlock Modal - Shows when a feature is newly unlocked
 */
function FeatureUnlockModal({ feature, onClose, onNavigate }) {
  const tier = TIERS[feature.tier];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Sparkle particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              y: [null, Math.random() * -200],
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 0.5,
              repeat: 2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-3xl shadow-2xl border border-white/10 dark:border-white/5 overflow-hidden"
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${tier.color}`}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          {/* Icon */}
          <motion.div
            className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-2xl`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
          >
            <span className="text-5xl">{feature.icon}</span>
          </motion.div>

          {/* Success message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold text-sm uppercase tracking-wider">
                Feature Unlocked!
              </span>
            </div>
            <h2 className="text-3xl font-black text-white dark:text-slate-50 mb-2">{feature.name}</h2>
            <p className="text-slate-300 dark:text-slate-400 text-lg">{feature.description}</p>
          </motion.div>

          {/* Tier badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${tier.color} text-white font-bold mb-6`}
          >
            <span>{tier.icon}</span>
            <span>{tier.name} Tier</span>
          </motion.div>

          {/* Reward info */}
          {feature.reward && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 dark:bg-white/5 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center justify-center gap-3">
                {feature.reward.xpBonus && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span className="text-white font-bold">+{feature.reward.xpBonus} XP</span>
                  </div>
                )}
                {feature.reward.badge && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-bold">New Badge</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-white dark:text-slate-200 font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
            {onNavigate && (
              <motion.button
                onClick={onNavigate}
                className={`flex-1 px-6 py-3 bg-gradient-to-r ${tier.color} rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-all`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Try it now</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Feature Roadmap Component
 * Shows all features organized by level with progress tracking
 */
export default function FeatureRoadmap() {
  const navigate = useNavigate();
  const { userStats, currentLevel, totalXP } = useGamification();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [unlockedFeature, setUnlockedFeature] = useState(null);
  const [previousUnlockedIds, setPreviousUnlockedIds] = useState(new Set());

  // Prepare stats object for feature checks
  const statsObject = {
    ...userStats,
    level: currentLevel || userStats?.level || 1,
    experience: totalXP || userStats?.experience || 0,
    quizzesCompleted: userStats?.totalQuizzesTaken || 0,
    totalQuizzesTaken: userStats?.totalQuizzesTaken || 0,
    currentStreak: userStats?.currentStreak || 0,
    duelsWon: userStats?.duelsWon || 0,
    duelsPlayed: userStats?.duelsPlayed || 0,
    unlockedAchievements: userStats?.unlockedAchievements || [],
    averageScore: userStats?.averageScore || 0,
  };

  // Group features by required level/criteria
  const groupedFeatures = React.useMemo(() => {
    const features = Object.entries(FEATURE_UNLOCKS).map(([key, feature]) => ({
      key,
      ...feature,
      status: checkFeatureUnlock(key, statsObject)
    }));

    // Sort by unlock difficulty
    return features.sort((a, b) => {
      const aReq = a.criteria.value;
      const bReq = b.criteria.value;
      if (a.criteria.type !== b.criteria.type) {
        const order = { level: 1, quizzes: 2, streak: 3, duels: 4, xp: 5, achievement: 6, score: 7 };
        return order[a.criteria.type] - order[b.criteria.type];
      }
      return aReq - bReq;
    });
  }, [statsObject, currentLevel, totalXP]);

  // Check for newly unlocked features
  useEffect(() => {
    const currentUnlockedIds = new Set(
      groupedFeatures.filter(f => f.status.unlocked).map(f => f.key)
    );

    // Find newly unlocked features
    const newlyUnlocked = groupedFeatures.find(
      f => f.status.unlocked && !previousUnlockedIds.has(f.key)
    );

    if (newlyUnlocked) {
      setUnlockedFeature(newlyUnlocked);
    }

    setPreviousUnlockedIds(currentUnlockedIds);
  }, [groupedFeatures]);

  // Feature route mappings
  const featureRoutes = {
    aiQuizGeneration: '/quiz-maker/topic',
    pdfQuizGeneration: '/pdf-quiz-generator',
    studentQuizCreation: '/student-quiz-creator',
    youtubeQuizGeneration: '/quiz-maker/file',
    duelMode: '/duel',
    rankedDuels: '/duel',
    tournaments: '/duel',
    studyBuddy: '/social',
    studyGroups: '/social',
    friendChallenges: '/social',
    globalChat: '/chat',
    aiTutor: '/doubt-solver',
    advancedAiTutor: '/doubt-solver',
    aiStudyPlan: '/doubt-solver',
    avatarCustomization: '/avatar/customize',
    premiumAvatars: '/avatar/customize',
    profileBadges: '/achievements',
    customThemes: '/settings',
    joinLiveSessions: '/live',
    hostLiveSessions: '/live/start',
    basicAnalytics: '/quiz-history',
    advancedAnalytics: '/quiz-history',
    exportData: '/quiz-history',
    globalLeaderboard: '/leaderboard',
    weeklyLeaderboard: '/leaderboard',
    videoMeetings: '/meeting/join',
    hostMeetings: '/meeting/create',
    screenSharing: '/meeting/create',
    questSystem: '/quests',
  };

  const handleFeatureClick = (feature) => {
    if (feature.status.unlocked) {
      const route = featureRoutes[feature.key];
      if (route) {
        navigate(route);
      }
    }
  };

  return (
    <>
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Feature Roadmap
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unlock features as you level up
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Your Level</div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {currentLevel}
            </div>
          </div>
        </div>

        {/* Progress stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-500/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-green-600 dark:text-green-400">
              {groupedFeatures.filter(f => f.status.unlocked).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Unlocked</div>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
              {groupedFeatures.filter(f => !f.status.unlocked && f.status.progress > 0).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div className="bg-gray-500/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-gray-600 dark:text-gray-400">
              {groupedFeatures.filter(f => f.status.progress === 0).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Locked</div>
          </div>
        </div>

        {/* Feature list */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {groupedFeatures.map((feature, index) => {
            const tier = TIERS[feature.tier];
            const isUnlocked = feature.status.unlocked;
            const progress = feature.status.progress;

            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleFeatureClick(feature)}
                className={`relative group ${isUnlocked ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  isUnlocked 
                    ? `border-green-500/50 dark:border-green-400/40 bg-gradient-to-r ${tier.color} bg-opacity-10 hover:shadow-lg hover:scale-[1.02]` 
                    : progress > 0
                      ? 'border-yellow-500/30 dark:border-yellow-400/30 bg-yellow-500/5 dark:bg-yellow-500/10 hover:border-yellow-500/50'
                      : 'border-gray-300/30 dark:border-gray-700/30 bg-gray-500/5 dark:bg-gray-700/10'
                }`}>
                  {/* Progress bar background */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  <div className="relative flex items-center gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      isUnlocked 
                        ? `bg-gradient-to-br ${tier.color} shadow-lg` 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {isUnlocked ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>

                    {/* Feature info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {feature.name}
                        </h3>
                        <span className="text-xl">{feature.icon}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tier.bgColor} ${tier.textColor} font-semibold`}>
                          {tier.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {feature.description}
                      </p>
                      
                      {/* Requirement */}
                      <div className="flex items-center gap-2 text-xs">
                        {isUnlocked ? (
                          <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Unlocked
                          </span>
                        ) : (
                          <>
                            <Target className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {feature.criteria.type === 'level' && `Reach Level ${feature.criteria.value}`}
                              {feature.criteria.type === 'quizzes' && `Complete ${feature.criteria.value} quizzes`}
                              {feature.criteria.type === 'streak' && `${feature.criteria.value}-day streak`}
                              {feature.criteria.type === 'duels' && `Win ${feature.criteria.value} duels`}
                              {feature.criteria.type === 'xp' && `Earn ${feature.criteria.value} XP`}
                              {feature.criteria.type === 'achievement' && `Unlock ${feature.criteria.value} achievements`}
                              {feature.criteria.type === 'score' && `${feature.criteria.value}% average score`}
                            </span>
                            <span className="ml-auto font-semibold text-purple-600 dark:text-purple-400">
                              {Math.round(progress)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action icon */}
                    {isUnlocked && (
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Feature unlock modal */}
      <AnimatePresence>
        {unlockedFeature && (
          <FeatureUnlockModal
            feature={unlockedFeature}
            onClose={() => setUnlockedFeature(null)}
            onNavigate={() => {
              const route = featureRoutes[unlockedFeature.key];
              if (route) {
                navigate(route);
                setUnlockedFeature(null);
              }
            }}
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 10px;
        }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.6);
        }
      `}</style>
    </>
  );
}
