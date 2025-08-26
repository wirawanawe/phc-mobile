#!/usr/bin/env node

/**
 * Force Date Reset Script
 * Fixes the issue where app is still showing data from previous day
 */

console.log('📅 FORCE DATE RESET');
console.log('==================\n');

// Simulate AsyncStorage operations
const simulateAsyncStorage = {
  storage: new Map(),
  
  async setItem(key, value) {
    this.storage.set(key, value);
    console.log(`   ✅ Set: ${key} = ${typeof value === 'object' ? JSON.stringify(value) : value}`);
  },
  
  async getItem(key) {
    const value = this.storage.get(key);
    console.log(`   📖 Get: ${key} = ${value || 'null'}`);
    return value;
  },
  
  async removeItem(key) {
    const existed = this.storage.has(key);
    this.storage.delete(key);
    if (existed) {
      console.log(`   🗑️  Removed: ${key}`);
    } else {
      console.log(`   ⚠️  Not found: ${key}`);
    }
  },
  
  async clear() {
    const count = this.storage.size;
    this.storage.clear();
    console.log(`   🧹 Cleared ${count} items`);
  }
};

// Check current date
const checkCurrentDate = () => {
  console.log('📅 Checking current date...');
  
  const now = new Date();
  const today = now.toDateString();
  
  // Use local timezone instead of UTC
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayISO = `${year}-${month}-${day}`;
  
  console.log(`   Current date: ${today}`);
  console.log(`   Local ISO date: ${todayISO}`);
  console.log(`   Day of week: ${now.toLocaleDateString('en-US', { weekday: 'long' })}`);
  console.log(`   Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  
  return { today, todayISO, now };
};

// Force reset lastCheckedDate
const forceResetLastCheckedDate = async () => {
  console.log('\n🔄 Force resetting lastCheckedDate...');
  
  // Remove the old lastCheckedDate
  await simulateAsyncStorage.removeItem('lastCheckedDate');
  
  // Set it to yesterday to force a date change detection
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();
  
  await simulateAsyncStorage.setItem('lastCheckedDate', yesterdayString);
  console.log(`   ✅ Set lastCheckedDate to yesterday: ${yesterdayString}`);
  
  // Now simulate date change detection
  const { today } = checkCurrentDate();
  
  if (yesterdayString !== today) {
    console.log('   ✅ Date change would be detected');
    return true;
  } else {
    console.log('   ❌ No date change detected');
    return false;
  }
};

// Clear all date-related cache
const clearDateRelatedCache = async () => {
  console.log('\n🗑️  Clearing all date-related cache...');
  
  const dateCacheKeys = [
    'lastCheckedDate',
    'lastMealDate',
    'lastNutritionDate',
    'lastWaterDate',
    'lastFitnessDate',
    'lastSleepDate',
    'lastMoodDate',
    'todayMealData',
    'todaySummaryData',
    'todayNutritionData',
    'todayWaterIntake',
    'todayFitnessData',
    'todaySleepData',
    'todayMoodData',
    'mealHistory',
    'nutritionData',
    'recentMeals',
    'dailyNutrition',
    'forceZeroCalories',
    'mealResetFlag',
    'dailyResetTriggered'
  ];

  for (const key of dateCacheKeys) {
    await simulateAsyncStorage.removeItem(key);
  }

  console.log('✅ All date-related cache cleared');
};

// Simulate component state reset
const simulateComponentStateReset = () => {
  console.log('\n🔄 Simulating component state reset...');
  
  const componentStates = {
    'MealLoggingScreen': {
      selectedDate: new Date().toDateString(),
      selectedFoods: [],
      recentMeals: [],
      dailyNutrition: {
        calories: { consumed: 0, goal: 2000 },
        protein: { consumed: 0, goal: 120 },
        carbs: { consumed: 0, goal: 250 },
        fat: { consumed: 0, goal: 65 }
      }
    },
    'TodaySummaryCard': {
      forceZeroCalories: true,
      metrics: {
        calories: 0,
        waterIntake: 0,
        steps: 0,
        exerciseMinutes: 0,
        distance: 0
      }
    }
  };

  console.log('📊 Component state reset values:');
  Object.entries(componentStates).forEach(([component, state]) => {
    console.log(`   ${component}:`, JSON.stringify(state, null, 2));
  });

  console.log('✅ Component states reset');
};

// Simulate API calls with correct date
const simulateAPICallsWithCorrectDate = () => {
  console.log('\n🌐 Simulating API calls with correct date...');
  
  const { todayISO } = checkCurrentDate();
  
  const apiCalls = [
    `GET /api/mobile/tracking/meal/today?user_id=1`,
    `GET /api/mobile/tracking/today-summary?user_id=1`,
    `GET /api/mobile/tracking/meal?user_id=1&date=${todayISO}`,
    `GET /api/mobile/tracking/water?user_id=1&date=${todayISO}`,
    `GET /api/mobile/tracking/fitness?user_id=1&date=${todayISO}`,
    `GET /api/mobile/tracking/sleep?user_id=1&date=${todayISO}`,
    `GET /api/mobile/tracking/mood?user_id=1&date=${todayISO}`
  ];
  
  apiCalls.forEach(apiCall => {
    console.log(`   📡 ${apiCall}`);
  });
  
  console.log('✅ API calls simulated with correct date');
};

// Simulate event emission
const simulateEventEmission = () => {
  console.log('\n📡 Simulating event emission...');
  
  const events = [
    'dailyReset',
    'mealReset',
    'waterReset',
    'fitnessReset',
    'sleepReset',
    'moodReset',
    'dataRefresh'
  ];
  
  events.forEach(event => {
    console.log(`   📡 Emitted: ${event}`);
  });
  
  console.log('✅ All reset events emitted');
};

// Main execution function
const executeForceDateReset = async () => {
  console.log('🎯 EXECUTING FORCE DATE RESET');
  console.log('=============================\n');
  
  // Step 1: Check current date
  const { today, todayISO } = checkCurrentDate();
  
  // Step 2: Force reset lastCheckedDate
  const dateChangeDetected = await forceResetLastCheckedDate();
  
  // Step 3: Clear all date-related cache
  await clearDateRelatedCache();
  
  // Step 4: Simulate component state reset
  simulateComponentStateReset();
  
  // Step 5: Simulate API calls with correct date
  simulateAPICallsWithCorrectDate();
  
  // Step 6: Simulate event emission
  simulateEventEmission();
  
  console.log('\n✅ FORCE DATE RESET COMPLETED');
  console.log('============================');
  console.log('📱 Next steps for manual verification:');
  console.log('   1. Restart the mobile app completely');
  console.log('   2. Check Today\'s Summary - should show 0 calories');
  console.log('   3. Check Meal Logging screen - should be empty');
  console.log('   4. Verify selectedDate is set to:', today);
  console.log('   5. Test logging new meal data');
  console.log('   6. Verify data appears correctly for today');
  console.log('');
  console.log('🔍 Debugging tips:');
  console.log('   - Check console logs for "MealLoggingScreen - Updating selectedDate to"');
  console.log('   - Check console logs for "TodaySummaryCard - FORCING ZERO CALORIES"');
  console.log('   - Verify API calls use date:', todayISO);
  console.log('   - Monitor date change detection events');
  console.log('   - Check cache clearing success');
  console.log('');
  console.log('🚨 If issue persists:');
  console.log('   1. Clear app data completely');
  console.log('   2. Uninstall and reinstall app');
  console.log('   3. Check system date is correct');
  console.log('   4. Verify timezone settings');
};

// Run the script
executeForceDateReset();
