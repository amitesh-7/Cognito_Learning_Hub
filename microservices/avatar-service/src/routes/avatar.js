const express = require("express");
const router = express.Router();
const Avatar = require("../models/Avatar");
const { verifyToken } = require("../middleware/auth");
const { AvatarEvolutionService } = require("../services/evolutionService");

/**
 * @route   GET /api/avatar
 * @desc    Get user's avatar
 * @access  Private
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    let avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      // Create default avatar if none exists
      avatar = await Avatar.createDefaultAvatar(req.user.id);
    }
    
    res.json({
      success: true,
      avatar,
    });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    res.status(500).json({ success: false, error: "Failed to fetch avatar" });
  }
});

/**
 * @route   POST /api/avatar
 * @desc    Create or initialize user's avatar
 * @access  Private
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const existingAvatar = await Avatar.findOne({ user: req.user.id });
    
    if (existingAvatar) {
      return res.status(400).json({
        success: false,
        error: "Avatar already exists. Use PUT to update.",
      });
    }
    
    const avatar = await Avatar.createDefaultAvatar(req.user.id);
    
    res.status(201).json({
      success: true,
      avatar,
      message: "Avatar created successfully!",
    });
  } catch (error) {
    console.error("Error creating avatar:", error);
    res.status(500).json({ success: false, error: "Failed to create avatar" });
  }
});

/**
 * @route   PUT /api/avatar
 * @desc    Update avatar customization
 * @access  Private
 */
router.put("/", verifyToken, async (req, res) => {
  try {
    const { name, bio, customization, personality, settings, customMessages } = req.body;
    
    let avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      avatar = await Avatar.createDefaultAvatar(req.user.id);
    }
    
    // Update fields if provided
    if (name) avatar.name = name;
    if (bio) avatar.bio = bio;
    if (customization) {
      // Validate that user has unlocked the items they're trying to use
      const unlockedItems = avatar.evolution.unlockedItems.map(i => i.itemId);
      
      // Check accessories
      if (customization.hat && customization.hat !== "none") {
        const isUnlocked = unlockedItems.includes(`hat_${customization.hat}`) || 
                          ["cap", "beanie"].includes(customization.hat); // Default unlocked
        if (!isUnlocked) {
          return res.status(400).json({
            success: false,
            error: `Hat "${customization.hat}" is not unlocked yet!`,
          });
        }
      }
      
      Object.assign(avatar.customization, customization);
    }
    if (personality) Object.assign(avatar.personality, personality);
    if (settings) Object.assign(avatar.settings, settings);
    if (customMessages) Object.assign(avatar.customMessages, customMessages);
    
    avatar.lastActive = new Date();
    await avatar.save();
    
    res.json({
      success: true,
      avatar,
      message: "Avatar updated successfully!",
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ success: false, error: "Failed to update avatar" });
  }
});

/**
 * @route   GET /api/avatar/render/:avatarId
 * @desc    Get avatar render data (for canvas/SVG rendering)
 * @access  Public (for leaderboards etc.)
 */
router.get("/render/:avatarId", async (req, res) => {
  try {
    const avatar = await Avatar.findById(req.params.avatarId);
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    // Return render-friendly data
    res.json({
      success: true,
      renderData: {
        customization: avatar.customization,
        evolution: {
          level: avatar.evolution.currentLevel,
          stage: avatar.evolution.evolutionStage,
        },
        emotionalState: avatar.emotionalState,
        settings: avatar.settings,
      },
    });
  } catch (error) {
    console.error("Error fetching render data:", error);
    res.status(500).json({ success: false, error: "Failed to fetch render data" });
  }
});

/**
 * @route   GET /api/avatar/reaction/:event
 * @desc    Get avatar reaction for an event
 * @access  Private
 */
router.get("/reaction/:event", verifyToken, async (req, res) => {
  try {
    const { event } = req.params;
    const validEvents = ["correctAnswer", "wrongAnswer", "perfectScore", "streakMilestone", "quizStart", "quizComplete"];
    
    if (!validEvents.includes(event)) {
      return res.status(400).json({
        success: false,
        error: "Invalid event type",
        validEvents,
      });
    }
    
    let avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      avatar = await Avatar.createDefaultAvatar(req.user.id);
    }
    
    const reaction = avatar.getReaction(event);
    const message = avatar.getPersonalizedMessage(event);
    
    // Update mood based on event
    avatar.updateMood(reaction.mood, event, event.includes("perfect") || event.includes("streak") ? 90 : 70);
    await avatar.save();
    
    res.json({
      success: true,
      reaction: {
        ...reaction,
        message,
        emotionalState: avatar.emotionalState,
      },
    });
  } catch (error) {
    console.error("Error getting reaction:", error);
    res.status(500).json({ success: false, error: "Failed to get reaction" });
  }
});

/**
 * @route   GET /api/avatar/unlockable-items
 * @desc    Get list of all unlockable items and their requirements
 * @access  Private
 */
