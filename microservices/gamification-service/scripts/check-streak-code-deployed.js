/**
 * Script to check if the streak calculation fix is deployed
 * This checks if the production API has the updated code
 *
 * Usage: node scripts/check-streak-code-deployed.js
 */

const https = require("https");

const PROD_API = "https://api-gateway-kzo9.onrender.com/api/stats/me";
const TEST_USER_TOKEN = process.argv[2]; // Pass a valid JWT token as argument

if (!TEST_USER_TOKEN) {
  console.error("❌ Please provide a valid auth token");
  console.error(
    "Usage: node scripts/check-streak-code-deployed.js <auth-token>"
  );
  console.error("\nYou can get the token from:");
  console.error(
    "  1. Browser DevTools > Application > Local Storage > quizwise-token"
  );
  console.error("  2. OR from the Flutter app secure storage");
  process.exit(1);
}

console.log("🔍 Checking Production Deployment Status\n");
console.log("📡 Calling:", PROD_API);
console.log("");

const options = {
  headers: {
    "x-auth-token": TEST_USER_TOKEN,
    "Content-Type": "application/json",
  },
};

https
  .get(PROD_API, options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const response = JSON.parse(data);

        if (response.success && response.stats) {
          const stats = response.stats;

          console.log("✅ Response received successfully\n");
          console.log("📊 Checking Key Fields:");
          console.log(`  ├─ currentStreak: ${stats.currentStreak}`);
          console.log(`  ├─ longestStreak: ${stats.longestStreak}`);
          console.log(`  ├─ lastQuizDate: ${stats.lastQuizDate}`);
          console.log(
            `  ├─ achievementsUnlocked: ${stats.achievementsUnlocked}`
          );
          console.log(`  └─ totalAchievements: ${stats.totalAchievements}`);
          console.log("");

          // Check if code is deployed
          const hasLastQuizDate = "lastQuizDate" in stats;
          const hasAchievementCounts =
            "achievementsUnlocked" in stats && "totalAchievements" in stats;

          console.log("🔎 Deployment Status:");
          console.log(
            `  ├─ lastQuizDate field: ${
              hasLastQuizDate ? "✅ PRESENT" : "❌ MISSING"
            }`
          );
          console.log(
            `  ├─ Achievement counts: ${
              hasAchievementCounts ? "✅ PRESENT" : "❌ MISSING"
            }`
          );

          if (hasLastQuizDate && hasAchievementCounts) {
            console.log(`  └─ Status: ✅ STREAK FIX IS DEPLOYED`);
          } else if (hasAchievementCounts && !hasLastQuizDate) {
            console.log(
              `  └─ Status: ⚠️  PARTIALLY DEPLOYED (achievements fixed, streak not fixed)`
            );
          } else {
            console.log(`  └─ Status: ❌ STREAK FIX NOT DEPLOYED`);
          }

          console.log("");

          if (!hasLastQuizDate) {
            console.log("⚠️  ACTION REQUIRED:");
            console.log(
              "   The streak calculation fix is NOT deployed to production."
            );
            console.log("   You need to:");
            console.log(
              "   1. Commit and push the changes from statsManager.js and redis.js"
            );
            console.log(
              "   2. Redeploy the gamification-service on Render.com"
            );
            console.log(
              "   3. Wait for the deployment to complete (~5-10 minutes)"
            );
            console.log("   4. Run this script again to verify");
            console.log("");
            console.log(
              "   OR use the fix-user-streak.js script to manually update the database:"
            );
            console.log(
              "   node scripts/fix-user-streak.js <userId> <streakValue>"
            );
          } else if (stats.currentStreak === 0 && stats.lastQuizDate === null) {
            console.log("⚠️  NOTE:");
            console.log(
              "   The code is deployed but this user's streak is 0 with no lastQuizDate."
            );
            console.log("   This means either:");
            console.log(
              "   1. The user hasn't taken a quiz since the fix was deployed"
            );
            console.log(
              "   2. OR the user failed their last quiz (streak reset to 0)"
            );
            console.log("");
            console.log("   To manually set the streak, use:");
            console.log(
              "   node scripts/fix-user-streak.js <userId> <streakValue>"
            );
          }
        } else {
          console.error("❌ Invalid response:", response);
        }
      } catch (e) {
        console.error("❌ Error parsing response:", e);
        console.log("Raw response:", data);
      }
    });
  })
  .on("error", (e) => {
    console.error("❌ Request error:", e);
  });
