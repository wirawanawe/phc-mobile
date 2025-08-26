#!/usr/bin/env node

/**
 * CLEAR OLD DATABASE DATA
 * Script untuk membersihkan data lama dari database yang menghalangi data baru
 */

const mysql = require('mysql2/promise');

console.log('🗄️  CLEAR OLD DATABASE DATA');
console.log('============================\n');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'phc_mobile'
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get yesterday's date in YYYY-MM-DD format
const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// Clear old meal tracking data
const clearOldMealData = async (connection) => {
  try {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    
    console.log('🍽️  Clearing old meal tracking data...');
    console.log(`   Today: ${today}`);
    console.log(`   Yesterday: ${yesterday}`);
    
    // Delete meal tracking data older than today
    const deleteMealSQL = `
      DELETE FROM meal_tracking 
      WHERE DATE(CONVERT_TZ(recorded_at, '+00:00', '+07:00')) < ?
    `;
    
    const [mealResult] = await connection.execute(deleteMealSQL, [today]);
    console.log(`   ✅ Deleted ${mealResult.affectedRows} old meal tracking records`);
    
    // Delete meal foods data for old meals
    const deleteMealFoodsSQL = `
      DELETE mf FROM meal_foods mf
      LEFT JOIN meal_tracking mt ON mf.meal_id = mt.id
      WHERE mt.id IS NULL
    `;
    
    const [mealFoodsResult] = await connection.execute(deleteMealFoodsSQL);
    console.log(`   ✅ Deleted ${mealFoodsResult.affectedRows} orphaned meal foods records`);
    
  } catch (error) {
    console.error('   ❌ Error clearing old meal data:', error.message);
  }
};

// Clear old water tracking data
const clearOldWaterData = async (connection) => {
  try {
    const today = getTodayDate();
    
    console.log('💧 Clearing old water tracking data...');
    
    // Delete water tracking data older than today
    const deleteWaterSQL = `
      DELETE FROM water_tracking 
      WHERE DATE(CONVERT_TZ(tracking_date, '+00:00', '+07:00')) < ?
    `;
    
    const [waterResult] = await connection.execute(deleteWaterSQL, [today]);
    console.log(`   ✅ Deleted ${waterResult.affectedRows} old water tracking records`);
    
  } catch (error) {
    console.error('   ❌ Error clearing old water data:', error.message);
  }
};

// Clear old fitness tracking data
const clearOldFitnessData = async (connection) => {
  try {
    const today = getTodayDate();
    
    console.log('🏃 Clearing old fitness tracking data...');
    
    // Delete fitness tracking data older than today
    const deleteFitnessSQL = `
      DELETE FROM fitness_tracking 
      WHERE DATE(CONVERT_TZ(tracking_date, '+00:00', '+07:00')) < ?
    `;
    
    const [fitnessResult] = await connection.execute(deleteFitnessSQL, [today]);
    console.log(`   ✅ Deleted ${fitnessResult.affectedRows} old fitness tracking records`);
    
  } catch (error) {
    console.error('   ❌ Error clearing old fitness data:', error.message);
  }
};

// Clear old sleep tracking data
const clearOldSleepData = async (connection) => {
  try {
    const today = getTodayDate();
    
    console.log('😴 Clearing old sleep tracking data...');
    
    // Delete sleep tracking data older than today
    const deleteSleepSQL = `
      DELETE FROM sleep_tracking 
      WHERE DATE(CONVERT_TZ(sleep_date, '+00:00', '+07:00')) < ?
    `;
    
    const [sleepResult] = await connection.execute(deleteSleepSQL, [today]);
    console.log(`   ✅ Deleted ${sleepResult.affectedRows} old sleep tracking records`);
    
  } catch (error) {
    console.error('   ❌ Error clearing old sleep data:', error.message);
  }
};

// Clear old mood tracking data
const clearOldMoodData = async (connection) => {
  try {
    const today = getTodayDate();
    
    console.log('😊 Clearing old mood tracking data...');
    
    // Delete mood tracking data older than today
    const deleteMoodSQL = `
      DELETE FROM mood_tracking 
      WHERE DATE(CONVERT_TZ(tracking_date, '+00:00', '+07:00')) < ?
    `;
    
    const [moodResult] = await connection.execute(deleteMoodSQL, [today]);
    console.log(`   ✅ Deleted ${moodResult.affectedRows} old mood tracking records`);
    
  } catch (error) {
    console.error('   ❌ Error clearing old mood data:', error.message);
  }
};

// Clear old wellness activities data
const clearOldWellnessData = async (connection) => {
  try {
    const today = getTodayDate();
    
    console.log('🌟 Clearing old wellness activities data...');
    
    // Delete wellness activities data older than today
    const deleteWellnessSQL = `
      DELETE FROM wellness_activities 
      WHERE DATE(CONVERT_TZ(activity_date, '+00:00', '+07:00')) < ?
    `;
    
    const [wellnessResult] = await connection.execute(deleteWellnessSQL, [today]);
    console.log(`   ✅ Deleted ${wellnessResult.affectedRows} old wellness activities records`);
    
  } catch (error) {
    console.error('   ❌ Error clearing old wellness data:', error.message);
  }
};

