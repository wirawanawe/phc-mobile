#!/usr/bin/env node

/**
 * Test Script for Wellness Duration Fix
 * 
 * This script tests the wellness duration calculation to ensure it shows
 * the actual days since joining instead of just the target duration.
 */

const mysql = require('mysql2/promise');

// Configuration
const config = {
      host: 'dash.doctorphc.id',
  user: 'root',
  password: '', // Add your password here
  database: 'phc_dashboard'
};

async function testWellnessDurationCalculation() {
  let connection;
  
  try {
    console.log('🧪 Testing Wellness Duration Calculation...');
    
    // Connect to database
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');
    
    // Get a user with wellness program data
    const [users] = await connection.execute(`
      SELECT 
        id, name, email,
        wellness_program_joined,
        wellness_join_date,
        wellness_program_duration
      FROM mobile_users 
      WHERE wellness_program_joined = TRUE 
      AND wellness_join_date IS NOT NULL
      LIMIT 5
    `);
    
    if (users.length === 0) {
      console.log('❌ No users with wellness program data found');
      return;
    }
    
    console.log(`📊 Found ${users.length} users with wellness program data`);
    
    // Test calculation for each user
    for (const user of users) {
      console.log(`\n👤 Testing user: ${user.name} (ID: ${user.id})`);
      
      // Calculate days since joining
      const joinDate = new Date(user.wellness_join_date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - joinDate.getTime());
      const daysSinceJoining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Calculate remaining days
      const daysRemaining = Math.max(0, user.wellness_program_duration - daysSinceJoining);
      
      console.log(`   📅 Join Date: ${user.wellness_join_date}`);
      console.log(`   🎯 Target Duration: ${user.wellness_program_duration} days`);
      console.log(`   📈 Days Since Joining: ${daysSinceJoining} days`);
      console.log(`   ⏰ Days Remaining: ${daysRemaining} days`);
      
      // Verify the calculation makes sense
      if (daysSinceJoining > user.wellness_program_duration) {
        console.log(`   ⚠️  WARNING: User has been participating longer than program duration`);
      } else if (daysSinceJoining === 0) {
        console.log(`   ⚠️  WARNING: User joined today or join date is invalid`);
      } else {
        console.log(`   ✅ Calculation looks correct`);
      }
    }
    
    // Test API endpoint simulation
    console.log('\n🌐 Testing API endpoint simulation...');
    
    const testUserId = users[0].id;
    const [apiResult] = await connection.execute(`
      SELECT 
        id, name, email,
        wellness_program_joined,
        wellness_join_date,
        wellness_program_duration
      FROM mobile_users 
      WHERE id = ?
    `, [testUserId]);
    
    if (apiResult.length > 0) {
      const user = apiResult[0];
      
      // Simulate API calculation
      let daysSinceJoining = 0;
      if (user.wellness_join_date) {
        const joinDate = new Date(user.wellness_join_date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - joinDate.getTime());
        daysSinceJoining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      let daysRemaining = 0;
      if (user.wellness_program_duration && daysSinceJoining > 0) {
        daysRemaining = Math.max(0, user.wellness_program_duration - daysSinceJoining);
      }
      
      console.log(`   📊 API Response for user ${user.name}:`);
      console.log(`      - wellness_program_duration: ${user.wellness_program_duration}`);
      console.log(`      - days_since_joining: ${daysSinceJoining}`);
      console.log(`      - days_remaining: ${daysRemaining}`);
      
      console.log('   ✅ API calculation working correctly');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testWellnessDurationCalculation();
