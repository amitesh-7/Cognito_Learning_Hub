/**
 * Backfill Gamification Data
 * Re-processes existing quiz results to award XP and points retroactively
 */

const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const GAMIFICATION_URL =
  process.env.GAMIFICATION_SERVICE_URL || "http://localhost:3007";

async function backfillGamification() {
  try {
    console.log("🔄 Starting gamification backfill...");
    console.log(`📡 MongoDB: ${MONGO_URI.split("@")[1]}`); // Hide credentials
    console.log(`🎮 Gamification Service: ${GAMIFICATION_URL}`);

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get results collection
    const resultsCollection = mongoose.connection.db.collection("results");

    // Find all results that need backfilling
    const results = await resultsCollection
      .find({})
      .sort({ createdAt: 1 })
      .toArray();

    console.log(`\n📊 Found ${results.length} total results to process`);

    if (results.length === 0) {
      console.log("No results found. Exiting...");
      process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;

    // Process each result
    for (const result of results) {
      try {
        const percentage = result.percentage || 0;
        const score = result.score || 0;
        const difficultyLevel = result.quizMetadata?.difficulty || "Medium";

        // Calculate XP (same formula as submission.js)
        const difficultyMultipliers = {
          Easy: 1.0,
          Medium: 1.5,
          Hard: 2.0,
          Expert: 2.5,
        };
        const difficultyMultiplier =
          difficultyMultipliers[difficultyLevel] || 1.5;
        let experienceGained = Math.round(score * difficultyMultiplier);

        // Performance bonus
        let bonusPoints = 0;
        if (percentage >= 80) {
          bonusPoints = Math.round(experienceGained * 0.5);
          experienceGained += bonusPoints;
        } else if (percentage >= 60) {
          bonusPoints = Math.round(experienceGained * 0.25);
          experienceGained += bonusPoints;
        }

        console.log(`\n📝 Processing result for user ${result.userId}`);
        console.log(
          `   Score: ${score}, Percentage: ${percentage}%, XP: ${experienceGained}`
        );

        // Send to gamification service
        const response = await axios.post(
          `${GAMIFICATION_URL}/api/events/quiz-completed`,
          {
            userId: result.userId.toString(),
            quizId: result.quizId.toString(),
            resultData: {
              percentage: percentage,
              pointsEarned: score,
              bonusPoints: bonusPoints,
              totalTimeTaken: result.totalTimeSpent
                ? result.totalTimeSpent / 1000
                : 0,
              passed: percentage >= 60,
              experienceGained: experienceGained,
              category: result.quizMetadata?.category || "General",
              difficulty: difficultyLevel,
              difficultyMultiplier: difficultyMultiplier,
            },
          }
        );

        if (response.data.success) {
          console.log(`   ✅ Gamification updated successfully`);
          successCount++;
        } else {
          console.log(`   ⚠️ Gamification response: ${response.data.message}`);
          failCount++;
        }
      } catch (error) {
        console.error(
          `   ❌ Failed to process result ${result._id}:`,
          error.message
        );
        if (error.response) {
          console.error(
            `      Status: ${error.response.status}, Data:`,
            error.response.data
          );
        }
        failCount++;
      }

      // Small delay to avoid overwhelming the service
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("\n═══════════════════════════════════════");
    console.log("🎉 Backfill Complete!");
    console.log(`✅ Success: ${successCount} results processed`);
    console.log(`❌ Failed: ${failCount} results`);
    console.log("═══════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Backfill failed:", error);
    process.exit(1);
  }
}

// Run the backfill
backfillGamification();
