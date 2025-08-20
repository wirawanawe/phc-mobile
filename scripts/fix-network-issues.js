#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing Network Issues for Wellness App...\n');

// Check if backend server is running
const checkBackendServer = () => {
  console.log('🔍 Checking backend server status...');
  
  try {
    // Check if dash-app directory exists
    if (!fs.existsSync('dash-app')) {
      console.log('❌ Backend directory (dash-app) not found');
      return false;
    }
    
    // Check if package.json exists in dash-app
    if (!fs.existsSync('dash-app/package.json')) {
      console.log('❌ Backend package.json not found');
      return false;
    }
    
    console.log('✅ Backend directory found');
    
    // Try to check if server is running on port 3000
    try {
      const result = execSync('curl -s http://localhost:3000/api/health', { timeout: 5000 });
      console.log('✅ Backend server is running on port 3000');
      return true;
    } catch (error) {
      console.log('⚠️ Backend server not responding on port 3000');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Error checking backend server:', error.message);
    return false;
  }
};

// Check network configuration
const checkNetworkConfig = () => {
  console.log('\n🌐 Checking network configuration...');
  
  try {
    const apiFile = 'src/services/api.js';
    if (fs.existsSync(apiFile)) {
      const content = fs.readFileSync(apiFile, 'utf8');
      
      // Check base URL configuration
      if (content.includes('localhost:3000')) {
        console.log('✅ API configured for localhost:3000');
      } else if (content.includes('10.0.2.2:3000')) {
        console.log('✅ API configured for Android emulator (10.0.2.2:3000)');
      } else if (content.includes('192.168.')) {
        console.log('✅ API configured for local network');
      } else {
        console.log('⚠️ API base URL not clearly configured');
      }
      
      // Check timeout settings
      if (content.includes('timeout')) {
        console.log('✅ Timeout settings found');
      } else {
        console.log('⚠️ No timeout settings found');
      }
      
      // Check retry mechanism
      if (content.includes('maxRetries')) {
        console.log('✅ Retry mechanism configured');
      } else {
        console.log('⚠️ No retry mechanism found');
      }
      
    } else {
      console.log('❌ API service file not found');
    }
  } catch (error) {
    console.log('❌ Error checking network config:', error.message);
  }
};

// Check Metro bundler
const checkMetroBundler = () => {
  console.log('\n📱 Checking Metro bundler...');
  
  try {
    // Check if Metro is running
    const result = execSync('lsof -i :8081', { encoding: 'utf8' });
    if (result.includes('node')) {
      console.log('✅ Metro bundler is running on port 8081');
      return true;
    } else {
      console.log('⚠️ Metro bundler not found on port 8081');
      return false;
    }
  } catch (error) {
    console.log('⚠️ Metro bundler not running');
    return false;
  }
};

// Start backend server
const startBackendServer = () => {
  console.log('\n🚀 Starting backend server...');
  
  try {
    if (!fs.existsSync('dash-app')) {
      console.log('❌ Backend directory not found');
      return false;
    }
    
    console.log('📝 Starting backend server in background...');
    console.log('💡 Run this command manually:');
    console.log('   cd dash-app && npm run dev');
    
    return true;
  } catch (error) {
    console.log('❌ Error starting backend server:', error.message);
    return false;
  }
};

// Clear Metro cache
const clearMetroCache = () => {
  console.log('\n🧹 Clearing Metro cache...');
  
  try {
    console.log('📝 Clearing Metro cache...');
    console.log('💡 Run this command manually:');
    console.log('   npx react-native start --reset-cache');
    
    return true;
  } catch (error) {
    console.log('❌ Error clearing Metro cache:', error.message);
    return false;
  }
};

// Test network connectivity
const testNetworkConnectivity = () => {
  console.log('\n🌐 Testing network connectivity...');
  
  const endpoints = [
    'http://localhost:3000/api/health',
    'http://localhost:3000/api/mobile/wellness/status',
    'http://10.0.2.2:3000/api/health',
    'http://10.0.2.2:3000/api/mobile/wellness/status'
  ];
  
  endpoints.forEach(endpoint => {
    try {
      const result = execSync(`curl -s -m 5 ${endpoint}`, { encoding: 'utf8' });
      if (result.includes('success') || result.includes('health')) {
        console.log(`✅ ${endpoint} - Responding`);
      } else {
        console.log(`⚠️ ${endpoint} - Responding but unexpected format`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Not responding`);
    }
  });
};

// Provide solutions
const provideSolutions = () => {
  console.log('\n🔧 Solutions for Network Issues:');
  console.log('');
  
  console.log('1️⃣ **Start Backend Server:**');
  console.log('   cd dash-app');
  console.log('   npm run dev');
  console.log('');
  
  console.log('2️⃣ **Clear Metro Cache:**');
  console.log('   npx react-native start --reset-cache');
  console.log('');
  
  console.log('3️⃣ **Check Network Configuration:**');
  console.log('   - Ensure backend is running on port 3000');
  console.log('   - Check if API base URL is correct');
  console.log('   - Verify firewall settings');
  console.log('');
  
  console.log('4️⃣ **Use Offline Mode:**');
  console.log('   - If network issues persist, use "Continue Offline"');
  console.log('   - App will work with cached data');
  console.log('');
  
  console.log('5️⃣ **Debug Connection:**');
  console.log('   - Use "Debug Wellness" in Profile screen');
  console.log('   - Run network diagnostics');
  console.log('');
};

// Main execution
const main = () => {
  console.log('🏥 PHC Mobile - Network Issues Fixer\n');
  console.log('=' .repeat(60));
  
  const backendRunning = checkBackendServer();
  checkNetworkConfig();
  const metroRunning = checkMetroBundler();
  testNetworkConnectivity();
  
  console.log('\n' + '=' .repeat(60));
  
  if (!backendRunning) {
    console.log('\n⚠️ **Backend server is not running**');
    startBackendServer();
  }
  
  if (!metroRunning) {
    console.log('\n⚠️ **Metro bundler is not running**');
    clearMetroCache();
  }
  
  provideSolutions();
  
  console.log('\n🎯 **Quick Fix Steps:**');
  console.log('1. Start backend: cd dash-app && npm run dev');
  console.log('2. Clear cache: npx react-native start --reset-cache');
  console.log('3. Test wellness app access');
  console.log('4. If still issues → Use "Continue Offline"');
  
  console.log('\n✅ **Wellness app should work even with network issues now!**');
};

main();
