// Quick Authentication Fix for React Native Debugger Console
// Copy and paste this code into your React Native debugger console

const quickAuthFix = async () => {
  console.log('🔐 Quick Authentication Fix...');
  
  try {
    // Import AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // Clear authentication data
    await AsyncStorage.multiRemove([
      'authToken',
      'refreshToken', 
      'userData',
      'userId'
    ]);
    
    console.log('✅ Authentication data cleared!');
    console.log('💡 Please restart the app and login again.');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
};

// Run the fix
quickAuthFix();

// Alternative: One-liner for quick execution
// require('@react-native-async-storage/async-storage').default.multiRemove(['authToken', 'refreshToken', 'userData', 'userId']).then(() => console.log('✅ Auth cleared!')).catch(e => console.error('❌ Error:', e.message));
