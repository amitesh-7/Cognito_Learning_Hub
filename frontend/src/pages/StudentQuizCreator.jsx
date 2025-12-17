import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  FileText, 
  PenTool, 
  Youtube, 
  Lock,
  Star,
  Zap,
  BookOpen,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { FeatureGate } from '../components/FeatureGate';
import { checkFeatureUnlock, FEATURE_UNLOCKS, TIERS } from '../config/featureUnlocks';

/**
 * StudentQuizCreator - Feature-gated quiz creation hub for students
 * Students can unlock quiz creation features based on their level/progress
 */
export default function StudentQuizCreator() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { userStats, currentLevel, totalXP } = useGamification();

  // Prepare stats object for feature checks
  const statsObject = {
    ...userStats,
    level: currentLevel || userStats?.level || 1,
    experience: totalXP || userStats?.experience || 0,
    quizzesCompleted: userStats?.totalQuizzesTaken || 0,
    currentStreak: userStats?.currentStreak || 0,
    duelsWon: userStats?.duelsWon || 0,
  };

  // Check feature unlock status for each creation method
  const creationMethods = [
    {
      id: 'aiQuizGeneration',
      title: 'AI Quiz Generation',
      description: 'Generate quizzes from any topic using AI',
      icon: Sparkles,
      color: 'from-violet-500 to-purple-600',
      route: '/quiz-maker/topic',
      featureId: 'aiQuizGeneration',
    },
    {
      id: 'pdfQuizGeneration',
      title: 'PDF Quiz Generator',
      description: 'Upload PDFs and generate quizzes automatically',
      icon: FileText,
      color: 'from-cyan-500 to-blue-600',
      route: '/pdf-quiz-generator',
      featureId: 'pdfQuizGeneration',
    },
    {
      id: 'manualQuizCreation',
      title: 'Manual Quiz Creator',
      description: 'Create custom quizzes with your own questions',
      icon: PenTool,
      color: 'from-emerald-500 to-green-600',
      route: '/quiz-maker/manual',
      featureId: 'studentQuizCreation',
    },
    {
      id: 'youtubeQuizGeneration',
      title: 'YouTube Quiz Generator',
      description: 'Generate quizzes from YouTube videos',
      icon: Youtube,
      color: 'from-red-500 to-pink-600',
      route: '/quiz-maker/file',
      featureId: 'youtubeQuizGeneration',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-4">
            Quiz Creation Studio
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Unlock powerful quiz creation tools as you level up! Complete quizzes and achievements to access more features.
          </p>
        </motion.div>

        {/* Progress Summary */}
        <motion.div 
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/50 shadow-lg max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your Level</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{currentLevel}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total XP</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{totalXP?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quizzes Taken</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{statsObject.quizzesCompleted}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Creation Methods Grid */}
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {creationMethods.map((method, index) => {
            const status = checkFeatureUnlock(method.featureId, statsObject);
            const feature = FEATURE_UNLOCKS[method.featureId];
            const tier = feature ? TIERS[feature.tier] : null;

            return (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                {status.unlocked ? (
                  // Unlocked - Clickable card
                  <motion.div
                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${method.color} p-6 cursor-pointer shadow-xl`}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(method.route)}
                  >
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                          <method.icon className="w-7 h-7 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Unlocked
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
                      <p className="text-white/80 text-sm mb-4">{method.description}</p>
                      <div className="flex items-center gap-2 text-white/90 font-medium">
                        Start Creating
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-lg" />
                  </motion.div>
                ) : (
                  // Locked - Show progress
                  <motion.div
                    className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <method.icon className="w-7 h-7 text-gray-400" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${tier ? `bg-gradient-to-r ${tier.color} text-white` : 'bg-gray-300 text-gray-600'}`}>
                          <Lock className="w-3 h-3" />
                          {tier?.name || 'Locked'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{method.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{method.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">{status.remaining}</span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">{Math.round(status.progress)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full bg-gradient-to-r ${method.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${status.progress}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tips Section */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl p-6 max-w-2xl mx-auto border border-violet-200/50">
            <h3 className="text-lg font-bold text-violet-700 dark:text-violet-400 mb-2">
              💡 How to Unlock Features
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left max-w-md mx-auto">
              <li>• <strong>Level 6:</strong> PDF Quiz Generation</li>
              <li>• <strong>Level 8:</strong> Manual Quiz Creation</li>
              <li>• <strong>8 Quizzes:</strong> AI Quiz Generation</li>
              <li>• <strong>10 Quizzes:</strong> YouTube Quiz Generation</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
