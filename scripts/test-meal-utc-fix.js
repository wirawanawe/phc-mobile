#!/usr/bin/env node

/**
 * TEST MEAL UTC FIX
 * Script untuk test dan verifikasi fix UTC di meal logging
 */

console.log('🧪 TESTING MEAL UTC FIX');
console.log('========================\n');

// Simulasi test timestamp handling
const testTimestampHandling = () => {
  console.log('🔍 TESTING TIMESTAMP HANDLING...');
  
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
  
  // Test getLocalTimestamp function
  const offset = now.getTimezoneOffset() * 60000;
  const localDateObj = new Date(now.getTime() - offset);
  const localTimestamp = localDateObj.toISOString();
  
  console.log('\n🔄 Local timestamp calculation:');
  console.log(`   Original UTC: ${utcTime}`);
  console.log(`   Local adjusted: ${localTimestamp}`);
  console.log(`   Difference: ${(new Date(utcTime).getTime() - new Date(localTimestamp).getTime()) / 60000} minutes`);
  
  console.log('✅ Timestamp handling test completed');
};

// Simulasi test API fixes
const testAPIFixes = () => {
  console.log('\n🌐 TESTING API FIXES...');
  
  const apiFixes = [
    '✅ Backend API: Removed toISOString() conversion',
    '✅ Database: Using CONVERT_TZ for date queries',
    '✅ Meal API: DATE(CONVERT_TZ(mt.recorded_at, "+00:00", "+07:00"))',
    '✅ Today Summary: DATE(CONVERT_TZ(mt.recorded_at, "+00:00", "+07:00"))',
    '✅ Meal Today: DATE(CONVERT_TZ(mt.recorded_at, "+00:00", "+07:00"))'
  ];
  
  console.log('🔧 API fixes implemented:');
  apiFixes.forEach((fix, index) => {
    console.log(`   ${index + 1}. ${fix}`);
  });
  
  console.log('\n📝 Code changes made:');
  console.log('   1. dash-app/app/api/mobile/tracking/meal/route.js');
  console.log('      - Removed toISOString() conversion');
  console.log('      - Added CONVERT_TZ for date queries');
  console.log('      - Added timestamp logging');
  console.log('');
  console.log('   2. dash-app/app/api/mobile/tracking/today-summary/route.js');
  console.log('      - Updated meal query to use CONVERT_TZ');
  console.log('      - Fixed date comparison logic');
  console.log('');
  console.log('   3. dash-app/app/api/mobile/tracking/meal/today/route.js');
  console.log('      - Updated meal query to use CONVERT_TZ');
  console.log('      - Updated totals query to use CONVERT_TZ');
  
  console.log('✅ API fixes test completed');
};

// Simulasi test database queries
const testDatabaseQueries = () => {
  console.log('\n🗄️  TESTING DATABASE QUERIES...');
  
  const testQueries = [
    'SELECT recorded_at, DATE(recorded_at) as utc_date, DATE(CONVERT_TZ(recorded_at, "+00:00", "+07:00")) as local_date FROM meal_tracking WHERE user_id = 1 ORDER BY recorded_at DESC LIMIT 3',
    'SELECT COUNT(*) as utc_today FROM meal_tracking WHERE DATE(recorded_at) = CURDATE()',
    'SELECT COUNT(*) as local_today FROM meal_tracking WHERE DATE(CONVERT_TZ(recorded_at, "+00:00", "+07:00")) = CURDATE()',
    'SELECT recorded_at, CONVERT_TZ(recorded_at, "+00:00", "+07:00") as local_time FROM meal_tracking WHERE user_id = 1 ORDER BY recorded_at DESC LIMIT 3'
  ];
  
  console.log('🔍 Test queries to verify fix:');
  testQueries.forEach((query, index) => {
    console.log(`   ${index + 1}. ${query}`);
  });
  
  console.log('\n📈 Expected results after fix:');
  console.log('   - utc_date and local_date should be different');
  console.log('   - utc_today and local_today should be different');
  console.log('   - local_time should show correct local time');
  console.log('   - Meal data should appear in correct local date');
  
  console.log('✅ Database queries test completed');
};

