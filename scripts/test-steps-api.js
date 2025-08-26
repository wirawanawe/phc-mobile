const fetch = require('node-fetch');

async function testStepsAPI() {
  const baseURL = 'https://dash.doctorphc.id/api/mobile';
  
  try {
    console.log('🧪 Testing Steps API endpoints...\n');

    // Test 1: Today Summary endpoint (should include steps)
    console.log('1️⃣ Testing /tracking/today-summary...');
    try {
      const todaySummaryResponse = await fetch(`${baseURL}/tracking/today-summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // You'll need a valid token
        }
      });
      
      if (todaySummaryResponse.ok) {
        const data = await todaySummaryResponse.json();
        console.log('✅ Today Summary Response:', JSON.stringify(data, null, 2));
        
        if (data.data && data.data.fitness) {
          console.log(`📊 Steps from today-summary: ${data.data.fitness.steps || 0}`);
        }
      } else {
        console.log('❌ Today Summary failed:', todaySummaryResponse.status);
      }
    } catch (error) {
      console.log('❌ Today Summary error:', error.message);
    }

    console.log('\n2️⃣ Testing /tracking/fitness/today...');
    try {
      const fitnessTodayResponse = await fetch(`${baseURL}/tracking/fitness/today`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
      
      if (fitnessTodayResponse.ok) {
        const data = await fitnessTodayResponse.json();
        console.log('✅ Fitness Today Response:', JSON.stringify(data, null, 2));
        
        if (data.data && data.data.totals) {
          console.log(`📊 Steps from fitness/today: ${data.data.totals.steps || 0}`);
        }
      } else {
        console.log('❌ Fitness Today failed:', fitnessTodayResponse.status);
      }
    } catch (error) {
      console.log('❌ Fitness Today error:', error.message);
    }

    console.log('\n3️⃣ Testing POST to /tracking/fitness...');
    try {
      const testFitnessData = {
        activity_type: 'Walking',
        activity_name: 'Test Walk',
        duration_minutes: 15,
        calories_burned: 75,
        distance_km: 1.0,
        steps: 1500,
        tracking_date: new Date().toISOString().split('T')[0],
        tracking_time: '12:00:00'
      };

      const createFitnessResponse = await fetch(`${baseURL}/tracking/fitness`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(testFitnessData)
      });
      
      if (createFitnessResponse.ok) {
        const data = await createFitnessResponse.json();
        console.log('✅ Create Fitness Response:', JSON.stringify(data, null, 2));
      } else {
        console.log('❌ Create Fitness failed:', createFitnessResponse.status);
      }
    } catch (error) {
      console.log('❌ Create Fitness error:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testStepsAPI(); 