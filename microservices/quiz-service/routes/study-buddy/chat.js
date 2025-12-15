const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../../shared/middleware/auth");
const aiStudyBuddyService = require("../../services/study-buddy/aiStudyBuddy");
const Conversation = require("../../models/study-buddy/Conversation");
const LearningMemory = require("../../models/study-buddy/LearningMemory");
const { v4: uuidv4 } = require("uuid");

// Helper to get user ID from request
const getUserId = (req) => req.user.userId || getUserId(req);

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
    const userId = req.user.userId || getUserId(req);

    // Generate AI response
    const result = await aiStudyBuddyService.generateResponse(
      userId,
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
    const userId = req.user.userId || getUserId(req);

    const conversations = await Conversation.find({
      user: userId,
      ...(status !== "all" && { status }),
    })
      .sort({ "metadata.lastActivity": -1 })
      .limit(parseInt(limit))
      .select("sessionId summary topics metadata status createdAt messages");

    // Format conversations with better titles
    const formattedConversations = conversations.map((conv) => {
      const convObj = conv.toObject();
      if (!convObj.summary) {
        // Generate a title from topics or first user message
        if (convObj.topics && convObj.topics.length > 0) {
          convObj.summary = convObj.topics.join(", ");
        } else if (convObj.messages && convObj.messages.length > 0) {
          const firstUserMsg = convObj.messages.find((m) => m.role === "user");
          if (firstUserMsg) {
            convObj.summary =
              firstUserMsg.content.substring(0, 50) +
              (firstUserMsg.content.length > 50 ? "..." : "");
          }
        }
      }
      // Remove messages array before sending to reduce payload size
      delete convObj.messages;
      return convObj;
    });

    res.json({
      success: true,
      data: {
        conversations: formattedConversations,
      },
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
      user: getUserId(req),
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
      data: {
        conversation,
      },
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
        getUserId(req),
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
          user: getUserId(req),
          sessionId,
        });
      } else {
        // Archive
        await Conversation.updateOne(
          { user: getUserId(req), sessionId },
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

    const query = { user: getUserId(req) };
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
      getUserId(req)
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
      user: getUserId(req),
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
      user: getUserId(req),
    }).select("topics");

    // Aggregate all unique topics
    const allTopics = new Set();
    conversations.forEach((conv) => {
      conv.topics.forEach((topic) => allTopics.add(topic));
    });

    // Get topic frequencies
    const topicStats = await LearningMemory.aggregate([
      { $match: { user: getUserId(req) } },
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
