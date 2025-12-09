const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant", "system"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        metadata: {
          topic: String,
          difficulty: String,
          emotionalTone: String,
          relatedQuizzes: [String],
          confidence: Number,
        },
      },
    ],
    summary: {
      type: String,
    },
    topics: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    metadata: {
      totalMessages: {
        type: Number,
        default: 0,
      },
      duration: {
        type: Number, // in seconds
        default: 0,
      },
      lastActivity: {
        type: Date,
        default: Date.now,
      },
      userSatisfaction: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
conversationSchema.index({ user: 1, createdAt: -1 });
conversationSchema.index({ sessionId: 1 });
conversationSchema.index({ topics: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
