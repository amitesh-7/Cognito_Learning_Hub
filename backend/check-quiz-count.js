/**
 * Check quiz count discrepancy
 */

require("dotenv").config();
const mongoose = require("mongoose");

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  totalQuizzesTaken: { type: Number, default: 0 },
});

// UserStats Schema
const UserStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalQuizzesTaken: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
});

// Result Schema (simplified)
const ResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quizId: mongoose.Schema.Types.ObjectId,
  quiz: mongoose.Schema.Types.ObjectId,
  score: Number,
  percentage: Number,
});

const User = mongoose.model("User", UserSchema);
const UserStats = mongoose.model("UserStats", UserStatsSchema, "userstats");
const Result = mongoose.model("Result", ResultSchema);

async function checkCounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find user
    const user = await User.findOne({ email: "amitesh@gmail.com" });
    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log(`📊 Checking stats for: ${user.name} (${user.email})`);
    console.log(`User ID: ${user._id}\n`);

    // Count actual results (check both userId and user fields)
    const actualCount = await Result.countDocuments({
      $or: [{ userId: user._id }, { user: user._id }],
    });

    // Get User model count
    const userModelCount = user.totalQuizzesTaken || 0;

    // Get UserStats model count
    const userStats = await UserStats.findOne({ user: user._id });
    const statsModelCount = userStats?.totalQuizzesTaken || 0;

    console.log("📈 Quiz Counts:");
    console.log(`  Actual Results in DB: ${actualCount}`);
    console.log(`  User.totalQuizzesTaken: ${userModelCount}`);
    console.log(`  UserStats.totalQuizzesTaken: ${statsModelCount}`);

    console.log("\n🔍 Discrepancies:");
    if (actualCount !== userModelCount) {
      console.log(`  ⚠️  User model off by: ${userModelCount - actualCount}`);
    } else {
      console.log(`  ✅ User model matches actual count`);
    }

    if (actualCount !== statsModelCount) {
      console.log(
        `  ⚠️  UserStats model off by: ${statsModelCount - actualCount}`
      );
    } else {
      console.log(`  ✅ UserStats model matches actual count`);
    }

    // Show recent results
    console.log("\n📋 Recent Results:");
    const recentResults = await Result.find({
      $or: [{ userId: user._id }, { user: user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("score percentage createdAt");

    recentResults.forEach((r, i) => {
      console.log(
        `  ${i + 1}. Score: ${r.score}, Percentage: ${r.percentage}%, Date: ${
          r.createdAt || "N/A"
        }`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkCounts();
