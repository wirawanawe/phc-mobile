const BASE_URL = 'http://localhost:3000/api/mobile';

// Test user credentials - using the hardcoded test user
const TEST_USER = {
  email: 'test@mobile.com',
  password: 'password123'
};

async function testAPIEndpoints() {
  try {
    console.log('🔍 Testing API endpoints for data display...\n');

    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.error('❌ Login failed');
      return;
    }
    
    const token = loginData.data.accessToken;
    console.log('✅ Login successful\n');

    // 2. Test today summary
    console.log('2. Testing today summary...');
    const summaryResponse = await fetch(`${BASE_URL}/tracking/today-summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const summaryData = await summaryResponse.json();
    console.log('Today summary response:', JSON.stringify(summaryData, null, 2));
    console.log('✅ Today summary test completed\n');

    // 3. Test nutrition data
    console.log('3. Testing nutrition data...');
    const nutritionResponse = await fetch(`${BASE_URL}/tracking/meal/today`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const nutritionData = await nutritionResponse.json();
    console.log('Nutrition response:', JSON.stringify(nutritionData, null, 2));
    console.log('✅ Nutrition test completed\n');

    // 4. Test fitness data
    console.log('4. Testing fitness data...');
    const fitnessResponse = await fetch(`${BASE_URL}/tracking/fitness/today`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const fitnessData = await fitnessResponse.json();
    console.log('Fitness response:', JSON.stringify(fitnessData, null, 2));
    console.log('✅ Fitness test completed\n');

    // 5. Test water data
    console.log('5. Testing water data...');
    const waterResponse = await fetch(`${BASE_URL}/tracking/water/today`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const waterData = await waterResponse.json();
    console.log('Water response:', JSON.stringify(waterData, null, 2));
    console.log('✅ Water test completed\n');

    // 6. Summary of data structure
    console.log('📊 Data Structure Summary:');
    console.log('Today Summary:', {
      meal: summaryData.data?.meal,
      fitness: summaryData.data?.fitness,
      water: summaryData.data?.water,
    });
    console.log('Nutrition:', {
      totals: nutritionData.data?.totals,
      meals_by_type: nutritionData.data?.meals_by_type,
    });
    console.log('Fitness:', {
      totals: fitnessData.data?.totals,
      activities_by_type: fitnessData.data?.activities_by_type,
    });
    console.log('Water:', {
      totals: waterData.data?.totals,
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAPIEndpoints(); 