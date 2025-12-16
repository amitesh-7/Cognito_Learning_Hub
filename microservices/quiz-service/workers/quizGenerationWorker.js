/**
 * Quiz Generation Worker
 * Processes quiz generation jobs from Bull queue
 * Run this as a separate process: node workers/quizGenerationWorker.js
 */

const path = require("path");
const envPath = path.join(__dirname, "..", ".env");
const result = require("dotenv").config({ path: envPath });
const mongoose = require("mongoose");

const createLogger = require("../../shared/utils/logger");
const { quizGenerationQueue } = require("../services/queueManager");
const aiService = require("../services/aiService");
const cacheManager = require("../services/cacheManager");
const Quiz = require("../models/Quiz");

const logger = createLogger("quiz-worker");

// Initialize database connection (using direct mongoose like main service)
async function initialize() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI or MONGO_URI environment variable is not defined"
      );
    }

    await mongoose.connect(mongoUri);

    // Ping to verify connection is ready
    await mongoose.connection.db.admin().ping();

    logger.info("Worker MongoDB connected");
  } catch (error) {
    logger.error("Worker failed to connect to database:", error);
    process.exit(1);
  }
}

/**
 * Process quiz generation job with enhanced error handling
 */
quizGenerationQueue.process(
  parseInt(process.env.QUEUE_CONCURRENT_JOBS) || 3,
  async (job) => {
    const { method, userId, userRole, data } = job.data;

    logger.info(`Processing job ${job.id}: ${method} (Attempt ${job.attemptsMade + 1})`, { userId });

    try {
      let result;

      // Update progress
      await job.progress(10);

      switch (method) {
        case "topic":
          result = await processTopicGeneration(job, data);
          break;

        case "file":
          result = await processFileGeneration(job, data);
          break;

        default:
          throw new Error(`Unknown generation method: ${method}`);
      }

      // Increment user's generation count (only on first successful attempt)
      if (job.attemptsMade === 0) {
        await cacheManager.incrementUserGenerationCount(userId);
      }

      await job.progress(100);

      logger.info(`Job ${job.id} completed successfully on attempt ${job.attemptsMade + 1}`);
      return result;
    } catch (error) {
      const willRetry = job.attemptsMade + 1 < (parseInt(process.env.QUEUE_MAX_ATTEMPTS) || 5);
      logger.error(`Job ${job.id} failed on attempt ${job.attemptsMade + 1}${willRetry ? ' (will retry)' : ' (final)'}:`, {
        error: error.message,
        stack: error.stack?.substring(0, 500),
      });
      
      // Add error context to job for better debugging
      job.data.lastError = {
        message: error.message,
        attempt: job.attemptsMade + 1,
        timestamp: new Date().toISOString(),
      };
      
      throw error;
    }
  }
);

/**
 * Process topic-based quiz generation
 */
async function processTopicGeneration(job, data) {
  const {
    topic,
    numQuestions,
    difficulty,
    useAdaptive,
    userId,
    adaptiveContext,
  } = data;

  await job.progress(20);

  // Generate quiz with AI (includes automatic retry and fallback)
  const aiResult = await aiService.generateQuizFromTopic({
    topic,
    numQuestions,
    difficulty,
    useAdaptive,
    userId,
    adaptiveContext,
  });

  await job.progress(60);

  // Save to database
  const quiz = new Quiz({
    title: `AI Quiz: ${topic}${useAdaptive ? " (Adaptive)" : ""}`,
    description: `Auto-generated quiz about ${topic}`,
    questions: aiResult.questions,
    difficulty:
      useAdaptive && adaptiveContext?.suggestedDifficulty
        ? adaptiveContext.suggestedDifficulty
        : difficulty,
    category: "AI Generated",
    createdBy: userId,
    isPublic: data.isPublic !== undefined ? data.isPublic : true,
    generationMetadata: {
      method: "ai-topic",
      prompt: topic,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      apiKey: aiResult.apiKey || "unknown", // Track which API key was used
      wasAdaptive: useAdaptive,
      generatedAt: new Date(),
      generationTime: aiResult.generationTime,
      attempts: job.attemptsMade + 1,
    },
  });

  const savedQuiz = await quiz.save();

  await job.progress(90);

  logger.info(`Topic quiz saved: ${savedQuiz._id} (API Key: ${aiResult.apiKey || 'unknown'})`);

  return {
    success: true,
    quizId: savedQuiz._id,
    quiz: savedQuiz,
    fromCache: aiResult.fromCache,
    adaptiveInfo: aiResult.adaptiveInfo,
    generationTime: aiResult.generationTime,
    apiKey: aiResult.apiKey, // Return which API key was successful
  };
}

/**
 * Process file-based quiz generation
 */
async function processFileGeneration(job, data) {
  const {
    extractedText,
    fileName,
    numQuestions,
    difficulty,
    useAdaptive,
    userId,
    adaptiveContext,
  } = data;

  await job.progress(20);

  // Generate quiz with AI (includes automatic retry and fallback)
  const aiResult = await aiService.generateQuizFromFile({
    extractedText,
    numQuestions,
    difficulty,
    useAdaptive,
    userId,
    adaptiveContext,
    fileName,
  });

  await job.progress(60);

  // Save to database
  const quiz = new Quiz({
    title: `AI Quiz: ${fileName}${useAdaptive ? " (Adaptive)" : ""}`,
    description: `Auto-generated quiz from uploaded file: ${fileName}`,
    questions: aiResult.questions,
    difficulty:
      useAdaptive && adaptiveContext?.suggestedDifficulty
        ? adaptiveContext.suggestedDifficulty
        : difficulty,
    category: "AI Generated",
    createdBy: userId,
    isPublic: data.isPublic !== undefined ? data.isPublic : true,
    generationMetadata: {
      method: "ai-file",
      sourceFile: fileName,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      apiKey: aiResult.apiKey || "unknown", // Track which API key was used
      wasAdaptive: useAdaptive,
      generatedAt: new Date(),
      generationTime: aiResult.generationTime,
      attempts: job.attemptsMade + 1,
    },
  });

  const savedQuiz = await quiz.save();

  await job.progress(90);

  logger.info(`File quiz saved: ${savedQuiz._id} (API Key: ${aiResult.apiKey || 'unknown'})`);

  return {
    success: true,
    quizId: savedQuiz._id,
    quiz: savedQuiz,
    fromCache: aiResult.fromCache,
    adaptiveInfo: aiResult.adaptiveInfo,
    generationTime: aiResult.generationTime,
    apiKey: aiResult.apiKey, // Return which API key was successful
  };
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing worker gracefully");
  await quizGenerationQueue.close();
  await database.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, closing worker gracefully");
  await quizGenerationQueue.close();
  await database.disconnect();
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Initialize and start worker
initialize().then(() => {
  logger.info("Quiz generation worker started");
  logger.info(
    `Processing ${process.env.QUEUE_CONCURRENT_JOBS || 3} jobs concurrently`
  );
});