// Clear old user missions data
const clearOldUserMissionsData = async (connection) => {
  try {
    const today = getTodayDate();
    
    console.log('🎯 Clearing old user missions data...');
    
    // Delete user missions data older than today
    const deleteUserMissionsSQL = `
      DELETE FROM user_missions 
      WHERE DATE(CONVERT_TZ(completed_at, '+00:00', '+07:00')) < ?
    `;
    
    const [userMissionsResult] = await connection.execute(deleteUserMissionsSQL, [today]);
    console.log(`   ✅ Deleted ${userMissionsResult.affectedRows} old user missions records`);
    
  } catch (error) {
    console.error('   ❌ Error clearing old user missions data:', error.message);
  }
};

// Check current data status
const checkCurrentDataStatus = async (connection) => {
  try {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    
    console.log('\n📊 CHECKING CURRENT DATA STATUS...');
    console.log(`   Today: ${today}`);
    console.log(`   Yesterday: ${yesterday}`);
    
    // Check meal data
    const [mealCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM meal_tracking WHERE DATE(CONVERT_TZ(recorded_at, "+00:00", "+07:00")) = ?',
      [today]
    );
    console.log(`   📅 Today's meal records: ${mealCount[0].count}`);
    
    // Check water data
    const [waterCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM water_tracking WHERE DATE(CONVERT_TZ(tracking_date, "+00:00", "+07:00")) = ?',
      [today]
    );
    console.log(`   📅 Today's water records: ${waterCount[0].count}`);
    
    // Check fitness data
    const [fitnessCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM fitness_tracking WHERE DATE(CONVERT_TZ(tracking_date, "+00:00", "+07:00")) = ?',
      [today]
    );
    console.log(`   📅 Today's fitness records: ${fitnessCount[0].count}`);
    
    // Check sleep data
    const [sleepCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM sleep_tracking WHERE DATE(CONVERT_TZ(sleep_date, "+00:00", "+07:00")) = ?',
      [today]
    );
    console.log(`   📅 Today's sleep records: ${sleepCount[0].count}`);
    
    // Check mood data
    const [moodCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM mood_tracking WHERE DATE(CONVERT_TZ(tracking_date, "+00:00", "+07:00")) = ?',
      [today]
    );
    console.log(`   📅 Today's mood records: ${moodCount[0].count}`);
    
    // Check wellness data
    const [wellnessCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM wellness_activities WHERE DATE(CONVERT_TZ(activity_date, "+00:00", "+07:00")) = ?',
      [today]
    );
    console.log(`   📅 Today's wellness records: ${wellnessCount[0].count}`);
    
  } catch (error) {
    console.error('   ❌ Error checking data status:', error.message);
  }
};

// Main execution function
const executeClearOldDatabaseData = async () => {
  let connection;
  
  try {
    console.log('🎯 EXECUTING CLEAR OLD DATABASE DATA');
    console.log('====================================');
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');
    
    // Check current data status before clearing
    await checkCurrentDataStatus(connection);
    
    // Clear old data
    console.log('\n🗑️  CLEARING OLD DATA...');
    await clearOldMealData(connection);
    await clearOldWaterData(connection);
    await clearOldFitnessData(connection);
    await clearOldSleepData(connection);
    await clearOldMoodData(connection);
    await clearOldWellnessData(connection);
    await clearOldUserMissionsData(connection);
    
    // Check data status after clearing
    console.log('\n📊 CHECKING DATA STATUS AFTER CLEARING...');
    await checkCurrentDataStatus(connection);
    
    console.log('\n✅ CLEAR OLD DATABASE DATA COMPLETED');
    console.log('====================================');
    console.log('📋 MANUAL STEPS REQUIRED:');
    console.log('');
    console.log('1. 📱 APP ACTIONS:');
    console.log('   - Restart mobile app completely');
    console.log('   - Check Today\'s Summary shows fresh data');
    console.log('   - Verify no old data appears');
    console.log('   - Check new data can be logged');
    console.log('');
    console.log('2. 🧪 TESTING ACTIONS:');
    console.log('   - Test meal logging');
    console.log('   - Test water logging');
    console.log('   - Test fitness logging');
    console.log('   - Test sleep logging');
    console.log('   - Test mood logging');
    console.log('   - Test wellness activities');
    console.log('');
    console.log('⚠️  CRITICAL CHECKS:');
    console.log('   - No old data should appear anywhere');
    console.log('   - Only current date data should be visible');
    console.log('   - New data should be logged successfully');
    console.log('   - Today\'s Summary should show fresh data');
    console.log('');
    console.log('🎉 EXPECTED RESULTS:');
    console.log('   - All old data cleared from database');
    console.log('   - Fresh data appears correctly');
    console.log('   - New data logging works');
    console.log('   - Today\'s Summary shows current data only');
    
  } catch (error) {
    console.error('❌ Error executing clear old database data:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run the clear old database data
executeClearOldDatabaseData();
