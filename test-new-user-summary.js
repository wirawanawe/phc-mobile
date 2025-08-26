const fetch = require('node-fetch');

async function testNewUserSummary() {
  console.log('🔍 Testing today summary for new user...');
  
  try {
    // Test today summary endpoint with user_id parameter
    const response = await fetch('https://dash.doctorphc.id/api/mobile/tracking/today-summary?user_id=1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Today summary response:');
      console.log(JSON.stringify(data, null, 2));
      
      // Check if data is zero for new user
      const summary = data.data;
      if (summary) {
        console.log('\n📊 Data verification:');
        console.log(`- Calories: ${summary.meal?.calories} (should be 0.00)`);
        console.log(`- Steps: ${summary.fitness?.steps} (should be 0)`);
        console.log(`- Exercise minutes: ${summary.fitness?.exercise_minutes} (should be 0)`);
        console.log(`- Distance: ${summary.fitness?.distance_km} (should be 0.00)`);
        console.log(`- Water: ${summary.water?.total_ml} (should be 0)`);
        
        // Verify all values are zero
        const calories = parseFloat(summary.meal?.calories) || 0;
        const steps = parseInt(summary.fitness?.steps) || 0;
        const exerciseMinutes = parseInt(summary.fitness?.exercise_minutes) || 0;
        const distance = parseFloat(summary.fitness?.distance_km) || 0;
        const water = parseInt(summary.water?.total_ml) || 0;
        
        if (calories === 0 && steps === 0 && exerciseMinutes === 0 && distance === 0 && water === 0) {
          console.log('\n✅ SUCCESS: All data is zero for new user!');
        } else {
          console.log('\n❌ FAILED: Some data is not zero for new user!');
        }
      }
    } else {
      console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testNewUserSummary().catch(console.error);
