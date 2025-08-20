const axios = require('axios');

async function testWellnessComprehensive() {
  try {
    console.log('🧪 Comprehensive Wellness Data Test...\n');
    
    // Test 1: Wellness Stats API
    console.log('📊 Test 1: Wellness Stats API');
    try {
      const statsResponse = await axios.get('http://localhost:3000/api/mobile/wellness/stats?period=7', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      const statsData = statsResponse.data.data;
      console.log('✅ Wellness Stats Response:');
      console.log(`   - Total activities completed: ${statsData.total_activities_completed || 0}`);
      console.log(`   - Total points earned: ${statsData.total_points_earned || 0}`);
      console.log(`   - Average mood score: ${statsData.average_mood_score || 0}`);
      console.log(`   - Streak days: ${statsData.streak_days || 0}`);
      
      // Check if field names are correct
      const hasCorrectFields = 
        statsData.total_activities_completed !== undefined &&
        statsData.total_points_earned !== undefined &&
        statsData.average_mood_score !== undefined &&
        statsData.streak_days !== undefined;
      
      console.log(`   - Field names correct: ${hasCorrectFields ? '✅' : '❌'}`);
      
    } catch (error) {
      console.log('❌ Wellness Stats API Error:', error.response?.data?.message || error.message);
    }
    
    // Test 2: Mood Tracker API
    console.log('\n😊 Test 2: Mood Tracker API');
    try {
      const moodResponse = await axios.get('http://localhost:3000/api/mobile/wellness/mood-tracker?period=7', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      const moodData = moodResponse.data.data;
      console.log('✅ Mood Tracker Response:');
      console.log(`   - Total entries: ${moodData.total_entries || 0}`);
      console.log(`   - Most common mood: ${moodData.most_common_mood || 'None'}`);
      console.log(`   - Average mood score: ${moodData.average_mood_score || 0}`);
      
    } catch (error) {
      console.log('❌ Mood Tracker API Error:', error.response?.data?.message || error.message);
    }
    
    // Test 3: Mission Stats API
    console.log('\n🎯 Test 3: Mission Stats API');
    try {
      const missionResponse = await axios.get('http://localhost:3000/api/mobile/missions/stats?date=2025-01-20', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      const missionData = missionResponse.data.data;
      console.log('✅ Mission Stats Response:');
      console.log(`   - Completed missions: ${missionData.completed_missions || 0}`);
      console.log(`   - Total points earned: ${missionData.total_points_earned || 0}`);
      
    } catch (error) {
      console.log('❌ Mission Stats API Error:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 Comprehensive test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWellnessComprehensive();
