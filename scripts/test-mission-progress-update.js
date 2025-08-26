#!/usr/bin/env node

/**
 * Test Mission Progress Update
 * 
 * This script tests the mission progress update functionality to ensure it's working correctly.
 * It will:
 * 1. Get available missions
 * 2. Get user missions
 * 3. Try to update progress for an active mission
 * 4. Verify the update was successful
 */

const api = require('../src/services/api.js');

async function testMissionProgressUpdate() {
  console.log('🧪 Testing Mission Progress Update...\n');

  try {
    // Initialize API service
    await api.initialize();
    console.log('✅ API service initialized');

    // Get available missions
    console.log('\n📋 Getting available missions...');
    const missionsResponse = await api.getMissions();
    
    if (!missionsResponse.success) {
      console.error('❌ Failed to get missions:', missionsResponse.message);
      return;
    }

    const missions = missionsResponse.data;
    console.log(`✅ Found ${missions.length} available missions`);

    // Get user missions
    console.log('\n👤 Getting user missions...');
    const userMissionsResponse = await api.getMyMissions();
    
    if (!userMissionsResponse.success) {
      console.error('❌ Failed to get user missions:', userMissionsResponse.message);
      return;
    }

    const userMissions = userMissionsResponse.data;
    console.log(`✅ Found ${userMissions.length} user missions`);

    // Find an active mission to test with
    const activeMission = userMissions.find(um => um.status === 'active');
    
    if (!activeMission) {
      console.log('⚠️ No active missions found, creating a test mission...');
      
      // Try to accept a mission
      if (missions.length > 0) {
        const missionToAccept = missions[0];
        console.log(`📝 Accepting mission: ${missionToAccept.title}`);
        
        const acceptResponse = await api.acceptMission(missionToAccept.id);
        if (acceptResponse.success) {
          console.log('✅ Mission accepted successfully');
          
          // Get updated user missions
          const updatedUserMissionsResponse = await api.getMyMissions();
          if (updatedUserMissionsResponse.success) {
            const updatedUserMissions = updatedUserMissionsResponse.data;
            const newActiveMission = updatedUserMissions.find(um => um.status === 'active');
            
            if (newActiveMission) {
              console.log(`✅ Found new active mission: ${newActiveMission.mission?.title}`);
              await testProgressUpdate(newActiveMission);
            } else {
              console.error('❌ No active mission found after accepting');
            }
          }
        } else {
          console.error('❌ Failed to accept mission:', acceptResponse.message);
        }
      } else {
        console.error('❌ No missions available to accept');
      }
    } else {
      console.log(`🎯 Found active mission: ${activeMission.mission?.title}`);
      await testProgressUpdate(activeMission);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testProgressUpdate(userMission) {
  console.log('\n🔄 Testing Progress Update...');
  console.log(`📊 Current progress: ${userMission.current_value}/${userMission.target_value} (${userMission.progress}%)`);
  
  // Calculate new progress value (add 10% of target)
  const increment = Math.max(1, Math.floor(userMission.target_value * 0.1));
  const newValue = Math.min(userMission.current_value + increment, userMission.target_value);
  
  console.log(`📈 Updating to: ${newValue}/${userMission.target_value}`);
  
  try {
    const updateResponse = await api.updateMissionProgress(userMission.id, {
      current_value: newValue,
      notes: 'Test progress update'
    });
    
    if (updateResponse.success) {
      console.log('✅ Progress update successful!');
      console.log(`📤 Response:`, updateResponse);
      
      // Verify the update by getting the user mission again
      console.log('\n🔍 Verifying update...');
      const verifyResponse = await api.getUserMission(userMission.id);
      
      if (verifyResponse.success) {
        const updatedMission = verifyResponse.data;
        console.log(`📊 Updated progress: ${updatedMission.current_value}/${updatedMission.target_value} (${updatedMission.progress}%)`);
        
        if (updatedMission.current_value === newValue) {
          console.log('✅ Verification successful - progress was updated correctly!');
        } else {
          console.error('❌ Verification failed - progress was not updated correctly');
        }
      } else {
        console.error('❌ Failed to verify update:', verifyResponse.message);
      }
    } else {
      console.error('❌ Progress update failed:', updateResponse.message);
    }
  } catch (error) {
    console.error('❌ Error during progress update:', error);
  }
}

// Run the test
testMissionProgressUpdate()
  .then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
