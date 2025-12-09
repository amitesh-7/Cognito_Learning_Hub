const mongoose = require("mongoose");

const studyGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: [
        "exam_preparation",
        "skill_mastery",
        "career_goal",
        "certification",
        "custom",
      ],
      default: "custom",
    },
    targetDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "on_hold", "abandoned"],
      default: "not_started",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    milestones: [
      {
        title: String,
        description: String,
        targetDate: Date,
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
      },
    ],
    relatedTopics: [String],
    relatedQuizzes: [String],
    aiSuggestions: [
      {
        type: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

studyGoalSchema.index({ user: 1, status: 1 });
studyGoalSchema.index({ user: 1, targetDate: 1 });

module.exports = mongoose.model("StudyGoal", studyGoalSchema);
