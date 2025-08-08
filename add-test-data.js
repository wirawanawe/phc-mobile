const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/mobile';

// Test user credentials
const testUser = {
  email: 'test@mobile.com',
  password: 'password123'
};

async function addTestData() {
  try {
    console.log('🔍 Adding Test Tracking Data for User...\n');

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
    
    // Step 2: Add meal data
    console.log('\n2. Adding meal data...');
    const mealData = {
      user_id: userId,
      meal_type: "breakfast",
      foods: [
        {
          food_id: 17,
          name: "Oatmeal",
          calories: 150,
          protein: 5,
          carbs: 27,
          fat: 3,
          serving_size: 1,
          serving_unit: "cup"
        },
        {
          food_id: 18,
          name: "Banana",
          calories: 105,
          protein: 1,
          carbs: 27,
          fat: 0,
          serving_size: 1,
          serving_unit: "medium"
        }
      ],
      notes: "Breakfast - Oatmeal with banana",
      recorded_at: new Date().toISOString()
    };
    
    try {
      const mealResponse = await axios.post(`${API_BASE_URL}/tracking/meal`, mealData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (mealResponse.data.success) {
        console.log('✅ Meal data added successfully');
        console.log('Total calories:', mealData.foods.reduce((sum, food) => sum + food.calories, 0));
      } else {
        console.log('❌ Failed to add meal data:', mealResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Error adding meal data:', error.response?.data?.message || error.message);
    }
    
    // Step 3: Add water data
    console.log('\n3. Adding water data...');
    const waterData = {
      user_id: userId,
      amount_ml: 500,
      recorded_at: new Date().toISOString()
    };
    
    try {
      const waterResponse = await axios.post(`${API_BASE_URL}/tracking/water`, waterData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (waterResponse.data.success) {
        console.log('✅ Water data added successfully');
        console.log('Water amount:', waterData.amount_ml, 'ml');
      } else {
        console.log('❌ Failed to add water data:', waterResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Error adding water data:', error.response?.data?.message || error.message);
    }
    
    // Step 4: Add fitness data
    console.log('\n4. Adding fitness data...');
    const fitnessData = {
      steps: 5000,
      exercise_minutes: 30,
      distance_km: 3.5,
      workout_type: "Walking",
      calories_burned: 200,
      notes: "Morning walk",
      recorded_at: new Date().toISOString()
    };
    
    try {
      const fitnessResponse = await axios.post(`${API_BASE_URL}/tracking/fitness`, fitnessData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (fitnessResponse.data.success) {
        console.log('✅ Fitness data added successfully');
        console.log('Steps:', fitnessData.steps);
        console.log('Exercise minutes:', fitnessData.exercise_minutes);
        console.log('Distance:', fitnessData.distance_km, 'km');
      } else {
        console.log('❌ Failed to add fitness data:', fitnessResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Error adding fitness data:', error.response?.data?.message || error.message);
    }
    
    // Step 5: Verify data was added
    console.log('\n5. Verifying data was added...');
    try {
      const summaryResponse = await axios.get(`${API_BASE_URL}/tracking/today-summary`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (summaryResponse.data.success && summaryResponse.data.data) {
        const data = summaryResponse.data.data;
        console.log('Today summary after adding data:');
        console.log('  Calories:', parseFloat(data.meal?.calories) || 0);
        console.log('  Water:', parseFloat(data.water?.total_ml) || 0);
        console.log('  Steps:', parseInt(data.fitness?.steps) || 0);
        console.log('  Exercise minutes:', parseInt(data.fitness?.exercise_minutes) || 0);
        console.log('  Distance:', parseFloat(data.fitness?.distance_km) || 0);
        
        const hasData = (parseFloat(data.meal?.calories) || 0) > 0 || 
                       (parseFloat(data.water?.total_ml) || 0) > 0 || 
                       (parseInt(data.fitness?.steps) || 0) > 0;
        
        if (hasData) {
          console.log('\n✅ Data successfully added and visible in today summary!');
          console.log('📊 Wellness tracking should now show data instead of 0s');
        } else {
          console.log('\n❌ Data was added but not visible in today summary');
        }
      }
    } catch (error) {
      console.log('❌ Error verifying data:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

addTestData();
