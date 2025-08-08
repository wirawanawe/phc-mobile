const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/mobile';

// Test user credentials
const testUser = {
  email: 'test@mobile.com',
  password: 'password123'
};

async function testMobileTodaySummary() {
  try {
    console.log('🔍 Testing Mobile App Today Summary...\n');

    // Step 1: Login to get auth token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const authToken = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    console.log('✅ Login successful. User ID:', userId);
    
    // Step 2: Test today summary with JWT token (like mobile app does)
    console.log('\n2. Testing today summary with JWT token...');
    const todaySummaryResponse = await axios.get(`${API_BASE_URL}/tracking/today-summary`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('Today summary with JWT response:', JSON.stringify(todaySummaryResponse.data, null, 2));
    
    // Step 3: Test today summary with user_id parameter (fallback)
    console.log('\n3. Testing today summary with user_id parameter...');
    const todaySummaryParamResponse = await axios.get(`${API_BASE_URL}/tracking/today-summary?user_id=${userId}`);
    
    console.log('Today summary with user_id response:', JSON.stringify(todaySummaryParamResponse.data, null, 2));
    
    // Step 4: Compare the responses
    console.log('\n4. Comparing responses...');
    const jwtData = todaySummaryResponse.data.data;
    const paramData = todaySummaryParamResponse.data.data;
    
    console.log('JWT Response meal calories:', jwtData.meal?.calories);
    console.log('Param Response meal calories:', paramData.meal?.calories);
    console.log('JWT Response fitness steps:', jwtData.fitness?.steps);
    console.log('Param Response fitness steps:', paramData.fitness?.steps);
    
    // Step 5: Test with a user that has data
    console.log('\n5. Testing with user that has data (user_id=5)...');
    const userWithDataResponse = await axios.get(`${API_BASE_URL}/tracking/today-summary?user_id=5&date=2025-08-04`);
    
    console.log('User with data response:', JSON.stringify(userWithDataResponse.data, null, 2));
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testMobileTodaySummary();
