import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Gift, CheckCircle, Clock, Sparkles, Target, Award } from 'lucide-react';
import axiosInstance from '../../lib/axios';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import { Card } from '../ui/Card';

/**
 * DailyQuests Component
 * Shows daily challenges for unlocking avatar items
 */
const DailyQuests = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [error, setError] = useState(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/daily-quests/daily');
      const data = response.data.data || response.data;
      setQuests(data.quests || []);
    } catch (err) {
      console.error('Error fetching quests:', err);
      setError(err.response?.data?.message || 'Failed to load daily quests');
      // Don't show error toast to prevent infinite loop
      // Just set error state
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (questId) => {
    try {
      setClaiming(questId);
      const response = await axiosInstance.post(`/api/daily-quests/${questId}/claim`);
      const data = response.data.data || response.data;

      success(
        `Reward claimed! ${data.unlockedItem ? `Unlocked: ${data.unlockedItem.name}` : `+${data.rewards.xp} XP`}`
      );

      // Refresh quests
      await fetchQuests();
    } catch (err) {
      console.error('Error claiming reward:', err);
      showError(err.response?.data?.message || 'Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'from-green-500 to-emerald-600';
      case 'medium':
        return 'from-orange-500 to-amber-600';
      case 'hard':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return '⭐';
      case 'medium':
        return '⭐⭐';
      case 'hard':
        return '⭐⭐⭐';
      default:
        return '⭐';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Show error state without triggering loops
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Target className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-medium">Daily Quests unavailable</p>
            <p className="text-xs text-gray-500 mt-1">Complete quizzes to earn rewards!</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-indigo-200/50 dark:border-indigo-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Target className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Daily Challenges
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete quests to unlock avatar items!
              </p>
            </div>
          </div>
          
          {/* Quest Counter */}
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
              {quests.filter(q => q.status === 'completed' || q.status === 'claimed').length} / {quests.length}
            </span>
          </div>
        </div>
      </div>

      {/* Quests List */}
      <div className="p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {quests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                No active quests. Check back tomorrow!
              </p>
            </motion.div>
          ) : (
            quests.map((quest) => (
              <motion.div
                key={quest._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative"
              >
                <Card className={`p-5 border-2 ${
                  quest.status === 'completed' 
                    ? 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20'
                    : quest.status === 'claimed'
                    ? 'border-gray-300 dark:border-gray-700 opacity-60'
                    : 'border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                } transition-all duration-300`}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${getDifficultyColor(quest.difficulty)} shadow-lg flex-shrink-0`}>
                      <Trophy className="w-6 h-6 text-white" />
                    </div>

                    {/* Quest Info */}
                    <div className="flex-1 min-w-0">
                      {/* Title & Difficulty */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                          {quest.title}
                        </h3>
                        <span className="text-sm font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          {getDifficultyIcon(quest.difficulty)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {quest.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Progress
                          </span>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {quest.currentProgress} / {quest.targetValue}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${getDifficultyColor(quest.difficulty)} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min((quest.currentProgress / quest.targetValue) * 100, 100)}%` 
                            }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      {/* Rewards & Action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* XP Reward */}
                          {quest.reward.xpBonus > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                                +{quest.reward.xpBonus} XP
                              </span>
                            </div>
                          )}
                          
                          {/* Item Reward */}
                          {quest.reward.itemType && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Gift className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                              <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                Avatar Item
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Claim Button */}
                        {quest.status === 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => claimReward(quest._id)}
                            disabled={claiming === quest._id}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2"
                          >
                            {claiming === quest._id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Claiming...
                              </>
                            ) : (
                              <>
                                <Award className="w-4 h-4" />
                                Claim Reward
                              </>
                            )}
                          </Button>
                        )}

                        {quest.status === 'claimed' && (
                          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Claimed
                            </span>
                          </div>
                        )}

                        {quest.status === 'active' && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(quest.expiresAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Completion Glow Effect */}
                  {quest.status === 'completed' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-lg pointer-events-none"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Tip */}
      <div className="px-6 pb-6">
        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700/50">
          <p className="text-sm text-indigo-900 dark:text-indigo-300 font-medium text-center">
            💡 Tip: Complete quizzes and challenges to progress your daily quests!
          </p>
        </div>
      </div>
    </Card>
  );
};

export default DailyQuests;
