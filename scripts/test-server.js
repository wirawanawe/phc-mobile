const fetch = require('node-fetch');

async function testServer() {
  const endpoints = [
    'http://localhost:3000/api/health',
    'http://localhost:3000/api/mobile/auth/me',
    'http://localhost:3000/api/mobile/auth/login'
  ];

  console.log('🔍 Testing server endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const startTime = Date.now();
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`✅ Status: ${response.status} | Time: ${responseTime}ms`);
      
      if (endpoint.includes('/auth/login')) {
        // Test POST request for login
        const loginResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@mobile.com',
            password: 'password123'
          }),
          timeout: 5000
        });
        
        const loginData = await loginResponse.json();
        console.log(`✅ Login test: ${loginResponse.status} | ${loginData.message || 'No message'}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('---');
  }
}

// Test if server is running
async function checkServerStatus() {
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET',
      timeout: 3000
    });
    
    if (response.ok) {
      console.log('✅ Server is running on http://localhost:3000');
      return true;
    } else {
      console.log('⚠️ Server responded but with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('💡 Start the server with: cd dash-app && npm run dev');
    return false;
  }
}

async function main() {
  console.log('🚀 PHC Mobile Server Test\n');
  
  const serverRunning = await checkServerStatus();
  
  if (serverRunning) {
    await testServer();
  }
  
  console.log('\n✨ Test completed');
}

main().catch(console.error); 