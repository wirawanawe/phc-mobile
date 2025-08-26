const fetch = require('node-fetch');

async function loginTestUser() {
  try {
    console.log('🔐 Logging in with test user...');
    
    const baseURL = 'https://dash.doctorphc.id/api';
    
    // Login with test user
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('👤 Attempting login with:', loginData.email);
    
    const loginResponse = await fetch(`${baseURL}/mobile/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    const loginResult = await loginResponse.json();
    console.log('✅ Login response status:', loginResponse.status);
    console.log('🔐 Login result:', loginResult);
    
    if (loginResult.success && loginResult.data) {
      console.log('✅ Login successful!');
      console.log('👤 User:', loginResult.data.user.name);
      console.log('🆔 User ID:', loginResult.data.user.id);
      console.log('🎫 Token received');
      
      // Test authentication with token
      console.log('\n🔍 Testing authentication with token...');
      const authResponse = await fetch(`${baseURL}/mobile/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginResult.data.token}`
        }
      });
      
      const authData = await authResponse.json();
      console.log('✅ Auth test status:', authResponse.status);
      console.log('🔐 Auth test result:', authData);
      
      if (authData.success) {
        console.log('✅ Authentication working correctly!');
        console.log('💡 Now you can access mission screens in the mobile app');
        console.log('💡 Use these credentials in the mobile app:');
        console.log('   Email: test@example.com');
        console.log('   Password: password123');
      } else {
        console.log('❌ Authentication test failed');
      }
      
    } else {
      console.log('❌ Login failed:', loginResult.message);
    }
    
  } catch (error) {
    console.error('❌ Error in login test:', error);
  }
}

// Run the test
loginTestUser().then(() => {
  console.log('🏁 Login test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Login test failed:', error);
  process.exit(1);
}); 