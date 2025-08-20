const AsyncStorage = require('@react-native-async-storage/async-storage');

async function testAuthStatus() {
  try {
    console.log('🧪 Testing Authentication Status...');
    
    // Check if auth token exists
    const token = await AsyncStorage.getItem('authToken');
    console.log('📋 Auth Token exists:', !!token);
    
    if (token) {
      console.log('📋 Token length:', token.length);
      console.log('📋 Token preview:', token.substring(0, 20) + '...');
    }
    
    // Check if user data exists
    const userData = await AsyncStorage.getItem('userData');
    console.log('📋 User Data exists:', !!userData);
    
    if (userData) {
      const user = JSON.parse(userData);
      console.log('📋 User name:', user.name);
      console.log('📋 User email:', user.email);
    }
    
    // Check if refresh token exists
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    console.log('📋 Refresh Token exists:', !!refreshToken);
    
    console.log('\n✅ Authentication status check completed');
    
  } catch (error) {
    console.error('❌ Error checking auth status:', error);
  }
}

// Run the test
testAuthStatus();
