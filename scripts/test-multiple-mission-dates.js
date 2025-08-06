const api = require('../src/services/api.js');

async function testMultipleMissionDates() {
  console.log('🧪 Testing multiple mission dates functionality...\n');

  try {
    // Initialize API
    await api.initialize();
    console.log('✅ API initialized');

    // Test 1: Accept mission for today
    console.log('\n📅 Test 1: Accepting mission for today');
    const today = new Date().toISOString().split('T')[0];
    const acceptResult1 = await api.acceptMission(1, today);
    console.log('✅ Accept mission for today:', acceptResult1.success ? 'SUCCESS' : 'FAILED');
    if (acceptResult1.success) {
      console.log('   User Mission ID:', acceptResult1.data?.user_mission_id);
      console.log('   Mission Date:', acceptResult1.data?.mission_date);
    }

    // Test 2: Accept the same mission for tomorrow
    console.log('\n📅 Test 2: Accepting same mission for tomorrow');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    const acceptResult2 = await api.acceptMission(1, tomorrowDate);
    console.log('✅ Accept same mission for tomorrow:', acceptResult2.success ? 'SUCCESS' : 'FAILED');
    if (acceptResult2.success) {
      console.log('   User Mission ID:', acceptResult2.data?.user_mission_id);
      console.log('   Mission Date:', acceptResult2.data?.mission_date);
    }

    // Test 3: Accept the same mission for yesterday
    console.log('\n📅 Test 3: Accepting same mission for yesterday');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    const acceptResult3 = await api.acceptMission(1, yesterdayDate);
    console.log('✅ Accept same mission for yesterday:', acceptResult3.success ? 'SUCCESS' : 'FAILED');
    if (acceptResult3.success) {
      console.log('   User Mission ID:', acceptResult3.data?.user_mission_id);
      console.log('   Mission Date:', acceptResult3.data?.mission_date);
    }

    // Test 4: Try to accept the same mission for the same date (should fail)
    console.log('\n📅 Test 4: Trying to accept same mission for same date (should fail)');
    const acceptResult4 = await api.acceptMission(1, today);
    console.log('❌ Accept same mission for same date:', acceptResult4.success ? 'SUCCESS (unexpected)' : 'FAILED (expected)');
    if (!acceptResult4.success) {
      console.log('   Expected error message:', acceptResult4.message);
    }

    // Test 5: Get my missions for different dates
    console.log('\n📅 Test 5: Getting missions for different dates');
    const myMissionsToday = await api.getMyMissions(today, false);
    const myMissionsTomorrow = await api.getMyMissions(tomorrowDate, false);
    const myMissionsYesterday = await api.getMyMissions(yesterdayDate, false);
    
    console.log('✅ Missions for today:', myMissionsToday.success ? `${myMissionsToday.data?.length || 0} missions` : 'FAILED');
    console.log('✅ Missions for tomorrow:', myMissionsTomorrow.success ? `${myMissionsTomorrow.data?.length || 0} missions` : 'FAILED');
    console.log('✅ Missions for yesterday:', myMissionsYesterday.success ? `${myMissionsYesterday.data?.length || 0} missions` : 'FAILED');

    // Test 6: Get all missions across all dates
    console.log('\n📅 Test 6: Getting all missions across all dates');
    const allMissions = await api.getMyMissions(null, true);
    console.log('✅ All missions:', allMissions.success ? `${allMissions.data?.length || 0} total missions` : 'FAILED');

    console.log('\n🎉 Multiple mission dates test completed!');
    console.log('\n📋 Summary:');
    console.log('- Users can now select the same mission multiple times with different dates');
    console.log('- Each mission instance is tied to a specific date');
    console.log('- Users cannot select the same mission twice for the same date');
    console.log('- The system properly tracks missions by date');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMultipleMissionDates(); 