/**
 * Input Validation Middleware using Joi
 * Validates request body, query params, and URL params
 */

const Joi = require("joi");

/**
 * Generic validation middleware
 */
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    // Replace request data with validated/sanitized data
    req[property] = value;
    next();
  };
};

// ============ Common Validation Schemas ============

/**
 * User Registration Schema
 */
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.alphanum": "Username must only contain alphanumeric characters",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username cannot exceed 30 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, and special character",
    }),
  role: Joi.string().valid("Student", "Teacher").default("Student"),
});

/**
 * Login Schema
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/**
 * Quiz Creation Schema
 */
const quizSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(1000),
  category: Joi.string()
    .valid(
      "Programming",
      "Mathematics",
      "Science",
      "History",
      "Geography",
      "General Knowledge",
      "Other"
    )
    .required(),
  difficulty: Joi.string().valid("easy", "medium", "hard").default("medium"),
  timeLimit: Joi.number().min(60).max(7200).default(1800), // 1 min to 2 hours
  passingScore: Joi.number().min(0).max(100).default(70),
  questions: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().min(10).max(2000).required(),
        type: Joi.string()
          .valid("mcq", "code", "reasoning", "scenario")
          .default("mcq"),
        options: Joi.array()
          .items(Joi.string().max(500))
          .min(2)
          .max(6)
          .when("type", {
            is: "mcq",
            then: Joi.required(),
            otherwise: Joi.optional(),
          }),
        correctAnswer: Joi.when("type", {
          is: "mcq",
          then: Joi.string().required(),
          otherwise: Joi.optional(),
        }),
        points: Joi.number().min(1).max(100).default(10),
        explanation: Joi.string().max(1000),
        // Advanced question fields
        language: Joi.string().when("type", {
          is: "code",
          then: Joi.valid(
            "javascript",
            "python",
            "java",
            "cpp",
            "c"
          ).required(),
          otherwise: Joi.optional(),
        }),
        starterCode: Joi.string().max(5000),
        testCases: Joi.array().items(
          Joi.object({
            input: Joi.string().allow("").max(10000),
            expectedOutput: Joi.string().max(10000).required(),
            isHidden: Joi.boolean().default(false),
          })
        ),
      })
    )
    .min(1)
    .max(100)
    .required(),
  isPublic: Joi.boolean().default(true),
  tags: Joi.array().items(Joi.string().max(50)).max(10),
});

/**
 * Code Execution Schema
 */
const codeExecutionSchema = Joi.object({
  code: Joi.string().min(1).max(50000).required(),
  language: Joi.string()
    .valid("javascript", "python", "java", "cpp", "c")
    .required(),
  testCases: Joi.array()
    .items(
      Joi.object({
        input: Joi.string().allow("").max(10000),
        expectedOutput: Joi.string().max(10000).required(),
      })
    )
    .min(1)
    .max(50)
    .required(),
});

/**
 * Quiz Submission Schema
 */
const quizSubmissionSchema = Joi.object({
  quizId: Joi.string().length(24).required(), // MongoDB ObjectId
  answers: Joi.array()
    .items(
      Joi.object({
        questionIndex: Joi.number().min(0).required(),
        answer: Joi.alternatives().try(Joi.string().max(10000), Joi.object()),
        timeTaken: Joi.number().min(0),
      })
    )
    .min(1)
    .required(),
  totalTime: Joi.number().min(0).required(),
});

/**
 * Reasoning Evaluation Schema
 */
const reasoningEvaluationSchema = Joi.object({
  question: Joi.string().min(10).max(2000).required(),
  userAnswer: Joi.string().valid("A", "B", "C", "D").required(),
  explanation: Joi.string().min(10).max(5000).required(),
  correctAnswer: Joi.string().valid("A", "B", "C", "D").required(),
  options: Joi.object({
    A: Joi.string().required(),
    B: Joi.string().required(),
    C: Joi.string().required(),
    D: Joi.string().required(),
  }).required(),
});

/**
 * World Event Schema
 */
const worldEventSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(1000).required(),
  eventType: Joi.string()
    .valid("global_challenge", "speed_battle", "marathon", "tournament")
    .required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
  quizIds: Joi.array().items(Joi.string().length(24)).min(1).required(),
  rewardPool: Joi.object({
    totalXP: Joi.number().min(100).required(),
    distribution: Joi.object({
      first: Joi.number().min(0).max(100).required(),
      second: Joi.number().min(0).max(100).required(),
      third: Joi.number().min(0).max(100).required(),
    }).required(),
  }),
  requirements: Joi.object({
    minLevel: Joi.number().min(0).default(0),
    targetScore: Joi.number().min(0).max(100),
  }),
});

/**
 * Quest Schema
 */
const questSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(1000).required(),
  realm: Joi.string()
    .valid(
      "Algorithmic Valley",
      "Web Wizardry",
      "Data Kingdom",
      "AI Sanctuary",
      "System Fortress",
      "Security Citadel",
      "Cloud Highlands"
    )
    .required(),
  chapter: Joi.string().required(),
  difficulty: Joi.string()
    .valid("easy", "medium", "hard", "expert")
    .default("medium"),
  rewards: Joi.object({
    xp: Joi.number().min(10).required(),
    coins: Joi.number().min(1).required(),
    items: Joi.array().items(Joi.string().max(100)),
  }).required(),
  requirements: Joi.object({
    minLevel: Joi.number().min(0).default(0),
    prerequisiteQuests: Joi.array().items(Joi.string()),
  }),
});

/**
 * Pagination Schema
 */
const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  sort: Joi.string().valid("createdAt", "-createdAt", "title", "-title"),
});

/**
 * MongoDB ObjectId Schema
 */
const objectIdSchema = Joi.object({
  id: Joi.string()
    .length(24)
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid ID format",
    }),
});

// ============ Export Validation Middleware ============

module.exports = {
  validate,
  // Schemas
  registerSchema,
  loginSchema,
  quizSchema,
  codeExecutionSchema,
  quizSubmissionSchema,
  reasoningEvaluationSchema,
  worldEventSchema,
  questSchema,
  paginationSchema,
  objectIdSchema,
  // Middleware shortcuts
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateQuiz: validate(quizSchema),
  validateCodeExecution: validate(codeExecutionSchema),
  validateQuizSubmission: validate(quizSubmissionSchema),
  validateReasoningEvaluation: validate(reasoningEvaluationSchema),
  validateWorldEvent: validate(worldEventSchema),
  validateQuest: validate(questSchema),
  validatePagination: validate(paginationSchema, "query"),
  validateObjectId: validate(objectIdSchema, "params"),
};
