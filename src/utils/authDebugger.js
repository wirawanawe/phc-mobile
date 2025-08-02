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