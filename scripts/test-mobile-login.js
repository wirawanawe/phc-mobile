import fetch from 'node-fetch';

const testMobileLogin = async () => {
  const endpoints = [
    'http://localhost:3000/api/mobile/auth/login',
    'http://127.0.0.1:3000/api/mobile/auth/login',
    'http://10.0.2.2:3000/api/mobile/auth/login'
  ];

  console.log('🧪 Testing mobile login endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@mobile.com',
            password: 'password123'
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`✅ Status: ${response.status} (${responseTime}ms)`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Login successful: ${data.message}`);
          console.log(`✅ User: ${data.data?.user?.name}`);
          console.log(`✅ Token: ${data.data?.accessToken ? 'Received' : 'Missing'}`);
          console.log(`✅ Refresh Token: ${data.data?.refreshToken ? 'Received' : 'Missing'}`);
        } else {
          const errorText = await response.text();
          console.log(`❌ Error: ${response.status} - ${errorText}`);
        }
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      
      if (error.name === 'AbortError') {
        console.log(`⏰ Timeout after 15 seconds`);
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log(`🚫 Connection refused - server may not be running`);
      } else if (error.message.includes('ENOTFOUND')) {
        console.log(`🔍 Host not found - check network configuration`);
      }
    }
    
    console.log(''); // Empty line for readability
  }
};

// Run the test
testMobileLogin().catch(console.error);
