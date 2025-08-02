import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    return { success: true, message: "All data cleared successfully" };
  } catch (error) {
    return { success: false, message: "Failed to clear data", error: error.message };
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userData');
    return { success: true, message: "Auth data cleared successfully" };
  } catch (error) {
    return { success: false, message: "Failed to clear auth data", error: error.message };
  }
};

export const forceReLogin = async () => {
  try {
    await clearAuthData();
    return { success: true, message: "Auth data cleared. User will need to login again." };
  } catch (error) {
    return { success: false, message: "Failed to force re-login", error: error.message };
  }
};

export const getStoredData = async () => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const userData = await AsyncStorage.getItem('userData');
    
    return {
      authToken,
      refreshToken,
      userData: userData ? JSON.parse(userData) : null
    };
  } catch (error) {
    return { success: false, message: "Failed to get stored data", error: error.message };
  }
};

export const debugAuthData = async () => {
  try {
    const data = await getStoredData();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    return { success: false, message: "Failed to debug auth data", error: error.message };
  }
}; 