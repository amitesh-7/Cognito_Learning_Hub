const Redis = require("./microservices/gamification-service/node_modules/ioredis");

const REDIS_URL =
  "redis://default:CECYJIPYq1y38tpPAHxXfKGvnhaBtKz7@redis-12364.c238.us-central1-2.gce.cloud.redislabs.com:12364";

async function clearAllUserStats() {
  try {
    console.log("🧹 Clearing ALL user stats from Redis...\n");

    const redis = new Redis(REDIS_URL);

    // Find all keys matching userstats:* pattern
    const keys = await redis.keys("userstats:*");
    console.log(`Found ${keys.length} userstats keys`);

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`✅ Deleted ${keys.length} userstats keys`);
    }

    // Also clear user_stats:* pattern (old cache format)
    const oldKeys = await redis.keys("user_stats:*");
    if (oldKeys.length > 0) {
      await redis.del(...oldKeys);
      console.log(`✅ Deleted ${oldKeys.length} old cache keys`);
    }

    await redis.quit();

    console.log(
      "\n🎉 Redis cleared! Restart gamification service to reload from MongoDB."
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

clearAllUserStats();
