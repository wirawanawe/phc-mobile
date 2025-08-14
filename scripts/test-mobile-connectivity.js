#!/usr/bin/env node

/**
 * Test Mobile App Connectivity
 * Simulates the mobile app's network requests to verify connectivity
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Simulate Platform.OS for testing
const Platform = {
  OS: 'android' // Change this to test different platforms
};

const __DEV__ = true; // Change this to test production mode

function getApiBaseUrl() {
  // For development - platform-specific configuration
  if (__DEV__) {
    // Check if running on Android emulator
    if (Platform.OS === "android") {
      console.log('🚀 Development mode: Using Android emulator configuration');
      return "http://10.0.2.2:3000/api/mobile";
    }

    // Check if running on iOS simulator
    if (Platform.OS === "ios") {
      console.log('🚀 Development mode: Using iOS simulator configuration');
      return "http://localhost:3000/api/mobile";
    }

    // For physical device testing - fallback to localhost
    console.log('🚀 Development mode: Using localhost for physical device');
    return "http://localhost:3000/api/mobile";
  }

  // For production - use production server
  console.log('🚀 Production mode: Using production server');
  return "https://dash.doctorphc.id/api/mobile";
}

async function testNetworkConnectivity(baseURL) {
  try {
    console.log('🌐 Network: Testing connectivity to:', baseURL);
    const startTime = Date.now();
    
    // Use the health endpoint for connectivity testing
    const healthURL = `${baseURL.replace('/api/mobile', '')}/api/health`;
    console.log('🏥 Network: Testing health endpoint:', healthURL);
    
    const response = await fetch(healthURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('✅ Network: Health check successful');
    console.log('📊 Network: Response time:', responseTime + 'ms');
    console.log('📊 Network: Status code:', response.status);
    
    return { success: true, responseTime, status: response.status };
  } catch (error) {
    console.error('❌ Network: Connectivity test failed');
    console.error('❌ Network: Error details:', {
      message: error.message,
      name: error.name,
      type: error.constructor.name
    });
    return { success: false, error: error.message };
  }
}

async function testLogin() {
  const baseURL = getApiBaseUrl();
  
  // First test connectivity
  const connectivityResult = await testNetworkConnectivity(baseURL);
  
  if (!connectivityResult.success) {
    console.log('\n❌ Connectivity test failed, skipping login test');
    return;
  }
  
  console.log('\n🔐 Testing login endpoint...');
  
  try {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass'
      }),
      timeout: 10000
    });
    
    const responseText = await response.text();
    
    console.log('📊 Login test response status:', response.status);
    console.log('📊 Login test response:', responseText.substring(0, 200) + '...');
    
    if (response.status === 401 || response.status === 400) {
      console.log('✅ Login endpoint is working (expected auth failure)');
    } else if (response.status === 200) {
      console.log('✅ Login endpoint is working (unexpected success)');
    } else {
      console.log('⚠️ Login endpoint returned unexpected status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Mobile App Connectivity Test');
  console.log('Platform:', Platform.OS);
  console.log('Development mode:', __DEV__);
  console.log('=' .repeat(50));
  
  await testLogin();
  
  console.log('\n🔧 If tests fail:');
  console.log('1. Make sure dash-app server is running: cd dash-app && npm run dev');
  console.log('2. Check that the server is accessible on the expected port');
  console.log('3. For Android emulator, make sure 10.0.2.2:3000 is reachable');
  console.log('4. For iOS simulator, make sure localhost:3000 is reachable');
}

// Run tests for different configurations
async function runMultiPlatformTests() {
  const platforms = ['android', 'ios'];
  const devModes = [true, false];
  
  for (const platform of platforms) {
    for (const devMode of devModes) {
      Platform.OS = platform;
      global.__DEV__ = devMode;
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Testing: ${platform.toUpperCase()} - ${devMode ? 'DEVELOPMENT' : 'PRODUCTION'}`);
      console.log(`${'='.repeat(60)}`);
      
      await runAllTests();
    }
  }
}

// Run the tests
if (process.argv.includes('--all')) {
  runMultiPlatformTests().catch(console.error);
} else {
  runAllTests().catch(console.error);
}
