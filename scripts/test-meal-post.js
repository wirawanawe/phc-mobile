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

async function testMealPost() {
  console.log('🧪 Testing POST meal API endpoint...\n');
  
  const baseUrl = 'http://localhost:3000/api/mobile/tracking/meal';
  
  // Test data
  const testMealData = {
    user_id: 1,
    meal_type: 'sarapan',
    foods: [
      {
        food_id: 39,
        quantity: 2,
        unit: 'serving',
        calories: 155,
        protein: 13,
        carbs: 1.1,
        fat: 11
      },
      {
        food_id: 34,
        quantity: 1,
        unit: 'serving',
        calories: 52,
        protein: 1.2,
        carbs: 12.3,
        fat: 0.3
      }
    ],
    notes: 'Test meal - Total: 207 cal',
    recorded_at: new Date().toISOString()
  };
  
  try {
    console.log('📤 Sending POST request with data:', JSON.stringify(testMealData, null, 2));
    
    const response = await makeRequest(baseUrl, {
      method: 'POST',
      body: JSON.stringify(testMealData)
    });
    
    console.log('✅ POST response:', JSON.stringify(response, null, 2));
    
    if (response.success) {
      console.log('🎉 POST meal API test successful!');
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
        console.log('📋 Latest meal:', JSON.stringify(getResponse.data.entries[0], null, 2));
      } else {
        console.log('⚠️ Data might not have been saved properly');
      }
    } else {
      console.log('❌ POST meal API test failed:', response.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMealPost();
