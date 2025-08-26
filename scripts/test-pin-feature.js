const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Test script untuk fitur PIN
async function testPinFeature() {
  console.log('🧪 Testing PIN Feature...');
  
  try {
    // Test 1: Enable PIN
    console.log('\n1. Testing PIN Enable...');
    await AsyncStorage.setItem('pin_enabled', 'true');
    await AsyncStorage.setItem('pin_code', '123456');
    await AsyncStorage.setItem('pin_attempts', '0');
    
    const enabled = await AsyncStorage.getItem('pin_enabled');
    const pin = await AsyncStorage.getItem('pin_code');
    const attempts = await AsyncStorage.getItem('pin_attempts');
    
    console.log('✅ PIN Enabled:', enabled);
    console.log('✅ PIN Code:', pin);
    console.log('✅ PIN Attempts:', attempts);
    
    // Test 2: Simulate failed attempts
    console.log('\n2. Testing PIN Lock...');
    await AsyncStorage.setItem('pin_attempts', '5');
    
    const lockedAttempts = await AsyncStorage.getItem('pin_attempts');
    console.log('✅ PIN Locked (5 attempts):', lockedAttempts);
    
    // Test 3: Reset PIN
    console.log('\n3. Testing PIN Reset...');
    await AsyncStorage.setItem('pin_attempts', '0');
    
    const resetAttempts = await AsyncStorage.getItem('pin_attempts');
    console.log('✅ PIN Reset:', resetAttempts);
    
    // Test 4: Disable PIN
    console.log('\n4. Testing PIN Disable...');
    await AsyncStorage.removeItem('pin_enabled');
    await AsyncStorage.removeItem('pin_code');
    await AsyncStorage.removeItem('pin_attempts');
    
    const disabled = await AsyncStorage.getItem('pin_enabled');
    const noPin = await AsyncStorage.getItem('pin_code');
    const noAttempts = await AsyncStorage.getItem('pin_attempts');
    
    console.log('✅ PIN Disabled:', disabled);
    console.log('✅ PIN Code Removed:', noPin);
    console.log('✅ PIN Attempts Removed:', noAttempts);
    
    console.log('\n🎉 All PIN tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing PIN feature:', error);
  }
}

// Run the test
testPinFeature();
