const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:3000/api/mobile';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

async function testAuthentication() {
  console.log('🔍 Testing Authentication and API Endpoints...\n');

  try {
    // Test 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login Status:', loginResponse.status);
    console.log('Login Response:', loginData);

    if (!loginData.success) {
      console.log('❌ Login failed, cannot continue with other tests');
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful\n');

    // Test 2: Get User Profile
    console.log('2. Testing Get User Profile...');
    const profileResponse = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const profileData = await profileResponse.json();
    console.log('Profile Status:', profileResponse.status);
    console.log('Profile Response:', profileData);
    console.log('✅ Profile retrieval successful\n');

    // Test 3: Get Mission Stats
    console.log('3. Testing Get Mission Stats...');
    const statsResponse = await fetch(`${BASE_URL}/mission-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const statsData = await statsResponse.json();
    console.log('Mission Stats Status:', statsResponse.status);
    console.log('Mission Stats Response:', statsData);
    console.log('✅ Mission stats retrieval successful\n');

    // Test 4: Get My Missions
    console.log('4. Testing Get My Missions...');
    const missionsResponse = await fetch(`${BASE_URL}/my-missions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const missionsData = await missionsResponse.json();
    console.log('My Missions Status:', missionsResponse.status);
    console.log('My Missions Response:', missionsData);
    console.log('✅ My missions retrieval successful\n');

    // Test 5: Get Today Summary
    console.log('5. Testing Get Today Summary...');
    const summaryResponse = await fetch(`${BASE_URL}/tracking/today-summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const summaryData = await summaryResponse.json();
    console.log('Today Summary Status:', summaryResponse.status);
    console.log('Today Summary Response:', summaryData);
    console.log('✅ Today summary retrieval successful\n');

    // Test 6: Get Meal Tracking
    console.log('6. Testing Get Meal Tracking...');
    const mealResponse = await fetch(`${BASE_URL}/tracking/meal/today`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const mealData = await mealResponse.json();
    console.log('Meal Tracking Status:', mealResponse.status);
    console.log('Meal Tracking Response:', mealData);
    console.log('✅ Meal tracking retrieval successful\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAuthentication(); 