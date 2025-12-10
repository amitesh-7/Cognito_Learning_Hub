/**
 * Daily Quest Model
 * Manages daily challenges for unlocking avatar items
 */

const mongoose = require('mongoose');

const dailyQuestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Quest Details
  questType: {
    type: String,
    enum: ['quizzes_completed', 'high_score', 'streak_maintained', 'xp_earned', 'achievements_unlocked', 'duel_wins'],
    required: true,
  },
  
  title: {
    type: String,
    required: true,
  },
  
  description: {
    type: String,
    required: true,
  },
  
  // Progress Tracking
  targetValue: {
    type: Number,
    required: true,
  },
  
  currentProgress: {
    type: Number,
    default: 0,
  },
  
  // Rewards
  reward: {
    itemId: String,
    itemType: String, // 'headAccessories', 'faceAccessories', 'badges', 'backgrounds', 'hairStyles', 'expressions'
    itemName: String,
    xpBonus: Number,
    coinBonus: Number,
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'claimed', 'expired'],
    default: 'active',
  },
  
  // Timing
  questDate: {
    type: Date,
    required: true,
  },
  
  expiresAt: {
    type: Date,
    required: true,
  },
  
  completedAt: Date,
  claimedAt: Date,
  
  // Difficulty
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  },
}, {
  timestamps: true,
});

// Indexes
dailyQuestSchema.index({ user: 1, questDate: -1 });
dailyQuestSchema.index({ user: 1, status: 1 });
dailyQuestSchema.index({ expiresAt: 1 });

// Methods
dailyQuestSchema.methods.updateProgress = function(value) {
  this.currentProgress = Math.min(this.currentProgress + value, this.targetValue);
  
  if (this.currentProgress >= this.targetValue && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

dailyQuestSchema.methods.claimReward = function() {
  if (this.status !== 'completed') {
    throw new Error('Quest not completed yet');
  }
  
  this.status = 'claimed';
  this.claimedAt = new Date();
  return this.save();
};

// Static Methods
dailyQuestSchema.statics.generateDailyQuests = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if quests already exist for today
  const existingQuests = await this.find({
    user: userId,
    questDate: { $gte: today, $lt: tomorrow },
  });
  
  if (existingQuests.length > 0) {
    return existingQuests;
  }
  
  // Quest templates with varying difficulty
  const questTemplates = [
    // Easy Quests
    {
      questType: 'quizzes_completed',
      title: 'Quick Learner',
      description: 'Complete 3 quizzes today',
      targetValue: 3,
      difficulty: 'easy',
      reward: {
        itemType: 'headAccessories',
        xpBonus: 50,
        coinBonus: 10,
      },
    },
    {
      questType: 'high_score',
      title: 'Accuracy Expert',
      description: 'Score 80% or higher on any quiz',
      targetValue: 1,
      difficulty: 'easy',
      reward: {
        itemType: 'badges',
        xpBonus: 40,
        coinBonus: 8,
      },
    },
    {
      questType: 'streak_maintained',
      title: 'Consistent Performer',
      description: 'Maintain a 5-question streak',
      targetValue: 5,
      difficulty: 'easy',
      reward: {
        itemType: 'expressions',
        xpBonus: 30,
        coinBonus: 5,
      },
    },
    // Medium Quests
    {
      questType: 'quizzes_completed',
      title: 'Study Marathon',
      description: 'Complete 5 quizzes today',
      targetValue: 5,
      difficulty: 'medium',
      reward: {
        itemType: 'backgrounds',
        xpBonus: 100,
        coinBonus: 20,
      },
    },
    {
      questType: 'xp_earned',
      title: 'XP Grinder',
      description: 'Earn 200 XP today',
      targetValue: 200,
      difficulty: 'medium',
      reward: {
        itemType: 'hairStyles',
        xpBonus: 80,
        coinBonus: 15,
      },
    },
    {
      questType: 'high_score',
      title: 'Perfectionist',
      description: 'Score 95% or higher on any quiz',
      targetValue: 1,
      difficulty: 'medium',
      reward: {
        itemType: 'faceAccessories',
        xpBonus: 120,
        coinBonus: 25,
      },
    },
    // Hard Quests
    {
      questType: 'quizzes_completed',
      title: 'Knowledge Warrior',
      description: 'Complete 10 quizzes today',
      targetValue: 10,
      difficulty: 'hard',
      reward: {
        itemType: 'headAccessories',
        xpBonus: 250,
        coinBonus: 50,
      },
    },
    {
      questType: 'achievements_unlocked',
      title: 'Achievement Hunter',
      description: 'Unlock 3 achievements today',
      targetValue: 3,
      difficulty: 'hard',
      reward: {
        itemType: 'badges',
        xpBonus: 200,
        coinBonus: 40,
      },
    },
    {
      questType: 'duel_wins',
      title: 'Duel Champion',
      description: 'Win 5 duel battles today',
      targetValue: 5,
      difficulty: 'hard',
      reward: {
        itemType: 'backgrounds',
        xpBonus: 300,
        coinBonus: 60,
      },
    },
  ];
  
  // Select 3 random quests (1 easy, 1 medium, 1 hard)
  const easyQuests = questTemplates.filter(q => q.difficulty === 'easy');
  const mediumQuests = questTemplates.filter(q => q.difficulty === 'medium');
  const hardQuests = questTemplates.filter(q => q.difficulty === 'hard');
  
  const selectedQuests = [
    easyQuests[Math.floor(Math.random() * easyQuests.length)],
    mediumQuests[Math.floor(Math.random() * mediumQuests.length)],
    hardQuests[Math.floor(Math.random() * hardQuests.length)],
  ];
  
  // Create quests
  const quests = await Promise.all(
    selectedQuests.map(template => {
      return this.create({
        user: userId,
        ...template,
        questDate: today,
        expiresAt: tomorrow,
        currentProgress: 0,
        status: 'active',
      });
    })
  );
  
  return quests;
};

dailyQuestSchema.statics.getActiveQuests = function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.find({
    user: userId,
    expiresAt: { $gt: new Date() },
    status: { $in: ['active', 'completed'] },
  }).sort({ difficulty: 1 });
};

dailyQuestSchema.statics.expireOldQuests = async function() {
  const now = new Date();
  
  await this.updateMany(
    {
      expiresAt: { $lt: now },
      status: { $in: ['active', 'completed'] },
    },
    {
      $set: { status: 'expired' },
    }
  );
};

const DailyQuest = mongoose.model('DailyQuest', dailyQuestSchema);

module.exports = DailyQuest;
