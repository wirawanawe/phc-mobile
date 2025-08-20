#!/usr/bin/env node

/**
 * Debug script for POST /api/users endpoint
 * This script helps identify what's causing 400 errors
 */

const BASE_URL = 'http://localhost:3000';

// Test cases
const testCases = [
  {
    name: 'Valid user creation',
    data: {
      name: 'Debug Test User',
      email: 'debug@example.com',
      password: 'password123'
    },
    expectedStatus: 200
  },
  {
    name: 'Missing name',
    data: {
      email: 'test@example.com',
      password: 'password123'
    },
    expectedStatus: 400
  },
  {
    name: 'Missing email',
    data: {
      name: 'Test User',
      password: 'password123'
    },
    expectedStatus: 400
  },
  {
    name: 'Missing password',
    data: {
      name: 'Test User',
      email: 'test@example.com'
    },
    expectedStatus: 400
  },
  {
    name: 'Empty fields',
    data: {
      name: '',
      email: '',
      password: ''
    },
    expectedStatus: 400
  },
  {
    name: 'Duplicate user (should fail)',
    data: {
      name: 'Debug Test User',
      email: 'debug@example.com',
      password: 'password123'
    },
    expectedStatus: 400
  }
];

async function testEndpoint(testCase) {
  try {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📤 Request data:`, JSON.stringify(testCase.data, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.data),
    });

    const responseData = await response.json();
    
    console.log(`📥 Status: ${response.status} ${response.statusText}`);
    console.log(`📥 Response:`, JSON.stringify(responseData, null, 2));
    
    if (response.status === testCase.expectedStatus) {
      console.log(`✅ PASS - Expected ${testCase.expectedStatus}, got ${response.status}`);
    } else {
      console.log(`❌ FAIL - Expected ${testCase.expectedStatus}, got ${response.status}`);
    }
    
    return { success: response.status === testCase.expectedStatus, data: responseData };
  } catch (error) {
    console.error(`❌ Error testing ${testCase.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting API Users Endpoint Debug Tests\n');
  console.log(`📍 Testing endpoint: ${BASE_URL}/api/users`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = await testEndpoint(testCase);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The API endpoint is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server logs for more details.');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/users`, { method: 'GET' });
    if (response.ok) {
      console.log('✅ Server is running and accessible');
      return true;
    }
  } catch (error) {
    console.error('❌ Server is not accessible:', error.message);
    console.log('💡 Make sure the server is running with: npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runTests();
}

main().catch(console.error);
