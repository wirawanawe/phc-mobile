const fetch = require('node-fetch');

async function testWeeklySummary() {
  const baseURL = 'http://localhost:3000/api/mobile';
  
  try {
    console.log('Testing Weekly Summary API...');
    
    // Test with a sample user ID (you may need to adjust this)
    const userId = 1;
    const url = `${baseURL}/tracking/weekly-summary?user_id=${userId}`;
    
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Weekly Summary API test passed!');
      console.log('Period:', data.data.period);
      console.log('Weekly totals:', data.data.weekly_totals);
      console.log('Weekly averages:', data.data.weekly_averages);
      console.log('Wellness score:', data.data.wellness_score);
    } else {
      console.log('❌ Weekly Summary API test failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing Weekly Summary API:', error.message);
  }
}

// Run the test
testWeeklySummary(); 