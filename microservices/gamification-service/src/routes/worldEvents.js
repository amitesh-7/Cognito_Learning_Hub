const express = require("express");
const router = express.Router();
const WorldEvent = require("../models/WorldEvent");
const { authenticateToken } = require("../../../shared/middleware/auth");

/**
 * @route   GET /api/events/active
 * @desc    Get all active world events
 * @access  Public
 */
router.get("/active", async (req, res) => {
  try {
    const events = await WorldEvent.getActiveEvents();

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error("Error fetching active events:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch active events",
    });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get specific event details
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const event = await WorldEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch event",
    });
  }
});

/**
 * @route   GET /api/events/type/:type
 * @desc    Get events by type
 * @access  Public
 */
router.get("/type/:type", async (req, res) => {
  try {
    const validTypes = [
      "seasonal",
      "community_goal",
      "difficulty_wave",
      "raid_boss",
      "special",
    ];

    if (!validTypes.includes(req.params.type)) {
      return res.status(400).json({
        success: false,
        error: "Invalid event type",
      });
    }

    const events = await WorldEvent.find({
      eventType: req.params.type,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events by type:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch events",
    });
  }
});

/**
 * @route   POST /api/events/:id/participate
 * @desc    Register user participation in event
 * @access  Private
 */
router.post("/:id/participate", authenticateToken, async (req, res) => {
  try {
    const event = await WorldEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // Check eligibility
    const eligibility = event.checkEligibility(req.user);

    if (!eligibility.eligible) {
      return res.status(403).json({
        success: false,
        error: eligibility.reason,
      });
    }

    res.json({
      success: true,
      message: "Registered for event",
      data: {
        eventId: event._id,
        rewards: event.rewards,
        conditions: event.conditions,
      },
    });
  } catch (error) {
    console.error("Error participating in event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to participate in event",
    });
  }
});

/**
 * @route   POST /api/events/:id/complete
 * @desc    Mark event participation complete (quiz finished)
 * @access  Private
 */
router.post("/:id/complete", authenticateToken, async (req, res) => {
  try {
    const { score, quizId } = req.body;

    const event = await WorldEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // Update event progress
    await event.updateProgress(true, score);

    // Calculate rewards
    const baseReward = Math.floor(score * 10);
    const totalReward =
      Math.floor(baseReward * event.rewards.xpMultiplier) +
      event.rewards.bonusPoints;

    res.json({
      success: true,
      message: "Event participation recorded",
      data: {
        xpEarned: totalReward,
        bonusPoints: event.rewards.bonusPoints,
        multiplier: event.rewards.xpMultiplier,
        progress:
          event.communityGoal?.currentProgress ||
          event.raidBoss?.successCount ||
          0,
        specialBadge: event.rewards.specialBadge,
      },
    });
  } catch (error) {
    console.error("Error completing event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete event",
    });
  }
});

/**
 * @route   GET /api/events/community-progress
 * @desc    Get community goal progress
 * @access  Public
 */
router.get("/community-progress", async (req, res) => {
  try {
    const communityEvents = await WorldEvent.find({
      eventType: "community_goal",
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    const progress = communityEvents.map((event) => ({
      id: event._id,
      title: event.title,
      current: event.communityGoal.currentProgress,
      target: event.communityGoal.targetQuizCount,
      percentage: Math.round(
        (event.communityGoal.currentProgress /
          event.communityGoal.targetQuizCount) *
          100
      ),
      participants: event.communityGoal.participants,
      endsAt: event.endDate,
    }));

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Error fetching community progress:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch community progress",
    });
  }
});

/**
 * @route   GET /api/events/raid-bosses
 * @desc    Get active raid bosses
 * @access  Public
 */
router.get("/raid-bosses", async (req, res) => {
  try {
    const raidBosses = await WorldEvent.find({
      eventType: "raid_boss",
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).populate("raidBoss.quizId", "title category difficulty");

    const bosses = raidBosses.map((event) => ({
      id: event._id,
      name: event.raidBoss.name,
      difficulty: event.raidBoss.difficulty,
      quiz: event.raidBoss.quizId,
      successCount: event.raidBoss.successCount,
      requiredSuccesses: event.raidBoss.requiredSuccesses,
      progress: Math.round(
        (event.raidBoss.successCount / event.raidBoss.requiredSuccesses) * 100
      ),
      rewards: event.rewards,
      endsAt: event.endDate,
    }));

    res.json({
      success: true,
      data: bosses,
    });
  } catch (error) {
    console.error("Error fetching raid bosses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch raid bosses",
    });
  }
});

/**
 * @route   POST /api/events (Admin only)
 * @desc    Create new world event
 * @access  Private/Admin
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    // Add admin check here if needed
    const event = new WorldEvent(req.body);
    await event.save();

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create event",
    });
  }
});

module.exports = router;
