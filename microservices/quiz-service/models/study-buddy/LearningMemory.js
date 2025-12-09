const mongoose = require("mongoose");

const learningMemorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    memoryType: {
      type: String,
      enum: [
        "topic_knowledge",
        "learning_pattern",
        "mistake_record",
        "achievement",
        "preference",
        "goal",
        "struggle_area",
        "strength_area",
      ],
      required: true,
    },
    topic: {
      type: String,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    context: {
      type: mongoose.Schema.Types.Mixed,
    },
    importance: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    relatedMemories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LearningMemory",
      },
    ],
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      quizId: String,
      resultId: String,
      conversationId: String,
      source: String,
      tags: [String],
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
learningMemorySchema.index({ user: 1, memoryType: 1 });
learningMemorySchema.index({ user: 1, topic: 1 });
learningMemorySchema.index({ user: 1, importance: -1 });
learningMemorySchema.index({ lastAccessed: -1 });
learningMemorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Update lastAccessed on each access
learningMemorySchema.methods.recordAccess = function () {
  this.lastAccessed = Date.now();
  this.accessCount += 1;
  return this.save();
};

module.exports = mongoose.model("LearningMemory", learningMemorySchema);
