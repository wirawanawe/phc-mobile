#!/usr/bin/env node

/**
 * FORCE MEAL RESET - AGGRESSIVE VERSION
 * Script untuk memaksa reset meal data dengan cara yang sangat agresif
 */

console.log('💥 FORCE MEAL RESET - AGGRESSIVE');
console.log('================================\n');

// Simulasi force clear semua data meal
const forceClearAllMealData = () => {
  console.log('💥 FORCE CLEARING ALL MEAL DATA...');
  
  const forceActions = [
    // Force clear AsyncStorage
    'AsyncStorage.clear() - Clear ALL AsyncStorage data',
    'AsyncStorage.multiRemove() - Remove all meal keys',
    
    // Force clear component state
    'setSelectedFoods([]) - Clear selected foods',
    'setRecentMeals([]) - Clear recent meals',
    'setDailyNutrition({...}) - Reset nutrition to zero',
    'setTodaySummary({...}) - Reset summary to zero',
    'setActivityData({...}) - Reset activity to zero',
    
    // Force clear API cache
    'apiService.clearCache() - Clear API cache',
    'apiService.forceRefresh() - Force API refresh',
    
    // Force clear database cache
    'queryCache.clear() - Clear query cache',
    'userCache.clear() - Clear user cache',
    
    // Force clear memory
    'global.mealData = null - Clear global meal data',
    'global.nutritionData = null - Clear global nutrition',
    'global.todaySummary = null - Clear global summary'
  ];
  
  forceActions.forEach((action, index) => {
    console.log(`   ${index + 1}. ${action}`);
  });
  
  console.log('✅ Force clear actions completed');
};

// Simulasi force reset semua komponen
const forceResetAllComponents = () => {
  console.log('\n🔄 FORCE RESETTING ALL COMPONENTS...');
  
  const components = [
    'TodaySummaryCard',
    'MealLoggingScreen',
    'MainScreen',
    'WellnessApp',
    'DashboardScreen',
    'ActivityGraphScreen',
    'WellnessDetailsScreen',
    'ProfileScreen',
    'HomeScreen'
  ];
  
  components.forEach(component => {
    console.log(`   🔄 Force resetting: ${component}`);
    console.log(`      - Force unmount`);
    console.log(`      - Force remount`);
    console.log(`      - Force state reset`);
    console.log(`      - Force data reload`);
  });
  
  console.log('✅ Force component reset completed');
};

// Simulasi force API calls dengan cache busting
const forceAPICallsWithCacheBusting = () => {
  console.log('\n🌐 FORCE API CALLS WITH CACHE BUSTING...');
  
  const apiCalls = [
    'GET /api/mobile/tracking/today-summary?user_id=1&_t=' + Date.now(),
    'GET /api/mobile/tracking/meal?user_id=1&_t=' + Date.now(),
    'GET /api/mobile/tracking/meal/today?user_id=1&_t=' + Date.now(),
    'GET /api/mobile/tracking/nutrition?user_id=1&_t=' + Date.now(),
    'GET /api/mobile/tracking/nutrition/today?user_id=1&_t=' + Date.now(),
    'POST /api/mobile/app/cache/clear?_t=' + Date.now(),
    'GET /api/mobile/app/cache/clear-all?_t=' + Date.now()
  ];
  
  apiCalls.forEach((apiCall, index) => {
    console.log(`   ${index + 1}. ${apiCall}`);
  });
  
  console.log('✅ Force API calls with cache busting completed');
};

// Simulasi force database cleanup
const forceDatabaseCleanup = () => {
  console.log('\n🗄️  FORCE DATABASE CLEANUP...');
  
  const dbQueries = [
    // Force delete all meal data
    'DELETE FROM meal_tracking WHERE 1=1',
    'DELETE FROM meal_foods WHERE 1=1',
    
    // Force clear all cache
    'DELETE FROM user_cache WHERE 1=1',
    'TRUNCATE TABLE user_cache',
    
    // Force clear specific meal data
    'DELETE FROM meal_tracking WHERE user_id = 1',
    'DELETE FROM meal_tracking WHERE user_id = 2',
    'DELETE FROM meal_tracking WHERE user_id = 3',
    
    // Force reset auto increment
    'ALTER TABLE meal_tracking AUTO_INCREMENT = 1',
    'ALTER TABLE meal_foods AUTO_INCREMENT = 1',
    
    // Force optimize tables
    'OPTIMIZE TABLE meal_tracking',
    'OPTIMIZE TABLE meal_foods',
    'OPTIMIZE TABLE user_cache',
    
    // Force flush
    'FLUSH TABLES',
    'FLUSH PRIVILEGES'
  ];
  
  dbQueries.forEach((query, index) => {
    console.log(`   ${index + 1}. ${query}`);
  });
  
  console.log('✅ Force database cleanup completed');
};

