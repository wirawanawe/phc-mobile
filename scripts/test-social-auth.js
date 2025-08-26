const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data
const googleTestData = {
  google_user_id: 'google_user_123',
  name: 'Test Google User',
  email: 'test@gmail.com',
  phone: null
};

const facebookTestData = {
  facebook_user_id: 'facebook_user_789',
  name: 'Test Facebook User',
  email: 'test@facebook.com',
  phone: '+6281234567890'
};

async function testGoogleAuth() {
  console.log('🧪 Testing Google Authentication...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/mobile/auth/google`, googleTestData);
    
    console.log('✅ Google Auth Response:', {
      success: response.data.success,
      message: response.data.message,
      user: {
        id: response.data.data?.user?.id,
        name: response.data.data?.user?.name,
        email: response.data.data?.user?.email
      },
      hasToken: !!response.data.data?.accessToken,
      isNewUser: response.data.data?.isNewUser
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Google Auth Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return null;
  }
}

async function testFacebookAuth() {
  console.log('🧪 Testing Facebook Authentication...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/mobile/auth/facebook`, facebookTestData);
    
    console.log('✅ Facebook Auth Response:', {
      success: response.data.success,
      message: response.data.message,
      user: {
        id: response.data.data?.user?.id,
        name: response.data.data?.user?.name,
        email: response.data.data?.user?.email
      },
      hasToken: !!response.data.data?.accessToken,
      isNewUser: response.data.data?.isNewUser
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Facebook Auth Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return null;
  }
}

async function testExistingUser() {
  console.log('🧪 Testing existing user login...');
  
  try {
    // Try to register the same user again
    const response = await axios.post(`${BASE_URL}/api/mobile/auth/google`, googleTestData);
    
    console.log('✅ Existing User Response:', {
      success: response.data.success,
      message: response.data.message,
      isNewUser: response.data.data?.isNewUser
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Existing User Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return null;
  }
}

async function testTokenValidation() {
  console.log('🧪 Testing token validation...');
  
  try {
    // First get a token
    const authResponse = await axios.post(`${BASE_URL}/api/mobile/auth/google`, googleTestData);
    
    if (authResponse.data.success && authResponse.data.data.accessToken) {
      const token = authResponse.data.data.accessToken;
      
      // Test the token with the /me endpoint
      const meResponse = await axios.get(`${BASE_URL}/api/mobile/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Token Validation Response:', {
        success: meResponse.data.success,
        user: {
          id: meResponse.data.data?.id,
          name: meResponse.data.data?.name,
          email: meResponse.data.data?.email
        }
      });
      
      return meResponse.data;
    } else {
      console.log('❌ No token received from auth');
      return null;
    }
  } catch (error) {
    console.error('❌ Token Validation Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Social Authentication Tests...\n');
  
  // Test Google Auth
  await testGoogleAuth();
  console.log('');
  
  // Test Facebook Auth
  await testFacebookAuth();
  console.log('');
  
  // Test existing user
  await testExistingUser();
  console.log('');
  
  // Test token validation
  await testTokenValidation();
  console.log('');
  
  console.log('🏁 Social Authentication Tests Completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testGoogleAuth,
  testFacebookAuth,
  testExistingUser,
  testTokenValidation,
  runAllTests
};
