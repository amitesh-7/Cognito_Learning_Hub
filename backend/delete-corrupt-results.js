/**
 * Delete corrupt results that have missing quiz/user references
 * or impossible score values
 */

const mongoose = require("mongoose");
const Result = require("./models/Result");
require("dotenv").config();

async function deleteCorruptResults() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Find corrupt results
    const corruptResults = await Result.find({
      $or: [
        { quiz: { $exists: false } },
        { quiz: null },
        { quiz: undefined },
        { user: { $exists: false } },
        { user: null },
        { user: undefined },
      ],
    });

    console.log(
      `Found ${corruptResults.length} corrupt results (missing quiz/user)`
    );

    // Also find results with impossible scores
    const allResults = await Result.find({});
    const impossibleScores = allResults.filter(
      (r) => r.score > r.totalQuestions && r.totalQuestions > 0
    );

    console.log(
      `Found ${impossibleScores.length} results with impossible scores`
    );

    const toDelete = [...corruptResults, ...impossibleScores];
    const uniqueToDelete = [
      ...new Map(toDelete.map((item) => [item._id.toString(), item])).values(),
    ];

    console.log(`\nDeleting ${uniqueToDelete.length} corrupt results...`);

    for (const result of uniqueToDelete) {
      console.log(
        `  Deleting ${result._id}: score=${result.score}/${result.totalQuestions}, quiz=${result.quiz}, user=${result.user}`
      );
      await Result.deleteOne({ _id: result._id });
    }

    console.log(`\n✅ Deleted ${uniqueToDelete.length} corrupt results`);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

deleteCorruptResults();
