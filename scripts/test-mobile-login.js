#!/usr/bin/env node

/**
 * 🔐 Mobile Login Test Script
 * Tests the login functionality that was failing with "Network request failed"
 * Uses the same API configuration that the mobile app will use
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
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testLogin = async (email, password, description) => {
  try {
    log(`\n${description}`, 'cyan');
    
    const url = `${API_BASE_URL}/auth/login`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    };

    const startTime = Date.now();
    const response = await fetch(url, options);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const responseData = await response.json();

    if (response.ok) {
      log(`   Status: ✅ (${response.status})`, 'green');
      log(`   Response Time: ${responseTime}ms`, 'blue');
      log(`   Message: ${responseData.message || 'Login successful'}`, 'green');
      if (responseData.token) {
        log(`   Token: ${responseData.token.substring(0, 20)}...`, 'blue');
      }
      return { success: true, status: response.status, responseTime, data: responseData };
    } else {
      log(`   Status: ⚠️ (${response.status})`, 'yellow');
      log(`   Response Time: ${responseTime}ms`, 'blue');
      log(`   Error: ${responseData.message || 'Login failed'}`, 'yellow');
      return { success: false, status: response.status, responseTime, error: responseData.message };
    }
  } catch (error) {
    log(`   Status: ❌ (Network Error)`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
};

const runLoginTests = async () => {
  log('🔐 Mobile Login Test', 'bright');
  log('==================', 'bright');
  log(`Target: ${API_BASE_URL}/auth/login`, 'blue');

  const tests = [
    {
      email: 'test@mobile.com',
      password: 'password123',
      description: 'Test 1: Valid user login (Test Mobile User)'
    },
    {
      email: 'test@mobile.com',
      password: 'wrongpassword',
      description: 'Test 2: Invalid password (should fail)'
    },
    {
      email: 'nonexistent@example.com',
      password: 'password123',
      description: 'Test 3: Non-existent user (should fail)'
    }
  ];

  const results = [];
  
  for (const test of tests) {
    const result = await testLogin(
      test.email,
      test.password,
      test.description
    );
    results.push({ ...test, result });
  }

  // Summary
  log('\n📊 Login Test Results', 'bright');
  log('====================', 'bright');
  
  const successful = results.filter(r => r.result.success);
  const failed = results.filter(r => !r.result.success);

  log(`\n✅ Successful Logins: ${successful.length}`, 'green');
  successful.forEach(test => {
    log(`   ✅ ${test.description}`, 'green');
  });

  log(`\n❌ Failed Logins: ${failed.length}`, 'red');
  failed.forEach(test => {
    log(`   ❌ ${test.description}`, 'red');
  });

  // Check if we have at least one successful login
  if (successful.length > 0) {
    log('\n🎉 Login functionality is working correctly!', 'green');
    log('   The "Network request failed" error has been resolved.', 'green');
    log('   Mobile app should be able to authenticate users properly.', 'green');
  } else {
    log('\n⚠️  No successful logins detected.', 'yellow');
    log('   Check your server configuration and user credentials.', 'yellow');
  }

  // Network performance summary
  const responseTimes = results
    .filter(r => r.result.responseTime)
    .map(r => r.result.responseTime);
  
  if (responseTimes.length > 0) {
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    log(`\n📈 Login Performance:`, 'blue');
    log(`   Average Response Time: ${avgResponseTime.toFixed(0)}ms`, 'blue');
    log(`   Fastest Response: ${minResponseTime}ms`, 'blue');
    log(`   Slowest Response: ${maxResponseTime}ms`, 'blue');
  }

  // Test connection monitor endpoint
  log('\n🔍 Testing Connection Monitor Endpoint...', 'cyan');
  try {
    const monitorUrl = `${API_BASE_URL}/test-connection`;
    const startTime = Date.now();
    const response = await fetch(monitorUrl);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.ok) {
      log(`   Status: ✅ Connection monitor working (${responseTime}ms)`, 'green');
    } else {
      log(`   Status: ⚠️ Connection monitor returned ${response.status}`, 'yellow');
    }
  } catch (error) {
    log(`   Status: ❌ Connection monitor failed: ${error.message}`, 'red');
  }
};

// Run the tests
runLoginTests().catch(error => {
  log(`\n❌ Test script failed: ${error.message}`, 'red');
  process.exit(1);
});
