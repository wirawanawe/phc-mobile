const axios = require('axios');

const API_BASE_URL = 'https://dash.doctorphc.id/api/mobile';

// Test user credentials
const testUser = {
  email: 'test@mobile.com',
  password: 'password123'
};

async function testQuickAddFix() {
  try {
    console.log('🔍 Testing Quick Add Deletion Fix...\n');

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
    
    // Step 2: Get current quick foods
    console.log('\n2. Getting current quick foods...');
    const quickFoodsResponse = await axios.get(`${API_BASE_URL}/food/quick-foods`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('Current quick foods:', quickFoodsResponse.data);
    
    if (quickFoodsResponse.data.data && quickFoodsResponse.data.data.length > 0) {
      const firstQuickFood = quickFoodsResponse.data.data[0];
      console.log('\n3. Testing delete for food ID:', firstQuickFood.food_id);
      console.log('   Quick food record ID:', firstQuickFood.id);
      console.log('   Food name:', firstQuickFood.name);
      
      // Step 3: Try to delete the first quick food using food_id
      const deleteResponse = await axios.delete(`${API_BASE_URL}/food/quick-foods/${firstQuickFood.food_id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('Delete response:', deleteResponse.data);
      
      // Step 4: Verify deletion by getting quick foods again
      console.log('\n4. Verifying deletion...');
      const verifyResponse = await axios.get(`${API_BASE_URL}/food/quick-foods`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('Quick foods after deletion:', verifyResponse.data);
      
    } else {
      console.log('No quick foods found. Adding one first...');
      
      // Add a quick food first
      const addResponse = await axios.post(`${API_BASE_URL}/food/quick-foods`, {
        food_id: 17 // Add first food from database (Nasi Goreng)
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('Add response:', addResponse.data);
      
      if (addResponse.data.success) {
        console.log('\nNow testing deletion...');
        const deleteResponse = await axios.delete(`${API_BASE_URL}/food/quick-foods/17`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        console.log('Delete response:', deleteResponse.data);
      }
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testQuickAddFix();
