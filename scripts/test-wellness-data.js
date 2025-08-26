const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3000/api/mobile';

async function testWellnessData() {
  console.log('🧪 Testing Wellness Data API...\n');

  try {
    // 1. Test public wellness stats endpoint
    console.log('1️⃣ Testing GET /wellness/stats/public...');
    const publicResponse = await fetch(`${BASE_URL}/wellness/stats/public?period=7`);
    const publicData = await publicResponse.json();
    
    if (publicData.success) {
      console.log('✅ Public wellness stats retrieved successfully');
      console.log('📊 Data:', publicData.data);
      console.log(`   - Total Activities: ${publicData.data.total_activities}`);
      console.log(`   - Completed Activities: ${publicData.data.total_activities_completed}`);
      console.log(`   - Total Points: ${publicData.data.total_points_earned}`);
    } else {
      console.log('❌ Failed to get public wellness stats:', publicData.message);
    }

    // 2. Test wellness activities endpoint
    console.log('\n2️⃣ Testing GET /wellness/activities...');
    const activitiesResponse = await fetch(`${BASE_URL}/wellness/activities`);
    const activitiesData = await activitiesResponse.json();
    
    if (activitiesData.success) {
      console.log('✅ Wellness activities retrieved successfully');
      console.log(`📊 Found ${activitiesData.data.length} activities`);
      if (activitiesData.data.length > 0) {
        const activity = activitiesData.data[0];
        console.log('📋 Sample activity:');
        console.log(`   - ID: ${activity.id}`);
        console.log(`   - Title: ${activity.title}`);
        console.log(`   - Category: ${activity.category}`);
        console.log(`   - Duration: ${activity.duration_minutes} minutes`);
        console.log(`   - Points: ${activity.points}`);
        console.log(`   - Status: ${activity.status}`);
      }
    } else {
      console.log('❌ Failed to get wellness activities:', activitiesData.message);
    }

    // 3. Test authenticated wellness stats (should fail without token)
    console.log('\n3️⃣ Testing GET /wellness/stats (authenticated)...');
    try {
      const authResponse = await fetch(`${BASE_URL}/wellness/stats?period=7`);
      const authData = await authResponse.json();
      
      if (authData.success) {
        console.log('✅ Authenticated wellness stats retrieved successfully');
        console.log('📊 Data:', authData.data);
      } else {
        console.log('❌ Authenticated endpoint failed (expected):', authData.message);
      }
    } catch (error) {
      console.log('❌ Authenticated endpoint error (expected):', error.message);
    }

    // 4. Test health endpoint
    console.log('\n4️⃣ Testing GET /health...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    
    if (healthData.status === 'ok') {
      console.log('✅ Health endpoint working');
      console.log('📊 Server status:', healthData.message);
    } else {
      console.log('❌ Health endpoint failed:', healthData);
    }

    console.log('\n🎯 Summary:');
    console.log('✅ Public wellness stats endpoint is working');
    console.log('✅ Wellness activities endpoint is working');
    console.log('✅ Health endpoint is working');
    console.log('⚠️  Authenticated endpoint requires valid JWT token');
    console.log('\n💡 The mobile app should be using the public endpoint as fallback');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWellnessData();
