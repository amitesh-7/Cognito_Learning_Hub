/**
 * AI Generation Service with Circuit Breaker, Caching, and API Key Fallback
 * Enhanced with: Multiple API key fallback, Smart retry logic, Better error handling
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const CircuitBreaker = require("opossum");
const crypto = require("crypto");
const createLogger = require("../../shared/utils/logger");
const cacheManager = require("./cacheManager");

const logger = createLogger("ai-service");

// API Key Management with Fallback
class APIKeyManager {
  constructor() {
    this.keys = [];
    this.currentKeyIndex = 0;
    this.keyHealthStatus = new Map(); // Track health of each key
    this.loadAPIKeys();
  }

  loadAPIKeys() {
    // Primary API key
    if (process.env.GOOGLE_API_KEY) {
      this.keys.push({
        key: process.env.GOOGLE_API_KEY,
        name: "PRIMARY",
        priority: 0
      });
      this.keyHealthStatus.set("PRIMARY", { healthy: true, lastError: null, errorCount: 0 });
    }

    // Fallback API keys
    if (process.env.GOOGLE_API_KEY_FALLBACK_1) {
      this.keys.push({
        key: process.env.GOOGLE_API_KEY_FALLBACK_1,
        name: "FALLBACK_1",
        priority: 1
      });
      this.keyHealthStatus.set("FALLBACK_1", { healthy: true, lastError: null, errorCount: 0 });
    }

    if (process.env.GOOGLE_API_KEY_FALLBACK_2) {
      this.keys.push({
        key: process.env.GOOGLE_API_KEY_FALLBACK_2,
        name: "FALLBACK_2",
        priority: 2
      });
      this.keyHealthStatus.set("FALLBACK_2", { healthy: true, lastError: null, errorCount: 0 });
    }

    if (this.keys.length === 0) {
      logger.error("No GOOGLE_API_KEY configured!");
      throw new Error("At least one GOOGLE_API_KEY is required");
    }

    logger.info(`Loaded ${this.keys.length} API key(s) for fallback support`);
  }

  getCurrentKey() {
    if (this.keys.length === 0) return null;
    return this.keys[this.currentKeyIndex];
  }

  markKeyUnhealthy(keyName, error) {
    const status = this.keyHealthStatus.get(keyName);
    if (status) {
      status.healthy = false;
      status.lastError = error.message;
      status.errorCount++;
      logger.warn(`API Key ${keyName} marked unhealthy. Error count: ${status.errorCount}`);
    }
  }

  markKeyHealthy(keyName) {
    const status = this.keyHealthStatus.get(keyName);
    if (status) {
      status.healthy = true;
      status.errorCount = 0;
      logger.info(`API Key ${keyName} marked healthy`);
    }
  }

  switchToNextKey() {
    const startIndex = this.currentKeyIndex;
    
    // Try to find a healthy key
    for (let i = 0; i < this.keys.length; i++) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
      const key = this.keys[this.currentKeyIndex];
      const status = this.keyHealthStatus.get(key.name);
      
      if (status && status.healthy) {
        logger.info(`Switched to API Key: ${key.name}`);
        return key;
      }
    }

    // If no healthy key found, return to start and try anyway
    this.currentKeyIndex = startIndex;
    logger.warn("No healthy API keys available, retrying with all keys");
    return this.keys[this.currentKeyIndex];
  }

  getHealthStatus() {
    return {
      currentKey: this.keys[this.currentKeyIndex].name,
      totalKeys: this.keys.length,
      healthStatus: Array.from(this.keyHealthStatus.entries()).map(([name, status]) => ({
        name,
        healthy: status.healthy,
        errorCount: status.errorCount,
        lastError: status.lastError
      }))
    };
  }
}

// Initialize API Key Manager
const apiKeyManager = new APIKeyManager();

// Initialize Google Gemini AI with current key
function getAIModel() {
  const currentKey = apiKeyManager.getCurrentKey();
  if (!currentKey) {
    throw new Error("No API key available");
  }
  
  const genAI = new GoogleGenerativeAI(currentKey.key);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });
}

/**
 * Core AI generation function with enhanced retry and fallback logic
 */
