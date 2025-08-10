const fetch = require('node-fetch');

async function testNavigation() {
  try {
    console.log('🧪 Testing navigation and authentication...');
    
    const baseURL = 'http://localhost:3000/api';
    
    // Test 1: Check if user is authenticated
    console.log('👤 Checking authentication status...');
    try {
      const authResponse = await fetch(`${baseURL}/mobile/auth/me`);
      const authData = await authResponse.json();
      console.log('✅ Auth response status:', authResponse.status);
      console.log('🔐 Auth data:', authData);
      
      if (authData.success && authData.data) {
        console.log('✅ User is authenticated:', authData.data.name);
        console.log('👤 User ID:', authData.data.id);
      } else {
        console.log('❌ User is not authenticated');
        console.log('💡 You need to login first to access mission screens');
      }
      
    } catch (error) {
      console.log('❌ Error checking authentication:', error.message);
    }
    
    // Test 2: Check if missions are available
    console.log('\n📋 Checking available missions...');
    try {
      const missionsResponse = await fetch(`${baseURL}/mobile/missions`);
      const missionsData = await missionsResponse.json();
      console.log('✅ Missions response status:', missionsResponse.status);
      
      if (missionsData.success && missionsData.data) {
        console.log('📋 Available missions:', missionsData.data.length);
        missionsData.data.forEach((mission, index) => {
          console.log(`  ${index + 1}. ${mission.title} (${mission.points} pts)`);
        });
      } else {
        console.log('❌ No missions available');
      }
      
    } catch (error) {
      console.log('❌ Error checking missions:', error.message);
    }
    
    // Test 3: Check user missions (requires authentication)
    console.log('\n🎯 Checking user missions...');
    try {
      const userMissionsResponse = await fetch(`${baseURL}/mobile/missions/my-missions?user_id=5`);
      const userMissionsData = await userMissionsResponse.json();
      console.log('✅ User missions response status:', userMissionsResponse.status);
      
      if (userMissionsData.success && userMissionsData.data) {
        console.log('📋 User missions found:', userMissionsData.data.length);
        userMissionsData.data.forEach((mission, index) => {
          console.log(`  ${index + 1}. ${mission.title} - ${mission.status} (${mission.progress}%)`);
        });
      } else {
        console.log('❌ No user missions found');
      }
      
    } catch (error) {
      console.log('❌ Error checking user missions:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error in navigation test:', error);
  }
}

// Run the test
testNavigation().then(() => {
  console.log('🏁 Navigation test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Navigation test failed:', error);
  process.exit(1);
}); 