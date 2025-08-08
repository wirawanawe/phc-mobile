const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/mobile';

// Test user credentials
const testUser = {
  email: 'test@mobile.com',
  password: 'password123'
};

async function testUserDataCheck() {
  try {
    console.log('🔍 Checking User Data Availability...\n');

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
    
    // Step 2: Test different dates to find data
    console.log('\n2. Testing different dates to find user data...');
    
    const testDates = [
      '2025-08-07', // Today
      '2025-08-06', // Yesterday
      '2025-08-05', // 2 days ago
      '2025-08-04', // 3 days ago
      '2025-08-03', // 4 days ago
      '2025-08-02', // 5 days ago
      '2025-08-01', // 6 days ago
    ];
    
    for (const date of testDates) {
      console.log(`\nTesting date: ${date}`);
      try {
        const response = await axios.get(`${API_BASE_URL}/tracking/today-summary`, {
          headers: { Authorization: `Bearer ${authToken}` },
          params: { date }
        });
        
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          const calories = parseFloat(data.meal?.calories) || 0;
          const water = parseFloat(data.water?.total_ml) || 0;
          const steps = parseInt(data.fitness?.steps) || 0;
          
          console.log(`  Calories: ${calories}`);
          console.log(`  Water: ${water}ml`);
          console.log(`  Steps: ${steps}`);
          
          if (calories > 0 || water > 0 || steps > 0) {
            console.log(`  ✅ Found data on ${date}!`);
          } else {
            console.log(`  ❌ No data on ${date}`);
          }
        }
      } catch (error) {
        console.log(`  ❌ Error testing ${date}:`, error.response?.data?.message || error.message);
      }
    }
    
    // Step 3: Test with user that has data for comparison
    console.log('\n3. Testing with user that has data (user_id=5)...');
    const userWithDataResponse = await axios.get(`${API_BASE_URL}/tracking/today-summary?user_id=5&date=2025-08-04`);
    
    if (userWithDataResponse.data.success) {
      const data = userWithDataResponse.data.data;
      console.log('User 5 data on 2025-08-04:');
      console.log('  Calories:', parseFloat(data.meal?.calories) || 0);
      console.log('  Water:', parseFloat(data.water?.total_ml) || 0);
      console.log('  Steps:', parseInt(data.fitness?.steps) || 0);
    }
    
    // Step 4: Check if there's any meal data for user 6
    console.log('\n4. Checking meal history for user 6...');
    try {
      const mealHistoryResponse = await axios.get(`${API_BASE_URL}/mobile/food/meal-history`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (mealHistoryResponse.data.success && mealHistoryResponse.data.data) {
        console.log('Meal history found:', mealHistoryResponse.data.data.length, 'entries');
        if (mealHistoryResponse.data.data.length > 0) {
          console.log('Latest meal:', mealHistoryResponse.data.data[0]);
        }
      } else {
        console.log('No meal history found');
      }
    } catch (error) {
      console.log('Error getting meal history:', error.response?.data?.message || error.message);
    }
    
    console.log('\n📊 Summary:');
    console.log('- User 6 (test@mobile.com) may not have tracking data');
    console.log('- The 0 values shown are correct if no data exists');
    console.log('- To see data, user needs to log meals, water, or fitness activities');
    console.log('- User 5 has data on 2025-08-04 for comparison');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUserDataCheck();
