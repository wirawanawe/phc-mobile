import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

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
      'userId'
    ]);
    
    console.log('✅ Authentication data cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    return false;
  }
};

// Force re-login by clearing auth and showing alert
const forceReLogin = async (navigation) => {
  try {
    console.log('🔄 Forcing re-login...');
    
    // Clear auth data first
    await clearAuth();
    
    // Show alert to user
    Alert.alert(
      '🔐 Authentication Reset',
      'Authentication data has been cleared. Please login again.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to login screen
            if (navigation) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        }
      ],
      { cancelable: false }
    );
    
    return true;
  } catch (error) {
    console.error('❌ Error forcing re-login:', error);
    return false;
  }
};

// Check and fix auth issues
const checkAndFixAuth = async (navigation) => {
  try {
    console.log('🔧 Checking and fixing auth issues...');
    
    const authStatus = await debugAuth();
    
    if (authStatus && authStatus.hasAuthToken) {
      // Check if token is expired
      const authToken = await AsyncStorage.getItem('authToken');
      if (authToken) {
        try {
          const parts = authToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            const exp = payload.exp;
            const now = Math.floor(Date.now() / 1000);
            
            if (exp < now) {
              console.log('⚠️ Token is expired, clearing auth data');
              await forceReLogin(navigation);
              return { fixed: true, reason: 'Token expired' };
            }
          }
        } catch (e) {
          console.log('⚠️ Could not parse token, clearing auth data');
          await forceReLogin(navigation);
          return { fixed: true, reason: 'Invalid token format' };
        }
      }
    }
    
    return { fixed: false, reason: 'No issues found' };
  } catch (error) {
    console.error('❌ Error checking auth issues:', error);
    return { fixed: false, reason: 'Error occurred' };
  }
};

export default {
  debugAuth,
  clearAuth,
  forceReLogin,
  checkAndFixAuth
};
