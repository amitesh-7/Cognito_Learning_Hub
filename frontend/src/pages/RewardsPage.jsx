import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Lock, 
  Unlock, 
  Sparkles, 
  Gift,
  Target,
  Flame,
  Crown,
  ChevronRight,
  Filter,
  TrendingUp,
  Zap,
  Award,
  Calendar,
  Users,
  Brain,
  Swords,
  Video
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { FeatureProgressDashboard, FeatureProgressList } from '../components/Gamification/FeatureProgressDashboard';
import { 
  LEVEL_MILESTONES, 
  QUIZ_MILESTONES, 
  STREAK_MILESTONES,
  TIERS
} from '../config/featureUnlocks';

/**
 * Rewards Page - Comprehensive gamification rewards center
 */
export default function RewardsPage() {
  const { 
    userStats,
    currentLevel, 
    totalXP, 
    currentStreak,
    quizzesCompleted,
    getLevelProgress,
    upcomingFeatures,
  } = useGamification();
  
  const [activeTab, setActiveTab] = useState('features');
  const levelProgress = getLevelProgress();

  const tabs = [
    { id: 'features', label: 'Feature Unlocks', icon: <Unlock className="w-4 h-4" /> },
    { id: 'milestones', label: 'Milestones', icon: <Target className="w-4 h-4" /> },
    { id: 'rewards', label: 'Rewards', icon: <Gift className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black text-white mb-2">
            🎮 Rewards Center
          </h1>
          <p className="text-slate-400">
            Track your progress, unlock features, and earn rewards!
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard 
            icon={<Crown className="w-6 h-6" />}
            label="Level"
            value={currentLevel}
            subtext={`${Math.round(levelProgress.percentage)}% to next`}
            gradient="from-amber-500 to-orange-600"
          />
          <StatCard 
            icon={<Sparkles className="w-6 h-6" />}
            label="Total XP"
            value={totalXP.toLocaleString()}
            subtext="Earned"
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard 
            icon={<Flame className="w-6 h-6" />}
            label="Streak"
            value={currentStreak}
            subtext="Days"
            gradient="from-rose-500 to-pink-600"
          />
          <StatCard 
            icon={<Trophy className="w-6 h-6" />}
            label="Quizzes"
            value={quizzesCompleted || userStats?.quizzesCompleted || 0}
            subtext="Completed"
            gradient="from-cyan-500 to-teal-600"
          />
        </motion.div>

        {/* Level Progress Bar */}
        <motion.div 
          className="mb-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-white">{currentLevel}</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg">Level {currentLevel}</p>
                <p className="text-slate-400 text-sm">
                  {levelProgress.current.toLocaleString()} / {levelProgress.next.toLocaleString()} XP
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                {Math.round(levelProgress.percentage)}%
              </p>
              <p className="text-slate-400 text-sm">to Level {currentLevel + 1}</p>
            </div>
          </div>
          
          <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress.percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'features' && <FeatureProgressDashboard />}
            {activeTab === 'milestones' && <MilestonesSection userStats={{ ...userStats, level: currentLevel, quizzesCompleted, currentStreak }} />}
            {activeTab === 'rewards' && <RewardsSection userStats={{ ...userStats, level: currentLevel }} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ icon, label, value, subtext, gradient }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-4"
      whileHover={{ y: -4 }}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2`} />
      
      <div className="relative">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg`}>
          <span className="text-white">{icon}</span>
        </div>
        <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
        {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
      </div>
    </motion.div>
  );
}

/**
 * Milestones Section
 */
