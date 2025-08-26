import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundServiceManager from './backgroundServiceManager';

/**
 * Emergency Stop Services Utility
 * 
 * This utility provides emergency functions to stop all background services
 * and clear authentication data when authentication errors occur.
 */

class EmergencyStopServices {
  /**
   * Emergency stop all services and clear auth data
   */
  static async emergencyStop() {
    console.log('🚨 EMERGENCY STOP: Stopping all services and clearing auth data...');
    
    try {
      // Stop all background services first
      await BackgroundServiceManager.stopAllServices();
      console.log('✅ Emergency Stop: Background services stopped');
      
      // Clear all authentication data
      await AsyncStorage.multiRemove([
        'authToken',
        'refreshToken',
        'userData',
        'userId'
      ]);
      console.log('✅ Emergency Stop: Authentication data cleared');
      
      // Clear any other cached data
      await AsyncStorage.multiRemove([
        'lastSyncTime',
        'cachedUserData',
        'appSettings'
      ]);
      console.log('✅ Emergency Stop: Cached data cleared');
      
      console.log('🎯 Emergency Stop: All services stopped and data cleared');
      console.log('💡 Next: Restart the app and login again');
      
      return {
        success: true,
        message: 'Emergency stop completed successfully'
      };
    } catch (error) {
      console.error('❌ Emergency Stop Error:', error);
      return {
        success: false,
        message: 'Emergency stop failed: ' + error.message
      };
    }
  }
  
  /**
   * Stop only background services (keep auth data)
   */
  static async stopServicesOnly() {
    console.log('🛑 EMERGENCY STOP: Stopping background services only...');
    
    try {
      await BackgroundServiceManager.stopAllServices();
      console.log('✅ Emergency Stop: Background services stopped');
      
      return {
        success: true,
        message: 'Background services stopped successfully'
      };
    } catch (error) {
      console.error('❌ Emergency Stop Error:', error);
      return {
        success: false,
        message: 'Failed to stop services: ' + error.message
      };
    }
  }
  
  /**
   * Clear only authentication data (keep services running)
   */
  static async clearAuthOnly() {
    console.log('🧹 EMERGENCY STOP: Clearing authentication data only...');
    
    try {
      await AsyncStorage.multiRemove([
        'authToken',
        'refreshToken',
        'userData',
        'userId'
      ]);
      console.log('✅ Emergency Stop: Authentication data cleared');
      
      return {
        success: true,
        message: 'Authentication data cleared successfully'
      };
    } catch (error) {
      console.error('❌ Emergency Stop Error:', error);
      return {
        success: false,
        message: 'Failed to clear auth data: ' + error.message
      };
    }
  }
  
  /**
   * Get current status of services and auth data
   */
  static async getStatus() {
    console.log('📊 EMERGENCY STOP: Getting current status...');
    
    try {
      const serviceStatus = BackgroundServiceManager.getServiceStatus();
      const authToken = await AsyncStorage.getItem('authToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userData = await AsyncStorage.getItem('userData');
      
      const status = {
        services: serviceStatus,
        auth: {
          hasAuthToken: !!authToken,
          hasRefreshToken: !!refreshToken,
          hasUserData: !!userData
        }
      };
      
      console.log('📊 Status:', status);
      return status;
    } catch (error) {
      console.error('❌ Error getting status:', error);
      return {
        error: error.message
      };
    }
  }
}

export default EmergencyStopServices;
