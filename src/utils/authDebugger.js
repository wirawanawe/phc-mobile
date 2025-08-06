import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Authentication Debugger Utility
 * 
 * This utility can be run from the React Native debugger console to help
 * debug authentication issues.
 * 
 * Usage:
 * 1. Open React Native debugger
 * 2. In the console, type: require('./src/utils/authDebugger.js').debugAuth()
 */

export const debugAuth = async () => {
  try {
    // Get stored data
    const authToken = await AsyncStorage.getItem('authToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const userData = await AsyncStorage.getItem('userData');
    
    let user = null;
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        // Invalid JSON
      }
    }
    
    const result = {
      authToken: authToken ? `${authToken.substring(0, 20)}...` : null,
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
      userData: user,
      hasAuthToken: !!authToken,
      hasRefreshToken: !!refreshToken,
      hasUserData: !!userData
    };
    
    return result;
  } catch (error) {
    return { error: error.message };
  }
};

export const clearAuth = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userData');
    return { success: true, message: "Authentication data cleared successfully" };
  } catch (error) {
    return { success: false, message: "Failed to clear auth data", error: error.message };
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    return { success: true, message: "All data cleared successfully" };
  } catch (error) {
    return { success: false, message: "Failed to clear all data", error: error.message };
  }
};

export const checkTokens = async () => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    const authTokenParts = authToken ? authToken.split('.') : [];
    const refreshTokenParts = refreshToken ? refreshToken.split('.') : [];
    
    return {
      authTokenValid: authTokenParts.length === 3,
      refreshTokenValid: refreshTokenParts.length === 3,
      authTokenLength: authToken ? authToken.length : 0,
      refreshTokenLength: refreshToken ? refreshToken.length : 0
    };
  } catch (error) {
    return { error: error.message };
  }
};

export const debugMealTracking = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    const authToken = await AsyncStorage.getItem('authToken');
    
    let user = null;
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        // Invalid JSON
      }
    }
    
    const result = {
      userData: user,
      authToken: authToken ? `${authToken.substring(0, 20)}...` : null,
      hasUserData: !!userData,
      hasAuthToken: !!authToken
    };
    
    if (user) {
      result.userId = user.id;
      result.userName = user.name;
      result.userEmail = user.email;
    }
    
    return result;
  } catch (error) {
    return { error: error.message };
  }
};

// New comprehensive authentication fix function
export const fixAuthentication = async () => {
  try {
    console.log('🔧 Starting authentication fix...');
    
    // Get current auth state
    const authToken = await AsyncStorage.getItem('authToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const userData = await AsyncStorage.getItem('userData');
    
    console.log('📊 Current auth state:', {
      hasAuthToken: !!authToken,
      hasRefreshToken: !!refreshToken,
      hasUserData: !!userData
    });
    
    // If we have user data but no tokens, try to login again
    if (userData && (!authToken || !refreshToken)) {
      console.log('🔄 Found user data but missing tokens, attempting re-login...');
      
      try {
        const user = JSON.parse(userData);
        if (user.email) {
          // Try to login with stored credentials (if available)
          const storedPassword = await AsyncStorage.getItem('storedPassword');
          if (storedPassword) {
            console.log('🔄 Attempting re-login with stored credentials...');
            // You would need to import your API service here
            // const response = await apiService.login(user.email, storedPassword);
            // if (response.success) {
            //   console.log('✅ Re-login successful');
            //   return { success: true, message: 'Re-login successful' };
            // }
          }
        }
      } catch (e) {
        console.log('❌ Error parsing user data:', e.message);
      }
    }
    
    // If we have tokens but no user data, clear tokens
    if ((authToken || refreshToken) && !userData) {
      console.log('🔄 Found tokens but no user data, clearing tokens...');
      await clearAuth();
      return { success: true, message: 'Cleared invalid tokens' };
    }
    
    // If we have everything, validate tokens
    if (authToken && refreshToken && userData) {
      console.log('✅ All auth data present, validating...');
      const tokenCheck = await checkTokens();
      if (!tokenCheck.authTokenValid || !tokenCheck.refreshTokenValid) {
        console.log('❌ Invalid token format, clearing...');
        await clearAuth();
        return { success: true, message: 'Cleared invalid tokens' };
      }
      return { success: true, message: 'Authentication data appears valid' };
    }
    
    // If we have nothing, that's fine for a fresh start
    if (!authToken && !refreshToken && !userData) {
      console.log('ℹ️ No authentication data found, ready for fresh login');
      return { success: true, message: 'No auth data found, ready for login' };
    }
    
    return { success: true, message: 'Authentication fix completed' };
    
  } catch (error) {
    console.error('❌ Authentication fix failed:', error);
    return { success: false, error: error.message };
  }
};

// Test authentication with backend
export const testAuthentication = async () => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) {
      return { success: false, message: 'No auth token found' };
    }
    
    // Test the token with the backend
    const response = await fetch('http://10.242.90.103:3000/api/mobile/auth/test-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ token: authToken })
    });
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}; 