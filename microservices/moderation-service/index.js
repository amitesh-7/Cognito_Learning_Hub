const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const logger = require("./utils/logger");
const { createLogger: createServiceLogger } = require("../shared/utils/serviceLogger");
const serviceLogger = createServiceLogger("Moderation Service", process.env.ADMIN_SERVICE_URL);
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Trust proxy - Required for rate limiter to work correctly
// Allows express-rate-limit to correctly identify client IPs from X-Forwarded-For
app.set("trust proxy", 1); // Trust first proxy (required in all environments)

// Input validation and sanitization
const { sanitizeAll } = require("../shared/middleware/inputValidation");

// Middleware
app.use(cors());
app.use(compression({ level: 6, threshold: 1024 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeAll);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later",
});
app.use("/api/", limiter);

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  logger.error("MONGO_URI environment variable is not defined");
  process.exit(1);
}

mongoose
  .connect(mongoUri, {
    maxPoolSize: 10, // Maximum connection pool size
    minPoolSize: 2, // Minimum connections to maintain
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000, // Check server health every 10s
    retryWrites: true,
    retryReads: true,
  })
  .then(() => logger.info("MongoDB connected successfully"))
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
const reportRoutes = require("./routes/reports");
const actionRoutes = require("./routes/actions");
const appealRoutes = require("./routes/appeals");
const moderatorRoutes = require("./routes/moderator");
const adminRoutes = require("./routes/admin");

app.use("/api/reports", reportRoutes);
app.use("/api/actions", actionRoutes);
app.use("/api/appeals", appealRoutes);
app.use("/api/moderator", moderatorRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    status: "healthy",
    service: "moderation-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + "MB",
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + "MB",
      rss: Math.round(memUsage.rss / 1024 / 1024) + "MB",
    },
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/", (req, res) => {
  res.json({
    status: "i am alive",
    service: "moderation-service",
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Service info
app.get("/info", (req, res) => {
  res.json({
    service: "Moderation Service",
    version: "1.0.0",
    description: "Handles content moderation, user reports, and admin actions",
    endpoints: {
      reports: "/api/reports",
      actions: "/api/actions",
      appeals: "/api/appeals",
      health: "/health",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  mongoose.connection.close(false, () => {
    logger.info("MongoDB connection closed");
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  logger.info(`Moderation Service running on port ${PORT}`);
  console.log(`🛡️  Moderation Service running on port ${PORT}`);
});

module.exports = app;
