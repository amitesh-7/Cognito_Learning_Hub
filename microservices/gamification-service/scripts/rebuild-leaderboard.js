/**
 * Rebuild Leaderboard Cache
 * Rebuilds Redis leaderboard from MongoDB UserStats
 */

const mongoose = require("mongoose");
const Redis = require("ioredis");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;

// User schema (must be defined before UserStats to allow populate)
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["Student", "Teacher", "Admin", "Moderator"],
      default: "Student",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

// UserStats schema
const UserStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalPoints: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  totalQuizzesTaken: { type: Number, default: 0 },
});

const UserStats = mongoose.model("UserStats", UserStatsSchema);

async function rebuildLeaderboard() {
  let redis;

  try {
    console.log("🔄 Starting leaderboard rebuild...");

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Connect to Redis
    redis = new Redis(REDIS_URL);
    console.log("✅ Connected to Redis");

    // Get all user stats
    const allStats = await UserStats.find()
      .sort({ totalPoints: -1 })
      .populate("user", "name email")
      .lean();

    console.log(`📊 Found ${allStats.length} user stats`);

    // Clear existing leaderboard
    await redis.del("leaderboard:global");
    console.log("🗑️  Cleared existing leaderboard");

    // Rebuild leaderboard
    const pipeline = redis.pipeline();

    let addedCount = 0;
    for (const stats of allStats) {
      if (stats.totalPoints > 0 && stats.user) {
        pipeline.zadd(
          "leaderboard:global",
          stats.totalPoints,
          stats.user._id.toString()
        );
        console.log(
          `➕ Adding ${stats.user.name}: ${stats.totalPoints} points`
        );
        addedCount++;
      }
    }

    await pipeline.exec();

    console.log("\n═══════════════════════════════════════");
    console.log("🎉 Leaderboard Rebuild Complete!");
    console.log(`✅ Added ${addedCount} users to leaderboard`);
    console.log("═══════════════════════════════════════\n");

    // Verify
    const topUsers = await redis.zrevrange(
      "leaderboard:global",
      0,
      9,
      "WITHSCORES"
    );
    console.log("🏆 Top 10 users:");
    for (let i = 0; i < topUsers.length; i += 2) {
      const userId = topUsers[i];
      const score = topUsers[i + 1];
      const user = await mongoose.connection.db.collection("users").findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });
      console.log(
        `   ${i / 2 + 1}. ${user?.name || "Unknown"}: ${score} points`
      );
    }

    if (redis) redis.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Leaderboard rebuild failed:", error);
    if (redis) redis.disconnect();
    process.exit(1);
  }
}

// Run the rebuild
rebuildLeaderboard();
