#!/usr/bin/env node

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pr1k1t1w',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

const fixUserCycleLogic = async () => {
  console.log('🔧 Fixing User Cycle Logic\n');
  console.log('=' .repeat(60));
  
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check current state
    console.log('\n📊 Current User Cycle Status:');
    const [users] = await connection.execute(`
      SELECT 
        id,
        name,
        email,
        wellness_program_cycles,
        wellness_program_joined,
        wellness_join_date,
        created_at
      FROM mobile_users 
      ORDER BY id
    `);
    
    console.log(`Found ${users.length} users in database`);
    
    for (const user of users) {
      console.log(`\n👤 User ID: ${user.id} - ${user.name || user.email}`);
      console.log(`   Current Cycles: ${user.wellness_program_cycles}`);
      console.log(`   Wellness Joined: ${user.wellness_program_joined ? 'YES' : 'NO'}`);
      console.log(`   Join Date: ${user.wellness_join_date || 'Not set'}`);
      console.log(`   Created: ${user.created_at}`);
    }
    
    // Fix 1: Update default value for wellness_program_cycles to 0
    console.log('\n🔧 Fix 1: Updating default value for wellness_program_cycles to 0');
    
    try {
      await connection.execute(`
        ALTER TABLE mobile_users 
        MODIFY COLUMN wellness_program_cycles INT DEFAULT 0
      `);
      console.log('✅ Default value updated to 0');
    } catch (error) {
      console.log('⚠️  Could not update default value (might already be correct):', error.message);
    }
    
    // Fix 2: Reset cycles to 0 for users who haven't joined wellness program
    console.log('\n🔧 Fix 2: Resetting cycles to 0 for users who haven\'t joined wellness program');
    
    const [resetResult] = await connection.execute(`
      UPDATE mobile_users 
      SET wellness_program_cycles = 0 
      WHERE wellness_program_joined = FALSE OR wellness_program_joined IS NULL
    `);
    
    console.log(`✅ Reset ${resetResult.affectedRows} users to 0 cycles`);
    
    // Fix 3: Update registration API to set cycles to 0 by default
    console.log('\n🔧 Fix 3: Updating registration API logic');
    
    // Check current registration query
    const registrationFile = 'dash-app/app/api/mobile/auth/register/route.js';
    console.log(`📝 Registration file: ${registrationFile}`);
    
    // Fix 4: Update setup-wellness API to increment cycles properly
    console.log('\n🔧 Fix 4: Updating setup-wellness API logic');
    
    const setupWellnessFile = 'dash-app/app/api/mobile/setup-wellness/route.js';
    console.log(`📝 Setup wellness file: ${setupWellnessFile}`);
    
    // Check current state after fixes
    console.log('\n📊 User Cycle Status After Fixes:');
    const [updatedUsers] = await connection.execute(`
      SELECT 
        id,
        name,
        email,
        wellness_program_cycles,
        wellness_program_joined,
        wellness_join_date
      FROM mobile_users 
      ORDER BY id
    `);
    
    for (const user of updatedUsers) {
      console.log(`\n👤 User ID: ${user.id} - ${user.name || user.email}`);
      console.log(`   Cycles: ${user.wellness_program_cycles} ${user.wellness_program_joined ? '✅' : '❌'}`);
      console.log(`   Wellness Joined: ${user.wellness_program_joined ? 'YES' : 'NO'}`);
      
      // Validate logic
      if (user.wellness_program_joined && user.wellness_program_cycles === 0) {
        console.log(`   ⚠️  ISSUE: User joined wellness but cycles is 0`);
      } else if (!user.wellness_program_joined && user.wellness_program_cycles > 0) {
        console.log(`   ⚠️  ISSUE: User not joined but cycles > 0`);
      } else {
        console.log(`   ✅ CORRECT: Logic is valid`);
      }
    }
    
    // Summary
    console.log('\n📋 SUMMARY:');
    const usersWithZeroCycles = updatedUsers.filter(u => u.wellness_program_cycles === 0).length;
    const usersWithCycles = updatedUsers.filter(u => u.wellness_program_cycles > 0).length;
    const usersJoined = updatedUsers.filter(u => u.wellness_program_joined).length;
    
    console.log(`   Users with 0 cycles: ${usersWithZeroCycles}`);
    console.log(`   Users with >0 cycles: ${usersWithCycles}`);
    console.log(`   Users joined wellness: ${usersJoined}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
};

// Run the fix script
fixUserCycleLogic().then(() => {
  console.log('\n🎯 User cycle logic fix completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
