/**
 * Migration script to update quiz points based on difficulty
 * Run with: node backend/scripts/update-quiz-points.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');

// Point values based on difficulty
const DIFFICULTY_POINTS = {
  'Easy': 5,
  'Medium': 10,
  'Hard': 15,
  'Expert': 20
};

async function updateQuizPoints() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const quizzes = await Quiz.find({});
    console.log(`📊 Found ${quizzes.length} quizzes to update`);

    let updatedCount = 0;
    let totalQuestionsUpdated = 0;

    for (const quiz of quizzes) {
      let quizUpdated = false;
      
      for (const question of quiz.questions) {
        // Only update if points are default (1) or not set
        if (!question.points || question.points === 1) {
          const difficulty = question.difficulty || quiz.difficulty || 'Medium';
          question.points = DIFFICULTY_POINTS[difficulty] || 10;
          quizUpdated = true;
          totalQuestionsUpdated++;
        }
      }

      if (quizUpdated) {
        // Recalculate total points
        quiz.totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0);
        await quiz.save();
        updatedCount++;
        console.log(`  ✓ Updated quiz: ${quiz.title} (${quiz.questions.length} questions, ${quiz.totalPoints} total points)`);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`  - Quizzes updated: ${updatedCount}/${quizzes.length}`);
    console.log(`  - Questions updated: ${totalQuestionsUpdated}`);
    console.log('✅ Migration completed successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating quiz points:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

updateQuizPoints();
