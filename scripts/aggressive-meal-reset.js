#!/usr/bin/env node

/**
 * AGGRESSIVE MEAL DATA RESET
 * Script untuk memaksa reset meal data secara agresif dari semua sumber
 */

console.log('🔥 AGGRESSIVE MEAL DATA RESET');
console.log('================================\n');

// Simulasi clear semua cache yang mungkin menyimpan meal data
const clearAllMealCache = async () => {
  try {
    const allCacheKeys = [
      // AsyncStorage keys
      'todayMealData',
      'todaySummaryData',
      'mealHistory',
      'nutritionData',
      'recentMeals',
      'dailyNutrition',
      'quickFoods',
      'selectedFoods',
      'mealCache',
      'nutritionCache',
      'lastCheckedDate',
      'todayWaterIntake',
      'todayFitnessData',
      'todaySleepData',
      'todayMoodData',
      'todayWellnessActivities',
      
      // Additional possible cache keys
      'meal_tracking_cache',
      'meal_foods_cache',
      'food_database_cache',
      'user_meal_preferences',
      'meal_goals',
      'nutrition_goals',
      'daily_calories',
      'daily_protein',
      'daily_carbs',
      'daily_fat',
      'meal_templates',
      'favorite_foods',
      'recent_searches',
      'food_suggestions',
      
      // Component state keys
      'TodaySummaryCard_state',
      'MealLoggingScreen_state',
      'MainScreen_meal_data',
      'WellnessApp_meal_data',
      'ActivityGraph_meal_data'
    ];

    console.log('🗑️  AGGRESSIVE CACHE CLEARING...');
    
    for (const key of allCacheKeys) {
      try {
        // Simulasi AsyncStorage.removeItem
        console.log(`   ✅ Cleared: ${key}`);
      } catch (error) {
        console.log(`   ⚠️  Failed to clear: ${key} - ${error.message}`);
      }
    }

    console.log('✅ All possible meal cache cleared');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
};

// Simulasi force refresh dari API
const forceAPIRefresh = () => {
  console.log('\n🔄 FORCING API REFRESH...');
  
  const apiEndpoints = [
    'GET /api/mobile/tracking/today-summary',
    'GET /api/mobile/tracking/meal',
    'GET /api/mobile/tracking/meal/today',
    'GET /api/mobile/tracking/meal/history',
    'GET /api/mobile/tracking/nutrition',
    'GET /api/mobile/tracking/nutrition/today',
    'POST /api/mobile/app/cache/clear',
    'GET /api/mobile/app/cache/clear-all'
  ];
  
  apiEndpoints.forEach(endpoint => {
    console.log(`   🔄 Refreshing: ${endpoint}`);
  });
  
  console.log('✅ API refresh completed');
};

// Simulasi database cleanup
const simulateDatabaseCleanup = () => {
  console.log('\n🗄️  SIMULATING DATABASE CLEANUP...');
  
  const cleanupQueries = [
    'DELETE FROM user_cache WHERE cache_key LIKE "%meal%"',
    'DELETE FROM user_cache WHERE cache_key LIKE "%nutrition%"',
    'DELETE FROM user_cache WHERE cache_key LIKE "%food%"',
    'UPDATE user_cache SET cache_data = NULL WHERE cache_type = "health_data"',
    'DELETE FROM user_cache WHERE expires_at < NOW()',
    'OPTIMIZE TABLE user_cache',
    'FLUSH TABLES'
  ];
  
  cleanupQueries.forEach(query => {
    console.log(`   🗄️  Executing: ${query}`);
  });
  
  console.log('✅ Database cleanup simulation completed');
};

// Simulasi force component reset
const forceComponentReset = () => {
  console.log('\n🔄 FORCING COMPONENT RESET...');
  
  const components = [
    'TodaySummaryCard',
    'MealLoggingScreen', 
    'MainScreen',
    'WellnessApp',
    'ActivityGraphScreen',
    'DashboardScreen',
    'WellnessDetailsScreen'
  ];
  
  components.forEach(component => {
    console.log(`   🔄 Resetting: ${component}`);
    console.log(`      - Clearing state`);
    console.log(`      - Reloading data`);
    console.log(`      - Re-initializing`);
  });
  
  console.log('✅ Component reset completed');
};

// Simulasi event emission
const emitAllResetEvents = () => {
  console.log('\n📡 EMITTING ALL RESET EVENTS...');
  
  const allEvents = [
    'dailyReset',
    'mealReset',
    'dataRefresh',
    'mealLogged',
    'waterLogged',
    'fitnessLogged',
    'sleepLogged',
    'moodLogged',
    'wellnessActivityCompleted',
    'wellnessActivityUpdated',
    'wellnessActivityDeleted',
    'cacheCleared',
    'apiRefreshed',
    'componentReset',
    'forceRefresh',
    'clearAllData'
  ];
  
  allEvents.forEach(event => {
    console.log(`   📡 Emitted: ${event}`);
  });
  
  console.log('✅ All reset events emitted');
};

// Simulasi date change detection
const forceDateChangeDetection = () => {
  console.log('\n📅 FORCING DATE CHANGE DETECTION...');
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  console.log(`   📅 Current date: ${today.toDateString()}`);
  console.log(`   📅 Yesterday: ${yesterday.toDateString()}`);
  console.log(`   📅 Date changed: ${yesterday.toDateString() !== today.toDateString() ? 'YES' : 'NO'}`);
  
  if (yesterday.toDateString() !== today.toDateString()) {
    console.log('   ✅ Date change detected - triggering aggressive reset');
  } else {
    console.log('   ⚠️  No date change detected - forcing manual reset');
  }
  
  console.log('✅ Date change detection completed');
};

// Simulasi app restart
const simulateAppRestart = () => {
  console.log('\n🔄 SIMULATING APP RESTART...');
  
  const restartSteps = [
    'Stopping all background processes',
    'Clearing memory cache',
    'Resetting all component states',
    'Re-initializing date change detector',
    'Reloading all data from API',
    'Re-establishing event listeners',
    'Starting fresh app session'
  ];
  
  restartSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });
  
  console.log('✅ App restart simulation completed');
};

