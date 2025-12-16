const mongoose = require("./microservices/gamification-service/node_modules/mongoose");

// Production MongoDB
const MONGO_URI =
  "mongodb+srv://quizwise_user:Rakshita-1006@cluster0.2n6kw7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function verifyProductionData() {
  try {
    console.log("🔍 Verifying production data...\n");
    await mongoose.connect(MONGO_URI);

    const userId = "690e1b64fa247bb4ed12c8c1";
    const db = mongoose.connection.db;

    const UserStats = db.collection("userstats");
    const stats = await UserStats.findOne({
      user: new mongoose.Types.ObjectId(userId),
    });

    if (stats && stats.totalPoints > 0) {
      console.log("✅ Production MongoDB has CORRECT data:");
      console.log("   Level:", stats.level);
      console.log("   Total Points:", stats.totalPoints);
      console.log("   Experience:", stats.experience);
      console.log("   Quizzes Taken:", stats.totalQuizzesTaken);
      console.log("\n🎯 Ready for production deployment!");
    } else {
      console.log(
        "❌ Production MongoDB has ZERO stats - need to run backfill"
      );
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

verifyProductionData();
