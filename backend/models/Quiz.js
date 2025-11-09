const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "descriptive", "fill-in-blank"],
    default: "multiple-choice",
  },
  options: [{ type: String }], // Optional for non-multiple choice questions
  correct_answer: { type: String, required: true },
  explanation: { type: String }, // Optional explanation for answers
  points: { type: Number, default: 1 }, // Points for gamification
  timeLimit: { type: Number, default: 30 }, // Time limit in seconds
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard", "Expert"],
    default: "Medium",
  },
});

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: { type: String },
    questions: [QuestionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // This creates a reference to our User model
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Expert"],
      default: "Medium",
    },
    category: { type: String },
    tags: [{ type: String }],
    isPublic: { type: Boolean, default: true },
    timeLimit: { type: Number, default: 30 }, // Default time per question
    passingScore: { type: Number, default: 60 }, // Percentage needed to pass
    totalPoints: { type: Number, default: 0 }, // Total points for all questions
    attempts: { type: Number, default: 0 }, // Track how many times taken
    averageScore: { type: Number, default: 0 },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
      },
    ],
    gameSettings: {
      enableHints: { type: Boolean, default: false },
      enableTimeBonuses: { type: Boolean, default: true },
      enableStreakBonuses: { type: Boolean, default: true },
      showLeaderboard: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Performance Indexes
QuizSchema.index({ createdBy: 1, createdAt: -1 }); // User's quizzes sorted by date
QuizSchema.index({ isPublic: 1, difficulty: 1 }); // Public quiz browsing
QuizSchema.index({ category: 1, tags: 1 }); // Search by category and tags
QuizSchema.index({ averageScore: -1, attempts: -1 }); // Popular quizzes
QuizSchema.index({ "gameSettings.showLeaderboard": 1 }); // Leaderboard queries
QuizSchema.index({ createdAt: -1 }); // Recent quizzes

module.exports = mongoose.model("Quiz", QuizSchema);
