import { Platform } from 'react-native';

/**
 * Simple Connection Test
 * Tests if the mobile app can connect to the server
 */

export const testConnection = async () => {
  const testUrls = [
    'http://localhost:3000/api/mobile/health'
  ];

  const results = [];

  for (const url of testUrls) {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      results.push({
        url,
        success: response.ok,
        status: response.status,
        responseTime: endTime - startTime,
        message: response.ok ? 'Connection successful' : 'Connection failed'
      });
    } catch (error) {
      results.push({
        url,
        success: false,
        error: error.message,
        responseTime: 0,
        message: 'Connection error'
      });
    }
  }

  return results;
}; 