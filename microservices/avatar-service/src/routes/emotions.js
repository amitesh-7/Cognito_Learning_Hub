const express = require("express");
const router = express.Router();
const Avatar = require("../../../../backend/models/Avatar");
const { verifyToken } = require("../middleware/auth");
const { EmotionAnalyzer } = require("../services/emotionService");

const emotionAnalyzer = new EmotionAnalyzer();

/**
 * @route   GET /api/emotions/current
 * @desc    Get avatar's current emotional state
 * @access  Private
 */
router.get("/current", verifyToken, async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    res.json({
      success: true,
      emotionalState: avatar.emotionalState,
      personality: avatar.personality,
    });
  } catch (error) {
    console.error("Error fetching emotional state:", error);
    res.status(500).json({ success: false, error: "Failed to fetch emotional state" });
  }
});

/**
 * @route   POST /api/emotions/react
 * @desc    Trigger an emotional reaction based on quiz event
 * @access  Private
 */
router.post("/react", verifyToken, async (req, res) => {
  try {
    const { event, context } = req.body;
    
    // Validate event type
    const validEvents = [
      "questionAnswered",
      "correctAnswer",
      "wrongAnswer",
      "streakAchieved",
      "streakBroken",
      "quizStarted",
      "quizCompleted",
      "perfectScore",
      "timeRunningOut",
      "hintUsed",
      "levelUp",
      "achievementUnlocked",
      "encouragement",
    ];
    
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
    
    // Analyze emotion based on event and context
    const emotionResult = emotionAnalyzer.analyzeEvent(event, context, avatar.personality);
    
    // Update avatar emotional state
    avatar.updateMood(emotionResult.mood, event, emotionResult.intensity);
    avatar.totalInteractions += 1;
    avatar.lastActive = new Date();
    await avatar.save();
    
    // Get personalized message
    const message = avatar.getPersonalizedMessage(
      event === "correctAnswer" ? "correctAnswer" :
      event === "wrongAnswer" ? "wrongAnswer" :
      event === "perfectScore" ? "celebration" :
      "encouragement"
    );
    
    res.json({
      success: true,
      reaction: {
        mood: emotionResult.mood,
        intensity: emotionResult.intensity,
        animation: emotionResult.animation,
        message,
        soundEffect: emotionResult.soundEffect,
        visualEffect: emotionResult.visualEffect,
        duration: emotionResult.duration,
      },
      emotionalState: avatar.emotionalState,
    });
  } catch (error) {
    console.error("Error processing emotion:", error);
    res.status(500).json({ success: false, error: "Failed to process emotion" });
  }
});

/**
 * @route   GET /api/emotions/animation/:mood
 * @desc    Get animation data for a specific mood
 * @access  Private
 */
