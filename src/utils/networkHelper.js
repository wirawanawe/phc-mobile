import { Platform } from 'react-native';

/**
 * Network Helper Utility
 * Provides improved network connectivity and error handling for the mobile app
 */

export class NetworkHelper {
  static async testConnectivity(url, timeout = 10000) {
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
      
      return {
        success: true,
        responseTime: endTime - startTime,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.name
      };
    }
  }

  static async findBestServer() {
    const servers = [
      'http://10.242.90.103:3000', // Server IP from server.js
      'http://192.168.18.30:3000', // Local network IP
      'http://192.168.193.150:3000', // Local network IP
      'http://localhost:3000',
      'http://192.168.1.100:3000',
      'http://10.0.2.2:3000',
      'http://127.0.0.1:3000'
    ];

    const results = await Promise.all(
      servers.map(async (url) => {
        try {
          const startTime = Date.now();
          const response = await fetch(`${url}/api/health`, {
            method: 'GET',
            timeout: 5000,
          });
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          if (response.ok) {
            return { url, responseTime, success: true };
          } else {
            return { url, error: `HTTP ${response.status}`, success: false };
          }
        } catch (error) {
          return { url, error: error.message, success: false };
        }
      })
    );

    const workingServers = results.filter(result => result.success);
    
    if (workingServers.length === 0) {
      throw new Error('No servers are reachable');
    }

    const fastest = workingServers.reduce((prev, current) => 
      prev.responseTime < current.responseTime ? prev : current
    );

    return `${fastest.url}/api/mobile`;
  }

  static async testConnection(url) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        timeout: 5000,
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        return { success: true, responseTime };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static getDefaultURL() {
    if (__DEV__) {
      if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000/api/mobile';
      }
      if (Platform.OS === 'ios') {
        return 'http://10.242.90.103:3000/api/mobile';
      }
      return 'http://10.242.90.103:3000/api/mobile'; // Prioritize primary network interface for development
    }
    return 'https://your-api-domain.com/api/mobile';
  }

  static createTimeoutController(timeout = 15000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    return {
      controller,
      clearTimeout: () => clearTimeout(timeoutId)
    };
  }

  static handleNetworkError(error) {
    if (error.name === 'AbortError') {
      return {
        type: 'TIMEOUT',
        message: 'Request timeout. Please check your internet connection and try again.',
        shouldRetry: true
      };
    }

    if (error.message.includes('Network request failed') || 
        error.message.includes('fetch') || 
        error.message.includes('ENOTFOUND')) {
      return {
        type: 'NETWORK',
        message: 'Network connection failed. Please check your internet connection and ensure the server is running.',
        shouldRetry: true
      };
    }

    if (error.message.includes('Failed to fetch')) {
      return {
        type: 'NETWORK',
        message: 'Unable to connect to server. Please check your internet connection.',
        shouldRetry: true
      };
    }

    return {
      type: 'UNKNOWN',
      message: 'An unexpected network error occurred. Please try again.',
      shouldRetry: false
    };
  }

  static async retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

export default NetworkHelper; 