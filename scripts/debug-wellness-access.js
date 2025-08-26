#!/usr/bin/env node

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_mobile',
  port: process.env.DB_PORT || 3306
};

const debugWellnessAccess = async () => {
  console.log('🔍 Debugging Wellness Access Logic\n');
  console.log('=' .repeat(60));
  
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Get all users with their wellness status
    const [users] = await connection.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.wellness_program_joined,
        u.wellness_join_date,
        u.wellness_program_duration,
        u.fitness_goal,
        u.activity_level,
        u.created_at
      FROM mobile_users u
      ORDER BY u.id
    `);
    
    console.log(`\n📊 Found ${users.length} users in database`);
    
    // Check each user's wellness access
    for (const user of users) {
      console.log(`\n👤 User ID: ${user.id} - ${user.name || user.email}`);
      console.log(`   Wellness Program Joined: ${user.wellness_program_joined ? '✅ YES' : '❌ NO'}`);
      console.log(`   Join Date: ${user.wellness_join_date || 'Not set'}`);
      console.log(`   Program Duration: ${user.wellness_program_duration || 'Not set'} days`);
      console.log(`   Fitness Goal: ${user.fitness_goal || 'Not set'}`);
      console.log(`   Activity Level: ${user.activity_level || 'Not set'}`);
      
      // Check if user has missions
      const [missions] = await connection.execute(`
        SELECT COUNT(*) as mission_count
        FROM user_missions 
        WHERE user_id = ? AND status IN ('active', 'completed')
      `, [user.id]);
      
      const missionCount = missions[0].mission_count;
      console.log(`   Active Missions: ${missionCount}`);
      
      // Determine access logic
      const hasWellnessProgram = user.wellness_program_joined === true;
      const hasMissions = missionCount > 0;
      const shouldHaveAccess = hasWellnessProgram; // User must register for wellness program first
      const needsOnboarding = !shouldHaveAccess;
      
      console.log(`   🔍 Access Logic:`);
      console.log(`      Has Wellness Program: ${hasWellnessProgram ? '✅' : '❌'}`);
      console.log(`      Has Missions: ${hasMissions ? '✅' : '❌'}`);
      console.log(`      Should Have Access: ${shouldHaveAccess ? '✅' : '❌'}`);
      console.log(`      Needs Onboarding: ${needsOnboarding ? '✅' : '❌'}`);
      
      // Highlight potential issues
      if (user.wellness_program_joined === 0 && missionCount === 0) {
        console.log(`   ⚠️  POTENTIAL ISSUE: User has wellness_program_joined = 0 and no missions, but might still be accessing mission page`);
      } else if (user.wellness_program_joined === 1 && missionCount === 0) {
        console.log(`   ✅ CORRECT: User has wellness_program_joined = 1, should have access`);
      } else if (user.wellness_program_joined === 0 && missionCount > 0) {
        console.log(`   ✅ CORRECT: User has missions, should have access even with wellness_program_joined = 0`);
      }
      
      console.log('   ' + '-'.repeat(40));
    }
    
    // Summary
    console.log('\n📋 SUMMARY:');
    const usersWithWellness = users.filter(u => u.wellness_program_joined === 1).length;
    const usersWithoutWellness = users.filter(u => u.wellness_program_joined === 0).length;
    const usersWithNullWellness = users.filter(u => u.wellness_program_joined === null).length;
    
    console.log(`   Users with wellness_program_joined = 1: ${usersWithWellness}`);
    console.log(`   Users with wellness_program_joined = 0: ${usersWithoutWellness}`);
    console.log(`   Users with wellness_program_joined = NULL: ${usersWithNullWellness}`);
    
    // Check for users who might be incorrectly accessing
    const problematicUsers = users.filter(u => u.wellness_program_joined === 0);
    if (problematicUsers.length > 0) {
      console.log('\n🚨 POTENTIALLY PROBLEMATIC USERS (wellness_program_joined = 0):');
      for (const user of problematicUsers) {
        const [missions] = await connection.execute(`
          SELECT COUNT(*) as mission_count
          FROM user_missions 
          WHERE user_id = ? AND status IN ('active', 'completed')
        `, [user.id]);
        
        const missionCount = missions[0].mission_count;
        console.log(`   - User ${user.id} (${user.name || user.email}): ${missionCount} missions`);
        
        if (missionCount === 0) {
          console.log(`     ⚠️  This user should NOT have access to mission page`);
        } else {
          console.log(`     ✅ This user SHOULD have access (has missions)`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
};

// Run the debug script
debugWellnessAccess().then(() => {
  console.log('\n🎯 Debug completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
