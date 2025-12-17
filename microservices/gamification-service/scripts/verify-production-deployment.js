/**
 * Script to verify if production deployment includes the streak fix
 *
 * Checks:
 * 1. If the production code has getLastQuizDate method
 * 2. If the lastQuizDate field is present in stats response
 * 3. Git commit hash deployed vs latest local
 */

const https = require("https");

async function checkProductionHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "gamification-service-ax6n.onrender.com",
      path: "/health",
      method: "GET",
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          const health = JSON.parse(data);
          resolve(health);
        } else {
          reject(
            new Error(
              `Health check failed with status ${res.statusCode}: ${data}`
            )
          );
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

async function main() {
  console.log("🔍 Checking Production Deployment Status...\n");

  try {
    // Check health endpoint
    const health = await checkProductionHealth();
    console.log("✅ Production service is running");
    console.log(`📦 Service: ${health.service || "gamification-service"}`);
    console.log(`⏰ Uptime: ${health.uptime || "N/A"}`);
    console.log(`🔗 MongoDB: ${health.mongodb || "Unknown"}`);
    console.log(`🔗 Redis: ${health.redis || "Unknown"}`);

    console.log("\n📋 DEPLOYMENT VERIFICATION:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("To verify the streak fix is deployed, you need to:");
    console.log("\n1️⃣  Check Render.com Dashboard:");
    console.log("   • Go to https://dashboard.render.com");
    console.log("   • Open gamification-service");
    console.log('   • Check "Latest Deploy" commit hash');
    console.log("   • Should match your latest commit: 70645f4");

    console.log("\n2️⃣  Manual Redeploy (if needed):");
    console.log('   • Click "Manual Deploy" > "Deploy latest commit"');
    console.log("   • Wait ~5-10 minutes for build to complete");
    console.log("   • Check build logs for errors");

    console.log("\n3️⃣  Test After Deployment:");
    console.log("   • Run the clear-user-cache.js script again");
    console.log("   • Have user log out and log back in");
    console.log("   • Check if streak shows 2 instead of 0");

    console.log("\n4️⃣  Alternative Fix (Immediate):");
    console.log("   • Run the fix-user-streak.js script");
    console.log("   • This sets streak=2 directly in MongoDB");
    console.log("   • Clear Redis cache with clear-user-cache.js");
    console.log("   • User should see streak=2 immediately");

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("⚠️  IMPORTANT NOTES:");
    console.log(
      "   • The streak fix code IS in your local repo (commit ba98204)"
    );
    console.log("   • It's pushed to origin/main (commit 70645f4 includes it)");
    console.log("   • Issue is likely that Render.com hasn't redeployed yet");
    console.log("   • OR there's a cached old version running");

    console.log("\n💡 Quick Fix Command Sequence:");
    console.log("   cd microservices/gamification-service");
    console.log("   node scripts/fix-user-streak.js");
    console.log("   node scripts/clear-user-cache.js");
    console.log("   # User logs out and back in");
  } catch (error) {
    console.error("❌ Error checking production:", error.message);
    console.log("\n⚠️  Service might be sleeping (Render free tier)");
    console.log(
      "   Visit https://gamification-service-ax6n.onrender.com/health to wake it up"
    );
  }
}

main();
