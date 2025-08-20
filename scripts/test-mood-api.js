import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test the mood APIs without authentication first
async function testMoodAPIs() {
  console.log('🧪 Testing Mood APIs...\n');

  // Test 1: Get today's mood (should work without auth for testing)
  console.log('1. Testing GET /api/mobile/wellness/mood-tracker/today');
  try {
    const todayResponse = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker/today?user_id=1`);
    const todayResult = await todayResponse.json();
    console.log('Response:', JSON.stringify(todayResult, null, 2));
    console.log('Status:', todayResponse.status);
    console.log('✅ Get today mood test completed\n');
  } catch (error) {
    console.error('❌ Get today mood test failed:', error.message);
  }

  // Test 2: Get mood tracker data
  console.log('2. Testing GET /api/mobile/wellness/mood-tracker');
  try {
    const trackerResponse = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker?user_id=1&period=7`);
    const trackerResult = await trackerResponse.json();
    console.log('Response:', JSON.stringify(trackerResult, null, 2));
    console.log('Status:', trackerResponse.status);
    console.log('✅ Get mood tracker test completed\n');
  } catch (error) {
    console.error('❌ Get mood tracker test failed:', error.message);
  }

  // Test 3: Check what today's date should be
  const today = new Date().toISOString().split('T')[0];
  console.log('3. Today\'s date format:', today);
  console.log('✅ Date format test completed\n');
}

// Run the tests
testMoodAPIs();
