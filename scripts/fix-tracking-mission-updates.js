#!/usr/bin/env node

/**
 * Fix Tracking Mission Updates Script
 * 
 * This script fixes the issue where missions are not being updated with tracking data.
 * It ensures proper mission assignment and updates the progress correctly.
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

async function fixTrackingMissionUpdates() {
  let connection;
  
  try {
    console.log('🔧 Starting Tracking Mission Updates Fix...\n');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully\n');
    
    // Step 1: Check and fix mission assignments for all users
    console.log('🔧 Step 1: Checking and fixing mission assignments...');
    await fixMissionAssignments(connection);
    
    // Step 2: Update mission progress based on existing tracking data
    console.log('\n🔧 Step 2: Updating mission progress from tracking data...');
    await updateMissionProgressFromTracking(connection);
    
    // Step 3: Verify fixes
    console.log('\n🔧 Step 3: Verifying fixes...');
    await verifyFixes(connection);
    
    console.log('\n🎉 Tracking mission updates fix completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function fixMissionAssignments(connection) {
  try {
    // Get all users
    const [users] = await connection.execute('SELECT id, username FROM users WHERE role = "user"');
    console.log(`📊 Found ${users.length} users to check`);
    
    let totalAssignments = 0;
    
    for (const user of users) {
      console.log(`🔍 Checking user: ${user.username} (ID: ${user.id})`);
      
      // Check what missions this user has
      const [userMissions] = await connection.execute(`
        SELECT m.category, m.unit, COUNT(*) as mission_count
        FROM user_missions um
        JOIN missions m ON um.mission_id = m.id
        WHERE um.user_id = ? AND um.status = 'active'
        GROUP BY m.category, m.unit
      `, [user.id]);
      
      console.log(`   📋 User has missions in ${userMissions.length} categories`);
      
      // Get all available mission categories
      const [availableCategories] = await connection.execute(`
        SELECT DISTINCT category, unit
        FROM missions 
        WHERE is_active = 1
        ORDER BY category, unit
      `);
      
      // Check which categories are missing
      const userCategories = userMissions.map(um => `${um.category}_${um.unit}`);
      const missingCategories = availableCategories.filter(ac => 
        !userCategories.includes(`${ac.category}_${ac.unit}`)
      );
      
      if (missingCategories.length > 0) {
        console.log(`   ⚠️ Missing missions for categories: ${missingCategories.map(mc => `${mc.category} (${mc.unit})`).join(', ')}`);
        
        // Assign missing missions
        for (const missingCategory of missingCategories) {
          const assignedCount = await assignMissionsForCategory(connection, user.id, missingCategory.category, missingCategory.unit);
          totalAssignments += assignedCount;
          console.log(`   ✅ Assigned ${assignedCount} missions for ${missingCategory.category} (${missingCategory.unit})`);
        }
      } else {
        console.log(`   ✅ User has missions for all categories`);
      }
    }
    
    console.log(`🎯 Total new mission assignments: ${totalAssignments}`);
    
  } catch (error) {
    console.error('❌ Error fixing mission assignments:', error);
  }
}

async function assignMissionsForCategory(connection, userId, category, unit) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get available missions for this category and unit
    const [availableMissions] = await connection.execute(`
      SELECT id, title, target_value, unit, points, difficulty
      FROM missions 
      WHERE category = ? AND unit = ? AND is_active = 1
      ORDER BY difficulty ASC, target_value ASC LIMIT 3
    `, [category, unit]);
    
    let assignedCount = 0;
    
    for (const mission of availableMissions) {
      try {
        // Check if user already has this mission
        const [existingMission] = await connection.execute(`
          SELECT id FROM user_missions 
          WHERE user_id = ? AND mission_id = ? AND mission_date = ?
        `, [userId, mission.id, today]);
        
        if (existingMission.length === 0) {
          // Assign the mission
          await connection.execute(`
            INSERT INTO user_missions (
              user_id, mission_id, status, current_value, progress,
              mission_date, created_at, updated_at
            ) VALUES (?, ?, 'active', 0, 0, ?, NOW(), NOW())
          `, [userId, mission.id, today]);
          
          assignedCount++;
        }
      } catch (insertError) {
        console.error(`   ❌ Error assigning mission ${mission.id}:`, insertError.message);
      }
    }
    
    return assignedCount;
    
  } catch (error) {
    console.error(`❌ Error assigning missions for category ${category}:`, error);
    return 0;
  }
}

async function updateMissionProgressFromTracking(connection) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Update water missions
    console.log('   💧 Updating water missions...');
    await updateWaterMissions(connection, today);
    
    // Update fitness missions
    console.log('   🏃 Updating fitness missions...');
    await updateFitnessMissions(connection, today);
    
    // Update sleep missions
    console.log('   😴 Updating sleep missions...');
    await updateSleepMissions(connection, today);
    
    // Update mood missions
    console.log('   😊 Updating mood missions...');
    await updateMoodMissions(connection, today);
    
    // Update nutrition missions
    console.log('   🍽️ Updating nutrition missions...');
    await updateNutritionMissions(connection, today);
    
  } catch (error) {
    console.error('❌ Error updating mission progress:', error);
  }
}

async function updateWaterMissions(connection, date) {
  try {
    // Get total water intake for each user
    const [waterData] = await connection.execute(`
      SELECT user_id, SUM(amount_ml) as total_water
      FROM water_tracking 
      WHERE tracking_date = ?
      GROUP BY user_id
    `, [date]);
    
    for (const waterEntry of waterData) {
      // Update water missions for this user
      await connection.execute(`
        UPDATE user_missions um
        JOIN missions m ON um.mission_id = m.id
        SET 
          um.current_value = ?,
          um.progress = CASE 
            WHEN m.target_value > 0 THEN LEAST((? / m.target_value) * 100, 100)
            ELSE 0 
          END,
          um.status = CASE 
            WHEN ? >= m.target_value THEN 'completed'
            ELSE 'active'
          END,
          um.updated_at = NOW()
        WHERE um.user_id = ? 
          AND m.category = 'health_tracking' 
          AND m.unit = 'ml'
          AND um.mission_date = ?
      `, [waterEntry.total_water, waterEntry.total_water, waterEntry.total_water, waterEntry.user_id, date]);
    }
    
    console.log(`   ✅ Updated water missions for ${waterData.length} users`);
    
  } catch (error) {
    console.error('   ❌ Error updating water missions:', error);
  }
}

async function updateFitnessMissions(connection, date) {
  try {
    // Get fitness data for each user
    const [fitnessData] = await connection.execute(`
      SELECT 
        user_id,
        SUM(duration_minutes) as total_minutes,
        SUM(steps) as total_steps
      FROM fitness_tracking 
      WHERE tracking_date = ?
      GROUP BY user_id
    `, [date]);
    
    for (const fitnessEntry of fitnessData) {
      // Update exercise minutes missions
      if (fitnessEntry.total_minutes > 0) {
        await connection.execute(`
          UPDATE user_missions um
          JOIN missions m ON um.mission_id = m.id
          SET 
            um.current_value = ?,
            um.progress = CASE 
              WHEN m.target_value > 0 THEN LEAST((? / m.target_value) * 100, 100)
              ELSE 0 
            END,
            um.status = CASE 
              WHEN ? >= m.target_value THEN 'completed'
              ELSE 'active'
            END,
            um.updated_at = NOW()
          WHERE um.user_id = ? 
            AND m.category = 'fitness' 
            AND m.unit = 'minutes'
            AND um.mission_date = ?
        `, [fitnessEntry.total_minutes, fitnessEntry.total_minutes, fitnessEntry.total_minutes, fitnessEntry.user_id, date]);
      }
      
      // Update steps missions
      if (fitnessEntry.total_steps > 0) {
        await connection.execute(`
          UPDATE user_missions um
          JOIN missions m ON um.mission_id = m.id
          SET 
            um.current_value = ?,
            um.progress = CASE 
              WHEN m.target_value > 0 THEN LEAST((? / m.target_value) * 100, 100)
              ELSE 0 
            END,
            um.status = CASE 
              WHEN ? >= m.target_value THEN 'completed'
              ELSE 'active'
            END,
            um.updated_at = NOW()
          WHERE um.user_id = ? 
            AND m.category = 'fitness' 
            AND m.unit = 'steps'
            AND um.mission_date = ?
        `, [fitnessEntry.total_steps, fitnessEntry.total_steps, fitnessEntry.total_steps, fitnessEntry.user_id, date]);
      }
    }
    
    console.log(`   ✅ Updated fitness missions for ${fitnessData.length} users`);
    
  } catch (error) {
    console.error('   ❌ Error updating fitness missions:', error);
  }
}

async function updateSleepMissions(connection, date) {
  try {
    // Get sleep data for each user
    const [sleepData] = await connection.execute(`
      SELECT user_id, SUM(sleep_hours) as total_sleep
      FROM sleep_tracking 
      WHERE tracking_date = ?
      GROUP BY user_id
    `, [date]);
    
    for (const sleepEntry of sleepData) {
      await connection.execute(`
        UPDATE user_missions um
        JOIN missions m ON um.mission_id = m.id
        SET 
          um.current_value = ?,
          um.progress = CASE 
            WHEN m.target_value > 0 THEN LEAST((? / m.target_value) * 100, 100)
            ELSE 0 
          END,
          um.status = CASE 
            WHEN ? >= m.target_value THEN 'completed'
            ELSE 'active'
          END,
          um.updated_at = NOW()
        WHERE um.user_id = ? 
          AND m.category = 'health_tracking' 
          AND m.unit = 'hours'
          AND um.mission_date = ?
      `, [sleepEntry.total_sleep, sleepEntry.total_sleep, sleepEntry.total_sleep, sleepEntry.user_id, date]);
    }
    
    console.log(`   ✅ Updated sleep missions for ${sleepData.length} users`);
    
  } catch (error) {
    console.error('   ❌ Error updating sleep missions:', error);
  }
}

async function updateMoodMissions(connection, date) {
  try {
    // Get mood data for each user
    const [moodData] = await connection.execute(`
      SELECT user_id, COUNT(*) as mood_count
      FROM mood_tracking 
      WHERE tracking_date = ?
      GROUP BY user_id
    `, [date]);
    
    for (const moodEntry of moodData) {
      await connection.execute(`
        UPDATE user_missions um
        JOIN missions m ON um.mission_id = m.id
        SET 
          um.current_value = ?,
          um.progress = CASE 
            WHEN m.target_value > 0 THEN LEAST((? / m.target_value) * 100, 100)
            ELSE 0 
          END,
          um.status = CASE 
            WHEN ? >= m.target_value THEN 'completed'
            ELSE 'active'
          END,
          um.updated_at = NOW()
        WHERE um.user_id = ? 
          AND m.category = 'mental_health' 
          AND um.mission_date = ?
      `, [moodEntry.mood_count, moodEntry.mood_count, moodEntry.mood_count, moodEntry.user_id, date]);
    }
    
    console.log(`   ✅ Updated mood missions for ${moodData.length} users`);
    
  } catch (error) {
    console.error('   ❌ Error updating mood missions:', error);
  }
}

async function updateNutritionMissions(connection, date) {
  try {
    // Get nutrition data for each user
    const [nutritionData] = await connection.execute(`
      SELECT user_id, SUM(calories) as total_calories
      FROM meal_logging 
      WHERE meal_date = ?
      GROUP BY user_id
    `, [date]);
    
    for (const nutritionEntry of nutritionData) {
      await connection.execute(`
        UPDATE user_missions um
        JOIN missions m ON um.mission_id = m.id
        SET 
          um.current_value = ?,
          um.progress = CASE 
            WHEN m.target_value > 0 THEN LEAST((? / m.target_value) * 100, 100)
            ELSE 0 
          END,
          um.status = CASE 
            WHEN ? >= m.target_value THEN 'completed'
            ELSE 'active'
          END,
          um.updated_at = NOW()
        WHERE um.user_id = ? 
          AND m.category = 'nutrition' 
          AND um.mission_date = ?
      `, [nutritionEntry.total_calories, nutritionEntry.total_calories, nutritionEntry.total_calories, nutritionEntry.user_id, date]);
    }
    
    console.log(`   ✅ Updated nutrition missions for ${nutritionData.length} users`);
    
  } catch (error) {
    console.error('   ❌ Error updating nutrition missions:', error);
  }
}

async function verifyFixes(connection) {
  try {
    // Check total user missions
    const [totalMissions] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.status = 'active'
    `);
    
    console.log(`📊 Total active user missions: ${totalMissions[0].total}`);
    
    // Check completed missions
    const [completedMissions] = await connection.execute(`
      SELECT COUNT(*) as completed
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.status = 'completed'
    `);
    
    console.log(`🎉 Total completed missions: ${completedMissions[0].completed}`);
    
    // Check missions by category
    const [missionsByCategory] = await connection.execute(`
      SELECT 
        m.category,
        m.unit,
        COUNT(*) as mission_count,
        SUM(CASE WHEN um.status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      GROUP BY m.category, m.unit
      ORDER BY m.category, m.unit
    `);
    
    console.log('📋 Missions by category:');
    missionsByCategory.forEach(mbc => {
      console.log(`   - ${mbc.category} (${mbc.unit}): ${mbc.mission_count} total, ${mbc.completed_count} completed`);
    });
    
  } catch (error) {
    console.error('❌ Error verifying fixes:', error);
  }
}

// Run the fix
if (require.main === module) {
  fixTrackingMissionUpdates().then(() => {
    console.log('\n🏁 Fix script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Fix script failed:', error);
    process.exit(1);
  });
}

module.exports = { fixTrackingMissionUpdates };
