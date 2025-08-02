const fetch = require('node-fetch');

async function testMissionProgressDisplay() {
  try {
    console.log('🧪 Testing mission progress display...');
    
    const baseURL = 'http://localhost:3000/api';
    
    // Test 1: Get user missions
    console.log('👤 Getting user missions...');
    try {
      const myMissionsResponse = await fetch(`${baseURL}/mobile/missions/my-missions?user_id=5`);
      const myMissionsData = await myMissionsResponse.json();
      console.log('✅ My missions response status:', myMissionsResponse.status);
      
      if (myMissionsData.success && myMissionsData.data && myMissionsData.data.length > 0) {
        console.log('📋 User missions found:', myMissionsData.data.length);
        
        myMissionsData.data.forEach((mission, index) => {
          console.log(`\n📊 Mission ${index + 1}:`);
          console.log(`  ID: ${mission.user_mission_id}`);
          console.log(`  Title: ${mission.title}`);
          console.log(`  Status: ${mission.status}`);
          console.log(`  Current Value: ${mission.current_value}`);
          console.log(`  Target Value: ${mission.target_value}`);
          console.log(`  Progress: ${mission.progress}%`);
          console.log(`  Points: ${mission.points}`);
          
          // Check if progress calculation is correct
          if (mission.current_value !== null && mission.target_value) {
            const calculatedProgress = Math.min(Math.round((mission.current_value / mission.target_value) * 100), 100);
            console.log(`  Calculated Progress: ${calculatedProgress}%`);
            
            if (calculatedProgress !== mission.progress) {
              console.log(`  ⚠️ Progress mismatch! Expected: ${calculatedProgress}%, Got: ${mission.progress}%`);
            } else {
              console.log(`  ✅ Progress calculation correct`);
            }
          }
        });
        
        // Test 2: Update progress for first mission
        if (myMissionsData.data.length > 0) {
          const firstMission = myMissionsData.data[0];
          console.log(`\n📈 Testing progress update for mission: ${firstMission.title}`);
          
          const newCurrentValue = Math.min((firstMission.current_value || 0) + 1, firstMission.target_value);
          const updateData = {
            current_value: newCurrentValue,
            notes: "Test progress update"
          };
          
          const updateResponse = await fetch(`${baseURL}/mobile/missions/progress/${firstMission.user_mission_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          });
          
          const updateResult = await updateResponse.json();
          console.log('✅ Progress update response:', updateResult);
          
          // Test 3: Verify the update
          console.log('\n🔍 Verifying the update...');
          const verifyResponse = await fetch(`${baseURL}/mobile/missions/my-missions?user_id=5`);
          const verifyData = await verifyResponse.json();
          
          if (verifyData.success && verifyData.data) {
            const updatedMission = verifyData.data.find(m => m.user_mission_id === firstMission.user_mission_id);
            if (updatedMission) {
              console.log('✅ Updated mission data:', {
                id: updatedMission.user_mission_id,
                title: updatedMission.title,
                current_value: updatedMission.current_value,
                target_value: updatedMission.target_value,
                progress: updatedMission.progress,
                status: updatedMission.status
              });
              
              // Check if progress is correctly calculated
              const expectedProgress = Math.min(Math.round((updatedMission.current_value / updatedMission.target_value) * 100), 100);
              if (expectedProgress === updatedMission.progress) {
                console.log('✅ Progress calculation is working correctly!');
              } else {
                console.log(`❌ Progress calculation error! Expected: ${expectedProgress}%, Got: ${updatedMission.progress}%`);
              }
            }
          }
        }
        
      } else {
        console.log('⚠️ No user missions found');
      }
      
    } catch (error) {
      console.log('❌ Error testing mission progress display:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error in mission progress display test:', error);
  }
}

// Run the test
testMissionProgressDisplay().then(() => {
  console.log('🏁 Mission progress display test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Mission progress display test failed:', error);
  process.exit(1);
}); 