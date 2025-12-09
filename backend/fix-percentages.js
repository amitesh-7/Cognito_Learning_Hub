/**
 * Fix incorrect percentage calculations in existing results
 * Run this once to update all results with correct percentages
 */

const mongoose = require("mongoose");
const Result = require("./models/Result");
require("dotenv").config();

async function fixPercentages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Find all results
    const results = await Result.find({});
    console.log(`Found ${results.length} results to check`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const result of results) {
      try {
        // Calculate correct percentage
        const correctPercentage =
          result.totalQuestions > 0
            ? Math.round((result.score / result.totalQuestions) * 100)
            : 0;

        // Check if percentage is wrong
        if (result.percentage !== correctPercentage) {
          console.log(`Fixing result ${result._id}:`);
          console.log(`  Quiz: ${result.quiz}`);
          console.log(`  Score: ${result.score}/${result.totalQuestions}`);
          console.log(`  Old percentage: ${result.percentage}%`);
          console.log(`  New percentage: ${correctPercentage}%`);

          // Update the result
          result.percentage = correctPercentage;

          // Also fix passed status
          result.passed = correctPercentage >= 60;

          // Update rank
          result.rank =
            correctPercentage >= 90
              ? "A+"
              : correctPercentage >= 80
              ? "A"
              : correctPercentage >= 70
              ? "B+"
              : correctPercentage >= 60
              ? "B"
              : "C";

          await result.save();
          updatedCount++;
        }
      } catch (err) {
        console.error(`Error fixing result ${result._id}:`, err.message);
        errorCount++;
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total results: ${results.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(
      `Already correct: ${results.length - updatedCount - errorCount}`
    );

    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixPercentages();
