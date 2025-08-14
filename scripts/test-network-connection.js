#!/usr/bin/env node

/**
 * Network Connection Test Script
 * Tests connectivity to various endpoints to help diagnose network issues
 */

const { execSync } = require('child_process');

async function testEndpoint(url, description) {
  console.log(`\n🔍 Testing ${description}: ${url}`);
  
  try {
    const startTime = Date.now();
    
    // Use curl for testing since it's more reliable than fetch in Node.js
    const result = execSync(`curl -s -w "%{http_code},%{time_total}" -o /dev/null "${url}"`, {
      timeout: 10000,
      encoding: 'utf8'
    });
    
    const [httpCode, timeTotal] = result.trim().split(',');
    const responseTime = Math.round(parseFloat(timeTotal) * 1000);
    
    if (httpCode === '200' || httpCode === '401' || httpCode === '403') {
      console.log(`  ✅ SUCCESS: HTTP ${httpCode} - ${responseTime}ms`);
      return { success: true, httpCode, responseTime };
    } else {
      console.log(`  ❌ FAILED: HTTP ${httpCode} - ${responseTime}ms`);
      return { success: false, httpCode, responseTime };
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testNetworkConnectivity() {
  console.log('🌐 PHC Mobile App - Network Connectivity Test');
  console.log('=' .repeat(50));
  
  const endpoints = [
    {
      url: 'http://localhost:3000/api/health',
      description: 'Local Server Health Check'
    },
    {
      url: 'http://localhost:3000/api/mobile/auth/me',
      description: 'Local Mobile API Auth Endpoint'
    },
    {
      url: 'https://dash.doctorphc.id/api/health',
      description: 'Production Server Health Check'
    },
    {
      url: 'https://dash.doctorphc.id/api/mobile/auth/me',
      description: 'Production Mobile API Auth Endpoint'
    },
    {
      url: 'https://google.com',
      description: 'Internet Connectivity Test'
    }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.description);
    results.push({ ...endpoint, ...result });
  }
  
  console.log('\n📊 SUMMARY:');
  console.log('=' .repeat(50));
  
  const workingEndpoints = results.filter(r => r.success);
  const failedEndpoints = results.filter(r => !r.success);
  
  console.log(`✅ Working endpoints: ${workingEndpoints.length}/${results.length}`);
  console.log(`❌ Failed endpoints: ${failedEndpoints.length}/${results.length}`);
  
  if (workingEndpoints.length > 0) {
    console.log('\n✅ Working endpoints:');
    workingEndpoints.forEach(ep => {
      console.log(`  - ${ep.description}: ${ep.responseTime}ms`);
    });
  }
  
  if (failedEndpoints.length > 0) {
    console.log('\n❌ Failed endpoints:');
    failedEndpoints.forEach(ep => {
      console.log(`  - ${ep.description}: ${ep.error || `HTTP ${ep.httpCode}`}`);
    });
  }
  
  console.log('\n🔧 RECOMMENDATIONS:');
  console.log('=' .repeat(50));
  
  if (results.find(r => r.url.includes('localhost') && r.success)) {
    console.log('✅ Local server is working correctly');
    console.log('   Your mobile app should be able to connect to localhost:3000');
  } else {
    console.log('❌ Local server is not responding');
    console.log('   Make sure to run: cd dash-app && npm run dev');
  }
  
  if (results.find(r => r.url.includes('dash.doctorphc.id') && r.success)) {
    console.log('✅ Production server is accessible');
  } else {
    console.log('❌ Production server is not accessible');
    console.log('   Check your internet connection or server status');
  }
  
  if (!results.find(r => r.url.includes('google.com') && r.success)) {
    console.log('❌ No internet connectivity detected');
    console.log('   Check your network connection');
  }
  
  console.log('\n🔧 Next steps:');
  console.log('1. Make sure dash-app server is running: cd dash-app && npm run dev');
  console.log('2. Restart your React Native app');
  console.log('3. Check that your mobile device/emulator can reach localhost:3000');
}

// Run the test
testNetworkConnectivity().catch(console.error);
