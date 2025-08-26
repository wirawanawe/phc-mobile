const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/mobile';

// Test different user credentials
const testUsers = [
  {
    name: 'Test User 1',
    email: 'test@mobile.com',
    password: 'password123'
  },
  {
    name: 'Test User 2', 
    email: 'user@test.com',
    password: 'password123'
  },
  {
    name: 'Test User 3',
    email: 'mobile@test.com', 
    password: 'password123'
  }
];

async function testLoginSystem() {
  console.log('🔐 Testing Login System...\n');
  
  for (const user of testUsers) {
    console.log(`\n📧 Testing login for: ${user.name} (${user.email})`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      if (response.data.success) {
        console.log('✅ Login successful!');
        console.log('👤 User ID:', response.data.data.user.id);
        console.log('📧 Email:', response.data.data.user.email);
        console.log('🔑 Token received:', response.data.data.accessToken ? 'Yes' : 'No');
        return response.data; // Return successful login data
      } else {
        console.log('❌ Login failed:', response.data.message);
      }
      
    } catch (error) {
      console.log('❌ Login error:', error.response?.data?.message || error.message);
      
      if (error.response) {
        console.log('📊 Status:', error.response.status);
        console.log('📊 Response:', error.response.data);
      }
    }
  }
  
  console.log('\n❌ All test users failed to login');
  console.log('🔍 This suggests a system-wide issue');
  
  // Test if the server is reachable
  console.log('\n🌐 Testing server connectivity...');
  try {
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api/mobile', '')}/health`);
    console.log('✅ Server is reachable');
  } catch (error) {
    console.log('❌ Server connectivity issue:', error.message);
  }
}

// Run the test
testLoginSystem().catch(console.error);