async function generateQuizWithAI(prompt, retryCount = 0) {
  const maxRetries = parseInt(process.env.AI_MAX_RETRIES) || 5;
  const retryDelay = parseInt(process.env.AI_RETRY_DELAY) || 2000;
  
  try {
    const startTime = Date.now();
    const currentKey = apiKeyManager.getCurrentKey();

    logger.info(`AI generation attempt ${retryCount + 1}/${maxRetries + 1} using key: ${currentKey.name}`);

    const model = getAIModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const duration = Date.now() - startTime;
    logger.info(`AI generation completed in ${duration}ms using ${currentKey.name}`);

    // Mark key as healthy on success
    apiKeyManager.markKeyHealthy(currentKey.name);

    return { text, duration, apiKey: currentKey.name };
  } catch (error) {
    const currentKey = apiKeyManager.getCurrentKey();
    logger.error(`AI generation failed on attempt ${retryCount + 1} with ${currentKey.name}:`, error.message);

    // Categorize error types
    const errorType = categorizeError(error);
    
    // Handle different error types
    if (errorType === 'RATE_LIMIT' || errorType === 'QUOTA_EXCEEDED') {
      logger.warn(`${errorType} error detected, switching API key...`);
      apiKeyManager.markKeyUnhealthy(currentKey.name, error);
      
      // Try switching to next available key
      const nextKey = apiKeyManager.switchToNextKey();
      if (nextKey && nextKey.name !== currentKey.name && retryCount < maxRetries) {
        await sleep(retryDelay);
        return generateQuizWithAI(prompt, retryCount + 1);
      }
    }

    // For transient errors, retry with exponential backoff
    if (errorType === 'TIMEOUT' || errorType === 'NETWORK' || errorType === 'SERVER_ERROR') {
      if (retryCount < maxRetries) {
        const backoffDelay = retryDelay * Math.pow(2, retryCount);
        logger.info(`Retrying in ${backoffDelay}ms due to ${errorType}...`);
        await sleep(backoffDelay);
        return generateQuizWithAI(prompt, retryCount + 1);
      }
    }

    // Mark current key as potentially unhealthy
    if (errorType !== 'INVALID_INPUT' && errorType !== 'CONTENT_FILTER') {
      apiKeyManager.markKeyUnhealthy(currentKey.name, error);
    }

    // All retries exhausted
    throw error;
  }
}

/**
 * Categorize error for appropriate handling
 */
function categorizeError(error) {
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('rate limit') || message.includes('429')) {
    return 'RATE_LIMIT';
  }
  if (message.includes('quota') || message.includes('exceeded')) {
    return 'QUOTA_EXCEEDED';
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'TIMEOUT';
  }
  if (message.includes('network') || message.includes('econnrefused') || message.includes('enotfound')) {
    return 'NETWORK';
  }
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return 'SERVER_ERROR';
  }
  if (message.includes('invalid') || message.includes('400')) {
    return 'INVALID_INPUT';
  }
  if (message.includes('content') || message.includes('safety')) {
    return 'CONTENT_FILTER';
  }
  
  return 'UNKNOWN';
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Circuit Breaker Configuration
 * - Increased timeout for large PDF files (180s for complex content)
 * - Faster recovery (60s reset timeout)
 * - More tolerant error threshold for temporary issues
 */
const circuitBreakerOptions = {
  timeout: parseInt(process.env.AI_TIMEOUT) || 180000, // 180 seconds (3 minutes for large files/complex generation)
  errorThresholdPercentage: 60, // Open circuit if 60% of requests fail (more tolerant)
  resetTimeout: parseInt(process.env.AI_CIRCUIT_BREAKER_TIMEOUT) || 60000, // 60 seconds (faster recovery)
  rollingCountTimeout: 30000, // 30 second rolling window (increased for slower operations)
  rollingCountBuckets: 10,
  volumeThreshold: 3, // Need at least 3 requests before opening circuit
  name: "AI Generation Circuit Breaker",
};

// Wrap AI generation in circuit breaker
const protectedAIGeneration = new CircuitBreaker(
  generateQuizWithAI,
  circuitBreakerOptions
);

// Circuit breaker event listeners
protectedAIGeneration.on("open", () => {
  logger.error("Circuit breaker OPENED - AI service experiencing issues, attempting fallback keys");
  // When circuit opens, try to switch to a different API key
  apiKeyManager.switchToNextKey();
});

protectedAIGeneration.on("halfOpen", () => {
  logger.warn("Circuit breaker HALF-OPEN - Testing AI service with current key");
});

protectedAIGeneration.on("close", () => {
  logger.info("Circuit breaker CLOSED - AI service restored");
  const currentKey = apiKeyManager.getCurrentKey();
  apiKeyManager.markKeyHealthy(currentKey.name);
});

protectedAIGeneration.on("timeout", () => {
  logger.warn("AI generation TIMEOUT - Request exceeded time limit");
  const currentKey = apiKeyManager.getCurrentKey();
  apiKeyManager.markKeyUnhealthy(currentKey.name, new Error("Timeout"));
});

protectedAIGeneration.on("failure", (error) => {
  logger.error("AI generation FAILURE:", error.message);
});

