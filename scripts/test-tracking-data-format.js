const api = require('../src/services/api.js');

async function testTrackingDataFormat() {
  try {
    console.log('🔍 Testing tracking data format...\n');
    
    // Initialize API
    await api.initialize();
    
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Testing for date:', today);
    
    // Test mood tracking
    console.log('\n1. Testing mood tracking format...');
    const moodResponse = await api.getMoodHistory({ date: today });
    console.log('Mood Response Structure:', {
      success: moodResponse.success,
      hasData: !!moodResponse.data,
      dataType: typeof moodResponse.data,
      isArray: Array.isArray(moodResponse.data),
      hasEntries: !!(moodResponse.data && moodResponse.data.entries),
      entriesLength: moodResponse.data?.entries?.length || 0,
      directLength: Array.isArray(moodResponse.data) ? moodResponse.data.length : 0
    });
    
    // Test water tracking
    console.log('\n2. Testing water tracking format...');
    const waterResponse = await api.getWaterHistory({ date: today });
    console.log('Water Response Structure:', {
      success: waterResponse.success,
      hasData: !!waterResponse.data,
      dataType: typeof waterResponse.data,
      isArray: Array.isArray(waterResponse.data),
      hasEntries: !!(waterResponse.data && waterResponse.data.entries),
      entriesLength: waterResponse.data?.entries?.length || 0,
      directLength: Array.isArray(waterResponse.data) ? waterResponse.data.length : 0
    });
    
    // Test fitness tracking
    console.log('\n3. Testing fitness tracking format...');
    const fitnessResponse = await api.getFitnessHistory({ date: today });
    console.log('Fitness Response Structure:', {
      success: fitnessResponse.success,
      hasData: !!fitnessResponse.data,
      dataType: typeof fitnessResponse.data,
      isArray: Array.isArray(fitnessResponse.data),
      hasEntries: !!(fitnessResponse.data && fitnessResponse.data.entries),
      entriesLength: fitnessResponse.data?.entries?.length || 0,
      directLength: Array.isArray(fitnessResponse.data) ? fitnessResponse.data.length : 0
    });
    
    // Test meal tracking
    console.log('\n4. Testing meal tracking format...');
    const mealResponse = await api.getMealHistory({ date: today });
    console.log('Meal Response Structure:', {
      success: mealResponse.success,
      hasData: !!mealResponse.data,
      dataType: typeof mealResponse.data,
      isArray: Array.isArray(mealResponse.data),
      hasEntries: !!(mealResponse.data && mealResponse.data.entries),
      entriesLength: mealResponse.data?.entries?.length || 0,
      directLength: Array.isArray(mealResponse.data) ? mealResponse.data.length : 0
    });
    
    // Test sleep tracking
    console.log('\n5. Testing sleep tracking format...');
    const sleepResponse = await api.getSleepHistory({ sleep_date: today });
    console.log('Sleep Response Structure:', {
      success: sleepResponse.success,
      hasData: !!sleepResponse.data,
      dataType: typeof sleepResponse.data,
      isArray: Array.isArray(sleepResponse.data),
      hasSleepData: !!(sleepResponse.data && sleepResponse.data.sleepData),
      sleepDataLength: sleepResponse.data?.sleepData?.length || 0,
      directLength: Array.isArray(sleepResponse.data) ? sleepResponse.data.length : 0
    });
    
    console.log('\n✅ Format testing completed!');
    
  } catch (error) {
    console.error('❌ Error testing tracking data format:', error);
  }
}

testTrackingDataFormat();
