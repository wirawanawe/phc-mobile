const axios = require('axios');

// Configuration
const baseURL = 'http://localhost:3000';
const testUserId = 1;
const testUserMissionId = 83;

// Test credentials (you may need to adjust these)
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

async function testMissionEndpoints() {
  try {
    console.log('🧪 Testing Mission Endpoints...\n');
    
    // 1. Test login to get token
    console.log('🔐 1. Testing login...');
    let token = null;
    
    try {
      const loginResponse = await axios.post(`${baseURL}/api/mobile/auth/login`, {
        email: testCredentials.email,
        password: testCredentials.password
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        token = loginResponse.data.token;
        console.log('✅ Login successful, token obtained');
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
        // Try with default test token
        token = 'test_token_123';
        console.log('🔄 Using test token for API calls');
      }
    } catch (error) {
      console.log('❌ Login error:', error.message);
      // Try with default test token
      token = 'test_token_123';
      console.log('🔄 Using test token for API calls');
    }
    
    // 2. Test missions endpoint
    console.log('\n📋 2. Testing missions endpoint...');
    try {
      const missionsResponse = await axios.get(`${baseURL}/api/mobile/missions`);
      console.log(`   Status: ${missionsResponse.status}`);
      console.log(`   Success: ${missionsResponse.data.success}`);
      console.log(`   Missions count: ${missionsResponse.data.missions?.length || 0}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // 3. Test specific mission endpoint
    console.log('\n🎯 3. Testing specific mission endpoint...');
    try {
      const missionResponse = await axios.get(`${baseURL}/api/mobile/missions/83`);
      console.log(`   Status: ${missionResponse.status}`);
      console.log(`   Success: ${missionResponse.data.success}`);
      if (missionResponse.data.success) {
        console.log(`   Mission title: ${missionResponse.data.data.title}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // 4. Test user mission endpoint (with auth)
    console.log('\n👤 4. Testing user mission endpoint...');
    try {
      const userMissionResponse = await axios.get(`${baseURL}/api/mobile/missions/user-mission/${testUserMissionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`   Status: ${userMissionResponse.status}`);
      console.log(`   Success: ${userMissionResponse.data.success}`);
      if (userMissionResponse.data.success) {
        console.log(`   User mission ID: ${userMissionResponse.data.data.id}`);
        console.log(`   Status: ${userMissionResponse.data.data.status}`);
        console.log(`   Progress: ${userMissionResponse.data.data.progress}%`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   Response status: ${error.response.status}`);
        console.log(`   Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    // 5. Test progress update endpoint (with auth)
    console.log('\n📈 5. Testing progress update endpoint...');
    try {
      const progressResponse = await axios.put(`${baseURL}/api/mobile/missions/progress/${testUserMissionId}`, {
        current_value: 2,
        notes: 'Test update from script'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`   Status: ${progressResponse.status}`);
      console.log(`   Success: ${progressResponse.data.success}`);
      if (progressResponse.data.success) {
        console.log(`   Message: ${progressResponse.data.message}`);
        console.log(`   New progress: ${progressResponse.data.data.progress}%`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   Response status: ${error.response.status}`);
        console.log(`   Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    // 6. Test my-missions endpoint
    console.log('\n📋 6. Testing my-missions endpoint...');
    try {
      const myMissionsResponse = await axios.get(`${baseURL}/api/mobile/missions/my-missions?user_id=${testUserId}`);
      console.log(`   Status: ${myMissionsResponse.status}`);
      console.log(`   Success: ${myMissionsResponse.data.success}`);
      console.log(`   My missions count: ${myMissionsResponse.data.data?.length || 0}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   Response status: ${error.response.status}`);
        console.log(`   Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    // 7. Test without authentication
    console.log('\n🔓 7. Testing endpoints without authentication...');
    
    // Test user mission without auth
    try {
      const noAuthResponse = await axios.get(`${baseURL}/api/mobile/missions/user-mission/${testUserMissionId}`);
      console.log(`   User mission without auth - Status: ${noAuthResponse.status}`);
    } catch (error) {
      console.log(`   User mission without auth - Expected error: ${error.response?.status} ${error.response?.data?.message}`);
    }
    
    // Test progress update without auth
    try {
      const noAuthProgressResponse = await axios.put(`${baseURL}/api/mobile/missions/progress/${testUserMissionId}`, {
        current_value: 1
      });
      console.log(`   Progress update without auth - Status: ${noAuthProgressResponse.status}`);
    } catch (error) {
      console.log(`   Progress update without auth - Expected error: ${error.response?.status} ${error.response?.data?.message}`);
    }
    
    console.log('\n✅ Mission endpoints testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMissionEndpoints().catch(console.error);
