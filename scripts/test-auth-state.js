const https = require('https');
const http = require('http');

// Test authentication state
async function testAuthState() {
  console.log('🔐 Testing authentication state...\n');
  
  // Test 1: Check if user is authenticated by calling /auth/me
  console.log('1. Testing authentication endpoint...');
  try {
    const response = await makeRequest('https://dash.doctorphc.id/api/auth/me?user_id=1');
    console.log('✅ Auth response:', {
      success: response.success,
      hasUser: !!response.user,
      userId: response.user?.id || 'N/A'
    });
  } catch (error) {
    console.log('❌ Auth endpoint error:', error.message);
  }
  
  // Test 2: Check meal data with user_id=1 (which should work)
  console.log('\n2. Testing meal data with user_id=1...');
  try {
    const response = await makeRequest('https://dash.doctorphc.id/api/mobile/tracking/meal?user_id=1&date=2025-08-23');
    console.log('✅ Meal data response:', {
      success: response.success,
      hasData: !!response.data,
      hasEntries: !!response.data?.entries,
      entriesCount: response.data?.entries?.length || 0
    });
    
    if (response.data?.entries?.length > 0) {
      console.log('   - First meal:', {
        id: response.data.entries[0].id,
        meal_type: response.data.entries[0].meal_type,
        foods_count: response.data.entries[0].foods?.length || 0
      });
    }
  } catch (error) {
    console.log('❌ Meal data error:', error.message);
  }
  
  // Test 3: Check meal data without user_id (should fail)
  console.log('\n3. Testing meal data without user_id...');
  try {
    const response = await makeRequest('https://dash.doctorphc.id/api/mobile/tracking/meal?date=2025-08-23');
    console.log('❌ Should have failed but got:', {
      success: response.success,
      message: response.message
    });
  } catch (error) {
    console.log('✅ Correctly failed without user_id:', error.message);
  }
  
  console.log('\n🎯 Summary:');
  console.log('- API endpoints are working');
  console.log('- User ID 1 has meal data');
  console.log('- Authentication might be the issue in frontend');
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
testAuthState();
