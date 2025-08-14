import { Platform } from 'react-native';

/**
 * Network Diagnostic Utility
 * Helps debug network connectivity issues in the mobile app
 */

export class NetworkDiagnostic {
  static async testAllEndpoints() {
    const endpoints = [
      'https://dash.doctorphc.id/api/mobile/auth/me'
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
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
        
        results.push(result);
        
      } catch (error) {
        const result = {
          endpoint,
          success: false,
          error: error.message,
          errorType: error.name
        };
        
        results.push(result);
      }
    }

    return results;
  }

  static async getBestEndpoint() {
    const results = await this.testAllEndpoints();
    const workingEndpoints = results.filter(r => r.success);
    
    if (workingEndpoints.length === 0) {
      throw new Error('No endpoints are reachable. Please check your network connection and server status.');
    }

    // Return the fastest endpoint
    const fastest = workingEndpoints.reduce((best, current) => 
      current.responseTime < best.responseTime ? current : best
    );

    return fastest.endpoint.replace('/mobile/auth/me', '');
  }

  static async diagnoseConnection() {
    const endpoints = [
      'http://localhost:3000',
      'http://192.168.1.100:3000',
      'http://10.0.2.2:3000',
      'http://127.0.0.1:3000'
    ];

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const startTime = Date.now();
          const response = await fetch(`${endpoint}/health`, {
            method: 'GET',
            timeout: 5000,
          });
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          if (response.ok) {
            return { endpoint, responseTime, success: true };
          } else {
            return { endpoint, error: `HTTP ${response.status}`, success: false };
          }
        } catch (error) {
          return { endpoint, error: error.message, success: false };
        }
      })
    );

    const workingEndpoints = results.filter(result => result.success);
    
    if (workingEndpoints.length === 0) {
      return {
        status: 'FAILED',
        message: 'No endpoints are reachable',
        bestEndpoint: null,
        workingCount: 0,
        totalCount: endpoints.length
      };
    }

    const fastest = workingEndpoints.reduce((prev, current) => 
      prev.responseTime < current.responseTime ? prev : current
    );

    return {
      status: 'SUCCESS',
      message: 'Connection established',
      bestEndpoint: fastest.endpoint,
      workingCount: workingEndpoints.length,
      totalCount: endpoints.length,
      responseTime: fastest.responseTime
    };
  }

  static getPlatformSpecificInfo() {
    const info = {
      platform: Platform.OS,
      isDev: __DEV__,
      recommendations: []
    };

    if (Platform.OS === 'android') {
      info.recommendations.push(
        'For Android emulator, use 10.0.2.2:3000',
        'For physical device, use your computer\'s IP address'
      );
    } else if (Platform.OS === 'ios') {
      info.recommendations.push(
        'For iOS simulator, use localhost:3000',
        'For physical device, use your computer\'s IP address'
      );
    }

    return info;
  }
}

export default NetworkDiagnostic; 