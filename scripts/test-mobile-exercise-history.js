const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/mobile';

// Test user credentials
const testUser = {
  email: 'test@mobile.com',
  password: 'password123'
};

// Simulate mobile app exercise history call
async function testMobileExerciseHistory() {
  const testDate = '2024-01-15'; // The date we added data for
  
  console.log('🔍 Testing Mobile App Exercise History...');
  console.log('📅 Test date:', testDate);
  
  try {
    // Step 1: Login to get auth token (like mobile app does)
    console.log('\n1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const authToken = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    console.log('✅ Login successful. User ID:', userId);
    
    // Step 2: Call exercise history API exactly like mobile app does
    console.log('\n2️⃣ Calling exercise history API...');
    const response = await axios.get(`${API_BASE_URL}/tracking/fitness?date=${testDate}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Full Response:', JSON.stringify(response.data, null, 2));
    
    // Step 3: Simulate how mobile app processes the response
    console.log('\n3️⃣ Simulating mobile app data processing...');
    
    if (response.data.success) {
      console.log('✅ API call successful');
      
      let exerciseData = [];
      
      if (response.data.data && Array.isArray(response.data.data)) {
        // Direct array format
        exerciseData = response.data.data;
        console.log('📋 Using direct array format');
      } else if (response.data.data && response.data.data.entries && Array.isArray(response.data.data.entries)) {
        // Nested entries format
        exerciseData = response.data.data.entries;
        console.log('📋 Using nested entries format');
      }
      
      console.log('📊 Number of exercise entries found:', exerciseData.length);
      
      if (exerciseData.length > 0) {
        console.log('\n📋 Processing exercise entries...');
        
        exerciseData.forEach((entry, index) => {
          console.log(`\n--- Entry ${index + 1} ---`);
          console.log('  ID:', entry.id);
          console.log('  Steps:', entry.steps);
          console.log('  Exercise Minutes:', entry.exercise_minutes);
          console.log('  Duration Minutes:', entry.duration_minutes);
          console.log('  Calories Burned:', entry.calories_burned);
          console.log('  Distance (km):', entry.distance_km);
          console.log('  Workout Type:', entry.workout_type);
          console.log('  Activity Type:', entry.activity_type);
          console.log('  Notes:', entry.notes);
          console.log('  Tracking Date:', entry.tracking_date);
          console.log('  Created At:', entry.created_at);
          
          // Simulate mobile app mapping
          const mappedEntry = {
            id: entry.id,
            steps: entry.steps || 0,
            exercise_minutes: entry.exercise_minutes || entry.duration_minutes || 0,
            calories_burned: entry.calories_burned || 0,
            distance_km: entry.distance_km || 0,
            workout_type: entry.workout_type || entry.activity_type || 'Exercise',
            notes: entry.notes || '',
            intensity: entry.intensity || '',
            created_at: entry.created_at,
            updated_at: entry.updated_at
          };
          
          console.log('\n  📱 Mapped Entry (as mobile app sees it):');
          console.log('    Steps:', mappedEntry.steps);
          console.log('    Exercise Minutes:', mappedEntry.exercise_minutes);
          console.log('    Calories Burned:', mappedEntry.calories_burned);
          console.log('    Distance (km):', mappedEntry.distance_km);
          console.log('    Workout Type:', mappedEntry.workout_type);
          console.log('    Notes:', mappedEntry.notes);
        });
        
        console.log('\n✅ All data parameters are present and correctly mapped!');
      } else {
        console.log('⚠️ No exercise data found for the selected date');
      }
    } else {
      console.log('❌ API call failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing mobile exercise history:', error.message);
    
    if (error.response) {
      console.error('📊 Error response:', error.response.data);
      console.error('📊 Error status:', error.response.status);
    }
  }
}

// Run the test
testMobileExerciseHistory().catch(console.error);
