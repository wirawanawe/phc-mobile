import { Platform } from 'react-native';

/**
 * Simple Network Test Utility
 * Helps test network connectivity to different endpoints
 */

export const testNetworkConnectivity = async () => {
  const testEndpoints = [
    'http://192.168.18.30:3000/api/mobile/auth/login',
    'http://localhost:3000/api/mobile/auth/login',
    'http://127.0.0.1:3000/api/mobile/auth/login',
  ];

  console.log('🌐 Network Test: Starting connectivity tests...');
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      const startTime = Date.now();
      
      // Create a timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
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
        
        console.log(`✅ ${endpoint}: HTTP ${response.status} (${responseTime}ms)`);
        
        if (response.ok || response.status === 405) { // 405 Method Not Allowed is expected for GET on login
          return { success: true, endpoint, responseTime, status: response.status };
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
      
      // Handle specific timeout errors
      if (error.name === 'AbortError' || error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        console.log(`⏰ ${endpoint}: Connection timeout`);
      } else if (error.message.includes('Network request failed')) {
        console.log(`🌐 ${endpoint}: Network request failed`);
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log(`🚫 ${endpoint}: Connection refused`);
      }
    }
  }
  
  return { success: false, message: 'All endpoints failed' };
};

export const getBestEndpoint = async () => {
  const result = await testNetworkConnectivity();
  
  if (result.success) {
    // Extract base URL from successful endpoint
    const baseURL = result.endpoint.replace('/auth/login', '');
    console.log(`🎯 Best endpoint found: ${baseURL}`);
    return baseURL;
  }
  
  // Fallback to local IP address for mobile devices
  console.log('📱 Using local IP fallback endpoint');
  return 'http://192.168.18.30:3000/api/mobile';
}; 