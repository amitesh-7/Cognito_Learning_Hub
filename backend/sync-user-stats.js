/**
 * Sync user stats (totalQuizzesTaken) with actual Result count
 * Run this after deleting corrupt results
 */

const mongoose = require("mongoose");
const User = require("./models/User");
const Result = require("./models/Result");
require("dotenv").config();

async function syncUserStats() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to sync`);

    let updatedCount = 0;
    let unchangedCount = 0;

    for (const user of users) {
      try {
        // Count actual results for this user
        const actualResultCount = await Result.countDocuments({
          user: user._id,
        });

        // Get current stats
        const currentCount = user.totalQuizzesTaken || 0;

        if (currentCount !== actualResultCount) {
          console.log(`\nUser: ${user.name} (${user.email})`);
          console.log(`  Old count: ${currentCount} quizzes`);
          console.log(`  Actual count: ${actualResultCount} quizzes`);
          console.log(`  Difference: ${currentCount - actualResultCount}`);

          // Update the user
          user.totalQuizzesTaken = actualResultCount;
          await user.save();
          updatedCount++;
        } else {
          unchangedCount++;
        }
      } catch (err) {
        console.error(`Error processing user ${user.email}:`, err.message);
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total users: ${users.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Already correct: ${unchangedCount}`);

    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

syncUserStats();
