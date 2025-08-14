import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear all authentication data
export const clearAuthData = async () => {
  try {
    console.log('🧹 Clearing authentication data...');
    
    // Clear all auth-related storage
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

// Clear all app data (nuclear option)
export const clearAllAppData = async () => {
  try {
    console.log('🧹 Clearing all app data...');
    
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Remove all keys
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

// Debug function to check current auth status
export const debugAuthData = async () => {
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

// Force re-login by clearing auth data
export const forceReLogin = async () => {
  try {
    console.log('🔄 Forcing re-login...');
    
    // Clear auth data
    const cleared = await clearAuthData();
    
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

// Check if user needs to re-login
export const needsReLogin = async () => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    const userData = await AsyncStorage.getItem('userData');
    
    // If no token or user data, needs re-login
    if (!authToken || !userData) {
      return true;
    }
    
    // Check if user data is valid JSON
    try {
      JSON.parse(userData);
    } catch {
      // Invalid JSON, needs re-login
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking re-login status:', error);
    return true; // Assume needs re-login on error
  }
}; 