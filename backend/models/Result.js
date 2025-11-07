const mongoose = require('mongoose');

  const QuestionResultSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId },
    userAnswer: { type: String },
    correctAnswer: { type: String },
    isCorrect: { type: Boolean },
    timeTaken: { type: Number }, // in seconds
    pointsEarned: { type: Number, default: 0 },
    bonusPoints: { type: Number, default: 0 } // Time bonus, streak bonus, etc.
  });

  const ResultSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    pointsEarned: { type: Number, default: 0 },
    bonusPoints: { type: Number, default: 0 },
    totalTimeTaken: { type: Number }, // in seconds
    averageTimePerQuestion: { type: Number },
    percentage: { type: Number },
    passed: { type: Boolean },
    rank: { type: String }, // A+, A, B+, B, etc.
    questionResults: [QuestionResultSchema],
    streakAtCompletion: { type: Number, default: 0 },
    achievementsUnlocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
    experienceGained: { type: Number, default: 0 }
  }, { timestamps: true });

  module.exports = mongoose.model('Result', ResultSchema);