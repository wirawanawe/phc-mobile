#!/usr/bin/env node

/**
 * Debug Tracking Mission Integration Script
 * 
 * This script helps debug why missions are not being updated with tracking data.
 * It tests the complete flow and identifies issues.
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

async function debugTrackingMissionIntegration() {
  let connection;
  
  try {
    console.log('🔍 Starting Tracking Mission Integration Debug...\n');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully\n');
    
    // Step 1: Check if missions exist
    console.log('🔍 Step 1: Checking available missions...');
    const [missions] = await connection.execute(`
      SELECT id, title, category, unit, target_value, is_active, difficulty
      FROM missions 
      WHERE is_active = 1 
      ORDER BY category, difficulty
    `);
    
    if (missions.length === 0) {
      console.log('❌ No active missions found. Please run mission creation scripts first.');
      return;
    }
    
    console.log(`✅ Found ${missions.length} active missions`);
    
    // Group missions by category
    const missionsByCategory = missions.reduce((acc, mission) => {
      if (!acc[mission.category]) {
        acc[mission.category] = [];
      }
      acc[mission.category].push(mission);
      return acc;
    }, {});
    
    Object.entries(missionsByCategory).forEach(([category, categoryMissions]) => {
      console.log(`📋 ${category}: ${categoryMissions.length} missions`);
      categoryMissions.forEach(mission => {
        console.log(`   - ${mission.title} (${mission.unit}, target: ${mission.target_value})`);
      });
    });
    
    // Step 2: Check if test user exists
    console.log('\n🔍 Step 2: Checking test user...');
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
        VALUES ('test_user_debug', 'test.debug@example.com', 'test_hash', 'user', NOW(), NOW())
      `);
      testUserId = newUser.insertId;
      console.log(`✅ Created test user with ID: ${testUserId}`);
    }
    
    // Step 3: Check existing user missions
    console.log('\n🔍 Step 3: Checking existing user missions...');
    const [existingUserMissions] = await connection.execute(`
      SELECT 
        um.id,
        um.current_value,
        um.progress,
        um.status,
        m.title,
        m.category,
        m.unit,
        m.target_value
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ?
      ORDER BY m.category, m.title
    `, [testUserId]);
    
    console.log(`📊 User has ${existingUserMissions.length} existing missions`);
    if (existingUserMissions.length > 0) {
      existingUserMissions.forEach(um => {
        console.log(`   - ${um.title}: ${um.current_value}/${um.target_value} (${um.progress}%) - ${um.status}`);
      });
    }
    
    // Step 4: Test water tracking integration
    console.log('\n🔍 Step 4: Testing water tracking integration...');
    await testWaterTrackingIntegration(connection, testUserId);
    
    // Step 5: Test fitness tracking integration
    console.log('\n🔍 Step 5: Testing fitness tracking integration...');
    await testFitnessTrackingIntegration(connection, testUserId);
    
    // Step 6: Check user missions after tracking
    console.log('\n🔍 Step 6: Checking user missions after tracking...');
    const [updatedUserMissions] = await connection.execute(`
      SELECT 
        um.id,
        um.current_value,
        um.progress,
        um.status,
        m.title,
        m.category,
        m.unit,
        m.target_value
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ?
      ORDER BY m.category, m.title
    `, [testUserId]);
    
    console.log(`📊 User now has ${updatedUserMissions.length} missions`);
    if (updatedUserMissions.length > 0) {
      updatedUserMissions.forEach(um => {
        console.log(`   - ${um.title}: ${um.current_value}/${um.target_value} (${um.progress}%) - ${um.status}`);
      });
    }
    
    // Step 7: Check tracking data
    console.log('\n🔍 Step 7: Checking tracking data...');
    await checkTrackingData(connection, testUserId);
    
    console.log('\n🎉 Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function testWaterTrackingIntegration(connection, userId) {
  try {
    // Add water tracking entry
    const waterAmount = 500;
    const today = new Date().toISOString().split('T')[0];
    
    await connection.execute(`
      INSERT INTO water_tracking (user_id, amount_ml, tracking_date, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `, [userId, waterAmount, today]);
    
    console.log(`   💧 Added ${waterAmount}ml water tracking entry`);
    
    // Simulate auto-update mission call
    const [waterMissions] = await connection.execute(`
      SELECT um.id, um.current_value, um.progress, um.status, m.title, m.target_value, m.unit
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ? AND m.category = 'health_tracking' AND m.unit = 'ml'
    `, [userId]);
    
    console.log(`   📊 Found ${waterMissions.length} water missions`);
    
    if (waterMissions.length === 0) {
      console.log(`   ⚠️ No water missions found - checking if auto-assignment is needed`);
      
      // Check if there are available water missions
      const [availableWaterMissions] = await connection.execute(`
        SELECT id, title, target_value, unit
        FROM missions 
        WHERE category = 'health_tracking' AND unit = 'ml' AND is_active = 1
        ORDER BY difficulty ASC, target_value ASC LIMIT 3
      `);
      
      console.log(`   🔍 Found ${availableWaterMissions.length} available water missions`);
      
      if (availableWaterMissions.length > 0) {
        // Auto-assign missions
        for (const mission of availableWaterMissions) {
          try {
            await connection.execute(`
              INSERT INTO user_missions (
                user_id, mission_id, status, current_value, progress,
                mission_date, created_at, updated_at
              ) VALUES (?, ?, 'active', 0, 0, ?, NOW(), NOW())
            `, [userId, mission.id, today]);
            
            console.log(`   ✅ Auto-assigned mission: ${mission.title}`);
          } catch (insertError) {
            console.error(`   ❌ Error auto-assigning mission ${mission.id}:`, insertError.message);
          }
        }
      }
    }
    
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
    
    console.log(`   📊 Found ${fitnessMissions.length} fitness missions`);
    
    if (fitnessMissions.length === 0) {
      console.log(`   ⚠️ No fitness missions found - checking if auto-assignment is needed`);
      
      // Check if there are available fitness missions
      const [availableFitnessMissions] = await connection.execute(`
        SELECT id, title, target_value, unit
        FROM missions 
        WHERE category = 'fitness' AND is_active = 1
        ORDER BY difficulty ASC, target_value ASC LIMIT 3
      `);
      
      console.log(`   🔍 Found ${availableFitnessMissions.length} available fitness missions`);
      
      if (availableFitnessMissions.length > 0) {
        // Auto-assign missions
        for (const mission of availableFitnessMissions) {
          try {
            await connection.execute(`
              INSERT INTO user_missions (
                user_id, mission_id, status, current_value, progress,
                mission_date, created_at, updated_at
              ) VALUES (?, ?, 'active', 0, 0, ?, NOW(), NOW())
            `, [userId, mission.id, today]);
            
            console.log(`   ✅ Auto-assigned mission: ${mission.title}`);
          } catch (insertError) {
            console.error(`   ❌ Error auto-assigning mission ${mission.id}:`, insertError.message);
          }
        }
      }
    }
    
    console.log(`   ✅ Fitness tracking integration test completed`);
    
  } catch (error) {
    console.error('   ❌ Fitness tracking integration test failed:', error);
  }
}

async function checkTrackingData(connection, userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check water tracking
    const [waterData] = await connection.execute(`
      SELECT SUM(amount_ml) as total_water
      FROM water_tracking 
      WHERE user_id = ? AND tracking_date = ?
    `, [userId, today]);
    
    console.log(`   💧 Total water today: ${waterData[0]?.total_water || 0}ml`);
    
    // Check fitness tracking
    const [fitnessData] = await connection.execute(`
      SELECT 
        SUM(duration_minutes) as total_minutes,
        SUM(steps) as total_steps,
        SUM(calories_burned) as total_calories
      FROM fitness_tracking 
      WHERE user_id = ? AND tracking_date = ?
    `, [userId, today]);
    
    console.log(`   🏃 Total fitness today: ${fitnessData[0]?.total_minutes || 0}min, ${fitnessData[0]?.total_steps || 0} steps`);
    
    // Check sleep tracking
    const [sleepData] = await connection.execute(`
      SELECT SUM(sleep_hours) as total_sleep
      FROM sleep_tracking 
      WHERE user_id = ? AND tracking_date = ?
    `, [userId, today]);
    
    console.log(`   😴 Total sleep today: ${sleepData[0]?.total_sleep || 0} hours`);
    
    // Check mood tracking
    const [moodData] = await connection.execute(`
      SELECT COUNT(*) as mood_count
      FROM mood_tracking 
      WHERE user_id = ? AND tracking_date = ?
    `, [userId, today]);
    
    console.log(`   😊 Mood entries today: ${moodData[0]?.mood_count || 0}`);
    
    // Check nutrition tracking
    const [nutritionData] = await connection.execute(`
      SELECT SUM(calories) as total_calories
      FROM meal_logging 
      WHERE user_id = ? AND meal_date = ?
    `, [userId, today]);
    
    console.log(`   🍽️ Total calories today: ${nutritionData[0]?.total_calories || 0}`);
    
  } catch (error) {
    console.error('   ❌ Error checking tracking data:', error);
  }
}

// Run the debug
if (require.main === module) {
  debugTrackingMissionIntegration().then(() => {
    console.log('\n🏁 Debug script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Debug script failed:', error);
    process.exit(1);
  });
}

module.exports = { debugTrackingMissionIntegration };
