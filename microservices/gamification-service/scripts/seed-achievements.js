/**
 * Seed default achievements into the database
 * Run with: node microservices/gamification-service/scripts/seed-achievements.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Achievement } = require('../src/models/Achievement');

const defaultAchievements = [
  {
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    type: 'quiz_completion',
    criteria: { target: 1 },
    rarity: 'common',
    points: 10,
    isActive: true,
  },
  {
    name: 'Quiz Enthusiast',
    description: 'Complete 10 quizzes',
    icon: '📚',
    type: 'quiz_completion',
    criteria: { target: 10 },
    rarity: 'common',
    points: 50,
    isActive: true,
  },
  {
    name: 'Quiz Master',
    description: 'Complete 50 quizzes',
    icon: '🎓',
    type: 'quiz_completion',
    criteria: { target: 50 },
    rarity: 'rare',
    points: 200,
    isActive: true,
  },
  {
    name: 'Quiz Legend',
    description: 'Complete 100 quizzes',
    icon: '👑',
    type: 'quiz_completion',
    criteria: { target: 100 },
    rarity: 'legendary',
    points: 500,
    isActive: true,
  },
  {
    name: 'Perfect Score',
    description: 'Score 100% on a quiz',
    icon: '💯',
    type: 'score_achievement',
    criteria: { score: 100 },
    rarity: 'epic',
    points: 100,
    isActive: true,
  },
  {
    name: 'Excellence',
    description: 'Score 90% or higher',
    icon: '⭐',
    type: 'score_achievement',
    criteria: { score: 90 },
    rarity: 'rare',
    points: 50,
    isActive: true,
  },
  {
    name: 'Good Effort',
    description: 'Score 80% or higher',
    icon: '🌟',
    type: 'score_achievement',
    criteria: { score: 80 },
    rarity: 'common',
    points: 25,
    isActive: true,
  },
  {
    name: 'On Fire',
    description: 'Achieve a 5-day learning streak',
    icon: '🔥',
    type: 'streak',
    criteria: { target: 5 },
    rarity: 'rare',
    points: 75,
    isActive: true,
  },
  {
    name: 'Unstoppable',
    description: 'Achieve a 10-day streak',
    icon: '🚀',
    type: 'streak',
    criteria: { target: 10 },
    rarity: 'epic',
    points: 150,
    isActive: true,
  },
  {
    name: 'Dedication',
    description: 'Achieve a 30-day streak',
    icon: '💪',
    type: 'streak',
    criteria: { target: 30 },
    rarity: 'legendary',
    points: 500,
    isActive: true,
  },
  {
    name: 'Speed Demon',
    description: 'Complete a quiz in under 2 minutes',
    icon: '⚡',
    type: 'speed',
    criteria: { timeLimit: 120 },
    rarity: 'rare',
    points: 60,
    isActive: true,
  },
  {
    name: 'Lightning Fast',
    description: 'Complete a quiz in under 1 minute',
    icon: '⚡⚡',
    type: 'speed',
    criteria: { timeLimit: 60 },
    rarity: 'epic',
    points: 120,
    isActive: true,
  },
  {
    name: 'Point Collector',
    description: 'Earn 500 total points',
    icon: '💰',
    type: 'special',
    criteria: { target: 500, type: 'points' },
    rarity: 'common',
    points: 50,
    isActive: true,
  },
  {
    name: 'Knowledge Seeker',
    description: 'Earn 1000 total points',
    icon: '💎',
    type: 'special',
    criteria: { target: 1000, type: 'points' },
    rarity: 'rare',
    points: 100,
    isActive: true,
  },
  {
    name: 'Point Master',
    description: 'Earn 5000 total points',
    icon: '👑💎',
    type: 'special',
    criteria: { target: 5000, type: 'points' },
    rarity: 'epic',
    points: 300,
    isActive: true,
  },
  {
    name: 'Early Bird',
    description: 'Complete a quiz before 8 AM',
    icon: '🌅',
    type: 'special',
    criteria: { type: 'early_bird' },
    rarity: 'common',
    points: 25,
    isActive: true,
  },
  {
    name: 'Night Owl',
    description: 'Complete a quiz after 10 PM',
    icon: '🦉',
    type: 'special',
    criteria: { type: 'night_owl' },
    rarity: 'common',
    points: 25,
    isActive: true,
  },
];

async function seedAchievements() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Seeding achievements...');
    
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const achievementData of defaultAchievements) {
      const existing = await Achievement.findOne({ name: achievementData.name });
      
      if (existing) {
        // Update existing achievement
        await Achievement.updateOne(
          { _id: existing._id },
          { $set: achievementData }
        );
        updatedCount++;
        console.log(`  ↻ Updated: ${achievementData.name}`);
      } else {
        // Create new achievement
        await Achievement.create(achievementData);
        createdCount++;
        console.log(`  ✓ Created: ${achievementData.name}`);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`  - Created: ${createdCount}`);
    console.log(`  - Updated: ${updatedCount}`);
    console.log(`  - Total: ${defaultAchievements.length}`);
    console.log('✅ Seeding completed successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedAchievements();
