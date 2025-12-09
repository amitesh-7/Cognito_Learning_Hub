const mongoose = require("mongoose");

/**
 * Avatar Customization Schema - Stores all visual customizations
 */
const AvatarCustomizationSchema = new mongoose.Schema({
  // Base appearance
  skinTone: {
    type: String,
    enum: ["light", "fair", "medium", "tan", "brown", "dark"],
    default: "medium",
  },
  hairStyle: {
    type: String,
    enum: ["short", "medium", "long", "curly", "wavy", "bald", "ponytail", "bun", "afro", "braids"],
    default: "short",
  },
  hairColor: {
    type: String,
    enum: ["black", "brown", "blonde", "red", "gray", "white", "blue", "purple", "green", "pink"],
    default: "black",
  },
  eyeColor: {
    type: String,
    enum: ["brown", "blue", "green", "hazel", "gray", "amber"],
    default: "brown",
  },
  eyeShape: {
    type: String,
    enum: ["round", "almond", "upturned", "downturned", "hooded"],
    default: "round",
  },
  faceShape: {
    type: String,
    enum: ["oval", "round", "square", "heart", "oblong"],
    default: "oval",
  },

  // Accessories (unlockable through achievements)
  glasses: {
    type: String,
    enum: ["none", "true", "round", "square", "aviator", "cat-eye", "sports", "nerd", "futuristic"],
    default: "none",
  },
  hat: {
    type: String,
    enum: ["none", "cap", "beanie", "graduation", "crown", "wizard", "headphones", "halo"],
    default: "none",
  },
  earrings: {
    type: String,
    enum: ["none", "studs", "hoops", "drops", "stars", "diamonds"],
    default: "none",
  },

  // Clothing (unlockable through achievements)
  outfit: {
    type: String,
    enum: ["casual", "formal", "sporty", "academic", "superhero", "scientist", "astronaut", "royal"],
    default: "casual",
  },
  outfitColor: {
    type: String,
    enum: ["blue", "red", "green", "purple", "orange", "pink", "black", "white", "gold", "rainbow"],
    default: "blue",
  },

  // Special effects (unlockable through rare achievements)
  aura: {
    type: String,
    enum: ["none", "glow", "sparkle", "fire", "ice", "electric", "rainbow", "cosmic"],
    default: "none",
  },
  background: {
    type: String,
    enum: ["default", "library", "lab", "space", "nature", "city", "abstract", "champion"],
    default: "default",
  },
  frame: {
    type: String,
    enum: ["none", "bronze", "silver", "gold", "platinum", "diamond", "legendary"],
    default: "none",
  },

  // Animations
  idleAnimation: {
    type: String,
    enum: ["breathing", "floating", "bouncing", "reading", "thinking", "waving"],
    default: "breathing",
  },
  celebrationAnimation: {
    type: String,
    enum: ["dance", "jump", "clap", "fireworks", "confetti", "backflip"],
    default: "dance",
  },
});

/**
 * Learning Style Profile Schema - AI learns user's patterns
 */
const LearningStyleSchema = new mongoose.Schema({
  // Pace preferences
  preferredPace: {
    type: String,
    enum: ["fast", "moderate", "slow", "adaptive"],
    default: "adaptive",
  },
  averageTimePerQuestion: {
    type: Number,
    default: 30, // seconds
  },

  // Category preferences
  strongCategories: [{
    category: String,
    proficiency: { type: Number, min: 0, max: 100, default: 50 },
    questionsAnswered: { type: Number, default: 0 },
  }],
  weakCategories: [{
    category: String,
    proficiency: { type: Number, min: 0, max: 100, default: 50 },
    questionsAnswered: { type: Number, default: 0 },
  }],

  // Difficulty preferences
  comfortZone: {
    type: String,
    enum: ["Easy", "Medium", "Hard", "Mixed"],
    default: "Mixed",
  },
  challengeAcceptance: {
    type: Number, // 0-100, how often they take on harder quizzes
    default: 50,
    min: 0,
    max: 100,
  },

  // Time patterns
  peakPerformanceTime: {
    type: String,
    enum: ["morning", "afternoon", "evening", "night", "any"],
    default: "any",
  },
  averageSessionDuration: {
    type: Number, // minutes
    default: 15,
  },

  // Answer patterns
  usesHints: { type: Boolean, default: false },
  reviewsExplanations: { type: Boolean, default: true },
  revisitsQuestions: { type: Boolean, default: false },

  // Communication style (for avatar personality)
  preferredEncouragement: {
    type: String,
    enum: ["motivational", "factual", "humorous", "gentle", "competitive"],
    default: "motivational",
  },
});

/**
 * Emotional State Schema - Avatar's current mood
 */
