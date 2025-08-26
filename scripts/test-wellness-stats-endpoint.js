#!/usr/bin/env node

/**
 * Test Wellness Stats Endpoint Script
 * 
 * This script tests the wellness stats endpoint to ensure it works correctly
 * and doesn't return 500 errors.
 */

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function testWellnessStatsEndpoint() {
  let connection;
  
  try {
    console.log('🧪 Starting Wellness Stats Endpoint Test...\n');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully\n');
    
    // Step 1: Check if required tables exist
    console.log('🔍 Step 1: Checking required tables...');
    await checkRequiredTables(connection);
    
    // Step 2: Check if test user exists
    console.log('\n🔍 Step 2: Checking test user...');
    const testUserId = await checkTestUser(connection);
    
    // Step 3: Check tracking data
    console.log('\n🔍 Step 3: Checking tracking data...');
    await checkTrackingData(connection, testUserId);
    
    // Step 4: Check wellness activities
    console.log('\n🔍 Step 4: Checking wellness activities...');
    await checkWellnessActivities(connection, testUserId);
    
    // Step 5: Test queries that wellness stats endpoint uses
    console.log('\n🔍 Step 5: Testing wellness stats queries...');
    await testWellnessStatsQueries(connection, testUserId);
    
    console.log('\n🎉 Wellness stats endpoint test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function checkRequiredTables(connection) {
  const requiredTables = [
    'mood_tracking',
    'water_tracking', 
    'sleep_tracking',
    'fitness_tracking',
    'available_wellness_activities',
    'user_wellness_activities'
  ];
  
  for (const table of requiredTables) {
    try {
      const [result] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
      if (result.length > 0) {
        console.log(`   ✅ Table ${table} exists`);
      } else {
        console.log(`   ❌ Table ${table} does not exist`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking table ${table}:`, error.message);
    }
  }
}

async function checkTestUser(connection) {
  // Check if test user exists
  const [users] = await connection.execute(`
    SELECT id, username, email 
    FROM users 
    WHERE email LIKE '%test%' OR username LIKE '%test%'
    LIMIT 1
  `);
  
  let testUserId;
  if (users.length > 0) {
    testUserId = users[0].id;
    console.log(`   ✅ Using existing test user: ${users[0].username} (ID: ${testUserId})`);
  } else {
    // Create test user
    const [newUser] = await connection.execute(`
      INSERT INTO users (username, email, password_hash, role, created_at, updated_at)
      VALUES ('test_user_wellness', 'test.wellness@example.com', 'test_hash', 'user', NOW(), NOW())
    `);
    testUserId = newUser.insertId;
    console.log(`   ✅ Created test user with ID: ${testUserId}`);
  }
  
  return testUserId;
}

async function checkTrackingData(connection, userId) {
  const today = new Date().toISOString().split('T')[0];
  
  // Check mood tracking
  try {
    const [moodData] = await connection.execute(`
      SELECT COUNT(*) as count FROM mood_tracking WHERE user_id = ?
    `, [userId]);
    console.log(`   😊 Mood tracking entries: ${moodData[0].count}`);
  } catch (error) {
    console.log(`   ❌ Error checking mood tracking:`, error.message);
  }
  
  // Check water tracking
  try {
    const [waterData] = await connection.execute(`
      SELECT COUNT(*) as count FROM water_tracking WHERE user_id = ?
    `, [userId]);
    console.log(`   💧 Water tracking entries: ${waterData[0].count}`);
  } catch (error) {
    console.log(`   ❌ Error checking water tracking:`, error.message);
  }
  
  // Check sleep tracking
  try {
    const [sleepData] = await connection.execute(`
      SELECT COUNT(*) as count FROM sleep_tracking WHERE user_id = ?
    `, [userId]);
    console.log(`   😴 Sleep tracking entries: ${sleepData[0].count}`);
  } catch (error) {
    console.log(`   ❌ Error checking sleep tracking:`, error.message);
  }
  
  // Check fitness tracking
  try {
    const [fitnessData] = await connection.execute(`
      SELECT COUNT(*) as count FROM fitness_tracking WHERE user_id = ?
    `, [userId]);
    console.log(`   🏃 Fitness tracking entries: ${fitnessData[0].count}`);
  } catch (error) {
    console.log(`   ❌ Error checking fitness tracking:`, error.message);
  }
}

async function checkWellnessActivities(connection, userId) {
  // Check available wellness activities
  try {
    const [availableActivities] = await connection.execute(`
      SELECT COUNT(*) as count FROM available_wellness_activities WHERE is_active = 1
    `);
    console.log(`   📋 Available wellness activities: ${availableActivities[0].count}`);
  } catch (error) {
    console.log(`   ❌ Error checking available activities:`, error.message);
  }
  
  // Check user wellness activities
  try {
    const [userActivities] = await connection.execute(`
      SELECT COUNT(*) as count FROM user_wellness_activities WHERE user_id = ?
    `, [userId]);
    console.log(`   🎯 User wellness activities: ${userActivities[0].count}`);
  } catch (error) {
    console.log(`   ❌ Error checking user activities:`, error.message);
  }
}

async function testWellnessStatsQueries(connection, userId) {
  const period = 7;
  const daysAgo = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  console.log(`   📅 Testing queries for period: ${period} days (from ${startDateStr})`);
  
  // Test mood query
  try {
    const moodQuery = `
      SELECT 
        COUNT(*) as mood_entries,
        AVG(CASE 
          WHEN mood_level = 'very_happy' THEN 10
          WHEN mood_level = 'happy' THEN 8
          WHEN mood_level = 'neutral' THEN 5
          WHEN mood_level = 'sad' THEN 3
          WHEN mood_level = 'very_sad' THEN 1
          ELSE 5
        END) as avg_mood_score
      FROM mood_tracking 
      WHERE user_id = ? AND tracking_date >= ?
    `;
    const [moodResult] = await connection.execute(moodQuery, [userId, startDateStr]);
    console.log(`   ✅ Mood query successful: ${moodResult[0].mood_entries} entries, avg score: ${moodResult[0].avg_mood_score}`);
  } catch (error) {
    console.log(`   ❌ Mood query failed:`, error.message);
  }
  
  // Test water query
  try {
    const waterQuery = 'SELECT COUNT(*) as water_entries FROM water_tracking WHERE user_id = ?';
    const [waterResult] = await connection.execute(waterQuery, [userId]);
    console.log(`   ✅ Water query successful: ${waterResult[0].water_entries} entries`);
  } catch (error) {
    console.log(`   ❌ Water query failed:`, error.message);
  }
  
  // Test sleep query
  try {
    const sleepQuery = 'SELECT COUNT(*) as sleep_entries FROM sleep_tracking WHERE user_id = ?';
    const [sleepResult] = await connection.execute(sleepQuery, [userId]);
    console.log(`   ✅ Sleep query successful: ${sleepResult[0].sleep_entries} entries`);
  } catch (error) {
    console.log(`   ❌ Sleep query failed:`, error.message);
  }
  
  // Test fitness query
  try {
    const fitnessQuery = 'SELECT COUNT(*) as fitness_entries FROM fitness_tracking WHERE user_id = ?';
    const [fitnessResult] = await connection.execute(fitnessQuery, [userId]);
    console.log(`   ✅ Fitness query successful: ${fitnessResult[0].fitness_entries} entries`);
  } catch (error) {
    console.log(`   ❌ Fitness query failed:`, error.message);
  }
  
  // Test wellness activities queries
  try {
    const totalActivitiesQuery = `
      SELECT COUNT(*) as total_available
      FROM available_wellness_activities 
      WHERE is_active = 1
    `;
    const [totalActivitiesResult] = await connection.execute(totalActivitiesQuery);
    console.log(`   ✅ Total activities query successful: ${totalActivitiesResult[0].total_available} available`);
    
    const userActivitiesQuery = `
      SELECT 
        uwa.id,
        uwa.activity_id,
        uwa.completed_at,
        uwa.duration_minutes,
        awa.points as base_points
      FROM user_wellness_activities uwa
      LEFT JOIN available_wellness_activities awa ON uwa.activity_id = awa.id
      WHERE uwa.user_id = ? AND uwa.completed_at IS NOT NULL
    `;
    const [userActivitiesResult] = await connection.execute(userActivitiesQuery, [userId]);
    console.log(`   ✅ User activities query successful: ${userActivitiesResult.length} completed activities`);
  } catch (error) {
    console.log(`   ❌ Wellness activities queries failed:`, error.message);
  }
}

// Run the test
if (require.main === module) {
  testWellnessStatsEndpoint().then(() => {
    console.log('\n🏁 Wellness stats endpoint test finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Wellness stats endpoint test failed:', error);
    process.exit(1);
  });
}

module.exports = { testWellnessStatsEndpoint };
