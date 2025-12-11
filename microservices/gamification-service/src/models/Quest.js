const mongoose = require("mongoose");

const questSchema = new mongoose.Schema(
  {
    // Quest Identification
    questId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    storyline: {
      type: String,
      required: true,
    },

    // Quest Organization
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
      type: Number,
      required: true,
    },
    chapterTitle: {
      type: String,
      required: true,
    },
    questNumber: {
      type: Number,
      required: true,
    },
    questType: {
      type: String,
      enum: ["story", "battle", "challenge", "boss", "side_quest"],
      default: "story",
    },

    // Quest Requirements
    prerequisites: [
      {
        questId: String,
        title: String,
      },
    ],
    minimumLevel: {
      type: Number,
      default: 1,
    },
    requiredSkills: [String],

    // Linked Quiz
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Legendary"],
      required: true,
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 15,
    },

    // NPC Characters
    npc: {
      name: String,
      role: String, // "Guide", "Merchant", "Wizard", "Warrior"
      dialogue: {
        introduction: String,
        hint: String,
        success: String,
        failure: String,
      },
      avatarUrl: String,
    },

    // Rewards
    rewards: {
      xp: {
        type: Number,
        required: true,
      },
      gold: {
        type: Number,
        default: 0,
      },
      items: [
        {
          itemId: String,
          name: String,
          type: String, // "ability", "cosmetic", "powerup"
          description: String,
          iconUrl: String,
        },
      ],
      abilities: [
        {
          abilityId: String,
          name: String,
          description: String,
          effect: String, // "hint_unlock", "time_boost", "skip_question"
        },
      ],
      badges: [
        {
          badgeId: String,
          name: String,
          description: String,
          iconUrl: String,
        },
      ],
      storyUnlocks: [String], // Lore entries unlocked
    },

    // Branching Paths
    branches: [
      {
        condition: String, // "score > 80", "time < 300", "perfect_score"
        description: String,
        nextQuestId: String,
        specialReward: {
          type: String,
          description: String,
        },
      },
    ],

    // Quest State
    isActive: {
      type: Boolean,
      default: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    unlockDate: Date,

    // Analytics
    totalAttempts: {
      type: Number,
      default: 0,
    },
    successRate: {
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
  },
  {
    timestamps: true,
  }
);

// Indexes
questSchema.index({ realm: 1, chapter: 1, questNumber: 1 });
questSchema.index({ isActive: 1, isLocked: 1 });
questSchema.index({ difficulty: 1 });

// Methods
questSchema.methods.checkPrerequisites = function (completedQuests) {
  if (this.prerequisites.length === 0) return true;

  return this.prerequisites.every((prereq) =>
    completedQuests.some((cq) => cq.questId === prereq.questId)
  );
};

questSchema.methods.checkLevelRequirement = function (userLevel) {
  return userLevel >= this.minimumLevel;
};

questSchema.methods.getNextQuest = function (score, time) {
  // Check branching conditions
  for (const branch of this.branches) {
    if (this.evaluateCondition(branch.condition, score, time)) {
      return branch.nextQuestId;
    }
  }

  // Default next quest (sequential)
  return `${this.realm}_ch${this.chapter}_q${this.questNumber + 1}`;
};

questSchema.methods.evaluateCondition = function (condition, score, time) {
  try {
    // Simple condition parser
    if (condition.includes("score >")) {
      const threshold = parseInt(condition.match(/\d+/)[0]);
      return score > threshold;
    }
    if (condition.includes("time <")) {
      const threshold = parseInt(condition.match(/\d+/)[0]);
      return time < threshold;
    }
    if (condition === "perfect_score") {
      return score === 100;
    }
    return false;
  } catch (error) {
    console.error("Error evaluating condition:", error);
    return false;
  }
};

// Static methods
questSchema.statics.getChapterQuests = function (realm, chapter) {
  return this.find({ realm, chapter, isActive: true }).sort({ questNumber: 1 });
};

questSchema.statics.getRealmProgress = async function (realm, userId) {
  const UserQuest = mongoose.model("UserQuest");
  const totalQuests = await this.countDocuments({ realm, isActive: true });
  const completedQuests = await UserQuest.countDocuments({
    user: userId,
    realm,
    status: "completed",
  });

  return {
    total: totalQuests,
    completed: completedQuests,
    percentage: Math.round((completedQuests / totalQuests) * 100),
  };
};

questSchema.statics.getBossQuests = function (realm) {
  return this.find({ realm, questType: "boss", isActive: true }).sort({
    chapter: 1,
  });
};

module.exports = mongoose.model("Quest", questSchema);
