/**
 * Authentication Service - Main Entry Point
 * Handles user authentication, registration, and profile management
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Shared utilities
const createLogger = require("../shared/utils/logger");
const ApiResponse = require("../shared/utils/response");
const { errorHandler } = require("../shared/middleware/errorHandler");
const { generalLimiter } = require("../shared/middleware/rateLimiter");

// Service-specific imports
const database = require("./models");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

// Initialize
const app = express();
const logger = createLogger("auth-service");
const PORT = process.env.PORT || 3001;

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Security & Middleware
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Input Sanitization (XSS & Injection Protection)
const { sanitizeAll } = require("../shared/middleware/inputValidation");
app.use(sanitizeAll);

app.use(generalLimiter);

// Request Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// Health Check Endpoint
app.get("/health", async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();

    res.json(
      ApiResponse.success({
        service: "auth-service",
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbHealth ? "connected" : "disconnected",
        memory: process.memoryUsage(),
      })
    );
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json(
      ApiResponse.error("Service unhealthy", 503, {
        database: "disconnected",
      })
    );
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// 404 Handler - catch all unmatched routes
app.use((req, res, next) => {
  return ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
});

// Error Handler
app.use((err, req, res, next) => {
  // Check if response already sent or connection closed
  if (res.headersSent || !res.writable) {
    logger.warn("Response already sent or connection closed");
    return next(err);
  }

  logger.error("Unhandled error:", err);

  const statusCode = err.statusCode || 500;
  const errors =
    process.env.NODE_ENV === "development" ? { stack: err.stack } : null;

  return ApiResponse.error(
    res,
    err.message || "Internal server error",
    statusCode,
    errors
  );
});

// Graceful Shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing server gracefully");
  await database.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, closing server gracefully");
  await database.disconnect();
  process.exit(0);
});

// Start Server
async function startServer() {
  try {
    // Initialize database
    await database.initialize();
    logger.info("Database connected successfully");

    // Start listening
    app.listen(PORT, () => {
      const serviceUrl =
        process.env.NODE_ENV === "production"
          ? process.env.AUTH_SERVICE_URL || `https://auth-service.onrender.com`
          : `http://localhost:${PORT}`;

      logger.info(`Auth Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`Health check: ${serviceUrl}/health`);
    });
  } catch (error) {
    logger.error("Failed to start auth service:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startServer();

module.exports = app;
