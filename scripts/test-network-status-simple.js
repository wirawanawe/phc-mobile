// Simple test to check if the networkStatusManager export is working
console.log('Testing networkStatusManager export...');

// Mock the NetInfo module to avoid React Native dependencies
const originalRequire = require;
const mockNetInfo = {
  fetch: async () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi'
  }),
  addEventListener: () => {}
};

// Mock the module
require.cache[require.resolve('@react-native-community/netinfo')] = {
  exports: mockNetInfo
};

try {
  // Try to import the networkStatusManager
  const { networkStatusManager } = require('../src/utils/networkStatus');
  
  console.log('✅ Successfully imported networkStatusManager');
  console.log('Type:', typeof networkStatusManager);
  
  if (networkStatusManager) {
    console.log('✅ networkStatusManager is not null/undefined');
    
    // Check if methods exist
    const hasGetCurrentStatus = typeof networkStatusManager.getCurrentStatus === 'function';
    const hasIsInitialized = typeof networkStatusManager.isInitialized === 'function';
    
    console.log('Has getCurrentStatus method:', hasGetCurrentStatus);
    console.log('Has isInitialized method:', hasIsInitialized);
    
    if (hasGetCurrentStatus) {
      try {
        const status = networkStatusManager.getCurrentStatus();
        console.log('✅ getCurrentStatus() works:', status);
      } catch (error) {
        console.error('❌ getCurrentStatus() failed:', error.message);
      }
    }
    
    if (hasIsInitialized) {
      try {
        const initialized = networkStatusManager.isInitialized();
        console.log('✅ isInitialized() works:', initialized);
      } catch (error) {
        console.error('❌ isInitialized() failed:', error.message);
      }
    }
  } else {
    console.log('❌ networkStatusManager is null/undefined');
  }
} catch (error) {
  console.error('❌ Failed to import networkStatusManager:', error.message);
  console.error('Stack trace:', error.stack);
}

// Clean up
delete require.cache[require.resolve('@react-native-community/netinfo')];

console.log('Test completed.');
