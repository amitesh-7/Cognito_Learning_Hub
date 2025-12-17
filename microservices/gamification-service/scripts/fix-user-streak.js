/**
 * Script to manually fix streak for a specific user
 * Run this to update the streak value in the database
 *
 * Usage: node scripts/fix-user-streak.js <userId> <streakValue>
 * Example: node scripts/fix-user-streak.js 690e1b64fa247bb4ed12c8c1 2
 */

require("dotenv").config();
const mongoose = require("mongoose");

// User Stats Schema
const userStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalQuizzesTaken: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastQuizDate: { type: Date },
  averageScore: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
});

const UserStats = mongoose.model("UserStats", userStatsSchema);

async function fixUserStreak(userId, streakValue) {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get current stats
    const stats = await UserStats.findOne({ user: userId });

    if (!stats) {
      console.error(`❌ No stats found for user: ${userId}`);
      process.exit(1);
    }

    console.log("📊 Current Stats:");
    console.log(`  Current Streak: ${stats.currentStreak}`);
    console.log(`  Longest Streak: ${stats.longestStreak}`);
    console.log(`  Last Quiz Date: ${stats.lastQuizDate}`);
    console.log("");

    // Update streak
    const today = new Date();
    const updates = {
      currentStreak: streakValue,
      lastQuizDate: today,
    };

    // Update longest streak if needed
    if (streakValue > stats.longestStreak) {
      updates.longestStreak = streakValue;
      console.log(`🔥 Updating longest streak to: ${streakValue}`);
    }

    const result = await UserStats.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true }
    );

    console.log("✅ Streak Updated Successfully!\n");
    console.log("📊 New Stats:");
    console.log(`  Current Streak: ${result.currentStreak}`);
    console.log(`  Longest Streak: ${result.longestStreak}`);
    console.log(`  Last Quiz Date: ${result.lastQuizDate}`);

    // Also clear Redis cache for this user
    console.log("\n⚠️  Remember to clear Redis cache for this user!");
    console.log(`   Redis key: user:stats:${userId}`);
    console.log(`   Command: redis-cli DEL user:stats:${userId}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Parse command line arguments
const userId = process.argv[2];
const streakValue = parseInt(process.argv[3]);

if (!userId || isNaN(streakValue)) {
  console.error(
    "Usage: node scripts/fix-user-streak.js <userId> <streakValue>"
  );
  console.error(
    "Example: node scripts/fix-user-streak.js 690e1b64fa247bb4ed12c8c1 2"
  );
  process.exit(1);
}

console.log("🔧 Fixing User Streak");
console.log(`   User ID: ${userId}`);
console.log(`   New Streak: ${streakValue}`);
console.log("");

fixUserStreak(userId, streakValue);
