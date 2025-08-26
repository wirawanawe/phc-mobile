const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/mobile';

// Test user credentials
const testUser = {
  email: 'test@mobile.com',
  password: 'password123'
};

// Test the exercise history API
async function testExerciseHistory() {
  const testDate = '2024-01-15'; // Use a date that might have data
  
  console.log('🔍 Testing Exercise History API...');
  console.log('📅 Test date:', testDate);
  
  try {
    // Step 1: Login to get auth token
    console.log('\n1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const authToken = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    console.log('✅ Login successful. User ID:', userId);
    
    // Step 2: Test exercise history with JWT token
    console.log('\n2️⃣ Testing exercise history with JWT token...');
    const response = await axios.get(`${API_BASE_URL}/tracking/fitness?date=${testDate}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ API call successful');
      
      if (response.data.data && response.data.data.entries) {
        console.log('📋 Found entries in response.data.data.entries');
        console.log('📊 Number of entries:', response.data.data.entries.length);
        
        if (response.data.data.entries.length > 0) {
          console.log('📋 First entry:', response.data.data.entries[0]);
        }
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log('📋 Found entries directly in response.data');
        console.log('📊 Number of entries:', response.data.data.length);
        
        if (response.data.data.length > 0) {
          console.log('📋 First entry:', response.data.data[0]);
        }
      } else {
        console.log('⚠️ No entries found in response');
      }
    } else {
      console.log('❌ API call failed:', response.data.message);
    }
    
    // Step 3: Test with a user that has data
    console.log('\n3️⃣ Testing with user that has data (user_id=5)...');
    const userWithDataResponse = await axios.get(`${API_BASE_URL}/tracking/fitness?user_id=5&date=2025-08-04`);
    
    console.log('User with data response:', JSON.stringify(userWithDataResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing exercise history API:', error.message);
    
    if (error.response) {
      console.error('📊 Error response:', error.response.data);
      console.error('📊 Error status:', error.response.status);
    }
  }
}

// Run the test
testExerciseHistory().catch(console.error);
