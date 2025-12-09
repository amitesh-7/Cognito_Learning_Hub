const mongoose = require("mongoose");

const worldEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        "seasonal",
        "community_goal",
        "difficulty_wave",
        "raid_boss",
        "special",
      ],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Community Goal specific
    communityGoal: {
      targetQuizCount: Number,
      currentProgress: {
        type: Number,
        default: 0,
      },
      participants: {
        type: Number,
        default: 0,
      },
    },
    // Raid Boss specific
    raidBoss: {
      name: String,
      difficulty: {
        type: String,
        enum: ["Hard", "Expert", "Legendary"],
      },
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
      successCount: {
        type: Number,
        default: 0,
      },
      requiredSuccesses: Number,
      rewardMultiplier: {
        type: Number,
        default: 2,
      },
    },
    // Difficulty Wave specific
    difficultyWave: {
      baseMultiplier: {
        type: Number,
        default: 1.5,
      },
      affectedCategories: [String],
      waveIntensity: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
      },
    },
    // Rewards
    rewards: {
      xpMultiplier: {
        type: Number,
        default: 1,
      },
      bonusPoints: {
        type: Number,
        default: 0,
      },
      specialBadge: {
        name: String,
        icon: String,
      },
      exclusiveItems: [String],
    },
    // Event conditions
    conditions: {
      minLevel: {
        type: Number,
        default: 1,
      },
      requiredCategories: [String],
      minQuizzesCompleted: {
        type: Number,
        default: 0,
      },
    },
    // Analytics
    analytics: {
      totalParticipants: {
        type: Number,
        default: 0,
      },
      totalQuizzesCompleted: {
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
    },
    // Visual/Theme
    theme: {
      backgroundColor: String,
      iconUrl: String,
      bannerUrl: String,
    },
    metadata: {
      createdBy: String,
      tags: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
worldEventSchema.index({ startDate: 1, endDate: 1 });
worldEventSchema.index({ eventType: 1, isActive: 1 });
worldEventSchema.index({ "raidBoss.quizId": 1 });

// Methods
worldEventSchema.methods.checkEligibility = function (user) {
  if (!this.isActive) return { eligible: false, reason: "Event not active" };

  const now = new Date();
  if (now < this.startDate || now > this.endDate) {
    return { eligible: false, reason: "Event not in date range" };
  }

  if (user.level < this.conditions.minLevel) {
    return {
      eligible: false,
      reason: `Minimum level ${this.conditions.minLevel} required`,
    };
  }

  if (user.quizzesCompleted < this.conditions.minQuizzesCompleted) {
    return {
      eligible: false,
      reason: `Complete at least ${this.conditions.minQuizzesCompleted} quizzes`,
    };
  }

  return { eligible: true };
};

worldEventSchema.methods.updateProgress = async function (
  quizCompleted,
  score
) {
  if (this.eventType === "community_goal") {
    this.communityGoal.currentProgress += 1;
    this.analytics.totalQuizzesCompleted += 1;
  } else if (this.eventType === "raid_boss" && score >= 80) {
    this.raidBoss.successCount += 1;
  }

  this.analytics.totalParticipants += 1;
  this.analytics.averageScore =
    (this.analytics.averageScore * (this.analytics.totalQuizzesCompleted - 1) +
      score) /
    this.analytics.totalQuizzesCompleted;

  await this.save();
};

worldEventSchema.statics.getActiveEvents = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });
};

module.exports = mongoose.model("WorldEvent", worldEventSchema);
