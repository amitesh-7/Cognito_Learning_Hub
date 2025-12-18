/**
 * Redis Session Manager
 * Handles all Redis operations for live sessions
 * Replaces in-memory Map with Redis for horizontal scaling
 * Falls back to in-memory storage if Redis is unavailable
 */

const Redis = require("ioredis");
const createLogger = require("../../shared/utils/logger");

const logger = createLogger("session-manager");

class SessionManager {
  constructor() {
    this.redis = null;
    this.subscriber = null;
    this.connected = false;
    this.useInMemory = false; // Fallback flag

    // In-memory fallback storage
    this.memoryStore = {
      sessions: new Map(),
      leaderboards: new Map(),
      participants: new Map(),
      answers: new Map(),
      quizCache: new Map(),
      currentQuestions: new Map(),
    };

    this.keyPrefix = process.env.REDIS_KEY_PREFIX || "live:";
    this.sessionTTL = parseInt(process.env.SESSION_TTL) || 7200; // 2 hours
  }

  /**
   * Connect to Redis (with pub/sub)
   * Falls back to in-memory if Redis is unavailable
   */
  async connect() {
    try {
      let redisConfig;

      // Check if REDIS_URL is configured (Redis Cloud or remote Redis)
      if (
        process.env.REDIS_URL &&
        process.env.REDIS_URL !== "redis://localhost:6379"
      ) {
        logger.info("Attempting to connect to Redis Cloud...");

        try {
          const url = new URL(process.env.REDIS_URL);

          redisConfig = {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password || undefined,
            username: url.username !== "default" ? url.username : undefined,
            tls:
              url.protocol === "rediss:"
                ? {
                    rejectUnauthorized: false,
                  }
                : undefined,
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
            connectTimeout: 10000,
            retryStrategy(times) {
              if (times > 3) {
                return null;
              }
              const delay = Math.min(times * 100, 2000);
              return delay;
            },
            lazyConnect: true,
          };

          // Main Redis client
          this.redis = new Redis(redisConfig);

          // Handle connection errors gracefully
          this.redis.on("error", (err) => {
            if (!this.useInMemory) {
              logger.warn(
                "Redis connection error, switching to in-memory mode:",
                err.message
              );
              this.switchToInMemory();
            }
          });

          this.redis.on("connect", () => {
            this.connected = true;
            this.useInMemory = false;
            logger.info("Redis connected successfully");
          });

          // Try to connect with timeout
          await Promise.race([
            this.redis.connect(),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Redis connection timeout")),
                10000
              )
            ),
          ]);

          await this.redis.ping();

          // Create subscriber only if main connection succeeded
          this.subscriber = new Redis(redisConfig);
          await this.subscriber.connect();

          this.connected = true;
          logger.info("Redis Cloud connected");
          return true;
        } catch (cloudError) {
          logger.warn("Redis Cloud connection failed:", cloudError.message);
          logger.info("Trying next option...");

          // Clean up failed connections
          if (this.redis) {
            try {
              this.redis.disconnect();
            } catch (e) {}
            this.redis = null;
          }
        }
      }

