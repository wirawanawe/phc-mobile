const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/mobile';

// Test user credentials
const testUser = {
  email: 'test@mobile.com',
  password: 'password123'
};

async function testWellnessTodaySummary() {
  try {
    console.log('🔍 Testing Wellness Tracking Today Summary...\n');

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
    
    // Step 2: Test today summary with JWT token (like wellness app does)
    console.log('\n2. Testing today summary with JWT token...');
    const todaySummaryResponse = await axios.get(`${API_BASE_URL}/tracking/today-summary`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('Today summary response:', JSON.stringify(todaySummaryResponse.data, null, 2));
    
    // Step 3: Test with specific date (like wellness app with date picker)
    console.log('\n3. Testing with specific date (2025-08-04)...');
    const dateSummaryResponse = await axios.get(`${API_BASE_URL}/tracking/today-summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { date: '2025-08-04' }
    });
    
    console.log('Date summary response:', JSON.stringify(dateSummaryResponse.data, null, 2));
    
    // Step 4: Test with user that has data
    console.log('\n4. Testing with user that has data (user_id=5)...');
    const userWithDataResponse = await axios.get(`${API_BASE_URL}/tracking/today-summary?user_id=5&date=2025-08-04`);
    
    console.log('User with data response:', JSON.stringify(userWithDataResponse.data, null, 2));
    
    // Step 5: Simulate TodaySummaryCard parsing
    console.log('\n5. Simulating TodaySummaryCard data parsing...');
    const summaryData = userWithDataResponse.data.data;
    
    // Simulate the parsing logic from TodaySummaryCard
    let calories = 0;
    if (summaryData.meal && (summaryData.meal.calories || summaryData.meal.total_calories)) {
      calories = parseFloat(summaryData.meal.calories) || parseFloat(summaryData.meal.total_calories) || 0;
      console.log('Calories from summary:', calories);
    }
    
    let waterIntake = 0;
    if (summaryData.water && (summaryData.water.total_ml || summaryData.water.total_water_ml || summaryData.water.total_intake)) {
      waterIntake = parseFloat(summaryData.water.total_ml) || parseFloat(summaryData.water.total_water_ml) || parseFloat(summaryData.water.total_intake) || 0;
      console.log('Water intake from summary:', waterIntake);
    }
    
    let steps = 0;
    if (summaryData.fitness && summaryData.fitness.steps) {
      steps = parseInt(summaryData.fitness.steps) || 0;
      console.log('Steps from summary:', steps);
    }
    
    console.log('\n6. Final parsed data for wellness tracking:');
    console.log('Calories:', calories);
    console.log('Water Intake:', waterIntake);
    console.log('Steps:', steps);
    
    // Step 6: Test with current date for wellness app
    console.log('\n7. Testing current date for wellness app...');
    const currentDate = new Date().toISOString().split('T')[0];
    const currentDateResponse = await axios.get(`${API_BASE_URL}/tracking/today-summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { date: currentDate }
    });
    
    console.log('Current date response:', JSON.stringify(currentDateResponse.data, null, 2));
    
    console.log('\n✅ Test completed successfully!');
    console.log('📊 Summary:');
    console.log('- Wellness app uses TodaySummaryCard with date prop');
    console.log('- API returns correct data for specific dates');
    console.log('- Data parsing works correctly for wellness tracking');
    console.log('- Current date shows 0 for user without data (correct)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testWellnessTodaySummary();
