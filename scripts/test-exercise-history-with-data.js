const axios = require('axios');

const API_BASE_URL = 'https://dash.doctorphc.id/api/mobile';

// Test user credentials
const testUser = {
  email: 'test@mobile.com',
  password: 'password123'
};

// Test the exercise history API with data
async function testExerciseHistoryWithData() {
  const testDate = '2024-01-15'; // Use a specific date for testing
  
  console.log('🔍 Testing Exercise History API with Data...');
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
    
    // Step 2: Add fitness data for the test date
    console.log('\n2️⃣ Adding fitness data for test date...');
    const fitnessData = {
      steps: 8000,
      exercise_minutes: 45,
      distance_km: 5.2,
      workout_type: "Running",
      calories_burned: 350,
      notes: "Morning run in the park",
      tracking_date: testDate,
      tracking_time: "08:30:00"
    };
    
    try {
      const fitnessResponse = await axios.post(`${API_BASE_URL}/tracking/fitness`, fitnessData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (fitnessResponse.data.success) {
        console.log('✅ Fitness data added successfully');
        console.log('📊 Added data:', {
          steps: fitnessData.steps,
          exercise_minutes: fitnessData.exercise_minutes,
          distance_km: fitnessData.distance_km,
          workout_type: fitnessData.workout_type,
          calories_burned: fitnessData.calories_burned
        });
      } else {
        console.log('❌ Failed to add fitness data:', fitnessResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Error adding fitness data:', error.response?.data?.message || error.message);
    }
    
    // Step 3: Test exercise history with the data
    console.log('\n3️⃣ Testing exercise history with JWT token...');
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
          
          // Check if the data parameters are present
          const entry = response.data.data.entries[0];
          console.log('\n🔍 Checking data parameters:');
          console.log('  - id:', entry.id);
          console.log('  - steps:', entry.steps);
          console.log('  - exercise_minutes:', entry.exercise_minutes);
          console.log('  - duration_minutes:', entry.duration_minutes);
          console.log('  - calories_burned:', entry.calories_burned);
          console.log('  - distance_km:', entry.distance_km);
          console.log('  - workout_type:', entry.workout_type);
          console.log('  - activity_type:', entry.activity_type);
          console.log('  - notes:', entry.notes);
          console.log('  - tracking_date:', entry.tracking_date);
          console.log('  - created_at:', entry.created_at);
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
    
    // Step 4: Test with a different date to make sure filtering works
    console.log('\n4️⃣ Testing with a different date (should be empty)...');
    const differentDateResponse = await axios.get(`${API_BASE_URL}/tracking/fitness?date=2024-01-16`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('Different date response:', JSON.stringify(differentDateResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing exercise history API:', error.message);
    
    if (error.response) {
      console.error('📊 Error response:', error.response.data);
      console.error('📊 Error status:', error.response.status);
    }
  }
}

// Run the test
testExerciseHistoryWithData().catch(console.error);
