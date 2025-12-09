/**
 * Sync gamification UserStats with actual Result count
 * Run this after deleting corrupt results
 */

const mongoose = require("mongoose");
const Result = require("./models/Result");
require("dotenv").config();

// Define UserStats schema inline to avoid import issues
const userStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalQuizzesTaken: { type: Number, default: 0 },
    totalQuizzesCreated: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastQuizDate: { type: Date },
    averageScore: { type: Number, default: 0, min: 0, max: 100 },
    totalTimeSpent: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    favoriteCategories: [{ type: String }],
    achievements: [
      { type: mongoose.Schema.Types.ObjectId, ref: "UserAchievement" },
    ],
    badges: [{ name: String, earnedAt: Date }],
  },
  { timestamps: true }
);

const UserStats = mongoose.model("UserStats", userStatsSchema);

async function syncGamificationStats() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Get all UserStats
    const allUserStats = await UserStats.find({});
    console.log(`Found ${allUserStats.length} UserStats records to sync`);

    let updatedCount = 0;
    let unchangedCount = 0;
    let errorCount = 0;

    for (const userStat of allUserStats) {
      try {
        // Count actual results for this user
        const actualResultCount = await Result.countDocuments({
          user: userStat.user,
        });

        // Get current count
        const currentCount = userStat.totalQuizzesTaken || 0;

        if (currentCount !== actualResultCount) {
          console.log(`\nUser ID: ${userStat.user}`);
          console.log(`  Old count: ${currentCount} quizzes`);
          console.log(`  Actual count: ${actualResultCount} quizzes`);
          console.log(`  Difference: ${currentCount - actualResultCount}`);

          // Update the UserStats
          userStat.totalQuizzesTaken = actualResultCount;
          await userStat.save();
          updatedCount++;
        } else {
          unchangedCount++;
        }
      } catch (err) {
        console.error(
          `Error processing UserStats for user ${userStat.user}:`,
          err.message
        );
        errorCount++;
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total UserStats: ${allUserStats.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Already correct: ${unchangedCount}`);
    console.log(`Errors: ${errorCount}`);

    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

syncGamificationStats();
