const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testMoodScoreVisibility() {
  console.log('🧪 Testing Mental Wellness Score Card Visibility...\n');

  try {
    // Test 1: Check mood tracking endpoint with no history
    console.log('📊 Test 1: Testing mood tracking with no history...');
    
    const response = await axios.get(`${BASE_URL}/mobile/mood_tracking`, {
      params: { user_id: 999, limit: 5 }, // Use non-existent user to get no data
      timeout: 5000
    });
    
    console.log(`✅ Response Status: ${response.status}`);
    console.log(`📊 Response Data:`);
    console.log(`   - Success: ${response.data.success}`);
    console.log(`   - Total Entries: ${response.data.moodData?.length || 0}`);
    console.log(`   - Pagination Total: ${response.data.pagination?.total || 0}`);
    
    if (response.data.pagination?.total === 0) {
      console.log('✅ No mood history detected - Mental wellness score card should be HIDDEN');
    } else {
      console.log('⚠️ Mood history found - Mental wellness score card should be VISIBLE');
    }

    // Test 2: Check mood tracking endpoint with existing history
    console.log('\n📊 Test 2: Testing mood tracking with existing history...');
    
    const responseWithHistory = await axios.get(`${BASE_URL}/mobile/mood_tracking`, {
      params: { user_id: 1, limit: 5 }, // Use existing user
      timeout: 5000
    });
    
    console.log(`✅ Response Status: ${responseWithHistory.status}`);
    console.log(`📊 Response Data:`);
    console.log(`   - Success: ${responseWithHistory.data.success}`);
    console.log(`   - Total Entries: ${responseWithHistory.data.moodData?.length || 0}`);
    console.log(`   - Pagination Total: ${responseWithHistory.data.pagination?.total || 0}`);
    
    if (responseWithHistory.data.pagination?.total > 0) {
      console.log('✅ Mood history found - Mental wellness score card should be VISIBLE');
    } else {
      console.log('⚠️ No mood history detected - Mental wellness score card should be HIDDEN');
    }

    console.log('\n🎯 Summary:');
    console.log('- Mental wellness score card should only appear when moodScore > 0 AND moodHistory.total_entries > 0');
    console.log('- When no mood history exists, the card should be completely hidden');
    console.log('- This prevents showing "No data" scores to users who haven\'t tracked their mood yet');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testMoodScoreVisibility();
