/**
 * Clear Redis cache and force reload from MongoDB
 */

require("dotenv").config({
  path: "../microservices/gamification-service/.env",
});
const mongoose = require("mongoose");
const Redis = require("ioredis");

// UserStats Schema
const UserStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalQuizzesTaken: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
});

const UserStats = mongoose.model("UserStats", UserStatsSchema, "userstats");

async function clearRedisCache() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Connect to Redis
    const redis = new Redis(process.env.REDIS_URL);
    console.log("✅ Connected to Redis\n");

    // Find user
    const User = mongoose.model("User", new mongoose.Schema({ email: String }));
    const user = await User.findOne({ email: "amitesh@gmail.com" });

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    const userId = user._id.toString();
    console.log(`📊 Clearing Redis cache for: ${userId}\n`);

    // Get stats from MongoDB
    const stats = await UserStats.findOne({ user: userId });
    console.log("MongoDB stats:", {
      totalQuizzesTaken: stats?.totalQuizzesTaken || 0,
      totalPoints: stats?.totalPoints || 0,
      experience: stats?.experience || 0,
    });

    // Get current Redis cache
    const redisKey = `userstats:${userId}`;
    const cachedStats = await redis.hgetall(redisKey);
    console.log("\nRedis cached stats (before clear):", cachedStats);

    // Clear Redis cache
    await redis.del(redisKey);
    console.log("\n✅ Redis cache cleared for user:", userId);

    // Verify it's cleared
    const afterClear = await redis.hgetall(redisKey);
    console.log("Redis after clear:", afterClear);

    redis.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

clearRedisCache();
