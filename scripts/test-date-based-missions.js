const ApiService = require('../src/services/api.js').default;

async function testDateBasedMissions() {
  console.log('🧪 Testing date-based mission functionality...\n');

  const api = new ApiService();
  
  try {
    // Test 1: Get missions by date
    console.log('📅 Test 1: Getting missions by date');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`  Today: ${today}`);
    console.log(`  Tomorrow: ${tomorrow}\n`);
    
    const missionsToday = await api.getMissionsByDate(today);
    console.log('✅ Missions for today:', missionsToday.success ? 'SUCCESS' : 'FAILED');
    if (missionsToday.success) {
      console.log(`  - Available missions: ${missionsToday.data?.available_missions?.length || 0}`);
      console.log(`  - User missions: ${missionsToday.data?.user_missions?.length || 0}`);
      console.log(`  - Summary: ${JSON.stringify(missionsToday.data?.summary)}`);
    }

    const missionsTomorrow = await api.getMissionsByDate(tomorrow);
    console.log('✅ Missions for tomorrow:', missionsTomorrow.success ? 'SUCCESS' : 'FAILED');
    if (missionsTomorrow.success) {
      console.log(`  - Available missions: ${missionsTomorrow.data?.available_missions?.length || 0}`);
      console.log(`  - User missions: ${missionsTomorrow.data?.user_missions?.length || 0}`);
    }

    // Test 2: Accept mission for specific date
    console.log('\n🎯 Test 2: Accepting mission for specific date');
    if (missionsToday.success && missionsToday.data?.available_missions?.length > 0) {
      const firstMission = missionsToday.data.available_missions[0];
      console.log(`  Accepting mission: ${firstMission.title} for date: ${today}`);
      
      const acceptResult = await api.acceptMission(firstMission.id, today);
      console.log('✅ Accept mission result:', acceptResult.success ? 'SUCCESS' : 'FAILED');
      if (acceptResult.success) {
        console.log(`  - User mission ID: ${acceptResult.data?.user_mission_id}`);
        console.log(`  - Mission date: ${acceptResult.data?.mission_date}`);
      }
    }

    // Test 3: Accept same mission for different date
    console.log('\n🔄 Test 3: Accepting same mission for different date');
    if (missionsToday.success && missionsToday.data?.available_missions?.length > 0) {
      const firstMission = missionsToday.data.available_missions[0];
      console.log(`  Accepting same mission: ${firstMission.title} for date: ${tomorrow}`);
      
      const acceptResult2 = await api.acceptMission(firstMission.id, tomorrow);
      console.log('✅ Accept mission for different date:', acceptResult2.success ? 'SUCCESS' : 'FAILED');
      if (acceptResult2.success) {
        console.log(`  - User mission ID: ${acceptResult2.data?.user_mission_id}`);
        console.log(`  - Mission date: ${acceptResult2.data?.mission_date}`);
      }
    }

    // Test 4: Get my missions with date filtering
    console.log('\n📋 Test 4: Getting my missions with date filtering');
    
    const myMissionsToday = await api.getMyMissions(today, false);
    console.log('✅ My missions for today:', myMissionsToday.success ? 'SUCCESS' : 'FAILED');
    if (myMissionsToday.success) {
      console.log(`  - Total missions: ${myMissionsToday.data?.length || 0}`);
      console.log(`  - Target date: ${myMissionsToday.target_date}`);
    }

    const myMissionsAllDates = await api.getMyMissions(null, true);
    console.log('✅ My missions for all dates:', myMissionsAllDates.success ? 'SUCCESS' : 'FAILED');
    if (myMissionsAllDates.success) {
      console.log(`  - Total missions: ${myMissionsAllDates.data?.length || 0}`);
      console.log(`  - Show all dates: ${myMissionsAllDates.show_all_dates}`);
    }

    // Test 5: Verify date-based mission separation
    console.log('\n🔍 Test 5: Verifying date-based mission separation');
    
    const missionsByDateToday = await api.getMissionsByDate(today);
    const missionsByDateTomorrow = await api.getMissionsByDate(tomorrow);
    
    if (missionsByDateToday.success && missionsByDateTomorrow.success) {
      const todayUserMissions = missionsByDateToday.data?.user_missions || [];
      const tomorrowUserMissions = missionsByDateTomorrow.data?.user_missions || [];
      
      console.log(`  - User missions for today: ${todayUserMissions.length}`);
      console.log(`  - User missions for tomorrow: ${tomorrowUserMissions.length}`);
      
      // Check if same mission exists for both dates
      const todayMissionIds = todayUserMissions.map(m => m.mission_id);
      const tomorrowMissionIds = tomorrowUserMissions.map(m => m.mission_id);
      const commonMissions = todayMissionIds.filter(id => tomorrowMissionIds.includes(id));
      
      console.log(`  - Common missions across dates: ${commonMissions.length}`);
      
      if (commonMissions.length > 0) {
        console.log('✅ Date-based mission separation working correctly');
      } else {
        console.log('⚠️  No common missions found (this might be normal)');
      }
    }

    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDateBasedMissions().catch(console.error); 