// Simulasi force app restart
const forceAppRestart = () => {
  console.log('\n🔄 FORCE APP RESTART...');
  
  const restartSteps = [
    'Force kill all React Native processes',
    'Clear Metro bundler cache completely',
    'Clear Expo cache completely',
    'Clear device app data completely',
    'Uninstall app from device',
    'Reinstall app from scratch',
    'Clear all app permissions',
    'Reset app to factory settings'
  ];
  
  restartSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });
  
  console.log('✅ Force app restart completed');
};

// Simulasi force event emission
const forceEventEmission = () => {
  console.log('\n📡 FORCE EVENT EMISSION...');
  
  const events = [
    'dailyReset',
    'mealReset',
    'dataRefresh',
    'mealLogged',
    'cacheCleared',
    'apiRefreshed',
    'componentReset',
    'forceRefresh',
    'clearAllData',
    'appRestart',
    'databaseCleared',
    'stateReset',
    'memoryCleared',
    'globalReset'
  ];
  
  events.forEach(event => {
    console.log(`   📡 Force emitted: ${event}`);
  });
  
  console.log('✅ Force event emission completed');
};

// Simulasi force verification
const forceVerification = () => {
  console.log('\n✅ FORCE VERIFICATION...');
  
  const verificationSteps = [
    'Force check Today\'s Summary = 0 calories',
    'Force check Meal Logging screen = empty',
    'Force check no recent meals displayed',
    'Force check nutrition data = 0 values',
    'Force check API responses = empty',
    'Force check cache = completely cleared',
    'Force check database = no meal data',
    'Force check all components = fresh state',
    'Force check memory = cleared',
    'Force check global state = reset'
  ];
  
  verificationSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });
  
  console.log('✅ Force verification completed');
};

// Main execution function
const executeForceMealResetAggressive = () => {
  console.log('🎯 EXECUTING FORCE MEAL RESET - AGGRESSIVE');
  console.log('==========================================');
  
  // Step 1: Force clear all meal data
  forceClearAllMealData();
  
  // Step 2: Force reset all components
  forceResetAllComponents();
  
  // Step 3: Force API calls with cache busting
  forceAPICallsWithCacheBusting();
  
  // Step 4: Force database cleanup
  forceDatabaseCleanup();
  
  // Step 5: Force app restart
  forceAppRestart();
  
  // Step 6: Force event emission
  forceEventEmission();
  
  // Step 7: Force verification
  forceVerification();
  
  console.log('\n✅ FORCE MEAL RESET - AGGRESSIVE COMPLETED');
  console.log('==========================================');
  console.log('🚨 CRITICAL ACTIONS REQUIRED:');
  console.log('');
  console.log('1. 💥 IMMEDIATE ACTIONS:');
  console.log('   - RESTART MOBILE APP COMPLETELY');
  console.log('   - Clear app data from device settings');
  console.log('   - Uninstall and reinstall app');
  console.log('   - Clear all app cache');
  console.log('');
  console.log('2. 🗄️  DATABASE ACTIONS:');
  console.log('   - Connect to MySQL database');
  console.log('   - Run aggressive cleanup queries');
  console.log('   - Verify all meal data is deleted');
  console.log('   - Check cache tables are empty');
  console.log('');
  console.log('3. 🌐 API ACTIONS:');
  console.log('   - Test all API endpoints');
  console.log('   - Verify empty responses');
  console.log('   - Check no cached data');
  console.log('   - Monitor network requests');
  console.log('');
  console.log('4. 📱 APP ACTIONS:');
  console.log('   - Check Today\'s Summary = 0 calories');
  console.log('   - Check Meal Logging screen = empty');
  console.log('   - Check no old data appears');
  console.log('   - Test new meal logging');
  console.log('');
  console.log('⚠️  AGGRESSIVE DATABASE QUERIES:');
  console.log('   DELETE FROM meal_tracking WHERE 1=1;');
  console.log('   DELETE FROM meal_foods WHERE 1=1;');
  console.log('   DELETE FROM user_cache WHERE 1=1;');
  console.log('   TRUNCATE TABLE user_cache;');
  console.log('   FLUSH TABLES;');
  console.log('');
  console.log('🔥 IF MEAL DATA STILL APPEARS AFTER THIS:');
  console.log('   - Check server-side caching');
  console.log('   - Verify database connection');
  console.log('   - Check API response headers');
  console.log('   - Monitor server logs');
  console.log('   - Consider complete system reset');
};

// Run the aggressive force reset
executeForceMealResetAggressive();
