const https = require('https');
const http = require('http');

async function testLoginAPI() {
  try {
    console.log('🧪 Testing login API endpoint directly...\n');
    
    const loginData = {
      email: 'test@mobile.com',
      password: 'password123'
    };
    
    console.log('📤 Sending login request...');
    console.log('📋 Request data:', JSON.stringify(loginData, null, 2));
    
    const postData = JSON.stringify(loginData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/mobile/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        console.log(`📊 Response status: ${res.statusCode}`);
        console.log(`📊 Response headers:`, res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`📋 Response body: ${data}`);
          
          if (res.statusCode === 200) {
            try {
              const responseData = JSON.parse(data);
              console.log('✅ Login successful!');
              console.log('📋 Response data:', JSON.stringify(responseData, null, 2));
            } catch (parseError) {
              console.log('❌ Failed to parse response as JSON');
            }
          } else {
            console.log('❌ Login failed!');
            console.log(`📋 Error: ${data}`);
          }
          resolve();
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Error testing login API:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
          console.log('💡 Tip: Make sure the backend server is running on port 3000');
        }
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });
    
  } catch (error) {
    console.error('❌ Error testing login API:', error.message);
  }
}

// Run the test
testLoginAPI();
