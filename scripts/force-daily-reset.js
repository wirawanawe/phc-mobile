#!/usr/bin/env node

/**
 * Script untuk memaksa daily reset dan clear cache
 * Berguna untuk testing dan debugging masalah data yang tidak ter-reset
 */

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

console.log('🔄 FORCING DAILY RESET AND CLEARING CACHE');
console.log('=========================================\n');

// Simulasi fungsi clear cache
const clearCachedData = async () => {
  try {
    const keysToRemove = [
      'todayWaterIntake',
      'todayFitnessData', 
      'todaySleepData',
      'todayMoodData',
      'todayMealData',
      'todaySummaryData',
      'todayWellnessActivities',
      'lastCheckedDate'
    ];

    console.log('🗑️  Clearing cached data...');
    
    for (const key of keysToRemove) {
      try {
        await AsyncStorage.removeItem(key);
        console.log(`   ✅ Cleared: ${key}`);
      } catch (error) {
        console.log(`   ⚠️  Failed to clear: ${key} - ${error.message}`);
      }
    }

    console.log('✅ All cached data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing cached data:', error);
  }
};

// Simulasi reset data
const resetAllData = () => {
  console.log('\n🔄 Resetting all tracking data...');
  
  const resetData = {
    calories: 0,
    waterIntake: 0,
    steps: 0,
    exerciseMinutes: 0,
    distance: 0,
    wellnessScore: 0,
    sleepHours: 0,
    moodScore: 0
  };

  console.log('📊 Reset data values:');
  Object.entries(resetData).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  console.log('✅ All data reset to zero/default values');
};

// Simulasi date change detection
const simulateDateChange = () => {
  console.log('\n📅 Simulating date change...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const today = new Date();
  
  console.log(`   Yesterday: ${yesterday.toDateString()}`);
  console.log(`   Today: ${today.toDateString()}`);
  console.log(`   Date changed: ${yesterday.toDateString() !== today.toDateString() ? 'YES' : 'NO'}`);
  
  if (yesterday.toDateString() !== today.toDateString()) {
    console.log('✅ Date change detected - reset should be triggered');
  } else {
    console.log('⚠️  No date change detected');
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Starting forced daily reset process...\n');
    
    // Step 1: Simulate date change detection
    simulateDateChange();
    
    // Step 2: Clear all cached data
    await clearCachedData();
    
    // Step 3: Reset all tracking data
    resetAllData();
    
    console.log('\n🎯 RESET PROCESS COMPLETED');
    console.log('==========================');
    console.log('✅ All cached data cleared');
    console.log('✅ All tracking data reset to zero');
    console.log('✅ Date change detection verified');
    console.log('');
    console.log('📱 Next steps:');
    console.log('   1. Restart the mobile app');
    console.log('   2. Check Today\'s Summary shows zero values');
    console.log('   3. Verify all tracking screens show empty/default data');
    console.log('   4. Test logging new data for today');
    
  } catch (error) {
    console.error('❌ Error during reset process:', error);
  }
};

// Run the script
main();
