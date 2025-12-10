/**
 * Shared Quiz Model
 * Used by multiple microservices for consistent data structure
 */

const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "descriptive", "fill-in-blank"],
    default: "multiple-choice",
  },
  options: {
    type: [String],
    validate: {
      validator: function (arr) {
        return this.type !== "multiple-choice" || (arr && arr.length >= 2);
      },
      message: "Multiple choice questions must have at least 2 options",
    },
  },
  correct_answer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
  },
  points: {
    type: Number,
    default: 1,
    min: 1,
  },
  timeLimit: {
    type: Number,
    default: 30,
    min: 5,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard", "Expert"],
    default: "Medium",
  },
  tags: [String],
  imageUrl: String,
});

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    questions: {
      type: [QuestionSchema],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: "Quiz must have at least one question",
      },
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Expert", "Mixed"],
      default: "Medium",
    },
    category: {
      type: String,
      default: "General",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    estimatedTime: {
      type: Number,
      default: 0,
    },
    gameSettings: {
      enableHints: {
        type: Boolean,
        default: false,
      },
      enableTimeBonuses: {
        type: Boolean,
        default: true,
      },
      enableStreakBonuses: {
        type: Boolean,
        default: true,
      },
      showLeaderboard: {
        type: Boolean,
        default: true,
      },
    },
    stats: {
      timesTaken: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      averageTime: {
        type: Number,
        default: 0,
      },
      lastTaken: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
QuizSchema.index({ createdBy: 1, createdAt: -1 });
QuizSchema.index({ isPublic: 1, category: 1, difficulty: 1 });
QuizSchema.index({ difficulty: 1 });
QuizSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Quiz", QuizSchema);
