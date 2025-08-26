#!/usr/bin/env node

/**
 * CHECK AND FIX MEAL UTC ISSUE
 * Script untuk memeriksa dan memperbaiki masalah UTC di meal logging
 */

console.log('🕐 CHECKING MEAL UTC ISSUE');
console.log('==========================\n');

// Simulasi check timestamp handling
const checkTimestampHandling = () => {
  console.log('🔍 CHECKING TIMESTAMP HANDLING...');
  
  const now = new Date();
  const utcTime = now.toISOString();
  const localTime = now.toLocaleString('id-ID');
  const localDate = now.toDateString();
  
  console.log('📅 Current time analysis:');
  console.log(`   UTC Time: ${utcTime}`);
  console.log(`   Local Time: ${localTime}`);
  console.log(`   Local Date: ${localDate}`);
  console.log(`   Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  console.log(`   Timezone Offset: ${now.getTimezoneOffset()} minutes`);
  
  // Check getLocalTimestamp function
  const offset = now.getTimezoneOffset() * 60000;
  const localDateObj = new Date(now.getTime() - offset);
  const localTimestamp = localDateObj.toISOString();
  
  console.log('\n🔄 Local timestamp calculation:');
  console.log(`   Original UTC: ${utcTime}`);
  console.log(`   Local adjusted: ${localTimestamp}`);
  console.log(`   Difference: ${(new Date(utcTime).getTime() - new Date(localTimestamp).getTime()) / 60000} minutes`);
  
  console.log('✅ Timestamp handling analysis completed');
};

// Simulasi check meal API timestamp handling
const checkMealAPITimestampHandling = () => {
  console.log('\n🌐 CHECKING MEAL API TIMESTAMP HANDLING...');
  
  const apiIssues = [
    'Backend API uses toISOString() which converts to UTC',
    'Database stores UTC timestamps',
    'Frontend sends local timestamp but backend converts to UTC',
    'Date queries use DATE() function which may use UTC',
    'Timezone conversion happens multiple times'
  ];
  
  console.log('⚠️  Potential UTC issues in meal API:');
  apiIssues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
  
  console.log('\n🔧 Current meal API timestamp flow:');
  console.log('   1. Frontend: getLocalTimestamp() -> Local time');
  console.log('   2. API: new Date(recorded_at).toISOString() -> UTC conversion');
  console.log('   3. Database: Stores UTC timestamp');
  console.log('   4. Query: DATE(recorded_at) -> May use UTC date');
  
  console.log('✅ Meal API timestamp analysis completed');
};

// Simulasi check database timestamp handling
const checkDatabaseTimestampHandling = () => {
  console.log('\n🗄️  CHECKING DATABASE TIMESTAMP HANDLING...');
  
  const dbQueries = [
    'SELECT recorded_at FROM meal_tracking WHERE user_id = 1 ORDER BY recorded_at DESC LIMIT 5',
    'SELECT DATE(recorded_at) as meal_date FROM meal_tracking WHERE user_id = 1',
    'SELECT recorded_at, CONVERT_TZ(recorded_at, "+00:00", "+07:00") as local_time FROM meal_tracking WHERE user_id = 1',
    'SELECT recorded_at, DATE_FORMAT(recorded_at, "%Y-%m-%d %H:%i:%s") as formatted_time FROM meal_tracking WHERE user_id = 1'
  ];
  
  console.log('🔍 Database timestamp queries to check:');
  dbQueries.forEach((query, index) => {
    console.log(`   ${index + 1}. ${query}`);
  });
  
  console.log('\n⚠️  Potential database UTC issues:');
  console.log('   1. MySQL TIMESTAMP stores UTC internally');
  console.log('   2. DATE() function may use UTC date');
  console.log('   3. Timezone conversion needed for local time');
  console.log('   4. Date comparison may be off by 1 day');
  
  console.log('✅ Database timestamp analysis completed');
};

// Simulasi fix UTC issues
const simulateFixUTCIssues = () => {
  console.log('\n🔧 SIMULATING UTC ISSUE FIXES...');
  
  const fixes = [
    'Update backend API to preserve local timestamp',
    'Use CONVERT_TZ in database queries',
    'Update date comparison logic',
    'Add timezone handling in API responses',
    'Update frontend to handle timezone properly'
  ];
  
  console.log('🛠️  UTC issue fixes:');
  fixes.forEach((fix, index) => {
    console.log(`   ${index + 1}. ${fix}`);
  });
  
  console.log('\n📝 Specific code changes needed:');
  console.log('   1. Backend API: Remove toISOString() conversion');
  console.log('   2. Database: Use CONVERT_TZ for date queries');
  console.log('   3. Frontend: Ensure getLocalTimestamp() is used consistently');
  console.log('   4. API: Add timezone parameter support');
  
  console.log('✅ UTC issue fixes simulation completed');
};

// Simulasi check current meal data timestamps
const checkCurrentMealData = () => {
  console.log('\n📊 CHECKING CURRENT MEAL DATA TIMESTAMPS...');
  
  const checkQueries = [
    'SELECT id, recorded_at, DATE(recorded_at) as meal_date FROM meal_tracking WHERE user_id = 1 ORDER BY recorded_at DESC LIMIT 5',
    'SELECT COUNT(*) as today_meals FROM meal_tracking WHERE DATE(recorded_at) = CURDATE()',
    'SELECT COUNT(*) as today_meals_local FROM meal_tracking WHERE DATE(CONVERT_TZ(recorded_at, "+00:00", "+07:00")) = CURDATE()',
    'SELECT recorded_at, CONVERT_TZ(recorded_at, "+00:00", "+07:00") as local_time FROM meal_tracking WHERE user_id = 1 ORDER BY recorded_at DESC LIMIT 3'
  ];
  
  console.log('🔍 Queries to check current meal data:');
  checkQueries.forEach((query, index) => {
    console.log(`   ${index + 1}. ${query}`);
  });
  
  console.log('\n📈 Expected results:');
  console.log('   - If UTC issue exists: today_meals < today_meals_local');
  console.log('   - If no UTC issue: today_meals = today_meals_local');
  console.log('   - Check if recorded_at shows correct local time');
  
  console.log('✅ Current meal data analysis completed');
};

// Main execution function
const executeMealUTCCheck = () => {
  console.log('🎯 EXECUTING MEAL UTC ISSUE CHECK');
  console.log('==================================');
  
  // Step 1: Check timestamp handling
  checkTimestampHandling();
  
  // Step 2: Check meal API timestamp handling
  checkMealAPITimestampHandling();
  
  // Step 3: Check database timestamp handling
  checkDatabaseTimestampHandling();
  
  // Step 4: Check current meal data
  checkCurrentMealData();
  
  // Step 5: Simulate fixes
  simulateFixUTCIssues();
  
  console.log('\n✅ MEAL UTC ISSUE CHECK COMPLETED');
  console.log('==================================');
  console.log('📋 MANUAL STEPS REQUIRED:');
  console.log('');
  console.log('1. 🗄️  DATABASE CHECKS:');
  console.log('   - Connect to MySQL database');
  console.log('   - Run timestamp analysis queries');
  console.log('   - Check if meal data uses UTC timestamps');
  console.log('   - Verify date comparison logic');
  console.log('');
  console.log('2. 🌐 API CHECKS:');
  console.log('   - Check backend API timestamp handling');
  console.log('   - Verify toISOString() usage');
  console.log('   - Test date parameter handling');
  console.log('   - Check timezone conversion');
  console.log('');
  console.log('3. 📱 FRONTEND CHECKS:');
  console.log('   - Verify getLocalTimestamp() usage');
  console.log('   - Check meal logging timestamp');
  console.log('   - Test date change detection');
  console.log('   - Verify Today\'s Summary date logic');
  console.log('');
  console.log('4. 🔧 FIXES REQUIRED:');
  console.log('   - Update backend API timestamp handling');
  console.log('   - Fix database date queries');
  console.log('   - Update frontend timezone handling');
  console.log('   - Test meal data consistency');
  console.log('');
  console.log('⚠️  CRITICAL DATABASE QUERIES:');
  console.log('   SELECT recorded_at, DATE(recorded_at) as meal_date FROM meal_tracking WHERE user_id = 1;');
  console.log('   SELECT COUNT(*) as today_meals FROM meal_tracking WHERE DATE(recorded_at) = CURDATE();');
  console.log('   SELECT COUNT(*) as today_meals_local FROM meal_tracking WHERE DATE(CONVERT_TZ(recorded_at, "+00:00", "+07:00")) = CURDATE();');
  console.log('');
  console.log('🔥 IF UTC ISSUE CONFIRMED:');
  console.log('   - Update backend API to preserve local time');
  console.log('   - Use CONVERT_TZ in database queries');
  console.log('   - Update date comparison logic');
  console.log('   - Test meal data consistency');
};

// Run the UTC check
executeMealUTCCheck();
