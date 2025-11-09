const mongoose = require("mongoose");

const DuelMatchSchema = new mongoose.Schema(
  {
    // Match identification
    matchId: {
      type: String,
      required: true,
      unique: true,
    },

    // Quiz details
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    // Players
    player1: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      socketId: String,
      score: {
        type: Number,
        default: 0,
      },
      correctAnswers: {
        type: Number,
        default: 0,
      },
      totalTime: {
        type: Number,
        default: 0,
      },
      answers: [
        {
          questionIndex: Number,
          answer: String,
          isCorrect: Boolean,
          timeSpent: Number,
          timestamp: Date,
        },
      ],
      isReady: {
        type: Boolean,
        default: false,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },

    player2: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      socketId: String,
      score: {
        type: Number,
        default: 0,
      },
      correctAnswers: {
        type: Number,
        default: 0,
      },
      totalTime: {
        type: Number,
        default: 0,
      },
      answers: [
        {
          questionIndex: Number,
          answer: String,
          isCorrect: Boolean,
          timeSpent: Number,
          timestamp: Date,
        },
      ],
      isReady: {
        type: Boolean,
        default: false,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
    },

    // Match state
    status: {
      type: String,
      enum: ["waiting", "ready", "active", "completed", "cancelled"],
      default: "waiting",
    },

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    // Winner
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Timestamps
    startedAt: Date,
    completedAt: Date,

    // Settings
    timePerQuestion: {
      type: Number,
      default: 30,
    },

    // Auto-expire after 1 hour
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

// Index for matchmaking
DuelMatchSchema.index({ quizId: 1, status: 1 });
DuelMatchSchema.index({ "player1.userId": 1 });
DuelMatchSchema.index({ "player2.userId": 1 });
DuelMatchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate unique match ID
DuelMatchSchema.statics.generateMatchId = async function () {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let matchId;
  let exists = true;

  while (exists) {
    matchId = "";
    for (let i = 0; i < 8; i++) {
      matchId += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    const existing = await this.findOne({ matchId });
    exists = !!existing;
  }

  return matchId;
};

// Determine winner
DuelMatchSchema.methods.determineWinner = function () {
  const p1 = this.player1;
  const p2 = this.player2;

  // Priority 1: More correct answers
  if (p1.correctAnswers > p2.correctAnswers) {
    return this.player1.userId;
  } else if (p2.correctAnswers > p1.correctAnswers) {
    return this.player2.userId;
  }

  // Priority 2: Less total time (faster)
  if (p1.totalTime < p2.totalTime) {
    return this.player1.userId;
  } else if (p2.totalTime < p1.totalTime) {
    return this.player2.userId;
  }

  // Tie
  return null;
};

module.exports = mongoose.model("DuelMatch", DuelMatchSchema);
