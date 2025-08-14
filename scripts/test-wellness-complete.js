const https = require('https');
const http = require('http');

function makePostRequest(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testWellnessComplete() {
  try {
    console.log('🧪 Testing wellness activities complete endpoint...');
    
    // First, let's get a valid activity ID
    const activitiesResult = await makePostRequest('http://localhost:3000/api/mobile/wellness/activities/public', {});
    
    if (activitiesResult.status !== 200) {
      console.log('❌ Could not fetch activities:', activitiesResult.data);
      return;
    }
    
    const activities = activitiesResult.data.data || activitiesResult.data;
    if (!activities || activities.length === 0) {
      console.log('❌ No activities available');
      return;
    }
    
    const activityId = activities[0].id;
    console.log(`📋 Using activity ID: ${activityId}`);
    
    // Test data for completion
    const testData = {
      activity_id: activityId,
      duration: 30,
      notes: 'Test completion',
      points_earned: 15,
      activity_name: activities[0].title,
      activity_type: 'fitness',
      activity_category: activities[0].category,
      mood_before: 7,
      mood_after: 8,
      stress_level_before: 5,
      stress_level_after: 3
    };
    
    // Test without authorization first
    console.log('\n🔍 Testing without authorization...');
    const noAuthResult = await makePostRequest('http://localhost:3000/api/mobile/wellness/activities/complete', testData);
    console.log('Status:', noAuthResult.status);
    console.log('Response:', JSON.stringify(noAuthResult.data, null, 2));
    
    // Test with invalid token
    console.log('\n🔍 Testing with invalid token...');
    const invalidTokenResult = await makePostRequest(
      'http://localhost:3000/api/mobile/wellness/activities/complete', 
      testData,
      { 'Authorization': 'Bearer invalid_token' }
    );
    console.log('Status:', invalidTokenResult.status);
    console.log('Response:', JSON.stringify(invalidTokenResult.data, null, 2));
    
    // Test with valid token (you'll need to provide a real token)
    console.log('\n🔍 Testing with valid token...');
    console.log('Note: You need to provide a valid JWT token to test this properly');
    console.log('You can get a token by logging in through the mobile app or dashboard');
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
  }
}

testWellnessComplete();