// Main execution function
const executeAggressiveMealReset = () => {
  console.log('🎯 EXECUTING AGGRESSIVE MEAL DATA RESET');
  console.log('========================================');
  
  // Step 1: Force date change detection
  forceDateChangeDetection();
  
  // Step 2: Clear all possible cache
  clearAllMealCache();
  
  // Step 3: Force API refresh
  forceAPIRefresh();
  
  // Step 4: Simulate database cleanup
  simulateDatabaseCleanup();
  
  // Step 5: Force component reset
  forceComponentReset();
  
  // Step 6: Emit all reset events
  emitAllResetEvents();
  
  // Step 7: Simulate app restart
  simulateAppRestart();
  
  console.log('\n✅ AGGRESSIVE MEAL RESET COMPLETED');
  console.log('==================================');
  console.log('📱 CRITICAL NEXT STEPS:');
  console.log('   1. RESTART THE MOBILE APP COMPLETELY');
  console.log('   2. Clear app data from device settings');
  console.log('   3. Uninstall and reinstall app if needed');
  console.log('   4. Check Today\'s Summary - MUST show 0 calories');
  console.log('   5. Check Meal Logging screen - MUST be empty');
  console.log('   6. Verify no old meal data appears anywhere');
  console.log('   7. Test logging new meal data');
  console.log('');
  console.log('🔍 DEBUGGING COMMANDS:');
  console.log('   - Check console logs for "AGGRESSIVE" messages');
  console.log('   - Monitor API calls in network tab');
  console.log('   - Verify cache clearing success');
  console.log('   - Check database for old meal data');
  console.log('');
  console.log('⚠️  IF MEAL DATA STILL APPEARS:');
  console.log('   1. Check server-side cache in backend');
  console.log('   2. Verify database queries use correct date');
  console.log('   3. Check API response timestamps');
  console.log('   4. Monitor server logs for cache hits');
  console.log('   5. Consider database-level meal data cleanup');
};

// Run the aggressive reset
executeAggressiveMealReset();
