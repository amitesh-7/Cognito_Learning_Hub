const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  socketId: {
    type: String, // Track current WebSocket connection
  },
  score: {
    type: Number,
    default: 0,
  },
  answers: [
    {
      questionIndex: {
        type: Number,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
      timeSpent: {
        type: Number, // in seconds
        required: true,
      },
      pointsEarned: {
        type: Number,
        default: 0,
      },
      answeredAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  leftAt: {
    type: Date,
  },
  disconnectedAt: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const LiveSessionSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostSocketId: {
      type: String, // Track host's WebSocket connection
    },
    status: {
      type: String,
      enum: ["waiting", "active", "paused", "completed", "cancelled"],
      default: "waiting",
    },
    currentQuestionIndex: {
      type: Number,
      default: -1, // -1 means quiz hasn't started
    },
    participants: [ParticipantSchema],
    settings: {
      timePerQuestion: {
        type: Number,
        default: 30, // seconds
      },
      showLeaderboardAfterEach: {
        type: Boolean,
        default: true,
      },
      allowLateJoin: {
        type: Boolean,
        default: false, // Don't allow joining after quiz starts
      },
      maxParticipants: {
        type: Number,
        default: 100,
      },
      showCorrectAnswers: {
        type: Boolean,
        default: true,
      },
    },
    questionStartTimes: [
      {
        questionIndex: Number,
        startedAt: Date,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    finalLeaderboard: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        username: String,
        avatar: String,
        score: Number,
        correctAnswers: Number,
        totalTime: Number,
        accuracy: Number,
        rank: Number,
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Expire after 24 hours
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding active sessions by host
LiveSessionSchema.index({ hostId: 1, status: 1 });

// Index for cleanup of expired sessions
LiveSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for participant count
LiveSessionSchema.virtual("participantCount").get(function () {
  return this.participants.filter((p) => p.isActive).length;
});

// Method to generate unique session code
LiveSessionSchema.statics.generateSessionCode = async function () {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like I, O, 0, 1
  let code;
  let exists = true;

  while (exists) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code already exists
    const existing = await this.findOne({ sessionCode: code });
    exists = !!existing;
  }

  return code;
};

// Method to add participant with retry logic
LiveSessionSchema.methods.addParticipant = async function (
  participantData,
  retries = 5
) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      // Get fresh document
      const session = await this.constructor.findById(this._id);

      if (!session) {
        throw new Error("Session not found");
      }

      // Check if user already joined
      const existingIndex = session.participants.findIndex(
        (p) => p.userId.toString() === participantData.userId.toString()
      );

      if (existingIndex !== -1) {
        // Update existing participant (rejoin scenario)
        session.participants[existingIndex].socketId = participantData.socketId;
        session.participants[existingIndex].isActive = true;
        session.participants[existingIndex].leftAt = undefined;
      } else {
        // Add new participant
        session.participants.push(participantData);
      }

      await session.save();

      // Update current instance
      this.participants = session.participants;
      this.__v = session.__v;

      return session;
    } catch (error) {
      if (error.name === "VersionError" && attempt < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 10)
        );
        attempt++;
        console.log(
          `[LiveSession] Retry attempt ${attempt} for adding participant`
        );
        continue;
      }
      throw error;
    }
  }
};

// Method to remove participant with retry logic
LiveSessionSchema.methods.removeParticipant = async function (
  userId,
  retries = 5
) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const session = await this.constructor.findById(this._id);

      if (!session) {
        throw new Error("Session not found");
      }

      const participant = session.participants.find(
        (p) => p.userId.toString() === userId.toString()
      );

      if (participant) {
        participant.isActive = false;
        participant.leftAt = new Date();
      }

      await session.save();

      this.participants = session.participants;
      this.__v = session.__v;

      return session;
    } catch (error) {
      if (error.name === "VersionError" && attempt < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 10)
        );
        attempt++;
        console.log(
          `[LiveSession] Retry attempt ${attempt} for removing participant`
        );
        continue;
      }
      throw error;
    }
  }
};

// Method to record answer with retry logic for concurrent updates
LiveSessionSchema.methods.recordAnswer = async function (
  userId,
  answerData,
  retries = 5
) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      // Find the fresh document to avoid version conflicts
      const session = await this.constructor.findById(this._id);

      if (!session) {
        throw new Error("Session not found");
      }

      const participant = session.participants.find(
        (p) => p.userId.toString() === userId.toString()
      );

      if (!participant) {
        throw new Error("Participant not found");
      }

      participant.answers.push(answerData);
      participant.score += answerData.pointsEarned;

      // Save with version check
      await session.save();

      // Update current instance with saved data
      this.participants = session.participants;
      this.__v = session.__v;

      return session;
    } catch (error) {
      if (error.name === "VersionError" && attempt < retries - 1) {
        // Exponential backoff: wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 10)
        );
        attempt++;
        console.log(
          `[LiveSession] Retry attempt ${attempt} for user ${userId}`
        );
        continue;
      }
      throw error;
    }
  }
};

