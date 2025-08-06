import { Platform } from 'react-native';

/**
 * Enhanced Connection Debugger Utility
 * Helps diagnose server connection issues with better error handling
 */

export class ConnectionDebugger {
  static async testServerConnection() {
    console.log('🔍 Testing server connection...');
    
    // Prioritize endpoints based on platform and known working servers
    const endpoints = this.getPrioritizedEndpoints();
    
    const results = [];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing: ${endpoint}`);
        
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced timeout to 5 seconds
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const result = {
          endpoint,
          success: true,
          status: response.status,
          responseTime,
          message: 'Connection successful'
        };
        
        console.log(`✅ ${endpoint}: ${response.status} (${responseTime}ms)`);
        results.push(result);
        
        // If we found a working endpoint, we can stop testing
        if (response.ok) {
          console.log(`✅ Found working endpoint: ${endpoint}`);
          break;
        }
        
      } catch (error) {
        const result = {
          endpoint,
          success: false,
          error: error.message,
          errorType: error.name,
          message: this.getErrorMessage(error)
        };
        
        console.log(`❌ ${endpoint}: ${error.message}`);
        results.push(result);
      }
    }

    return results;
  }

  static getPrioritizedEndpoints() {
    const platform = Platform.OS;
    
    // Prioritize endpoints based on platform and known working servers
    if (platform === 'android') {
      return [
        'http://10.242.90.103:3000/api/health', // Known working server
        'http://10.0.2.2:3000/api/health',      // Android emulator
        'http://localhost:3000/api/health'       // Fallback
      ];
    } else if (platform === 'ios') {
      return [
        'http://10.242.90.103:3000/api/health', // Known working server
        'http://localhost:3000/api/health',      // iOS simulator
        'http://127.0.0.1:3000/api/health'      // Fallback
      ];
    } else {
      // Default for other platforms
      return [
        'http://10.242.90.103:3000/api/health', // Known working server
        'http://localhost:3000/api/health'       // Fallback
      ];
    }
  }

  static getErrorMessage(error) {
    if (error.name === 'AbortError') {
      return 'Connection timeout';
    } else if (error.message.includes('Network request failed')) {
      return 'Network connection failed';
    } else if (error.message.includes('fetch')) {
      return 'Unable to reach server';
    } else if (error.message.includes('ENOTFOUND')) {
      return 'Server not found';
    } else if (error.message.includes('ECONNREFUSED')) {
      return 'Connection refused by server';
    } else {
      return error.message;
    }
  }

  static getPlatformInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isPad: Platform.isPad,
      isTV: Platform.isTV,
      isTesting: Platform.isTesting,
      constants: Platform.constants
    };
  }

  static async diagnoseFullConnection() {
    console.log('🔍 Starting full connection diagnosis...');
    
    const platformInfo = this.getPlatformInfo();
    console.log('📱 Platform info:', platformInfo);
    
    const connectionResults = await this.testServerConnection();
    
    const summary = {
      platform: platformInfo,
      totalEndpoints: connectionResults.length,
      workingEndpoints: connectionResults.filter(r => r.success).length,
      failedEndpoints: connectionResults.filter(r => !r.success).length,
      results: connectionResults,
      recommendations: this.generateRecommendations(connectionResults, platformInfo)
    };
    
    console.log('📊 Connection Summary:', {
      total: summary.totalEndpoints,
      working: summary.workingEndpoints,
      failed: summary.failedEndpoints
    });
    
    return summary;
  }

  static generateRecommendations(results, platformInfo) {
    const recommendations = [];
    
    const workingCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    
    if (workingCount === 0) {
      recommendations.push({
        type: 'critical',
        message: 'No endpoints are reachable. Please check your network connection and server status.',
        action: 'Check server is running and network connectivity'
      });
    } else if (workingCount < results.length) {
      recommendations.push({
        type: 'warning',
        message: 'Some endpoints are unreachable. Using available endpoints.',
        action: 'Consider checking network configuration'
      });
    }
    
    // Platform-specific recommendations
    if (platformInfo.platform === 'android') {
      if (failedCount > 0) {
        recommendations.push({
          type: 'info',
          message: 'Android emulator detected. Using appropriate endpoints.',
          action: 'Consider using 10.0.2.2 for Android emulator'
        });
      }
    } else if (platformInfo.platform === 'ios') {
      if (failedCount > 0) {
        recommendations.push({
          type: 'info',
          message: 'iOS simulator detected. Using localhost endpoints.',
          action: 'Consider using localhost for iOS simulator'
        });
      }
    }
    
    return recommendations;
  }

  static async findWorkingEndpoint() {
    const results = await this.testServerConnection();
    const workingEndpoints = results.filter(r => r.success);
    
    if (workingEndpoints.length === 0) {
      const diagnosis = await this.diagnoseFullConnection();
      throw new Error(`No endpoints are reachable. ${diagnosis.recommendations[0]?.message || 'Please check your network connection and server status.'}`);
    }

    // Return the fastest endpoint
    const fastest = workingEndpoints.reduce((best, current) => 
      current.responseTime < best.responseTime ? current : best
    );

    const baseUrl = fastest.endpoint.replace('/api/health', '').replace('/api/mobile/auth/me', '');
    console.log(`✅ Best endpoint found: ${baseUrl} (${fastest.responseTime}ms)`);
    
    return baseUrl;
  }

  static async testEndpointHealth(endpoint) {
    try {
      console.log(`🔍 Testing endpoint health: ${endpoint}`);
      
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${endpoint}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          responseTime,
          status: response.status,
          data
        };
      } else {
        return {
          success: false,
          status: response.status,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.name
      };
    }
  }

  static async getConnectionStatus() {
    try {
      const results = await this.testServerConnection();
      const workingCount = results.filter(r => r.success).length;
      
      if (workingCount === 0) {
        return {
          status: 'disconnected',
          message: 'No server connection available',
          canRetry: true
        };
      } else if (workingCount === results.length) {
        return {
          status: 'connected',
          message: 'All endpoints working',
          canRetry: false
        };
      } else {
        return {
          status: 'partial',
          message: `${workingCount}/${results.length} endpoints working`,
          canRetry: true
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Connection test failed',
        error: error.message,
        canRetry: true
      };
    }
  }
}

export default ConnectionDebugger; 