const api = require('../src/services/api');

async function testMobileAPI() {
  try {
    console.log('Testing mobile API calls...');
    
    // Test fitness API
    console.log('\n1. Testing fitness API...');
    const fitnessResponse = await api.getTodayFitness();
    console.log('Fitness response:', JSON.stringify(fitnessResponse, null, 2));
    
    // Test nutrition API
    console.log('\n2. Testing nutrition API...');
    const nutritionResponse = await api.getTodayNutrition();
    console.log('Nutrition response:', JSON.stringify(nutritionResponse, null, 2));
    
    // Test water API
    console.log('\n3. Testing water API...');
    const waterResponse = await api.getTodayWaterIntake();
    console.log('Water response:', JSON.stringify(waterResponse, null, 2));
    
    // Test today summary API
    console.log('\n4. Testing today summary API...');
    const summaryResponse = await api.getTodaySummary();
    console.log('Summary response:', JSON.stringify(summaryResponse, null, 2));
    
  } catch (error) {
    console.error('Error testing mobile API:', error);
  }
}

testMobileAPI(); 