/**
 * Database Configuration for Auth Service
 * Handles MongoDB connection with shared utilities
 */

const path = require('path');
const DatabaseConnection = require('../../shared/utils/database');

// Get shared logger
const createLogger = require('../../shared/utils/logger');
const logger = createLogger('auth-service');

class AuthDatabase extends DatabaseConnection {
  constructor() {
    super('auth-service');
  }

  /**
   * Initialize database and load models
   */
  async initialize() {
    try {
      // Use MONGO_URI from .env file
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error('MONGO_URI environment variable is not defined');
      }
      
      await this.connect(mongoUri);
      
      // Load User model
      require('./User');
      
      logger.info('Auth service models loaded successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize auth database:', error);
      throw error;
    }
  }

  /**
   * Get User model
   */
  getUserModel() {
    const mongoose = require('mongoose');
    return mongoose.model('User');
  }
}

module.exports = new AuthDatabase();
