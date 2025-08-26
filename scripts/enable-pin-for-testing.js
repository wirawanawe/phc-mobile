const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Script untuk mengaktifkan PIN untuk testing
async function enablePinForTesting() {
  console.log('🔐 Enabling PIN for testing...');
  
  try {
    // Set PIN untuk testing
    const testPin = '123456';
    
    await AsyncStorage.setItem('pin_enabled', 'true');
    await AsyncStorage.setItem('pin_code', testPin);
    await AsyncStorage.setItem('pin_attempts', '0');
    
    console.log('✅ PIN enabled successfully!');
    console.log('📱 Test PIN:', testPin);
    console.log('🔓 PIN attempts reset to 0');
    console.log('\n💡 Instructions:');
    console.log('1. Restart aplikasi');
    console.log('2. PIN screen akan muncul');
    console.log('3. Masukkan PIN:', testPin);
    console.log('4. Test fitur PIN dengan keluar dari aplikasi dan kembali');
    
  } catch (error) {
    console.error('❌ Error enabling PIN:', error);
  }
}

// Script untuk menonaktifkan PIN
async function disablePinForTesting() {
  console.log('🔓 Disabling PIN for testing...');
  
  try {
    await AsyncStorage.removeItem('pin_enabled');
    await AsyncStorage.removeItem('pin_code');
    await AsyncStorage.removeItem('pin_attempts');
    
    console.log('✅ PIN disabled successfully!');
    console.log('📱 Aplikasi tidak akan memerlukan PIN lagi');
    
  } catch (error) {
    console.error('❌ Error disabling PIN:', error);
  }
}

// Script untuk melihat status PIN
async function checkPinStatus() {
  console.log('🔍 Checking PIN status...');
  
  try {
    const enabled = await AsyncStorage.getItem('pin_enabled');
    const pin = await AsyncStorage.getItem('pin_code');
    const attempts = await AsyncStorage.getItem('pin_attempts');
    
    console.log('📊 PIN Status:');
    console.log('  Enabled:', enabled === 'true' ? '✅ Yes' : '❌ No');
    console.log('  PIN Code:', pin || 'Not set');
    console.log('  Attempts:', attempts || '0');
    
  } catch (error) {
    console.error('❌ Error checking PIN status:', error);
  }
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
  case 'enable':
    enablePinForTesting();
    break;
  case 'disable':
    disablePinForTesting();
    break;
  case 'status':
    checkPinStatus();
    break;
  default:
    console.log('🔐 PIN Testing Scripts');
    console.log('\nUsage:');
    console.log('  node scripts/enable-pin-for-testing.js enable   - Enable PIN with test code 123456');
    console.log('  node scripts/enable-pin-for-testing.js disable  - Disable PIN');
    console.log('  node scripts/enable-pin-for-testing.js status   - Check PIN status');
    break;
}
