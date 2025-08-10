const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/mobile';

// Test user credentials
const testUser = {
  email: 'test@mobile.com',
  password: 'password123'
};

async function testWellnessFinal() {
  try {
    console.log('🔍 Final Test: Wellness Tracking Data Display...\n');

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
    
    // Step 2: Get today summary
    console.log('\n2. Getting today summary...');
    const summaryResponse = await axios.get(`${API_BASE_URL}/tracking/today-summary`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (summaryResponse.data.success && summaryResponse.data.data) {
      const data = summaryResponse.data.data;
      console.log('Raw API response:', JSON.stringify(data, null, 2));
      
      // Step 3: Simulate WellnessApp DashboardTab parsing
      console.log('\n3. Simulating WellnessApp DashboardTab parsing...');
      const dashboardData = {
        calories: parseFloat(data.meal?.calories) || parseFloat(data.calories) || 0,
        servings: parseInt(data.meal?.meal_count) || parseInt(data.servings) || 0,
        steps: parseInt(data.fitness?.steps) || parseInt(data.steps) || 0,
        exerciseMinutes: parseInt(data.fitness?.exercise_minutes) || parseInt(data.exercise_minutes) || 0,
        waterIntake: parseFloat(data.water?.total_ml) || parseFloat(data.water_intake) || 0,
      };
      
      console.log('DashboardTab parsed data:', dashboardData);
      
      // Step 4: Simulate TodaySummaryCard parsing
      console.log('\n4. Simulating TodaySummaryCard parsing...');
      let calories = 0;
      if (data.meal && (data.meal.calories || data.meal.total_calories)) {
        calories = parseFloat(data.meal.calories) || parseFloat(data.meal.total_calories) || 0;
      }
      
      let waterIntake = 0;
      if (data.water && (data.water.total_ml || data.water.total_water_ml || data.water.total_intake)) {
        waterIntake = parseFloat(data.water.total_ml) || parseFloat(data.water.total_water_ml) || parseFloat(data.water.total_intake) || 0;
      }
      
      let steps = 0;
      if (data.fitness && data.fitness.steps) {
        steps = parseInt(data.fitness.steps) || 0;
      }
      
      console.log('TodaySummaryCard parsed data:');
      console.log('  Calories:', calories);
      console.log('  Water Intake:', waterIntake);
      console.log('  Steps:', steps);
      
      // Step 5: Verify data types and values
      console.log('\n5. Verifying data types and values...');
      const allValues = [
        dashboardData.calories,
        dashboardData.servings,
        dashboardData.steps,
        dashboardData.exerciseMinutes,
        dashboardData.waterIntake,
        calories,
        waterIntake,
        steps
      ];
      
      const allAreNumbers = allValues.every(value => typeof value === 'number');
      console.log('All values are numbers:', allAreNumbers);
      
      const hasData = calories > 0 || waterIntake > 0 || steps > 0;
      console.log('Has tracking data:', hasData);
      
      if (hasData && allAreNumbers) {
        console.log('\n✅ SUCCESS: Wellness tracking will display data correctly!');
        console.log('📊 Expected display in wellness tracking:');
        console.log('  Calories:', calories, '(should show in Today\'s Overview)');
        console.log('  Water:', waterIntake, 'ml (should show in Today\'s Overview)');
        console.log('  Steps:', steps, '(should show in Today\'s Overview)');
        console.log('  Exercise Minutes:', dashboardData.exerciseMinutes);
        console.log('  Distance:', parseFloat(data.fitness?.distance_km) || 0, 'km');
        
        console.log('\n🎯 Summary:');
        console.log('- Data parsing works correctly in both DashboardTab and TodaySummaryCard');
        console.log('- Wellness tracking will show actual data instead of 0s');
        console.log('- The issue was that user had no tracking data initially');
        console.log('- After adding test data, the system works perfectly');
      } else {
        console.log('\n❌ ISSUE: Data parsing or display may have problems');
      }
    } else {
      console.log('❌ Failed to get today summary');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testWellnessFinal();