// Enhanced fallback with API key rotation
protectedAIGeneration.fallback(async (prompt) => {
  logger.error("Circuit breaker FALLBACK triggered - Attempting with alternate API keys");
  
  // Try all available keys one more time
  const originalKeyIndex = apiKeyManager.currentKeyIndex;
  const totalKeys = apiKeyManager.keys.length;
  
  for (let i = 0; i < totalKeys; i++) {
    try {
      apiKeyManager.switchToNextKey();
      const currentKey = apiKeyManager.getCurrentKey();
      logger.info(`Fallback attempt ${i + 1}/${totalKeys} with key: ${currentKey.name}`);
      
      // Try direct generation bypassing circuit breaker
      const result = await generateQuizWithAI(prompt, 0);
      logger.info(`Fallback successful with ${currentKey.name}`);
      return result;
    } catch (error) {
      logger.warn(`Fallback failed with key attempt ${i + 1}:`, error.message);
      if (i === totalKeys - 1) {
        // Last attempt failed
        throw new Error(
          "AI service is currently unavailable across all API keys. Please try again later."
        );
      }
    }
  }
  
  // Restore original key index if all failed
  apiKeyManager.currentKeyIndex = originalKeyIndex;
  throw new Error(
    "AI service is currently unavailable. Please try again later."
  );
});

/**
 * Extract JSON from AI response (handles markdown formatting)
 */
function extractJson(text) {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to find array in text
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }

    throw new Error("Could not extract valid JSON from AI response");
  }
}

/**
 * Generate file hash for cache key
 */
function generateFileHash(content) {
  return crypto.createHash("md5").update(content).digest("hex");
}

/**
 * Build AI prompt for topic-based quiz
 */
function buildTopicPrompt(
  topic,
  numQuestions,
  difficulty,
  adaptiveContext = null
) {
  let prompt = `You are an expert quiz maker.
Create a quiz based on the following topic: "${topic}".
The quiz should have ${numQuestions} questions.
The difficulty level should be ${difficulty}.`;

  // Add adaptive context if available
  if (adaptiveContext) {
    prompt += `\n\nADAPTIVE MODE CONTEXT:
- User's average score: ${adaptiveContext.avgScore?.toFixed(1)}%
- Performance trend: ${adaptiveContext.trend}`;

    if (adaptiveContext.weakAreas && adaptiveContext.weakAreas.length > 0) {
      prompt += `\n- Weak areas to focus on: ${adaptiveContext.weakAreas.join(
        ", "
      )}`;
    }

    prompt += `\n\nPlease tailor the questions to help this user improve, maintaining ${difficulty} difficulty.`;
  }

  prompt += `\n\nIMPORTANT: Your response MUST be a valid JSON array. Do not include any text, explanation, or markdown formatting.
The JSON should be an array of question objects with this exact structure:
[
  {
    "question": "Your question here",
    "type": "multiple-choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "The correct option text",
    "explanation": "Brief explanation of the answer",
    "points": 1,
    "timeLimit": 30,
    "difficulty": "${difficulty}"
  }
]`;

  return prompt;
}

/**
 * Build AI prompt for file-based quiz
 */
function buildFilePrompt(
  extractedText,
  numQuestions,
  difficulty,
  adaptiveContext = null
) {
  let prompt = `You are an expert quiz maker.
Create ${numQuestions} questions at ${difficulty} difficulty level based on the following content:

---
${extractedText.substring(0, 8000)}
---`;

  // Add adaptive context if available
  if (adaptiveContext) {
    prompt += `\n\nIMPORTANT CONTEXT: This quiz is for a user with:
- Average performance: ${adaptiveContext.avgScore?.toFixed(1)}%
- Performance trend: ${adaptiveContext.trend}`;

    if (adaptiveContext.weakAreas && adaptiveContext.weakAreas.length > 0) {
      prompt += `\n- Weak areas: ${adaptiveContext.weakAreas.join(", ")}`;
    }

    prompt += `\n\nAdjust the difficulty and focus accordingly.`;
  }

  prompt += `\n\nIMPORTANT: Your response MUST be a valid JSON array with the following structure:
[
  {
    "question": "Question text",
    "type": "multiple-choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Correct option",
    "explanation": "Brief explanation",
    "points": 1,
    "timeLimit": 30,
    "difficulty": "${difficulty}"
  }
]`;

  return prompt;
}

/**
 * Generate quiz from topic (with caching)
 */
