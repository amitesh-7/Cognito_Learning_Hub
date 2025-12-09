/**
 * Debug and fix quiz stats issues
 * 1. Check actual quiz count per user
 * 2. Fix score display (score vs correctAnswers)
 */

const mongoose = require("mongoose");
const Result = require("./models/Result");
const User = require("./models/User");
const Quiz = require("./models/Quiz");
require("dotenv").config();

async function debugAndFix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find Amitesh's user
    const user = await User.findOne({
      email: "amiteshvishwakarma2006@gmail.com",
    });
    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("\n=== User Info ===");
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`User ID: ${user._id}`);
    console.log(
      `totalQuizzesTaken in User model: ${user.totalQuizzesTaken || 0}`
    );

    // Get all results for this user
    const results = await Result.find({ user: user._id })
      .populate("quiz", "title")
      .sort({ createdAt: -1 });

    console.log(`\n=== Results (${results.length} total) ===`);

    results.forEach((result, index) => {
      console.log(`\n--- Result ${index + 1} ---`);
      console.log(`  ID: ${result._id}`);
      console.log(`  Quiz: ${result.quiz?.title || "Unknown"}`);
      console.log(`  Score (points): ${result.score}`);
      console.log(`  Total Questions: ${result.totalQuestions}`);
      console.log(`  Percentage: ${result.percentage}%`);
      console.log(`  Points Earned: ${result.pointsEarned || "N/A"}`);
      console.log(`  Date: ${result.createdAt}`);

      // Check if score seems wrong (points instead of correct count)
      if (result.score > result.totalQuestions) {
        console.log(
          `  ⚠️  WARNING: Score (${result.score}) > Total Questions (${result.totalQuestions})`
        );
        console.log(`     This looks like POINTS, not correct answer count!`);
      }
    });

    // Check UserStats in gamification
    const userStatsSchema = new mongoose.Schema(
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        totalQuizzesTaken: { type: Number, default: 0 },
        totalPoints: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        experience: { type: Number, default: 0 },
      },
      { timestamps: true, strict: false }
    );

    const UserStats =
      mongoose.models.UserStats || mongoose.model("UserStats", userStatsSchema);

    const userStats = await UserStats.findOne({ user: user._id });
    if (userStats) {
      console.log("\n=== UserStats (Gamification) ===");
      console.log(`  totalQuizzesTaken: ${userStats.totalQuizzesTaken}`);
      console.log(`  totalPoints: ${userStats.totalPoints}`);
      console.log(`  level: ${userStats.level}`);
      console.log(`  experience: ${userStats.experience}`);
    }

    console.log("\n=== Summary ===");
    console.log(`Actual results in database: ${results.length}`);
    console.log(`User.totalQuizzesTaken: ${user.totalQuizzesTaken || 0}`);
    if (userStats) {
      console.log(
        `UserStats.totalQuizzesTaken: ${userStats.totalQuizzesTaken}`
      );
    }

    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

debugAndFix();
