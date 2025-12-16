const { UserStats } = require("../models/Achievement");
const User = require("../models/User");
const {
  incrementUserStats,
  getUserStatsFromCache,
  cacheUserStats,
  updateLeaderboard,
  REDIS_KEYS,
} = require("../config/redis");
const { queueStatsSync } = require("../config/queue");

/**
 * Stats Manager - Handles user stats with Redis caching and DB sync
 */
class StatsManager {
  /**
   * Update user stats after quiz completion
   * Uses Redis for atomic increments, queues DB sync
   */
  async updateStats(userId, resultData) {
    try {
      console.log("📈 Updating stats for user:", userId, {
        pointsEarned: resultData.pointsEarned,
        experienceGained: resultData.experienceGained,
        passed: resultData.passed,
      });

      // Calculate updates
      const updates = {
        totalQuizzesTaken: 1,
        totalPoints:
          (resultData.pointsEarned || 0) + (resultData.bonusPoints || 0),
        totalTimeSpent: Math.round((resultData.totalTimeTaken || 0) / 60), // Convert to minutes
        experience: resultData.experienceGained || 0,
      };

      console.log("📊 Calculated updates:", updates);

      // Handle streak logic
      if (resultData.passed) {
        const currentStreak = await this.getCurrentStreak(userId);
        updates.currentStreak = currentStreak + 1;

        const longestStreak = await this.getLongestStreak(userId);
        if (updates.currentStreak > longestStreak) {
          updates.longestStreak = updates.currentStreak;
        }
      } else {
        updates.currentStreak = 0;
      }

      // Try Redis first
      let cachedStats = null;
      try {
        await incrementUserStats(userId, updates);
        cachedStats = await getUserStatsFromCache(userId);

        // Update leaderboards
        if (cachedStats) {
          await updateLeaderboard(
            REDIS_KEYS.LEADERBOARD_GLOBAL,
            userId,
            cachedStats.totalPoints
          );

          // Calculate and update level with progressive scaling
          // Formula: Level = floor(sqrt(XP / 25)) + 1
          // This makes each level progressively harder:
          // L1: 0-24 XP, L2: 25-99 XP (+75), L3: 100-224 XP (+125), L4: 225-399 XP (+175), etc.
          const level = Math.floor(Math.sqrt(cachedStats.experience / 25)) + 1;
          if (level !== cachedStats.level) {
            await this.updateLevel(userId, level);
          }
        }

        // Queue stats sync to MongoDB (non-blocking)
        await queueStatsSync(userId);

        console.log("✅ Stats updated in Redis for user:", userId);
      } catch (redisError) {
        console.warn(
          "⚠️ Redis unavailable, updating MongoDB directly:",
          redisError.message
        );

        // Direct MongoDB update as fallback
        const mongoUpdates = {
          $inc: {
            totalQuizzesTaken: updates.totalQuizzesTaken || 0,
            totalPoints: updates.totalPoints || 0,
            totalTimeSpent: updates.totalTimeSpent || 0,
            experience: updates.experience || 0,
          },
        };

        if (updates.currentStreak !== undefined) {
          mongoUpdates.$set = mongoUpdates.$set || {};
          mongoUpdates.$set.currentStreak = updates.currentStreak;
        }

        if (updates.longestStreak !== undefined) {
          mongoUpdates.$set = mongoUpdates.$set || {};
          mongoUpdates.$set.longestStreak = updates.longestStreak;
        }

        cachedStats = await UserStats.findOneAndUpdate(
          { user: userId },
          mongoUpdates,
          { new: true, upsert: true }
        ).lean();

        console.log(
          "✅ Stats updated in MongoDB directly for user:",
          userId,
          cachedStats
        );
      }

      return cachedStats;
    } catch (error) {
      console.error("❌ Error updating stats:", error);
      throw error;
    }
  }

  /**
   * Get user stats (Redis cache first, fallback to DB)
   */
  async getStats(userId) {
    try {
      // Try Redis first
      let stats = await getUserStatsFromCache(userId);

      if (!stats) {
        // Fallback to MongoDB - ensure userId is ObjectId
        const mongoose = require("mongoose");
        const userObjectId = mongoose.Types.ObjectId.isValid(userId)
          ? new mongoose.Types.ObjectId(userId)
          : userId;

        console.log(`🔍 Querying MongoDB for user: ${userId}`);
        const dbStats = await UserStats.findOne({ user: userObjectId })
          .populate("achievements")
          .lean();

        if (dbStats) {
          console.log(
            `✅ Found stats in MongoDB: Level ${dbStats.level}, Points ${dbStats.totalPoints}`
          );
          // Cache to Redis
          await cacheUserStats(userId, dbStats);
          stats = dbStats;
        } else {
          console.log(
            `❌ No stats found in MongoDB for user ${userId}, creating new...`
          );
          // Create new stats document
          const newStats = new UserStats({ user: userObjectId });
          await newStats.save();
          await cacheUserStats(userId, newStats.toObject());
          stats = newStats.toObject();
        }
      } else {
        console.log(
          `✅ Stats loaded from Redis cache: Level ${stats.level}, Points ${stats.totalPoints}`
        );
      }

      // Always recalculate level based on current XP
      // Progressive Formula: Level = floor(sqrt(XP / 25)) + 1
      // Each level requires progressively more XP to achieve
      if (stats && stats.experience !== undefined) {
        const calculatedLevel =
          Math.floor(Math.sqrt(stats.experience / 25)) + 1;

        // Update level if it changed
        if (calculatedLevel !== stats.level) {
          console.log(
            `📊 Level recalculated for user ${userId}: ${stats.level} -> ${calculatedLevel} (XP: ${stats.experience})`
          );
          stats.level = calculatedLevel;

          // Update in cache/DB
          await this.updateLevel(userId, calculatedLevel);

          // Also update MongoDB
          await UserStats.findOneAndUpdate(
            { user: userId },
            { $set: { level: calculatedLevel } }
          );
        }
      }

      return stats;
    } catch (error) {
      console.error("Error getting stats:", error);
      throw error;
    }
  }

