const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Avatar = require("../models/Avatar");
const { verifyToken } = require("../middleware/auth");
const { VoiceCloneService } = require("../services/voiceService");

const voiceService = new VoiceCloneService();

// Configure multer for voice sample uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/voice-samples");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `voice-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/webm", "audio/ogg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."), false);
    }
  },
});

/**
 * @route   GET /api/voice/status
 * @desc    Get voice profile status
 * @access  Private
 */
router.get("/status", verifyToken, async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    res.json({
      success: true,
      hasVoiceProfile: avatar.voiceProfile.hasVoiceProfile,
      voiceSettings: avatar.voiceProfile.voiceSettings,
      preferredLanguage: avatar.voiceProfile.preferredLanguage,
      createdAt: avatar.voiceProfile.createdAt,
      isVoiceEnabled: avatar.settings.enableVoice,
    });
  } catch (error) {
    console.error("Error fetching voice status:", error);
    res.status(500).json({ success: false, error: "Failed to fetch voice status" });
  }
});

/**
 * @route   POST /api/voice/upload-sample
 * @desc    Upload voice sample for cloning
 * @access  Private
 */
router.post("/upload-sample", verifyToken, upload.single("voiceSample"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Voice sample file is required" });
    }
    
    let avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      avatar = await Avatar.createDefaultAvatar(req.user.id);
    }
    
    // Store the voice sample URL
    const voiceSampleUrl = `/uploads/voice-samples/${req.file.filename}`;
    
    // In production, this would call an AI voice cloning service (e.g., ElevenLabs)
    // For now, we'll simulate the voice profile creation
    const voiceProfileId = await voiceService.createVoiceProfile(req.file.path, req.user.id);
    
    // Update avatar voice profile
    avatar.voiceProfile.hasVoiceProfile = true;
    avatar.voiceProfile.voiceSampleUrl = voiceSampleUrl;
    avatar.voiceProfile.voiceProfileId = voiceProfileId;
    avatar.voiceProfile.createdAt = new Date();
    
    await avatar.save();
    
    res.json({
      success: true,
      message: "Voice profile created successfully!",
      voiceProfile: {
        hasVoiceProfile: true,
        voiceProfileId,
        createdAt: avatar.voiceProfile.createdAt,
      },
    });
  } catch (error) {
    console.error("Error uploading voice sample:", error);
    res.status(500).json({ success: false, error: "Failed to create voice profile" });
  }
});

/**
 * @route   PUT /api/voice/settings
 * @desc    Update voice settings
 * @access  Private
 */
router.put("/settings", verifyToken, async (req, res) => {
  try {
    const { stability, similarityBoost, style, speakingRate, preferredLanguage, enableVoice } = req.body;
    
    let avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    // Update voice settings
    if (stability !== undefined) avatar.voiceProfile.voiceSettings.stability = stability;
    if (similarityBoost !== undefined) avatar.voiceProfile.voiceSettings.similarityBoost = similarityBoost;
    if (style !== undefined) avatar.voiceProfile.voiceSettings.style = style;
    if (speakingRate !== undefined) avatar.voiceProfile.voiceSettings.speakingRate = speakingRate;
    if (preferredLanguage) avatar.voiceProfile.preferredLanguage = preferredLanguage;
    if (enableVoice !== undefined) avatar.settings.enableVoice = enableVoice;
    
    await avatar.save();
    
    res.json({
      success: true,
      message: "Voice settings updated",
      voiceSettings: avatar.voiceProfile.voiceSettings,
      preferredLanguage: avatar.voiceProfile.preferredLanguage,
      enableVoice: avatar.settings.enableVoice,
    });
  } catch (error) {
    console.error("Error updating voice settings:", error);
    res.status(500).json({ success: false, error: "Failed to update voice settings" });
  }
});

/**
 * @route   POST /api/voice/generate-explanation
 * @desc    Generate voice explanation for wrong answer using cloned voice
 * @access  Private
 */
