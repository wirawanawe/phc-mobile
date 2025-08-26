#!/usr/bin/env node

/**
 * 🔍 Update Progress Manual Button Diagnosis Script
 * 
 * This script helps diagnose and fix issues with the Update Progress Manual button
 * by checking various components and providing solutions.
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
      host: process.env.DB_HOST || 'dash.doctorphc.id',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_mobile',
  port: process.env.DB_PORT || 3306
};

console.log('🔍 Update Progress Manual Button Diagnosis Script');
console.log('================================================\n');

async function diagnoseUpdateProgressButton() {
  let connection;
  
  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    connection = await mysql.createConnection(config);
    console.log('✅ Database connection successful\n');

    // 2. Check user_missions table structure
    console.log('2️⃣ Checking user_missions table structure...');
    const [columns] = await connection.execute(`
      DESCRIBE user_missions
    `);
    
    const requiredColumns = ['id', 'user_id', 'mission_id', 'status', 'current_value', 'progress', 'notes', 'created_at', 'updated_at'];
    const existingColumns = columns.map(col => col.Field);
    
    console.log('📋 Existing columns:', existingColumns);
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    if (missingColumns.length > 0) {
      console.log('❌ Missing columns:', missingColumns);
    } else {
      console.log('✅ All required columns exist\n');
    }

    // 3. Check missions table structure
    console.log('3️⃣ Checking missions table structure...');
    const [missionColumns] = await connection.execute(`
      DESCRIBE missions
    `);
    
    const requiredMissionColumns = ['id', 'title', 'target_value', 'points', 'color'];
    const existingMissionColumns = missionColumns.map(col => col.Field);
    
    console.log('📋 Existing mission columns:', existingMissionColumns);
    
    const missingMissionColumns = requiredMissionColumns.filter(col => !existingMissionColumns.includes(col));
    if (missingMissionColumns.length > 0) {
      console.log('❌ Missing mission columns:', missingMissionColumns);
    } else {
      console.log('✅ All required mission columns exist\n');
    }

    // 4. Check for active user missions
    console.log('4️⃣ Checking active user missions...');
    const [activeMissions] = await connection.execute(`
      SELECT 
        um.id as user_mission_id,
        um.user_id,
        um.mission_id,
        um.status,
        um.current_value,
        um.progress,
        um.notes,
        m.title,
        m.target_value,
        m.points,
        m.color
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.status = 'active'
      ORDER BY um.id DESC
      LIMIT 10
    `);
    
    if (activeMissions.length === 0) {
      console.log('❌ No active user missions found');
      console.log('💡 This might be why the button is not working');
    } else {
      console.log(`✅ Found ${activeMissions.length} active user missions:`);
      activeMissions.forEach((mission, index) => {
        console.log(`   ${index + 1}. ${mission.title} (ID: ${mission.user_mission_id})`);
        console.log(`      Progress: ${mission.current_value}/${mission.target_value} (${mission.progress}%)`);
        console.log(`      Status: ${mission.status}`);
      });
    }
    console.log('');

    // 5. Check for data consistency issues
    console.log('5️⃣ Checking for data consistency issues...');
    const [inconsistentMissions] = await connection.execute(`
      SELECT 
        um.id as user_mission_id,
        um.current_value,
        um.progress,
        m.target_value,
        ROUND((um.current_value / m.target_value) * 100) as calculated_progress
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.progress != ROUND((um.current_value / m.target_value) * 100)
      AND um.status = 'active'
    `);
    
    if (inconsistentMissions.length > 0) {
      console.log('❌ Found missions with inconsistent progress calculation:');
      inconsistentMissions.forEach(mission => {
        console.log(`   User Mission ID ${mission.user_mission_id}:`);
        console.log(`      Stored progress: ${mission.progress}%`);
        console.log(`      Calculated progress: ${mission.calculated_progress}%`);
        console.log(`      Current value: ${mission.current_value}`);
        console.log(`      Target value: ${mission.target_value}`);
      });
    } else {
      console.log('✅ All missions have consistent progress calculations\n');
    }

    // 6. Test API endpoint simulation
    console.log('6️⃣ Testing API endpoint simulation...');
    if (activeMissions.length > 0) {
      const testMission = activeMissions[0];
      console.log(`🧪 Testing with user mission ID: ${testMission.user_mission_id}`);
      
      // Simulate the update process
      const newValue = Math.min(testMission.current_value + 1, testMission.target_value);
      const newProgress = Math.round((newValue / testMission.target_value) * 100);
      
      console.log(`   Current value: ${testMission.current_value} → New value: ${newValue}`);
      console.log(`   Current progress: ${testMission.progress}% → New progress: ${newProgress}%`);
      
      // Check if the update would work
      if (testMission.status === 'active') {
        console.log('✅ Mission is active and can be updated');
      } else {
        console.log(`❌ Mission status is '${testMission.status}', cannot be updated`);
      }
    }
    console.log('');

    // 7. Check for common issues
    console.log('7️⃣ Checking for common issues...');
    
    // Check for missions with null or invalid values
    const [nullValueMissions] = await connection.execute(`
      SELECT um.id, um.current_value, um.progress, um.status
      FROM user_missions um
      WHERE um.current_value IS NULL OR um.progress IS NULL
    `);
    
    if (nullValueMissions.length > 0) {
      console.log('❌ Found missions with null values:');
      nullValueMissions.forEach(mission => {
        console.log(`   User Mission ID ${mission.id}: current_value=${mission.current_value}, progress=${mission.progress}`);
      });
    } else {
      console.log('✅ No missions with null values found');
    }

    // Check for missions with negative values
    const [negativeValueMissions] = await connection.execute(`
      SELECT um.id, um.current_value, um.progress
      FROM user_missions um
      WHERE um.current_value < 0 OR um.progress < 0
    `);
    
    if (negativeValueMissions.length > 0) {
      console.log('❌ Found missions with negative values:');
      negativeValueMissions.forEach(mission => {
        console.log(`   User Mission ID ${mission.id}: current_value=${mission.current_value}, progress=${mission.progress}`);
      });
    } else {
      console.log('✅ No missions with negative values found');
    }

    // 8. Generate fix recommendations
    console.log('\n8️⃣ Fix Recommendations:');
    console.log('=======================');
    
    if (activeMissions.length === 0) {
      console.log('🔧 RECOMMENDATION 1: Create test user missions');
      console.log('   - The button might not work because there are no active missions');
      console.log('   - Create some test missions for user ID 1');
    }
    
    if (inconsistentMissions.length > 0) {
      console.log('🔧 RECOMMENDATION 2: Fix inconsistent progress calculations');
      console.log('   - Run the progress calculation fix script');
    }
    
    if (nullValueMissions.length > 0) {
      console.log('🔧 RECOMMENDATION 3: Fix null values in missions');
      console.log('   - Update missions with null values to have proper defaults');
    }
    
    console.log('🔧 RECOMMENDATION 4: Check frontend validation');
    console.log('   - Ensure userMission.id is properly passed to the button');
    console.log('   - Verify currentValue is a valid number');
    console.log('   - Check if userMission.status is "active"');
    
    console.log('🔧 RECOMMENDATION 5: Test API endpoint directly');
    console.log('   - Test the /api/mobile/missions/progress/[id] endpoint');
    console.log('   - Verify authentication is working');
    console.log('   - Check if the endpoint returns proper responses');

    // 9. Generate SQL fixes
    console.log('\n9️⃣ SQL Fixes (if needed):');
    console.log('========================');
    
    if (nullValueMissions.length > 0) {
      console.log('-- Fix null values');
      console.log('UPDATE user_missions SET current_value = 0, progress = 0 WHERE current_value IS NULL OR progress IS NULL;');
    }
    
    if (inconsistentMissions.length > 0) {
      console.log('-- Fix inconsistent progress calculations');
      console.log(`
UPDATE user_missions um
JOIN missions m ON um.mission_id = m.id
SET um.progress = ROUND((um.current_value / m.target_value) * 100)
WHERE um.progress != ROUND((um.current_value / m.target_value) * 100)
AND um.status = 'active';
      `);
    }
    
    if (negativeValueMissions.length > 0) {
      console.log('-- Fix negative values');
      console.log('UPDATE user_missions SET current_value = 0, progress = 0 WHERE current_value < 0 OR progress < 0;');
    }

    console.log('\n🎯 Diagnosis Complete!');
    console.log('=====================');
    console.log('Check the recommendations above to fix any issues found.');
    console.log('If the button is still not working, check the console logs in the app for specific error messages.');

  } catch (error) {
    console.error('❌ Error during diagnosis:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the diagnosis
diagnoseUpdateProgressButton().catch(console.error);
