const axios = require('axios');

// Test the current state of the habit completion API
async function testCurrentHabitAPI() {
  try {
    console.log('🧪 Testing current habit completion API state...');
    
    // Test with a simple request to see the current response
    const response = await axios.post('https://dash.doctorphc.id/api/mobile/habit/activities/complete', {
      activity_id: 1,
      frequency: 1,
      notes: 'Test completion'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API responded successfully!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('❌ API test failed:');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data);
    
    if (error.response?.status === 500) {
      console.error('\n🔍 Server error details:');
      console.error('Error:', error.response.data.error);
      console.error('Message:', error.response.data.message);
    }
  }
}

testCurrentHabitAPI();