  /**
   * Sync Redis stats to MongoDB
   */
  async syncToDatabase(userId) {
    try {
      const cachedStats = await getUserStatsFromCache(userId);
      if (!cachedStats) {
        return null;
      }

      let userStats = await UserStats.findOne({ user: userId });

      if (!userStats) {
        userStats = new UserStats({ user: userId });
      }

      // Update fields
      userStats.totalQuizzesTaken = cachedStats.totalQuizzesTaken;
      userStats.totalPoints = cachedStats.totalPoints;
      userStats.totalTimeSpent = cachedStats.totalTimeSpent;
      userStats.currentStreak = cachedStats.currentStreak;
      userStats.longestStreak = cachedStats.longestStreak;
      userStats.experience = cachedStats.experience;
      userStats.level = cachedStats.level;
      userStats.averageScore = cachedStats.averageScore;
      userStats.lastQuizDate = new Date();

      await userStats.save();
      console.log(`✅ Synced stats to DB for user ${userId}`);

      return userStats;
    } catch (error) {
      console.error("Error syncing stats to DB:", error);
      throw error;
    }
  }

  /**
   * Update average score
   */
  async updateAverageScore(userId, newScore) {
    try {
      const stats = await this.getStats(userId);
      const totalQuizzes = stats.totalQuizzesTaken || 1;
      const currentAvg = stats.averageScore || 0;

      const newAverage = Math.round(
        (currentAvg * (totalQuizzes - 1) + newScore) / totalQuizzes
      );

      const { getRedisClient, REDIS_KEYS } = require("../config/redis");
      const redis = getRedisClient();
      await redis.hset(
        REDIS_KEYS.USER_STATS(userId),
        "averageScore",
        newAverage
      );

      return newAverage;
    } catch (error) {
      console.error("Error updating average score:", error);
      throw error;
    }
  }

  /**
   * Get current streak from Redis
   */
  async getCurrentStreak(userId) {
    const { getRedisClient, REDIS_KEYS } = require("../config/redis");
    const redis = getRedisClient();
    const streak = await redis.hget(
      REDIS_KEYS.USER_STATS(userId),
      "currentStreak"
    );
    return parseInt(streak) || 0;
  }

  /**
   * Get longest streak from Redis
   */
  async getLongestStreak(userId) {
    const { getRedisClient, REDIS_KEYS } = require("../config/redis");
    const redis = getRedisClient();
    const streak = await redis.hget(
      REDIS_KEYS.USER_STATS(userId),
      "longestStreak"
    );
    return parseInt(streak) || 0;
  }

  /**
   * Update user level
   */
  async updateLevel(userId, newLevel) {
    const { getRedisClient, REDIS_KEYS } = require("../config/redis");
    const redis = getRedisClient();
    await redis.hset(REDIS_KEYS.USER_STATS(userId), "level", newLevel);
  }

  /**
   * Record last activity timestamp
   */
  async recordActivity(userId) {
    const { getRedisClient, REDIS_KEYS } = require("../config/redis");
    const redis = getRedisClient();
    await redis.set(
      REDIS_KEYS.LAST_ACTIVITY(userId),
      Date.now(),
      "EX",
      86400 * 7
    ); // 7 days TTL
  }

  /**
   * Check if user was active in last 24 hours
   */
  async wasActiveRecently(userId) {
    const { getRedisClient, REDIS_KEYS } = require("../config/redis");
    const redis = getRedisClient();
    const lastActivity = await redis.get(REDIS_KEYS.LAST_ACTIVITY(userId));

    if (!lastActivity) return false;

    const hoursSinceActivity =
      (Date.now() - parseInt(lastActivity)) / (1000 * 60 * 60);
    return hoursSinceActivity < 24;
  }

  /**
   * Reset streak if inactive for >24 hours
   */
  async checkAndResetStreak(userId) {
    const wasActive = await this.wasActiveRecently(userId);

    if (!wasActive) {
      const { getRedisClient, REDIS_KEYS } = require("../config/redis");
      const redis = getRedisClient();
      await redis.hset(REDIS_KEYS.USER_STATS(userId), "currentStreak", 0);
      console.log(`Reset streak for user ${userId} due to inactivity`);
      return true;
    }

    return false;
  }

  /**
   * Get top users by stat
   */
  async getTopUsers(statField = "totalPoints", limit = 10) {
    try {
      const users = await UserStats.find()
        .sort({ [statField]: -1 })
        .limit(limit)
        .populate("user", "name email")
        .lean();

      return users.map((user, index) => ({
        rank: index + 1,
        ...user,
      }));
    } catch (error) {
      console.error("Error getting top users:", error);
      throw error;
    }
  }

  /**
   * Bulk update stats for multiple users (for migrations)
   */
  async bulkUpdateStats(updates) {
    try {
      const operations = updates.map(({ userId, data }) => ({
        updateOne: {
          filter: { user: userId },
          update: { $inc: data },
          upsert: true,
        },
      }));

      const result = await UserStats.bulkWrite(operations);
      console.log(`Bulk updated ${result.modifiedCount} user stats`);
      return result;
    } catch (error) {
      console.error("Error bulk updating stats:", error);
      throw error;
    }
  }
}

module.exports = new StatsManager();
