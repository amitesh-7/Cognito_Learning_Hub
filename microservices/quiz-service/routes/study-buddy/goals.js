const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../../shared/middleware/auth");
const StudyGoal = require("../../models/study-buddy/StudyGoal");

/**
 * @route   POST /api/goals
 * @desc    Create a new study goal
 * @access  Private
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      targetDate,
      relatedTopics,
      priority,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Title is required",
      });
    }

    const goal = new StudyGoal({
      user: req.user.id,
      title,
      description,
      category,
      targetDate,
      relatedTopics,
      priority,
    });

    await goal.save();

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create goal",
    });
  }
});

/**
 * @route   GET /api/goals
 * @desc    Get all user goals
 * @access  Private
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, category } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;
    if (category) query.category = category;

    const goals = await StudyGoal.find(query).sort({
      priority: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch goals",
    });
  }
});

/**
 * @route   GET /api/goals/:id
 * @desc    Get specific goal
 * @access  Private
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const goal = await StudyGoal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: "Goal not found",
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch goal",
    });
  }
});

/**
 * @route   PUT /api/goals/:id
 * @desc    Update a goal
 * @access  Private
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updates = req.body;

    const goal = await StudyGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: "Goal not found",
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update goal",
    });
  }
});

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a goal
 * @access  Private
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const goal = await StudyGoal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: "Goal not found",
      });
    }

    res.json({
      success: true,
      message: "Goal deleted",
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete goal",
    });
  }
});

/**
 * @route   POST /api/goals/:id/milestone
 * @desc    Add milestone to goal
 * @access  Private
 */
router.post("/:id/milestone", authenticateToken, async (req, res) => {
  try {
    const { title, description, targetDate } = req.body;

    const goal = await StudyGoal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: "Goal not found",
      });
    }

    goal.milestones.push({ title, description, targetDate });
    await goal.save();

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error("Error adding milestone:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add milestone",
    });
  }
});

/**
 * @route   PUT /api/goals/:id/milestone/:milestoneId
 * @desc    Update milestone completion
 * @access  Private
 */
router.put(
  "/:id/milestone/:milestoneId",
  authenticateToken,
  async (req, res) => {
    try {
      const { completed } = req.body;

      const goal = await StudyGoal.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!goal) {
        return res.status(404).json({
          success: false,
          error: "Goal not found",
        });
      }

      const milestone = goal.milestones.id(req.params.milestoneId);
      if (!milestone) {
        return res.status(404).json({
          success: false,
          error: "Milestone not found",
        });
      }

      milestone.completed = completed;
      if (completed) {
        milestone.completedAt = new Date();
      }

      // Update goal progress
      const completedMilestones = goal.milestones.filter(
        (m) => m.completed
      ).length;
      goal.progress = Math.round(
        (completedMilestones / goal.milestones.length) * 100
      );

      await goal.save();

      res.json({
        success: true,
        data: goal,
      });
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update milestone",
      });
    }
  }
);

module.exports = router;
