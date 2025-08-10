import { Platform } from 'react-native';

/**
 * Connection Test Utility
 * Helps debug network connectivity issues
 */

export class ConnectionTest {
  static async testEndpoint(url, timeout = 10000) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      return {
        url,
        success: true,
        status: response.status,
        responseTime,
        message: 'Connection successful'
      };
    } catch (error) {
      return {
        url,
        success: false,
        error: error.message,
        errorType: error.name
      };
    }
  }

  static async testAllEndpoints() {
    const endpoints = [
      'https://dash.doctorphc.id/api/mobile/auth/me', // Production server (primary)
      'http://localhost:3000/api/mobile/auth/me', // Local development (fallback)
      'http://127.0.0.1:3000/api/mobile/auth/me', // Local development (fallback)
      'http://10.0.2.2:3000/api/mobile/auth/me', // Android emulator (fallback)
      'http://192.168.1.100:3000/api/mobile/auth/me' // Local network (fallback)
    ];

    console.log('🔍 Testing all endpoints...');
    
    const results = [];
    for (const endpoint of endpoints) {
      const result = await this.testEndpoint(endpoint);
      results.push(result);
      console.log(`${result.success ? '✅' : '❌'} ${endpoint}: ${result.success ? `${result.responseTime}ms` : result.error}`);
    }

    return results;
  }

  static async findBestEndpoint() {
    const results = await this.testAllEndpoints();
    const workingEndpoints = results.filter(r => r.success);
    
    if (workingEndpoints.length === 0) {
      throw new Error('No endpoints are reachable. Please check your network connection and server status.');
    }

    // Return the fastest endpoint
    const fastest = workingEndpoints.reduce((best, current) => 
      current.responseTime < best.responseTime ? current : best
    );

    return fastest.url.replace('/auth/me', '');
  }

  static async testLoginEndpoint(baseUrl) {
    const testData = {
      email: 'test@mobile.com',
      password: 'password123'
    };

    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        status: response.status,
        data: data,
        message: response.ok ? 'Login endpoint working' : 'Login endpoint failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Login endpoint error'
      };
    }
  }

  static getPlatformInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isEmulator: Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1',
      localhost: Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
    };
  }
}

export default ConnectionTest; 