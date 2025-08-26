#!/usr/bin/env node

/**
 * Test script for wellness activity history API endpoint
 */

const mysql = require('mysql2/promise');

const dbConfig = {
      host: 'dash.doctorphc.id',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function testWellnessActivityHistory() {
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
    console.log('\n🔍 Testing wellness activity history query...');
    
    const period = 7; // Last 7 days
    const historyQuery = `
      SELECT 
        uwa.id,
        uwa.notes,
        uwa.completed_at,
        uwa.created_at,
        uwa.duration_minutes,
        uwa.activity_date,
        uwa.activity_type,
        wa.id as activity_id,
        wa.title,
        wa.description,
        wa.category,
        wa.duration_minutes as activity_duration,
        wa.difficulty,
        wa.points as base_points,
        wa.is_active,
        CASE 
          WHEN uwa.activity_type = 'intense' THEN ROUND(wa.points * 1.5)
          WHEN uwa.activity_type = 'relaxed' THEN ROUND(wa.points * 0.8)
          ELSE wa.points
        END as points_earned
      FROM user_wellness_activities uwa
      JOIN available_wellness_activities wa ON uwa.activity_id = wa.id
      WHERE uwa.user_id = ? 
        AND uwa.activity_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY uwa.activity_date DESC, uwa.completed_at DESC
    `;
    
    const historyResult = await connection.execute(historyQuery, [userId, period]);

    console.log(`✅ Found ${historyResult[0].length} wellness activities in history`);

    // Show activities with their details
    console.log('\n📋 Wellness Activity History:');
    historyResult[0].forEach((activity, index) => {
      console.log(`   ${index + 1}. "${activity.title}"`);
      console.log(`      Category: ${activity.category}, Difficulty: ${activity.difficulty}`);
      console.log(`      Duration: ${activity.duration_minutes} min, Points: ${activity.points_earned}`);
      console.log(`      Completed: ${activity.completed_at}`);
      console.log(`      Activity Date: ${activity.activity_date}`);
      console.log('');
    });

    // Show statistics
    const totalPoints = historyResult[0].reduce((sum, activity) => sum + (activity.points_earned || 0), 0);
    const totalDuration = historyResult[0].reduce((sum, activity) => sum + (activity.duration_minutes || 0), 0);
    
    console.log('📊 History Statistics:');
    console.log(`   Total Activities: ${historyResult[0].length}`);
    console.log(`   Total Points Earned: ${totalPoints}`);
    console.log(`   Total Duration: ${totalDuration} minutes`);

    // Test the complete response structure
    const response = {
      success: true,
      data: historyResult[0]
    };

    console.log('\n📊 API Response Structure:');
    console.log(JSON.stringify(response, null, 2));

    console.log('\n✅ Wellness activity history test completed successfully!');

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
testWellnessActivityHistory();
