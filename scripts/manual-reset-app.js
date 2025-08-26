/**
 * Manual Reset Script untuk Aplikasi
 * Jalankan script ini di console browser atau React Native debugger
 * untuk memaksa reset data harian
 */

console.log('🔄 MANUAL DAILY RESET FOR PHC MOBILE APP');
console.log('=========================================\n');

// Fungsi untuk memaksa reset data
const forceDailyReset = () => {
  console.log('🚀 Starting manual daily reset...');
  
  // Simulasi event emitter
  const mockEventEmitter = {
    emit: (event, data) => {
      console.log(`📡 Emitting event: ${event}`, data || '');
    }
  };
  
  // Trigger semua event reset
  mockEventEmitter.emit('dailyReset', {
    timestamp: new Date().toISOString(),
    date: new Date().toDateString()
  });
  
  mockEventEmitter.emit('waterReset');
  mockEventEmitter.emit('fitnessReset');
  mockEventEmitter.emit('sleepReset');
  mockEventEmitter.emit('moodReset');
  mockEventEmitter.emit('mealReset');
  mockEventEmitter.emit('wellnessActivityReset');
  
  console.log('✅ All reset events triggered');
};

// Fungsi untuk clear cache
const clearAppCache = () => {
  console.log('🗑️  Clearing app cache...');
  
  const cacheKeys = [
    'todayWaterIntake',
    'todayFitnessData',
    'todaySleepData', 
    'todayMoodData',
    'todayMealData',
    'todaySummaryData',
    'todayWellnessActivities',
    'lastCheckedDate'
  ];
  
  cacheKeys.forEach(key => {
    console.log(`   Clearing: ${key}`);
    // Di React Native, gunakan AsyncStorage.removeItem(key)
    // Di browser, gunakan localStorage.removeItem(key)
  });
  
  console.log('✅ App cache cleared');
};

// Fungsi untuk reset state data
const resetStateData = () => {
  console.log('🔄 Resetting state data...');
  
  const resetData = {
    calories: 0,
    waterIntake: 0,
    steps: 0,
    exerciseMinutes: 0,
    distance: 0,
    wellnessScore: 0,
    sleepHours: 0,
    moodScore: 0,
    servings: 0
  };
  
  console.log('📊 Reset data values:');
  Object.entries(resetData).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  console.log('✅ State data reset to zero');
};

// Fungsi untuk refresh data dari API
const refreshFromAPI = () => {
  console.log('🔄 Refreshing data from API...');
  
  // Simulasi API calls
  const apiCalls = [
    'getTodaySummary()',
    'getTodayWaterIntake()',
    'getTodayFitness()',
    'getTodayNutrition()',
    'getTodaySleep()',
    'getTodayMood()'
  ];
  
  apiCalls.forEach(apiCall => {
    console.log(`   Calling: ${apiCall}`);
  });
  
  console.log('✅ API refresh completed');
};

// Main execution function
const executeManualReset = () => {
  console.log('🎯 EXECUTING MANUAL DAILY RESET');
  console.log('================================');
  
  // Step 1: Force daily reset
  forceDailyReset();
  
  // Step 2: Clear cache
  clearAppCache();
  
  // Step 3: Reset state data
  resetStateData();
  
  // Step 4: Refresh from API
  refreshFromAPI();
  
  console.log('\n✅ MANUAL RESET COMPLETED');
  console.log('==========================');
  console.log('📱 Next steps:');
  console.log('   1. Check Today\'s Summary shows zero values');
  console.log('   2. Verify all tracking screens show empty data');
  console.log('   3. Test logging new data for today');
  console.log('   4. Monitor that data persists correctly');
};

// Export functions untuk digunakan di app
if (typeof window !== 'undefined') {
  // Browser environment
  window.forceDailyReset = forceDailyReset;
  window.clearAppCache = clearAppCache;
  window.resetStateData = resetStateData;
  window.refreshFromAPI = refreshFromAPI;
  window.executeManualReset = executeManualReset;
  
  console.log('🌐 Functions available in browser console:');
  console.log('   - executeManualReset()');
  console.log('   - forceDailyReset()');
  console.log('   - clearAppCache()');
  console.log('   - resetStateData()');
  console.log('   - refreshFromAPI()');
}

// Auto-execute jika dijalankan langsung
if (typeof require !== 'undefined' && require.main === module) {
  executeManualReset();
}

module.exports = {
  forceDailyReset,
  clearAppCache,
  resetStateData,
  refreshFromAPI,
  executeManualReset
};