// Method to get current leaderboard
LiveSessionSchema.methods.getLeaderboard = function () {
  return this.participants
    .filter((p) => p.isActive)
    .map((p) => {
      // Calculate timing and accuracy stats
      const totalTimeSpent = p.answers.reduce(
        (sum, a) => sum + (a.timeSpent || 0),
        0
      );
      const correctAnswersCount = p.answers.filter((a) => a.isCorrect).length;
      const avgTimePerQuestion =
        p.answers.length > 0 ? totalTimeSpent / p.answers.length : 0;
      const accuracy =
        p.answers.length > 0
          ? (correctAnswersCount / p.answers.length) * 100
          : 0;

      return {
        userId: p.userId,
        username: p.username,
        avatar: p.avatar,
        score: p.score,
        answersCount: p.answers.length,
        correctAnswers: correctAnswersCount,
        totalTimeSpent: totalTimeSpent,
        avgTimePerQuestion: avgTimePerQuestion,
        accuracy: accuracy,
      };
    })
    .sort((a, b) => {
      // Sort by score descending
      if (b.score !== a.score) return b.score - a.score;
      // If scores are equal, sort by time (faster is better)
      if (a.totalTimeSpent !== b.totalTimeSpent)
        return a.totalTimeSpent - b.totalTimeSpent;
      // If time is equal, sort by answers count
      return b.answersCount - a.answersCount;
    })
    .map((p, index) => ({
      ...p,
      rank: index + 1,
    }));
};

// Method to finalize session and save results
LiveSessionSchema.methods.finalizeSession = async function () {
  try {
    const Result = require("./Result");
    const Quiz = require("./Quiz");

    // Get final leaderboard
    const leaderboard = this.getLeaderboard();
    this.finalLeaderboard = leaderboard;
    this.status = "completed";
    this.endedAt = new Date();

    // Get quiz details
    const quiz = await Quiz.findById(this.quizId);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Create Result documents for each participant
    const resultPromises = this.participants
      .filter((p) => p.isActive && p.answers.length > 0)
      .map(async (participant) => {
        const correctAnswers = participant.answers.filter(
          (a) => a.isCorrect
        ).length;
        const totalTime = participant.answers.reduce(
          (sum, a) => sum + a.timeSpent,
          0
        );
        const percentage = (correctAnswers / quiz.questions.length) * 100;

        // Map participant answers to question results
        const questionResults = participant.answers.map((answer) => ({
          questionId: quiz.questions[answer.questionIndex]?._id,
          userAnswer: answer.answer,
          correctAnswer: quiz.questions[answer.questionIndex]?.correct_answer,
          isCorrect: answer.isCorrect,
          timeTaken: answer.timeSpent,
          pointsEarned: answer.pointsEarned,
          bonusPoints: 0,
        }));

        // Check if result already exists (update instead of create)
        const existingResult = await Result.findOne({
          user: participant.userId,
          quiz: this.quizId,
          createdAt: { $gte: this.createdAt }, // Only for this session
        });

        if (existingResult) {
          // Update existing result
          existingResult.score = correctAnswers;
          existingResult.pointsEarned = participant.score;
          existingResult.totalTimeTaken = totalTime;
          existingResult.averageTimePerQuestion =
            totalTime / participant.answers.length;
          existingResult.percentage = percentage;
          existingResult.passed = percentage >= (quiz.passingPercentage || 50);
          existingResult.questionResults = questionResults;
          existingResult.rank = this.getRankByPercentage(percentage);
          return await existingResult.save();
        } else {
          // Create new result
          return await Result.create({
            user: participant.userId,
            quiz: this.quizId,
            score: correctAnswers,
            totalQuestions: quiz.questions.length,
            pointsEarned: participant.score,
            bonusPoints: 0,
            totalTimeTaken: totalTime,
            averageTimePerQuestion: totalTime / participant.answers.length,
            percentage: percentage,
            passed: percentage >= (quiz.passingPercentage || 50),
            rank: this.getRankByPercentage(percentage),
            questionResults: questionResults,
            streakAtCompletion: 0,
            achievementsUnlocked: [],
            experienceGained: Math.floor(participant.score / 10),
          });
        }
      });

    await Promise.all(resultPromises);
    await this.save();

    return leaderboard;
  } catch (error) {
    console.error("[LiveSession] Error finalizing session:", error);
    throw error;
  }
};

// Helper method to determine rank based on percentage
LiveSessionSchema.methods.getRankByPercentage = function (percentage) {
  if (percentage >= 95) return "A+";
  if (percentage >= 90) return "A";
  if (percentage >= 85) return "B+";
  if (percentage >= 80) return "B";
  if (percentage >= 75) return "C+";
  if (percentage >= 70) return "C";
  if (percentage >= 65) return "D+";
  if (percentage >= 60) return "D";
  return "F";
};

module.exports = mongoose.model("LiveSession", LiveSessionSchema);
