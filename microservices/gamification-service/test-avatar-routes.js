/**
 * Avatar Routes Test Script
 * Tests the avatar API endpoints
 * 
 * Usage:
 * 1. Start gamification service
 * 2. Run: node test-avatar-routes.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3007';
const TEST_USER_ID = '507f1f77bcf86cd799439011'; // Replace with real user ID

// Mock auth token (you'll need a real one in production)
const AUTH_TOKEN = 'your-test-token-here';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-auth-token': AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
});

async function testAvatarRoutes() {
  console.log('🧪 Testing Avatar Routes\n');

  try {
    // Test 1: Get/Create Avatar
    console.log('1️⃣ Testing GET /api/avatar/me');
    const avatarRes = await api.get('/api/avatar/me');
    console.log('✅ Avatar retrieved:', {
      baseCharacter: avatarRes.data.data.avatar.baseCharacter,
      unlockedCharacters: avatarRes.data.data.avatar.unlockedItems.baseCharacters.length,
      level: avatarRes.data.data.level,
    });
    console.log();

    // Test 2: Get Available Items
    console.log('2️⃣ Testing GET /api/avatar/items');
    const itemsRes = await api.get('/api/avatar/items');
    console.log('✅ Items retrieved:', {
      totalItems: itemsRes.data.data.totalItems,
      unlockedCount: itemsRes.data.data.unlockedCount,
      categories: Object.keys(itemsRes.data.data.items),
    });
    console.log();

    // Test 3: Get Avatar Stats
    console.log('3️⃣ Testing GET /api/avatar/stats');
    const statsRes = await api.get('/api/avatar/stats');
    console.log('✅ Stats retrieved:', {
      completionPercentage: statsRes.data.data.completionPercentage + '%',
      currentCharacter: statsRes.data.data.currentCharacter,
      totalUnlocked: statsRes.data.data.unlockedItems.total,
    });
    console.log();

    // Test 4: Customize Avatar
    console.log('4️⃣ Testing PUT /api/avatar/customize');
    const customizeRes = await api.put('/api/avatar/customize', {
      customization: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        hairColor: '#1F2937',
        eyeType: 'happy',
        mouthType: 'smile',
      },
    });
    console.log('✅ Avatar customized:', {
      primaryColor: customizeRes.data.data.avatar.customization.primaryColor,
      secondaryColor: customizeRes.data.data.avatar.customization.secondaryColor,
    });
    console.log();

    // Test 5: Update Mood
    console.log('5️⃣ Testing PUT /api/avatar/mood');
    const moodRes = await api.put('/api/avatar/mood', {
      mood: 'excited',
    });
    console.log('✅ Mood updated:', {
      currentMood: moodRes.data.data.avatar.currentMood,
    });
    console.log();

    console.log('🎉 All tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error({
        status: error.response.status,
        message: error.response.data.message || error.response.data.error,
        data: error.response.data,
      });
    } else {
      console.error(error.message);
    }
    console.log('\n⚠️  Make sure:');
    console.log('   1. Gamification service is running (port 3007)');
    console.log('   2. MongoDB is connected');
    console.log('   3. You have a valid auth token (if auth is required)');
    console.log('   4. Update TEST_USER_ID and AUTH_TOKEN in this file');
  }
}

// Run tests
testAvatarRoutes();
