/**
 * Debug script to check production stats API
 * This helps diagnose why XP, points, and streak are showing 0 in production
 */

const https = require("https");

// You'll need to get a real token from production
// Login to https://cognito-learning-hub-frontend.vercel.app
// Open DevTools > Application > Local Storage > Look for 'quizwise-token'
const TOKEN = process.env.PROD_TOKEN || "PASTE_YOUR_TOKEN_HERE";

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api-gateway-kzo9.onrender.com",
      port: 443,
      path: path,
      method: "GET",
      headers: {
        "x-auth-token": TOKEN,
        "Content-Type": "application/json",
      },
    };

    https
      .get(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data, error: e.message });
          }
        });
      })
      .on("error", (e) => {
        reject(e);
      });
  });
}

async function debugStats() {
  console.log("🔍 Debugging Production Stats API\n");
  console.log("=".repeat(60));

  try {
    // 1. Check /api/stats/me
    console.log("\n📊 Checking /api/stats/me...");
    const statsResponse = await makeRequest("/api/stats/me");
    console.log(`Status: ${statsResponse.status}`);
    console.log("Response:", JSON.stringify(statsResponse.data, null, 2));

    if (statsResponse.data.success && statsResponse.data.stats) {
      const stats = statsResponse.data.stats;
      console.log("\n🔍 Key Stats Fields:");
      console.log(`  - experience: ${stats.experience}`);
      console.log(`  - totalPoints: ${stats.totalPoints}`);
      console.log(`  - currentStreak: ${stats.currentStreak}`);
      console.log(`  - level: ${stats.level}`);
      console.log(`  - totalQuizzesTaken: ${stats.totalQuizzesTaken}`);
      console.log(`  - achievementsUnlocked: ${stats.achievementsUnlocked}`);

      // Check if values are missing
      if (
        stats.experience === 0 &&
        stats.totalPoints === 0 &&
        stats.currentStreak === 0
      ) {
        console.log("\n⚠️  WARNING: All stats are 0! This could mean:");
        console.log("  1. User has never taken a quiz");
        console.log("  2. Redis cache is empty and MongoDB data is missing");
        console.log("  3. Stats sync is not working properly");
      }
    }

    // 2. Check leaderboard to see if user has points there
    console.log("\n\n🏆 Checking /api/leaderboards/global...");
    const leaderboardResponse = await makeRequest("/api/leaderboards/global");
    console.log(`Status: ${leaderboardResponse.status}`);
    if (leaderboardResponse.data.leaderboard) {
      console.log(
        `Top 3 users:`,
        leaderboardResponse.data.leaderboard
          .slice(0, 3)
          .map((u) => `${u.name}: ${u.totalPoints} pts`)
      );
    }

    // 3. Check achievements
    console.log("\n\n🏅 Checking user achievements...");
    const achievementsResponse = await makeRequest("/api/achievements");
    console.log(`Status: ${achievementsResponse.status}`);
    if (achievementsResponse.data.achievements) {
      console.log(
        `Total achievements: ${achievementsResponse.data.achievements.length}`
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Debug complete!");
    console.log("\n💡 TROUBLESHOOTING:");
    console.log("   If stats are 0 but you've taken quizzes, check:");
    console.log("   1. Redis is connected in production");
    console.log("   2. Result service is calling gamification service");
    console.log("   3. MongoDB has UserStats document for your user");
    console.log("   4. API gateway is routing correctly");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  }
}

// Run the debug
if (TOKEN === "PASTE_YOUR_TOKEN_HERE") {
  console.log("❌ ERROR: Please set PROD_TOKEN environment variable");
  console.log("   Get your token from production:");
  console.log(
    "   1. Login to https://cognito-learning-hub-frontend.vercel.app"
  );
  console.log("   2. Open DevTools > Application > Local Storage");
  console.log("   3. Copy the value of 'quizwise-token'");
  console.log(
    "   4. Run: set PROD_TOKEN=your_token_here && node debug-prod-stats.js"
  );
} else {
  debugStats();
}
