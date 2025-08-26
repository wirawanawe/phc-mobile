#!/usr/bin/env node

/**
 * CHECK AND CLEAN MEAL DATABASE
 * Script untuk memeriksa dan membersihkan meal data di database
 */

console.log('🗄️  CHECKING MEAL DATABASE');
console.log('==========================\n');

// Simulasi database queries untuk meal data
const checkMealDatabase = () => {
  console.log('🔍 CHECKING MEAL DATA IN DATABASE...');
  
  const queries = [
    // Check meal_tracking table
    'SELECT COUNT(*) as total_meals FROM meal_tracking',
    'SELECT COUNT(*) as today_meals FROM meal_tracking WHERE DATE(recorded_at) = CURDATE()',
    'SELECT COUNT(*) as yesterday_meals FROM meal_tracking WHERE DATE(recorded_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)',
    'SELECT COUNT(*) as old_meals FROM meal_tracking WHERE DATE(recorded_at) < CURDATE()',
    
    // Check meal_foods table
    'SELECT COUNT(*) as total_foods FROM meal_foods',
    'SELECT COUNT(*) as orphaned_foods FROM meal_foods WHERE meal_id NOT IN (SELECT id FROM meal_tracking)',
    
    // Check user_cache table for meal data
    'SELECT COUNT(*) as meal_cache FROM user_cache WHERE cache_key LIKE "%meal%"',
    'SELECT COUNT(*) as nutrition_cache FROM user_cache WHERE cache_key LIKE "%nutrition%"',
    'SELECT COUNT(*) as food_cache FROM user_cache WHERE cache_key LIKE "%food%"',
    
    // Check specific meal data
    'SELECT user_id, meal_type, recorded_at, COUNT(*) as food_count FROM meal_tracking mt JOIN meal_foods mf ON mt.id = mf.meal_id GROUP BY mt.id ORDER BY recorded_at DESC LIMIT 10'
  ];
  
  queries.forEach((query, index) => {
    console.log(`   ${index + 1}. ${query}`);
  });
  
  console.log('✅ Database queries prepared');
};

// Simulasi cleanup queries
const simulateDatabaseCleanup = () => {
  console.log('\n🧹 SIMULATING DATABASE CLEANUP...');
  
  const cleanupQueries = [
    // Clear old meal data (older than today)
    'DELETE FROM meal_tracking WHERE DATE(recorded_at) < CURDATE()',
    'DELETE FROM meal_foods WHERE meal_id NOT IN (SELECT id FROM meal_tracking)',
    
    // Clear meal-related cache
    'DELETE FROM user_cache WHERE cache_key LIKE "%meal%"',
    'DELETE FROM user_cache WHERE cache_key LIKE "%nutrition%"',
    'DELETE FROM user_cache WHERE cache_key LIKE "%food%"',
    'DELETE FROM user_cache WHERE cache_key LIKE "%today%"',
    
    // Clear expired cache
    'DELETE FROM user_cache WHERE expires_at < NOW()',
    
    // Reset today's meal data
    'UPDATE meal_tracking SET recorded_at = NOW() WHERE DATE(recorded_at) = CURDATE()',
    
    // Clear specific user meal data (if needed)
    'DELETE FROM meal_tracking WHERE user_id IN (SELECT id FROM users WHERE email LIKE "%test%")',
    
    // Optimize tables
    'OPTIMIZE TABLE meal_tracking',
    'OPTIMIZE TABLE meal_foods',
    'OPTIMIZE TABLE user_cache',
    'FLUSH TABLES'
  ];
  
  cleanupQueries.forEach((query, index) => {
    console.log(`   ${index + 1}. ${query}`);
  });
  
  console.log('✅ Database cleanup queries prepared');
};

