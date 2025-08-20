#!/usr/bin/env node

const http = require('http');

const testUrls = [
  'http://localhost:3000/api/health',
  'http://192.168.18.30:3000/api/health',
  'http://10.242.90.103:3000/api/health',
  'http://192.168.193.150:3000/api/health'
];

async function testConnection(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.get(url, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`✅ ${url}: HTTP ${res.statusCode} (${responseTime}ms)`);
      resolve({ success: true, statusCode: res.statusCode, responseTime });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${url}: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${url}: Timeout`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('🔍 Testing backend connectivity...\n');
  
  for (const url of testUrls) {
    await testConnection(url);
  }
  
  console.log('\n🔍 Testing mobile API endpoint...\n');
  
  const mobileUrl = 'http://localhost:3000/api/mobile/auth/login';
  const result = await testConnection(mobileUrl);
  
  if (result.success && result.statusCode === 405) {
    console.log('✅ Mobile API endpoint is accessible (405 is expected for GET on login endpoint)');
  } else if (result.success) {
    console.log('✅ Mobile API endpoint is accessible');
  } else {
    console.log('❌ Mobile API endpoint is not accessible');
  }
}

runTests().catch(console.error);
