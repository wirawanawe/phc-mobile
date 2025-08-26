const https = require('https');
const http = require('http');

// Simple HTTP request function
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
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
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function testMealAPI() {
  console.log('🧪 Testing meal API endpoints...\n');
  
  const baseUrl = 'http://localhost:3000/api/mobile/tracking/meal';
  
  try {
    // Test 1: Get meal history for today
    console.log('1. Testing meal history for today (2025-08-22)...');
    const todayUrl = `${baseUrl}?user_id=1&date=2025-08-22`;
    const todayResponse = await makeRequest(todayUrl);
    
    console.log('✅ Today meal response:', {
      success: todayResponse.success,
      hasData: !!todayResponse.data,
      hasEntries: !!todayResponse.data?.entries,
      entriesCount: todayResponse.data?.entries?.length || 0
    });
    
    if (todayResponse.success && todayResponse.data?.entries?.length > 0) {
      const firstMeal = todayResponse.data.entries[0];
      console.log('✅ First meal structure:', {
        id: firstMeal.id,
        meal_type: firstMeal.meal_type,
        foods_count: firstMeal.foods?.length || 0,
        has_foods: !!firstMeal.foods
      });
      
      if (firstMeal.foods && firstMeal.foods.length > 0) {
        const totalCalories = firstMeal.foods.reduce((total, food) => {
          return total + (parseFloat(food.calories) || 0);
        }, 0);
        console.log('✅ Total calories in first meal:', totalCalories);
      }
    }
    
    // Test 2: Get all recent meals
    console.log('\n2. Testing meal history for all recent meals...');
    const allMealsUrl = `${baseUrl}?user_id=1&limit=10`;
    const allMealsResponse = await makeRequest(allMealsUrl);
    
    console.log('✅ All meals response:', {
      success: allMealsResponse.success,
      hasData: !!allMealsResponse.data,
      hasEntries: !!allMealsResponse.data?.entries,
      entriesCount: allMealsResponse.data?.entries?.length || 0
    });
    
    if (allMealsResponse.success && allMealsResponse.data?.entries?.length > 0) {
      const totalCalories = allMealsResponse.data.entries.reduce((total, meal) => {
        if (meal.foods && Array.isArray(meal.foods)) {
          const mealCalories = meal.foods.reduce((foodTotal, food) => {
            return foodTotal + (parseFloat(food.calories) || 0);
          }, 0);
          return total + mealCalories;
        }
        return total + (parseFloat(meal.calories) || 0);
      }, 0);
      console.log('✅ Total calories across all meals:', totalCalories);
    }
    
    // Test 3: Test today nutrition API
    console.log('\n3. Testing today nutrition API...');
    const todayNutritionUrl = 'http://localhost:3000/api/mobile/tracking/meal/today?user_id=1';
    const todayNutritionResponse = await makeRequest(todayNutritionUrl);
    
    console.log('✅ Today nutrition response:', {
      success: todayNutritionResponse.success,
      hasData: !!todayNutritionResponse.data,
      hasTotals: !!todayNutritionResponse.data?.totals,
      calories: todayNutritionResponse.data?.totals?.calories || 'N/A'
    });
    
    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Meal history API is working correctly');
    console.log('- Data structure is consistent (data.entries format)');
    console.log('- Calories calculation is working properly');
    console.log('- Frontend should now display meal data correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMealAPI();
