#!/usr/bin/env node

/**
 * Test Social Authentication Configuration
 * This script tests the social authentication setup to ensure it's working correctly
 */

console.log('🧪 Testing Social Authentication Configuration...\n');

// Test 1: Check network security configuration
console.log('1. Checking network security configuration...');
const fs = require('fs');
const path = require('path');

const networkConfigPath = path.join(__dirname, '../android/app/src/main/res/xml/network_security_config.xml');
if (fs.existsSync(networkConfigPath)) {
  const config = fs.readFileSync(networkConfigPath, 'utf8');
  if (config.includes('10.242.90.103')) {
    console.log('   ✅ Network security config includes 10.242.90.103');
  } else {
    console.log('   ⚠️  Network security config missing 10.242.90.103');
  }
  if (config.includes('localhost')) {
    console.log('   ✅ Network security config includes localhost');
  } else {
    console.log('   ⚠️  Network security config missing localhost');
  }
} else {
  console.log('   ❌ Network security config file not found');
}

// Test 2: Check Android manifest
console.log('\n2. Checking Android manifest...');
const manifestPath = path.join(__dirname, '../android/app/src/main/AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  if (manifest.includes('networkSecurityConfig')) {
    console.log('   ✅ Android manifest includes network security config');
  } else {
    console.log('   ❌ Android manifest missing network security config');
  }
  if (manifest.includes('INTERNET')) {
    console.log('   ✅ Android manifest includes INTERNET permission');
  } else {
    console.log('   ❌ Android manifest missing INTERNET permission');
  }
} else {
  console.log('   ❌ Android manifest file not found');
}

// Test 3: Check server connectivity and test Google auth endpoint
console.log('\n3. Testing server connectivity and Google auth endpoint...');
const https = require('https');
const http = require('http');

async function testConnectivity(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      resolve({ success: true, status: res.statusCode });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function testGoogleAuth(url) {
  return new Promise((resolve) => {
    const testData = JSON.stringify({
      google_user_id: 'test_script_user',
      name: 'Test Script User',
      email: 'test.script@example.com'
    });

    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      }
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ 
            success: true, 
            status: res.statusCode, 
            data: jsonData,
            isSuccess: jsonData.success 
          });
        } catch (error) {
          resolve({ 
            success: true, 
            status: res.statusCode, 
            data: data,
            isSuccess: false,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.write(testData);
    req.end();
  });
}

async function runTests() {
  const testUrls = [
    'http://localhost:3000/api/mobile/auth/google',
    'http://10.242.90.103:3000/api/mobile/auth/google'
  ];
  
  for (const url of testUrls) {
    console.log(`   🔗 Testing ${url}...`);
    
    // Test connectivity first
    const connectivityResult = await testConnectivity(url);
    if (connectivityResult.success) {
      console.log(`   ✅ Connectivity: ${url} - Status: ${connectivityResult.status}`);
      
      // Test Google auth endpoint
      const authResult = await testGoogleAuth(url);
      if (authResult.success) {
        if (authResult.isSuccess) {
          console.log(`   ✅ Google Auth: ${url} - Success! User ID: ${authResult.data.data?.user?.id}`);
        } else {
          console.log(`   ⚠️  Google Auth: ${url} - Server responded but auth failed: ${authResult.data.message || 'Unknown error'}`);
        }
      } else {
        console.log(`   ❌ Google Auth: ${url} - Error: ${authResult.error}`);
      }
    } else {
      console.log(`   ❌ Connectivity: ${url} - Error: ${connectivityResult.error}`);
    }
    console.log('');
  }
}

runTests().then(() => {
  console.log('🎉 Social Authentication Configuration Test Complete!');
  console.log('\n📋 Summary:');
  console.log('   - If all tests pass, your social auth should work correctly');
  console.log('   - If any tests fail, check the corresponding configuration');
  console.log('   - Make sure the backend server is running on port 3000');
  console.log('   - For Android emulator, use 10.242.90.103:3000');
  console.log('   - For iOS simulator, use localhost:3000');
  console.log('\n🔧 If you\'re still getting "Network request failed" errors:');
  console.log('   1. Make sure the backend server is running');
  console.log('   2. Check that the correct IP address is being used for your platform');
  console.log('   3. Verify the network security configuration is correct');
  console.log('   4. Try restarting the React Native app');
});
