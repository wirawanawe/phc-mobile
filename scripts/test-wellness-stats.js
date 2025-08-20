#!/usr/bin/env node

/**
 * Test script for wellness stats API endpoint
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function testWellnessStats() {
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

    // Test the same queries as the API endpoint
    console.log('\n🔍 Testing wellness stats queries...');

    // 1. Get total available activities
    const [totalActivitiesResult] = await connection.execute(`
      SELECT COUNT(*) as total_available
      FROM available_wellness_activities 
      WHERE is_active = 1
    `);
    const totalAvailableActivities = totalActivitiesResult[0]?.total_available || 0;
    console.log(`✅ Total available activities: ${totalAvailableActivities}`);

    // 2. Get user's completed activities
    const [userActivitiesResult] = await connection.execute(`
      SELECT 
        uwa.id,
        uwa.activity_id,
        uwa.completed_at,
        uwa.duration_minutes,
        awa.points as base_points
      FROM user_wellness_activities uwa
      LEFT JOIN available_wellness_activities awa ON uwa.activity_id = awa.id
      WHERE uwa.user_id = ? AND uwa.completed_at IS NOT NULL
    `, [userId]);

    const completedActivities = userActivitiesResult.length;
    const totalPoints = userActivitiesResult.reduce((sum, activity) => {
      return sum + (activity.base_points || 0);
    }, 0);

    console.log(`✅ User completed activities: ${completedActivities}`);
    console.log(`✅ Total points earned: ${totalPoints}`);

    // Show detailed activity info
    if (userActivitiesResult.length > 0) {
      console.log('\n📋 User Activity Details:');
      userActivitiesResult.forEach((activity, index) => {
        console.log(`   ${index + 1}. Activity ID: ${activity.activity_id}, Points: ${activity.base_points}, Completed: ${activity.completed_at}`);
      });
    }

    // Test the complete response structure
    const response = {
      success: true,
      data: {
        period: 7,
        active_days: 0,
        total_fitness_minutes: 0,
        total_calories: 0,
        total_water_intake: 0,
        total_sleep_hours: 0,
        avg_mood_score: 0,
        fitness_entries: 0,
        nutrition_entries: 0,
        water_entries: 0,
        sleep_entries: 0,
        mood_entries: 0,
        wellness_score: 0,
        // Wellness activities data
        total_activities: totalAvailableActivities,
        total_activities_completed: completedActivities,
        total_points_earned: totalPoints
      }
    };

    console.log('\n📊 Final API Response:');
    console.log(JSON.stringify(response, null, 2));

    console.log('\n✅ Wellness stats test completed successfully!');

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
testWellnessStats();
