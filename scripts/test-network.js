#!/usr/bin/env node

const http = require('http');
const https = require('https');

const testUrls = [
  'http://localhost:3000/api/health',
  'http://192.168.18.30:3000/api/health',
  'http://192.168.193.150:3000/api/health',
  'http://10.242.90.103:3000/api/health',
  'https://dash.doctorphc.id/api/health'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, { timeout: 10000 }, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url,
          success: true,
          statusCode: res.statusCode,
          responseTime,
          data: data.substring(0, 200) + (data.length > 200 ? '...' : '')
        });
      });
    });
    
    req.on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      resolve({
        url,
        success: false,
        error: error.message,
        responseTime
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        success: false,
        error: 'Timeout',
        responseTime: 10000
      });
    });
  });
}

async function runNetworkTest() {
  console.log('🌐 Network Connectivity Test');
  console.log('============================\n');
  
  const results = [];
  
  for (const url of testUrls) {
    console.log(`Testing ${url}...`);
    const result = await testUrl(url);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ SUCCESS - ${result.statusCode} (${result.responseTime}ms)`);
    } else {
      console.log(`❌ FAILED - ${result.error} (${result.responseTime}ms)`);
    }
    console.log('');
  }
  
  console.log('📊 Summary');
  console.log('==========');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n🏆 Best performing URLs:');
    successful
      .sort((a, b) => a.responseTime - b.responseTime)
      .slice(0, 3)
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.url} (${result.responseTime}ms)`);
      });
  }
  
  if (failed.length > 0) {
    console.log('\n⚠️ Failed URLs:');
    failed.forEach(result => {
      console.log(`• ${result.url} - ${result.error}`);
    });
  }
  
  console.log('\n💡 Recommendations:');
  if (successful.length === 0) {
    console.log('• No URLs are reachable. Check if the server is running.');
    console.log('• Ensure your device is connected to the internet.');
    console.log('• For local development, make sure the server is running on port 3000.');
  } else {
    console.log('• Use one of the successful URLs in your mobile app configuration.');
    console.log('• The fastest URL is recommended for best performance.');
  }
}

// Run the test
runNetworkTest().catch(console.error);