router.get("/unlockable-items", verifyToken, async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ user: req.user.id });
    const unlockedItems = avatar ? avatar.evolution.unlockedItems.map(i => i.itemId) : [];
    
    const items = {
      hats: [
        { id: "hat_cap", name: "Cap", requirement: "Default", unlocked: true },
        { id: "hat_beanie", name: "Beanie", requirement: "Default", unlocked: true },
        { id: "hat_graduation", name: "Graduation Cap", requirement: "Complete 50 quizzes", level: 15, unlocked: unlockedItems.includes("hat_graduation") },
        { id: "hat_crown", name: "Crown", requirement: "Reach Legend status", level: 75, unlocked: unlockedItems.includes("hat_crown") },
        { id: "hat_wizard", name: "Wizard Hat", requirement: "Score 100% on 10 quizzes", level: 25, unlocked: unlockedItems.includes("hat_wizard") },
        { id: "hat_headphones", name: "Headphones", requirement: "Complete 5 audio quizzes", level: 10, unlocked: unlockedItems.includes("hat_headphones") },
        { id: "hat_halo", name: "Halo", requirement: "Help 50 students", level: 40, unlocked: unlockedItems.includes("hat_halo") },
      ],
      glasses: [
        { id: "glasses_round", name: "Round Glasses", requirement: "Default", unlocked: true },
        { id: "glasses_square", name: "Square Glasses", requirement: "Default", unlocked: true },
        { id: "glasses_nerd", name: "Nerd Glasses", requirement: "Answer 500 questions", level: 20, unlocked: unlockedItems.includes("glasses_nerd") },
        { id: "glasses_futuristic", name: "Futuristic Glasses", requirement: "Reach Expert status", level: 30, unlocked: unlockedItems.includes("glasses_futuristic") },
      ],
      outfits: [
        { id: "outfit_casual", name: "Casual", requirement: "Default", unlocked: true },
        { id: "outfit_formal", name: "Formal", requirement: "Default", unlocked: true },
        { id: "outfit_academic", name: "Academic Robes", requirement: "Reach Scholar status", level: 15, unlocked: unlockedItems.includes("outfit_academic") },
        { id: "outfit_superhero", name: "Superhero", requirement: "30-day streak", level: 35, unlocked: unlockedItems.includes("outfit_superhero") },
        { id: "outfit_scientist", name: "Scientist", requirement: "Master Science category", level: 25, unlocked: unlockedItems.includes("outfit_scientist") },
        { id: "outfit_astronaut", name: "Astronaut", requirement: "Reach Master status", level: 50, unlocked: unlockedItems.includes("outfit_astronaut") },
        { id: "outfit_royal", name: "Royal", requirement: "Reach Legend status", level: 75, unlocked: unlockedItems.includes("outfit_royal") },
      ],
      auras: [
        { id: "aura_glow", name: "Glow", requirement: "Level 10", level: 10, unlocked: unlockedItems.includes("aura_glow") },
        { id: "aura_sparkle", name: "Sparkle", requirement: "Level 20", level: 20, unlocked: unlockedItems.includes("aura_sparkle") },
        { id: "aura_fire", name: "Fire", requirement: "7-day streak", level: 15, unlocked: unlockedItems.includes("aura_fire") },
        { id: "aura_electric", name: "Electric", requirement: "Answer 1000 questions", level: 30, unlocked: unlockedItems.includes("aura_electric") },
        { id: "aura_rainbow", name: "Rainbow", requirement: "Master 5 categories", level: 40, unlocked: unlockedItems.includes("aura_rainbow") },
        { id: "aura_cosmic", name: "Cosmic", requirement: "Reach Legend status", level: 75, unlocked: unlockedItems.includes("aura_cosmic") },
      ],
      frames: [
        { id: "frame_bronze", name: "Bronze Frame", requirement: "Level 5", level: 5, unlocked: unlockedItems.includes("frame_bronze") },
        { id: "frame_silver", name: "Silver Frame", requirement: "Level 15", level: 15, unlocked: unlockedItems.includes("frame_silver") },
        { id: "frame_gold", name: "Gold Frame", requirement: "Level 30", level: 30, unlocked: unlockedItems.includes("frame_gold") },
        { id: "frame_platinum", name: "Platinum Frame", requirement: "Level 50", level: 50, unlocked: unlockedItems.includes("frame_platinum") },
        { id: "frame_diamond", name: "Diamond Frame", requirement: "Level 70", level: 70, unlocked: unlockedItems.includes("frame_diamond") },
        { id: "frame_legendary", name: "Legendary Frame", requirement: "Level 90", level: 90, unlocked: unlockedItems.includes("frame_legendary") },
      ],
    };
    
    res.json({
      success: true,
      items,
      currentLevel: avatar?.evolution.currentLevel || 1,
    });
  } catch (error) {
    console.error("Error fetching unlockable items:", error);
    res.status(500).json({ success: false, error: "Failed to fetch items" });
  }
});

/**
 * @route   POST /api/avatar/unlock-item
 * @desc    Manually unlock an item (for achievements, etc.)
 * @access  Private
 */
router.post("/unlock-item", verifyToken, async (req, res) => {
  try {
    const { itemType, itemId, unlockedBy } = req.body;
    
    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        error: "itemType and itemId are required",
      });
    }
    
    let avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      avatar = await Avatar.createDefaultAvatar(req.user.id);
    }
    
    // Check if already unlocked
    const alreadyUnlocked = avatar.evolution.unlockedItems.some(
      item => item.itemId === itemId
    );
    
    if (alreadyUnlocked) {
      return res.status(400).json({
        success: false,
        error: "Item already unlocked",
      });
    }
    
    // Add unlocked item
    avatar.evolution.unlockedItems.push({
      itemType,
      itemId,
      unlockedAt: new Date(),
      unlockedBy: unlockedBy || "achievement",
    });
    
    await avatar.save();
    
    res.json({
      success: true,
      message: `Unlocked ${itemId}!`,
      avatar,
    });
  } catch (error) {
    console.error("Error unlocking item:", error);
    res.status(500).json({ success: false, error: "Failed to unlock item" });
  }
});

module.exports = router;