      // Check if Upstash Redis is configured
      if (
        !this.connected &&
        process.env.UPSTASH_REDIS_URL &&
        process.env.UPSTASH_REDIS_TOKEN
      ) {
        logger.info("Attempting to connect to Upstash Redis (cloud)...");

        try {
          const url = new URL(process.env.UPSTASH_REDIS_URL);

          redisConfig = {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: process.env.UPSTASH_REDIS_TOKEN,
            tls: {
              rejectUnauthorized: false,
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
            connectTimeout: 10000, // 10 second timeout
            retryStrategy(times) {
              if (times > 3) {
                return null; // Stop retrying after 3 attempts
              }
              const delay = Math.min(times * 100, 2000);
              return delay;
            },
            lazyConnect: true, // Don't connect immediately
          };

          // Main Redis client
          this.redis = new Redis(redisConfig);

          // Handle connection errors gracefully
          this.redis.on("error", (err) => {
            if (!this.useInMemory) {
              logger.warn(
                "Redis connection error, switching to in-memory mode:",
                err.message
              );
              this.switchToInMemory();
            }
          });

          this.redis.on("connect", () => {
            this.connected = true;
            this.useInMemory = false;
            logger.info("Redis connected successfully");
          });

          // Try to connect with timeout
          await Promise.race([
            this.redis.connect(),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Redis connection timeout")),
                10000
              )
            ),
          ]);

          await this.redis.ping();

          // Create subscriber only if main connection succeeded
          this.subscriber = new Redis(redisConfig);
          await this.subscriber.connect();

          this.connected = true;
          logger.info("Redis connected (Upstash)");
          return true;
        } catch (upstashError) {
          logger.warn("Upstash Redis connection failed:", upstashError.message);
          logger.info("Falling back to local Redis or in-memory mode...");

          // Clean up failed connections
          if (this.redis) {
            try {
              this.redis.disconnect();
            } catch (e) {}
            this.redis = null;
          }
        }
      }

      // Try local Redis
      if (!this.connected) {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
        logger.info(
          `Attempting to connect to fallback local Redis: ${redisUrl}`
        );

        try {
          this.redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
            connectTimeout: 5000,
            lazyConnect: true,
            retryStrategy(times) {
              if (times > 2) {
                return null;
              }
              return Math.min(times * 100, 1000);
            },
          });

          this.redis.on("error", (err) => {
            if (!this.useInMemory) {
              logger.warn(
                "Local Redis error, switching to in-memory:",
                err.message
              );
              this.switchToInMemory();
            }
          });

          await Promise.race([
            this.redis.connect(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Local Redis timeout")), 5000)
            ),
          ]);

          await this.redis.ping();

          this.subscriber = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
          });

          this.connected = true;
          logger.info("Local Redis connected");
          return true;
        } catch (localError) {
          logger.warn("Local Redis connection failed:", localError.message);
        }
      }

      // Final fallback: in-memory mode
      this.switchToInMemory();
      return true;
    } catch (error) {
      logger.error("Redis connection error:", error.message);
      this.switchToInMemory();
      return true; // Return true since in-memory is working
    }
  }

  /**
   * Switch to in-memory fallback mode
   */
  switchToInMemory() {
    this.useInMemory = true;
    this.connected = false;

    // Clean up Redis connections
    if (this.redis) {
      try {
        this.redis.disconnect();
      } catch (e) {}
      this.redis = null;
    }
    if (this.subscriber) {
      try {
        this.subscriber.disconnect();
      } catch (e) {}
      this.subscriber = null;
    }

    logger.info(
      "⚠️ Running in IN-MEMORY mode (sessions will not persist across restarts)"
    );
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.redis) {
      await this.redis.quit();
    }
    if (this.subscriber) {
      await this.subscriber.quit();
    }
    this.connected = false;
    logger.info("Redis disconnected");
  }

  isConnected() {
    return this.connected || this.useInMemory;
  }

  /**
   * Check if Redis is healthy (connected and ready)
   */
  isHealthy() {
    if (this.useInMemory) {
      return true; // In-memory mode is always "healthy"
    }
    return this.connected && this.redis && this.redis.status === "ready";
  }

  // ============================================
  // KEY GENERATORS
  // ============================================

  getSessionKey(sessionCode) {
    return `${this.keyPrefix}session:${sessionCode}`;
  }

  getLeaderboardKey(sessionCode) {
    return `${this.keyPrefix}leaderboard:${sessionCode}`;
  }

  getParticipantsKey(sessionCode) {
    return `${this.keyPrefix}participants:${sessionCode}`;
  }

  getAnswersKey(sessionCode) {
    return `${this.keyPrefix}answers:${sessionCode}`;
  }

  getQuizCacheKey(sessionCode) {
    return `${this.keyPrefix}quiz:${sessionCode}`;
  }

  getCurrentQuestionKey(sessionCode) {
    return `${this.keyPrefix}current-question:${sessionCode}`;
  }

  // ============================================
  // SESSION CRUD OPERATIONS
  // ============================================

  /**
   * Create new session in Redis or in-memory
   */
  async createSession(sessionData) {
    try {
      const session = {
        sessionCode: sessionData.sessionCode,
        quizId: sessionData.quizId,
        hostId: sessionData.hostId,
        status: "waiting",
        currentQuestionIndex: -1,
        maxParticipants: sessionData.maxParticipants || 50,
        settings: sessionData.settings || {},
        quizMetadata: sessionData.quizMetadata || {},
        createdAt: new Date().toISOString(),
        startedAt: null,
        endedAt: null,
      };

      if (this.useInMemory) {
        this.memoryStore.sessions.set(sessionData.sessionCode, session);
        // Set up TTL cleanup
        setTimeout(() => {
          this.memoryStore.sessions.delete(sessionData.sessionCode);
        }, this.sessionTTL * 1000);
      } else {
        const key = this.getSessionKey(sessionData.sessionCode);
        await this.redis.setex(key, this.sessionTTL, JSON.stringify(session));
      }

      logger.info(
        `Created session: ${sessionData.sessionCode} (${
          this.useInMemory ? "in-memory" : "Redis"
        })`
      );
      return session;
    } catch (error) {
      logger.error("Error creating session:", error);
      throw error;
    }
  }

  /**
   * Get session from Redis or in-memory
   */
  async getSession(sessionCode) {
    try {
      if (this.useInMemory) {
        return this.memoryStore.sessions.get(sessionCode) || null;
      }

      const key = this.getSessionKey(sessionCode);
      const data = await this.redis.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      logger.error("Error getting session:", error);
      return null;
    }
  }

  /**
   * Update session in Redis or in-memory
   */
  async updateSession(sessionCode, updates) {
    try {
      const session = await this.getSession(sessionCode);

      if (!session) {
        throw new Error("Session not found");
      }

      const updatedSession = {
        ...session,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (this.useInMemory) {
        this.memoryStore.sessions.set(sessionCode, updatedSession);
      } else {
        const key = this.getSessionKey(sessionCode);
        await this.redis.setex(
          key,
          this.sessionTTL,
          JSON.stringify(updatedSession)
        );
      }

      return updatedSession;
    } catch (error) {
      logger.error("Error updating session:", error);
      throw error;
    }
  }

  /**
   * Delete session from Redis or in-memory
   */
  async deleteSession(sessionCode) {
    try {
      if (this.useInMemory) {
        this.memoryStore.sessions.delete(sessionCode);
        this.memoryStore.leaderboards.delete(sessionCode);
        this.memoryStore.participants.delete(sessionCode);
        this.memoryStore.answers.delete(sessionCode);
        this.memoryStore.quizCache.delete(sessionCode);
        this.memoryStore.currentQuestions.delete(sessionCode);
      } else {
        const pipeline = this.redis.pipeline();

        pipeline.del(this.getSessionKey(sessionCode));
        pipeline.del(this.getLeaderboardKey(sessionCode));
        pipeline.del(this.getParticipantsKey(sessionCode));
        pipeline.del(this.getAnswersKey(sessionCode));
        pipeline.del(this.getQuizCacheKey(sessionCode));
        pipeline.del(this.getCurrentQuestionKey(sessionCode));

        await pipeline.exec();
      }

      logger.info(`Deleted session: ${sessionCode}`);

      return true;
    } catch (error) {
      logger.error("Error deleting session:", error);
      return false;
    }
  }

  /**
   * Extend session TTL (on activity)
   */
  async extendSessionTTL(sessionCode) {
    try {
      if (this.useInMemory) {
        // In-memory doesn't need TTL extension
        return true;
      }
      const key = this.getSessionKey(sessionCode);
      await this.redis.expire(key, this.sessionTTL);
      return true;
    } catch (error) {
      logger.error("Error extending session TTL:", error);
      return false;
    }
  }

  // ============================================
  // PARTICIPANT MANAGEMENT
  // ============================================

  /**
   * Add participant to session
   * Uses Redis Hash for fast lookups or in-memory Map
   */
  async addParticipant(sessionCode, participant) {
    try {
      const participantData = {
        userId: participant.userId,
        userName: participant.userName,
        userPicture: participant.userPicture || "",
        score: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        joinedAt: new Date().toISOString(),
        isActive: true,
        socketId: participant.socketId || "",
      };

      if (this.useInMemory) {
        if (!this.memoryStore.participants.has(sessionCode)) {
          this.memoryStore.participants.set(sessionCode, new Map());
        }
        this.memoryStore.participants
          .get(sessionCode)
          .set(participant.userId, participantData);

        // Initialize in leaderboard
        await this.updateLeaderboard(sessionCode, participant.userId, 0);
      } else {
        const key = this.getParticipantsKey(sessionCode);
        await this.redis.hset(
          key,
          participant.userId,
          JSON.stringify(participantData)
        );
        await this.redis.expire(key, this.sessionTTL);

        // Initialize in leaderboard (sorted set)
        await this.updateLeaderboard(sessionCode, participant.userId, 0);
      }

      logger.debug(
        `Added participant ${participant.userId} to session ${sessionCode}`
      );
      return participantData;
    } catch (error) {
      logger.error("Error adding participant:", error);
      throw error;
    }
  }

  /**
   * Get participant from session
   */
  async getParticipant(sessionCode, userId) {
    try {
      if (this.useInMemory) {
        const participants = this.memoryStore.participants.get(sessionCode);
        return participants ? participants.get(userId) || null : null;
      }

      const key = this.getParticipantsKey(sessionCode);
      const data = await this.redis.hget(key, userId);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      logger.error("Error getting participant:", error);
      return null;
    }
  }

  /**
   * Get all participants
   */
  async getAllParticipants(sessionCode) {
    try {
      if (this.useInMemory) {
        const participants = this.memoryStore.participants.get(sessionCode);
        return participants ? Array.from(participants.values()) : [];
      }

      const key = this.getParticipantsKey(sessionCode);
      const data = await this.redis.hgetall(key);

      const participants = [];
      for (const [userId, participantJson] of Object.entries(data)) {
        participants.push(JSON.parse(participantJson));
      }

      return participants;
    } catch (error) {
      logger.error("Error getting all participants:", error);
      return [];
    }
  }

  /**
   * Update participant data
   */
  async updateParticipant(sessionCode, userId, updates) {
    try {
      const participant = await this.getParticipant(sessionCode, userId);

      if (!participant) {
        throw new Error("Participant not found");
      }

      const updatedParticipant = {
        ...participant,
        ...updates,
      };

      if (this.useInMemory) {
        this.memoryStore.participants
          .get(sessionCode)
          .set(userId, updatedParticipant);
      } else {
        const key = this.getParticipantsKey(sessionCode);
        await this.redis.hset(key, userId, JSON.stringify(updatedParticipant));
      }

      return updatedParticipant;
    } catch (error) {
      logger.error("Error updating participant:", error);
      throw error;
    }
  }

  /**
   * Remove participant from session
   */
  async removeParticipant(sessionCode, userId) {
    try {
      if (this.useInMemory) {
        const participants = this.memoryStore.participants.get(sessionCode);
        if (participants) {
          participants.delete(userId);
        }
        const leaderboard = this.memoryStore.leaderboards.get(sessionCode);
        if (leaderboard) {
          leaderboard.delete(userId);
        }
      } else {
        const key = this.getParticipantsKey(sessionCode);
        await this.redis.hdel(key, userId);

        // Remove from leaderboard
        const leaderboardKey = this.getLeaderboardKey(sessionCode);
        await this.redis.zrem(leaderboardKey, userId);
      }

      logger.debug(`Removed participant ${userId} from session ${sessionCode}`);
      return true;
    } catch (error) {
      logger.error("Error removing participant:", error);
      return false;
    }
  }

  /**
   * Get participant count
   */
  async getParticipantCount(sessionCode) {
    try {
      if (this.useInMemory) {
        const participants = this.memoryStore.participants.get(sessionCode);
        return participants ? participants.size : 0;
      }

      const key = this.getParticipantsKey(sessionCode);
      return await this.redis.hlen(key);
    } catch (error) {
      logger.error("Error getting participant count:", error);
      return 0;
    }
  }

  // ============================================
  // LEADERBOARD OPERATIONS (Redis Sorted Set / In-memory Map)
  // ============================================

  /**
   * Update participant score in leaderboard
   * Uses ZINCRBY for atomic operations - O(log N)
   */
  async updateLeaderboard(sessionCode, userId, scoreIncrement) {
    try {
      if (this.useInMemory) {
        if (!this.memoryStore.leaderboards.has(sessionCode)) {
          this.memoryStore.leaderboards.set(sessionCode, new Map());
        }
        const leaderboard = this.memoryStore.leaderboards.get(sessionCode);
        const currentScore = leaderboard.get(userId) || 0;
        const newScore = currentScore + scoreIncrement;
        leaderboard.set(userId, newScore);
        return newScore;
      }

      const key = this.getLeaderboardKey(sessionCode);

      // ZINCRBY is atomic - no race conditions
      const newScore = await this.redis.zincrby(key, scoreIncrement, userId);
      await this.redis.expire(key, this.sessionTTL);

      return parseFloat(newScore);
    } catch (error) {
      logger.error("Error updating leaderboard:", error);
      throw error;
    }
  }

  /**
   * Get leaderboard (sorted by score, descending)
   * Redis Sorted Set: O(log N + M) where M = limit
   */
  async getLeaderboard(sessionCode, limit = 50) {
    try {
      if (this.useInMemory) {
        const leaderboard = this.memoryStore.leaderboards.get(sessionCode);
        if (!leaderboard) return [];

        // Sort by score descending
        const sorted = Array.from(leaderboard.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit);

        const result = [];
        for (let i = 0; i < sorted.length; i++) {
          const [userId, score] = sorted[i];
          const participant = await this.getParticipant(sessionCode, userId);
          if (participant) {
            // Get participant's answers to calculate average time
            const answers = await this.getParticipantAnswers(
              sessionCode,
              userId
            );
            const totalTime = answers.reduce(
              (sum, a) => sum + (a.timeSpent || 0),
              0
            );
            const avgTime =
              answers.length > 0 ? totalTime / answers.length / 1000 : 0; // Convert to seconds

            result.push({
              rank: i + 1,
              userId,
              userName: participant.userName,
              username: participant.userName,
              userPicture: participant.userPicture,
              avatar: participant.userPicture,
              score,
              correctAnswers: participant.correctAnswers,
              incorrectAnswers: participant.incorrectAnswers,
              avgTimePerQuestion: avgTime,
              accuracy:
                participant.correctAnswers + participant.incorrectAnswers > 0
                  ? (participant.correctAnswers /
                      (participant.correctAnswers +
                        participant.incorrectAnswers)) *
                    100
                  : 0,
            });
          }
        }
        return result;
      }

      const key = this.getLeaderboardKey(sessionCode);

      // ZREVRANGE with WITHSCORES - returns top N users
      const results = await this.redis.zrevrange(
        key,
        0,
        limit - 1,
        "WITHSCORES"
      );

      // Get participant details
      const leaderboard = [];
      for (let i = 0; i < results.length; i += 2) {
        const userId = results[i];
        const score = parseFloat(results[i + 1]);

        const participant = await this.getParticipant(sessionCode, userId);

        if (participant) {
          // Get participant's answers to calculate average time
          const answers = await this.getParticipantAnswers(sessionCode, userId);
          const totalTime = answers.reduce(
            (sum, a) => sum + (a.timeSpent || 0),
            0
          );
          const avgTime =
            answers.length > 0 ? totalTime / answers.length / 1000 : 0; // Convert to seconds

          leaderboard.push({
            rank: Math.floor(i / 2) + 1,
            userId,
            userName: participant.userName,
            username: participant.userName, // Alias for frontend compatibility
            userPicture: participant.userPicture,
            avatar: participant.userPicture, // Alias for frontend compatibility
            score,
            correctAnswers: participant.correctAnswers,
            incorrectAnswers: participant.incorrectAnswers,
            avgTimePerQuestion: avgTime,
            accuracy:
              participant.correctAnswers + participant.incorrectAnswers > 0
                ? (participant.correctAnswers /
                    (participant.correctAnswers +
                      participant.incorrectAnswers)) *
                  100
                : 0,
          });
        }
      }

      return leaderboard;
    } catch (error) {
      logger.error("Error getting leaderboard:", error);
      return [];
    }
  }

  /**
   * Get user's rank in leaderboard
   */
  async getUserRank(sessionCode, userId) {
    try {
      if (this.useInMemory) {
        const leaderboard = this.memoryStore.leaderboards.get(sessionCode);
        if (!leaderboard) return null;

        const sorted = Array.from(leaderboard.entries()).sort(
          (a, b) => b[1] - a[1]
        );

        const index = sorted.findIndex(([id]) => id === userId);
        return index >= 0 ? index + 1 : null;
      }

      const key = this.getLeaderboardKey(sessionCode);
      const rank = await this.redis.zrevrank(key, userId);

      if (rank === null) {
        return null;
      }

      return rank + 1; // Redis rank is 0-indexed
    } catch (error) {
      logger.error("Error getting user rank:", error);
      return null;
    }
  }

  // ============================================
  // ANSWER TRACKING
  // ============================================

  /**
   * Record answer in Redis or in-memory
   * Uses List for ordered storage
   */
  async recordAnswer(sessionCode, answerData) {
    try {
      const answer = {
        userId: answerData.userId,
        questionId: answerData.questionId,
        selectedAnswer: answerData.selectedAnswer,
        isCorrect: answerData.isCorrect,
        points: answerData.points || 0,
        answeredAt: new Date().toISOString(),
        timeSpent: answerData.timeSpent || 0,
      };

      if (this.useInMemory) {
        if (!this.memoryStore.answers.has(sessionCode)) {
          this.memoryStore.answers.set(sessionCode, []);
        }
        this.memoryStore.answers.get(sessionCode).push(answer);
      } else {
        const key = this.getAnswersKey(sessionCode);
        await this.redis.rpush(key, JSON.stringify(answer));
        await this.redis.expire(key, this.sessionTTL);
      }

      return answer;
    } catch (error) {
      logger.error("Error recording answer:", error);
      throw error;
    }
  }

  /**
   * Get all answers for a session
   */
  async getAllAnswers(sessionCode) {
    try {
      if (this.useInMemory) {
        return this.memoryStore.answers.get(sessionCode) || [];
      }

      const key = this.getAnswersKey(sessionCode);
      const answers = await this.redis.lrange(key, 0, -1);

      return answers.map((ans) => JSON.parse(ans));
    } catch (error) {
      logger.error("Error getting all answers:", error);
      return [];
    }
  }

  /**
   * Get answer count (for sync threshold)
   */
  async getAnswerCount(sessionCode) {
    try {
      if (this.useInMemory) {
        const answers = this.memoryStore.answers.get(sessionCode);
        return answers ? answers.length : 0;
      }

      const key = this.getAnswersKey(sessionCode);
      return await this.redis.llen(key);
    } catch (error) {
      logger.error("Error getting answer count:", error);
      return 0;
    }
  }

  // ============================================
  // QUIZ CACHING
  // ============================================

  /**
   * Cache quiz data (for fast access)
   */
  async cacheQuiz(sessionCode, quizData) {
    try {
      if (this.useInMemory) {
        this.memoryStore.quizCache.set(sessionCode, quizData);
      } else {
        const key = this.getQuizCacheKey(sessionCode);
        await this.redis.setex(key, this.sessionTTL, JSON.stringify(quizData));
      }
      logger.debug(`Cached quiz for session ${sessionCode}`);
      return true;
    } catch (error) {
      logger.error("Error caching quiz:", error);
      return false;
    }
  }

  /**
   * Get cached quiz
   */
  async getCachedQuiz(sessionCode) {
    try {
      if (this.useInMemory) {
        return this.memoryStore.quizCache.get(sessionCode) || null;
      }

      const key = this.getQuizCacheKey(sessionCode);
      const data = await this.redis.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      logger.error("Error getting cached quiz:", error);
      return null;
    }
  }

  // ============================================
  // PUB/SUB FOR BROADCASTS
  // ============================================

  /**
   * Publish message to session channel
   */
  async publishToSession(sessionCode, event, data) {
    try {
      if (this.useInMemory) {
        // In-memory mode doesn't support pub/sub across instances
        // But for single-instance, we can use local event emitter if needed
        logger.debug(`In-memory publish to ${sessionCode}: ${event}`);
        return true;
      }

      const channel = `${this.keyPrefix}channel:${sessionCode}`;
      const message = JSON.stringify({ event, data, timestamp: Date.now() });

      await this.redis.publish(channel, message);
      return true;
    } catch (error) {
      logger.error("Error publishing to session:", error);
      return false;
    }
  }

  /**
   * Subscribe to session channel
   */
  subscribeToSession(sessionCode, callback) {
    try {
      if (this.useInMemory) {
        // In-memory mode doesn't support pub/sub
        logger.debug(`In-memory subscribe to ${sessionCode} (no-op)`);
        return true;
      }

      if (!this.subscriber) {
        logger.warn("Subscriber not available");
        return false;
      }

      const channel = `${this.keyPrefix}channel:${sessionCode}`;

      this.subscriber.subscribe(channel, (err) => {
        if (err) {
          logger.error("Error subscribing to session:", err);
        } else {
          logger.debug(`Subscribed to session ${sessionCode}`);
        }
      });

      this.subscriber.on("message", (ch, message) => {
        if (ch === channel) {
          const data = JSON.parse(message);
          callback(data);
        }
      });

      return true;
    } catch (error) {
      logger.error("Error subscribing to session:", error);
      return false;
    }
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get session statistics
   */
  async getSessionStats(sessionCode) {
    try {
      const participantCount = await this.getParticipantCount(sessionCode);
      const answerCount = await this.getAnswerCount(sessionCode);
      const session = await this.getSession(sessionCode);

      return {
        sessionCode,
        participantCount,
        answerCount,
        status: session?.status,
        currentQuestion: session?.currentQuestionIndex,
        storageMode: this.useInMemory ? "in-memory" : "redis",
      };
    } catch (error) {
      logger.error("Error getting session stats:", error);
      return null;
    }
  }

  /**
   * Get Redis statistics
   */
  async getRedisStats() {
    try {
      if (this.useInMemory) {
        return {
          connected: false,
          mode: "in-memory",
          sessions: this.memoryStore.sessions.size,
          participants: this.memoryStore.participants.size,
          leaderboards: this.memoryStore.leaderboards.size,
        };
      }

      const info = await this.redis.info("stats");
      const keyspace = await this.redis.info("keyspace");

      return {
        connected: this.connected,
        mode: "redis",
        info,
        keyspace,
      };
    } catch (error) {
      logger.error("Error getting Redis stats:", error);
      return null;
    }
  }
}

module.exports = new SessionManager();
