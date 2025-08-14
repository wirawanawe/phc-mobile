const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script troubleshooting untuk masalah koneksi localhost
 */

function checkBackendServer() {
  console.log('🔍 Checking backend server status...');
  
  try {
    // Test health endpoint
    const healthResponse = execSync('curl -s http://localhost:3000/api/health', { 
      encoding: 'utf8',
      timeout: 5000 
    });
    
    if (healthResponse.includes('"status":"ok"')) {
      console.log('✅ Backend server is running correctly');
      return true;
    } else {
      console.log('❌ Backend server health check failed');
      console.log('Response:', healthResponse);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend server');
    console.log('Error:', error.message);
    return false;
  }
}

function checkMobileAPIEndpoint() {
  console.log('🔍 Checking mobile API endpoint...');
  
  try {
    const apiResponse = execSync('curl -s http://localhost:3000/api/mobile/auth/me', { 
      encoding: 'utf8',
      timeout: 5000 
    });
    
    if (apiResponse.includes('Authorization header required')) {
      console.log('✅ Mobile API endpoint is working correctly');
      return true;
    } else {
      console.log('❌ Mobile API endpoint response unexpected');
      console.log('Response:', apiResponse);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to mobile API endpoint');
    console.log('Error:', error.message);
    return false;
  }
}

function checkCurrentConfiguration() {
  console.log('🔍 Checking current configuration...');
  
  try {
    // Check API service configuration
    const apiPath = path.join(__dirname, '../src/services/api.js');
    const apiContent = fs.readFileSync(apiPath, 'utf8');
    
    if (apiContent.includes('return "localhost"')) {
      console.log('✅ API service configured for localhost');
    } else {
      console.log('❌ API service not configured for localhost');
      console.log('Current configuration needs to be updated');
    }
    
    // Check NetworkHelper configuration
    const networkHelperPath = path.join(__dirname, '../src/utils/networkHelper.js');
    const networkContent = fs.readFileSync(networkHelperPath, 'utf8');
    
    if (networkContent.includes("'http://localhost:3000'") && 
        networkContent.includes('Local development (primary)')) {
      console.log('✅ NetworkHelper configured for localhost priority');
    } else {
      console.log('❌ NetworkHelper not properly configured');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error checking configuration files');
    console.log('Error:', error.message);
    return false;
  }
}

function checkReactNativeCache() {
  console.log('🔍 Checking for React Native cache issues...');
  
  const cacheDirectories = [
    path.join(process.env.HOME || '~', '.expo'),
    path.join(__dirname, '../node_modules/.cache'),
    '/tmp/metro-cache',
    '/tmp/haste-map-*'
  ];
  
  let foundCache = false;
  cacheDirectories.forEach(dir => {
    if (fs.existsSync(dir)) {
      foundCache = true;
    }
  });
  
  if (foundCache) {
    console.log('⚠️ Cache directories found - may need clearing');
    console.log('💡 Try: npx expo start --clear');
  } else {
    console.log('✅ No obvious cache issues detected');
  }
}

function provideSolutions() {
  console.log('\n🛠️ Troubleshooting Solutions:\n');
  
  console.log('1. 🔄 Restart React Native Development Server:');
  console.log('   npx expo start --clear');
  console.log('   # or');
  console.log('   npm start -- --reset-cache\n');
  
  console.log('2. 📱 Force refresh mobile app:');
  console.log('   - iOS Simulator: Cmd+R or Device > Restart');
  console.log('   - Android Emulator: R+R or Reload');
  console.log('   - Physical device: Shake device and tap "Reload"\n');
  
  console.log('3. 🧹 Clear all caches:');
  console.log('   npx expo start --clear');
  console.log('   # and also clear app data on device/simulator\n');
  
  console.log('4. 🔍 Check network in app:');
  console.log('   - Look for console logs starting with "🚀 Development mode"');
  console.log('   - Should show "Using local server: localhost"');
  console.log('   - Check for any "Network request failed" errors\n');
  
  console.log('5. 🆘 If still failing:');
  console.log('   - Check if firewall is blocking localhost:3000');
  console.log('   - Try accessing http://localhost:3000 in browser');
  console.log('   - Restart backend server: cd dash-app && npm run dev');
}

function runDiagnostics() {
  console.log('🚀 Running localhost connection diagnostics...\n');
  
  const backendOk = checkBackendServer();
  const mobileApiOk = checkMobileAPIEndpoint();
  const configOk = checkCurrentConfiguration();
  
  console.log('\n📊 Diagnostic Summary:');
  console.log(`Backend Server: ${backendOk ? '✅' : '❌'}`);
  console.log(`Mobile API: ${mobileApiOk ? '✅' : '❌'}`);
  console.log(`Configuration: ${configOk ? '✅' : '❌'}`);
  
  checkReactNativeCache();
  
  if (backendOk && mobileApiOk && configOk) {
    console.log('\n🎉 Server and configuration are working correctly!');
    console.log('The issue is likely with the mobile app cache or development server.');
    console.log('\n💡 Most likely solution: Restart React Native with cache clearing');
  } else {
    console.log('\n⚠️ Found issues that need to be resolved first.');
  }
  
  provideSolutions();
}

if (require.main === module) {
  runDiagnostics();
}

module.exports = {
  checkBackendServer,
  checkMobileAPIEndpoint,
  checkCurrentConfiguration,
  runDiagnostics
};
