import AsyncStorage from '@react-native-async-storage/async-storage';

// Debug authentication data
export const debugAuth = async () => {
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
export const clearAuth = async () => {
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

// Clear all app data
export const clearAll = async () => {
  try {
    console.log('🧹 Clearing all app data...');
    
    const keys = await AsyncStorage.getAllKeys();
    if (keys.length > 0) {
      await AsyncStorage.multiRemove(keys);
    }
    
    console.log('✅ All app data cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing all app data:', error);
    return false;
  }
};

// Check token format
export const checkTokens = async () => {
  try {
    console.log('🔍 Checking token format...');
    
    const authToken = await AsyncStorage.getItem('authToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (authToken) {
      const parts = authToken.split('.');
      console.log('- Auth Token parts:', parts.length);
      if (parts.length === 3) {
        console.log('- Auth Token format: Valid JWT');
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('- Auth Token payload:', payload);
        } catch (e) {
          console.log('- Auth Token payload: Invalid JSON');
        }
      } else {
        console.log('- Auth Token format: Invalid');
      }
    }
    
    if (refreshToken) {
      const parts = refreshToken.split('.');
      console.log('- Refresh Token parts:', parts.length);
      if (parts.length === 3) {
        console.log('- Refresh Token format: Valid JWT');
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('- Refresh Token payload:', payload);
        } catch (e) {
          console.log('- Refresh Token payload: Invalid JSON');
        }
      } else {
        console.log('- Refresh Token format: Invalid');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking tokens:', error);
    return false;
  }
};

// Force re-login
export const forceReLogin = async () => {
  try {
    console.log('🔄 Forcing re-login...');
    
    const cleared = await clearAuth();
    
    if (cleared) {
      console.log('✅ Re-login ready. User should login again.');
      return true;
    } else {
      console.log('❌ Failed to clear auth data');
      return false;
    }
  } catch (error) {
    console.error('❌ Error forcing re-login:', error);
    return false;
  }
};

// Export all functions for easy access
export default {
  debugAuth,
  clearAuth,
  clearAll,
  checkTokens,
  forceReLogin
};

