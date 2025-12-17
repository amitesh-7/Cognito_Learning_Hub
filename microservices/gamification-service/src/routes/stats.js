const express = require("express");
const router = express.Router();
const statsManager = require("../services/statsManager");
const {
  authenticateToken,
  adminMiddleware,
} = require("../../../shared/middleware/auth");

/**
 * GET /api/stats/me
 * Get current user's stats (special route for convenience)
 */
router.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User ID not found in token",
      });
    }

    const stats = await statsManager.getStats(userId);

    // Convert to plain object if it's a MongoDB document
    const plainStats = stats?.toObject ? stats.toObject() : stats;
    console.log(
      `📊 Base stats for user ${userId}:`,
      JSON.stringify(plainStats, null, 2)
    );

    // Add achievement counts to stats
    const { Achievement, UserAchievement } = require("../models/Achievement");

    let totalAchievements = 0;
    let achievementsUnlocked = 0;

    try {
      totalAchievements = await Achievement.countDocuments({
        isActive: true,
      });
      console.log(`🏆 Total achievements in system: ${totalAchievements}`);
    } catch (error) {
      console.error("Error counting total achievements:", error);
    }

    try {
      achievementsUnlocked = await UserAchievement.countDocuments({
        user: userId,
        isCompleted: true,
      });
      console.log(`🏆 User achievements unlocked: ${achievementsUnlocked}`);
    } catch (error) {
      console.error("Error counting user achievements:", error);
    }

    // Enrich stats with achievement data - ensure plain object
    const enrichedStats = {
      ...plainStats,
      achievementsUnlocked,
      unlockedAchievements: achievementsUnlocked, // Alias for compatibility
    };

    console.log(`✅ Enriched stats:`, enrichedStats);

    // Prevent browser caching of stats data
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.json({
      success: true,
      userId,
      stats: enrichedStats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/:userId
 * Get user stats
 */
router.get("/:userId", authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId || req.user.id || req.user._id;

    // Authorization: Users can only view their own stats unless admin
    if (userId !== currentUserId && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to view other users stats",
      });
    }

    const stats = await statsManager.getStats(userId);

    res.json({
      success: true,
      userId,
      stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/top/:statField
 * Get top users by a specific stat field
 */
router.get("/top/:statField", authenticateToken, async (req, res, next) => {
  try {
    const { statField } = req.params;
    const { limit = 10 } = req.query;

    const topUsers = await statsManager.getTopUsers(statField, parseInt(limit));

    res.json({
      success: true,
      statField,
      limit: parseInt(limit),
      count: topUsers.length,
      topUsers,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/stats/:userId/sync (Admin)
 * Force sync stats to database
 */
router.post(
  "/:userId/sync",
  authenticateToken,
  adminMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.params;

      const syncedStats = await statsManager.syncToDatabase(userId);

      res.json({
        success: true,
        userId,
        stats: syncedStats,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/stats/:userId
 * Update user stats (manual override - admin only)
 */
router.put(
  "/:userId",
  authenticateToken,
  adminMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const { UserStats } = require("../models/Achievement");
      const stats = await UserStats.findOneAndUpdate(
        { user: userId },
        { $set: updates },
        { new: true, upsert: true }
      );

      // Update cache
      const { cacheUserStats } = require("../config/redis");
      await cacheUserStats(userId, stats.toObject());

      res.json({
        success: true,
        userId,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/stats/bulk-update (Admin)
 * Bulk update stats for multiple users
 */
router.post(
  "/bulk-update",
  authenticateToken,
  adminMiddleware,
  async (req, res, next) => {
    try {
      const { updates } = req.body; // Array of { userId, data }

      const result = await statsManager.bulkUpdateStats(updates);

      res.json({
        success: true,
        message: "Bulk update complete",
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
