const express = require("express");
const router = express.Router();
const Quest = require("../models/Quest");
const UserQuest = require("../models/UserQuest");
const { authenticateToken } = require("../../../shared/middleware/auth");

// @route   GET /api/quests/realms
// @desc    Get all available realms
// @access  Public
router.get("/realms", async (req, res) => {
  try {
    const realms = [
      // Academic Realms
      {
        id: "mathematics-kingdom",
        name: "Mathematics Kingdom",
        description: "Master the art of numbers and equations",
        icon: "🔢",
        color: "#3B82F6",
        category: "academic",
      },
      {
        id: "physics-universe",
        name: "Physics Universe",
        description: "Explore the laws of nature",
        icon: "⚛️",
        color: "#8B5CF6",
        category: "academic",
      },
      {
        id: "chemistry-lab",
        name: "Chemistry Lab",
        description: "Discover the secrets of matter",
        icon: "🧪",
        color: "#10B981",
        category: "academic",
      },
      {
        id: "biology-forest",
        name: "Biology Forest",
        description: "Understand the living world",
        icon: "🌿",
        color: "#059669",
        category: "academic",
      },
      {
        id: "computer-science-hub",
        name: "Computer Science Hub",
        description: "Code your way to mastery",
        icon: "💻",
        color: "#6366F1",
        category: "academic",
      },
      {
        id: "history-archives",
        name: "History Archives",
        description: "Journey through time and human history",
        icon: "📜",
        color: "#F59E0B",
        category: "academic",
      },
      {
        id: "language-realm",
        name: "Language Realm",
        description: "Master the power of words and communication",
        icon: "📚",
        color: "#EF4444",
        category: "academic",
      },
      // Tech/CS Realms
      {
        id: "algorithmic-valley",
        name: "Algorithmic Valley",
        description: "Master algorithms and data structures",
        icon: "🟣",
        color: "#7C3AED",
        category: "tech",
      },
      {
        id: "web-wizardry",
        name: "Web Wizardry",
        description: "Build modern web applications",
        icon: "🔵",
        color: "#2563EB",
        category: "tech",
      },
      {
        id: "data-kingdom",
        name: "Data Kingdom",
        description: "Unlock data science and analytics",
        icon: "🟢",
        color: "#059669",
        category: "tech",
      },
      {
        id: "ai-sanctuary",
        name: "AI Sanctuary",
        description: "Explore AI and machine learning",
        icon: "💗",
        color: "#EC4899",
        category: "tech",
      },
      {
        id: "system-fortress",
        name: "System Fortress",
        description: "Build robust system infrastructure",
        icon: "🔴",
        color: "#DC2626",
        category: "tech",
      },
      {
        id: "security-citadel",
        name: "Security Citadel",
        description: "Master cybersecurity and ethical hacking",
        icon: "🟡",
        color: "#F59E0B",
        category: "tech",
      },
      {
        id: "cloud-highlands",
        name: "Cloud Highlands",
        description: "Scale cloud computing heights",
        icon: "🩵",
        color: "#06B6D4",
        category: "tech",
      },
    ];

    res.json({ success: true, data: realms });
  } catch (error) {
    console.error("Error fetching realms:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/quests/realm/:realm
// @desc    Get all quests in a realm
// @access  Public
router.get("/realm/:realm", async (req, res) => {
  try {
    const { realm } = req.params;
    const quests = await Quest.find({ realm, isActive: true }).sort({
      chapter: 1,
      questNumber: 1,
    });

    // Group by chapters
    const chapters = {};
    quests.forEach((quest) => {
      const chapterKey = `ch${quest.chapter}`;
      if (!chapters[chapterKey]) {
        chapters[chapterKey] = {
          chapter: quest.chapter,
          title: quest.chapterTitle,
          quests: [],
        };
      }
      chapters[chapterKey].quests.push(quest);
    });

    res.json({
      success: true,
      data: {
        realm,
        chapters: Object.values(chapters),
        totalQuests: quests.length,
      },
    });
  } catch (error) {
    console.error("Error fetching realm quests:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/quests/user/progress
// @desc    Get user's quest progress across all realms
// @access  Private
router.get("/user/progress", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const realms = [
      "Mathematics Kingdom",
      "Physics Universe",
      "Chemistry Lab",
      "Biology Forest",
      "Computer Science Hub",
      "History Archives",
      "Language Realm",
      "Algorithmic Valley",
      "Web Wizardry",
      "Data Kingdom",
      "AI Sanctuary",
      "System Fortress",
      "Security Citadel",
      "Cloud Highlands",
    ];

    const progress = await Promise.all(
      realms.map(async (realm) => {
        const realmProgress = await UserQuest.getRealmProgress(userId, realm);
        return {
          realm,
          ...realmProgress,
        };
      })
    );

    res.json({ success: true, data: progress });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/quests/my-quests
// @desc    Get all user's quests with their progress
// @access  Private
router.get("/my-quests", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user quests with progress
    const userQuests = await UserQuest.find({ user: userId })
      .sort({ updatedAt: -1 })
      .lean();

    // Format the response - handle null/undefined values safely
    const questsData = userQuests.map(uq => ({
      questId: uq.questId || '',
      status: uq.status || 'locked',
      stars: uq.stars || 0,
      attemptCount: uq.attemptCount || 0,
      startedAt: uq.startedAt || null,
      completedAt: uq.completedAt || null,
      realm: uq.realm || '',
      chapter: uq.chapter || 0,
      lastAttempt: uq.lastAttemptDate || null,
    }));

    res.json({ success: true, data: questsData });
  } catch (error) {
    console.error("Error fetching user quests:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// @route   GET /api/quests/:questId
// @desc    Get quest details
// @access  Public
router.get("/:questId", async (req, res) => {
  try {
    const { questId } = req.params;
    const quest = await Quest.findOne({ questId }).populate("quizId");

    if (!quest) {
      return res
        .status(404)
        .json({ success: false, message: "Quest not found" });
    }

    res.json({ success: true, data: quest });
  } catch (error) {
    console.error("Error fetching quest:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/quests/user/realm/:realm
// @desc    Get user's progress in specific realm
// @access  Private
router.get("/user/realm/:realm", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { realm } = req.params;

    // Get all quests in realm
    const allQuests = await Quest.find({ realm, isActive: true }).sort({
      chapter: 1,
      questNumber: 1,
    });

    // Get user's quest progress
    const userQuests = await UserQuest.find({ user: userId, realm });

    // Merge data
    const questsWithProgress = allQuests.map((quest) => {
      const userQuest = userQuests.find((uq) => uq.questId === quest.questId);
      return {
        ...quest.toObject(),
        userProgress: userQuest || {
          status: "locked",
          stars: 0,
          attemptCount: 0,
        },
      };
    });

    // Group by chapters
    const chapters = {};
    questsWithProgress.forEach((quest) => {
      const chapterKey = `ch${quest.chapter}`;
      if (!chapters[chapterKey]) {
        chapters[chapterKey] = {
          chapter: quest.chapter,
          title: quest.chapterTitle,
          quests: [],
        };
      }
      chapters[chapterKey].quests.push(quest);
    });

    // Get realm progress summary
    const summary = await UserQuest.getRealmProgress(userId, realm);

    res.json({
      success: true,
      data: {
        realm,
        chapters: Object.values(chapters),
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching user realm progress:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/quests/:questId/start
// @desc    Start a quest
// @access  Private
router.post("/:questId/start", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { questId } = req.params;

    // Get quest
    const quest = await Quest.findOne({ questId });
    if (!quest) {
      return res
        .status(404)
        .json({ success: false, message: "Quest not found" });
    }

    // Check if user quest exists
    let userQuest = await UserQuest.findOne({ user: userId, questId });

    if (!userQuest) {
      // Create new user quest
      userQuest = new UserQuest({
        user: userId,
        questId,
        quest: quest._id,
        realm: quest.realm,
        chapter: quest.chapter,
        status: "in_progress",
      });
    } else {
      // Update existing
      userQuest.status = "in_progress";
    }

    await userQuest.save();

    res.json({
      success: true,
      message: "Quest started!",
      data: {
        questId,
        quizId: quest.quizId,
        npcDialogue: quest.npc?.dialogue?.introduction,
      },
    });
  } catch (error) {
    console.error("Error starting quest:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/quests/:questId/complete
// @desc    Complete a quest after quiz
// @access  Private
router.post("/:questId/complete", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { questId } = req.params;
    const { score, maxScore, timeTaken, resultId } = req.body;

    // Get quest
    const quest = await Quest.findOne({ questId });
    if (!quest) {
      return res
        .status(404)
        .json({ success: false, message: "Quest not found" });
    }

    // Get or create user quest
    let userQuest = await UserQuest.findOne({ user: userId, questId });
    if (!userQuest) {
      userQuest = new UserQuest({
        user: userId,
        questId,
        quest: quest._id,
        realm: quest.realm,
        chapter: quest.chapter,
      });
    }

    // Add attempt
    const attemptResult = userQuest.addAttempt(
      score,
      maxScore,
      timeTaken,
      resultId
    );

    // Claim rewards if completed
    let rewards = null;
    if (attemptResult.completed && !userQuest.rewardsClaimed) {
      rewards = userQuest.claimRewards(quest.rewards);
    }

    // Check for branching path
    const nextQuestId = quest.getNextQuest(attemptResult.percentage, timeTaken);

    // Update quest analytics
    quest.totalAttempts += 1;
    quest.averageScore =
      (quest.averageScore * (quest.totalAttempts - 1) + score) /
      quest.totalAttempts;
    quest.averageTime =
      (quest.averageTime * (quest.totalAttempts - 1) + timeTaken) /
      quest.totalAttempts;
    quest.successRate =
      (quest.successRate * (quest.totalAttempts - 1) +
        (attemptResult.completed ? 100 : 0)) /
      quest.totalAttempts;

    await Promise.all([userQuest.save(), quest.save()]);

    // Get NPC dialogue
    const npcDialogue = attemptResult.completed
      ? quest.npc?.dialogue?.success
      : quest.npc?.dialogue?.failure;

    res.json({
      success: true,
      data: {
        completed: attemptResult.completed,
        stars: attemptResult.stars,
        percentage: attemptResult.percentage,
        rewards,
        nextQuestId,
        npcDialogue,
        unlockNextChapter:
          attemptResult.completed && quest.questType === "boss",
      },
    });
  } catch (error) {
    console.error("Error completing quest:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/quests/user/next/:realm
// @desc    Get next available quest in realm
// @access  Private
router.get("/user/next/:realm", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { realm } = req.params;

    // Get completed quests
    const completedQuests = await UserQuest.find({
      user: userId,
      realm,
      status: "completed",
    });

    const completedQuestIds = completedQuests.map((q) => q.questId);

    // Find next available quest
    const nextQuest = await UserQuest.getNextAvailableQuest(
      userId,
      realm,
      completedQuestIds
    );

    if (!nextQuest) {
      return res.json({
        success: true,
        message: "All quests completed in this realm!",
        data: null,
      });
    }

    res.json({ success: true, data: nextQuest });
  } catch (error) {
    console.error("Error finding next quest:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/quests/user/quest/:questId
// @desc    Get user's progress on specific quest
// @access  Private
router.get("/user/quest/:questId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { questId } = req.params;

    const userQuest = await UserQuest.findOne({
      user: userId,
      questId,
    }).populate("quest");

    if (!userQuest) {
      return res.status(404).json({
        success: false,
        message: "Quest progress not found",
      });
    }

    res.json({ success: true, data: userQuest });
  } catch (error) {
    console.error("Error fetching quest progress:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/quests/boss/:realm
// @desc    Get boss quests in realm
// @access  Public
router.get("/boss/:realm", async (req, res) => {
  try {
    const { realm } = req.params;
    const bossQuests = await Quest.getBossQuests(realm);

    res.json({ success: true, data: bossQuests });
  } catch (error) {
    console.error("Error fetching boss quests:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/quests/npc/hint
// @desc    Get hint from NPC
// @access  Private
router.post("/npc/hint", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { questId } = req.body;

    const quest = await Quest.findOne({ questId });
    if (!quest) {
      return res
        .status(404)
        .json({ success: false, message: "Quest not found" });
    }

    // Update user quest hint usage
    const userQuest = await UserQuest.findOne({ user: userId, questId });
    if (userQuest) {
      userQuest.npcHintsUsed += 1;
      await userQuest.save();
    }

    res.json({
      success: true,
      data: {
        hint: quest.npc?.dialogue?.hint,
        hintsUsed: userQuest?.npcHintsUsed || 1,
      },
    });
  } catch (error) {
    console.error("Error getting NPC hint:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/quests (Admin only)
// @desc    Create a new quest
// @access  Private (Admin)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const quest = new Quest(req.body);
    await quest.save();

    res.status(201).json({
      success: true,
      message: "Quest created successfully",
      data: quest,
    });
  } catch (error) {
    console.error("Error creating quest:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