router.get("/animation/:mood", verifyToken, async (req, res) => {
  try {
    const { mood } = req.params;
    const avatar = await Avatar.findOne({ user: req.user.id });
    
    const animations = {
      happy: {
        type: "bounce",
        keyframes: [
          { transform: "translateY(0)", offset: 0 },
          { transform: "translateY(-10px)", offset: 0.5 },
          { transform: "translateY(0)", offset: 1 },
        ],
        duration: 500,
        iterations: 3,
        expressions: {
          eyes: "sparkle",
          mouth: "smile",
          cheeks: "blush",
        },
      },
      excited: {
        type: "jump",
        keyframes: [
          { transform: "scale(1) rotate(0deg)", offset: 0 },
          { transform: "scale(1.1) rotate(-5deg)", offset: 0.25 },
          { transform: "scale(1.2) rotate(5deg)", offset: 0.5 },
          { transform: "scale(1.1) rotate(-5deg)", offset: 0.75 },
          { transform: "scale(1) rotate(0deg)", offset: 1 },
        ],
        duration: 800,
        iterations: 2,
        expressions: {
          eyes: "wide",
          mouth: "open_smile",
          cheeks: "blush",
        },
      },
      proud: {
        type: "glow",
        keyframes: [
          { filter: "brightness(1)", offset: 0 },
          { filter: "brightness(1.3)", offset: 0.5 },
          { filter: "brightness(1)", offset: 1 },
        ],
        duration: 1000,
        iterations: 2,
        expressions: {
          eyes: "confident",
          mouth: "smirk",
          posture: "tall",
        },
      },
      encouraging: {
        type: "nod",
        keyframes: [
          { transform: "rotate(0deg)", offset: 0 },
          { transform: "rotate(-5deg)", offset: 0.3 },
          { transform: "rotate(5deg)", offset: 0.6 },
          { transform: "rotate(0deg)", offset: 1 },
        ],
        duration: 600,
        iterations: 2,
        expressions: {
          eyes: "warm",
          mouth: "gentle_smile",
          hands: "thumbs_up",
        },
      },
      focused: {
        type: "concentrate",
        keyframes: [
          { opacity: 1, offset: 0 },
          { opacity: 0.9, offset: 0.5 },
          { opacity: 1, offset: 1 },
        ],
        duration: 1500,
        iterations: "infinite",
        expressions: {
          eyes: "focused",
          mouth: "neutral",
          brow: "furrowed",
        },
      },
      determined: {
        type: "pulse",
        keyframes: [
          { transform: "scale(1)", boxShadow: "0 0 0 rgba(59, 130, 246, 0.5)", offset: 0 },
          { transform: "scale(1.02)", boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)", offset: 0.5 },
          { transform: "scale(1)", boxShadow: "0 0 0 rgba(59, 130, 246, 0.5)", offset: 1 },
        ],
        duration: 1000,
        iterations: 3,
        expressions: {
          eyes: "determined",
          mouth: "set",
          fist: "raised",
        },
      },
      curious: {
        type: "tilt",
        keyframes: [
          { transform: "rotate(0deg)", offset: 0 },
          { transform: "rotate(10deg)", offset: 0.5 },
          { transform: "rotate(0deg)", offset: 1 },
        ],
        duration: 800,
        iterations: 2,
        expressions: {
          eyes: "questioning",
          mouth: "slight_open",
          brow: "raised",
        },
      },
      neutral: {
        type: "idle",
        keyframes: [
          { transform: "translateY(0)", offset: 0 },
          { transform: "translateY(-2px)", offset: 0.5 },
          { transform: "translateY(0)", offset: 1 },
        ],
        duration: 2000,
        iterations: "infinite",
        expressions: {
          eyes: "normal",
          mouth: "neutral",
        },
      },
    };
    
    const animationData = animations[mood] || animations.neutral;
    
    // Customize based on avatar's celebration animation preference
    if (avatar && ["happy", "excited", "proud"].includes(mood)) {
      animationData.celebrationType = avatar.customization.celebrationAnimation;
    }
    
    res.json({
      success: true,
      mood,
      animation: animationData,
    });
  } catch (error) {
    console.error("Error fetching animation:", error);
    res.status(500).json({ success: false, error: "Failed to fetch animation" });
  }
});

/**
 * @route   GET /api/emotions/expressions
 * @desc    Get all available expressions for avatar rendering
 * @access  Private
 */
router.get("/expressions", verifyToken, async (req, res) => {
  try {
    const expressions = {
      eyes: {
        normal: { description: "Default relaxed eyes", svgPath: "M..." },
        sparkle: { description: "Eyes with sparkle effect", svgPath: "M..." },
        wide: { description: "Wide surprised eyes", svgPath: "M..." },
        confident: { description: "Confident half-lidded eyes", svgPath: "M..." },
        warm: { description: "Warm friendly eyes", svgPath: "M..." },
        focused: { description: "Concentrated focused eyes", svgPath: "M..." },
        determined: { description: "Determined fierce eyes", svgPath: "M..." },
        questioning: { description: "Curious questioning eyes", svgPath: "M..." },
        closed_happy: { description: "Closed happy eyes (^_^)", svgPath: "M..." },
        tearful: { description: "Slightly tearful eyes", svgPath: "M..." },
      },
      mouth: {
        neutral: { description: "Default neutral mouth", svgPath: "M..." },
        smile: { description: "Happy smile", svgPath: "M..." },
        open_smile: { description: "Wide open smile", svgPath: "M..." },
        smirk: { description: "Confident smirk", svgPath: "M..." },
        gentle_smile: { description: "Gentle encouraging smile", svgPath: "M..." },
        slight_open: { description: "Slightly open curious mouth", svgPath: "M..." },
        set: { description: "Determined set mouth", svgPath: "M..." },
        pout: { description: "Sympathetic pout", svgPath: "M..." },
        cheer: { description: "Cheering open mouth", svgPath: "M..." },
      },
      extras: {
        blush: { description: "Blushing cheeks", svgPath: "M..." },
        sweatdrop: { description: "Anime sweatdrop", svgPath: "M..." },
        sparkles: { description: "Floating sparkles", svgPath: "M..." },
        hearts: { description: "Floating hearts", svgPath: "M..." },
        exclamation: { description: "Exclamation mark", svgPath: "M..." },
        question: { description: "Question mark", svgPath: "M..." },
        lightbulb: { description: "Idea lightbulb", svgPath: "M..." },
      },
    };
    
    res.json({
      success: true,
      expressions,
    });
  } catch (error) {
    console.error("Error fetching expressions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch expressions" });
  }
});

module.exports = router;
