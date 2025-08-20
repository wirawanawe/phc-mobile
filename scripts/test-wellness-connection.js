#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Testing Wellness App Connectivity...\n');

// Test backend endpoints
const testBackendEndpoints = () => {
  console.log('🏥 Testing Backend Endpoints:');
  
  const endpoints = [
    'http://localhost:3000/api/health',
    'http://localhost:3000/api/mobile/wellness/status',
    'http://localhost:3000/api/mobile/users/profile',
    'http://localhost:3000/api/mobile/my-missions'
  ];
  
  endpoints.forEach(endpoint => {
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      const result = execSync(`curl -s -m 3 ${endpoint}`, { encoding: 'utf8' });
      
      if (result.includes('success') || result.includes('health') || result.length > 0) {
        console.log(`✅ ${endpoint} - Responding`);
        if (result.length < 100) {
          console.log(`   Response: ${result}`);
        }
      } else {
        console.log(`⚠️ ${endpoint} - Responding but empty`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Not responding (${error.message})`);
    }
  });
};

// Test Android emulator endpoints
const testAndroidEndpoints = () => {
  console.log('\n🤖 Testing Android Emulator Endpoints:');
  
  const endpoints = [
    'http://10.0.2.2:3000/api/health',
    'http://10.0.2.2:3000/api/mobile/wellness/status'
  ];
  
  endpoints.forEach(endpoint => {
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      const result = execSync(`curl -s -m 3 ${endpoint}`, { encoding: 'utf8' });
      
      if (result.includes('success') || result.includes('health') || result.length > 0) {
        console.log(`✅ ${endpoint} - Responding`);
      } else {
        console.log(`⚠️ ${endpoint} - Responding but empty`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Not responding (${error.message})`);
    }
  });
};

// Test network IPs
const testNetworkIPs = () => {
  console.log('\n🌐 Testing Network IPs:');
  
  const ips = [
    '192.168.18.30',
    '192.168.193.150',
    '10.242.90.103'
  ];
  
  ips.forEach(ip => {
    try {
      console.log(`\n🔍 Testing: http://${ip}:3000/api/health`);
      const result = execSync(`curl -s -m 2 http://${ip}:3000/api/health`, { encoding: 'utf8' });
      
      if (result.includes('success') || result.includes('health') || result.length > 0) {
        console.log(`✅ ${ip} - Responding`);
      } else {
        console.log(`⚠️ ${ip} - Responding but empty`);
      }
    } catch (error) {
      console.log(`❌ ${ip} - Not responding`);
    }
  });
};

// Check Metro bundler
const checkMetroBundler = () => {
  console.log('\n📱 Checking Metro Bundler:');
  
  try {
    const result = execSync('lsof -i :8081', { encoding: 'utf8' });
    if (result.includes('node')) {
      console.log('✅ Metro bundler is running on port 8081');
    } else {
      console.log('⚠️ Metro bundler not found on port 8081');
    }
  } catch (error) {
    console.log('❌ Metro bundler not running');
  }
};

// Main execution
const main = () => {
  console.log('🏥 PHC Mobile - Wellness Connection Test\n');
  console.log('=' .repeat(50));
  
  testBackendEndpoints();
  testAndroidEndpoints();
  testNetworkIPs();
  checkMetroBundler();
  
  console.log('\n' + '=' .repeat(50));
  console.log('\n📋 Summary:');
  console.log('✅ Backend server should be running on localhost:3000');
  console.log('✅ Metro bundler should be running on port 8081');
  console.log('✅ App will try multiple URLs to find best connection');
  console.log('✅ If all fail, offline mode will be available');
  
  console.log('\n🎯 **Expected Behavior:**');
  console.log('1. App tries localhost:3000 first');
  console.log('2. If fails, tries 10.0.2.2:3000 (Android emulator)');
  console.log('3. If fails, tries network IPs');
  console.log('4. If all fail, shows "Continue Offline" option');
  
  console.log('\n🔧 **If Issues Persist:**');
  console.log('1. Ensure backend is running: cd dash-app && npm run dev');
  console.log('2. Clear Metro cache: npx react-native start --reset-cache');
  console.log('3. Use "Continue Offline" option in app');
  console.log('4. Use "Debug Wellness" in Profile screen');
  
  console.log('\n✅ **Wellness app should work regardless of network issues!**');
};

main();
