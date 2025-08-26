import { Platform } from 'react-native';

// Simple network status utility
export const checkNetworkStatus = async () => {
  const status = {
    platform: Platform.OS,
    isDev: __DEV__,
    timestamp: new Date().toISOString(),
    tests: []
  };

  const testUrls = [
    'http://10.242.90.103:3000/api/mobile/test-connection'
  ];

  console.log('🔍 Network Status: Starting network diagnostics...');
  console.log('🔍 Network Status: Platform:', Platform.OS);
  console.log('🔍 Network Status: Development mode:', __DEV__);

  for (const url of testUrls) {
    const testResult = {
      url,
      success: false,
      responseTime: null,
      error: null,
      statusCode: null
    };

    try {
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      testResult.success = true;
      testResult.responseTime = endTime - startTime;
      testResult.statusCode = response.status;
      
      console.log(`✅ Network Status: ${url} - HTTP ${response.status} (${testResult.responseTime}ms)`);
    } catch (error) {
      testResult.error = error.message;
      console.log(`❌ Network Status: ${url} - ${error.message}`);
    }
    
    status.tests.push(testResult);
  }

  // Determine best working URL
  const workingTests = status.tests.filter(test => test.success);
  if (workingTests.length > 0) {
    const bestTest = workingTests.reduce((best, current) => 
      current.responseTime < best.responseTime ? current : best
    );
    status.bestUrl = bestTest.url.replace('/api/health', '/api/mobile');
    status.bestResponseTime = bestTest.responseTime;
    console.log(`🎯 Network Status: Best URL: ${status.bestUrl} (${bestTest.responseTime}ms)`);
  } else {
    status.bestUrl = null;
    console.log('❌ Network Status: No working URLs found');
  }

  return status;
};

// Get recommended API URL based on current network status
export const getRecommendedApiUrl = async () => {
  // Use localhost for development
  console.log('🔧 Development mode: Using localhost API');
  return 'http://localhost:3000/api/mobile';
};

// Helper function to get user-friendly network error message
export function getNetworkErrorMessage(error) {
  if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
    return 'Koneksi timeout. Silakan coba lagi.';
  }
  
  if (error.message?.includes('Network disconnected') || error.message?.includes('network')) {
    return 'Tidak ada koneksi internet. Silakan periksa koneksi Anda.';
  }
  
  if (error.message?.includes('fetch')) {
    return 'Gagal terhubung ke server. Silakan coba lagi.';
  }
  
  return 'Terjadi kesalahan koneksi. Silakan coba lagi.';
}

// Helper function to check if error is network-related
export function isNetworkError(error) {
  const networkErrorKeywords = [
    'timeout', 'ETIMEDOUT', 'Network disconnected', 'network', 
    'fetch', 'connection', 'unreachable', 'offline'
  ];
  
  return networkErrorKeywords.some(keyword => 
    error.message?.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Network status manager (simplified version)
export const networkStatusManager = {
  getCurrentStatus: () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
  }),
  isInitialized: () => true,
  addListener: () => {},
  removeListener: () => {},
  checkConnectivity: async () => true,
  checkInternetReachability: async () => true,
};
