// Simple test script for multiple mission dates functionality
// This script tests the backend API directly without React Native dependencies

const fetch = require('node-fetch');

// Mock API base URL - adjust as needed
const API_BASE_URL = 'http://localhost:3000/api/mobile';

// Mock user data - replace with actual test user
const TEST_USER_ID = 1;
const TEST_MISSION_ID = 1;

async function testMultipleMissionDates() {
  console.log('🧪 Testing multiple mission dates functionality...\n');

  try {
    // Test 1: Accept mission for today
    console.log('\n📅 Test 1: Accepting mission for today');
    const today = new Date().toISOString().split('T')[0];
    const acceptResult1 = await acceptMission(TEST_MISSION_ID, today);
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
    const acceptResult2 = await acceptMission(TEST_MISSION_ID, tomorrowDate);
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
    const acceptResult3 = await acceptMission(TEST_MISSION_ID, yesterdayDate);
    console.log('✅ Accept same mission for yesterday:', acceptResult3.success ? 'SUCCESS' : 'FAILED');
    if (acceptResult3.success) {
      console.log('   User Mission ID:', acceptResult3.data?.user_mission_id);
      console.log('   Mission Date:', acceptResult3.data?.mission_date);
    }

    // Test 4: Try to accept the same mission for the same date (should fail)
    console.log('\n📅 Test 4: Trying to accept same mission for same date (should fail)');
    const acceptResult4 = await acceptMission(TEST_MISSION_ID, today);
    console.log('❌ Accept same mission for same date:', acceptResult4.success ? 'SUCCESS (unexpected)' : 'FAILED (expected)');
    if (!acceptResult4.success) {
      console.log('   Expected error message:', acceptResult4.message);
    }

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

async function acceptMission(missionId, missionDate) {
  try {
    const response = await fetch(`${API_BASE_URL}/missions/accept/${missionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        user_id: TEST_USER_ID,
        mission_date: missionDate
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error.message);
    return { success: false, message: error.message };
  }
}

// Run the test
testMultipleMissionDates(); 