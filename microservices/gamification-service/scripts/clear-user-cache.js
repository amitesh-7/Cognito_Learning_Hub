/**
 * Clear Redis cache for a specific user
 * This forces the app to fetch fresh data from MongoDB
 */

require("dotenv").config();
const {
  initializeRedis,
  getRedisClient,
  REDIS_KEYS,
} = require("../src/config/redis");

async function clearUserCache(userId) {
  try {
    console.log("🔌 Connecting to Redis...");
    await initializeRedis();
    const redis = getRedisClient();

    const key = REDIS_KEYS.USER_STATS(userId);
    console.log(`🗑️  Clearing cache key: ${key}`);

    const result = await redis.del(key);

    if (result === 1) {
      console.log("✅ Cache cleared successfully!");
    } else {
      console.log(
        "⚠️  Key not found in cache (already cleared or never cached)"
      );
    }

    console.log(
      "\n✅ Done! The Android app will now fetch fresh data from MongoDB."
    );
    console.log(
      "   Please restart the app or pull to refresh to see the updated streak."
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

const userId = process.argv[2];

if (!userId) {
  console.error("Usage: node scripts/clear-user-cache.js <userId>");
  console.error(
    "Example: node scripts/clear-user-cache.js 690e1b64fa247bb4ed12c8c1"
  );
  process.exit(1);
}

console.log("🧹 Clearing User Cache");
console.log(`   User ID: ${userId}\n`);

clearUserCache(userId);