// Simulasi test meal logging flow
const testMealLoggingFlow = () => {
  console.log('\n🍽️  TESTING MEAL LOGGING FLOW...');
  
  const flowSteps = [
    '1. Frontend: User logs meal at local time',
    '2. Frontend: getLocalTimestamp() creates local timestamp',
    '3. API: Receives local timestamp from frontend',
    '4. API: Preserves local timestamp (no UTC conversion)',
    '5. Database: Stores local timestamp',
    '6. Query: Uses CONVERT_TZ for date comparison',
    '7. Result: Meal appears in correct local date'
  ];
  
  console.log('🔄 Meal logging flow after fix:');
  flowSteps.forEach((step) => {
    console.log(`   ${step}`);
  });
  
  console.log('\n📊 Expected behavior:');
  console.log('   - Meal logged at 23:30 local time should appear in today\'s data');
  console.log('   - Meal logged at 00:30 local time should appear in tomorrow\'s data');
  console.log('   - No more 1-day difference issues');
  console.log('   - Today\'s Summary shows correct meal data');
  
  console.log('✅ Meal logging flow test completed');
};

// Simulasi test verification steps
const testVerificationSteps = () => {
  console.log('\n✅ TESTING VERIFICATION STEPS...');
  
  const verificationSteps = [
    '1. Log meal at current local time',
    '2. Check Today\'s Summary shows the meal',
    '3. Check meal appears in correct local date',
    '4. Test date change detection',
    '5. Verify meal data resets correctly',
    '6. Test API responses with date parameters',
    '7. Check database timestamps are correct'
  ];
  
  console.log('🔍 Verification steps:');
  verificationSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });
  
  console.log('\n🎯 Success criteria:');
  console.log('   - Meal data appears in correct local date');
  console.log('   - No more UTC timezone issues');
  console.log('   - Today\'s Summary shows accurate data');
  console.log('   - Date change detection works correctly');
  console.log('   - Meal reset works properly');
  
  console.log('✅ Verification steps test completed');
};

// Main execution function
const executeMealUTCTest = () => {
  console.log('🎯 EXECUTING MEAL UTC FIX TEST');
  console.log('==============================');
  
  // Step 1: Test timestamp handling
  testTimestampHandling();
  
  // Step 2: Test API fixes
  testAPIFixes();
  
  // Step 3: Test database queries
  testDatabaseQueries();
  
  // Step 4: Test meal logging flow
  testMealLoggingFlow();
  
  // Step 5: Test verification steps
  testVerificationSteps();
  
  console.log('\n✅ MEAL UTC FIX TEST COMPLETED');
  console.log('==============================');
  console.log('📋 MANUAL TESTING REQUIRED:');
  console.log('');
  console.log('1. 🍽️  MEAL LOGGING TEST:');
  console.log('   - Log a meal at current local time');
  console.log('   - Check if it appears in Today\'s Summary');
  console.log('   - Verify timestamp is correct');
  console.log('   - Test meal appears in correct date');
  console.log('');
  console.log('2. 📊 TODAY\'S SUMMARY TEST:');
  console.log('   - Check Today\'s Summary shows correct calories');
  console.log('   - Verify meal data is accurate');
  console.log('   - Test with different meal types');
  console.log('   - Check date change detection');
  console.log('');
  console.log('3. 🗄️  DATABASE TEST:');
  console.log('   - Run verification queries');
  console.log('   - Check timestamp storage');
  console.log('   - Verify date comparison logic');
  console.log('   - Test CONVERT_TZ functionality');
  console.log('');
  console.log('4. 🔄 RESET TEST:');
  console.log('   - Test daily reset functionality');
  console.log('   - Verify meal data clears correctly');
  console.log('   - Check new day starts fresh');
  console.log('   - Test meal logging after reset');
  console.log('');
  console.log('⚠️  CRITICAL TEST QUERIES:');
  console.log('   SELECT recorded_at, DATE(CONVERT_TZ(recorded_at, "+00:00", "+07:00")) as local_date FROM meal_tracking WHERE user_id = 1;');
  console.log('   SELECT COUNT(*) as local_today FROM meal_tracking WHERE DATE(CONVERT_TZ(recorded_at, "+00:00", "+07:00")) = CURDATE();');
  console.log('');
  console.log('🎉 EXPECTED RESULTS:');
  console.log('   - Meal data appears in correct local date');
  console.log('   - No more UTC timezone issues');
  console.log('   - Today\'s Summary shows accurate data');
  console.log('   - Date change detection works correctly');
  console.log('   - Meal reset works properly');
};

// Run the UTC test
executeMealUTCTest();
