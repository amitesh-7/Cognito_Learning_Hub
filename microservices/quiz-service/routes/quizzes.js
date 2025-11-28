/**
 * Quiz CRUD Routes with Optimized Queries
 */

const express = require('express');
const ApiResponse = require('../../shared/utils/response');
const createLogger = require('../../shared/utils/logger');
const { authenticateToken, optionalAuth } = require('../../shared/middleware/auth');
const { requireTeacher } = require('../../shared/middleware/roles');
const Quiz = require('../models/Quiz');

const router = express.Router();
const logger = createLogger('quiz-routes');

/**
 * @route   GET /api/quizzes
 * @desc    Get all quizzes with search and filters (optimized)
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      difficulty,
      category,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const result = await Quiz.searchQuizzes({
      search,
      difficulty,
      category,
      isPublic: true,
      page,
      limit,
      sortBy,
      sortOrder: sortOrder === 'asc' ? 1 : -1,
    });

    res.json(ApiResponse.success(result));
  } catch (error) {
    logger.error('Get quizzes error:', error);
    res.status(500).json(ApiResponse.error('Failed to fetch quizzes', 500));
  }
});

/**
 * @route   GET /api/quizzes/my-quizzes
 * @desc    Get current user's quizzes
 * @access  Private
 */
router.get('/my-quizzes', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt' } = req.query;

    const result = await Quiz.searchQuizzes({
      createdBy: req.user.userId,
      page,
      limit,
      sortBy,
      sortOrder: -1,
    });

    res.json(ApiResponse.success(result));
  } catch (error) {
    logger.error('Get my quizzes error:', error);
    res.status(500).json(ApiResponse.error('Failed to fetch your quizzes', 500));
  }
});

/**
 * @route   GET /api/quizzes/popular
 * @desc    Get popular quizzes
 * @access  Public
 */
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const quizzes = await Quiz.getPopularQuizzes(limit);
    res.json(ApiResponse.success({ quizzes }));
  } catch (error) {
    logger.error('Get popular quizzes error:', error);
    res.status(500).json(ApiResponse.error('Failed to fetch popular quizzes', 500));
  }
});

/**
 * @route   GET /api/quizzes/recent
 * @desc    Get recent quizzes
 * @access  Public
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const quizzes = await Quiz.getRecentQuizzes(limit);
    res.json(ApiResponse.success({ quizzes }));
  } catch (error) {
    logger.error('Get recent quizzes error:', error);
    res.status(500).json(ApiResponse.error('Failed to fetch recent quizzes', 500));
  }
});

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get quiz by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name email picture')
      .lean();

    if (!quiz) {
      return res.status(404).json(ApiResponse.notFound('Quiz not found'));
    }

    // Check if user has access to private quiz
    if (!quiz.isPublic && (!req.user || quiz.createdBy._id.toString() !== req.user.userId)) {
      return res.status(403).json(ApiResponse.forbidden('Access denied to private quiz'));
    }

    res.json(ApiResponse.success({ quiz }));
  } catch (error) {
    logger.error('Get quiz error:', error);
    res.status(500).json(ApiResponse.error('Failed to fetch quiz', 500));
  }
});

/**
 * @route   GET /api/quizzes/:id/student
 * @desc    Get quiz for taking (without answers)
 * @access  Private
 */
router.get('/:id/student', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name picture');

    if (!quiz) {
      return res.status(404).json(ApiResponse.notFound('Quiz not found'));
    }

    const studentVersion = quiz.getStudentVersion();
    res.json(ApiResponse.success({ quiz: studentVersion }));
  } catch (error) {
    logger.error('Get student quiz error:', error);
    res.status(500).json(ApiResponse.error('Failed to fetch quiz', 500));
  }
});

/**
 * @route   POST /api/quizzes
 * @desc    Create manual quiz
 * @access  Private (Teacher)
 */
router.post('/', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { title, description, questions, difficulty, category, tags, isPublic, gameSettings } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json(ApiResponse.badRequest('Title and questions are required'));
    }

    const quiz = new Quiz({
      title,
      description,
      questions,
      difficulty: difficulty || 'Medium',
      category: category || 'General',
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      gameSettings: gameSettings || {},
      createdBy: req.user.userId,
      generationMetadata: {
        method: 'manual',
        generatedAt: new Date(),
      },
    });

    const savedQuiz = await quiz.save();
    logger.info(`Manual quiz created: ${savedQuiz._id} by user ${req.user.userId}`);

    res.status(201).json(ApiResponse.created({ quiz: savedQuiz }));
  } catch (error) {
    logger.error('Create quiz error:', error);
    res.status(500).json(ApiResponse.error('Failed to create quiz', 500));
  }
});

/**
 * @route   PUT /api/quizzes/:id
 * @desc    Update quiz
 * @access  Private (Owner)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json(ApiResponse.notFound('Quiz not found'));
    }

    if (quiz.createdBy.toString() !== req.user.userId && req.user.role !== 'Admin') {
      return res.status(403).json(ApiResponse.forbidden('Not authorized to update this quiz'));
    }

    const { title, description, questions, difficulty, category, tags, isPublic, gameSettings } = req.body;

    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (questions) quiz.questions = questions;
    if (difficulty) quiz.difficulty = difficulty;
    if (category) quiz.category = category;
    if (tags) quiz.tags = tags;
    if (isPublic !== undefined) quiz.isPublic = isPublic;
    if (gameSettings) quiz.gameSettings = gameSettings;

    const updatedQuiz = await quiz.save();
    logger.info(`Quiz updated: ${updatedQuiz._id}`);

    res.json(ApiResponse.success({ quiz: updatedQuiz }));
  } catch (error) {
    logger.error('Update quiz error:', error);
    res.status(500).json(ApiResponse.error('Failed to update quiz', 500));
  }
});

/**
 * @route   DELETE /api/quizzes/:id
 * @desc    Delete quiz
 * @access  Private (Owner/Admin)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json(ApiResponse.notFound('Quiz not found'));
    }

    if (quiz.createdBy.toString() !== req.user.userId && req.user.role !== 'Admin') {
      return res.status(403).json(ApiResponse.forbidden('Not authorized to delete this quiz'));
    }

    await quiz.deleteOne();
    logger.info(`Quiz deleted: ${req.params.id}`);

    res.json(ApiResponse.success({ message: 'Quiz deleted successfully' }));
  } catch (error) {
    logger.error('Delete quiz error:', error);
    res.status(500).json(ApiResponse.error('Failed to delete quiz', 500));
  }
});

module.exports = router;
