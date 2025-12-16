/**
 * Event Routes for Social Service
 * Handles incoming events from other microservices (e.g., Gamification)
 */

const express = require("express");
const ApiResponse = require("../../shared/utils/response");
const createLogger = require("../../shared/utils/logger");
const Post = require("../models/Post");
const notificationManager = require("../services/notificationManager");
const { getNotificationQueue } = require("../workers/queueManager");

const router = express.Router();
const logger = createLogger("event-routes");

/**
 * @route   POST /api/events/achievement-unlocked
 * @desc    Handle achievement unlocked event from Gamification Service
 * @access  Internal (Service-to-Service)
 */
router.post("/achievement-unlocked", async (req, res) => {
  try {
    const { userId, achievement, userName, userPicture } = req.body;

    if (!userId || !achievement) {
      return res
        .status(400)
        .json(
          ApiResponse.badRequest("Missing required fields: userId, achievement")
        );
    }

    // Generate unique postId
    const postId = `post_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create social post about achievement
    const post = new Post({
      postId,
      authorId: userId,
      authorName: userName || "User",
      authorPicture: userPicture || "",
      type: "achievement",
      content: `Unlocked ${achievement.icon} ${achievement.name}! 🎉\n\n${achievement.description}`,
      relatedAchievement: achievement.id || achievement._id,
      visibility: "public",
    });

    await post.save();
    logger.info(
      `Created achievement post for user ${userId}: ${achievement.name}`
    );

    // Queue notification job for followers (async)
    const notificationQueue = getNotificationQueue();
    await notificationQueue.add("achievement-notification", {
      userId,
      achievementName: achievement.name,
      achievementIcon: achievement.icon,
      achievementRarity: achievement.rarity,
      postId: post._id.toString(),
    });

    res.json(
      ApiResponse.success({
        message: "Achievement event processed",
        postId: post._id,
      })
    );
  } catch (error) {
    logger.error("Error handling achievement unlock:", error);
    res
      .status(500)
      .json(ApiResponse.error("Failed to process achievement event", 500));
  }
});

/**
 * @route   POST /api/events/level-up
 * @desc    Handle level up event from Gamification Service
 * @access  Internal (Service-to-Service)
 */
router.post("/level-up", async (req, res) => {
  try {
    const { userId, level, experience } = req.body;

    if (!userId || !level) {
      return res
        .status(400)
        .json(ApiResponse.badRequest("Missing required fields: userId, level"));
    }

    // Generate unique postId
    const postId = `post_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create social post about level up
    const post = new Post({
      postId,
      authorId: userId,
      authorName: req.body.userName || "User",
      authorPicture: req.body.userPicture || "",
      type: "text",
      content: `Leveled up to Level ${level}! 🚀\n\nTotal XP: ${
        experience || 0
      }`,
      visibility: "public",
    });

    await post.save();
    logger.info(`Created level up post for user ${userId}: Level ${level}`);

    // Queue notification job
    const notificationQueue = getNotificationQueue();
    await notificationQueue.add("level-up-notification", {
      userId,
      level,
      postId: post._id.toString(),
    });

    res.json(
      ApiResponse.success({
        message: "Level up event processed",
        postId: post._id,
      })
    );
  } catch (error) {
    logger.error("Error handling level up:", error);
    res
      .status(500)
      .json(ApiResponse.error("Failed to process level up event", 500));
  }
});

/**
 * @route   POST /api/events/streak-milestone
 * @desc    Handle streak milestone event
 * @access  Internal (Service-to-Service)
 */
router.post("/streak-milestone", async (req, res) => {
  try {
    const { userId, streak } = req.body;

    if (!userId || !streak) {
      return res
        .status(400)
        .json(
          ApiResponse.badRequest("Missing required fields: userId, streak")
        );
    }

    // Only create posts for significant streaks (5, 10, 20, 30, etc.)
    const milestones = [5, 10, 20, 30, 50, 100];
    if (!milestones.includes(streak)) {
      return res.json(
        ApiResponse.success({
          message: "Streak not a milestone, no post created",
        })
      );
    }

    // Generate unique postId
    const postId = `post_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create social post about streak
    const post = new Post({
      postId,
      authorId: userId,
      authorName: req.body.userName || "User",
      authorPicture: req.body.userPicture || "",
      type: "text",
      content: `${streak}-day streak! 🔥 Keep it burning!`,
      visibility: "public",
    });

    await post.save();
    logger.info(`Created streak post for user ${userId}: ${streak} days`);

    res.json(
      ApiResponse.success({
        message: "Streak milestone event processed",
        postId: post._id,
      })
    );
  } catch (error) {
    logger.error("Error handling streak milestone:", error);
    res
      .status(500)
      .json(ApiResponse.error("Failed to process streak milestone event", 500));
  }
});

/**
 * @route   GET /api/events/health
 * @desc    Health check for event handlers
 * @access  Internal
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "social-event-handlers",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
