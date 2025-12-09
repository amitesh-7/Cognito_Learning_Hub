/**
 * Clean corrupt results from database
 */

const mongoose = require("mongoose");
const Result = require("./models/Result");
require("dotenv").config();

async function cleanCorruptResults() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Delete results with missing user or quiz
    const deleteResult = await Result.deleteMany({
      $or: [
        { user: { $exists: false } },
        { user: null },
        { quiz: { $exists: false } },
        { quiz: null },
      ],
    });
    console.log(
      "Deleted results with missing user/quiz:",
      deleteResult.deletedCount
    );

    // Find and delete results with impossible scores (score > totalQuestions * 10)
    const allResults = await Result.find();
    let fixedCount = 0;

    for (const r of allResults) {
      // Score should never be more than totalQuestions * 10 (even with max points)
      if (r.score > r.totalQuestions * 10) {
        console.log(
          `Deleting impossible result: ${r._id} - score: ${r.score}, questions: ${r.totalQuestions}`
        );
        await Result.deleteOne({ _id: r._id });
        fixedCount++;
      }
    }
    console.log("Deleted results with impossible scores:", fixedCount);

    await mongoose.connection.close();
    console.log("Done!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

cleanCorruptResults();
