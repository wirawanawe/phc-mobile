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
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return { success: response.ok, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async findBestServer() {
    const servers = [
      'http://192.168.193.150:3000', // Local development (primary)
      'http://localhost:3000', // Local development (fallback)
      'http://127.0.0.1:3000', // Local development (fallback)
      'http://10.0.2.2:3000', // Android emulator (fallback)
      'http://localhost:3000' // Local development (fallback)
    ];

    const fastest = (prev, current) => 
      current.responseTime < prev.responseTime ? current : prev;

    const results = await Promise.all(
      servers.map(async (server) => {
        const startTime = Date.now();
        try {
          const response = await fetch(`${server}/api/health`, {
            method: 'GET',
            timeout: 5000,
          });
          const endTime = Date.now();
          
          if (response.ok) {
            return {
              url: server,
              responseTime: endTime - startTime,
              success: true
            };
          }
        } catch (error) {
          // Continue to next server
        }
        return { url: server, responseTime: Infinity, success: false };
      })
    );

    const workingServers = results.filter(r => r.success);
    if (workingServers.length === 0) {
      throw new Error('No servers are reachable');
    }

    return `${workingServers.reduce(fastest).url}/api/mobile`;
  }

  static async testConnection(url) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${url}/api/mobile/health`, {
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
    // Temporary development mode - production server is down
    if (__DEV__) {
      return 'http://192.168.193.150:3000/api/mobile';
    }
    return 'http://localhost:3000/api/mobile';
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