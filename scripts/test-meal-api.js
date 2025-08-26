const https = require('https');
const http = require('http');

// Simple test function to check meal API
async function testMealAPI() {
  console.log('🧪 Testing meal API directly...\n');
  
  const testUrls = [
    'http://localhost:3000/api/mobile/tracking/meal?user_id=1&date=2025-08-23',
    'http://localhost:3000/api/mobile/tracking/meal?user_id=1&limit=10',
    'http://localhost:3000/api/mobile/tracking/meal/today?user_id=1'
  ];
  
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`${i + 1}. Testing: ${url}`);
    
    try {
      const response = await makeRequest(url);
      console.log('✅ Response:', {
        success: response.success,
        hasData: !!response.data,
        hasEntries: !!response.data?.entries,
        entriesCount: response.data?.entries?.length || 0
      });
      
      if (response.success && response.data?.entries?.length > 0) {
        console.log('✅ Sample meal data:', response.data.entries[0]);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Run the test
testMealAPI();
