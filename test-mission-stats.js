const fetch = require('node-fetch');

async function testMissionStats() {
  const baseUrl = 'http://localhost:3000/api/mobile';
  
  // Test with current date
  const today = new Date().toISOString().split('T')[0];
  
  try {
    console.log('Testing mission-stats API...');
    console.log('Date:', today);
    
    // Test with date parameter
    const response = await fetch(`${baseUrl}/mission-stats?date=${today}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You'll need a real token for testing
      }
    });
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Mission stats API working with date filtering');
      console.log('Total missions for today:', data.data.total_missions);
      console.log('Completed missions for today:', data.data.completed_missions);
      console.log('Points earned today:', data.data.total_points_earned);
    } else {
      console.log('❌ Mission stats API failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing mission stats:', error.message);
  }
}

testMissionStats(); 