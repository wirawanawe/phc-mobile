#!/usr/bin/env node

/**
 * 🌐 Network Connectivity Test Script
 * Tests all critical API endpoints to ensure mobile app can connect properly
 * Uses the same IP address that the mobile app will use
 */

const API_BASE_URL = 'http://10.242.90.103:3000/api/mobile';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testEndpoint = async (method, endpoint, data = null, description = '') => {
  try {
    log(`\n${description}`, 'cyan');
    
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const startTime = Date.now();
    const response = await fetch(url, options);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.ok) {
      const responseData = await response.json();
      log(`   Status: ✅ (${response.status})`, 'green');
      log(`   Response Time: ${responseTime}ms`, 'blue');
      return { success: true, status: response.status, responseTime, data: responseData };
    } else {
      log(`   Status: ⚠️ (${response.status})`, 'yellow');
      log(`   Response Time: ${responseTime}ms`, 'blue');
      // For auth endpoints, 401/403 are expected without credentials
      if (response.status === 401 || response.status === 403) {
        log(`   Expected: Authentication required`, 'yellow');
        return { success: true, status: response.status, responseTime, expected: true };
      }
      return { success: false, status: response.status, responseTime };
    }
  } catch (error) {
    log(`   Status: ❌ (Network Error)`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
};

const runConnectivityTests = async () => {
  log('🌐 Network Connectivity Test', 'bright');
  log('============================', 'bright');
  log(`Target: ${API_BASE_URL}`, 'blue');

  const tests = [
    {
      method: 'GET',
      endpoint: '/health',
      description: 'Health Check - Basic connectivity test'
    },
    {
      method: 'GET',
      endpoint: '/pin?user_id=1',
      description: 'PIN Status - Authentication endpoint test'
    },
    {
      method: 'POST',
      endpoint: '/auth/login',
      data: { email: 'test@example.com', password: 'test' },
      description: 'Login Endpoint - Authentication service test'
    },
    {
      method: 'GET',
      endpoint: '/users',
      description: 'Users Endpoint - Data service test'
    },
    {
      method: 'GET',
      endpoint: '/missions',
      description: 'Missions Endpoint - Feature service test'
    },
    {
      method: 'GET',
      endpoint: '/tracking/meal/today?user_id=1',
      description: 'Meal Tracking - Data tracking service test'
    },
    {
      method: 'GET',
      endpoint: '/tracking/water/today?user_id=1',
      description: 'Water Tracking - Health data service test'
    },
    {
      method: 'GET',
      endpoint: '/wellness/activities?user_id=1',
      description: 'Wellness Activities - Wellness service test'
    }
  ];

  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(
      test.method,
      test.endpoint,
      test.data,
      test.description
    );
    results.push({ ...test, result });
  }

  // Summary
  log('\n📊 Connectivity Test Results', 'bright');
  log('============================', 'bright');
  
  const successful = results.filter(r => r.result.success);
  const failed = results.filter(r => !r.result.success);
  const expectedFailures = results.filter(r => r.result.expected);

  log(`\n✅ Successful Connections: ${successful.length}`, 'green');
  successful.forEach(test => {
    log(`   ✅ ${test.description}`, 'green');
  });

  if (expectedFailures.length > 0) {
    log(`\n⚠️  Expected Failures (Auth Required): ${expectedFailures.length}`, 'yellow');
    expectedFailures.forEach(test => {
      log(`   ⚠️  ${test.description}`, 'yellow');
    });
  }

  if (failed.length > 0) {
    log(`\n❌ Failed Connections: ${failed.length}`, 'red');
    failed.forEach(test => {
      log(`   ❌ ${test.description}`, 'red');
    });
  }

  const totalSuccessful = successful.length + expectedFailures.length;
  const totalTests = results.length;

  log(`\n🎯 Overall Success Rate: ${totalSuccessful}/${totalTests}`, 
      totalSuccessful === totalTests ? 'green' : 'yellow');

  if (totalSuccessful === totalTests) {
    log('\n🎉 All network connectivity tests passed!', 'green');
    log('   Your mobile app should be able to connect to all services.', 'green');
  } else {
    log('\n⚠️  Some connectivity issues detected.', 'yellow');
    log('   Check your server configuration and network settings.', 'yellow');
  }

  // Network performance summary
  const responseTimes = results
    .filter(r => r.result.responseTime)
    .map(r => r.result.responseTime);
  
  if (responseTimes.length > 0) {
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    log(`\n📈 Network Performance:`, 'blue');
    log(`   Average Response Time: ${avgResponseTime.toFixed(0)}ms`, 'blue');
    log(`   Fastest Response: ${minResponseTime}ms`, 'blue');
    log(`   Slowest Response: ${maxResponseTime}ms`, 'blue');
  }
};

// Run the tests
runConnectivityTests().catch(error => {
  log(`\n❌ Test script failed: ${error.message}`, 'red');
  process.exit(1);
});
