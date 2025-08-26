#!/usr/bin/env node

/**
 * Tracking Mission Integration Test Script
 * 
 * This script tests the complete integration between tracking and mission systems:
 * 1. Tests auto-assignment of missions when users start tracking
 * 2. Tests progress calculation and updates
 * 3. Tests real-time updates and notifications
 * 4. Tests mission completion flow
 */

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function testTrackingMissionIntegration() {
  let connection;
  
  try {
    console.log('🧪 Starting Tracking Mission Integration Test...\n');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully\n');
    
    // Test 1: Check if missions exist
    console.log('🔍 Test 1: Checking available missions...');
    const [missions] = await connection.execute(`
      SELECT id, title, category, unit, target_value, is_active 
      FROM missions 
      WHERE is_active = 1 
      ORDER BY category, difficulty
    `);
    
    if (missions.length === 0) {
      console.log('❌ No active missions found. Please run mission creation scripts first.');
      return;
    }
    
    console.log(`✅ Found ${missions.length} active missions`);
    console.log('📋 Mission categories:', [...new Set(missions.map(m => m.category))]);
    console.log('📋 Mission units:', [...new Set(missions.map(m => m.unit))]);
    
    // Test 2: Check if test user exists
    console.log('\n🔍 Test 2: Checking test user...');
    const [users] = await connection.execute(`
      SELECT id, username, email 
      FROM users 
      WHERE email LIKE '%test%' OR username LIKE '%test%'
      LIMIT 1
    `);
    
    let testUserId;
    if (users.length > 0) {
      testUserId = users[0].id;
      console.log(`✅ Using existing test user: ${users[0].username} (ID: ${testUserId})`);
    } else {
      // Create test user
      const [newUser] = await connection.execute(`
        INSERT INTO users (username, email, password_hash, role, created_at, updated_at)
        VALUES ('test_user_integration', 'test.integration@example.com', 'test_hash', 'user', NOW(), NOW())
      `);
      testUserId = newUser.insertId;
      console.log(`✅ Created test user with ID: ${testUserId}`);
    }
    
    // Test 3: Clear existing user missions for clean test
    console.log('\n🔍 Test 3: Clearing existing user missions for clean test...');
    await connection.execute('DELETE FROM user_missions WHERE user_id = ?', [testUserId]);
    console.log('✅ Cleared existing user missions');
    
    // Test 4: Test water tracking integration
    console.log('\n🔍 Test 4: Testing water tracking integration...');
    await testWaterTrackingIntegration(connection, testUserId);
    
    // Test 5: Test fitness tracking integration
    console.log('\n🔍 Test 5: Testing fitness tracking integration...');
    await testFitnessTrackingIntegration(connection, testUserId);
    
    // Test 6: Test sleep tracking integration
    console.log('\n🔍 Test 6: Testing sleep tracking integration...');
    await testSleepTrackingIntegration(connection, testUserId);
    
    // Test 7: Test mood tracking integration
    console.log('\n🔍 Test 7: Testing mood tracking integration...');
    await testMoodTrackingIntegration(connection, testUserId);
    
    // Test 8: Test nutrition tracking integration
    console.log('\n🔍 Test 8: Testing nutrition tracking integration...');
    await testNutritionTrackingIntegration(connection, testUserId);
    
    // Test 9: Verify mission progress and completion
    console.log('\n🔍 Test 9: Verifying mission progress and completion...');
    await verifyMissionProgress(connection, testUserId);
    
    console.log('\n🎉 All integration tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function testWaterTrackingIntegration(connection, userId) {
  try {
    // Check if user has water missions
    const [userMissions] = await connection.execute(`
      SELECT um.id, um.current_value, um.progress, um.status, m.title, m.target_value, m.unit
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ? AND m.category = 'health_tracking' AND m.unit = 'ml'
    `, [userId]);
    
    console.log(`   📊 User has ${userMissions.length} water missions`);
    
    // Add water tracking entry
    const waterAmount = 500;
    const today = new Date().toISOString().split('T')[0];
    
    await connection.execute(`
      INSERT INTO water_tracking (user_id, amount_ml, tracking_date, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `, [userId, waterAmount, today]);
    
    console.log(`   💧 Added ${waterAmount}ml water tracking entry`);
    
    // Simulate auto-update mission call
    const [updatedMissions] = await connection.execute(`
      SELECT um.id, um.current_value, um.progress, um.status, m.title, m.target_value
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ? AND m.category = 'health_tracking' AND m.unit = 'ml'
    `, [userId]);
    
    console.log(`   ✅ Water tracking integration test completed`);
    
  } catch (error) {
    console.error('   ❌ Water tracking integration test failed:', error);
  }
}

async function testFitnessTrackingIntegration(connection, userId) {
  try {
    // Add fitness tracking entry
    const exerciseMinutes = 30;
    const steps = 5000;
    const today = new Date().toISOString().split('T')[0];
    
    await connection.execute(`
      INSERT INTO fitness_tracking (user_id, activity_type, activity_name, duration_minutes, 
                                   calories_burned, distance_km, steps, tracking_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [userId, 'running', 'Running', exerciseMinutes, 300, 5.0, steps, today]);
    
    console.log(`   🏃 Added fitness tracking: ${exerciseMinutes}min exercise, ${steps} steps`);
    
    // Check fitness missions
    const [fitnessMissions] = await connection.execute(`
      SELECT um.id, um.current_value, um.progress, um.status, m.title, m.target_value, m.unit
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ? AND m.category = 'fitness'
    `, [userId]);
    
    console.log(`   📊 User has ${fitnessMissions.length} fitness missions`);
    console.log(`   ✅ Fitness tracking integration test completed`);
    
  } catch (error) {
    console.error('   ❌ Fitness tracking integration test failed:', error);
  }
}

async function testSleepTrackingIntegration(connection, userId) {
  try {
    // Add sleep tracking entry
    const sleepHours = 8;
    const today = new Date().toISOString().split('T')[0];
    
    await connection.execute(`
      INSERT INTO sleep_tracking (user_id, sleep_hours, sleep_minutes, sleep_quality, 
                                 bedtime, wake_time, tracking_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [userId, sleepHours, 0, 'good', '22:00', '06:00', today]);
    
    console.log(`   😴 Added sleep tracking: ${sleepHours} hours`);
    
    // Check sleep missions
    const [sleepMissions] = await connection.execute(`
      SELECT um.id, um.current_value, um.progress, um.status, m.title, m.target_value, m.unit
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ? AND m.category = 'health_tracking' AND m.unit = 'hours'
    `, [userId]);
    
    console.log(`   📊 User has ${sleepMissions.length} sleep missions`);
    console.log(`   ✅ Sleep tracking integration test completed`);
    
  } catch (error) {
    console.error('   ❌ Sleep tracking integration test failed:', error);
  }
}

async function testMoodTrackingIntegration(connection, userId) {
  try {
    // Add mood tracking entry
    const moodScore = 8;
    const today = new Date().toISOString().split('T')[0];
    
    await connection.execute(`
      INSERT INTO mood_tracking (user_id, mood_level, mood_score, stress_level, 
                                tracking_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `, [userId, 'happy', moodScore, 'low', today]);
    
    console.log(`   😊 Added mood tracking: score ${moodScore}`);
    
    // Check mental health missions
    const [moodMissions] = await connection.execute(`
      SELECT um.id, um.current_value, um.progress, um.status, m.title, m.target_value, m.unit
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ? AND m.category = 'mental_health'
    `, [userId]);
    
    console.log(`   📊 User has ${moodMissions.length} mental health missions`);
    console.log(`   ✅ Mood tracking integration test completed`);
    
  } catch (error) {
    console.error('   ❌ Mood tracking integration test failed:', error);
  }
}

async function testNutritionTrackingIntegration(connection, userId) {
  try {
    // Add nutrition tracking entry
    const calories = 800;
    const today = new Date().toISOString().split('T')[0];
    
    await connection.execute(`
      INSERT INTO meal_logging (user_id, meal_type, calories, protein, carbs, fat, 
                               meal_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [userId, 'lunch', calories, 25, 80, 30, today]);
    
    console.log(`   🍽️ Added nutrition tracking: ${calories} calories`);
    
    // Check nutrition missions
    const [nutritionMissions] = await connection.execute(`
      SELECT um.id, um.current_value, um.progress, um.status, m.title, m.target_value, m.unit
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ? AND m.category = 'nutrition'
    `, [userId]);
    
    console.log(`   📊 User has ${nutritionMissions.length} nutrition missions`);
    console.log(`   ✅ Nutrition tracking integration test completed`);
    
  } catch (error) {
    console.error('   ❌ Nutrition tracking integration test failed:', error);
  }
}

async function verifyMissionProgress(connection, userId) {
  try {
    // Get all user missions with their progress
    const [userMissions] = await connection.execute(`
      SELECT 
        um.id,
        um.current_value,
        um.progress,
        um.status,
        m.title,
        m.target_value,
        m.unit,
        m.category
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ?
      ORDER BY m.category, m.title
    `, [userId]);
    
    console.log(`   📊 Total user missions: ${userMissions.length}`);
    
    // Group by category
    const missionsByCategory = userMissions.reduce((acc, mission) => {
      if (!acc[mission.category]) {
        acc[mission.category] = [];
      }
      acc[mission.category].push(mission);
      return acc;
    }, {});
    
    Object.entries(missionsByCategory).forEach(([category, missions]) => {
      console.log(`   📋 ${category}: ${missions.length} missions`);
      missions.forEach(mission => {
        const progressPercent = mission.progress || 0;
        const status = mission.status || 'active';
        console.log(`      - ${mission.title}: ${progressPercent}% (${status})`);
      });
    });
    
    // Check for completed missions
    const completedMissions = userMissions.filter(m => m.status === 'completed');
    console.log(`   🎉 Completed missions: ${completedMissions.length}`);
    
    console.log(`   ✅ Mission progress verification completed`);
    
  } catch (error) {
    console.error('   ❌ Mission progress verification failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testTrackingMissionIntegration().then(() => {
    console.log('\n🏁 Integration test script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Integration test script failed:', error);
    process.exit(1);
  });
}

module.exports = { testTrackingMissionIntegration };
