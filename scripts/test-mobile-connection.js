const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testServerConnection() {
  console.log('🔍 Testing server connection...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/mobile/health`);
    console.log('✅ Server is running:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    return false;
  }
}

async function testSocialAuthEndpoints() {
  console.log('\n🧪 Testing social auth endpoints...');
  
  const testData = {
    google_user_id: 'mobile_test_google_123',
    name: 'Mobile Test User',
    email: 'mobile.test@gmail.com',
    phone: '+6281234567890'
  };

  try {
    // Test Google auth
    const googleResponse = await axios.post(`${BASE_URL}/api/mobile/auth/google`, testData);
    console.log('✅ Google auth working:', {
      success: googleResponse.data.success,
      message: googleResponse.data.message,
      userId: googleResponse.data.data?.user?.id
    });

    // Test Facebook auth
    const facebookData = {
      ...testData,
      facebook_user_id: 'mobile_test_facebook_456',
      email: 'mobile.test@facebook.com'
    };
    
    const facebookResponse = await axios.post(`${BASE_URL}/api/mobile/auth/facebook`, facebookData);
    console.log('✅ Facebook auth working:', {
      success: facebookResponse.data.success,
      message: facebookResponse.data.message,
      userId: facebookResponse.data.data?.user?.id
    });

    return true;
  } catch (error) {
    console.error('❌ Social auth test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testTokenValidation() {
  console.log('\n🔐 Testing token validation...');
  
  try {
    // First get a token
    const authResponse = await axios.post(`${BASE_URL}/api/mobile/auth/google`, {
      google_user_id: 'token_test_123',
      name: 'Token Test User',
      email: 'token.test@gmail.com',
      phone: '+6281234567890'
    });

    if (authResponse.data.success && authResponse.data.data.accessToken) {
      const token = authResponse.data.data.accessToken;
      
      // Test token with /me endpoint
      const meResponse = await axios.get(`${BASE_URL}/api/mobile/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Token validation working:', {
        success: meResponse.data.success,
        userId: meResponse.data.data?.id,
        email: meResponse.data.data?.email
      });
      
      return true;
    } else {
      console.log('❌ No token received');
      return false;
    }
  } catch (error) {
    console.error('❌ Token validation failed:', error.response?.data || error.message);
    return false;
  }
}

async function runMobileTests() {
  console.log('🚀 Starting Mobile Connection Tests...\n');
  
  const serverOk = await testServerConnection();
  if (!serverOk) {
    console.log('❌ Server is not running. Please start the server first.');
    return;
  }
  
  const socialAuthOk = await testSocialAuthEndpoints();
  const tokenOk = await testTokenValidation();
  
  console.log('\n📊 Test Results:');
  console.log(`Server Connection: ${serverOk ? '✅' : '❌'}`);
  console.log(`Social Auth: ${socialAuthOk ? '✅' : '❌'}`);
  console.log(`Token Validation: ${tokenOk ? '✅' : '❌'}`);
  
  if (serverOk && socialAuthOk && tokenOk) {
    console.log('\n🎉 All tests passed! Mobile app should work properly.');
    console.log('\n📱 Next steps:');
    console.log('1. Start the mobile app with: npx expo start');
    console.log('2. Test the social login buttons in the app');
    console.log('3. Verify that users can login with Google/Facebook');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runMobileTests().catch(console.error);
}

module.exports = {
  testServerConnection,
  testSocialAuthEndpoints,
  testTokenValidation,
  runMobileTests
};