function MilestonesSection({ userStats }) {
  const currentLevel = userStats?.level || 1;
  const quizzesCompleted = userStats?.quizzesCompleted || 0;
  const currentStreak = userStats?.currentStreak || 0;

  return (
    <div className="space-y-8">
      {/* Level Milestones */}
      <div>
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          Level Milestones
        </h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {LEVEL_MILESTONES.map((milestone) => {
            const isUnlocked = currentLevel >= milestone.level;
            return (
              <MilestoneCard 
                key={milestone.level}
                title={`Level ${milestone.level}`}
                description={milestone.title}
                reward={milestone.reward}
                isUnlocked={isUnlocked}
                progress={isUnlocked ? 100 : (currentLevel / milestone.level) * 100}
                icon={<Crown className="w-5 h-5" />}
              />
            );
          })}
        </div>
      </div>

      {/* Quiz Milestones */}
      <div>
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          Quiz Milestones
        </h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {QUIZ_MILESTONES.map((milestone) => {
            const isUnlocked = quizzesCompleted >= milestone.quizzes;
            return (
              <MilestoneCard 
                key={milestone.quizzes}
                title={`${milestone.quizzes} Quizzes`}
                description={milestone.title}
                reward={milestone.reward}
                isUnlocked={isUnlocked}
                progress={isUnlocked ? 100 : (quizzesCompleted / milestone.quizzes) * 100}
                icon={<Brain className="w-5 h-5" />}
              />
            );
          })}
        </div>
      </div>

      {/* Streak Milestones */}
      <div>
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Streak Milestones
        </h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {STREAK_MILESTONES.map((milestone) => {
            const isUnlocked = currentStreak >= milestone.days;
            return (
              <MilestoneCard 
                key={milestone.days}
                title={`${milestone.days} Day Streak`}
                description={milestone.title}
                reward={milestone.reward}
                isUnlocked={isUnlocked}
                progress={isUnlocked ? 100 : (currentStreak / milestone.days) * 100}
                icon={<Flame className="w-5 h-5" />}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Milestone Card
 */
function MilestoneCard({ title, description, reward, isUnlocked, progress, icon }) {
  return (
    <motion.div
      className={`relative rounded-xl p-4 border transition-all ${
        isUnlocked 
          ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30' 
          : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50'
      }`}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isUnlocked 
            ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
            : 'bg-slate-700'
        }`}>
          {isUnlocked ? <Unlock className="w-5 h-5 text-white" /> : icon}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold">{title}</h4>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>
      
      {!isUnlocked && (
        <div className="mb-3">
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{Math.round(progress)}% complete</p>
        </div>
      )}
      
      {reward && (
        <div className="flex items-center gap-2 text-xs">
          <Gift className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-300">{reward}</span>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Rewards Section - Shows all earned and upcoming rewards
 */
function RewardsSection({ userStats }) {
  const rewards = [
    { 
      id: 1, 
      name: 'Early Bird Badge', 
      description: 'Complete 5 quizzes', 
      icon: '🌅', 
      unlocked: (userStats?.quizzesCompleted || 0) >= 5,
      xp: 50 
    },
    { 
      id: 2, 
      name: 'Quiz Master', 
      description: 'Complete 25 quizzes', 
      icon: '🧠', 
      unlocked: (userStats?.quizzesCompleted || 0) >= 25,
      xp: 200 
    },
    { 
      id: 3, 
      name: 'Streak Warrior', 
      description: '7 day streak', 
      icon: '🔥', 
      unlocked: (userStats?.currentStreak || 0) >= 7,
      xp: 100 
    },
    { 
      id: 4, 
      name: 'Level 10 Pioneer', 
      description: 'Reach Level 10', 
      icon: '⭐', 
      unlocked: (userStats?.level || 1) >= 10,
      xp: 150 
    },
    { 
      id: 5, 
      name: 'Duel Champion', 
      description: 'Win 5 duels', 
      icon: '⚔️', 
      unlocked: (userStats?.duelsWon || 0) >= 5,
      xp: 100 
    },
    { 
      id: 6, 
      name: 'Social Butterfly', 
      description: 'Refer 3 friends', 
      icon: '🦋', 
      unlocked: (userStats?.friendsReferred || 0) >= 3,
      xp: 200 
    },
    { 
      id: 7, 
      name: 'Perfectionist', 
      description: 'Score 100% on 5 quizzes', 
      icon: '💯', 
      unlocked: (userStats?.perfectScores || 0) >= 5,
      xp: 250 
    },
    { 
      id: 8, 
      name: 'Veteran Learner', 
      description: 'Reach Level 25', 
      icon: '🎖️', 
      unlocked: (userStats?.level || 1) >= 25,
      xp: 500 
    },
  ];

  const unlockedRewards = rewards.filter(r => r.unlocked);
  const lockedRewards = rewards.filter(r => !r.unlocked);

  return (
    <div className="space-y-8">
      {/* Unlocked Rewards */}
      <div>
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Earned Rewards ({unlockedRewards.length})
        </h3>
        
        {unlockedRewards.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {unlockedRewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No rewards earned yet</p>
            <p className="text-slate-500 text-sm">Keep playing to unlock rewards!</p>
          </div>
        )}
      </div>

      {/* Locked Rewards */}
      <div>
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-slate-400" />
          Available Rewards ({lockedRewards.length})
        </h3>
        
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {lockedRewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} locked />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Reward Card
 */
function RewardCard({ reward, locked = false }) {
  return (
    <motion.div
      className={`relative rounded-xl p-4 border transition-all ${
        locked 
          ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 opacity-75' 
          : 'bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-amber-500/30'
      }`}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          locked ? 'bg-slate-700' : 'bg-gradient-to-br from-amber-400 to-orange-500'
        }`}>
          {locked ? <Lock className="w-6 h-6 text-slate-500" /> : reward.icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold ${locked ? 'text-slate-400' : 'text-white'}`}>{reward.name}</h4>
          <p className="text-slate-500 text-sm">{reward.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className={`w-4 h-4 ${locked ? 'text-slate-500' : 'text-amber-400'}`} />
          <span className={`font-bold ${locked ? 'text-slate-500' : 'text-amber-300'}`}>+{reward.xp} XP</span>
        </div>
        {!locked && (
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
            ✓ Earned
          </span>
        )}
      </div>
    </motion.div>
  );
}
