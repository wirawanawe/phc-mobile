// Simple test script to verify date selection functionality
const fetch = require('node-fetch');

async function testDateAPI() {
  console.log('Testing date selection API functionality...');
  
  const baseURL = 'http://localhost:3000/api/mobile';
  const testUserId = '1'; // Use a test user ID
  
  try {
    // Test 1: Get summary for today
    console.log('\n1. Testing today summary...');
    const todayResponse = await fetch(`${baseURL}/tracking/today-summary?user_id=${testUserId}`);
    const todayData = await todayResponse.json();
    console.log('Today summary response:', todayData.success ? 'SUCCESS' : 'FAILED');
    console.log('Today summary data:', todayData.data ? 'Has data' : 'No data');
    
    // Test 2: Get summary for a specific date
    console.log('\n2. Testing specific date summary...');
    const testDate = '2024-01-15'; // Use a date that might have data
    const dateResponse = await fetch(`${baseURL}/tracking/today-summary?user_id=${testUserId}&date=${testDate}`);
    const dateData = await dateResponse.json();
    console.log(`Summary for ${testDate}:`, dateData.success ? 'SUCCESS' : 'FAILED');
    console.log(`Date summary data:`, dateData.data ? 'Has data' : 'No data');
    
    // Test 3: Test meal history with date
    console.log('\n3. Testing meal history with date...');
    const mealHistoryResponse = await fetch(`${baseURL}/tracking/meal?user_id=${testUserId}&date=${testDate}`);
    const mealData = await mealHistoryResponse.json();
    console.log(`Meal history for ${testDate}:`, mealData.success ? 'SUCCESS' : 'FAILED');
    console.log(`Meal data:`, mealData.data ? 'Has data' : 'No data');
    
    // Test 4: Test water history with date
    console.log('\n4. Testing water history with date...');
    const waterHistoryResponse = await fetch(`${baseURL}/tracking/water?user_id=${testUserId}&date=${testDate}`);
    const waterData = await waterHistoryResponse.json();
    console.log(`Water history for ${testDate}:`, waterData.success ? 'SUCCESS' : 'FAILED');
    console.log(`Water data:`, waterData.data ? 'Has data' : 'No data');
    
    // Test 5: Test fitness history with date
    console.log('\n5. Testing fitness history with date...');
    const fitnessHistoryResponse = await fetch(`${baseURL}/tracking/fitness?user_id=${testUserId}&date=${testDate}`);
    const fitnessData = await fitnessHistoryResponse.json();
    console.log(`Fitness history for ${testDate}:`, fitnessData.success ? 'SUCCESS' : 'FAILED');
    console.log(`Fitness data:`, fitnessData.data ? 'Has data' : 'No data');
    
    console.log('\n✅ Date selection API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDateAPI();
