/**
 * Seed Achievements with Avatar Rewards
 * Run this script to populate achievements database with avatar item rewards
 */

const mongoose = require('mongoose');
const { Achievement } = require('../src/models/Achievement');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cognito-learning-hub';

// Achievement definitions with avatar rewards
const achievementsWithRewards = [
  // Quiz Achievements
  {
    name: 'first-quiz',
    description: 'Complete your first quiz',
    icon: '🎯',
    type: 'quiz_completion',
    criteria: { target: 1 },
    rarity: 'common',
    points: 10,
    rewards: {
      avatarItems: [
        { itemId: 'first-quiz-badge', itemType: 'badge' }
      ],
      xpBonus: 50,
    },
  },
  {
    name: 'quiz-master-50',
    description: 'Complete 50 quizzes',
    icon: '📚',
    type: 'quiz_completion',
    criteria: { target: 50 },
    rarity: 'rare',
    points: 50,
    rewards: {
      avatarItems: [
        { itemId: 'graduation-cap', itemType: 'headAccessory' }
      ],
      xpBonus: 500,
    },
  },
  {
    name: 'quiz-master-100',
    description: 'Complete 100 quizzes',
    icon: '🎓',
    type: 'quiz_completion',
    criteria: { target: 100 },
    rarity: 'epic',
    points: 100,
    rewards: {
      avatarItems: [
        { itemId: 'nerd-glasses', itemType: 'faceAccessory' }
      ],
      xpBonus: 1000,
    },
  },
  {
    name: 'quiz-veteran',
    description: 'Complete 200 quizzes',
    icon: '📖',
    type: 'quiz_completion',
    criteria: { target: 200 },
    rarity: 'epic',
    points: 200,
    rewards: {
      avatarItems: [
        { itemId: 'space-stars', itemType: 'background' }
      ],
      xpBonus: 2000,
    },
  },

  // Score Achievements
  {
    name: 'flawless-victory',
    description: 'Get your first perfect score (100%)',
    icon: '💯',
    type: 'score_achievement',
    criteria: { score: 100 },
    rarity: 'rare',
    points: 25,
    rewards: {
      avatarItems: [
        { itemId: 'perfect-score-badge', itemType: 'badge' }
      ],
      xpBonus: 100,
    },
  },
  {
    name: 'perfectionist',
    description: 'Get 10 perfect scores',
    icon: '🌟',
    type: 'score_achievement',
    criteria: { target: 10, score: 100 },
    rarity: 'epic',
    points: 100,
    rewards: {
      avatarItems: [
        { itemId: 'wizard-hat', itemType: 'headAccessory' }
      ],
      xpBonus: 1000,
    },
  },

  // Streak Achievements
  {
    name: 'week-warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    type: 'streak',
    criteria: { target: 7 },
    rarity: 'common',
    points: 30,
    rewards: {
      avatarItems: [
        { itemId: 'streak-badge', itemType: 'badge' }
      ],
      xpBonus: 200,
    },
  },
  {
    name: 'streak-100',
    description: 'Maintain a 100-day streak',
    icon: '🔥',
    type: 'streak',
    criteria: { target: 100 },
    rarity: 'legendary',
    points: 500,
    rewards: {
      avatarItems: [
        { itemId: 'halo', itemType: 'headAccessory' }
      ],
      xpBonus: 5000,
    },
  },

  // Speed Achievements
  {
    name: 'speed-demon',
    description: 'Complete 5 quizzes in under 2 minutes each',
    icon: '⚡',
    type: 'speed',
    criteria: { target: 5, timeLimit: 120 },
    rarity: 'epic',
    points: 75,
    rewards: {
      avatarItems: [
        { itemId: 'ninja', itemType: 'baseCharacter' }
      ],
      xpBonus: 750,
    },
  },

  // Duel Achievements
  {
    name: 'duel-champion',
    description: 'Win 50 duels',
    icon: '⚔️',
    type: 'duel',
    criteria: { target: 50 },
    rarity: 'rare',
    points: 100,
    rewards: {
      avatarItems: [
        { itemId: 'party-glasses', itemType: 'faceAccessory' }
      ],
      xpBonus: 1000,
    },
  },
  {
    name: 'duel-master',
    description: 'Win 100 duels',
    icon: '🏆',
    type: 'duel',
    criteria: { target: 100 },
    rarity: 'epic',
    points: 200,
    rewards: {
      avatarItems: [
        { itemId: 'neon-city', itemType: 'background' }
      ],
      xpBonus: 2000,
    },
  },

  // Live Session Achievements
  {
    name: 'live-participant',
    description: 'Join 25 live sessions',
    icon: '📡',
    type: 'live_session',
    criteria: { target: 25 },
    rarity: 'common',
    points: 50,
    rewards: {
      avatarItems: [
        { itemId: 'headphones', itemType: 'headAccessory' }
      ],
      xpBonus: 500,
    },
  },

  // Leaderboard Achievements
  {
    name: 'top-rank',
    description: 'Reach #1 on any leaderboard',
    icon: '👑',
    type: 'special',
    rarity: 'legendary',
    points: 1000,
    rewards: {
      avatarItems: [
        { itemId: 'crown', itemType: 'headAccessory' }
      ],
      xpBonus: 10000,
    },
  },
  {
    name: 'top-3-global',
    description: 'Reach top 3 on global leaderboard',
    icon: '🥇',
    type: 'special',
    rarity: 'legendary',
    points: 500,
    rewards: {
      avatarItems: [
        { itemId: 'golden-shine', itemType: 'background' }
      ],
      xpBonus: 5000,
    },
  },

  // Social Achievements
  {
    name: 'social-butterfly',
    description: 'Add 10 friends',
    icon: '🦋',
    type: 'social',
    criteria: { target: 10 },
    rarity: 'common',
    points: 20,
    rewards: {
      avatarItems: [
        { itemId: 'social-badge', itemType: 'badge' }
      ],
      xpBonus: 200,
    },
  },

  // Category Master Achievements (example for Math)
  {
    name: 'math-master',
    description: 'Complete 50 math quizzes with 90% average',
    icon: '🔢',
    type: 'category_master',
    criteria: { target: 50, category: 'math', score: 90 },
    rarity: 'rare',
    points: 75,
    rewards: {
      xpBonus: 750,
    },
  },
];

// Seed function
async function seedAchievements() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing achievements...');
    await Achievement.deleteMany({});

    console.log('🌱 Seeding achievements with avatar rewards...');
    const createdAchievements = await Achievement.insertMany(achievementsWithRewards);
    
    console.log(`✅ Successfully created ${createdAchievements.length} achievements`);
    
    // Display summary
    console.log('\n📊 Achievement Summary:');
    console.log(`   Common: ${createdAchievements.filter(a => a.rarity === 'common').length}`);
    console.log(`   Rare: ${createdAchievements.filter(a => a.rarity === 'rare').length}`);
    console.log(`   Epic: ${createdAchievements.filter(a => a.rarity === 'epic').length}`);
    console.log(`   Legendary: ${createdAchievements.filter(a => a.rarity === 'legendary').length}`);
    
    console.log('\n🎁 Achievements with Avatar Rewards:');
    const withRewards = createdAchievements.filter(a => a.rewards?.avatarItems?.length > 0);
    withRewards.forEach(achievement => {
      console.log(`   ${achievement.icon} ${achievement.name}:`);
      achievement.rewards.avatarItems.forEach(item => {
        console.log(`      → ${item.itemType}: ${item.itemId}`);
      });
    });

    console.log('\n✨ Seeding complete!');

  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  seedAchievements();
}

module.exports = seedAchievements;
