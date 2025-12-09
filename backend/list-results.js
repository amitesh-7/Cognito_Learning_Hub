/**
 * List recent results to check for duplicates
 */

require("dotenv").config();
const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({}, { strict: false });
const Result = mongoose.model("Result", ResultSchema);

async function listResults() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const userId = new mongoose.Types.ObjectId("6894724b41ab13d9fdb1e168");

    const results = await Result.find({
      $or: [{ userId }, { user: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);
    console.log(`📋 Total results for user: ${results.length}\n`);

    results.forEach((r, i) => {
      console.log(`${i + 1}. ID: ${r._id}`);
      console.log(
        `   Score: ${r.correctAnswers || r.score}/${r.totalQuestions}`
      );
      console.log(`   Percentage: ${r.percentage}%`);
      console.log(`   Quiz ID: ${r.quizId || r.quiz}`);
      console.log(`   Created: ${r.createdAt || r._id.getTimestamp()}`);
      console.log("");
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

listResults();
