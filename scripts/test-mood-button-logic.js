const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testMoodButtonLogic() {
  console.log('🧪 Testing Mood Button Logic with Empty Data...\n');

  try {
    // Test 1: Check today's mood endpoint
    console.log('📊 Test 1: Testing today\'s mood endpoint...');
    
    try {
      const todayResponse = await axios.get(`${BASE_URL}/mobile/mood_tracking/today`, {
        params: { user_id: 1 },
        timeout: 5000
      });
      
      console.log(`✅ Today's Mood Response Status: ${todayResponse.status}`);
      console.log(`📊 Today's Mood Data:`);
      console.log(`   - Success: ${todayResponse.data.success}`);
      console.log(`   - Data: ${JSON.stringify(todayResponse.data.data)}`);
      console.log(`   - Has Entry: ${todayResponse.data.data?.hasEntry}`);
      
      if (todayResponse.data.data?.hasEntry) {
        console.log('✅ Today\'s mood entry exists - Button should show "Update Your Mood"');
      } else {
        console.log('⚠️ No today\'s mood entry - Button should show "Log Your Mood"');
      }
    } catch (error) {
      console.log('⚠️ Today\'s mood endpoint error:', error.message);
    }

    // Test 2: Check mood history endpoint
    console.log('\n📊 Test 2: Testing mood history endpoint...');
    
    const historyResponse = await axios.get(`${BASE_URL}/mobile/mood_tracking`, {
      params: { user_id: 1, limit: 5 },
      timeout: 5000
    });
    
    console.log(`✅ History Response Status: ${historyResponse.status}`);
    console.log(`📊 History Data:`);
    console.log(`   - Success: ${historyResponse.data.success}`);
    console.log(`   - Total Entries: ${historyResponse.data.moodData?.length || 0}`);
    console.log(`   - Pagination Total: ${historyResponse.data.pagination?.total || 0}`);
    
    if (historyResponse.data.pagination?.total > 0) {
      console.log('✅ Mood history exists - Checking for today\'s entry...');
      
      // Check if there's an entry for today
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = historyResponse.data.moodData && 
        historyResponse.data.moodData.find((entry) => entry.tracking_date === today);
      
      if (todayEntry) {
        console.log('✅ Today\'s entry found in history:');
        console.log(`   - Date: ${todayEntry.tracking_date}`);
        console.log(`   - Mood Level: ${todayEntry.mood_level}`);
        console.log(`   - Has Mood Data: ${!!todayEntry.mood_level}`);
        
        if (todayEntry.mood_level) {
          console.log('✅ Today\'s entry has mood data - Button should show "Update Your Mood"');
        } else {
          console.log('⚠️ Today\'s entry exists but no mood data - Button should show "Log Your Mood"');
        }
      } else {
        console.log('⚠️ No today\'s entry in history - Button should show "Log Your Mood"');
      }
    } else {
      console.log('⚠️ No mood history - Button should show "Log Your Mood"');
    }

    console.log('\n🎯 Summary:');
    console.log('- Button should show "Log Your Mood" when:');
    console.log('  * No today\'s mood entry exists');
    console.log('  * Today\'s entry exists but has no mood_level');
    console.log('  * No mood history exists');
    console.log('- Button should show "Update Your Mood" when:');
    console.log('  * Today\'s entry exists AND has mood_level data');
    console.log('- Status section should only show when:');
    console.log('  * existingMood exists AND existingMood.mood_level exists');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testMoodButtonLogic();
