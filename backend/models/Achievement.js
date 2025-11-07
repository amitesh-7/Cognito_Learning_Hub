const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // Icon name or emoji
  type: { 
    type: String, 
    enum: ['quiz_completion', 'score_achievement', 'streak', 'speed', 'category_master', 'special'],
    required: true
  },
  criteria: {
    target: { type: Number }, // Target number (e.g., complete 10 quizzes)
    category: { type: String }, // Specific category if applicable
    score: { type: Number }, // Minimum score required
    timeLimit: { type: Number } // Time limit for speed achievements
  },
  rarity: { 
    type: String, 
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const UserAchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', required: true },
  unlockedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 }, // Current progress towards achievement
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const UserStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalQuizzesTaken: { type: Number, default: 0 },
  totalQuizzesCreated: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastQuizDate: { type: Date },
  averageScore: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 }, // in minutes
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  favoriteCategories: [{ type: String }],
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserAchievement' }],
  badges: [{
    type: { type: String },
    earnedAt: { type: Date, default: Date.now },
    name: { type: String },
    icon: { type: String }
  }]
}, { timestamps: true });

module.exports = {
  Achievement: mongoose.model('Achievement', AchievementSchema),
  UserAchievement: mongoose.model('UserAchievement', UserAchievementSchema),
  UserStats: mongoose.model('UserStats', UserStatsSchema)
};