router.post("/generate-explanation", verifyToken, async (req, res) => {
  try {
    const { text, questionContext } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }
    
    const avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    // Generate personalized explanation based on learning style
    const personalizedText = voiceService.personalizeExplanation(
      text,
      avatar.learningStyle,
      avatar.personality,
      questionContext
    );
    
    let audioUrl = null;
    
    // If user has voice profile, generate with their voice
    if (avatar.voiceProfile.hasVoiceProfile && avatar.settings.enableVoice) {
      audioUrl = await voiceService.generateSpeech(
        personalizedText,
        avatar.voiceProfile.voiceProfileId,
        avatar.voiceProfile.voiceSettings
      );
    } else {
      // Use default TTS
      audioUrl = await voiceService.generateDefaultSpeech(
        personalizedText,
        avatar.voiceProfile.preferredLanguage
      );
    }
    
    res.json({
      success: true,
      originalText: text,
      personalizedText,
      audioUrl,
      isClonedVoice: avatar.voiceProfile.hasVoiceProfile && avatar.settings.enableVoice,
    });
  } catch (error) {
    console.error("Error generating explanation:", error);
    res.status(500).json({ success: false, error: "Failed to generate explanation" });
  }
});

/**
 * @route   POST /api/voice/generate-reaction
 * @desc    Generate voice reaction for quiz events
 * @access  Private
 */
router.post("/generate-reaction", verifyToken, async (req, res) => {
  try {
    const { event, context } = req.body;
    
    const validEvents = ["correctAnswer", "wrongAnswer", "quizComplete", "streakMilestone", "levelUp"];
    
    if (!validEvents.includes(event)) {
      return res.status(400).json({
        success: false,
        error: "Invalid event type",
        validEvents,
      });
    }
    
    const avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    // Get personalized message
    const message = avatar.getPersonalizedMessage(
      event === "correctAnswer" ? "correctAnswer" :
      event === "wrongAnswer" ? "wrongAnswer" :
      event === "quizComplete" || event === "levelUp" ? "celebration" :
      "encouragement"
    );
    
    let audioUrl = null;
    
    // Generate audio if voice is enabled
    if (avatar.settings.enableVoice) {
      if (avatar.voiceProfile.hasVoiceProfile) {
        audioUrl = await voiceService.generateSpeech(
          message,
          avatar.voiceProfile.voiceProfileId,
          avatar.voiceProfile.voiceSettings
        );
      } else {
        audioUrl = await voiceService.generateDefaultSpeech(
          message,
          avatar.voiceProfile.preferredLanguage
        );
      }
    }
    
    res.json({
      success: true,
      event,
      message,
      audioUrl,
      isClonedVoice: avatar.voiceProfile.hasVoiceProfile,
    });
  } catch (error) {
    console.error("Error generating reaction:", error);
    res.status(500).json({ success: false, error: "Failed to generate reaction" });
  }
});

/**
 * @route   DELETE /api/voice/profile
 * @desc    Delete voice profile
 * @access  Private
 */
router.delete("/profile", verifyToken, async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ user: req.user.id });
    
    if (!avatar) {
      return res.status(404).json({ success: false, error: "Avatar not found" });
    }
    
    // Delete voice sample file if exists
    if (avatar.voiceProfile.voiceSampleUrl) {
      const filePath = path.join(__dirname, "../../", avatar.voiceProfile.voiceSampleUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete from voice cloning service
    if (avatar.voiceProfile.voiceProfileId) {
      await voiceService.deleteVoiceProfile(avatar.voiceProfile.voiceProfileId);
    }
    
    // Reset voice profile
    avatar.voiceProfile = {
      hasVoiceProfile: false,
      voiceSampleUrl: null,
      voiceProfileId: null,
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.5,
        speakingRate: 1,
      },
      preferredLanguage: "en-US",
      createdAt: null,
    };
    
    await avatar.save();
    
    res.json({
      success: true,
      message: "Voice profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting voice profile:", error);
    res.status(500).json({ success: false, error: "Failed to delete voice profile" });
  }
});

module.exports = router;
