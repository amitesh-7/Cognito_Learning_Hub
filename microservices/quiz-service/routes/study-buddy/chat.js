const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../../shared/middleware/auth");
const aiStudyBuddyService = require("../../services/study-buddy/aiStudyBuddy");
const Conversation = require("../../models/study-buddy/Conversation");
const LearningMemory = require("../../models/study-buddy/LearningMemory");
const { v4: uuidv4 } = require("uuid");

/**
 * @route   POST /api/chat/message
 * @desc    Send message to AI Study Buddy
 * @access  Private
 */
router.post("/message", authenticateToken, async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Generate or use existing session ID
    const activeSessionId = sessionId || uuidv4();

    // Generate AI response
    const result = await aiStudyBuddyService.generateResponse(
      req.user.id,
      message,
      activeSessionId,
      context || {}
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process message",
    });
  }
});

/**
 * @route   GET /api/chat/conversations
 * @desc    Get user's conversation history
 * @access  Private
 */
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const { limit = 10, status = "active" } = req.query;

    const conversations = await Conversation.find({
      user: req.user.id,
      ...(status !== "all" && { status }),
    })
      .sort({ "metadata.lastActivity": -1 })
      .limit(parseInt(limit))
      .select("sessionId summary topics metadata status createdAt");

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversations",
    });
  }
});

/**
 * @route   GET /api/chat/conversation/:sessionId
 * @desc    Get specific conversation details
 * @access  Private
 */
router.get("/conversation/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const conversation = await Conversation.findOne({
      user: req.user.id,
      sessionId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversation",
    });
  }
});

/**
 * @route   GET /api/chat/conversation/:sessionId/summary
 * @desc    Get conversation summary
 * @access  Private
 */
router.get(
  "/conversation/:sessionId/summary",
  authenticateToken,
  async (req, res) => {
    try {
      const { sessionId } = req.params;

      const summary = await aiStudyBuddyService.getConversationSummary(
        req.user.id,
        sessionId
      );

      if (!summary) {
        return res.status(404).json({
          success: false,
          error: "Conversation not found",
        });
      }

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Error fetching summary:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch summary",
      });
    }
  }
);

/**
 * @route   DELETE /api/chat/conversation/:sessionId
 * @desc    Delete or archive a conversation
 * @access  Private
 */
router.delete(
  "/conversation/:sessionId",
  authenticateToken,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { archive = true } = req.query;

      if (archive === "false") {
        // Permanently delete
        await Conversation.deleteOne({
          user: req.user.id,
          sessionId,
        });
      } else {
        // Archive
        await Conversation.updateOne(
          { user: req.user.id, sessionId },
          { status: "archived" }
        );
      }

      res.json({
        success: true,
        message:
          archive === "false"
            ? "Conversation deleted"
            : "Conversation archived",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete conversation",
      });
    }
  }
);

/**
 * @route   GET /api/chat/memories
 * @desc    Get user's learning memories
 * @access  Private
 */
router.get("/memories", authenticateToken, async (req, res) => {
  try {
    const { type, topic, limit = 20 } = req.query;

    const query = { user: req.user.id };
    if (type) query.memoryType = type;
    if (topic) query.topic = topic;

    const memories = await LearningMemory.find(query)
      .sort({ importance: -1, lastAccessed: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: memories,
    });
  } catch (error) {
    console.error("Error fetching memories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch memories",
    });
  }
});

/**
 * @route   GET /api/chat/suggestions
 * @desc    Get proactive learning suggestions
 * @access  Private
 */
router.get("/suggestions", authenticateToken, async (req, res) => {
  try {
    const suggestions = await aiStudyBuddyService.getProactiveSuggestions(
      req.user.id
    );

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch suggestions",
    });
  }
});

/**
 * @route   POST /api/chat/feedback
 * @desc    Provide feedback on AI response
 * @access  Private
 */
router.post("/feedback", authenticateToken, async (req, res) => {
  try {
    const { sessionId, messageIndex, rating, feedback } = req.body;

    const conversation = await Conversation.findOne({
      user: req.user.id,
      sessionId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    // Store feedback (can be enhanced with dedicated feedback model)
    if (conversation.messages[messageIndex]) {
      conversation.messages[messageIndex].metadata = {
        ...conversation.messages[messageIndex].metadata,
        rating,
        userFeedback: feedback,
      };
      await conversation.save();
    }

    res.json({
      success: true,
      message: "Feedback recorded",
    });
  } catch (error) {
    console.error("Error recording feedback:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record feedback",
    });
  }
});

/**
 * @route   GET /api/chat/topics
 * @desc    Get all topics user has discussed
 * @access  Private
 */
router.get("/topics", authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      user: req.user.id,
    }).select("topics");

    // Aggregate all unique topics
    const allTopics = new Set();
    conversations.forEach((conv) => {
      conv.topics.forEach((topic) => allTopics.add(topic));
    });

    // Get topic frequencies
    const topicStats = await LearningMemory.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        topics: Array.from(allTopics),
        topicStats,
      },
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch topics",
    });
  }
});

module.exports = router;
