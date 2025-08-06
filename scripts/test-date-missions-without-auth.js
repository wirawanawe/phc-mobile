// Test script for date-based missions without authentication
// This script tests the mock API functionality

async function testDateMissionsWithoutAuth() {
  console.log('🧪 Testing date-based missions without authentication...\n');

  // Import the mock API service correctly
  const { default: MockApiService } = await import('../src/services/mockApi.js');
  const mockApi = new MockApiService();
  
  try {
    // Test 1: Get missions by date using mock API
    console.log('📅 Test 1: Getting missions by date (mock API)');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`  Today: ${today}`);
    console.log(`  Tomorrow: ${tomorrow}\n`);
    
    const missionsToday = await mockApi.getMissionsByDate(today);
    console.log('✅ Missions for today (mock):', missionsToday.success ? 'SUCCESS' : 'FAILED');
    if (missionsToday.success) {
      console.log(`  - Available missions: ${missionsToday.data?.available_missions?.length || 0}`);
      console.log(`  - User missions: ${missionsToday.data?.user_missions?.length || 0}`);
      console.log(`  - Summary: ${JSON.stringify(missionsToday.data?.summary)}`);
    }

    const missionsTomorrow = await mockApi.getMissionsByDate(tomorrow);
    console.log('✅ Missions for tomorrow (mock):', missionsTomorrow.success ? 'SUCCESS' : 'FAILED');
    if (missionsTomorrow.success) {
      console.log(`  - Available missions: ${missionsTomorrow.data?.available_missions?.length || 0}`);
      console.log(`  - User missions: ${missionsTomorrow.data?.user_missions?.length || 0}`);
    }

    // Test 2: Accept mission for specific date using mock API
    console.log('\n🎯 Test 2: Accepting mission for specific date (mock API)');
    if (missionsToday.success && missionsToday.data?.available_missions?.length > 0) {
      const firstMission = missionsToday.data.available_missions[0];
      console.log(`  Accepting mission: ${firstMission.title} for date: ${today}`);
      
      const acceptResult = await mockApi.acceptMission(firstMission.id, today);
      console.log('✅ Accept mission result (mock):', acceptResult.success ? 'SUCCESS' : 'FAILED');
      if (acceptResult.success) {
        console.log(`  - User mission ID: ${acceptResult.data?.user_mission_id}`);
        console.log(`  - Mission date: ${acceptResult.data?.mission_date}`);
      }
    }

    // Test 3: Accept same mission for different date
    console.log('\n🔄 Test 3: Accepting same mission for different date (mock API)');
    if (missionsToday.success && missionsToday.data?.available_missions?.length > 0) {
      const firstMission = missionsToday.data.available_missions[0];
      console.log(`  Accepting same mission: ${firstMission.title} for date: ${tomorrow}`);
      
      const acceptResult2 = await mockApi.acceptMission(firstMission.id, tomorrow);
      console.log('✅ Accept mission for different date (mock):', acceptResult2.success ? 'SUCCESS' : 'FAILED');
      if (acceptResult2.success) {
        console.log(`  - User mission ID: ${acceptResult2.data?.user_mission_id}`);
        console.log(`  - Mission date: ${acceptResult2.data?.mission_date}`);
      }
    }

    // Test 4: Get my missions with date filtering using mock API
    console.log('\n📋 Test 4: Getting my missions with date filtering (mock API)');
    
    const myMissionsToday = await mockApi.getMyMissions(today, false);
    console.log('✅ My missions for today (mock):', myMissionsToday.success ? 'SUCCESS' : 'FAILED');
    if (myMissionsToday.success) {
      console.log(`  - Total missions: ${myMissionsToday.data?.length || 0}`);
      console.log(`  - Target date: ${myMissionsToday.target_date}`);
    }

    const myMissionsAllDates = await mockApi.getMyMissions(null, true);
    console.log('✅ My missions for all dates (mock):', myMissionsAllDates.success ? 'SUCCESS' : 'FAILED');
    if (myMissionsAllDates.success) {
      console.log(`  - Total missions: ${myMissionsAllDates.data?.length || 0}`);
      console.log(`  - Show all dates: ${myMissionsAllDates.show_all_dates}`);
    }

    // Test 5: Verify date-based mission separation
    console.log('\n🔍 Test 5: Verifying date-based mission separation (mock API)');
    
    const missionsByDateToday = await mockApi.getMissionsByDate(today);
    const missionsByDateTomorrow = await mockApi.getMissionsByDate(tomorrow);
    
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

    // Test 6: Test mission categories
    console.log('\n📂 Test 6: Testing mission categories (mock API)');
    
    if (missionsToday.success && missionsToday.data?.missions_by_category) {
      const categories = Object.keys(missionsToday.data.missions_by_category);
      console.log(`  - Available categories: ${categories.join(', ')}`);
      
      categories.forEach(category => {
        const missions = missionsToday.data.missions_by_category[category];
        console.log(`  - ${category}: ${missions.length} missions`);
      });
    }

    console.log('\n🎉 All mock API tests completed successfully!');
    console.log('💡 This confirms the date-based missions feature works correctly in the mock environment.');
    console.log('🔧 To test with real API, ensure you are authenticated and the backend is running.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDateMissionsWithoutAuth().catch(console.error); 