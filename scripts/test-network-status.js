const { networkStatusManager } = require('../src/utils/networkStatus');

console.log('Testing networkStatusManager...');

try {
  console.log('networkStatusManager type:', typeof networkStatusManager);
  console.log('networkStatusManager value:', networkStatusManager);
  
  if (networkStatusManager) {
    console.log('networkStatusManager exists');
    
    if (typeof networkStatusManager.getCurrentStatus === 'function') {
      console.log('getCurrentStatus method exists');
      
      try {
        const status = networkStatusManager.getCurrentStatus();
        console.log('Current status:', status);
      } catch (error) {
        console.error('Error calling getCurrentStatus:', error);
      }
    } else {
      console.log('getCurrentStatus method does not exist');
    }
    
    if (typeof networkStatusManager.isInitialized === 'function') {
      console.log('isInitialized method exists');
      
      try {
        const initialized = networkStatusManager.isInitialized();
        console.log('Is initialized:', initialized);
      } catch (error) {
        console.error('Error calling isInitialized:', error);
      }
    } else {
      console.log('isInitialized method does not exist');
    }
  } else {
    console.log('networkStatusManager is null or undefined');
  }
} catch (error) {
  console.error('Error testing networkStatusManager:', error);
}

console.log('Test completed.');
