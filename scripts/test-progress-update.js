const fetch = require('node-fetch');

async function testProgressUpdate() {
  try {
    console.log('🧪 Testing mission progress update...');
    
    const baseURL = 'http://localhost:3000/api';
    
    // Test 1: Get user missions first
    console.log('👤 Getting user missions...');
    try {
      const myMissionsResponse = await fetch(`${baseURL}/mobile/missions/my-missions?user_id=1`);
      const myMissionsData = await myMissionsResponse.json();
      console.log('✅ My missions response status:', myMissionsResponse.status);
      
      if (myMissionsData.success && myMissionsData.data && myMissionsData.data.length > 0) {
        const userMission = myMissionsData.data[0];
        console.log('📋 Found user mission:', {
          id: userMission.id,
          mission_id: userMission.mission_id,
          status: userMission.status,
          current_value: userMission.current_value,
          progress: userMission.progress
        });
        
        // Test 2: Update progress
        console.log('📈 Testing progress update...');
        const updateData = {
          current_value: Math.min(userMission.current_value + 1, 10), // Increment by 1, max 10
          notes: "Test progress update"
        };
        
        const updateResponse = await fetch(`${baseURL}/mobile/missions/progress/${userMission.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        const updateResult = await updateResponse.json();
        console.log('✅ Progress update response status:', updateResponse.status);
        console.log('📊 Progress update result:', updateResult);
        
        // Test 3: Verify the update
        console.log('🔍 Verifying the update...');
        const verifyResponse = await fetch(`${baseURL}/mobile/missions/my-missions?user_id=1`);
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success && verifyData.data) {
          const updatedMission = verifyData.data.find(m => m.id === userMission.id);
          if (updatedMission) {
            console.log('✅ Updated mission data:', {
              id: updatedMission.id,
              current_value: updatedMission.current_value,
              progress: updatedMission.progress,
              status: updatedMission.status
            });
          }
        }
        
      } else {
        console.log('⚠️ No user missions found, cannot test progress update');
      }
      
    } catch (error) {
      console.log('❌ Error testing progress update:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error in progress update test:', error);
  }
}

// Run the test
testProgressUpdate().then(() => {
  console.log('🏁 Progress update test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Progress update test failed:', error);
  process.exit(1);
}); 