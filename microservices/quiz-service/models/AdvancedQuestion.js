const mongoose = require("mongoose");

// Extended question schema for advanced question types
const AdvancedQuestionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    questionIndex: {
      type: Number,
      required: true,
    },
    // Question type
    advancedType: {
      type: String,
      enum: [
        "explain-reasoning",
        "code-challenge",
        "scenario-based",
        "time-travel",
      ],
      required: true,
    },

    // Explain-Your-Reasoning specific fields
    reasoningConfig: {
      requireExplanation: {
        type: Boolean,
        default: true,
      },
      minWords: {
        type: Number,
        default: 20,
      },
      maxWords: {
        type: Number,
        default: 200,
      },
      evaluationCriteria: [
        {
          criterion: String, // e.g., "mentions wavelength", "explains concept"
          weight: Number, // 0-1
          keywords: [String],
        },
      ],
      sampleExplanation: String,
    },

    // Code Challenge specific fields
    codeConfig: {
      language: {
        type: String,
        enum: ["python", "javascript", "java", "cpp", "c"],
        default: "python",
      },
      starterCode: String,
      testCases: [
        {
          input: mongoose.Schema.Types.Mixed,
          expectedOutput: mongoose.Schema.Types.Mixed,
          isHidden: {
            type: Boolean,
            default: false,
          },
          points: {
            type: Number,
            default: 1,
          },
          description: String,
        },
      ],
      timeLimit: {
        type: Number,
        default: 5000, // ms
      },
      memoryLimit: {
        type: Number,
        default: 128, // MB
      },
      hints: [String],
      solution: String,
      codeQualityChecks: {
        checkComplexity: Boolean,
        checkStyle: Boolean,
        checkEfficiency: Boolean,
      },
    },

    // Scenario-Based specific fields
    scenarioConfig: {
      initialState: mongoose.Schema.Types.Mixed,
      decisions: [
        {
          decisionPoint: String,
          description: String,
          options: [
            {
              text: String,
              outcome: {
                stateChanges: mongoose.Schema.Types.Mixed,
                feedback: String,
                points: Number,
              },
              nextDecisionIndex: Number, // -1 for end
            },
          ],
        },
      ],
      successCriteria: mongoose.Schema.Types.Mixed,
      visualAssets: {
        backgroundImage: String,
        characterSprites: [String],
      },
    },

    // Time-Travel specific fields
    timeTravelConfig: {
      originalQuestionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdvancedQuestion",
      },
      previousAttemptDate: Date,
      previousAnswer: String,
      previousScore: Number,
      improvementHints: [String],
      similarityLevel: {
        type: String,
        enum: ["identical", "similar", "related", "different-context"],
        default: "similar",
      },
    },

    // Common fields
    title: String,
    description: String,
    points: {
      type: Number,
      default: 10,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Expert"],
      default: "Medium",
    },
    tags: [String],

    // Analytics
    analytics: {
      attemptsCount: {
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
      explanationQualityAvg: Number, // For reasoning questions
      testCasePassRates: [Number], // For code challenges
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AdvancedQuestionSchema.index({ quizId: 1, questionIndex: 1 });
AdvancedQuestionSchema.index({ advancedType: 1 });
AdvancedQuestionSchema.index({ "timeTravelConfig.originalQuestionId": 1 });

// Methods
AdvancedQuestionSchema.methods.validateAnswer = async function (
  userAnswer,
  userExplanation,
  userCode
) {
  const result = {
    correct: false,
    score: 0,
    maxScore: this.points,
    feedback: "",
    details: {},
  };

  switch (this.advancedType) {
    case "explain-reasoning":
      // Will be evaluated by AI service
      result.requiresAIEvaluation = true;
      result.explanationText = userExplanation;
      break;

    case "code-challenge":
      result.requiresCodeExecution = true;
      result.code = userCode;
      result.language = this.codeConfig.language;
      result.testCases = this.codeConfig.testCases;
      break;

    case "scenario-based":
      // Score based on decisions made
      result.details = userAnswer; // Will contain decision path
      break;

    case "time-travel":
      result.details = {
        previousAnswer: this.timeTravelConfig.previousAnswer,
        previousScore: this.timeTravelConfig.previousScore,
        currentAnswer: userAnswer,
      };
      break;
  }

  return result;
};

module.exports = mongoose.model("AdvancedQuestion", AdvancedQuestionSchema);
