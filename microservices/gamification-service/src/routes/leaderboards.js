const express = require('express');
const router = express.Router();
const leaderboardManager = require('../services/leaderboardManager');

/**
 * GET /api/leaderboards/global
 * Get global leaderboard
 */
router.get('/global', async (req, res, next) => {
  try {
    const { start = 0, limit = 100 } = req.query;

    const leaderboard = await leaderboardManager.getGlobalLeaderboard(
      parseInt(start),
      parseInt(limit)
    );

    res.json({
      success: true,
      type: 'global',
      start: parseInt(start),
      limit: parseInt(limit),
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaderboards/category/:category
 * Get category-specific leaderboard
 */
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const { start = 0, limit = 100 } = req.query;

    const leaderboard = await leaderboardManager.getCategoryLeaderboard(
      category,
      parseInt(start),
      parseInt(limit)
    );

    res.json({
      success: true,
      type: 'category',
      category,
      start: parseInt(start),
      limit: parseInt(limit),
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaderboards/weekly
 * Get weekly leaderboard
 */
router.get('/weekly', async (req, res, next) => {
  try {
    const { start = 0, limit = 100 } = req.query;

    const leaderboard = await leaderboardManager.getWeeklyLeaderboard(
      parseInt(start),
      parseInt(limit)
    );

    res.json({
      success: true,
      type: 'weekly',
      start: parseInt(start),
      limit: parseInt(limit),
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaderboards/monthly
 * Get monthly leaderboard
 */
router.get('/monthly', async (req, res, next) => {
  try {
    const { start = 0, limit = 100 } = req.query;

    const leaderboard = await leaderboardManager.getMonthlyLeaderboard(
      parseInt(start),
      parseInt(limit)
    );

    res.json({
      success: true,
      type: 'monthly',
      start: parseInt(start),
      limit: parseInt(limit),
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaderboards/rank/:userId
 * Get user's rank in global leaderboard
 */
router.get('/rank/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    const rankData = await leaderboardManager.getUserGlobalRank(userId);

    res.json({
      success: true,
      userId,
      rank: rankData.rank,
      score: rankData.score,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaderboards/rank/:userId/category/:category
 * Get user's rank in category leaderboard
 */
router.get('/rank/:userId/category/:category', async (req, res, next) => {
  try {
    const { userId, category } = req.params;

    const rankData = await leaderboardManager.getUserCategoryRank(userId, category);

    res.json({
      success: true,
      userId,
      category,
      rank: rankData.rank,
      score: rankData.score,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaderboards/surrounding/:userId
 * Get surrounding users in leaderboard
 */
router.get('/surrounding/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { range = 5 } = req.query;

    const surrounding = await leaderboardManager.getSurroundingUsers(
      userId,
      parseInt(range)
    );

    res.json({
      success: true,
      userId,
      range: parseInt(range),
      count: surrounding.length,
      leaderboard: surrounding,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leaderboards/rebuild (Admin)
 * Rebuild leaderboards from database
 */
router.post('/rebuild', async (req, res, next) => {
  try {
    await leaderboardManager.rebuildGlobalLeaderboard(0, 1000);

    res.json({
      success: true,
      message: 'Leaderboards rebuilt successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
