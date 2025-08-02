// Test script to verify date selection functionality
const api = require('../src/services/api.js');

async function testDateSelection() {
  console.log('Testing date selection functionality...');
  
  try {
    // Test 1: Get summary for today
    console.log('\n1. Testing getTodaySummary()...');
    const todayResponse = await api.getTodaySummary();
    console.log('Today summary response:', todayResponse.success ? 'SUCCESS' : 'FAILED');
    
    // Test 2: Get summary for a specific date
    console.log('\n2. Testing getSummaryByDate()...');
    const testDate = '2024-01-15'; // Use a date that might have data
    const dateResponse = await api.getSummaryByDate(testDate);
    console.log(`Summary for ${testDate}:`, dateResponse.success ? 'SUCCESS' : 'FAILED');
    
    // Test 3: Test meal history with date
    console.log('\n3. Testing getMealHistory() with date...');
    const mealHistoryResponse = await api.getMealHistory({ date: testDate });
    console.log(`Meal history for ${testDate}:`, mealHistoryResponse.success ? 'SUCCESS' : 'FAILED');
    
    // Test 4: Test water history with date
    console.log('\n4. Testing getWaterHistory() with date...');
    const waterHistoryResponse = await api.getWaterHistory({ date: testDate });
    console.log(`Water history for ${testDate}:`, waterHistoryResponse.success ? 'SUCCESS' : 'FAILED');
    
    // Test 5: Test fitness history with date
    console.log('\n5. Testing getFitnessHistory() with date...');
    const fitnessHistoryResponse = await api.getFitnessHistory({ date: testDate });
    console.log(`Fitness history for ${testDate}:`, fitnessHistoryResponse.success ? 'SUCCESS' : 'FAILED');
    
    console.log('\n✅ Date selection functionality test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDateSelection(); 