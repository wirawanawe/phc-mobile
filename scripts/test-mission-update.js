#!/usr/bin/env node

/**
 * Test Script untuk Mission Update Progress
 * 
 * Script ini membantu untuk test dan debug fitur update progress mission
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://192.168.18.30:3000/api';
const TEST_USER_ID = 1; // Ganti dengan user ID yang valid

// Test data
const testCases = [
  {
    name: "Test Mission dengan ID Valid",
    userMissionId: 1,
    currentValue: 5,
    expectedStatus: "active"
  },
  {
    name: "Test Mission dengan Progress 100%",
    userMissionId: 1,
    currentValue: 10,
    expectedStatus: "completed"
  },
  {
    name: "Test Mission dengan ID Invalid",
    userMissionId: 999999,
    currentValue: 5,
    expectedStatus: "error"
  }
];

/**
 * Test API Health
 */
async function testApiHealth() {
  console.log('🔍 Testing API Health...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ API Health:', response.data);
    return true;
  } catch (error) {
    console.log('❌ API Health Failed:', error.message);
    return false;
  }
}

/**
 * Test Get User Missions
 */
async function testGetUserMissions() {
  console.log('\n🔍 Testing Get User Missions...');
  try {
    const response = await axios.get(`${API_BASE_URL}/mobile/missions/my-missions`);
    console.log('✅ Get User Missions Success');
    console.log('📊 Found', response.data.data?.length || 0, 'missions');
    
    if (response.data.data && response.data.data.length > 0) {
      const firstMission = response.data.data[0];
      console.log('🔍 First Mission:', {
        id: firstMission.id,
        title: firstMission.mission?.title,
        status: firstMission.status,
        current_value: firstMission.current_value,
        target_value: firstMission.mission?.target_value
      });
      return firstMission.id;
    }
    return null;
  } catch (error) {
    console.log('❌ Get User Missions Failed:', error.message);
    return null;
  }
}

/**
 * Test Get Specific User Mission
 */
async function testGetUserMission(userMissionId) {
  console.log(`\n🔍 Testing Get User Mission ID: ${userMissionId}...`);
  try {
    const response = await axios.get(`${API_BASE_URL}/mobile/missions/user-mission/${userMissionId}`);
    console.log('✅ Get User Mission Success');
    console.log('📊 Mission Data:', {
      id: response.data.data?.id,
      status: response.data.data?.status,
      current_value: response.data.data?.current_value,
      target_value: response.data.data?.target_value,
      mission_title: response.data.data?.mission?.title
    });
    return response.data.data;
  } catch (error) {
    console.log('❌ Get User Mission Failed:', error.message);
    if (error.response) {
      console.log('📤 Error Response:', error.response.data);
    }
    return null;
  }
}

/**
 * Test Update Mission Progress
 */
async function testUpdateMissionProgress(userMissionId, currentValue, notes = "") {
  console.log(`\n🔍 Testing Update Mission Progress...`);
  console.log(`📊 User Mission ID: ${userMissionId}`);
  console.log(`📊 Current Value: ${currentValue}`);
  console.log(`📊 Notes: ${notes}`);
  
  try {
    const response = await axios.put(`${API_BASE_URL}/mobile/missions/progress/${userMissionId}`, {
      current_value: currentValue,
      notes: notes
    });
    
    console.log('✅ Update Mission Progress Success');
    console.log('📤 Response:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Update Mission Progress Failed:', error.message);
    if (error.response) {
      console.log('📤 Error Response:', error.response.data);
    }
    return null;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Mission Update Progress Tests...\n');
  
  // Test 1: API Health
  const apiHealthy = await testApiHealth();
  if (!apiHealthy) {
    console.log('❌ API tidak sehat, test dihentikan');
    return;
  }
  
  // Test 2: Get User Missions
  const userMissionId = await testGetUserMissions();
  if (!userMissionId) {
    console.log('❌ Tidak ada user mission yang ditemukan, test dihentikan');
    return;
  }
  
  // Test 3: Get Specific User Mission
  const userMission = await testGetUserMission(userMissionId);
  if (!userMission) {
    console.log('❌ Tidak bisa mendapatkan detail user mission, test dihentikan');
    return;
  }
  
  // Test 4: Update Mission Progress
  const targetValue = userMission.target_value || 10;
  const testValue = Math.min(5, targetValue);
  
  console.log(`\n🎯 Running Update Progress Test...`);
  console.log(`📊 Target Value: ${targetValue}`);
  console.log(`📊 Test Value: ${testValue}`);
  
  const updateResult = await testUpdateMissionProgress(userMissionId, testValue, "Test update dari script");
  
  if (updateResult) {
    console.log('\n✅ Test berhasil!');
    console.log('📊 Update Result:', updateResult);
  } else {
    console.log('\n❌ Test gagal!');
  }
  
  // Test 5: Verify Update
  console.log('\n🔍 Verifying Update...');
  const updatedMission = await testGetUserMission(userMissionId);
  if (updatedMission) {
    console.log('✅ Verification Success');
    console.log('📊 Updated Mission:', {
      id: updatedMission.id,
      status: updatedMission.status,
      current_value: updatedMission.current_value,
      target_value: updatedMission.target_value
    });
  }
}

/**
 * Test specific user mission ID
 */
async function testSpecificMission(userMissionId, currentValue) {
  console.log(`🚀 Testing Specific Mission ID: ${userMissionId}...\n`);
  
  // Test API Health
  const apiHealthy = await testApiHealth();
  if (!apiHealthy) {
    console.log('❌ API tidak sehat, test dihentikan');
    return;
  }
  
  // Test Get Specific User Mission
  const userMission = await testGetUserMission(userMissionId);
  if (!userMission) {
    console.log('❌ Tidak bisa mendapatkan detail user mission, test dihentikan');
    return;
  }
  
  // Test Update Mission Progress
  const updateResult = await testUpdateMissionProgress(userMissionId, currentValue, "Test update dari script");
  
  if (updateResult) {
    console.log('\n✅ Test berhasil!');
    console.log('📊 Update Result:', updateResult);
  } else {
    console.log('\n❌ Test gagal!');
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length >= 2) {
  // Test specific mission
  const userMissionId = parseInt(args[0]);
  const currentValue = parseInt(args[1]);
  
  if (isNaN(userMissionId) || isNaN(currentValue)) {
    console.log('❌ Usage: node test-mission-update.js <userMissionId> <currentValue>');
    console.log('❌ Example: node test-mission-update.js 1 5');
    process.exit(1);
  }
  
  testSpecificMission(userMissionId, currentValue);
} else {
  // Run all tests
  runTests();
}
