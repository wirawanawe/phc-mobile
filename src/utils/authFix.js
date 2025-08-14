import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Authentication Fix Utility
export const authFix = {
  // Debug current authentication status
  debugAuth: async () => {
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
            const payload = JSON.parse(atob(parts[1]));
            const exp = payload.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            
            console.log('- Token Expiration:', new Date(exp).toISOString());
            console.log('- Current Time:', new Date(now).toISOString());
            console.log('- Token Expired:', now > exp ? 'YES' : 'NO');
            
            if (now > exp) {
              console.log('⚠️ Token is expired! This is likely causing the authentication errors.');
            }
          }
        } catch (e) {
          console.log('- Token format: Invalid JWT');
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
  },

  // Clear authentication data
  clearAuth: async () => {
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
      console.log('🔄 Please login again to continue');
      
      return true;
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      return false;
    }
  },

  // Force re-login
  forceReLogin: async () => {
    try {
      console.log('🔄 Forcing re-login...');
      
      const cleared = await authFix.clearAuth();
      
      if (cleared) {
        console.log('✅ Re-login ready. User should login again.');
        
        // Show alert to user
        Alert.alert(
          '🔐 Authentication Reset',
          'Your session has been reset. Please login again to continue.',
          [
            {
              text: 'OK',
              onPress: () => {
                // The app should automatically redirect to login
                console.log('User acknowledged re-login requirement');
              }
            }
          ]
        );
        
        return true;
      } else {
        console.log('❌ Failed to clear auth data');
        return false;
      }
    } catch (error) {
      console.error('❌ Error forcing re-login:', error);
      return false;
    }
  },

  // Check and fix authentication issues
  checkAndFix: async () => {
    try {
      console.log('🔍 Checking and fixing authentication issues...');
      
      const authStatus = await authFix.debugAuth();
      
      if (!authStatus) {
        console.log('❌ Could not check auth status');
        return false;
      }
      
      // If no auth token, user needs to login
      if (!authStatus.hasAuthToken) {
        console.log('ℹ️ No auth token found - user needs to login');
        return true;
      }
      
      // Check if token is expired
      const authToken = await AsyncStorage.getItem('authToken');
      if (authToken) {
        try {
          const parts = authToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const exp = payload.exp * 1000;
            const now = Date.now();
            
            if (now > exp) {
              console.log('⚠️ Token is expired, clearing auth data...');
              await authFix.clearAuth();
              return true;
            }
          }
        } catch (e) {
          console.log('⚠️ Invalid token format, clearing auth data...');
          await authFix.clearAuth();
          return true;
        }
      }
      
      console.log('✅ Authentication appears to be valid');
      return true;
    } catch (error) {
      console.error('❌ Error checking and fixing auth:', error);
      return false;
    }
  }
};

// Export for easy access in React Native debugger
export default authFix;
