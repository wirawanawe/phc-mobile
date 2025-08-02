#!/usr/bin/env node

/**
 * Test script to check the mission acceptance endpoint
 * This will help identify if the 500 error is due to backend issues
 */

const testMissionEndpoint = async () => {
  console.log('🧪 Testing Mission Acceptance Endpoint...\n');

  const baseURL = 'http://localhost:3000';
  const missionId = 1;
  const userId = 5;

  console.log(`📋 Test Parameters:`);
  console.log(`   - Base URL: ${baseURL}`);
  console.log(`   - Mission ID: ${missionId}`);
  console.log(`   - User ID: ${userId}`);

  try {
    console.log('\n🌐 Making request to mission acceptance endpoint...');
    
    const response = await fetch(`${baseURL}/api/mobile/missions/accept/${missionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`📊 Response Body:`, responseText);

    if (response.ok) {
      console.log('✅ Success: Mission acceptance endpoint is working');
      try {
        const data = JSON.parse(responseText);
        console.log('📋 Response Data:', data);
      } catch (e) {
        console.log('⚠️ Response is not valid JSON');
      }
    } else {
      console.log(`❌ Error: HTTP ${response.status}`);
      
      if (response.status === 409) {
        console.log('✅ Expected: 409 Conflict - Mission already completed/accepted');
      } else if (response.status === 500) {
        console.log('❌ Server Error: Backend is having issues');
      } else if (response.status === 404) {
        console.log('❌ Not Found: Endpoint might not exist');
      }
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server is not running. Start it with: cd dash-app && npm run dev');
    } else if (error.message.includes('fetch')) {
      console.log('💡 Network connectivity issue');
    }
  }

  // Test the missions list endpoint as well
  console.log('\n🧪 Testing Missions List Endpoint...');
  
  try {
    const missionsResponse = await fetch(`${baseURL}/api/mobile/missions`);
    console.log(`📊 Missions Response Status: ${missionsResponse.status}`);
    
    if (missionsResponse.ok) {
      const missionsData = await missionsResponse.json();
      console.log(`✅ Missions endpoint working. Found ${missionsData.data?.length || 0} missions`);
    } else {
      console.log(`❌ Missions endpoint error: ${missionsResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Missions endpoint error:', error.message);
  }

  console.log('\n✅ Mission endpoint test completed!');
};

// Run the test
testMissionEndpoint().catch(console.error); 