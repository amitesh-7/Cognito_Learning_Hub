/**
 * Quiz Service - Main Server
 * Port: 3002
 * Features: AI quiz generation, CRUD operations, caching, job queue
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const createLogger = require('../shared/utils/logger');
const ApiResponse = require('../shared/utils/response');
const cacheManager = require('./services/cacheManager');
const queueManager = require('./services/queueManager');

const app = express();
const logger = createLogger('quiz-service');
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/generate', require('./routes/generation'));
app.use('/api/quizzes', require('./routes/quizzes'));

// Health check
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      service: 'quiz-service',
      timestamp: new Date().toISOString(),
      checks: {
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        redis: cacheManager.isConnected() ? 'connected' : 'disconnected',
        queue: 'operational',
      },
    };

    const queueStats = await queueManager.getQueueStats();
    health.queue = queueStats;

    res.json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json(ApiResponse.notFound('Route not found'));
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json(
    ApiResponse.error(err.message || 'Internal server error', err.status || 500)
  );
});

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Redis connection
const connectRedis = async () => {
  try {
    await cacheManager.connect();
    logger.info('Redis connected');
  } catch (error) {
    logger.error('Redis connection error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  try {
    // Close HTTP server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('HTTP server closed');
    }

    // Close database connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');

    // Close Redis connection
    await cacheManager.disconnect();
    logger.info('Redis connection closed');

    // Close queue
    await queueManager.close();
    logger.info('Job queue closed');

    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
let server;
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    server = app.listen(PORT, () => {
      logger.info(`Quiz Service running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info('Remember to start the worker: npm run worker');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
