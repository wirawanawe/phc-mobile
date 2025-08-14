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

function makeGetRequest(url) {
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
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
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

async function testWellnessCompleteFixed() {
  try {
    console.log('🧪 Testing wellness activities complete endpoint (FIXED)...\n');
    
    // Step 1: Get a valid token by logging in
    console.log('1️⃣ Getting authentication token...');
    const loginResult = await makePostRequest('http://localhost:3000/api/mobile/auth/login', {
      email: 'test@mobile.com',
      password: 'password123'
    });
    
    if (loginResult.status !== 200 || !loginResult.data.success) {
      console.log('❌ Login failed:', loginResult.data);
      return;
    }
    
    const token = loginResult.data.data.accessToken;
    console.log('✅ Login successful, token obtained\n');
    
    // Step 2: Get available activities
    console.log('2️⃣ Fetching available activities...');
    const activitiesResult = await makeGetRequest('http://localhost:3000/api/mobile/wellness/activities/public');
    
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
    console.log(`✅ Found activity: ${activities[0].title} (ID: ${activityId})\n`);
    
    // Step 3: Test without authorization
    console.log('3️⃣ Testing without authorization...');
    const noAuthResult = await makePostRequest('http://localhost:3000/api/mobile/wellness/activities/complete', {
      activity_id: activityId,
      duration: 30,
      notes: 'Test completion'
    });
    
    console.log('Status:', noAuthResult.status);
    console.log('Response:', JSON.stringify(noAuthResult.data, null, 2));
    console.log('✅ Expected: 401 Unauthorized\n');
    
    // Step 4: Test with invalid token
    console.log('4️⃣ Testing with invalid token...');
    const invalidTokenResult = await makePostRequest(
      'http://localhost:3000/api/mobile/wellness/activities/complete', 
      {
        activity_id: activityId,
        duration: 30,
        notes: 'Test completion'
      },
      { 'Authorization': 'Bearer invalid_token' }
    );
    
    console.log('Status:', invalidTokenResult.status);
    console.log('Response:', JSON.stringify(invalidTokenResult.data, null, 2));
    console.log('✅ Expected: 401 Invalid token\n');
    
    // Step 5: Test with valid token
    console.log('5️⃣ Testing with valid token...');
    const validTokenResult = await makePostRequest(
      'http://localhost:3000/api/mobile/wellness/activities/complete', 
      {
        activity_id: activityId,
        duration: 30,
        notes: 'Test completion with valid token'
      },
      { 'Authorization': `Bearer ${token}` }
    );
    
    console.log('Status:', validTokenResult.status);
    console.log('Response:', JSON.stringify(validTokenResult.data, null, 2));
    
    if (validTokenResult.status === 200 && validTokenResult.data.success) {
      console.log('✅ Activity completed successfully!\n');
    } else {
      console.log('❌ Activity completion failed\n');
    }
    
    // Step 6: Test duplicate completion
    console.log('6️⃣ Testing duplicate completion...');
    const duplicateResult = await makePostRequest(
      'http://localhost:3000/api/mobile/wellness/activities/complete', 
      {
        activity_id: activityId,
        duration: 30,
        notes: 'Test duplicate completion'
      },
      { 'Authorization': `Bearer ${token}` }
    );
    
    console.log('Status:', duplicateResult.status);
    console.log('Response:', JSON.stringify(duplicateResult.data, null, 2));
    
    if (duplicateResult.status === 409 || (duplicateResult.data.message && duplicateResult.data.message.includes('already completed'))) {
      console.log('✅ Duplicate check working correctly!\n');
    } else {
      console.log('❌ Duplicate check failed\n');
    }
    
    // Step 7: Test with missing activity_id
    console.log('7️⃣ Testing with missing activity_id...');
    const missingActivityResult = await makePostRequest(
      'http://localhost:3000/api/mobile/wellness/activities/complete', 
      {
        duration: 30,
        notes: 'Test missing activity_id'
      },
      { 'Authorization': `Bearer ${token}` }
    );
    
    console.log('Status:', missingActivityResult.status);
    console.log('Response:', JSON.stringify(missingActivityResult.data, null, 2));
    
    if (missingActivityResult.status === 400) {
      console.log('✅ Missing activity_id validation working!\n');
    } else {
      console.log('❌ Missing activity_id validation failed\n');
    }
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testWellnessCompleteFixed();
