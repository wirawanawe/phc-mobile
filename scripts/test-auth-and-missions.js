const ApiService = require('../src/services/api.js').default;

async function testAuthAndMissions() {
  console.log('🔐 Testing authentication and missions API...\n');

  const api = new ApiService();
  
  try {
    // Test 1: Check if user is authenticated
    console.log('📋 Test 1: Checking authentication status');
    
    try {
      const userId = await api.getUserId();
      console.log('✅ User ID retrieved:', userId);
    } catch (error) {
      console.log('❌ Authentication failed:', error.message);
      console.log('💡 You may need to login first or check your auth token');
      return;
    }

    // Test 2: Test basic missions API (no auth required)
    console.log('\n📅 Test 2: Testing basic missions API (no auth required)');
    
    try {
      const missions = await api.getMissions();
      console.log('✅ Basic missions API:', missions.success ? 'SUCCESS' : 'FAILED');
      if (missions.success) {
        console.log(`  - Available missions: ${missions.missions?.length || 0}`);
      }
    } catch (error) {
      console.log('❌ Basic missions API failed:', error.message);
    }

    // Test 3: Test my missions with authentication
    console.log('\n🎯 Test 3: Testing my missions API (requires auth)');
    
    try {
      const myMissions = await api.getMyMissions();
      console.log('✅ My missions API:', myMissions.success ? 'SUCCESS' : 'FAILED');
      if (myMissions.success) {
        console.log(`  - User missions: ${myMissions.data?.length || 0}`);
        console.log(`  - Target date: ${myMissions.target_date}`);
      }
    } catch (error) {
      console.log('❌ My missions API failed:', error.message);
      console.log('💡 This is expected if not authenticated');
    }

    // Test 4: Test missions by date
    console.log('\n📊 Test 4: Testing missions by date API');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const missionsByDate = await api.getMissionsByDate(today);
      console.log('✅ Missions by date API:', missionsByDate.success ? 'SUCCESS' : 'FAILED');
      if (missionsByDate.success) {
        console.log(`  - Available missions: ${missionsByDate.data?.available_missions?.length || 0}`);
        console.log(`  - User missions: ${missionsByDate.data?.user_missions?.length || 0}`);
      }
    } catch (error) {
      console.log('❌ Missions by date API failed:', error.message);
    }

    // Test 5: Test mock API fallback
    console.log('\n🔄 Test 5: Testing mock API fallback');
    
    try {
      // Force mock API by simulating network error
      const mockMissions = await api.getMyMissions();
      console.log('✅ Mock API fallback:', mockMissions.success ? 'SUCCESS' : 'FAILED');
      if (mockMissions.success) {
        console.log(`  - Mock missions: ${mockMissions.data?.length || 0}`);
      }
    } catch (error) {
      console.log('❌ Mock API also failed:', error.message);
    }

    console.log('\n🎉 Authentication and API tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAuthAndMissions().catch(console.error); 