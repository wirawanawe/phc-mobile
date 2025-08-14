const AsyncStorage = require('@react-native-async-storage/async-storage');

// Debug authentication data
const debugAuth = async () => {
  try {
    console.log('🔍 Debugging authentication data...');
    
    const authToken = await AsyncStorage.getItem('authToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const userData = await AsyncStorage.getItem('userData');
    const userId = await AsyncStorage.getItem('userId');
    
    console.log('📊 Current Auth Status:');
    console.log('- Auth Token:', authToken ? 'Present' : 'Missing');
    console.log('- Refresh Token:', refreshToken ? 'Present' : 'Missing');
    console.log('- User Data:', userData ? 'Present' : 'Missing');
    console.log('- User ID:', userId || 'Missing');
    
    if (authToken) {
      console.log('- Token Preview:', authToken.substring(0, 20) + '...');
      
      // Check if token is expired
      try {
        const parts = authToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          const exp = payload.exp;
          const now = Math.floor(Date.now() / 1000);
          
          console.log('- Token expiration:', new Date(exp * 1000).toISOString());
          console.log('- Current time:', new Date(now * 1000).toISOString());
          console.log('- Token expired:', exp < now ? 'YES' : 'NO');
        }
      } catch (e) {
        console.log('- Could not parse token payload');
      }
    }
    
    return {
      hasAuthToken: !!authToken,
      hasRefreshToken: !!refreshToken,
      hasUserData: !!userData,
      hasUserId: !!userId
    };
  } catch (error) {
    console.error('❌ Error debugging auth data:', error);
    return null;
  }
};

// Clear authentication data
const clearAuth = async () => {
  try {
    console.log('🧹 Clearing authentication data...');
    
    await AsyncStorage.multiRemove([
      'authToken',
      'refreshToken',
      'userData',
      'userId',
      'lastLoginTime'
    ]);
    
    console.log('✅ Authentication data cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🔐 PHC Mobile Authentication Fix Tool');
  console.log('=====================================');
  
  // First, debug current auth status
  console.log('\n1. Checking current authentication status...');
  const authStatus = await debugAuth();
  
  if (authStatus && authStatus.hasAuthToken) {
    console.log('\n2. Authentication data found. Clearing...');
    const cleared = await clearAuth();
    
    if (cleared) {
      console.log('\n✅ SUCCESS: Authentication data cleared!');
      console.log('\n📱 Next steps:');
      console.log('1. Restart your React Native app');
      console.log('2. You will be redirected to the login screen');
      console.log('3. Login with your credentials again');
      console.log('4. The weekly progress should now load without errors');
    } else {
      console.log('\n❌ FAILED: Could not clear authentication data');
    }
  } else {
    console.log('\nℹ️ No authentication data found. User may already be logged out.');
  }
  
  console.log('\n🔍 Final auth status:');
  await debugAuth();
};

// Run the script
main().catch(console.error);
