const axios = require('axios');

// Test script to verify quick foods nutrition data
async function testQuickFoodsNutrition() {
  const API_BASE_URL = 'http://10.242.90.103:3000/api/mobile';
  
  try {
    console.log('🔍 Testing Quick Foods Nutrition Data...\n');
    
    // Test getting quick foods
    console.log('1. Fetching quick foods...');
    const response = await axios.get(`${API_BASE_URL}/food/quick-foods`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Quick foods response received');
    console.log('Response status:', response.status);
    
    if (response.data.success && response.data.data) {
      console.log('\n📊 Quick foods data structure:');
      console.log('Number of quick foods:', response.data.data.length);
      
      if (response.data.data.length > 0) {
        const firstFood = response.data.data[0];
        console.log('\n🍽️  First quick food details:');
        console.log('ID:', firstFood.id);
        console.log('Food ID:', firstFood.food_id);
        console.log('Name:', firstFood.name);
        console.log('Category:', firstFood.category);
        console.log('\n📈 Nutrition data (per 100g):');
        console.log('Calories:', firstFood.calories_per_100g);
        console.log('Protein:', firstFood.protein_per_100g);
        console.log('Carbs:', firstFood.carbs_per_100g);
        console.log('Fat:', firstFood.fat_per_100g);
        console.log('Fiber:', firstFood.fiber_per_100g);
        console.log('Sugar:', firstFood.sugar_per_100g);
        console.log('Sodium:', firstFood.sodium_per_100g);
        
        // Test the mapping that should happen in the frontend
        console.log('\n🔄 Expected mapped data (for display):');
        console.log('Calories:', firstFood.calories_per_100g || 0);
        console.log('Protein:', firstFood.protein_per_100g || 0);
        console.log('Carbs:', firstFood.carbs_per_100g || 0);
        console.log('Fat:', firstFood.fat_per_100g || 0);
      } else {
        console.log('⚠️  No quick foods found');
      }
    } else {
      console.log('❌ Failed to get quick foods:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing quick foods:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testQuickFoodsNutrition();
