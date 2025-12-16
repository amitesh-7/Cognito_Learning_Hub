const mongoose = require("mongoose");

// Production MongoDB
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://quizwise_user:Rakshita-1006@cluster0.2n6kw7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

/**
 * Backfill gamification stats by directly updating MongoDB
 * This bypasses the API to avoid Cloudflare rate limiting
 */
async function backfillStats() {
  try {
    console.log("🚀 Starting direct MongoDB backfill...\n");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const Results = db.collection("results");
    const UserStats = db.collection("userstats");

    // Get all results grouped by user
    const results = await Results.find({}).toArray();
    console.log(`📊 Found ${results.length} total quiz results\n`);

    // Group by userId
    const userResults = {};
    results.forEach((result) => {
      if (!result.userId) return;

      const userId = result.userId.toString();
      if (!userResults[userId]) {
        userResults[userId] = [];
      }
      userResults[userId].push(result);
    });

    console.log(`👥 Processing ${Object.keys(userResults).length} users...\n`);

    let usersUpdated = 0;

    for (const [userId, userQuizzes] of Object.entries(userResults)) {
      try {
        // Calculate stats from all quizzes
        let totalPoints = 0;
        let experience = 0;
        let totalQuizzesTaken = userQuizzes.length;
        let averageScore = 0;
        let perfectScoreCount = 0;
        let highScoreCount = 0;

        userQuizzes.forEach((result) => {
          const score = result.score || 0;
          const percentage = result.percentage || 0;
          const difficulty = result.quizMetadata?.difficulty || "Medium";

          // Calculate XP (same logic as submission.js)
          const multipliers = {
            Easy: 1.0,
            Medium: 1.5,
            Hard: 2.0,
            Expert: 2.5,
          };
          const multiplier = multipliers[difficulty] || 1.5;
          let xp = Math.round(score * multiplier);

          // Performance bonus
          if (percentage >= 80) {
            xp += Math.round(xp * 0.5);
          } else if (percentage >= 60) {
            xp += Math.round(xp * 0.25);
          }

          totalPoints += score;
          experience += xp;
          averageScore += percentage;

          if (percentage === 100) perfectScoreCount++;
          if (percentage >= 80) highScoreCount++;
        });

        averageScore =
          totalQuizzesTaken > 0
            ? Math.round(averageScore / totalQuizzesTaken)
            : 0;
        const level = Math.floor(Math.sqrt(experience / 25)) + 1;

        // Update or create user stats
        const updateResult = await UserStats.updateOne(
          { user: new mongoose.Types.ObjectId(userId) },
          {
            $set: {
              totalPoints,
              experience,
              level,
              totalQuizzesTaken,
              averageScore,
              perfectScoreCount,
              highScoreCount,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              user: new mongoose.Types.ObjectId(userId),
              badges: [],
              achievements: [],
              streaks: { current: 0, longest: 0 },
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );

        if (updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0) {
          usersUpdated++;
          console.log(
            `✅ User ${userId.substring(
              0,
              8
            )}... - Level ${level}, Points: ${totalPoints}, XP: ${experience}, Quizzes: ${totalQuizzesTaken}`
          );
        }
      } catch (error) {
        console.error(`❌ Error processing user ${userId}:`, error.message);
      }
    }

    await mongoose.connection.close();

    console.log(`\n🎉 Backfill complete!`);
    console.log(`   Users updated: ${usersUpdated}`);
    console.log(`   Total results processed: ${results.length}`);
  } catch (error) {
    console.error("❌ Backfill failed:", error.message);
    process.exit(1);
  }
}

backfillStats();
