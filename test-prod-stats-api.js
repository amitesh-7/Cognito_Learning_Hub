// Quick script to test production stats API
const https = require("https");

const API_URL = "https://api-gateway-kzo9.onrender.com/api/stats/me";
const TOKEN = "YOUR_AUTH_TOKEN_HERE"; // Replace with actual token from Flutter app

const options = {
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
};

https
  .get(API_URL, options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        console.log("📊 Full Response:");
        console.log(JSON.stringify(parsed, null, 2));

        if (parsed.success && parsed.stats) {
          const stats = parsed.stats;
          console.log("\n🔥 Key Fields:");
          console.log(`  currentStreak: ${stats.currentStreak}`);
          console.log(`  streak: ${stats.streak}`);
          console.log(`  achievementsUnlocked: ${stats.achievementsUnlocked}`);
          console.log(`  totalAchievements: ${stats.totalAchievements}`);
          console.log(`  totalQuizzesTaken: ${stats.totalQuizzesTaken}`);
          console.log(`  totalPoints: ${stats.totalPoints}`);
          console.log(`  level: ${stats.level}`);
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

console.log("🔍 Testing production API:", API_URL);
console.log("⏳ Waiting for response...\n");
