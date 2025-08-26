#!/usr/bin/env node

/**
 * Mission API Connection Test Script
 * 
 * This script tests real-time connections to mission API endpoints
 * and identifies any issues that might cause problems.
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: 10000, // 10 seconds
  testUser: {
    id: 1,
    token: process.env.TEST_TOKEN || 'test_token_placeholder'
  }
};

async function testMissionAPIConnection() {
  console.log('🔍 Starting Mission API Connection Test...\n');
  
  try {
    // Step 1: Test server connectivity
    console.log('🔍 Step 1: Testing server connectivity...');
    await testServerConnectivity();
    
    // Step 2: Test mission endpoints
    console.log('\n🔍 Step 2: Testing mission endpoints...');
    await testMissionEndpoints();
    
    // Step 3: Test authentication
    console.log('\n🔍 Step 3: Testing authentication...');
    await testAuthentication();
    
    // Step 4: Test response times
    console.log('\n🔍 Step 4: Testing response times...');
    await testResponseTimes();
    
    // Step 5: Test error handling
    console.log('\n🔍 Step 5: Testing error handling...');
    await testErrorHandling();
    
    console.log('\n🎉 Mission API connection test completed!');
    
  } catch (error) {
    console.error('❌ Mission API connection test failed:', error);
  }
}

async function testServerConnectivity() {
  const endpoints = [
    { name: 'Base Server', path: '/' },
    { name: 'Health Check', path: '/api/health' },
    { name: 'API Base', path: '/api' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${config.baseUrl}${endpoint.path}`;
      console.log(`   🔍 Testing ${endpoint.name}: ${url}`);
      
      const response = await makeRequest(url);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`   ✅ ${endpoint.name}: Server is reachable (${response.status})`);
      } else {
        console.log(`   ⚠️ ${endpoint.name}: Server responded with ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: Connection failed - ${error.message}`);
    }
  }
}

async function testMissionEndpoints() {
  const endpoints = [
    {
      name: 'My Missions',
      path: '/api/mobile/missions/my-missions?user_id=1',
      expectedStatus: [200, 401] // 401 is expected without auth
    },
    {
      name: 'Mission Stats',
      path: '/api/mobile/missions/stats?user_id=1&period=week',
      expectedStatus: [200, 401]
    },
    {
      name: 'Available Missions',
      path: '/api/mobile/missions',
      expectedStatus: [200, 401]
    },
    {
      name: 'Mission Categories',
      path: '/api/mobile/missions/category/fitness?user_id=1',
      expectedStatus: [200, 401]
    },
    {
      name: 'Mission by Date',
      path: '/api/mobile/missions/by-date?user_id=1&date=2024-01-15',
      expectedStatus: [200, 401]
    }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${config.baseUrl}${endpoint.path}`;
      console.log(`   🔍 Testing ${endpoint.name}...`);
      
      const startTime = Date.now();
      const response = await makeRequest(url);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (endpoint.expectedStatus.includes(response.status)) {
        console.log(`   ✅ ${endpoint.name}: ${response.status} (${duration}ms)`);
        
        // Check response structure for successful responses
        if (response.status === 200 && response.data) {
          console.log(`      📊 Response size: ${JSON.stringify(response.data).length} chars`);
          
          // Check for expected fields
          if (response.data.success !== undefined) {
            console.log(`      ✅ Has success field`);
          }
          
          if (response.data.data !== undefined) {
            console.log(`      ✅ Has data field`);
          }
        }
        
      } else {
        console.log(`   ⚠️ ${endpoint.name}: Unexpected status ${response.status} (${duration}ms)`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: Request failed - ${error.message}`);
    }
  }
}

async function testAuthentication() {
  console.log('   🔐 Testing authentication scenarios...');
  
  const authTests = [
    {
      name: 'No Authorization Header',
      headers: {},
      expectedStatus: 401
    },
    {
      name: 'Invalid Token Format',
      headers: { 'Authorization': 'InvalidToken' },
      expectedStatus: 401
    },
    {
      name: 'Bearer Token without JWT',
      headers: { 'Authorization': 'Bearer invalid_token' },
      expectedStatus: 401
    }
  ];
  
  for (const test of authTests) {
    try {
      const url = `${config.baseUrl}/api/mobile/missions/my-missions?user_id=1`;
      console.log(`   🔍 Testing ${test.name}...`);
      
      const response = await makeRequest(url, { headers: test.headers });
      
      if (response.status === test.expectedStatus) {
        console.log(`   ✅ ${test.name}: Correctly rejected (${response.status})`);
      } else {
        console.log(`   ⚠️ ${test.name}: Unexpected response (${response.status})`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${test.name}: Request failed - ${error.message}`);
    }
  }
}

async function testResponseTimes() {
  console.log('   ⏱️ Testing response times...');
  
  const endpoints = [
    '/api/mobile/missions/my-missions?user_id=1',
    '/api/mobile/missions/stats?user_id=1&period=week',
    '/api/mobile/missions'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${config.baseUrl}${endpoint}`;
      const times = [];
      
      // Test 3 times to get average
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        const response = await makeRequest(url);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (response.status === 200 || response.status === 401) {
          times.push(duration);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (times.length > 0) {
        const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        console.log(`   📊 ${endpoint}:`);
        console.log(`      Average: ${avgTime}ms`);
        console.log(`      Range: ${minTime}ms - ${maxTime}ms`);
        
        if (avgTime > 2000) {
          console.log(`      ⚠️ Slow response time (>2s)`);
        } else if (avgTime > 1000) {
          console.log(`      ⚠️ Moderate response time (>1s)`);
        } else {
          console.log(`      ✅ Good response time (<1s)`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ ${endpoint}: Response time test failed - ${error.message}`);
    }
  }
}

async function testErrorHandling() {
  console.log('   🛡️ Testing error handling...');
  
  const errorTests = [
    {
      name: 'Invalid User ID',
      path: '/api/mobile/missions/my-missions?user_id=invalid',
      expectedStatus: 400
    },
    {
      name: 'Missing User ID',
      path: '/api/mobile/missions/my-missions',
      expectedStatus: 400
    },
    {
      name: 'Invalid Period',
      path: '/api/mobile/missions/stats?user_id=1&period=invalid',
      expectedStatus: 200 // Should default to week
    },
    {
      name: 'Non-existent Endpoint',
      path: '/api/mobile/missions/non-existent',
      expectedStatus: 404
    }
  ];
  
  for (const test of errorTests) {
    try {
      const url = `${config.baseUrl}${test.path}`;
      console.log(`   🔍 Testing ${test.name}...`);
      
      const response = await makeRequest(url);
      
      if (response.status === test.expectedStatus) {
        console.log(`   ✅ ${test.name}: Correctly handled (${response.status})`);
      } else {
        console.log(`   ⚠️ ${test.name}: Unexpected response (${response.status})`);
      }
      
    } catch (error) {
      if (test.expectedStatus === 404 && error.message.includes('404')) {
        console.log(`   ✅ ${test.name}: Correctly handled (404)`);
      } else {
        console.log(`   ❌ ${test.name}: Request failed - ${error.message}`);
      }
    }
  }
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: config.timeout,
      headers: {
        'User-Agent': 'Mission-API-Test/1.0',
        ...options.headers
      }
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Run the test
if (require.main === module) {
  testMissionAPIConnection().then(() => {
    console.log('\n🏁 Mission API connection test finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Mission API connection test failed:', error);
    process.exit(1);
  });
}

module.exports = { testMissionAPIConnection };
