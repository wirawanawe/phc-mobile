const axios = require('axios');

async function testWellnessStats() {
  try {
    console.log('🧪 Testing Wellness Stats API fix...');
    
    // Test the wellness stats endpoint
    const response = await axios.get('http://localhost:3000/api/mobile/wellness/stats?period=7', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ Response received:', response.data);
    
    // Check if the correct field names are present
    const data = response.data.data;
    
    console.log('\n📊 Field Name Check:');
    console.log(`- total_activities_completed: ${data.total_activities_completed !== undefined ? '✅' : '❌'}`);
    console.log(`- total_points_earned: ${data.total_points_earned !== undefined ? '✅' : '❌'}`);
    console.log(`- average_mood_score: ${data.average_mood_score !== undefined ? '✅' : '❌'}`);
    console.log(`- streak_days: ${data.streak_days !== undefined ? '✅' : '❌'}`);
    
    console.log('\n📈 Values:');
    console.log(`- Total activities completed: ${data.total_activities_completed || 0}`);
    console.log(`- Total points earned: ${data.total_points_earned || 0}`);
    console.log(`- Average mood score: ${data.average_mood_score || 0}`);
    console.log(`- Streak days: ${data.streak_days || 0}`);
    
  } catch (error) {
    console.error('❌ Error testing wellness stats:', error.response?.data || error.message);
  }
}

testWellnessStats();
