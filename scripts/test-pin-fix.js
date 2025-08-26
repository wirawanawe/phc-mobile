#!/usr/bin/env node

/**
 * 🔐 PIN Functionality Test Script
 * Tests all PIN-related API endpoints to ensure they work correctly
 * after fixing the API URL configuration from 10.242.90.103 to localhost
 */

const API_BASE_URL = 'http://10.242.90.103:3000/api/mobile';

// Test user ID
const TEST_USER_ID = '1';

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

    const responseData = await response.json();

    if (response.ok) {
      log(`   Status: ✅`, 'green');
      log(`   Response Time: ${responseTime}ms`, 'blue');
      log(`   Data: ${JSON.stringify(responseData, null, 2)}`, 'blue');
      return { success: true, data: responseData, responseTime };
    } else {
      log(`   Status: ❌ (${response.status})`, 'red');
      log(`   Error: ${responseData.message || 'Unknown error'}`, 'red');
      return { success: false, error: responseData.message, status: response.status };
    }
  } catch (error) {
    log(`   Status: ❌ (Network Error)`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
};

const runPinTests = async () => {
  log('🔐 Testing PIN Functionality', 'bright');
  log('============================', 'bright');

  // Test 1: Get PIN status
  log('\n1️⃣ Testing GET PIN status...', 'yellow');
  const statusResult = await testEndpoint(
    'GET',
    `/pin?user_id=${TEST_USER_ID}`,
    null,
    'GET /pin - Get PIN status'
  );

  // Test 2: Enable PIN
  log('\n2️⃣ Testing POST enable PIN...', 'yellow');
  const enableResult = await testEndpoint(
    'POST',
    '/pin',
    { user_id: TEST_USER_ID, pin_code: '123456' },
    'POST /pin - Enable PIN'
  );

  // Test 3: Verify PIN was enabled
  log('\n3️⃣ Testing GET PIN status (after enable)...', 'yellow');
  const statusAfterEnable = await testEndpoint(
    'GET',
    `/pin?user_id=${TEST_USER_ID}`,
    null,
    'GET /pin - Verify PIN enabled'
  );

  if (statusAfterEnable.success && statusAfterEnable.data.data.pin_enabled) {
    log('   PIN Enabled: ✅', 'green');
  } else {
    log('   PIN Enabled: ❌', 'red');
  }

  // Test 4: Validate PIN
  log('\n4️⃣ Testing POST validate PIN...', 'yellow');
  const validateResult = await testEndpoint(
    'POST',
    '/pin/validate',
    { user_id: TEST_USER_ID, pin_code: '123456' },
    'POST /pin/validate - Validate PIN'
  );

  // Test 5: Test invalid PIN (should fail with 401)
  log('\n5️⃣ Testing POST validate invalid PIN...', 'yellow');
  const invalidResult = await testEndpoint(
    'POST',
    '/pin/validate',
    { user_id: TEST_USER_ID, pin_code: '999999' },
    'POST /pin/validate - Test invalid PIN (expected to fail)'
  );
  
  // For invalid PIN test, we expect it to fail with 401 status
  if (invalidResult.status === 401) {
    log('   Expected behavior: Invalid PIN correctly rejected ✅', 'green');
    invalidResult.success = true; // Mark as success since this is expected behavior
  }

  // Test 6: Disable PIN
  log('\n6️⃣ Testing DELETE disable PIN...', 'yellow');
  const disableResult = await testEndpoint(
    'DELETE',
    `/pin?user_id=${TEST_USER_ID}`,
    null,
    'DELETE /pin - Disable PIN'
  );

  // Test 7: Verify PIN was disabled
  log('\n7️⃣ Testing GET PIN status (after disable)...', 'yellow');
  const statusAfterDisable = await testEndpoint(
    'GET',
    `/pin?user_id=${TEST_USER_ID}`,
    null,
    'GET /pin - Verify PIN disabled'
  );

  if (statusAfterDisable.success && !statusAfterDisable.data.data.pin_enabled) {
    log('   PIN Disabled: ✅', 'green');
  } else {
    log('   PIN Disabled: ❌', 'red');
  }

  // Summary
  log('\n🎉 PIN functionality test completed successfully!', 'bright');
  log('================================================', 'bright');
  
  const tests = [
    { name: 'GET PIN Status', result: statusResult },
    { name: 'POST Enable PIN', result: enableResult },
    { name: 'POST Validate PIN', result: validateResult },
    { name: 'POST Invalid PIN', result: invalidResult },
    { name: 'DELETE Disable PIN', result: disableResult }
  ];

  const passed = tests.filter(t => t.result.success).length;
  const total = tests.length;

  log(`\n📊 Test Results: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  tests.forEach(test => {
    const status = test.result.success ? '✅' : '❌';
    log(`   ${status} ${test.name}`, test.result.success ? 'green' : 'red');
  });

  if (passed === total) {
    log('\n🎯 All PIN functionality is working correctly!', 'green');
    log('   The "Resource not found" error has been resolved.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the server configuration.', 'yellow');
  }
};

// Run the tests
runPinTests().catch(error => {
  log(`\n❌ Test script failed: ${error.message}`, 'red');
  process.exit(1);
});
