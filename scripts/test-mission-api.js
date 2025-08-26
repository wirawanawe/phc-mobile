#!/usr/bin/env node

/**
 * Test Mission API Endpoints
 * 
 * This script directly tests the mission API endpoints to verify they're working correctly.
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000/api/mobile';
const TEST_USER_ID = 1; // Super Admin user ID

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function testMissionAPI() {
  console.log('🧪 Testing Mission API Endpoints...\n');

  try {
    // Test 1: Get available missions
    console.log('📋 Test 1: Getting available missions...');
    const missionsResponse = await makeRequest('/missions');
    
    if (missionsResponse.success) {
      console.log(`✅ Found ${missionsResponse.data.data?.length || 0} available missions`);
    } else {
      console.error('❌ Failed to get missions:', missionsResponse.data?.message || missionsResponse.error);
    }

    // Test 2: Get user missions
    console.log('\n👤 Test 2: Getting user missions...');
    const userMissionsResponse = await makeRequest('/missions/my-missions');
    
    if (userMissionsResponse.success) {
      const userMissions = userMissionsResponse.data.data || [];
      console.log(`✅ Found ${userMissions.length} user missions`);
      
      // Find an active mission
      const activeMission = userMissions.find(um => um.status === 'active');
      
      if (activeMission) {
        console.log(`🎯 Found active mission: ${activeMission.mission?.title} (ID: ${activeMission.id})`);
        
        // Test 3: Get specific user mission
        console.log('\n🔍 Test 3: Getting specific user mission...');
        const userMissionResponse = await makeRequest(`/missions/user-mission/${activeMission.id}`);
        
        if (userMissionResponse.success) {
          console.log('✅ User mission retrieved successfully');
          const userMission = userMissionResponse.data.data;
          console.log(`📊 Current progress: ${userMission.current_value}/${userMission.target_value} (${userMission.progress}%)`);
          
          // Test 4: Update mission progress
          console.log('\n🔄 Test 4: Updating mission progress...');
          const newValue = Math.min(userMission.current_value + 10, userMission.target_value);
          console.log(`📈 Updating to: ${newValue}/${userMission.target_value}`);
          
          const updateResponse = await makeRequest(`/missions/progress/${activeMission.id}`, {
            method: 'PUT',
            body: {
              current_value: newValue,
              notes: 'Test progress update'
            }
          });
          
          if (updateResponse.success) {
            console.log('✅ Progress update successful!');
            console.log('📤 Response:', updateResponse.data);
            
            // Test 5: Verify the update
            console.log('\n🔍 Test 5: Verifying update...');
            const verifyResponse = await makeRequest(`/missions/user-mission/${activeMission.id}`);
            
            if (verifyResponse.success) {
              const updatedMission = verifyResponse.data.data;
              console.log(`📊 Updated progress: ${updatedMission.current_value}/${updatedMission.target_value} (${updatedMission.progress}%)`);
              
              if (updatedMission.current_value === newValue) {
                console.log('✅ Verification successful - progress was updated correctly!');
              } else {
                console.error('❌ Verification failed - progress was not updated correctly');
              }
            } else {
              console.error('❌ Failed to verify update:', verifyResponse.data?.message || verifyResponse.error);
            }
          } else {
            console.error('❌ Progress update failed:', updateResponse.data?.message || updateResponse.error);
          }
        } else {
          console.error('❌ Failed to get user mission:', userMissionResponse.data?.message || userMissionResponse.error);
        }
      } else {
        console.log('⚠️ No active missions found');
        
        // Test accepting a mission
        if (missionsResponse.success && missionsResponse.data.data?.length > 0) {
          const missionToAccept = missionsResponse.data.data[0];
          console.log(`\n📝 Test: Accepting mission ${missionToAccept.title}...`);
          
          const acceptResponse = await makeRequest('/missions/accept', {
            method: 'POST',
            body: {
              mission_id: missionToAccept.id
            }
          });
          
          if (acceptResponse.success) {
            console.log('✅ Mission accepted successfully');
          } else {
            console.error('❌ Failed to accept mission:', acceptResponse.data?.message || acceptResponse.error);
          }
        }
      }
    } else {
      console.error('❌ Failed to get user missions:', userMissionsResponse.data?.message || userMissionsResponse.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMissionAPI()
  .then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }); 