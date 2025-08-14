import fetch from 'node-fetch';

const testConnection = async () => {
  console.log('🔍 Testing mobile app connection to server...\n');
  
  const endpoint = 'http://192.168.18.30:3000/api/mobile/auth/login';
  
  try {
    console.log(`📡 Testing endpoint: ${endpoint}`);
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
      
      console.log(`✅ Connection successful!`);
      console.log(`📊 Response time: ${responseTime}ms`);
      console.log(`📊 Status code: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Login successful: ${data.message}`);
        console.log(`👤 User: ${data.data?.user?.name}`);
        console.log(`🔑 Access Token: ${data.data?.accessToken ? '✅ Received' : '❌ Missing'}`);
        console.log(`🔄 Refresh Token: ${data.data?.refreshToken ? '✅ Received' : '❌ Missing'}`);
        
        console.log('\n🎉 Mobile app should now be able to connect successfully!');
        console.log('💡 If you\'re still getting timeout errors, try:');
        console.log('   1. Restart your mobile app (expo start --clear)');
        console.log('   2. Clear the app cache');
        console.log('   3. Make sure your mobile device is on the same WiFi network');
        console.log('   4. Try the login again with the updated configuration');
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
    
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    
    if (error.name === 'AbortError') {
      console.log('⏰ Timeout after 15 seconds');
      console.log('💡 Try restarting the server: cd dash-app && npm run dev');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('🚫 Connection refused - server may not be running');
      console.log('💡 Start the server: cd dash-app && npm run dev');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('🔍 Host not found - check network configuration');
    }
  }
};

// Run the test
testConnection().catch(console.error);
