const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const cron = require("node-cron");
require("dotenv").config();

const { initializeRedis, getRedisClient } = require("./config/redis");
const { initializeQueues } = require("./config/queue");
const achievementRoutes = require("./routes/achievements");
const leaderboardRoutes = require("./routes/leaderboards");
const statsRoutes = require("./routes/stats");
const eventRoutes = require("./routes/events");
const xpRoutes = require("./routes/xp");
const worldEventRoutes = require("./routes/worldEvents");
const questRoutes = require("./routes/quests");
const dailyQuestRoutes = require("./routes/quest"); // Daily quests for avatar items
const avatarRoutes = require("./routes/avatar");
const { startStreakCronJob } = require("./jobs/streakChecker");
const { startStatsSyncJob } = require("./jobs/statsSync");
const createLogger = require("../../shared/utils/logger");
const { createLogger: createServiceLogger } = require("../../shared/utils/serviceLogger");

const logger = createLogger("gamification-service");
const serviceLogger = createServiceLogger("Gamification Service", process.env.ADMIN_SERVICE_URL);

const app = express();
const PORT = process.env.PORT || 3007;

// Input validation and sanitization
const { sanitizeAll } = require("../../shared/middleware/inputValidation");

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(sanitizeAll);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "gamification-service",
    version: "1.0.0",
    status: "online",
    endpoints: {
      health: "/health",
      achievements: "/api/achievements",
      leaderboards: "/api/leaderboards",
      stats: "/api/stats",
      events: "/api/events",
      avatar: "/api/avatar",
      quests: "/api/quests",
    },
  });
});

// Health check
app.get("/health", async (req, res) => {
  const redis = getRedisClient();
  const redisStatus = redis ? "connected" : "disconnected";
  const mongoStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const memUsage = process.memoryUsage();

  res.json({
    status: "ok",
    service: "gamification-service",
    port: PORT,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + "MB",
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + "MB",
      rss: Math.round(memUsage.rss / 1024 / 1024) + "MB",
    },
    connections: {
      mongodb: mongoStatus,
      redis: redisStatus,
    },
  });
});

// Routes
app.use("/api/achievements", achievementRoutes);
app.use("/api/leaderboards", leaderboardRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/world-events", worldEventRoutes); // Dynamic difficulty ecosystem
app.use("/api/quests", questRoutes); // Narrative-driven learning quests
app.use("/api/daily-quests", dailyQuestRoutes); // Daily challenges for avatar rewards
app.use("/api/avatar", avatarRoutes); // Avatar customization and unlockables
app.use("/api", xpRoutes); // XP and achievement check routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    service: "gamification-service",
  });
});

// Initialize services
async function initialize() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // Maximum connection pool size
      minPoolSize: 2, // Minimum connections to maintain
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000, // Check server health every 10s
      retryWrites: true,
      retryReads: true,
    });
    console.log("✅ MongoDB connected");

    // Initialize Redis
    await initializeRedis();
    console.log("✅ Redis connected");

    // Initialize Bull queues
    await initializeQueues();
    console.log("✅ Bull queues initialized");

    // Start cron jobs
    startStreakCronJob();
    console.log("✅ Streak checker cron job started");

    startStatsSyncJob();
    console.log("✅ Stats sync job started");

    // Start server
    app.listen(PORT, () => {
      console.log(`🎮 Gamification Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize service:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  const redis = getRedisClient();
  if (redis) await redis.quit();
  await mongoose.connection.close();
  process.exit(0);
});

initialize();

module.exports = app;
