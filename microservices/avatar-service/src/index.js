const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const avatarRoutes = require("./routes/avatar");
const emotionRoutes = require("./routes/emotions");
const evolutionRoutes = require("./routes/evolution");
const voiceRoutes = require("./routes/voice");
const learningStyleRoutes = require("./routes/learningStyle");

const app = express();
const PORT = process.env.PORT || 3010;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { error: "Too many requests, please try again later." },
});

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(limiter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "avatar-service",
    version: "1.0.0",
    status: "online",
    description: "AI-Generated Personalized Learning Avatars",
    features: [
      "Personalized avatar customization",
      "AI-learned learning styles",
      "Emotional reactions during quizzes",
      "Voice-cloned explanations",
      "Avatar evolution based on performance",
    ],
    endpoints: {
      health: "/health",
      avatar: "/api/avatar",
      emotions: "/api/emotions",
      evolution: "/api/evolution",
      voice: "/api/voice",
      learningStyle: "/api/learning-style",
    },
  });
});

// Health check
app.get("/health", async (req, res) => {
  const mongoStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const memUsage = process.memoryUsage();

  res.json({
    status: "ok",
    service: "avatar-service",
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
    },
  });
});

// Routes
app.use("/api/avatar", avatarRoutes);
app.use("/api/emotions", emotionRoutes);
app.use("/api/evolution", evolutionRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/learning-style", learningStyleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    service: "avatar-service",
  });
});

// Initialize services
async function initialize() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
    });
    console.log("✅ MongoDB connected");

    // Start server
    app.listen(PORT, () => {
      console.log(`🎭 Avatar Service running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

initialize();

module.exports = app;
