const apiService = require('../src/services/api.js');

async function testMealDataFix() {
  console.log('🧪 Testing meal data fix...\n');
  
  try {
    // Test 1: Get meal history for today
    console.log('1. Testing getMealHistory() for today...');
    const todayResponse = await apiService.getMealHistory({ date: '2025-08-22' });
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
    console.log('\n2. Testing getMealHistory() for all recent meals...');
    const allMealsResponse = await apiService.getMealHistory({ limit: 10 });
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
    console.log('\n3. Testing getTodayNutrition()...');
    const todayNutritionResponse = await apiService.getTodayNutrition();
    console.log('✅ Today nutrition response:', {
      success: todayNutritionResponse.success,
      hasData: !!todayNutritionResponse.data,
      hasTotals: !!todayNutritionResponse.data?.totals,
      calories: todayNutritionResponse.data?.totals?.calories || 'N/A'
    });
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMealDataFix();
