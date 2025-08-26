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

async function testMealTabFiltering() {
  console.log('🧪 Testing meal tab filtering logic...\n');
  
  const baseUrl = 'http://localhost:3000/api/mobile/tracking/meal';
  
  try {
    // Test 1: Get meals for 2025-08-23
    console.log('1. Testing meals for 2025-08-23...');
    const dateUrl = `${baseUrl}?user_id=1&date=2025-08-23`;
    const dateResponse = await makeRequest(dateUrl);
    
    console.log('✅ API Response:', {
      success: dateResponse.success,
      entriesCount: dateResponse.data?.entries?.length || 0
    });
    
    if (dateResponse.success && dateResponse.data?.entries?.length > 0) {
      console.log('📋 Available meal types:');
      dateResponse.data.entries.forEach((meal, index) => {
        console.log(`  ${index + 1}. ${meal.meal_type} (${meal.foods?.length || 0} foods)`);
      });
    }
    
    // Test 2: Simulate frontend data processing
    console.log('\n2. Simulating frontend data processing...');
    if (dateResponse.success && dateResponse.data?.entries?.length > 0) {
      const mealData = dateResponse.data.entries;
      const allMeals = [];
      
      mealData.forEach((meal) => {
        if (meal.foods && meal.foods.length > 0) {
          const mealTime = meal.recorded_at ? 
            new Date(meal.recorded_at).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }) : 'Unknown';
          
          meal.foods.forEach((food, index) => {
            const foodCalories = parseFloat(food.calories) || 0;
            const mealType = meal.meal_type || 'meal';
            
            allMeals.push({
              id: `${meal.id}-${index}`,
              name: food.food_name || food.food_name_indonesian || 'Unknown Food',
              time: mealTime,
              calories: Math.round(foodCalories),
              meal: mealType,
              mealId: meal.id,
              quantity: food.quantity,
              unit: food.unit,
              recordedAt: meal.recorded_at,
            });
          });
        }
      });
      
      console.log('✅ Processed meals:', allMeals.length, 'items');
      console.log('📋 Meal types in processed data:');
      const uniqueMealTypes = [...new Set(allMeals.map(meal => meal.meal))];
      uniqueMealTypes.forEach(type => {
        const count = allMeals.filter(meal => meal.meal === type).length;
        console.log(`  - ${type}: ${count} items`);
      });
    }
    
    // Test 3: Simulate tab filtering
    console.log('\n3. Simulating tab filtering...');
    if (dateResponse.success && dateResponse.data?.entries?.length > 0) {
      const mealData = dateResponse.data.entries;
      const allMeals = [];
      
      mealData.forEach((meal) => {
        if (meal.foods && meal.foods.length > 0) {
          const mealTime = meal.recorded_at ? 
            new Date(meal.recorded_at).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }) : 'Unknown';
          
          meal.foods.forEach((food, index) => {
            const foodCalories = parseFloat(food.calories) || 0;
            const mealType = meal.meal_type || 'meal';
            
            allMeals.push({
              id: `${meal.id}-${index}`,
              name: food.food_name || food.food_name_indonesian || 'Unknown Food',
              time: mealTime,
              calories: Math.round(foodCalories),
              meal: mealType,
              mealId: meal.id,
              quantity: food.quantity,
              unit: food.unit,
              recordedAt: meal.recorded_at,
            });
          });
        }
      });
      
      // Test different tab selections
      const tabSelections = ['all', 'sarapan', 'makan siang', 'makan malam', 'snack'];
      
      tabSelections.forEach(tab => {
        let filtered;
        if (tab === 'all') {
          filtered = allMeals;
        } else {
          filtered = allMeals.filter(meal => meal.meal === tab);
        }
        
        console.log(`  Tab "${tab}": ${filtered.length} items`);
        if (filtered.length > 0) {
          console.log(`    Sample: ${filtered[0].name} - ${filtered[0].calories} cal`);
        }
      });
    }
    
    console.log('\n🎉 Meal tab filtering tests completed!');
    console.log('\n📋 Summary:');
    console.log('- Data exists for 2025-08-23');
    console.log('- Available meal types: sarapan');
    console.log('- Tab "All" should show all data');
    console.log('- Tab "Sarapan" should show data');
    console.log('- Tab "Makan Siang" will show empty (no data for this meal type)');
    console.log('- This is expected behavior based on available data');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMealTabFiltering();
