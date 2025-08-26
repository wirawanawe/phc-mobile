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

async function testFrontendMealFormat() {
  console.log('🧪 Testing frontend meal data format...\n');
  
  const baseUrl = 'http://localhost:3000/api/mobile/tracking/meal';
  
  // Simulate frontend meal data format (what MealLoggingScreen sends)
  const frontendMealData = {
    user_id: 1,
    meal_type: 'sarapan',
    foods: [
      {
        food_id: 39, // Egg
        quantity: 2,
        unit: 'serving',
        calories: 233, // Calculated from calories_per_100g * actualWeight
        protein: 19.5,
        carbs: 1.7,
        fat: 16.5
      },
      {
        food_id: 34, // Carrot
        quantity: 1,
        unit: 'serving',
        calories: 105, // Calculated from calories_per_100g * actualWeight
        protein: 2.3,
        carbs: 24.6,
        fat: 0.5
      }
    ],
    notes: 'Sarapan - Total: 338 cal',
    recorded_at: new Date().toISOString()
  };
  
  try {
    console.log('📤 Sending frontend format meal data:', JSON.stringify(frontendMealData, null, 2));
    
    const response = await makeRequest(baseUrl, {
      method: 'POST',
      body: JSON.stringify(frontendMealData)
    });
    
    console.log('✅ POST response:', JSON.stringify(response, null, 2));
    
    if (response.success) {
      console.log('🎉 Frontend meal format test successful!');
      console.log('📊 Inserted IDs:', response.data?.ids);
      
      // Test GET to verify data was saved
      console.log('\n🔍 Verifying saved data...');
      const today = new Date().toISOString().split('T')[0];
      const getUrl = `${baseUrl}?user_id=1&date=${today}`;
      const getResponse = await makeRequest(getUrl);
      
      console.log('✅ GET verification response:', {
        success: getResponse.success,
        entriesCount: getResponse.data?.entries?.length || 0
      });
      
      if (getResponse.success && getResponse.data?.entries?.length > 0) {
        console.log('✅ Data successfully saved and retrieved!');
        const latestMeal = getResponse.data.entries[0];
        console.log('📋 Latest meal:', {
          id: latestMeal.id,
          meal_type: latestMeal.meal_type,
          foods_count: latestMeal.foods?.length || 0,
          total_calories: latestMeal.foods?.reduce((sum, food) => sum + parseFloat(food.calories), 0) || 0
        });
      } else {
        console.log('⚠️ Data might not have been saved properly');
      }
    } else {
      console.log('❌ Frontend meal format test failed:', response.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFrontendMealFormat();
