#!/usr/bin/env node

/**
 * Test script untuk memverifikasi clinic_id tersimpan dengan benar
 * saat membuat user admin
 */

const BASE_URL = 'http://localhost:3000';

// Test cases untuk clinic_id
const testCases = [
  {
    name: 'Admin dengan clinic_id = 1',
    data: {
      name: 'Admin Klinik 1',
      email: 'admin.klinik1@test.com',
      password: 'password123',
      role: 'admin',
      clinic_id: 1
    },
    expectedClinicId: 1
  },
  {
    name: 'Admin dengan clinic_id = 2',
    data: {
      name: 'Admin Klinik 2',
      email: 'admin.klinik2@test.com',
      password: 'password123',
      role: 'admin',
      clinic_id: 2
    },
    expectedClinicId: 2
  },
  {
    name: 'Admin tanpa clinic_id (null)',
    data: {
      name: 'Admin No Clinic',
      email: 'admin.noclinic@test.com',
      password: 'password123',
      role: 'admin',
      clinic_id: null
    },
    expectedClinicId: null
  },
  {
    name: 'Staff dengan clinic_id = 1',
    data: {
      name: 'Staff Klinik 1',
      email: 'staff.klinik1@test.com',
      password: 'password123',
      role: 'staff',
      clinic_id: 1
    },
    expectedClinicId: 1
  }
];

async function testClinicIdSaving(testCase) {
  try {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📤 Request data:`, JSON.stringify(testCase.data, null, 2));
    
    // Create user
    const createResponse = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.data),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.log(`❌ Failed to create user:`, errorData);
      return { success: false, error: errorData };
    }

    const createResult = await createResponse.json();
    console.log(`✅ User created with ID:`, createResult.data.id);

    // Get user data to verify clinic_id
    const getResponse = await fetch(`${BASE_URL}/api/users/${createResult.data.id}`);
    
    if (!getResponse.ok) {
      console.log(`❌ Failed to get user data`);
      return { success: false, error: 'Failed to get user data' };
    }

    const userData = await getResponse.json();
    console.log(`📥 Retrieved user data:`, JSON.stringify(userData, null, 2));

    // Verify clinic_id
    const actualClinicId = userData.clinic_id;
    const expectedClinicId = testCase.expectedClinicId;

    if (actualClinicId === expectedClinicId) {
      console.log(`✅ PASS - clinic_id matches: ${actualClinicId}`);
      return { success: true, userData };
    } else {
      console.log(`❌ FAIL - Expected clinic_id: ${expectedClinicId}, got: ${actualClinicId}`);
      return { success: false, expected: expectedClinicId, actual: actualClinicId };
    }

  } catch (error) {
    console.error(`❌ Error testing ${testCase.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testClinicIdUpdate() {
  try {
    console.log(`\n🔄 Testing clinic_id update...`);
    
    // First create a user
    const createData = {
      name: 'Update Test User',
      email: 'update.test@example.com',
      password: 'password123',
      role: 'admin',
      clinic_id: 1
    };

    const createResponse = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createData),
    });

    if (!createResponse.ok) {
      console.log(`❌ Failed to create user for update test`);
      return false;
    }

    const createResult = await createResponse.json();
    const userId = createResult.data.id;

    // Update user with different clinic_id
    const updateData = {
      name: 'Update Test User',
      email: 'update.test@example.com',
      role: 'admin',
      clinic_id: 2
    };

    const updateResponse = await fetch(`${BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      console.log(`❌ Failed to update user`);
      return false;
    }

    // Verify the update
    const getResponse = await fetch(`${BASE_URL}/api/users/${userId}`);
    const userData = await getResponse.json();

    if (userData.clinic_id === 2) {
      console.log(`✅ PASS - clinic_id updated successfully: ${userData.clinic_id}`);
      return true;
    } else {
      console.log(`❌ FAIL - clinic_id not updated. Expected: 2, got: ${userData.clinic_id}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error in update test:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Clinic ID Test Suite\n');
  console.log(`📍 Testing endpoint: ${BASE_URL}/api/users`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
  
  let passed = 0;
  let failed = 0;
  
  // Test creation with clinic_id
  for (const testCase of testCases) {
    const result = await testClinicIdSaving(testCase);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test update functionality
  const updateResult = await testClinicIdUpdate();
  if (updateResult) {
    passed++;
  } else {
    failed++;
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (testCases.length + 1)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! clinic_id is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
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
