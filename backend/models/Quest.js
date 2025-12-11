const mongoose = require("mongoose");

const questSchema = new mongoose.Schema(
  {
    questId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    realm: {
      type: String,
      required: true,
      enum: [
        // Academic Realms
        "Mathematics Kingdom",
        "Physics Universe",
        "Chemistry Lab",
        "Biology Forest",
        "Computer Science Hub",
        "History Archives",
        "Language Realm",
        // Tech/CS Realms
        "Algorithmic Valley",
        "Web Wizardry",
        "Data Kingdom",
        "AI Sanctuary",
        "System Fortress",
        "Security Citadel",
        "Cloud Highlands",
      ],
    },
    chapter: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "expert"],
      default: "medium",
    },
    objectives: [
      {
        description: String,
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    rewards: {
      xp: {
        type: Number,
        default: 100,
      },
      coins: {
        type: Number,
        default: 10,
      },
      items: [String],
    },
    requirements: {
      minLevel: {
        type: Number,
        default: 0,
      },
      prerequisiteQuests: [String],
    },
    status: {
      type: String,
      enum: ["available", "locked", "in-progress", "completed"],
      default: "available",
    },
    quizIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
    npcDialogue: {
      start: String,
      progress: String,
      complete: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
questSchema.index({ realm: 1, chapter: 1 });
questSchema.index({ questId: 1 });
questSchema.index({ status: 1 });

module.exports = mongoose.model("Quest", questSchema);
