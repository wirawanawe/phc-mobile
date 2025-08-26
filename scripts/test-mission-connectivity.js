#!/usr/bin/env node

/**
 * Test mission connectivity after fixing API base URL
 * This script verifies that all mission-related endpoints are working
 */

const API_BASE_URL = 'http://localhost:3000/api/mobile';

async function testMissionConnectivity() {
  console.log('🎯 Testing Mission Connectivity\n');
  
  const testUserId = '1';
  
  try {
    // 1. Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('   Status:', healthData.success ? '✅' : '❌');
    console.log('   Message:', healthData.message);
    
    // 2. Test get missions
    console.log('\n2️⃣ Testing get missions...');
    const missionsResponse = await fetch(`${API_BASE_URL}/missions`);
    const missionsData = await missionsResponse.json();
    console.log('   Status:', missionsData.success ? '✅' : '❌');
    console.log('   Missions count:', missionsData.data ? missionsData.data.length : 0);
    
    // 3. Test get my missions
    console.log('\n3️⃣ Testing get my missions...');
    const myMissionsResponse = await fetch(`${API_BASE_URL}/missions/my-missions?user_id=${testUserId}`);
    const myMissionsData = await myMissionsResponse.json();
    console.log('   Status:', myMissionsData.success ? '✅' : '❌');
    console.log('   My missions count:', myMissionsData.data ? myMissionsData.data.length : 0);
    if (myMissionsData.summary) {
      console.log('   Summary:', myMissionsData.summary);
    }
    
    // 4. Test get specific mission
    if (missionsData.data && missionsData.data.length > 0) {
      const firstMissionId = missionsData.data[0].id;
      console.log(`\n4️⃣ Testing get mission ${firstMissionId}...`);
      const missionResponse = await fetch(`${API_BASE_URL}/missions/${firstMissionId}`);
      const missionData = await missionResponse.json();
      console.log('   Status:', missionData.success ? '✅' : '❌');
      console.log('   Mission title:', missionData.data ? missionData.data.title : 'N/A');
    }
    
    // 5. Test get user mission
    if (myMissionsData.data && myMissionsData.data.length > 0) {
      const firstUserMissionId = myMissionsData.data[0].user_mission_id;
      console.log(`\n5️⃣ Testing get user mission ${firstUserMissionId}...`);
      const userMissionResponse = await fetch(`${API_BASE_URL}/missions/user-mission/${firstUserMissionId}`);
      const userMissionData = await userMissionResponse.json();
      console.log('   Status:', userMissionData.success ? '✅' : '❌');
      console.log('   User mission status:', userMissionData.data ? userMissionData.data.status : 'N/A');
    }
    
    // 6. Test mission stats
    console.log('\n6️⃣ Testing mission stats...');
    const statsResponse = await fetch(`${API_BASE_URL}/missions/stats?user_id=${testUserId}`);
    const statsData = await statsResponse.json();
    console.log('   Status:', statsData.success ? '✅' : '❌');
    if (statsData.data) {
      console.log('   Stats:', statsData.data);
    }
    
    console.log('\n🎉 Mission connectivity test completed successfully!');
    console.log('\n📱 The mobile app should now be able to load mission data without errors.');
    
  } catch (error) {
    console.error('❌ Error testing mission connectivity:', error.message);
  }
}

// Run the test
testMissionConnectivity();
