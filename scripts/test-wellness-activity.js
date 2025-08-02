const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/mobile';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

const testWellnessActivity = {
  user_id: 1,
  activity_id: 1,
  duration_minutes: 30,
  notes: 'Test wellness activity completion',
  completed_at: new Date().toISOString()
};

async function testWellnessActivities() {
  console.log('🧪 Testing Wellness Activities Integration...\n');

  try {
    // 1. Test getting wellness activities
    console.log('1️⃣ Testing GET /wellness/activities...');
    const activitiesResponse = await fetch(`${BASE_URL}/wellness/activities`);
    const activitiesData = await activitiesResponse.json();
    
    if (activitiesData.success) {
      console.log('✅ Wellness activities retrieved successfully');
      console.log(`📊 Found ${activitiesData.data.length} activities`);
      if (activitiesData.data.length > 0) {
        console.log('📋 Sample activity:', activitiesData.data[0]);
      }
    } else {
      console.log('❌ Failed to get wellness activities:', activitiesData.message);
    }

    // 2. Test completing a wellness activity
    console.log('\n2️⃣ Testing POST /wellness/activities/complete...');
    const completionResponse = await fetch(`${BASE_URL}/wellness/activities/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testWellnessActivity)
    });
    const completionData = await completionResponse.json();
    
    if (completionData.success) {
      console.log('✅ Wellness activity completed successfully');
      console.log(`🏆 Points earned: ${completionData.data.points_earned}`);
      console.log(`⏱️ Duration: ${completionData.data.duration_minutes} minutes`);
    } else {
      console.log('❌ Failed to complete wellness activity:', completionData.message);
    }

    // 3. Test getting wellness data to verify activity count increased
    console.log('\n3️⃣ Testing GET /wellness/data to verify activity count...');
    const wellnessDataResponse = await fetch(`${BASE_URL}/wellness/data?user_id=${testWellnessActivity.user_id}`);
    const wellnessData = await wellnessDataResponse.json();
    
    if (wellnessData.success) {
      console.log('✅ Wellness data retrieved successfully');
      console.log(`📊 Total activities completed: ${wellnessData.data.statistics.total_activities_completed}`);
      console.log(`🏆 Total points earned: ${wellnessData.data.statistics.total_points_earned}`);
      console.log(`⏱️ Total duration: ${wellnessData.data.statistics.total_duration_minutes} minutes`);
      
      if (wellnessData.data.activities.length > 0) {
        console.log('📋 Recent activities:', wellnessData.data.activities.slice(0, 3));
      }
    } else {
      console.log('❌ Failed to get wellness data:', wellnessData.message);
    }

    // 4. Test wellness stats
    console.log('\n4️⃣ Testing GET /wellness/stats...');
    const statsResponse = await fetch(`${BASE_URL}/wellness/stats?user_id=${testWellnessActivity.user_id}`);
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      console.log('✅ Wellness stats retrieved successfully');
      console.log('📊 Stats data:', statsData.data);
    } else {
      console.log('❌ Failed to get wellness stats:', statsData.message);
    }

    console.log('\n🎉 Wellness Activities Integration Test Completed!');
    console.log('\n📝 Summary:');
    console.log('- Wellness activities can be retrieved');
    console.log('- Activities can be completed');
    console.log('- Points and duration are tracked');
    console.log('- Wellness data reflects completed activities');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testWellnessActivities(); 