/**
 * Database Configuration for Quiz Service
 */

const DatabaseConnection = require('../../shared/utils/database');
const createLogger = require('../../shared/utils/logger');

const logger = createLogger('quiz-service');

class QuizDatabase extends DatabaseConnection {
  constructor() {
    super(process.env.MONGODB_URI, {
      serviceName: 'quiz-service',
      logger: logger,
    });
  }

  /**
   * Initialize database and load models
   */
  async initialize() {
    try {
      await this.connect();
      
      // Load Quiz model
      require('./Quiz');
      
      logger.info('Quiz service models loaded successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize quiz database:', error);
      throw error;
    }
  }

  /**
   * Get Quiz model
   */
  getQuizModel() {
    const mongoose = require('mongoose');
    return mongoose.model('Quiz');
  }
}

module.exports = new QuizDatabase();
