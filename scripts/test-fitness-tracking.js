const api = require('../src/services/api.js');

async function testFitnessTracking() {
  try {
    console.log('🧪 Testing fitness tracking...');
    
    // Test data that matches what the mobile app sends
    const testData = {
      workout_type: "Running",
      exercise_minutes: 30,
      calories_burned: 300,
      distance_km: 5,
      steps: 0,
      notes: "Test entry from script",
      tracking_date: new Date().toISOString().split('T')[0]
    };
    
    console.log('📤 Sending test data:', testData);
    
    const response = await api.createFitnessEntry(testData);
    
    console.log('📥 Response:', response);
    
    if (response.success) {
      console.log('✅ Fitness tracking test successful!');
      
      // Try to get the fitness history
      console.log('📊 Getting fitness history...');
      const historyResponse = await api.getFitnessHistory();
      console.log('📋 Fitness history:', historyResponse);
    } else {
      console.log('❌ Fitness tracking test failed:', response.message);
    }
    
  } catch (error) {
    console.error('💥 Error in fitness tracking test:', error);
  }
}

testFitnessTracking(); 