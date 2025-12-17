import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";
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
  BookOpen,
  BarChart3,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  RefreshCw,
  Gift,
  ChevronRight,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Progress from "../components/ui/Progress";
import LoadingSpinner from "../components/LoadingSpinner";
import { FeatureProgressDashboard, FeatureProgressList } from "../components/Gamification/FeatureProgressDashboard";
import { 
  FEATURE_UNLOCKS, 
  TIERS, 
  LEVEL_MILESTONES, 
  QUIZ_MILESTONES, 
  STREAK_MILESTONES,
  checkFeatureUnlock 
} from "../config/featureUnlocks";

const AchievementCard = ({ achievement, isUnlocked = false, progress = 0 }) => {
  const rarityColors = {
    legendary: "from-amber-400 via-yellow-500 to-orange-500",
    epic: "from-purple-400 via-fuchsia-500 to-pink-500",
    rare: "from-blue-400 via-cyan-500 to-teal-500",
    common: "from-slate-400 to-slate-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative group"
    >
      {/* Card */}
      <div className={`relative backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 ${
        isUnlocked
          ? 'bg-gradient-to-br from-white/90 to-white/70 border-white/60 shadow-lg hover:shadow-xl'
          : 'bg-white/40 border-white/40 shadow-md hover:shadow-lg'
      }`}>
        
        {/* Lock/Check Icon */}
        <div className="absolute top-4 right-4">
          {isUnlocked ? (
            <div className="p-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="p-1.5 rounded-full bg-slate-300/50">
              <Lock className="w-4 h-4 text-slate-500" />
            </div>
          )}
        </div>

        {/* Icon & Content */}
        <div className="flex gap-4 mb-4">
          <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
            isUnlocked 
              ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} shadow-md`
              : 'bg-slate-200/60'
          }`}>
            {achievement.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-base mb-1 ${
              isUnlocked ? 'text-slate-900' : 'text-slate-600'
            }`}>
              {achievement.name}
            </h3>
            <p className={`text-sm line-clamp-2 ${
              isUnlocked ? 'text-slate-600' : 'text-slate-500'
            }`}>
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Progress Bar (for locked achievements) */}
        {!isUnlocked && progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-slate-600">Progress</span>
              <span className="text-xs font-bold text-slate-700">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
          <Badge variant="outline" className="text-xs font-semibold capitalize">
            {achievement.rarity}
          </Badge>
          <div className={`flex items-center gap-1.5 ${
            isUnlocked ? 'text-amber-600' : 'text-slate-500'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-sm font-bold">{achievement.points} XP</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, color = "indigo" }) => {
  const colorClasses = {
    indigo: "from-indigo-500 to-purple-600",
    amber: "from-amber-500 to-orange-600",
    rose: "from-rose-500 to-pink-600",
    emerald: "from-emerald-500 to-teal-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative group"
    >
      <div className="relative backdrop-blur-xl bg-white/70 rounded-2xl p-5 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-md`}>
            {React.cloneElement(icon, { className: "w-5 h-5 text-white" })}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-0.5">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function AchievementDashboard() {
  const { user } = useContext(AuthContext);
  const {
    userStats,
    achievements: allAchievements,
    userAchievements,
    recentUnlocks,
    loading: gamificationLoading,
    refreshData,
    currentLevel,
    totalXP,
    currentStreak,
    unlockedCount,
    totalAchievements,
  } = useGamification();

  const [achievements, setAchievements] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rarity"); // rarity, points, name

  // Sync achievements from context
  useEffect(() => {
    if (!gamificationLoading) {
      // Combine all achievements with user unlock status
      const achievementMap = new Map();

      // Add all available achievements
      allAchievements.forEach((a) => {
        achievementMap.set(a._id || a.id, {
          id: a._id || a.id,
          name: a.name,
          description: a.description,
          icon: a.icon || "🏆",
          type: a.type || "general",
          rarity: a.rarity || "common",
          points: a.points || 10,
          isUnlocked: false,
          progress: 0,
        });
      });

      // Mark unlocked achievements
      userAchievements.forEach((ua) => {
        const achievement = ua.achievement || ua;
        const id = achievement._id || achievement.id || ua._id;

        if (achievementMap.has(id)) {
          const existing = achievementMap.get(id);
          achievementMap.set(id, {
            ...existing,
            isUnlocked: ua.isCompleted ?? true,
            progress: ua.progress || 100,
            unlockedAt: ua.unlockedAt,
          });
        } else {
          // Achievement from user but not in all list
          achievementMap.set(id, {
            id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon || "🏆",
            type: achievement.type || "general",
            rarity: achievement.rarity || "common",
            points: achievement.points || 10,
            isUnlocked: ua.isCompleted ?? true,
            progress: ua.progress || 100,
            unlockedAt: ua.unlockedAt,
          });
        }
      });

      // If no achievements from API, use default definitions
      let finalAchievements = Array.from(achievementMap.values());
      if (finalAchievements.length === 0) {
        finalAchievements = getDefaultAchievementDefinitions(userStats);
      }

      setAchievements(finalAchievements);

      // Recent unlocks
      const recent =
        recentUnlocks.length > 0
          ? recentUnlocks.slice(0, 5).map((a) => ({
              ...a,
              isUnlocked: true,
            }))
          : finalAchievements
              .filter((a) => a.isUnlocked)
              .sort(
                (a, b) =>
                  new Date(b.unlockedAt || 0) - new Date(a.unlockedAt || 0)
              )
              .slice(0, 5);

      setRecentAchievements(recent);
      setLoading(false);
    }
  }, [
    gamificationLoading,
    allAchievements,
    userAchievements,
    recentUnlocks,
    userStats,
  ]);

  // Default achievement definitions based on user stats
  const getDefaultAchievementDefinitions = (stats) => {
    const s = stats || {};
    return [
      // Quiz Completion Achievements
      {
        id: 1,
        name: "First Steps",
        description: "Complete your first quiz",
        icon: "🎯",
        type: "quiz_completion",
        rarity: "common",
        points: 10,
        isUnlocked: (s.totalQuizzesTaken || 0) >= 1,
      },
      {
        id: 2,
        name: "Quiz Novice",
        description: "Complete 5 quizzes",
        icon: "📝",
        type: "quiz_completion",
        rarity: "common",
        points: 15,
        isUnlocked: (s.totalQuizzesTaken || 0) >= 5,
        progress: Math.min(((s.totalQuizzesTaken || 0) / 5) * 100, 100),
      },
      {
        id: 3,
        name: "Quiz Enthusiast",
        description: "Complete 10 quizzes",
        icon: "📚",
        type: "quiz_completion",
        rarity: "rare",
        points: 25,
        isUnlocked: (s.totalQuizzesTaken || 0) >= 10,
        progress: Math.min(((s.totalQuizzesTaken || 0) / 10) * 100, 100),
      },
      {
        id: 4,
        name: "Quiz Master",
        description: "Complete 25 quizzes",
        icon: "🎓",
        type: "quiz_completion",
        rarity: "epic",
        points: 50,
        isUnlocked: (s.totalQuizzesTaken || 0) >= 25,
        progress: Math.min(((s.totalQuizzesTaken || 0) / 25) * 100, 100),
      },
      {
        id: 5,
        name: "Quiz Legend",
        description: "Complete 50 quizzes",
        icon: "👑",
        type: "quiz_completion",
        rarity: "legendary",
        points: 100,
        isUnlocked: (s.totalQuizzesTaken || 0) >= 50,
        progress: Math.min(((s.totalQuizzesTaken || 0) / 50) * 100, 100),
      },

      // Score Achievements
      {
        id: 6,
        name: "Perfect Score",
        description: "Get 100% on any quiz",
        icon: "🏆",
        type: "score_achievement",
        rarity: "epic",
        points: 50,
        isUnlocked:
          (s.averageScore || 0) === 100 || (s.highestScore || 0) === 100,
      },
      {
        id: 7,
        name: "High Achiever",
        description: "Maintain 90% average score",
        icon: "⭐",
        type: "score_achievement",
        rarity: "rare",
        points: 40,
        isUnlocked: (s.averageScore || 0) >= 90,
        progress: Math.min(((s.averageScore || 0) / 90) * 100, 100),
      },
      {
        id: 8,
        name: "Consistent Excellence",
        description: "Maintain 80% average score",
        icon: "💎",
        type: "score_achievement",
        rarity: "common",
        points: 20,
        isUnlocked: (s.averageScore || 0) >= 80,
        progress: Math.min(((s.averageScore || 0) / 80) * 100, 100),
      },
      {
        id: 9,
        name: "Flawless Victory",
        description: "Get 3 perfect scores in a row",
        icon: "🔥",
        type: "score_achievement",
        rarity: "legendary",
        points: 150,
        isUnlocked: false, // Requires streak tracking
      },

      // Streak Achievements
      {
        id: 10,
        name: "Getting Started",
        description: "Maintain a 3-day learning streak",
        icon: "🌟",
        type: "streak",
        rarity: "common",
        points: 15,
        isUnlocked: (s.longestStreak || s.currentStreak || 0) >= 3,
        progress: Math.min(((s.currentStreak || 0) / 3) * 100, 100),
      },
      {
        id: 11,
        name: "Week Warrior",
        description: "Maintain a 7-day learning streak",
        icon: "🔥",
        type: "streak",
        rarity: "rare",
        points: 40,
        isUnlocked: (s.longestStreak || s.currentStreak || 0) >= 7,
        progress: Math.min(((s.currentStreak || 0) / 7) * 100, 100),
      },
      {
        id: 12,
        name: "Unstoppable",
        description: "Maintain a 14-day learning streak",
        icon: "🚀",
        type: "streak",
        rarity: "epic",
        points: 75,
        isUnlocked: (s.longestStreak || s.currentStreak || 0) >= 14,
        progress: Math.min(((s.currentStreak || 0) / 14) * 100, 100),
      },
      {
        id: 13,
        name: "Dedication Master",
        description: "Maintain a 30-day learning streak",
        icon: "💪",
        type: "streak",
        rarity: "legendary",
        points: 200,
        isUnlocked: (s.longestStreak || s.currentStreak || 0) >= 30,
        progress: Math.min(((s.currentStreak || 0) / 30) * 100, 100),
      },

      // Points Achievements
      {
        id: 14,
        name: "Point Collector",
        description: "Earn 100 total points",
        icon: "💰",
        type: "special",
        rarity: "common",
        points: 10,
        isUnlocked: (s.totalPoints || s.experience || 0) >= 100,
        progress: Math.min(
          ((s.totalPoints || s.experience || 0) / 100) * 100,
          100
        ),
      },
      {
        id: 15,
        name: "Rising Star",
        description: "Earn 500 total points",
        icon: "🌠",
        type: "special",
        rarity: "rare",
        points: 30,
        isUnlocked: (s.totalPoints || s.experience || 0) >= 500,
        progress: Math.min(
          ((s.totalPoints || s.experience || 0) / 500) * 100,
          100
        ),
      },
      {
        id: 16,
        name: "Knowledge Seeker",
        description: "Earn 1000 total points",
        icon: "⭐",
        type: "special",
        rarity: "epic",
        points: 100,
        isUnlocked: (s.totalPoints || s.experience || 0) >= 1000,
        progress: Math.min(
          ((s.totalPoints || s.experience || 0) / 1000) * 100,
          100
        ),
      },
      {
        id: 17,
        name: "XP Millionaire",
        description: "Earn 5000 total points",
        icon: "💎",
        type: "special",
        rarity: "legendary",
        points: 500,
        isUnlocked: (s.totalPoints || s.experience || 0) >= 5000,
        progress: Math.min(
          ((s.totalPoints || s.experience || 0) / 5000) * 100,
          100
        ),
      },

      // Speed Achievements
      {
        id: 18,
        name: "Quick Thinker",
        description: "Complete a quiz in under 60 seconds",
        icon: "⚡",
        type: "speed",
        rarity: "rare",
        points: 30,
        isUnlocked: false, // Requires time tracking
      },
      {
        id: 19,
        name: "Speed Demon",
        description: "Answer 5 questions in under 10 seconds each",
        icon: "⏱️",
        type: "speed",
        rarity: "epic",
        points: 50,
        isUnlocked: false,
      },
      {
        id: 20,
        name: "Lightning Fast",
        description: "Complete 10 quizzes with perfect speed scores",
        icon: "⚡",
        type: "speed",
        rarity: "legendary",
        points: 150,
        isUnlocked: false,
      },

      // Level Achievements
      {
        id: 21,
        name: "Level Up!",
        description: "Reach Level 5",
        icon: "🆙",
        type: "special",
        rarity: "common",
        points: 25,
        isUnlocked: (s.level || 0) >= 5,
        progress: Math.min(((s.level || 0) / 5) * 100, 100),
      },
      {
        id: 22,
        name: "Rising Champion",
        description: "Reach Level 10",
        icon: "🏅",
        type: "special",
        rarity: "rare",
        points: 50,
        isUnlocked: (s.level || 0) >= 10,
        progress: Math.min(((s.level || 0) / 10) * 100, 100),
      },
      {
        id: 23,
        name: "Elite Scholar",
        description: "Reach Level 20",
        icon: "🎖️",
        type: "special",
        rarity: "epic",
        points: 100,
        isUnlocked: (s.level || 0) >= 20,
        progress: Math.min(((s.level || 0) / 20) * 100, 100),
      },
      {
        id: 24,
        name: "Grand Master",
        description: "Reach Level 50",
        icon: "👑",
        type: "special",
        rarity: "legendary",
        points: 300,
        isUnlocked: (s.level || 0) >= 50,
        progress: Math.min(((s.level || 0) / 50) * 100, 100),
      },

      // Category Master Achievements
      {
        id: 25,
        name: "Math Wizard",
        description: "Excel in Mathematics category",
        icon: "🔢",
        type: "category_master",
        rarity: "rare",
        points: 35,
        isUnlocked: false, // Requires category tracking
      },
      {
        id: 26,
        name: "Science Guru",
        description: "Excel in Science category",
        icon: "🔬",
        type: "category_master",
        rarity: "rare",
        points: 35,
        isUnlocked: false,
      },
      {
        id: 27,
        name: "History Buff",
        description: "Excel in History category",
        icon: "📜",
        type: "category_master",
        rarity: "rare",
        points: 35,
        isUnlocked: false,
      },
      {
        id: 28,
        name: "Language Expert",
        description: "Excel in Language category",
        icon: "📖",
        type: "category_master",
        rarity: "rare",
        points: 35,
        isUnlocked: false,
      },

      // Time-Based Special Achievements
      {
        id: 29,
        name: "Early Bird",
        description: "Complete a quiz before 8 AM",
        icon: "🌅",
        type: "special",
        rarity: "common",
        points: 15,
        isUnlocked: false,
      },
      {
        id: 30,
        name: "Night Owl",
        description: "Complete a quiz after 10 PM",
        icon: "🦉",
        type: "special",
        rarity: "common",
        points: 15,
        isUnlocked: false,
      },
      {
        id: 31,
        name: "Weekend Warrior",
        description: "Complete 10 quizzes on weekends",
        icon: "🎮",
        type: "special",
        rarity: "rare",
        points: 40,
        isUnlocked: false,
      },
      {
        id: 32,
        name: "Marathon Runner",
        description: "Complete 5 quizzes in a single day",
        icon: "🏃",
        type: "special",
        rarity: "rare",
        points: 50,
        isUnlocked: false,
      },
      {
        id: 33,
        name: "Midnight Scholar",
        description: "Complete quizzes at midnight 3 times",
        icon: "🌙",
        type: "special",
        rarity: "epic",
        points: 75,
        isUnlocked: false,
      },

      // Social & Collaboration
      {
        id: 34,
        name: "Social Learner",
        description: "Participate in 5 live quiz sessions",
        icon: "👥",
        type: "special",
        rarity: "epic",
        points: 60,
        isUnlocked: false,
      },
      {
        id: 35,
        name: "Team Player",
        description: "Complete 10 multiplayer quiz sessions",
        icon: "🤝",
        type: "special",
        rarity: "rare",
        points: 45,
        isUnlocked: false,
      },
      {
        id: 36,
        name: "Quiz Creator",
        description: "Create your first quiz",
        icon: "✍️",
        type: "special",
        rarity: "common",
        points: 20,
        isUnlocked: false,
      },
      {
        id: 37,
        name: "Popular Creator",
        description: "Your quiz gets 100+ attempts",
        icon: "🌟",
        type: "special",
        rarity: "epic",
        points: 100,
        isUnlocked: false,
      },

      // Comeback & Persistence
      {
        id: 38,
        name: "Comeback Kid",
        description: "Return after 30 days of inactivity",
        icon: "🎯",
        type: "special",
        rarity: "rare",
        points: 25,
        isUnlocked: false,
      },
      {
        id: 39,
        name: "Never Give Up",
        description: "Retry a failed quiz and pass with 80%+",
        icon: "💪",
        type: "special",
        rarity: "common",
        points: 20,
        isUnlocked: false,
      },
      {
        id: 40,
        name: "Persistent Learner",
        description: "Complete the same quiz 5 times",
        icon: "🔁",
        type: "special",
        rarity: "rare",
        points: 35,
        isUnlocked: false,
      },

      // Mastery & Excellence
      {
        id: 41,
        name: "Hat Trick",
        description: "Get 3 perfect scores in a row",
        icon: "🎩",
        type: "score_achievement",
        rarity: "epic",
        points: 100,
        isUnlocked: false,
      },
      {
        id: 42,
        name: "Perfectionist",
        description: "Get 10 perfect scores total",
        icon: "💎",
        type: "score_achievement",
        rarity: "legendary",
        points: 200,
        isUnlocked: false,
      },
      {
        id: 43,
        name: "Ace Student",
        description: "Score 95%+ on 20 quizzes",
        icon: "🎓",
        type: "score_achievement",
        rarity: "epic",
        points: 150,
        isUnlocked: false,
      },
      {
        id: 44,
        name: "Genius Mind",
        description: "Complete 5 Expert-level quizzes with 90%+",
        icon: "🧠",
        type: "score_achievement",
        rarity: "legendary",
        points: 250,
        isUnlocked: false,
      },

      // Speed Challenges
      {
        id: 45,
        name: "Flash",
        description: "Complete a 10-question quiz in under 60s",
        icon: "⚡",
        type: "speed",
        rarity: "epic",
        points: 80,
        isUnlocked: false,
      },
      {
        id: 46,
        name: "Time Master",
        description: "Beat time limit on 25 quizzes",
        icon: "⏰",
        type: "speed",
        rarity: "rare",
        points: 60,
        isUnlocked: false,
      },
      {
        id: 47,
        name: "Speed Reader",
        description: "Answer correctly in first 5 seconds 20 times",
        icon: "👀",
        type: "speed",
        rarity: "epic",
        points: 90,
        isUnlocked: false,
      },

      // Exploration & Discovery
      {
        id: 48,
        name: "Explorer",
        description: "Try quizzes from 5 different categories",
        icon: "🗺️",
        type: "special",
        rarity: "common",
        points: 25,
        isUnlocked: false,
      },
      {
        id: 49,
        name: "Renaissance Mind",
        description: "Try quizzes from 10 different categories",
        icon: "🎨",
        type: "special",
        rarity: "rare",
        points: 50,
        isUnlocked: false,
      },
      {
        id: 50,
        name: "Polymath",
        description: "Score 80%+ in 5 different categories",
        icon: "📚",
        type: "category_master",
        rarity: "epic",
        points: 120,
        isUnlocked: false,
      },

      // Improvement & Growth
      {
        id: 51,
        name: "Rising Star",
        description: "Improve your score by 20% on retry",
        icon: "📈",
        type: "special",
        rarity: "common",
        points: 20,
        isUnlocked: false,
      },
      {
        id: 52,
        name: "Rapid Learner",
        description: "Go from 50% to 100% on same quiz",
        icon: "🚀",
        type: "special",
        rarity: "epic",
        points: 75,
        isUnlocked: false,
      },
      {
        id: 53,
        name: "Consistent Performer",
        description: "Score between 85-95% on 10 quizzes",
        icon: "📊",
        type: "score_achievement",
        rarity: "rare",
        points: 55,
        isUnlocked: false,
      },

      // Milestones & Special
      {
        id: 54,
        name: "Century Club",
        description: "Complete 100 quizzes",
        icon: "💯",
        type: "quiz_completion",
        rarity: "legendary",
        points: 300,
        isUnlocked: (s.totalQuizzesTaken || 0) >= 100,
        progress: Math.min(((s.totalQuizzesTaken || 0) / 100) * 100, 100),
      },
      {
        id: 55,
        name: "Answer Machine",
        description: "Answer 1000 questions correctly",
        icon: "🤖",
        type: "special",
        rarity: "epic",
        points: 100,
        isUnlocked: false,
      },
      {
        id: 56,
        name: "Time Traveler",
        description: "Active for 90 consecutive days",
        icon: "⏳",
        type: "streak",
        rarity: "legendary",
        points: 500,
        isUnlocked: (s.longestStreak || s.currentStreak || 0) >= 90,
        progress: Math.min(((s.currentStreak || 0) / 90) * 100, 100),
      },
      {
        id: 57,
        name: "Year One",
        description: "Complete quizzes for 365 days",
        icon: "📅",
        type: "streak",
        rarity: "legendary",
        points: 1000,
        isUnlocked: (s.longestStreak || s.currentStreak || 0) >= 365,
        progress: Math.min(((s.currentStreak || 0) / 365) * 100, 100),
      },

      // Fun & Creative
      {
        id: 58,
        name: "Lucky Number",
        description: "Score exactly 77% on any quiz",
        icon: "🍀",
        type: "special",
        rarity: "rare",
        points: 30,
        isUnlocked: false,
      },
      {
        id: 59,
        name: "Half Century",
        description: "Score exactly 50% on any quiz",
        icon: "⚖️",
        type: "special",
        rarity: "common",
        points: 10,
        isUnlocked: false,
      },
      {
        id: 60,
        name: "Clutch Player",
        description: "Pass a quiz with exactly 60%",
        icon: "🎲",
        type: "special",
        rarity: "common",
        points: 15,
        isUnlocked: false,
      },
      {
        id: 61,
        name: "First Blood",
        description: "Be first to complete a new quiz",
        icon: "🥇",
        type: "special",
        rarity: "epic",
        points: 50,
        isUnlocked: false,
      },
      {
        id: 62,
        name: "Against All Odds",
        description: "Pass a quiz with 60% after scoring 20% first",
        icon: "🎯",
        type: "special",
        rarity: "rare",
        points: 40,
        isUnlocked: false,
      },

      // Legendary Ultimate Achievements
      {
        id: 63,
        name: "Quiz God",
        description: "Reach Level 100",
        icon: "⚡👑",
        type: "special",
        rarity: "legendary",
        points: 2000,
        isUnlocked: (s.level || 0) >= 100,
        progress: Math.min(((s.level || 0) / 100) * 100, 100),
      },
      {
        id: 64,
        name: "Point Billionaire",
        description: "Earn 100,000 total points",
        icon: "💰",
        type: "special",
        rarity: "legendary",
        points: 5000,
        isUnlocked: (s.totalPoints || s.experience || 0) >= 100000,
        progress: Math.min(
          ((s.totalPoints || s.experience || 0) / 100000) * 100,
          100
        ),
      },
      {
        id: 65,
        name: "Ultimate Champion",
        description: "Unlock 50 achievements",
        icon: "🏆👑",
        type: "special",
        rarity: "legendary",
        points: 1000,
        isUnlocked: false,
      },
      {
        id: 66,
        name: "Living Legend",
        description: "Complete 1000 quizzes",
        icon: "🌟",
        type: "quiz_completion",
        rarity: "legendary",
        points: 10000,
        isUnlocked: (s.totalQuizzesTaken || 0) >= 1000,
        progress: Math.min(((s.totalQuizzesTaken || 0) / 1000) * 100, 100),
      },

      // 1v1 Duel Achievements
      {
        id: 67,
        name: "First Duel",
        description: "Complete your first 1v1 duel match",
        icon: "⚔️",
        type: "duel",
        rarity: "common",
        points: 15,
        isUnlocked: false,
      },
      {
        id: 68,
        name: "Duel Novice",
        description: "Win 5 duel matches",
        icon: "🥊",
        type: "duel",
        rarity: "common",
        points: 25,
        isUnlocked: false,
      },
      {
        id: 69,
        name: "Duel Master",
        description: "Win 25 duel matches",
        icon: "🏅",
        type: "duel",
        rarity: "rare",
        points: 75,
        isUnlocked: false,
      },
      {
        id: 70,
        name: "Duel Champion",
        description: "Win 50 duel matches",
        icon: "🏆",
        type: "duel",
        rarity: "epic",
        points: 150,
        isUnlocked: false,
      },
      {
        id: 71,
        name: "Undefeated",
        description: "Win 10 duels in a row",
        icon: "👑",
        type: "duel",
        rarity: "epic",
        points: 200,
        isUnlocked: false,
      },
      {
        id: 72,
        name: "Duel Legend",
        description: "Win 100 duel matches",
        icon: "⚡",
        type: "duel",
        rarity: "legendary",
        points: 500,
        isUnlocked: false,
      },
      {
        id: 73,
        name: "Perfect Duel",
        description: "Win a duel with 100% accuracy",
        icon: "💎",
        type: "duel",
        rarity: "rare",
        points: 60,
        isUnlocked: false,
      },
      {
        id: 74,
        name: "Speed Warrior",
        description: "Win 10 duels with fastest time",
        icon: "⚡🏃",
        type: "duel",
        rarity: "epic",
        points: 100,
        isUnlocked: false,
      },
      {
        id: 75,
        name: "Comeback King",
        description: "Win a duel after being behind 3+ questions",
        icon: "🔥",
        type: "duel",
        rarity: "rare",
        points: 80,
        isUnlocked: false,
      },
      {
        id: 76,
        name: "Duel Dominator",
        description: "Maintain 80%+ win rate over 20 duels",
        icon: "👑⚔️",
        type: "duel",
        rarity: "legendary",
        points: 300,
        isUnlocked: false,
      },

      // Live Session Achievements
      {
        id: 77,
        name: "Live Beginner",
        description: "Join your first live quiz session",
        icon: "📡",
        type: "live_session",
        rarity: "common",
        points: 15,
        isUnlocked: false,
      },
      {
        id: 78,
        name: "Live Participant",
        description: "Participate in 10 live sessions",
        icon: "🎙️",
        type: "live_session",
        rarity: "common",
        points: 30,
        isUnlocked: false,
      },
      {
        id: 79,
        name: "Live Regular",
        description: "Participate in 25 live sessions",
        icon: "📺",
        type: "live_session",
        rarity: "rare",
        points: 70,
        isUnlocked: false,
      },
      {
        id: 80,
        name: "Live Champion",
        description: "Win 10 live quiz sessions",
        icon: "🏆",
        type: "live_session",
        rarity: "epic",
        points: 150,
        isUnlocked: false,
      },
      {
        id: 81,
        name: "Top 3 Finisher",
        description: "Finish in top 3 of 15 live sessions",
        icon: "🥉",
        type: "live_session",
        rarity: "rare",
        points: 90,
        isUnlocked: false,
      },
      {
        id: 82,
        name: "Live Streak",
        description: "Participate in live sessions 7 days in a row",
        icon: "🔥📡",
        type: "live_session",
        rarity: "epic",
        points: 120,
        isUnlocked: false,
      },
      {
        id: 83,
        name: "Session Host",
        description: "Host 5 live quiz sessions",
        icon: "🎤",
        type: "live_session",
        rarity: "rare",
        points: 80,
        isUnlocked: false,
      },
      {
        id: 84,
        name: "Live Legend",
        description: "Win 50 live quiz sessions",
        icon: "👑📡",
        type: "live_session",
        rarity: "legendary",
        points: 500,
        isUnlocked: false,
      },
      {
        id: 85,
        name: "Perfect Live",
        description: "Get 100% in a live session with 10+ participants",
        icon: "💎",
        type: "live_session",
        rarity: "epic",
        points: 150,
        isUnlocked: false,
      },

      // AI Doubt Solver Achievements
      {
        id: 86,
        name: "Curious Mind",
        description: "Ask your first question to AI",
        icon: "🤔",
        type: "ai_doubt",
        rarity: "common",
        points: 10,
        isUnlocked: false,
      },
      {
        id: 87,
        name: "Question Asker",
        description: "Ask 10 questions to AI doubt solver",
        icon: "❓",
        type: "ai_doubt",
        rarity: "common",
        points: 20,
        isUnlocked: false,
      },
      {
        id: 88,
        name: "Doubt Resolver",
        description: "Ask 50 questions to AI",
        icon: "💡",
        type: "ai_doubt",
        rarity: "rare",
        points: 60,
        isUnlocked: false,
      },
      {
        id: 89,
        name: "AI Learner",
        description: "Ask 100 questions to AI doubt solver",
        icon: "🧠",
        type: "ai_doubt",
        rarity: "epic",
        points: 120,
        isUnlocked: false,
      },
      {
        id: 90,
        name: "Deep Thinker",
        description: "Ask questions in 5 different categories",
        icon: "🎯",
        type: "ai_doubt",
        rarity: "rare",
        points: 70,
        isUnlocked: false,
      },
      {
        id: 91,
        name: "Knowledge Seeker Pro",
        description: "Ask 250 questions to AI",
        icon: "📚",
        type: "ai_doubt",
        rarity: "legendary",
        points: 300,
        isUnlocked: false,
      },
      {
        id: 92,
        name: "Problem Solver",
        description: "Solve 20 quizzes after using AI doubt solver",
        icon: "🔧",
        type: "ai_doubt",
        rarity: "rare",
        points: 80,
        isUnlocked: false,
      },
      {
        id: 93,
        name: "AI Study Buddy",
        description: "Use AI doubt solver 5 days in a row",
        icon: "🤖",
        type: "ai_doubt",
        rarity: "rare",
        points: 65,
        isUnlocked: false,
      },

      // Weekly Challenge Achievements
      {
        id: 94,
        name: "Weekly Warrior",
        description: "Complete your first weekly challenge",
        icon: "📅",
        type: "weekly",
        rarity: "common",
        points: 25,
        isUnlocked: false,
      },
      {
        id: 95,
        name: "Week Champion",
        description: "Win 5 weekly challenges",
        icon: "🏅",
        type: "weekly",
        rarity: "rare",
        points: 100,
        isUnlocked: false,
      },
      {
        id: 96,
        name: "Weekly Streak",
        description: "Complete 4 consecutive weekly challenges",
        icon: "🔥",
        type: "weekly",
        rarity: "epic",
        points: 150,
        isUnlocked: false,
      },
      {
        id: 97,
        name: "Monthly Master",
        description: "Win all 4 weekly challenges in a month",
        icon: "👑",
        type: "weekly",
        rarity: "legendary",
        points: 500,
        isUnlocked: false,
      },
      {
        id: 98,
        name: "Weekly Perfect",
        description: "Get 100% in a weekly challenge",
        icon: "💯",
        type: "weekly",
        rarity: "epic",
        points: 120,
        isUnlocked: false,
      },
      {
        id: 99,
        name: "Challenge Master",
        description: "Complete 25 weekly challenges",
        icon: "⭐",
        type: "weekly",
        rarity: "legendary",
        points: 600,
        isUnlocked: false,
      },
      {
        id: 100,
        name: "Top Weekly",
        description: "Finish in top 10 of weekly leaderboard 10 times",
        icon: "🏆",
        type: "weekly",
        rarity: "epic",
        points: 200,
        isUnlocked: false,
      },

      // Avatar & Customization Achievements
      {
        id: 101,
        name: "Style Icon",
        description: "Customize your avatar for the first time",
        icon: "👤",
        type: "avatar",
        rarity: "common",
        points: 10,
        isUnlocked: false,
      },
      {
        id: 102,
        name: "Fashionista",
        description: "Unlock 10 avatar items",
        icon: "👔",
        type: "avatar",
        rarity: "rare",
        points: 50,
        isUnlocked: false,
      },
      {
        id: 103,
        name: "Avatar Master",
        description: "Unlock 25 avatar items",
        icon: "🎨",
        type: "avatar",
        rarity: "epic",
        points: 120,
        isUnlocked: false,
      },
      {
        id: 104,
        name: "Collector",
        description: "Own 50 different avatar items",
        icon: "💎",
        type: "avatar",
        rarity: "legendary",
        points: 300,
        isUnlocked: false,
      },

      // Social & Community Achievements
      {
        id: 105,
        name: "Friend Maker",
        description: "Add 5 friends",
        icon: "👥",
        type: "social",
        rarity: "common",
        points: 15,
        isUnlocked: false,
      },
      {
        id: 106,
        name: "Popular",
        description: "Have 25 friends",
        icon: "🌟",
        type: "social",
        rarity: "rare",
        points: 60,
        isUnlocked: false,
      },
      {
        id: 107,
        name: "Helpful",
        description: "Send 10 study notes to friends",
        icon: "📝",
        type: "social",
        rarity: "rare",
        points: 50,
        isUnlocked: false,
      },
      {
        id: 108,
        name: "Study Group",
        description: "Complete 10 quizzes with friends",
        icon: "📚",
        type: "social",
        rarity: "rare",
        points: 70,
        isUnlocked: false,
      },
      {
        id: 109,
        name: "Influencer",
        description: "Have 100 followers",
        icon: "📱",
        type: "social",
        rarity: "epic",
        points: 150,
        isUnlocked: false,
      },

      // Meeting & Video Session Achievements
      {
        id: 110,
        name: "Video Learner",
        description: "Join your first video study session",
        icon: "📹",
        type: "meeting",
        rarity: "common",
        points: 15,
        isUnlocked: false,
      },
      {
        id: 111,
        name: "Meeting Regular",
        description: "Attend 10 video study sessions",
        icon: "💻",
        type: "meeting",
        rarity: "rare",
        points: 60,
        isUnlocked: false,
      },
      {
        id: 112,
        name: "Session Host Pro",
        description: "Host 15 video study sessions",
        icon: "🎥",
        type: "meeting",
        rarity: "epic",
        points: 120,
        isUnlocked: false,
      },
      {
        id: 113,
        name: "Whiteboard Master",
        description: "Use whiteboard feature in 20 sessions",
        icon: "📝",
        type: "meeting",
        rarity: "rare",
        points: 70,
        isUnlocked: false,
      },
      {
        id: 114,
        name: "Long Session",
        description: "Participate in a 2+ hour study session",
        icon: "⏰",
        type: "meeting",
        rarity: "rare",
        points: 50,
        isUnlocked: false,
      },

      // Moderation & Reporting Achievements
      {
        id: 115,
        name: "Community Guardian",
        description: "Report your first inappropriate content",
        icon: "🛡️",
        type: "moderation",
        rarity: "common",
        points: 20,
        isUnlocked: false,
      },
      {
        id: 116,
        name: "Vigilant",
        description: "Have 5 valid reports accepted",
        icon: "👁️",
        type: "moderation",
        rarity: "rare",
        points: 80,
        isUnlocked: false,
      },
      {
        id: 117,
        name: "Trusted Moderator",
        description: "Help moderate 10 live sessions",
        icon: "⚖️",
        type: "moderation",
        rarity: "epic",
        points: 150,
        isUnlocked: false,
      },

      // Combo & Multiplier Achievements
      {
        id: 118,
        name: "Combo Starter",
        description: "Answer 5 questions correctly in a row",
        icon: "🎯",
        type: "combo",
        rarity: "common",
        points: 20,
        isUnlocked: false,
      },
      {
        id: 119,
        name: "Combo Master",
        description: "Answer 10 questions correctly in a row",
        icon: "🔥",
        type: "combo",
        rarity: "rare",
        points: 60,
        isUnlocked: false,
      },
      {
        id: 120,
        name: "Unstoppable Combo",
        description: "Answer 20 questions correctly in a row",
        icon: "⚡",
        type: "combo",
        rarity: "epic",
        points: 150,
        isUnlocked: false,
      },
      {
        id: 121,
        name: "Combo God",
        description: "Answer 50 questions correctly in a row",
        icon: "👑",
        type: "combo",
        rarity: "legendary",
        points: 500,
        isUnlocked: false,
      },

      // Special Event Achievements
      {
        id: 122,
        name: "Early Adopter",
        description: "Join during platform beta/launch",
        icon: "🚀",
        type: "special_event",
        rarity: "epic",
        points: 100,
        isUnlocked: false,
      },
      {
        id: 123,
        name: "Holiday Learner",
        description: "Complete quizzes on 5 different holidays",
        icon: "🎄",
        type: "special_event",
        rarity: "rare",
        points: 70,
        isUnlocked: false,
      },
      {
        id: 124,
        name: "New Year Champion",
        description: "Complete 10 quizzes on New Year's Day",
        icon: "🎊",
        type: "special_event",
        rarity: "rare",
        points: 80,
        isUnlocked: false,
      },
      {
        id: 125,
        name: "Birthday Bonus",
        description: "Complete a quiz on your birthday",
        icon: "🎂",
        type: "special_event",
        rarity: "common",
        points: 30,
        isUnlocked: false,
      },
    ];
  };

  if (loading) return <LoadingSpinner />;

  // Sort achievements
  const sortAchievements = (achievementList) => {
    const sorted = [...achievementList];
    if (sortBy === "rarity") {
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      sorted.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    } else if (sortBy === "points") {
      sorted.sort((a, b) => b.points - a.points);
    } else if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  };

  // Filter achievements by category
  const filterByCategory = (achievementList) => {
    if (selectedCategory === "all") return achievementList;
    return achievementList.filter((a) => a.type === selectedCategory);
  };

  const unlockedAchievements = sortAchievements(
    filterByCategory(achievements.filter((a) => a.isUnlocked))
  );
  const lockedAchievements = sortAchievements(
    filterByCategory(achievements.filter((a) => !a.isUnlocked))
  );

  // Get category counts
  const categoryCounts = {
    all: achievements.length,
    quiz_completion: achievements.filter((a) => a.type === "quiz_completion").length,
    score_achievement: achievements.filter((a) => a.type === "score_achievement").length,
    streak: achievements.filter((a) => a.type === "streak").length,
    speed: achievements.filter((a) => a.type === "speed").length,
    special: achievements.filter((a) => a.type === "special").length,
    category_master: achievements.filter((a) => a.type === "category_master").length,
    duel: achievements.filter((a) => a.type === "duel").length,
    live_session: achievements.filter((a) => a.type === "live_session").length,
    ai_doubt: achievements.filter((a) => a.type === "ai_doubt").length,
    weekly: achievements.filter((a) => a.type === "weekly").length,
    avatar: achievements.filter((a) => a.type === "avatar").length,
    social: achievements.filter((a) => a.type === "social").length,
    meeting: achievements.filter((a) => a.type === "meeting").length,
    moderation: achievements.filter((a) => a.type === "moderation").length,
    combo: achievements.filter((a) => a.type === "combo").length,
    special_event: achievements.filter((a) => a.type === "special_event").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-900 dark:via-violet-950/30 dark:to-fuchsia-950/30 relative overflow-hidden py-8 px-4 sm:px-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-fuchsia-400/10 dark:bg-fuchsia-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl text-white shadow-lg"
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Trophy className="w-12 h-12" />
            </motion.div>
            {/* Real-time refresh button */}
            <motion.button
              onClick={refreshData}
              disabled={gamificationLoading}
              className="p-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-2 border-white/80 dark:border-slate-700/80 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              title="Refresh real-time stats"
            >
              <RefreshCw
                className={`w-6 h-6 text-violet-600 dark:text-violet-400 ${
                  gamificationLoading ? "animate-spin" : ""
                }`}
              />
            </motion.button>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-900 via-violet-700 to-fuchsia-600 dark:from-white dark:via-violet-300 dark:to-fuchsia-400 bg-clip-text text-transparent drop-shadow-lg mb-4">
            Achievements & Stats
          </h1>
          <p className="text-base sm:text-xl font-bold text-slate-700 dark:text-slate-300 tracking-wide">
            Track your{" "}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
              learning journey
            </span>{" "}
            and unlock rewards ✨
          </p>
          {/* Real-time indicator */}
          <motion.div
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100/80 dark:bg-green-900/50 rounded-full border border-green-200 dark:border-green-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Real-time updates active
            </span>
          </motion.div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          className="mb-8 group relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/10 dark:to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border-2 border-white/80 dark:border-slate-700/80 rounded-3xl p-4 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-500 overflow-hidden">
            {/* Animated orb */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-violet-400/30 to-purple-500/30 dark:from-violet-500/20 dark:to-purple-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10">
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
                <Badge
                  variant="default"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {unlockedAchievements.length} / {achievements.length}{" "}
                  Achievements
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Progress to Level {(userStats?.level || 1) + 1}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {(userStats?.experience || 0) % 100} / 100 XP
                  </span>
                </div>
                <Progress
                  value={(userStats?.experience || 0) % 100}
                  className="h-3"
                />
              </div>
            </div>
          </div>
        </motion.div>

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
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-2 shadow-lg">
            <nav className="flex gap-2 overflow-x-auto">
              {[
                {
                  id: "overview",
                  label: "Overview",
                  icon: <BarChart3 className="w-5 h-5" />,
                },
                {
                  id: "unlocked",
                  label: "Unlocked",
                  icon: <Trophy className="w-5 h-5" />,
                },
                {
                  id: "locked",
                  label: "Locked",
                  icon: <Target className="w-5 h-5" />,
                },
                {
                  id: "features",
                  label: "Feature Unlocks",
                  icon: <Unlock className="w-5 h-5" />,
                },
                {
                  id: "milestones",
                  label: "Milestones",
                  icon: <Gift className="w-5 h-5" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg scale-105"
                      : "text-slate-700 hover:bg-white/60 hover:scale-105"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.id === "unlocked" && (
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-white/80 text-violet-700 font-bold"
                    >
                      {achievements.filter((a) => a.isUnlocked).length}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Category Filter - Only show on unlocked/locked tabs */}
        {(activeTab === "unlocked" || activeTab === "locked") && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-600" />
                  <h3 className="font-bold text-slate-900">Filter & Sort</h3>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white/60 border-2 border-white/60 rounded-lg font-semibold text-sm text-slate-700 focus:outline-none focus:border-violet-400 transition-all"
                >
                  <option value="rarity">Sort by Rarity</option>
                  <option value="points">Sort by Points</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All", icon: "🎯", count: categoryCounts.all },
                  { id: "quiz_completion", label: "Quiz Master", icon: "📚", count: categoryCounts.quiz_completion },
                  { id: "score_achievement", label: "High Scores", icon: "⭐", count: categoryCounts.score_achievement },
                  { id: "duel", label: "Duels", icon: "⚔️", count: categoryCounts.duel },
                  { id: "live_session", label: "Live Sessions", icon: "📡", count: categoryCounts.live_session },
                  { id: "weekly", label: "Weekly", icon: "📅", count: categoryCounts.weekly },
                  { id: "ai_doubt", label: "AI Learner", icon: "🤖", count: categoryCounts.ai_doubt },
                  { id: "streak", label: "Streaks", icon: "🔥", count: categoryCounts.streak },
                  { id: "speed", label: "Speed", icon: "⚡", count: categoryCounts.speed },
                  { id: "combo", label: "Combos", icon: "🎯", count: categoryCounts.combo },
                  { id: "social", label: "Social", icon: "👥", count: categoryCounts.social },
                  { id: "avatar", label: "Avatar", icon: "👤", count: categoryCounts.avatar },
                  { id: "meeting", label: "Meetings", icon: "📹", count: categoryCounts.meeting },
                  { id: "special", label: "Special", icon: "✨", count: categoryCounts.special },
                  { id: "category_master", label: "Categories", icon: "🎓", count: categoryCounts.category_master },
                  { id: "moderation", label: "Moderation", icon: "🛡️", count: categoryCounts.moderation },
                  { id: "special_event", label: "Events", icon: "🎊", count: categoryCounts.special_event },
                ].map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg scale-105"
                        : "bg-white/60 text-slate-700 hover:bg-white hover:scale-105"
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                    <Badge
                      variant="secondary"
                      className={`${
                        selectedCategory === category.id
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Recent Achievements */}
              {recentAchievements.length > 0 ? (
                <motion.div
                  className="group relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500" />
                  <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500">
                    <h3 className="text-2xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                      <Award className="w-6 h-6 text-yellow-500" />
                      Recent Achievements
                    </h3>
                    <div className="space-y-3">
                      {recentAchievements.map((achievement) => {
                        // Handle both nested and flat structure
                        const achData = achievement.achievement || achievement;
                        const achId =
                          achievement._id ||
                          achievement.id ||
                          achData._id ||
                          achData.id;

                        return (
                          <div
                            key={achId}
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 backdrop-blur-md rounded-xl border-2 border-yellow-200/50 shadow-md"
                          >
                            <span className="text-3xl">
                              {achData.icon || "🏆"}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-black text-slate-900">
                                {achData.name || "Achievement"}
                              </h4>
                              <p className="text-sm font-semibold text-slate-600">
                                Unlocked{" "}
                                {achievement.unlockedAt
                                  ? new Date(
                                      achievement.unlockedAt
                                    ).toLocaleDateString()
                                  : "Recently"}
                              </p>
                            </div>
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 font-black">
                              +{achData.points || 10} XP
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="group relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl blur-lg" />
                  <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-8 shadow-lg text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-violet-200/50">
                      <Trophy className="w-10 h-10 text-violet-400" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">
                      No Achievements Yet
                    </h4>
                    <p className="text-slate-600 font-semibold">
                      Complete quizzes to unlock your first achievement! 🎯
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Category Breakdown */}
              <motion.div
                className="group relative mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500" />
                <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
                  <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                    <Target className="w-6 h-6 text-blue-500" />
                    Achievement Categories
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { type: "quiz_completion", label: "Quiz Master", icon: "📚", color: "from-blue-500 to-cyan-600" },
                      { type: "score_achievement", label: "High Scores", icon: "⭐", color: "from-yellow-500 to-orange-600" },
                      { type: "duel", label: "Duels", icon: "⚔️", color: "from-red-500 to-rose-600" },
                      { type: "live_session", label: "Live", icon: "📡", color: "from-green-500 to-emerald-600" },
                      { type: "weekly", label: "Weekly", icon: "📅", color: "from-indigo-500 to-blue-600" },
                      { type: "ai_doubt", label: "AI Learner", icon: "🤖", color: "from-cyan-500 to-teal-600" },
                      { type: "streak", label: "Streaks", icon: "🔥", color: "from-orange-500 to-red-600" },
                      { type: "speed", label: "Speed", icon: "⚡", color: "from-purple-500 to-pink-600" },
                      { type: "combo", label: "Combos", icon: "🎯", color: "from-fuchsia-500 to-pink-600" },
                      { type: "social", label: "Social", icon: "👥", color: "from-lime-500 to-green-600" },
                      { type: "avatar", label: "Avatar", icon: "👤", color: "from-violet-500 to-purple-600" },
                      { type: "meeting", label: "Meetings", icon: "📹", color: "from-sky-500 to-blue-600" },
                      { type: "special", label: "Special", icon: "✨", color: "from-violet-500 to-fuchsia-600" },
                      { type: "category_master", label: "Categories", icon: "🎓", color: "from-emerald-500 to-teal-600" },
                      { type: "moderation", label: "Moderation", icon: "🛡️", color: "from-slate-500 to-gray-600" },
                      { type: "special_event", label: "Events", icon: "🎊", color: "from-rose-500 to-pink-600" },
                    ].map((cat) => {
                      const total = achievements.filter((a) => a.type === cat.type).length;
                      const unlocked = achievements.filter((a) => a.type === cat.type && a.isUnlocked).length;
                      const percentage = total > 0 ? (unlocked / total) * 100 : 0;
                      
                      return (
                        <div
                          key={cat.type}
                          className="bg-white/60 backdrop-blur-md rounded-xl p-4 border-2 border-white/60 hover:border-violet-300/60 transition-all hover:scale-105"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{cat.icon}</span>
                            <span className="font-bold text-sm text-slate-700">{cat.label}</span>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold text-slate-600">{unlocked}/{total}</span>
                              <span className="text-xs font-bold text-slate-700">{Math.round(percentage)}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Next Goals */}
              {(() => {
                const nextAchievements = achievements
                  .filter((a) => !a.isUnlocked && (a.progress || 0) > 0)
                  .sort((a, b) => (b.progress || 0) - (a.progress || 0))
                  .slice(0, 3);
                
                return nextAchievements.length > 0 ? (
                  <motion.div
                    className="group relative mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500" />
                    <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500">
                      <h3 className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-emerald-500" />
                        Next Goals - Almost There!
                      </h3>
                      <div className="space-y-3">
                        {nextAchievements.map((ach) => (
                          <motion.div
                            key={ach.id}
                            className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-md rounded-xl p-4 border-2 border-emerald-200/50 shadow-md hover:scale-102 transition-all"
                            whileHover={{ x: 5 }}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{ach.icon}</span>
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-900">{ach.name}</h4>
                                <p className="text-xs text-slate-600">{ach.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-black text-emerald-600">
                                  {Math.round(ach.progress || 0)}%
                                </div>
                                <div className="text-xs font-semibold text-slate-500">
                                  +{ach.points} XP
                                </div>
                              </div>
                            </div>
                            <Progress
                              value={ach.progress || 0}
                              className="h-2 bg-emerald-100"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : null;
              })()}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  className="group relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500" />
                  <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-500">
                    <h3 className="text-xl font-black text-slate-900 mb-6">
                      Progress Overview
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-slate-600">
                            Achievement Progress
                          </span>
                          <span className="text-xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                            {Math.round(
                              (unlockedAchievements.length /
                                achievements.length) *
                                100
                            ) || 0}
                            %
                          </span>
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                (unlockedAchievements.length /
                                  achievements.length) *
                                  100 || 0
                              }%`,
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50/80 to-red-50/80 rounded-xl border-2 border-orange-200/50">
                        <span className="text-sm font-bold text-slate-700">
                          Learning Streak
                        </span>
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-orange-500" />
                          <span className="text-xl font-black text-orange-600">
                            {userStats?.currentStreak || 0} days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="group relative"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500" />
                  <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
                    <h3 className="text-xl font-black text-slate-900 mb-6">
                      Time Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 rounded-xl border-2 border-blue-200/50">
                        <span className="text-sm font-bold text-slate-700">
                          Time Spent Learning
                        </span>
                        <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {userStats?.totalTimeSpent || 0}m
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-xl border-2 border-emerald-200/50">
                        <span className="text-sm font-bold text-slate-700">
                          Last Quiz
                        </span>
                        <span className="text-sm font-black text-emerald-700">
                          {userStats?.lastQuizDate
                            ? new Date(
                                userStats.lastQuizDate
                              ).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Upcoming Feature Unlocks */}
              <UpcomingFeatureUnlocks userStats={userStats} currentLevel={currentLevel} />
            </motion.div>
          )}

          {activeTab === "unlocked" && (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={true}
                  />
                ))}
              </div>
              {unlockedAchievements.length === 0 && (
                <motion.div
                  className="group relative col-span-full"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl blur-lg" />
                  <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-12 shadow-lg text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-violet-200/50">
                      <Trophy className="w-12 h-12 text-violet-400" />
                    </div>
                    <h3 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-violet-700 bg-clip-text text-transparent mb-3">
                      No achievements unlocked yet
                    </h3>
                    <p className="text-slate-600 font-semibold text-lg">
                      Start taking quizzes to unlock your first achievement! 🚀
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "locked" && (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lockedAchievements.map((achievement) => (
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

          {/* Feature Unlocks Tab */}
          {activeTab === "features" && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FeatureProgressDashboard lightMode={true} compact={true} />
            </motion.div>
          )}

          {/* Milestones Tab */}
          {activeTab === "milestones" && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MilestonesSection userStats={{ ...userStats, level: currentLevel, quizzesCompleted: userStats?.quizzesCompleted || userStats?.totalQuizzesTaken || 0, currentStreak }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
/**
 * Milestones Section Component - Integrated from feature unlock system
 */
function MilestonesSection({ userStats }) {
  const currentLevel = userStats?.level || 1;
  const quizzesCompleted = userStats?.quizzesCompleted || userStats?.totalQuizzesTaken || 0;
  const currentStreak = userStats?.currentStreak || 0;

  return (
    <div className="space-y-8">
      {/* Level Milestones */}
      <div className="bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          Level Milestones
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {LEVEL_MILESTONES.map((milestone) => {
            const isUnlocked = currentLevel >= milestone.level;
            const progress = isUnlocked ? 100 : (currentLevel / milestone.level) * 100;
            return (
              <MilestoneCard 
                key={milestone.level}
                title={`Level ${milestone.level}`}
                description={milestone.title}
                reward={milestone.reward}
                isUnlocked={isUnlocked}
                progress={progress}
                icon={<Crown className="w-5 h-5" />}
                color="amber"
              />
            );
          })}
        </div>
      </div>

      {/* Quiz Milestones */}
      <div className="bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyan-500" />
          Quiz Milestones
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {QUIZ_MILESTONES.map((milestone) => {
            const isUnlocked = quizzesCompleted >= milestone.quizzes;
            const progress = isUnlocked ? 100 : (quizzesCompleted / milestone.quizzes) * 100;
            return (
              <MilestoneCard 
                key={milestone.quizzes}
                title={`${milestone.quizzes} Quizzes`}
                description={milestone.title}
                reward={milestone.reward}
                isUnlocked={isUnlocked}
                progress={progress}
                icon={<BookOpen className="w-5 h-5" />}
                color="cyan"
              />
            );
          })}
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Streak Milestones
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STREAK_MILESTONES.map((milestone) => {
            const isUnlocked = currentStreak >= milestone.days;
            const progress = isUnlocked ? 100 : (currentStreak / milestone.days) * 100;
            return (
              <MilestoneCard 
                key={milestone.days}
                title={`${milestone.days} Day Streak`}
                description={milestone.title}
                reward={milestone.reward}
                isUnlocked={isUnlocked}
                progress={progress}
                icon={<Flame className="w-5 h-5" />}
                color="orange"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Milestone Card Component
 */
function MilestoneCard({ title, description, reward, isUnlocked, progress, icon, color = "violet" }) {
  const colorClasses = {
    amber: { bg: "from-amber-400 to-orange-500", border: "border-amber-300", text: "text-amber-600" },
    cyan: { bg: "from-cyan-400 to-teal-500", border: "border-cyan-300", text: "text-cyan-600" },
    orange: { bg: "from-orange-400 to-red-500", border: "border-orange-300", text: "text-orange-600" },
    violet: { bg: "from-violet-400 to-purple-500", border: "border-violet-300", text: "text-violet-600" },
  };

  const colors = colorClasses[color] || colorClasses.violet;

  // Format reward object to string
  const formatReward = (r) => {
    if (!r) return null;
    const parts = [];
    if (r.xpBonus) parts.push(`+${r.xpBonus} XP`);
    if (r.badge) parts.push('🏅 Badge');
    if (r.avatarItem) parts.push('🎨 Avatar Item');
    return parts.length > 0 ? parts.join(' • ') : null;
  };

  const rewardText = formatReward(reward);

  return (
    <motion.div
      className={`relative rounded-xl p-4 border-2 transition-all ${
        isUnlocked 
          ? `bg-gradient-to-br from-green-50 to-emerald-50 ${colors.border}` 
          : 'bg-white/60 border-slate-200'
      }`}
      whileHover={{ y: -2, scale: 1.02 }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
          isUnlocked 
            ? `bg-gradient-to-br ${colors.bg}` 
            : 'bg-slate-300'
        }`}>
          {isUnlocked ? <CheckCircle2 className="w-5 h-5" /> : icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold ${isUnlocked ? 'text-slate-900' : 'text-slate-600'}`}>{title}</h4>
          <p className="text-slate-500 text-sm">{description}</p>
        </div>
      </div>
      
      {!isUnlocked && (
        <div className="mb-3">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full bg-gradient-to-r ${colors.bg}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 text-right">{Math.round(progress)}% complete</p>
        </div>
      )}
      
      {rewardText && (
        <div className={`flex items-center gap-2 text-xs font-semibold ${isUnlocked ? colors.text : 'text-slate-400'}`}>
          <Gift className="w-3.5 h-3.5" />
          <span>{rewardText}</span>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Upcoming Feature Unlocks Component - Shows features close to unlocking
 */
function UpcomingFeatureUnlocks({ userStats, currentLevel }) {
  const statsObject = {
    ...userStats,
    level: currentLevel || userStats?.level || 1,
    experience: userStats?.experience || userStats?.totalPoints || 0,
    quizzesCompleted: userStats?.quizzesCompleted || userStats?.totalQuizzesTaken || 0,
    currentStreak: userStats?.currentStreak || 0,
    duelsWon: userStats?.duelsWon || 0,
  };

  // Get features sorted by progress (closest to unlocking first)
  const upcomingFeatures = Object.values(FEATURE_UNLOCKS)
    .map(feature => ({
      ...feature,
      status: checkFeatureUnlock(feature.id, statsObject),
    }))
    .filter(f => !f.status.unlocked && f.status.progress > 0)
    .sort((a, b) => b.status.progress - a.status.progress)
    .slice(0, 4);

  if (upcomingFeatures.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="group relative mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500" />
      <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-2">
            <Unlock className="w-6 h-6 text-violet-500" />
            Upcoming Feature Unlocks
          </h3>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); }}
            className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingFeatures.map((feature) => {
            const tier = TIERS[feature.tier];
            return (
              <motion.div
                key={feature.id}
                className="bg-white/60 backdrop-blur-md rounded-xl p-4 border-2 border-white/60 hover:border-violet-300/60 transition-all"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${tier.color} shadow-md`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{feature.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{feature.description}</p>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">{feature.status.remaining}</span>
                    <span className="text-xs font-bold text-violet-600">{Math.round(feature.status.progress)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${tier.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${feature.status.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r ${tier.color} text-white`}>
                    {tier.icon} {tier.name}
                  </span>
                  {feature.reward?.xpBonus && (
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      +{feature.reward.xpBonus} XP
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}