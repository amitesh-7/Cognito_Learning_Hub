import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Flame, 
  Crown, 
  Medal,
  Zap,
  TrendingUp,
  Calendar,
  Clock,
  BookOpen,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Progress from '../components/ui/Progress';
import LoadingSpinner from '../components/LoadingSpinner';

const AchievementCard = ({ achievement, isUnlocked = false, progress = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
    className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 ${
      isUnlocked 
        ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900 dark:via-orange-900 dark:to-red-900 shadow-xl shadow-yellow-200 dark:shadow-yellow-900' 
        : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800 backdrop-blur-sm hover:border-gray-300 dark:hover:border-gray-600'
    }`}
  >
    {/* Sparkle effect for unlocked achievements */}
    {isUnlocked && (
      <div className="absolute -top-1 -right-1">
        <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
      </div>
    )}
    
    <div className="flex items-center gap-4 mb-4">
      <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
        isUnlocked 
          ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 text-yellow-600 dark:text-yellow-400 shadow-lg' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
      }`}>
        {isUnlocked && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <span className="text-3xl relative z-10">{achievement.icon}</span>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-bold text-lg ${
            isUnlocked ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {achievement.name}
          </h3>
          {isUnlocked && <Crown className="w-5 h-5 text-yellow-500" />}
        </div>
        <p className={`text-sm leading-relaxed ${
          isUnlocked ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-500 dark:text-gray-500'
        }`}>
          {achievement.description}
        </p>
      </div>
      {isUnlocked && (
        <motion.div 
          className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
            +{achievement.points} XP
          </span>
        </motion.div>
      )}
    </div>
    
    {!isUnlocked && progress > 0 && (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3 bg-gray-200 dark:bg-gray-700" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse" />
        </div>
      </div>
    )}
    
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <Badge 
        variant={achievement.rarity === 'legendary' ? 'destructive' : 
                 achievement.rarity === 'epic' ? 'default' : 
                 achievement.rarity === 'rare' ? 'secondary' : 'outline'}
        className="font-semibold"
      >
        ✨ {achievement.rarity}
      </Badge>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
        {achievement.type}
      </span>
    </div>
  </motion.div>
);

const StatCard = ({ icon, label, value, change, color = 'blue' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br from-${color}-100 to-${color}-200 dark:from-${color}-900 dark:to-${color}-800 shadow-lg`}>
              {React.cloneElement(icon, { 
                className: `w-6 h-6 text-${color}-600 dark:text-${color}-400` 
              })}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{value}</p>
            </div>
          </div>
          {change && (
            <motion.div 
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                change > 0 
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">{change > 0 ? '+' : ''}{change}</span>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AchievementDashboard() {
  const { user } = useContext(AuthContext);
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('quizwise-token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/stats`, {
        headers: { 'x-auth-token': token }
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setUserStats(data.stats);
      setRecentAchievements(data.recentAchievements);
      
      // Mock achievements data (in production, fetch from API)
      setAchievements([
        {
          id: 1,
          name: 'First Steps',
          description: 'Complete your first quiz',
          icon: '🎯',
          type: 'quiz_completion',
          rarity: 'common',
          points: 10,
          isUnlocked: data.stats.totalQuizzesTaken >= 1
        },
        {
          id: 2,
          name: 'Quiz Enthusiast',
          description: 'Complete 10 quizzes',
          icon: '📚',
          type: 'quiz_completion',
          rarity: 'rare',
          points: 25,
          isUnlocked: data.stats.totalQuizzesTaken >= 10,
          progress: Math.min((data.stats.totalQuizzesTaken / 10) * 100, 100)
        },
        {
          id: 3,
          name: 'Perfect Score',
          description: 'Get 100% on any quiz',
          icon: '🏆',
          type: 'score_achievement',
          rarity: 'epic',
          points: 50,
          isUnlocked: false // Would check from results
        },
        {
          id: 4,
          name: 'Speed Demon',
          description: 'Answer 5 questions in under 10 seconds each',
          icon: '⚡',
          type: 'speed',
          rarity: 'rare',
          points: 30,
          isUnlocked: false
        },
        {
          id: 5,
          name: 'Streak Master',
          description: 'Maintain a 7-day learning streak',
          icon: '🔥',
          type: 'streak',
          rarity: 'epic',
          points: 40,
          isUnlocked: data.stats.longestStreak >= 7,
          progress: Math.min((data.stats.currentStreak / 7) * 100, 100)
        },
        {
          id: 6,
          name: 'Knowledge Seeker',
          description: 'Earn 1000 total points',
          icon: '⭐',
          type: 'special',
          rarity: 'legendary',
          points: 100,
          isUnlocked: data.stats.totalPoints >= 1000,
          progress: Math.min((data.stats.totalPoints / 1000) * 100, 100)
        }
      ]);
      
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl text-white">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Achievements & Stats
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your learning journey and unlock rewards
              </p>
            </div>
          </div>

          {/* Level Progress */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Level {userStats?.level || 1}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {userStats?.experience || 0} XP
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {unlockedAchievements.length} / {achievements.length} Achievements
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progress to Level {(userStats?.level || 1) + 1}</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {(userStats?.experience || 0) % 100} / 100 XP
                  </span>
                </div>
                <Progress value={((userStats?.experience || 0) % 100)} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<BookOpen className="w-6 h-6 text-blue-600" />}
            label="Quizzes Completed"
            value={userStats?.totalQuizzesTaken || 0}
            color="blue"
          />
          <StatCard
            icon={<Star className="w-6 h-6 text-yellow-600" />}
            label="Total Points"
            value={userStats?.totalPoints || 0}
            color="yellow"
          />
          <StatCard
            icon={<Flame className="w-6 h-6 text-orange-600" />}
            label="Current Streak"
            value={userStats?.currentStreak || 0}
            color="orange"
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6 text-green-600" />}
            label="Average Score"
            value={`${userStats?.averageScore || 0}%`}
            color="green"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
                { id: 'unlocked', label: 'Unlocked', icon: <Trophy className="w-4 h-4" /> },
                { id: 'locked', label: 'Locked', icon: <Target className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.id === 'unlocked' && (
                    <Badge variant="secondary" className="ml-2">
                      {unlockedAchievements.length}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Recent Achievements */}
              {recentAchievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentAchievements.map(achievement => (
                        <div key={achievement._id} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                          <span className="text-2xl">🏆</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {achievement.achievement.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="default">+{achievement.achievement.points} XP</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Achievement Progress</span>
                      <span className="font-bold">
                        {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
                      </span>
                    </div>
                    <Progress value={(unlockedAchievements.length / achievements.length) * 100} />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Learning Streak</span>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="font-bold">{userStats?.currentStreak || 0} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Time Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Time Spent Learning</span>
                      <span className="font-bold">{userStats?.totalTimeSpent || 0}m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Quiz</span>
                      <span className="font-bold">
                        {userStats?.lastQuizDate 
                          ? new Date(userStats.lastQuizDate).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'unlocked' && (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedAchievements.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={true}
                  />
                ))}
              </div>
              {unlockedAchievements.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No achievements unlocked yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      Start taking quizzes to unlock your first achievement!
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === 'locked' && (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lockedAchievements.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={false}
                    progress={achievement.progress}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