async function generateQuizFromTopic({
  topic,
  numQuestions = 5,
  difficulty = "Medium",
  useAdaptive = false,
  userId = null,
  adaptiveContext = null,
}) {
  try {
    // Check cache first
    const cacheKey = cacheManager.getTopicQuizKey(
      topic,
      numQuestions,
      difficulty,
      useAdaptive
    );
    const cached = await cacheManager.getCachedQuiz(cacheKey);

    if (cached) {
      logger.info(`Returning cached quiz for topic: ${topic}`);
      return {
        questions: cached.questions,
        fromCache: true,
        cacheKey,
        adaptiveInfo: cached.adaptiveInfo,
      };
    }

    // Build prompt
    const prompt = buildTopicPrompt(
      topic,
      numQuestions,
      difficulty,
      adaptiveContext
    );

    // Generate with circuit breaker protection
    const { text, duration } = await protectedAIGeneration.fire(prompt);

    // Extract and parse questions
    const questions = extractJson(text);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI did not return valid questions array");
    }

    // Prepare result
    const result = {
      questions,
      fromCache: false,
      generationTime: duration,
      adaptiveInfo:
        useAdaptive && adaptiveContext
          ? {
              originalDifficulty: difficulty,
              adaptedDifficulty:
                adaptiveContext.suggestedDifficulty || difficulty,
              reason: adaptiveContext.reason,
              avgScore: adaptiveContext.avgScore,
              trend: adaptiveContext.trend,
            }
          : null,
    };

    // Cache for future use
    await cacheManager.cacheQuiz(cacheKey, result, cacheManager.QUIZ_CACHE_TTL);

    logger.info(`Generated and cached quiz for topic: ${topic}`);
    return result;
  } catch (error) {
    logger.error(`Failed to generate quiz from topic: ${topic}`, error);
    throw error;
  }
}

/**
 * Generate quiz from file content (with caching)
 */
async function generateQuizFromFile({
  extractedText,
  numQuestions = 5,
  difficulty = "Medium",
  useAdaptive = false,
  userId = null,
  adaptiveContext = null,
  fileName = "unknown",
}) {
  try {
    // Generate file hash for cache key
    const fileHash = generateFileHash(extractedText);
    const cacheKey = cacheManager.getFileQuizKey(
      fileHash,
      numQuestions,
      difficulty
    );

    // Check cache first
    const cached = await cacheManager.getCachedQuiz(cacheKey);

    if (cached) {
      logger.info(`Returning cached quiz for file: ${fileName}`);
      return {
        questions: cached.questions,
        fromCache: true,
        cacheKey,
        adaptiveInfo: cached.adaptiveInfo,
      };
    }

    // Build prompt
    const prompt = buildFilePrompt(
      extractedText,
      numQuestions,
      difficulty,
      adaptiveContext
    );

    // Generate with circuit breaker protection
    const { text, duration } = await protectedAIGeneration.fire(prompt);

    // Extract and parse questions
    const questions = extractJson(text);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI did not return valid questions array");
    }

    // Prepare result
    const result = {
      questions,
      fromCache: false,
      generationTime: duration,
      adaptiveInfo:
        useAdaptive && adaptiveContext
          ? {
              originalDifficulty: difficulty,
              adaptedDifficulty:
                adaptiveContext.suggestedDifficulty || difficulty,
              reason: adaptiveContext.reason,
              avgScore: adaptiveContext.avgScore,
            }
          : null,
    };

    // Cache for longer (files are more stable content)
    await cacheManager.cacheQuiz(
      cacheKey,
      result,
      cacheManager.FILE_QUIZ_CACHE_TTL
    );

    logger.info(`Generated and cached quiz for file: ${fileName}`);
    return result;
  } catch (error) {
    logger.error(`Failed to generate quiz from file: ${fileName}`, error);
    throw error;
  }
}

/**
 * Get circuit breaker stats and API key health
 */
function getCircuitBreakerStats() {
  return {
    circuitBreaker: {
      state: protectedAIGeneration.opened
        ? "OPEN"
        : protectedAIGeneration.halfOpen
        ? "HALF-OPEN"
        : "CLOSED",
      stats: protectedAIGeneration.stats,
      options: {
        timeout: circuitBreakerOptions.timeout,
        errorThreshold: circuitBreakerOptions.errorThresholdPercentage,
        resetTimeout: circuitBreakerOptions.resetTimeout,
      },
    },
    apiKeys: apiKeyManager.getHealthStatus(),
  };
}

/**
 * Generate content from prompt (for doubt solver)
 */
async function generateContent(prompt) {
  try {
    const result = await protectedAIGeneration.fire(prompt);
    return result;
  } catch (error) {
    logger.error("Content generation error:", error);
    throw error;
  }
}

/**
 * Generate questions from prompt (for legacy routes)
 * Returns parsed questions array
 */
async function generateQuestions(prompt) {
  try {
    const result = await protectedAIGeneration.fire(prompt);
    const questions = extractJson(result.text);
    return questions;
  } catch (error) {
    logger.error("Question generation error:", error);
    throw error;
  }
}

module.exports = {
  generateQuizFromTopic,
  generateQuizFromFile,
  generateContent,
  generateQuestions,
  extractJson,
  generateFileHash,
  getCircuitBreakerStats,
  protectedAIGeneration,
  apiKeyManager, // Export for monitoring/debugging
};
