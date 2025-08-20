// Test script to verify mood data flow with authentication
const testUrls = [
  'http://localhost:3000/api/mobile',
  'http://192.168.18.30:3000/api/mobile'
];

async function testMoodWithAuth(url) {
  console.log(`\n🧪 Testing mood data flow with auth at: ${url}`);
  
  try {
    // Step 1: Test connection
    console.log('1️⃣ Testing connection...');
    const connectionResponse = await fetch(`${url}/test-connection`);
    const connectionData = await connectionResponse.json();
    console.log('✅ Connection:', connectionData.message);
    
    // Step 2: Login to get token
    console.log('2️⃣ Logging in to get token...');
    const loginData = {
      email: 'wiwawe@phc.com',
      password: 'password123'
    };
    
    const loginResponse = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    const loginResult = await loginResponse.json();
    console.log('✅ Login result:', loginResult);
    
    if (!loginResult.success) {
      console.log('❌ FAILED: Could not login');
      console.log('Error:', loginResult.message);
      return;
    }
    
    const token = loginResult.data.accessToken || loginResult.data.token;
    console.log('🔑 Token received:', token ? 'Yes' : 'No');
    
    // Step 3: Test mood creation with auth
    console.log('3️⃣ Testing mood creation with auth...');
    const moodData = {
      user_id: 5, // Use the user ID from the terminal output
      mood_level: 'very_happy',
      stress_level: 'low',
      energy_level: 'high',
      tracking_date: new Date().toISOString().split('T')[0],
      notes: 'Test mood data with auth'
    };
    
    console.log('📝 Sending mood data:', moodData);
    
    const moodResponse = await fetch(`${url}/mood_tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(moodData)
    });
    
    const moodResult = await moodResponse.json();
    console.log('✅ Mood creation result:', moodResult);
    
    if (!moodResult.success) {
      console.log('❌ FAILED: Mood data not saved');
      console.log('Error:', moodResult.message);
      return;
    }
    
    console.log('🎉 SUCCESS: Mood data saved successfully!');
    console.log(`📊 Saved with ID: ${moodResult.data.id}`);
    
    // Step 4: Test mood retrieval via wellness endpoint with auth
    console.log('4️⃣ Testing mood retrieval via wellness endpoint with auth...');
    const wellnessResponse = await fetch(`${url}/wellness/mood-tracker?period=7`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const wellnessData = await wellnessResponse.json();
    
    console.log('✅ Wellness mood data:', wellnessData);
    
    if (wellnessData.success) {
      console.log('📊 Mood data retrieved successfully!');
      console.log(`📈 Total entries: ${wellnessData.data.total_entries}`);
      console.log(`😊 Most common mood: ${wellnessData.data.most_common_mood}`);
      console.log(`📊 Average mood score: ${wellnessData.data.average_mood_score}`);
      console.log(`📋 Mood distribution:`, wellnessData.data.mood_distribution);
      
      if (wellnessData.data.total_entries > 0) {
        console.log('🎉 SUCCESS: Mood data is being retrieved correctly!');
        console.log('📋 Sample entries:', wellnessData.data.entries.slice(0, 2));
      } else {
        console.log('⚠️ WARNING: No mood entries found, but API is working');
      }
    } else {
      console.log('❌ FAILED: Could not retrieve mood data');
      console.log('Error:', wellnessData.message || wellnessData.error);
    }
    
    // Step 5: Test wellness stats with auth
    console.log('5️⃣ Testing wellness stats with auth...');
    const statsResponse = await fetch(`${url}/wellness/stats?period=week`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const statsData = await statsResponse.json();
    
    console.log('✅ Wellness stats:', statsData);
    
    if (statsData.success) {
      console.log('📊 Wellness stats retrieved successfully!');
      console.log(`📈 Total activities: ${statsData.data.total_activities_completed || 0}`);
      console.log(`⭐ Total points: ${statsData.data.total_points_earned || 0}`);
      console.log(`🔥 Streak days: ${statsData.data.streak_days || 0}`);
    } else {
      console.log('⚠️ WARNING: Could not retrieve wellness stats');
      console.log('Error:', statsData.message || statsData.error);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting mood data flow tests with authentication...');
  
  for (const url of testUrls) {
    await testMoodWithAuth(url);
  }
  
  console.log('\n✅ Mood data flow tests with authentication completed!');
}

runTests().catch(console.error);
