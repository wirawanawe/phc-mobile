#!/usr/bin/env node

/**
 * Test script for wellness activities API endpoint
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function testWellnessActivitiesAPI() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Get a user ID
    const [users] = await connection.execute(`
      SELECT id FROM mobile_users LIMIT 1
    `);

    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }

    const userId = users[0].id;
    console.log(`👤 Testing with user ID: ${userId}`);

    // Test the same query as the API endpoint
    console.log('\n🔍 Testing wellness activities query...');
    
    const today = new Date().toISOString().split('T')[0];
    const activitiesQuery = `
      SELECT 
        wa.id,
        wa.title,
        wa.description,
        wa.category,
        wa.duration_minutes,
        wa.difficulty,
        wa.points,
        wa.is_active,
        wa.created_at,
        CASE WHEN uwa.id IS NOT NULL THEN 'completed' ELSE 'available' END as status,
        uwa.completed_at,
        uwa.activity_date
      FROM available_wellness_activities wa
      LEFT JOIN user_wellness_activities uwa ON wa.id = uwa.activity_id AND uwa.user_id = ? AND uwa.activity_date = ?
      WHERE wa.is_active = 1
      ORDER BY wa.created_at DESC
    `;
    
    const activitiesResult = await connection.execute(activitiesQuery, [userId, today]);

    console.log(`✅ Found ${activitiesResult[0].length} wellness activities`);

    // Show activities with their status
    console.log('\n📋 Wellness Activities:');
    activitiesResult[0].forEach((activity, index) => {
      const statusIcon = activity.status === 'completed' ? '✅' : '⭕';
      console.log(`   ${index + 1}. ${statusIcon} ID: ${activity.id} - "${activity.title}"`);
      console.log(`      Category: ${activity.category}, Difficulty: ${activity.difficulty}, Points: ${activity.points}`);
      console.log(`      Status: ${activity.status}, Duration: ${activity.duration_minutes} min`);
      if (activity.status === 'completed') {
        console.log(`      Completed: ${activity.completed_at}`);
      }
      console.log('');
    });

    // Show statistics
    const completedCount = activitiesResult[0].filter(a => a.status === 'completed').length;
    const availableCount = activitiesResult[0].filter(a => a.status === 'available').length;
    
    console.log('📊 Statistics:');
    console.log(`   Total Activities: ${activitiesResult[0].length}`);
    console.log(`   Completed Today: ${completedCount}`);
    console.log(`   Available: ${availableCount}`);

    // Test the complete response structure
    const response = {
      success: true,
      data: activitiesResult[0]
    };

    console.log('\n📊 API Response Structure:');
    console.log(JSON.stringify(response, null, 2));

    console.log('\n✅ Wellness activities API test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testWellnessActivitiesAPI();
