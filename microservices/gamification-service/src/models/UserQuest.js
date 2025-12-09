const mongoose = require("mongoose");

const userQuestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questId: {
      type: String,
      required: true,
      index: true,
    },
    quest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quest",
      required: true,
    },

    // Quest State
    status: {
      type: String,
      enum: ["locked", "unlocked", "in_progress", "completed", "failed"],
      default: "locked",
      index: true,
    },
    realm: {
      type: String,
      required: true,
      index: true,
    },
    chapter: {
      type: Number,
      required: true,
    },

    // Progress Tracking
    attemptCount: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    bestTime: {
      type: Number,
      default: 0,
    },
    lastAttemptDate: Date,
    completedDate: Date,

    // Attempt History
    attempts: [
      {
        attemptNumber: Number,
        score: Number,
        maxScore: Number,
        percentage: Number,
        timeTaken: Number, // in seconds
        date: Date,
        resultId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Result",
        },
      },
    ],

    // Rewards Claimed
    rewardsClaimed: {
      xp: Number,
      gold: Number,
      items: [String], // item IDs
      abilities: [String], // ability IDs
      badges: [String], // badge IDs
      storyUnlocks: [String],
    },

    // Branching Path
    branchTaken: {
      condition: String,
      nextQuestId: String,
      specialReward: String,
    },

    // NPC Interactions
    npcDialoguesSeen: [String], // dialogue types seen
    npcHintsUsed: {
      type: Number,
      default: 0,
    },

    // Stars Earned (1-3 based on performance)
    stars: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
userQuestSchema.index({ user: 1, questId: 1 }, { unique: true });
userQuestSchema.index({ user: 1, realm: 1, status: 1 });
userQuestSchema.index({ user: 1, status: 1 });

// Methods
userQuestSchema.methods.addAttempt = function (
  score,
  maxScore,
  timeTaken,
  resultId
) {
  const percentage = Math.round((score / maxScore) * 100);
  const attemptNumber = this.attemptCount + 1;

  // Add to attempts history
  this.attempts.push({
    attemptNumber,
    score,
    maxScore,
    percentage,
    timeTaken,
    date: new Date(),
    resultId,
  });

  // Update best scores
  if (score > this.bestScore) {
    this.bestScore = score;
  }
  if (this.bestTime === 0 || timeTaken < this.bestTime) {
    this.bestTime = timeTaken;
  }

  // Update attempt count
  this.attemptCount = attemptNumber;
  this.lastAttemptDate = new Date();

  // Calculate stars
  this.stars = this.calculateStars(percentage);

  // Update status
  if (percentage >= 60) {
    this.status = "completed";
    this.completedDate = new Date();
  } else if (this.status !== "completed") {
    this.status = "in_progress";
  }

  return {
    attemptNumber,
    percentage,
    stars: this.stars,
    completed: this.status === "completed",
  };
};

userQuestSchema.methods.calculateStars = function (percentage) {
  if (percentage >= 90) return 3;
  if (percentage >= 75) return 2;
  if (percentage >= 60) return 1;
  return 0;
};

userQuestSchema.methods.claimRewards = function (questRewards) {
  if (!this.rewardsClaimed) {
    this.rewardsClaimed = {
      xp: 0,
      gold: 0,
      items: [],
      abilities: [],
      badges: [],
      storyUnlocks: [],
    };
  }

  // Add rewards
  this.rewardsClaimed.xp += questRewards.xp;
  this.rewardsClaimed.gold += questRewards.gold;

  // Add items (no duplicates)
  if (questRewards.items) {
    questRewards.items.forEach((item) => {
      if (!this.rewardsClaimed.items.includes(item.itemId)) {
        this.rewardsClaimed.items.push(item.itemId);
      }
    });
  }

  // Add abilities
  if (questRewards.abilities) {
    questRewards.abilities.forEach((ability) => {
      if (!this.rewardsClaimed.abilities.includes(ability.abilityId)) {
        this.rewardsClaimed.abilities.push(ability.abilityId);
      }
    });
  }

  // Add badges
  if (questRewards.badges) {
    questRewards.badges.forEach((badge) => {
      if (!this.rewardsClaimed.badges.includes(badge.badgeId)) {
        this.rewardsClaimed.badges.push(badge.badgeId);
      }
    });
  }

  // Add story unlocks
  if (questRewards.storyUnlocks) {
    questRewards.storyUnlocks.forEach((unlock) => {
      if (!this.rewardsClaimed.storyUnlocks.includes(unlock)) {
        this.rewardsClaimed.storyUnlocks.push(unlock);
      }
    });
  }

  return this.rewardsClaimed;
};

// Static methods
userQuestSchema.statics.getRealmProgress = async function (userId, realm) {
  const quests = await this.find({ user: userId, realm });

  const total = quests.length;
  const completed = quests.filter((q) => q.status === "completed").length;
  const inProgress = quests.filter((q) => q.status === "in_progress").length;
  const totalStars = quests.reduce((sum, q) => sum + q.stars, 0);
  const maxStars = total * 3;

  return {
    total,
    completed,
    inProgress,
    locked: total - completed - inProgress,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    stars: totalStars,
    maxStars,
  };
};

userQuestSchema.statics.getNextAvailableQuest = async function (
  userId,
  realm,
  completedQuestIds
) {
  const Quest = mongoose.model("Quest");

  // Get all realm quests
  const allQuests = await Quest.find({ realm, isActive: true }).sort({
    chapter: 1,
    questNumber: 1,
  });

  // Find first quest that meets prerequisites
  for (const quest of allQuests) {
    // Check if already completed
    if (completedQuestIds.includes(quest.questId)) continue;

    // Check prerequisites
    if (quest.checkPrerequisites(completedQuestIds)) {
      return quest;
    }
  }

  return null;
};

module.exports = mongoose.model("UserQuest", userQuestSchema);
