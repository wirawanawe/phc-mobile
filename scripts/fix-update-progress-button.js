#!/usr/bin/env node

/**
 * 🔧 Update Progress Manual Button Fix Script
 * 
 * This script fixes common issues that prevent the Update Progress Manual button from working.
 */

const mysql = require('mysql2/promise');

// Configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_mobile',
  port: process.env.DB_PORT || 3306
};

console.log('🔧 Update Progress Manual Button Fix Script');
console.log('===========================================\n');

async function fixUpdateProgressButton() {
  let connection;
  
  try {
    console.log('1️⃣ Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Database connected\n');

    // Fix 1: Fix null values in user_missions
    console.log('2️⃣ Fixing null values in user_missions...');
    const [nullFixResult] = await connection.execute(`
      UPDATE user_missions 
      SET current_value = 0, progress = 0 
      WHERE current_value IS NULL OR progress IS NULL
    `);
    console.log(`✅ Fixed ${nullFixResult.affectedRows} missions with null values\n`);

    // Fix 2: Fix negative values
    console.log('3️⃣ Fixing negative values...');
    const [negativeFixResult] = await connection.execute(`
      UPDATE user_missions 
      SET current_value = 0, progress = 0 
      WHERE current_value < 0 OR progress < 0
    `);
    console.log(`✅ Fixed ${negativeFixResult.affectedRows} missions with negative values\n`);

    // Fix 3: Fix inconsistent progress calculations
    console.log('4️⃣ Fixing inconsistent progress calculations...');
    const [progressFixResult] = await connection.execute(`
      UPDATE user_missions um
      JOIN missions m ON um.mission_id = m.id
      SET um.progress = ROUND((um.current_value / m.target_value) * 100)
      WHERE um.progress != ROUND((um.current_value / m.target_value) * 100)
      AND um.status = 'active'
    `);
    console.log(`✅ Fixed ${progressFixResult.affectedRows} missions with inconsistent progress\n`);

    // Fix 4: Ensure all active missions have proper status
    console.log('5️⃣ Ensuring proper mission status...');
    const [statusFixResult] = await connection.execute(`
      UPDATE user_missions 
      SET status = 'active' 
      WHERE status IS NULL OR status = ''
    `);
    console.log(`✅ Fixed ${statusFixResult.affectedRows} missions with invalid status\n`);

    // Fix 5: Create test missions if none exist
    console.log('6️⃣ Checking for active missions...');
    const [activeMissions] = await connection.execute(`
      SELECT COUNT(*) as count FROM user_missions WHERE status = 'active'
    `);
    
    if (activeMissions[0].count === 0) {
      console.log('❌ No active missions found. Creating test missions...');
      
      // Get available missions
      const [missions] = await connection.execute(`
        SELECT id, title, target_value, points, color FROM missions LIMIT 5
      `);
      
      if (missions.length > 0) {
        // Create test user missions for user ID 1
        for (const mission of missions) {
          await connection.execute(`
            INSERT INTO user_missions (user_id, mission_id, status, current_value, progress, notes, created_at, updated_at)
            VALUES (1, ?, 'active', 0, 0, 'Test mission', NOW(), NOW())
          `, [mission.id]);
        }
        console.log(`✅ Created ${missions.length} test missions for user ID 1\n`);
      } else {
        console.log('❌ No missions available to create test user missions\n');
      }
    } else {
      console.log(`✅ Found ${activeMissions[0].count} active missions\n`);
    }

    // Fix 6: Update timestamps for missions without proper timestamps
    console.log('7️⃣ Fixing missing timestamps...');
    const [timestampFixResult] = await connection.execute(`
      UPDATE user_missions 
      SET created_at = NOW(), updated_at = NOW()
      WHERE created_at IS NULL OR updated_at IS NULL
    `);
    console.log(`✅ Fixed ${timestampFixResult.affectedRows} missions with missing timestamps\n`);

    // Verification
    console.log('8️⃣ Verifying fixes...');
    
    // Check for remaining issues
    const [remainingIssues] = await connection.execute(`
      SELECT 
        COUNT(*) as total_missions,
        SUM(CASE WHEN current_value IS NULL OR progress IS NULL THEN 1 ELSE 0 END) as null_values,
        SUM(CASE WHEN current_value < 0 OR progress < 0 THEN 1 ELSE 0 END) as negative_values,
        SUM(CASE WHEN status IS NULL OR status = '' THEN 1 ELSE 0 END) as invalid_status
      FROM user_missions
    `);
    
    const issues = remainingIssues[0];
    console.log(`📊 Verification Results:`);
    console.log(`   Total missions: ${issues.total_missions}`);
    console.log(`   Missions with null values: ${issues.null_values}`);
    console.log(`   Missions with negative values: ${issues.negative_values}`);
    console.log(`   Missions with invalid status: ${issues.invalid_status}`);
    
    if (issues.null_values === 0 && issues.negative_values === 0 && issues.invalid_status === 0) {
      console.log('✅ All issues have been fixed!\n');
    } else {
      console.log('⚠️ Some issues remain. Check the database manually.\n');
    }

    // Show sample active missions
    console.log('9️⃣ Sample active missions:');
    const [sampleMissions] = await connection.execute(`
      SELECT 
        um.id as user_mission_id,
        um.status,
        um.current_value,
        um.progress,
        m.title,
        m.target_value
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.status = 'active'
      ORDER BY um.id DESC
      LIMIT 5
    `);
    
    if (sampleMissions.length > 0) {
      sampleMissions.forEach((mission, index) => {
        console.log(`   ${index + 1}. ${mission.title} (ID: ${mission.user_mission_id})`);
        console.log(`      Progress: ${mission.current_value}/${mission.target_value} (${mission.progress}%)`);
        console.log(`      Status: ${mission.status}`);
      });
    } else {
      console.log('   No active missions found');
    }

    console.log('\n🎉 Fix Complete!');
    console.log('===============');
    console.log('The Update Progress Manual button should now work properly.');
    console.log('If you still experience issues, check the console logs in the app for specific error messages.');

  } catch (error) {
    console.error('❌ Error during fix:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the fix
fixUpdateProgressButton().catch(console.error);
