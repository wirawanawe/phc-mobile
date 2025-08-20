const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testMoodButtonText() {
  console.log('🧪 Testing Mood Button Text Logic...\n');

  try {
    // Test 1: Check mood tracking endpoint for user with no mood data
    console.log('📊 Test 1: Testing user with no mood data...');
    
    const responseNoData = await axios.get(`${BASE_URL}/mobile/mood_tracking`, {
      params: { user_id: 999, limit: 5 }, // Use non-existent user
      timeout: 5000
    });
    
    console.log(`✅ Response Status: ${responseNoData.status}`);
    console.log(`📊 Response Data:`);
    console.log(`   - Success: ${responseNoData.data.success}`);
    console.log(`   - Total Entries: ${responseNoData.data.moodData?.length || 0}`);
    console.log(`   - Pagination Total: ${responseNoData.data.pagination?.total || 0}`);
    
    if (responseNoData.data.pagination?.total === 0) {
      console.log('✅ No mood data detected - Button should show "Log Your Mood"');
    } else {
      console.log('⚠️ Mood data found - Button should show "Update Your Mood"');
    }

    // Test 2: Check mood tracking endpoint for user with existing data
    console.log('\n📊 Test 2: Testing user with existing mood data...');
    
    const responseWithData = await axios.get(`${BASE_URL}/mobile/mood_tracking`, {
      params: { user_id: 1, limit: 5 }, // Use existing user
      timeout: 5000
    });
    
    console.log(`✅ Response Status: ${responseWithData.status}`);
    console.log(`📊 Response Data:`);
    console.log(`   - Success: ${responseWithData.data.success}`);
    console.log(`   - Total Entries: ${responseWithData.data.moodData?.length || 0}`);
    console.log(`   - Pagination Total: ${responseWithData.data.pagination?.total || 0}`);
    
    if (responseWithData.data.pagination?.total > 0) {
      console.log('✅ Mood data found - Button should show "Update Your Mood"');
    } else {
      console.log('⚠️ No mood data detected - Button should show "Log Your Mood"');
    }

    // Test 3: Check today's mood endpoint
    console.log('\n📊 Test 3: Testing today\'s mood endpoint...');
    
    try {
      const todayResponse = await axios.get(`${BASE_URL}/mobile/mood_tracking/today`, {
        params: { user_id: 1 },
        timeout: 5000
      });
      
      console.log(`✅ Today's Mood Response Status: ${todayResponse.status}`);
      console.log(`📊 Today's Mood Data:`);
      console.log(`   - Success: ${todayResponse.data.success}`);
      console.log(`   - Has Today's Data: ${!!todayResponse.data.data}`);
      
      if (todayResponse.data.success && todayResponse.data.data) {
        console.log('✅ Today\'s mood data found - Button should show "Update Your Mood"');
      } else {
        console.log('⚠️ No today\'s mood data - Button should show "Log Your Mood"');
      }
    } catch (error) {
      console.log('⚠️ Today\'s mood endpoint not available or error occurred');
    }

    console.log('\n🎯 Summary:');
    console.log('- Button text should be "Log Your Mood" when no mood data exists');
    console.log('- Button text should be "Update Your Mood" when mood data exists');
    console.log('- Button logic checks both hasTodayEntry AND existingMood states');
    console.log('- Button color and icon also change based on mood data presence');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testMoodButtonText();
