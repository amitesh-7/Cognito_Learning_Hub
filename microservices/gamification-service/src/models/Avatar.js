const mongoose = require('mongoose');

/**
 * Avatar Model
 * Stores user's avatar customization and unlocked items
 * Each user has ONE avatar that can be customized
 */
const AvatarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'User',
    index: true,
  },
  
  // Current avatar configuration
  baseCharacter: {
    type: String,
    enum: [
      'robot',
      'astronaut',
      'wizard',
      'scientist',
      'ninja',
      'knight',
      'explorer',
      'scholar'
    ],
    default: 'robot',
  },
  
  // Customization options
  customization: {
    // Colors
    primaryColor: {
      type: String,
      default: '#6366f1', // Indigo
    },
    secondaryColor: {
      type: String,
      default: '#8b5cf6', // Purple
    },
    skinTone: {
      type: String,
      default: '#fbbf24', // Amber
    },
    
    // Features
    hairStyle: {
      type: String,
      default: 'short',
    },
    hairColor: {
      type: String,
      default: '#1f2937', // Gray-800
    },
    eyeType: {
      type: String,
      default: 'normal',
    },
    mouthType: {
      type: String,
      default: 'smile',
    },
    
    // Accessories (can have multiple)
    accessories: [{
      type: String,
      slot: String, // 'head', 'face', 'body', 'badge'
      itemId: String,
    }],
    
    // Background
    background: {
      type: String,
      default: 'gradient-blue',
    },
  },
  
  // Items the user has unlocked (can use in customization)
  unlockedItems: {
    baseCharacters: {
      type: [String],
      default: ['robot'], // Everyone starts with robot
    },
    accessories: {
      type: [String],
      default: [], // Unlock through achievements
    },
    backgrounds: {
      type: [String],
      default: ['gradient-blue', 'solid-white'],
    },
    hairStyles: {
      type: [String],
      default: ['short', 'medium'],
    },
    expressions: {
      type: [String],
      default: ['smile', 'neutral'],
    },
  },
  
  // Current mood/expression (changes based on activity)
  currentMood: {
    type: String,
    enum: ['happy', 'excited', 'thinking', 'celebrating', 'determined', 'neutral', 'tired', 'confident'],
    default: 'neutral',
  },
  
  // Metadata
  totalCustomizations: {
    type: Number,
    default: 0,
  },
  lastCustomizedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: Check if item is unlocked
AvatarSchema.methods.hasUnlocked = function(itemType, itemId) {
  const items = this.unlockedItems[itemType] || [];
  return items.includes(itemId);
};

// Method: Unlock new item
AvatarSchema.methods.unlockItem = function(itemType, itemId) {
  const items = this.unlockedItems[itemType] || [];
  if (!items.includes(itemId)) {
    items.push(itemId);
    this.unlockedItems[itemType] = items;
  }
  return this.save();
};

// Method: Update customization
AvatarSchema.methods.updateCustomization = function(customizationData) {
  this.customization = { ...this.customization, ...customizationData };
  this.totalCustomizations += 1;
  this.lastCustomizedAt = new Date();
  return this.save();
};

// Method: Change mood
AvatarSchema.methods.setMood = function(mood) {
  this.currentMood = mood;
  return this.save();
};

// Static: Get or create avatar for user
AvatarSchema.statics.getOrCreate = async function(userId) {
  let avatar = await this.findOne({ userId });
  
  if (!avatar) {
    avatar = await this.create({
      userId,
      baseCharacter: 'robot',
      currentMood: 'happy',
    });
  }
  
  return avatar;
};

// Static: Unlock item for user (called when achievement unlocked)
AvatarSchema.statics.unlockForUser = async function(userId, itemType, itemId) {
  const avatar = await this.getOrCreate(userId);
  return avatar.unlockItem(itemType, itemId);
};

// Index for fast lookups
AvatarSchema.index({ userId: 1 });
AvatarSchema.index({ 'unlockedItems.baseCharacters': 1 });

module.exports = mongoose.model('Avatar', AvatarSchema);
