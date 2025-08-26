#!/usr/bin/env node

/**
 * Test script for wellness stats API endpoint
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testWellnessStats() {
  let connection;
  
  try {
    console.log('🔍 Testing wellness stats directly from database...\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pr1k1t1w',
      database: process.env.DB_NAME || 'phc_dashboard',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database');

    // Test 1: Check available wellness activities
    console.log('\n📋 Test 1: Available wellness activities...');
    const [availableActivities] = await connection.execute(`
      SELECT COUNT(*) as total_available
      FROM available_wellness_activities 
      WHERE is_active = 1
    `);
    const totalAvailableActivities = availableActivities[0]?.total_available || 0;
    console.log('✅ Total available activities:', totalAvailableActivities);

    // Test 2: Check user wellness activities (for user_id = 1)
    console.log('\n📋 Test 2: User wellness activities (user_id = 1)...');
    const [userActivities] = await connection.execute(`
      SELECT 
        uwa.id,
        uwa.activity_id,
        uwa.completed_at,
        uwa.duration_minutes,
        awa.points as base_points,
        awa.title as activity_title
      FROM user_wellness_activities uwa
      LEFT JOIN available_wellness_activities awa ON uwa.activity_id = awa.id
      WHERE uwa.user_id = 1 AND uwa.completed_at IS NOT NULL
      ORDER BY uwa.completed_at DESC
      LIMIT 10
    `);
    
    const completedActivities = userActivities.length;
    const totalPoints = userActivities.reduce((sum, activity) => {
      return sum + (activity.base_points || 0);
    }, 0);
    
    console.log('✅ User completed activities:', completedActivities);
    console.log('✅ Total points earned:', totalPoints);
    
    if (userActivities.length > 0) {
      console.log('\n📊 Recent activities:');
      userActivities.forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.activity_title} - ${activity.base_points} points - ${activity.completed_at}`);
      });
    }

    // Test 3: Check all users wellness activities
    console.log('\n📋 Test 3: All users wellness activities...');
    const [allUserActivities] = await connection.execute(`
      SELECT 
        uwa.user_id,
        COUNT(*) as completed_count,
        SUM(awa.points) as total_points
      FROM user_wellness_activities uwa
      LEFT JOIN available_wellness_activities awa ON uwa.activity_id = awa.id
      WHERE uwa.completed_at IS NOT NULL
      GROUP BY uwa.user_id
      ORDER BY total_points DESC
    `);
    
    console.log('✅ All users summary:');
    allUserActivities.forEach(user => {
      console.log(`   User ${user.user_id}: ${user.completed_count} activities, ${user.total_points} points`);
    });

    // Test 4: Simulate API response
    console.log('\n📋 Test 4: Simulating API response...');
    const apiResponse = {
      success: true,
      data: {
        period: 7,
        total_activities: totalAvailableActivities,
        total_activities_completed: completedActivities,
        total_points_earned: totalPoints,
        streak_days: 0
      },
      message: 'Wellness stats loaded successfully'
    };
    
    console.log('✅ API Response:', JSON.stringify(apiResponse, null, 2));

    // Test 5: Check if there are any issues with the data
    console.log('\n📋 Test 5: Data integrity check...');
    
    // Check for activities without points
    const [activitiesWithoutPoints] = await connection.execute(`
      SELECT id, title, points
      FROM available_wellness_activities
      WHERE is_active = 1 AND (points IS NULL OR points = 0)
    `);
    
    if (activitiesWithoutPoints.length > 0) {
      console.log('⚠️  Activities without points:');
      activitiesWithoutPoints.forEach(activity => {
        console.log(`   - ${activity.title} (ID: ${activity.id})`);
      });
    } else {
      console.log('✅ All activities have points assigned');
    }

    // Check for user activities without base points
    const [userActivitiesWithoutPoints] = await connection.execute(`
      SELECT 
        uwa.id,
        uwa.activity_id,
        awa.title,
        awa.points
      FROM user_wellness_activities uwa
      LEFT JOIN available_wellness_activities awa ON uwa.activity_id = awa.id
      WHERE uwa.completed_at IS NOT NULL AND (awa.points IS NULL OR awa.points = 0)
    `);
    
    if (userActivitiesWithoutPoints.length > 0) {
      console.log('⚠️  User activities without base points:');
      userActivitiesWithoutPoints.forEach(activity => {
        console.log(`   - ${activity.title} (ID: ${activity.id})`);
      });
    } else {
      console.log('✅ All user activities have base points');
    }

    console.log('\n🎉 Wellness stats test completed!');
    
  } catch (error) {
    console.error('❌ Error testing wellness stats:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testWellnessStats();