// Simulasi check API endpoints
const checkAPIEndpoints = () => {
  console.log('\n🌐 CHECKING API ENDPOINTS...');
  
  const endpoints = [
    'GET /api/mobile/tracking/today-summary?user_id=1',
    'GET /api/mobile/tracking/meal?user_id=1',
    'GET /api/mobile/tracking/meal/today?user_id=1',
    'GET /api/mobile/tracking/meal/history?user_id=1&date=2025-08-21',
    'GET /api/mobile/tracking/nutrition?user_id=1',
    'GET /api/mobile/tracking/nutrition/today?user_id=1',
    'POST /api/mobile/app/cache/clear',
    'GET /api/mobile/app/cache/clear-all'
  ];
  
  endpoints.forEach((endpoint, index) => {
    console.log(`   ${index + 1}. ${endpoint}`);
  });
  
  console.log('✅ API endpoints prepared for testing');
};

// Simulasi force cache clear
const forceCacheClear = () => {
  console.log('\n🗑️  FORCING CACHE CLEAR...');
  
  const cacheActions = [
    'Clear AsyncStorage completely',
    'Clear React Native cache',
    'Clear Metro bundler cache',
    'Clear Expo cache',
    'Clear device app cache',
    'Clear server-side cache',
    'Clear database query cache',
    'Clear API response cache'
  ];
  
  cacheActions.forEach((action, index) => {
    console.log(`   ${index + 1}. ${action}`);
  });
  
  console.log('✅ Cache clear actions prepared');
};

// Simulasi meal data verification
const verifyMealData = () => {
  console.log('\n✅ VERIFYING MEAL DATA RESET...');
  
  const verificationSteps = [
    'Check Today\'s Summary shows 0 calories',
    'Check Meal Logging screen is empty',
    'Check no recent meals displayed',
    'Check nutrition data shows 0 values',
    'Check API responses for today return empty',
    'Check cache is completely cleared',
    'Check database has no today\'s meal data',
    'Check all components show fresh state'
  ];
  
  verificationSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });
  
  console.log('✅ Verification steps prepared');
};

// Main execution function
const executeMealDatabaseCheck = () => {
  console.log('🎯 EXECUTING MEAL DATABASE CHECK');
  console.log('================================');
  
  // Step 1: Check current meal data
  checkMealDatabase();
  
  // Step 2: Simulate database cleanup
  simulateDatabaseCleanup();
  
  // Step 3: Check API endpoints
  checkAPIEndpoints();
  
  // Step 4: Force cache clear
  forceCacheClear();
  
  // Step 5: Verify meal data reset
  verifyMealData();
  
  console.log('\n✅ MEAL DATABASE CHECK COMPLETED');
  console.log('================================');
  console.log('📋 MANUAL STEPS REQUIRED:');
  console.log('');
  console.log('1. 🗄️  DATABASE CLEANUP:');
  console.log('   - Connect to MySQL database');
  console.log('   - Run cleanup queries manually');
  console.log('   - Verify meal data is cleared');
  console.log('');
  console.log('2. 🌐 API TESTING:');
  console.log('   - Test each API endpoint');
  console.log('   - Verify responses are empty');
  console.log('   - Check for cached responses');
  console.log('');
  console.log('3. 📱 APP TESTING:');
  console.log('   - Restart mobile app completely');
  console.log('   - Clear app data from device');
  console.log('   - Check Today\'s Summary');
  console.log('   - Check Meal Logging screen');
  console.log('');
  console.log('4. 🔍 DEBUGGING:');
  console.log('   - Monitor network requests');
  console.log('   - Check console logs');
  console.log('   - Verify cache clearing');
  console.log('   - Test new meal logging');
  console.log('');
  console.log('⚠️  CRITICAL DATABASE QUERIES:');
  console.log('   DELETE FROM meal_tracking WHERE DATE(recorded_at) < CURDATE();');
  console.log('   DELETE FROM user_cache WHERE cache_key LIKE "%meal%";');
  console.log('   DELETE FROM user_cache WHERE cache_key LIKE "%nutrition%";');
  console.log('   DELETE FROM user_cache WHERE cache_key LIKE "%today%";');
  console.log('   FLUSH TABLES;');
};

// Run the database check
executeMealDatabaseCheck();
