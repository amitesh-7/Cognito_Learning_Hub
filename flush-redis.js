const Redis = require("./microservices/gamification-service/node_modules/ioredis");

// CORRECT PRODUCTION Redis URL
const REDIS_URL =
  "redis://default:qzg9lR7YfMcoOrxtJXp85jgYp6bGpgSd@redis-10173.c330.asia-south1-1.gce.cloud.redislabs.com:10173";

async function flushAllStatsKeys() {
  try {
    console.log("🧹 AGGRESSIVELY clearing ALL stats keys from Redis...\n");

    const redis = new Redis(REDIS_URL);

    const userId = "690e1b64fa247bb4ed12c8c1";

    // Try ALL possible key patterns
    const patterns = [
      `userstats:${userId}`,
      `user_stats:${userId}`,
      `stats:${userId}`,
      `user:${userId}:stats`,
      `gamification:${userId}`,
    ];

    console.log("Checking all possible key patterns...\n");

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        console.log(`Found key: ${pattern}`);
        await redis.del(...keys);
        console.log(`✅ Deleted: ${pattern}`);
      }
    }

    // Also check wildcard patterns
    const wildcardKeys = await redis.keys("*690e1b64fa247bb4ed12c8c1*");
    if (wildcardKeys.length > 0) {
      console.log(`\nFound ${wildcardKeys.length} keys with userId:`);
      wildcardKeys.forEach((key) => console.log(`  - ${key}`));
      await redis.del(...wildcardKeys);
      console.log(`✅ Deleted all ${wildcardKeys.length} keys`);
    }

    await redis.quit();

    console.log("\n🎉 ALL Redis keys cleared!");
    console.log(
      "\n⚠️ IMPORTANT: You need to RESTART the gamification service on Render"
    );
    console.log("   Go to: https://dashboard.render.com");
    console.log(
      "   → gamification-service → Manual Deploy → Clear build cache & deploy"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

flushAllStatsKeys();
