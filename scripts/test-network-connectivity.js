#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testEndpoints = [
  'http://localhost:3000/api/health',
  'http://10.0.2.2:3000/api/health',
  'http://10.242.90.103:3000/api/health',
  'http://127.0.0.1:3000/api/health'
];

async function testEndpoint(url) {
  try {
    console.log(`🔍 Testing: ${url}`);
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`✅ Success: ${url}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response time: ${responseTime}ms`);
    return { success: true, url, status: response.status, responseTime };
  } catch (error) {
    console.log(`❌ Failed: ${url}`);
    console.log(`   Error: ${error.message}`);
    return { success: false, url, error: error.message };
  }
}

async function runTests() {
  console.log('🌐 Network Connectivity Test');
  console.log('============================');
  console.log('');
  
  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log('');
  }
  
  console.log('📊 Summary:');
  console.log('===========');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  successful.forEach(r => {
    console.log(`   - ${r.url} (${r.status})`);
  });
  
  console.log(`❌ Failed: ${failed.length}`);
  failed.forEach(r => {
    console.log(`   - ${r.url}: ${r.error}`);
  });
  
  console.log('');
  
  if (successful.length > 0) {
    console.log('🎯 Recommendations:');
    console.log('===================');
    
    if (successful.find(r => r.url.includes('localhost'))) {
      console.log('✅ localhost is accessible - good for iOS simulator');
    }
    
    if (successful.find(r => r.url.includes('10.0.2.2'))) {
      console.log('✅ 10.0.2.2 is accessible - good for Android emulator');
    }
    
    if (successful.find(r => r.url.includes('10.242.90.103'))) {
      console.log('✅ 10.242.90.103 is accessible - good for physical devices');
    }
  } else {
    console.log('🚨 No endpoints are accessible!');
    console.log('   Make sure the server is running: cd dash-app && npm run dev');
  }
}

runTests().catch(console.error);
