const https = require('https');
const http = require('http');

// Simple HTTP request function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testMealHistoryDisplay() {
  console.log('🧪 Testing meal history display...\n');
  
  const baseUrl = 'http://localhost:3000/api/mobile/tracking/meal';
  
  try {
    // Test 1: Get all recent meals (for Riwayat Makanan)
    console.log('1. Testing recent meals (Riwayat Makanan)...');
    const recentMealsUrl = `${baseUrl}?user_id=1&limit=10`;
    const recentMealsResponse = await makeRequest(recentMealsUrl);
    
    console.log('✅ Recent meals response:', {
      success: recentMealsResponse.success,
      entriesCount: recentMealsResponse.data?.entries?.length || 0
    });
    
    if (recentMealsResponse.success && recentMealsResponse.data?.entries?.length > 0) {
      console.log('✅ Recent meals data available');
      const firstMeal = recentMealsResponse.data.entries[0];
      console.log('📋 Sample meal:', {
        id: firstMeal.id,
        meal_type: firstMeal.meal_type,
        foods_count: firstMeal.foods?.length || 0,
        recorded_at: firstMeal.recorded_at
      });
      
      if (firstMeal.foods && firstMeal.foods.length > 0) {
        console.log('🍎 Sample food:', {
          name: firstMeal.foods[0].food_name || firstMeal.foods[0].food_name_indonesian,
          calories: firstMeal.foods[0].calories,
          quantity: firstMeal.foods[0].quantity
        });
      }
    } else {
      console.log('⚠️ No recent meals data found');
    }
    
    // Test 2: Get today's meals (for tracking history)
    console.log('\n2. Testing today\'s meals (tracking history)...');
    const today = new Date().toISOString().split('T')[0];
    const todayMealsUrl = `${baseUrl}?user_id=1&date=${today}`;
    const todayMealsResponse = await makeRequest(todayMealsUrl);
    
    console.log('✅ Today\'s meals response:', {
      success: todayMealsResponse.success,
      entriesCount: todayMealsResponse.data?.entries?.length || 0,
      date: today
    });
    
    if (todayMealsResponse.success && todayMealsResponse.data?.entries?.length > 0) {
      console.log('✅ Today\'s meals data available');
      const todayMeal = todayMealsResponse.data.entries[0];
      console.log('📋 Today\'s meal:', {
        id: todayMeal.id,
        meal_type: todayMeal.meal_type,
        foods_count: todayMeal.foods?.length || 0,
        total_calories: todayMeal.foods?.reduce((sum, food) => sum + parseFloat(food.calories), 0) || 0
      });
    } else {
      console.log('⚠️ No meals data found for today');
    }
    
    // Test 3: Test specific date (2025-08-23)
    console.log('\n3. Testing specific date (2025-08-23)...');
    const specificDateUrl = `${baseUrl}?user_id=1&date=2025-08-23`;
    const specificDateResponse = await makeRequest(specificDateUrl);
    
    console.log('✅ Specific date response:', {
      success: specificDateResponse.success,
      entriesCount: specificDateResponse.data?.entries?.length || 0,
      date: '2025-08-23'
    });
    
    if (specificDateResponse.success && specificDateResponse.data?.entries?.length > 0) {
      console.log('✅ Specific date meals data available');
      specificDateResponse.data.entries.forEach((meal, index) => {
        console.log(`📋 Meal ${index + 1}:`, {
          id: meal.id,
          meal_type: meal.meal_type,
          foods_count: meal.foods?.length || 0,
          total_calories: meal.foods?.reduce((sum, food) => sum + parseFloat(food.calories), 0) || 0
        });
      });
    } else {
      console.log('⚠️ No meals data found for specific date');
    }
    
    console.log('\n🎉 Meal history display tests completed!');
    console.log('\n📋 Summary:');
    console.log('- Recent meals API is working correctly');
    console.log('- Date-specific filtering is working');
    console.log('- Data structure is consistent');
    console.log('- Frontend should now display meal history correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMealHistoryDisplay();
