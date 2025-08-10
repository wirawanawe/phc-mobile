const fetch = require('node-fetch');

async function testMissionsAPI() {
  try {
    console.log('🧪 Testing missions API endpoints...');
    
    const baseURL = 'http://localhost:3000/api';
    
    // Test 1: Health check
    console.log('🏥 Testing health check...');
    try {
      const healthResponse = await fetch(`${baseURL.replace('/api', '')}/health`);
      console.log('✅ Health check status:', healthResponse.status);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }
    
    // Test 2: Get missions
    console.log('📋 Testing get missions endpoint...');
    try {
      const missionsResponse = await fetch(`${baseURL}/mobile/missions`);
      const missionsData = await missionsResponse.json();
      console.log('✅ Missions response status:', missionsResponse.status);
      console.log('📊 Missions response:', {
        success: missionsData.success,
        hasData: !!missionsData.data,
        dataLength: missionsData.data?.length,
        message: missionsData.message
      });
      
      if (missionsData.data && missionsData.data.length > 0) {
        console.log('📋 Mission titles:', missionsData.data.map(m => m.title));
      } else {
        console.log('⚠️ No missions found in response');
      }
    } catch (error) {
      console.log('❌ Get missions failed:', error.message);
    }
    
    // Test 3: Get mission stats
    console.log('📈 Testing mission stats endpoint...');
    try {
      const statsResponse = await fetch(`${baseURL}/mobile/missions/stats?user_id=1`);
      const statsData = await statsResponse.json();
      console.log('✅ Stats response status:', statsResponse.status);
      console.log('📊 Stats response:', {
        success: statsData.success,
        hasData: !!statsData.data,
        message: statsData.message
      });
    } catch (error) {
      console.log('❌ Get stats failed:', error.message);
    }
    
    // Test 4: Get my missions
    console.log('👤 Testing my missions endpoint...');
    try {
      const myMissionsResponse = await fetch(`${baseURL}/mobile/missions/my-missions?user_id=1`);
      const myMissionsData = await myMissionsResponse.json();
      console.log('✅ My missions response status:', myMissionsResponse.status);
      console.log('📊 My missions response:', {
        success: myMissionsData.success,
        hasData: !!myMissionsData.data,
        dataLength: myMissionsData.data?.length,
        message: myMissionsData.message
      });
    } catch (error) {
      console.log('❌ Get my missions failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing missions API:', error);
  }
}

// Run the test
testMissionsAPI().then(() => {
  console.log('🏁 API test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 API test failed:', error);
  process.exit(1);
}); 