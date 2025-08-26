import { Platform } from 'react-native';

// Simple network test utility
export const testNetworkConnectivity = async () => {
  const testUrls = [
    'http://192.168.193.150:3000/api/mobile/test-connection'
  ];

  console.log('🔍 Network Test: Starting connectivity test...');
  console.log('🔍 Network Test: Platform:', Platform.OS);
  console.log('🔍 Network Test: Development mode:', __DEV__);

  for (const url of testUrls) {
    try {
      console.log(`🌐 Network Test: Testing ${url}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
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
      
      if (response.ok) {
        console.log(`✅ Network Test: SUCCESS - ${url} (${responseTime}ms)`);
        return { success: true, url, responseTime };
      } else {
        console.log(`⚠️ Network Test: HTTP ${response.status} - ${url}`);
      }
    } catch (error) {
      console.log(`❌ Network Test: FAILED - ${url} - ${error.message}`);
    }
  }
  
  console.log('❌ Network Test: All URLs failed');
  return { success: false, error: 'No working connection found' };
};

// Get the best available URL for the current platform
export const getBestEndpoint = async () => {
  // Temporary development mode - production server is down
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://192.168.193.150:3000/api/mobile';
    }
    
    if (Platform.OS === 'ios') {
      return 'http://localhost:3000/api/mobile';
    }
    
    const testResult = await testNetworkConnectivity();
    if (testResult.success) {
      return testResult.url.replace('/api/mobile/health', '/api/mobile');
    }
  }
  
  return 'http://localhost:3000/api/mobile';
}; 