const EmotionalStateSchema = new mongoose.Schema({
  currentMood: {
    type: String,
    enum: ["happy", "neutral", "focused", "excited", "encouraging", "proud", "curious", "determined"],
    default: "neutral",
  },
  moodIntensity: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  lastMoodChange: {
    type: Date,
    default: Date.now,
  },
  moodTrigger: {
    type: String, // What caused the mood change
  },
});

/**
 * Voice Profile Schema - For voice-cloned explanations
 */
const VoiceProfileSchema = new mongoose.Schema({
  hasVoiceProfile: {
    type: Boolean,
    default: false,
  },
  voiceSampleUrl: {
    type: String, // URL to stored voice sample
  },
  voiceProfileId: {
    type: String, // ID from voice cloning service (e.g., ElevenLabs)
  },
  voiceSettings: {
    stability: { type: Number, default: 0.5, min: 0, max: 1 },
    similarityBoost: { type: Number, default: 0.75, min: 0, max: 1 },
    style: { type: Number, default: 0.5, min: 0, max: 1 },
    speakingRate: { type: Number, default: 1, min: 0.5, max: 2 },
  },
  preferredLanguage: {
    type: String,
    default: "en-US",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Evolution Progress Schema - Tracks unlocks and evolution
 */
const EvolutionProgressSchema = new mongoose.Schema({
  currentLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 100,
  },
  evolutionStage: {
    type: String,
    enum: ["novice", "learner", "scholar", "expert", "master", "legend"],
    default: "novice",
  },
  experiencePoints: {
    type: Number,
    default: 0,
  },
  experienceToNextLevel: {
    type: Number,
    default: 100,
  },

  // Unlocked items
  unlockedItems: [{
    itemType: { type: String, enum: ["hat", "glasses", "outfit", "aura", "frame", "animation", "background"] },
    itemId: String,
    unlockedAt: { type: Date, default: Date.now },
    unlockedBy: String, // Achievement ID or condition
  }],

  // Evolution milestones
  milestones: [{
    name: String,
    description: String,
    achievedAt: Date,
    reward: String,
  }],

  // Stats contributing to evolution
  totalQuestionsAnswered: { type: Number, default: 0 },
  totalCorrectAnswers: { type: Number, default: 0 },
  totalQuizzesTaken: { type: Number, default: 0 },
  totalPerfectScores: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalStudyTime: { type: Number, default: 0 }, // minutes
});

/**
 * Main Avatar Schema
 */
const AvatarSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: "My Avatar",
      trim: true,
      maxlength: 30,
    },
    bio: {
      type: String,
      maxlength: 150,
    },
    
    // Visual customization
    customization: {
      type: AvatarCustomizationSchema,
      default: () => ({}),
    },

    // AI-learned learning style
    learningStyle: {
      type: LearningStyleSchema,
      default: () => ({}),
    },

    // Current emotional state
    emotionalState: {
      type: EmotionalStateSchema,
      default: () => ({}),
    },

    // Voice profile for cloned explanations
    voiceProfile: {
      type: VoiceProfileSchema,
      default: () => ({}),
    },

    // Evolution and progression
    evolution: {
      type: EvolutionProgressSchema,
      default: () => ({}),
    },

    // Avatar personality traits (affects reactions)
    personality: {
      enthusiasm: { type: Number, default: 70, min: 0, max: 100 },
      patience: { type: Number, default: 70, min: 0, max: 100 },
      competitiveness: { type: Number, default: 50, min: 0, max: 100 },
      humor: { type: Number, default: 50, min: 0, max: 100 },
      supportiveness: { type: Number, default: 80, min: 0, max: 100 },
    },

    // Avatar messages/reactions
    customMessages: {
      correctAnswer: [{ type: String }],
      wrongAnswer: [{ type: String }],
      encouragement: [{ type: String }],
      celebration: [{ type: String }],
      greeting: [{ type: String }],
    },

    // Settings
    settings: {
      showAvatar: { type: Boolean, default: true },
      enableReactions: { type: Boolean, default: true },
      enableVoice: { type: Boolean, default: false },
      reactionVolume: { type: Number, default: 0.5, min: 0, max: 1 },
      showInLeaderboard: { type: Boolean, default: true },
    },

    // Activity tracking
    lastActive: {
      type: Date,
      default: Date.now,
    },
    totalInteractions: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for performance (removed duplicate user index since unique: true creates one)
AvatarSchema.index({ "evolution.currentLevel": -1 });
AvatarSchema.index({ "evolution.experiencePoints": -1 });
AvatarSchema.index({ lastActive: -1 });

// Virtual for avatar display URL (for avatar rendering service)
AvatarSchema.virtual("avatarUrl").get(function () {
  const baseUrl = process.env.AVATAR_RENDER_URL || "/api/avatar/render";
  return `${baseUrl}/${this._id}`;
});

// Methods
AvatarSchema.methods.addExperience = async function (amount, source) {
  this.evolution.experiencePoints += amount;
  this.totalInteractions += 1;
  
  // Check for level up
  while (this.evolution.experiencePoints >= this.evolution.experienceToNextLevel) {
    this.evolution.experiencePoints -= this.evolution.experienceToNextLevel;
    this.evolution.currentLevel += 1;
    this.evolution.experienceToNextLevel = Math.floor(100 * Math.pow(1.2, this.evolution.currentLevel - 1));
    
    // Check for evolution stage change
    const stageThresholds = {
      learner: 5,
      scholar: 15,
      expert: 30,
      master: 50,
      legend: 75,
    };
    
    for (const [stage, level] of Object.entries(stageThresholds)) {
      if (this.evolution.currentLevel >= level) {
        this.evolution.evolutionStage = stage;
      }
    }
    
    // Add milestone
    this.evolution.milestones.push({
      name: `Level ${this.evolution.currentLevel}`,
      description: `Reached level ${this.evolution.currentLevel}`,
      achievedAt: new Date(),
      reward: `Level ${this.evolution.currentLevel} rewards unlocked`,
    });
  }
  
  await this.save();
  return this;
};

AvatarSchema.methods.updateMood = function (mood, trigger, intensity = 50) {
  this.emotionalState.currentMood = mood;
  this.emotionalState.moodTrigger = trigger;
  this.emotionalState.moodIntensity = intensity;
  this.emotionalState.lastMoodChange = new Date();
};

AvatarSchema.methods.getReaction = function (event) {
  const reactions = {
    correctAnswer: {
      moods: ["happy", "excited", "proud"],
      animations: ["dance", "clap", "jump"],
    },
    wrongAnswer: {
      moods: ["encouraging", "determined"],
      animations: ["thinking", "reading"],
    },
    perfectScore: {
      moods: ["excited", "proud"],
      animations: ["fireworks", "confetti", "backflip"],
    },
    streakMilestone: {
      moods: ["excited", "proud"],
      animations: ["fireworks", "dance"],
    },
    quizStart: {
      moods: ["focused", "determined", "curious"],
      animations: ["waving", "bouncing"],
    },
    quizComplete: {
      moods: ["happy", "proud"],
      animations: ["clap", "dance"],
    },
  };
  
  const reaction = reactions[event] || reactions.correctAnswer;
  return {
    mood: reaction.moods[Math.floor(Math.random() * reaction.moods.length)],
    animation: reaction.animations[Math.floor(Math.random() * reaction.animations.length)],
  };
};

AvatarSchema.methods.getPersonalizedMessage = function (event) {
  const personality = this.personality;
  const messages = {
    correctAnswer: [
      personality.enthusiasm > 70 ? "🎉 Amazing! You're on fire!" : "✓ Correct!",
      personality.humor > 60 ? "Big brain energy right there! 🧠" : "Well done!",
      personality.competitiveness > 70 ? "That's how champions do it! 🏆" : "Great job!",
    ],
    wrongAnswer: [
      personality.supportiveness > 70 ? "Don't worry, mistakes help us learn! 💪" : "Let's try again.",
      personality.patience > 70 ? "Take your time to understand this one. 📚" : "Review and retry!",
      personality.humor > 60 ? "Even Einstein made mistakes! (Probably... 🤔)" : "Keep going!",
    ],
    encouragement: [
      personality.enthusiasm > 70 ? "You're doing INCREDIBLE! Keep it up! 🚀" : "You're doing well!",
      personality.competitiveness > 70 ? "You're climbing the ranks! 📈" : "Nice progress!",
    ],
    celebration: [
      personality.enthusiasm > 80 ? "🎊 LEGENDARY PERFORMANCE! 🎊" : "Congratulations!",
      personality.humor > 60 ? "Time to update that resume with 'Quiz Champion' 😎" : "Outstanding!",
    ],
  };
  
  const customMessages = this.customMessages[event];
  if (customMessages && customMessages.length > 0) {
    return customMessages[Math.floor(Math.random() * customMessages.length)];
  }
  
  const defaultMessages = messages[event] || messages.correctAnswer;
  return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
};

// Statics
AvatarSchema.statics.createDefaultAvatar = async function (userId) {
  const avatar = new this({
    user: userId,
    customMessages: {
      correctAnswer: ["Great job! 🎉", "You got it! ✨", "Brilliant! 💪"],
      wrongAnswer: ["Keep trying! 💪", "You'll get it next time! 📚", "Learning is a journey! 🌟"],
      encouragement: ["You're doing great! 🚀", "Keep going! 💫", "Almost there! 🎯"],
      celebration: ["Amazing performance! 🏆", "You're a star! ⭐", "Incredible! 🎊"],
      greeting: ["Ready to learn? 📖", "Let's do this! 💪", "Welcome back! 👋"],
    },
  });
  await avatar.save();
  return avatar;
};

// Configure toJSON to include virtuals
AvatarSchema.set("toJSON", { virtuals: true });
AvatarSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Avatar", AvatarSchema);
