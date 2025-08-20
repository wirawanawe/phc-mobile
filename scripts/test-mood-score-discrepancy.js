const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testMoodScoreDiscrepancy() {
  console.log('🧪 Testing Mood Score Discrepancy...\n');

  console.log('📊 Mood Score Systems Comparison:\n');

  console.log('1. DATABASE STORAGE (mood_tracking route):');
  console.log('   - very_happy: 10');
  console.log('   - happy: 8');
  console.log('   - neutral: 5');
  console.log('   - sad: 3');
  console.log('   - very_sad: 1');
  console.log('   Scale: 1-10\n');

  console.log('2. BACKEND API (mood-tracker route):');
  console.log('   - very_happy: 5');
  console.log('   - happy: 4');
  console.log('   - neutral: 3');
  console.log('   - sad: 2');
  console.log('   - very_sad: 1');
  console.log('   Scale: 1-5\n');

  console.log('3. FRONTEND (MoodTrackingScreen.tsx):');
  console.log('   - very_happy: 100');
  console.log('   - happy: 80');
  console.log('   - neutral: 60');
  console.log('   - sad: 40');
  console.log('   - very_sad: 20');
  console.log('   Scale: 0-100\n');

  console.log('🚨 ISSUE IDENTIFIED:');
  console.log('- Database stores: very_happy = 10');
  console.log('- Backend API calculates: very_happy = 5');
  console.log('- Frontend displays: very_happy = 100');
  console.log('- This creates a 2x difference between database and API!');

  try {
    // Test mood history endpoint to see what the API returns
    console.log('\n📊 Test: Checking mood history API response...');
    
    const historyResponse = await axios.get(`${BASE_URL}/mobile/wellness/mood-tracker`, {
      params: { user_id: 1, period: 7 },
      timeout: 5000
    });
    
    console.log(`✅ History Response Status: ${historyResponse.status}`);
    console.log(`📊 History Data:`);
    console.log(`   - Success: ${historyResponse.data.success}`);
    console.log(`   - Total Entries: ${historyResponse.data.data?.total_entries || 0}`);
    console.log(`   - Most Common Mood: ${historyResponse.data.data?.most_common_mood || 'None'}`);
    console.log(`   - Average Mood Score: ${historyResponse.data.data?.average_mood_score || 0}`);
    console.log(`   - Mood Distribution: ${JSON.stringify(historyResponse.data.data?.mood_distribution || {})}`);

    if (historyResponse.data.data?.most_common_mood) {
      const mood = historyResponse.data.data.most_common_mood;
      const apiScore = historyResponse.data.data.average_mood_score;
      
      console.log(`\n🔍 Analysis for mood: ${mood}`);
      console.log(`   - API Score (1-5 scale): ${apiScore}`);
      
      // Calculate what it should be in different scales
      const moodScores = {
        'very_happy': { db: 10, api: 5, frontend: 100 },
        'happy': { db: 8, api: 4, frontend: 80 },
        'neutral': { db: 5, api: 3, frontend: 60 },
        'sad': { db: 3, api: 2, frontend: 40 },
        'very_sad': { db: 1, api: 1, frontend: 20 }
      };
      
      const scores = moodScores[mood];
      if (scores) {
        console.log(`   - Database Score (1-10 scale): ${scores.db}`);
        console.log(`   - Frontend Score (0-100 scale): ${scores.frontend}`);
        console.log(`   - Discrepancy: API shows ${apiScore}, should be ${scores.api}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }

  console.log('\n🎯 RECOMMENDED FIX:');
  console.log('1. Standardize on one mood score system across all components');
  console.log('2. Update backend API to use the same scale as database (1-10)');
  console.log('3. Update frontend to properly convert from API scale to display scale');
  console.log('4. Ensure consistency between storage, calculation, and display');
}

// Run the test
testMoodScoreDiscrepancy();
