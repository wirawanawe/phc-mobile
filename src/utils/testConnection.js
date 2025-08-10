import { Platform } from 'react-native';

/**
 * Simple Connection Test
 * Tests if the mobile app can connect to the server
 */

export const testMobileConnection = async () => {
  const endpoints = [
    'https://dash.doctorphc.id/api/health',
    'http://localhost:3000/api/health',
    'http://127.0.0.1:3000/api/health'
  ];

  console.log('🔍 Testing mobile connection...');
  console.log('📱 Platform:', Platform.OS);

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      
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
      
      console.log(`✅ ${endpoint}: ${response.status} (${responseTime}ms)`);
      
      if (response.ok) {
        return {
          success: true,
          endpoint: endpoint.replace('/api/health', ''),
          responseTime
        };
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }

  throw new Error('No working endpoints found');
};

export const testApiConnection = async () => {
  try {
    const result = await testMobileConnection();
    console.log('✅ Mobile connection successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Mobile connection failed:', error.message);
    throw error;
  }
}; 