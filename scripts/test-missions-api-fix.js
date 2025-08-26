const api = require('../src/services/api.js');

async function testMissionsApiFix() {
  console.log('🔍 Testing missions API fix...\n');

  try {
    // Test 1: Check if user is authenticated
    console.log('1️⃣ Testing user authentication...');
    const userId = await api.getUserId();
    console.log('   User ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return;
    }
    console.log('✅ User is authenticated');

    // Test 2: Test getMissions
    console.log('\n2️⃣ Testing getMissions...');
    try {
      const missionsResponse = await api.getMissions();
      console.log('   Success:', missionsResponse.success);
      console.log('   Data length:', missionsResponse.data?.length || 0);
      
      if (missionsResponse.data && missionsResponse.data.length > 0) {
        console.log('   Sample mission:', {
          id: missionsResponse.data[0].id,
          title: missionsResponse.data[0].title,
          category: missionsResponse.data[0].category
        });
      }
    } catch (error) {
      console.log('❌ getMissions failed:', error.message);
    }

    // Test 3: Test getMyMissions
    console.log('\n3️⃣ Testing getMyMissions...');
    try {
      const myMissionsResponse = await api.getMyMissions();
      console.log('   Success:', myMissionsResponse.success);
      console.log('   Data length:', myMissionsResponse.data?.length || 0);
      
      if (myMissionsResponse.data && myMissionsResponse.data.length > 0) {
        console.log('   Sample user mission:', {
          user_mission_id: myMissionsResponse.data[0].user_mission_id,
          mission_id: myMissionsResponse.data[0].mission_id,
          status: myMissionsResponse.data[0].status,
          title: myMissionsResponse.data[0].title
        });
      }
    } catch (error) {
      console.log('❌ getMyMissions failed:', error.message);
    }

    // Test 4: Test getMissionStats
    console.log('\n4️⃣ Testing getMissionStats...');
    try {
      const statsResponse = await api.getMissionStats({ date: '2025-01-20' });
      console.log('   Success:', statsResponse.success);
      console.log('   Stats data:', statsResponse.data);
    } catch (error) {
      console.log('❌ getMissionStats failed:', error.message);
    }

    // Test 5: Test DailyMissionScreen loadData simulation
    console.log('\n5️⃣ Testing DailyMissionScreen loadData simulation...');
    try {
      const [missionsResponse, userMissionsResponse, statsResponse] = await Promise.all([
        api.getMissions(),
        api.getMyMissions(),
        api.getMissionStats({ date: '2025-01-20' }),
      ]);

      console.log('   Missions:', missionsResponse.success ? 'SUCCESS' : 'FAILED', missionsResponse.data?.length || 0, 'missions');
      console.log('   User Missions:', userMissionsResponse.success ? 'SUCCESS' : 'FAILED', userMissionsResponse.data?.length || 0, 'user missions');
      console.log('   Stats:', statsResponse.success ? 'SUCCESS' : 'FAILED');

      if (missionsResponse.success && missionsResponse.data) {
        console.log('✅ Missions data available');
      } else {
        console.log('❌ No missions data available');
      }

      if (userMissionsResponse.success && userMissionsResponse.data) {
        console.log('✅ User missions data available');
      } else {
        console.log('❌ No user missions data available');
      }

      if (statsResponse.success && statsResponse.data) {
        console.log('✅ Stats data available');
      } else {
        console.log('❌ No stats data available');
      }

    } catch (error) {
      console.log('❌ DailyMissionScreen simulation failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMissionsApiFix();
