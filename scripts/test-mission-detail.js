const fetch = require('node-fetch');

async function testMissionDetail() {
  try {
    console.log('🧪 Testing Mission Detail functionality...');
    
    const baseURL = 'http://localhost:3000/api';
    
    // Test 1: Check if user is authenticated
    console.log('\n👤 Checking authentication status...');
    try {
      const authResponse = await fetch(`${baseURL}/mobile/auth/me`);
      const authData = await authResponse.json();
      console.log('✅ Auth response status:', authResponse.status);
      
      if (authData.success && authData.data) {
        console.log('✅ User is authenticated:', authData.data.name);
        console.log('👤 User ID:', authData.data.id);
      } else {
        console.log('❌ User is not authenticated');
        console.log('💡 You need to login first to access mission screens');
        return;
      }
    } catch (error) {
      console.log('❌ Error checking authentication:', error.message);
      return;
    }
    
    // Test 2: Get available missions
    console.log('\n📋 Getting available missions...');
    try {
      const missionsResponse = await fetch(`${baseURL}/mobile/missions`);
      const missionsData = await missionsResponse.json();
      console.log('✅ Missions response status:', missionsResponse.status);
      
      if (missionsData.success && missionsData.data && missionsData.data.length > 0) {
        console.log('📋 Available missions:', missionsData.data.length);
        const firstMission = missionsData.data[0];
        console.log('🎯 First mission:', {
          id: firstMission.id,
          title: firstMission.title,
          points: firstMission.points
        });
        
        // Test 3: Get user missions
        console.log('\n🎯 Getting user missions...');
        const userMissionsResponse = await fetch(`${baseURL}/mobile/missions/my-missions`);
        const userMissionsData = await userMissionsResponse.json();
        console.log('✅ User missions response status:', userMissionsResponse.status);
        
        if (userMissionsData.success && userMissionsData.data) {
          console.log('📋 User missions found:', userMissionsData.data.length);
          
          if (userMissionsData.data.length > 0) {
            const firstUserMission = userMissionsData.data[0];
            console.log('🎯 First user mission:', {
              id: firstUserMission.id,
              mission_id: firstUserMission.mission_id,
              status: firstUserMission.status,
              progress: firstUserMission.progress
            });
            
            // Test 4: Test getUserMission API (new method we added)
            console.log('\n🔍 Testing getUserMission API...');
            const userMissionResponse = await fetch(`${baseURL}/mobile/missions/user-mission/${firstUserMission.id}`);
            const userMissionData = await userMissionResponse.json();
            console.log('✅ getUserMission response status:', userMissionResponse.status);
            
            if (userMissionResponse.status === 200) {
              console.log('✅ getUserMission API is working!');
              console.log('📊 User mission data:', {
                id: userMissionData.id,
                status: userMissionData.status,
                current_value: userMissionData.current_value,
                progress: userMissionData.progress
              });
            } else {
              console.log('❌ getUserMission API returned error:', userMissionData.error || userMissionData.message);
              console.log('💡 This might be because the endpoint doesn\'t exist on the server yet');
            }
          } else {
            console.log('💡 No user missions found. You might need to accept a mission first.');
          }
        } else {
          console.log('❌ Failed to get user missions:', userMissionsData.message);
        }
      } else {
        console.log('❌ No missions available');
      }
    } catch (error) {
      console.log('❌ Error testing missions:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error in mission detail test:', error);
  }
}

// Run the test
testMissionDetail().then(() => {
  console.log('\n✅ Mission detail test completed!');
  console.log('\n📝 Summary:');
  console.log('- If you see "getUserMission API is working!" then the fix is successful');
  console.log('- If you see "getUserMission API returned error" then the server endpoint needs to be added');
  console.log('- The mobile app should now be able to navigate to mission detail screens');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
