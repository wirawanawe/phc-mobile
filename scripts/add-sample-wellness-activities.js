#!/usr/bin/env node

/**
 * Script to add sample wellness activities data
 * This ensures the wellness activity card shows proper data
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function addSampleWellnessActivities() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check if available_wellness_activities table exists
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'available_wellness_activities'
    `);

    if (tables.length === 0) {
      console.log('❌ available_wellness_activities table does not exist');
      return;
    }

    // Check if there are already wellness activities
    const [existingCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM available_wellness_activities
    `);

    if (existingCount[0].count > 0) {
      console.log(`✅ Found ${existingCount[0].count} existing wellness activities`);
    } else {
      console.log('📋 Adding sample wellness activities...');

      // Add sample wellness activities
      const sampleActivities = [
        {
          title: 'Yoga Pagi',
          description: 'Latihan yoga ringan untuk memulai hari dengan energi positif',
          category: 'fitness',
          duration_minutes: 15,
          difficulty: 'easy',
          points: 10,
          is_active: 1
        },
        {
          title: 'Meditasi',
          description: 'Latihan meditasi untuk ketenangan pikiran',
          category: 'mental_health',
          duration_minutes: 10,
          difficulty: 'easy',
          points: 8,
          is_active: 1
        },
        {
          title: 'Jalan Kaki',
          description: 'Jalan kaki santai untuk kesehatan jantung',
          category: 'fitness',
          duration_minutes: 30,
          difficulty: 'easy',
          points: 15,
          is_active: 1
        },
        {
          title: 'Stretching',
          description: 'Latihan peregangan untuk fleksibilitas tubuh',
          category: 'fitness',
          duration_minutes: 20,
          difficulty: 'medium',
          points: 12,
          is_active: 1
        },
        {
          title: 'Minum Air',
          description: 'Minum 8 gelas air putih setiap hari',
          category: 'nutrition',
          duration_minutes: 1,
          difficulty: 'easy',
          points: 5,
          is_active: 1
        }
      ];

      for (const activity of sampleActivities) {
        await connection.execute(`
          INSERT INTO available_wellness_activities (title, description, category, duration_minutes, difficulty, points, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [activity.title, activity.description, activity.category, activity.duration_minutes, activity.difficulty, activity.points, activity.is_active]);
      }

      console.log('✅ Added 5 sample wellness activities');
    }

    // Check if user_wellness_activities table exists
    const [userTables] = await connection.execute(`
      SHOW TABLES LIKE 'user_wellness_activities'
    `);

    if (userTables.length === 0) {
      console.log('❌ user_wellness_activities table does not exist');
      return;
    }

    // Check if there are any users
    const [users] = await connection.execute(`
      SELECT id FROM mobile_users LIMIT 1
    `);

    if (users.length === 0) {
      console.log('❌ No users found in mobile_users table');
      return;
    }

    const userId = users[0].id;
    console.log(`👤 Using user ID: ${userId}`);

    // Check if user has any completed wellness activities
    const [userActivitiesCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM user_wellness_activities WHERE user_id = ?
    `, [userId]);

    if (userActivitiesCount[0].count > 0) {
      console.log(`✅ User already has ${userActivitiesCount[0].count} wellness activities`);
    } else {
      console.log('📋 Adding sample user wellness activities...');

      // Get wellness activity IDs
      const [activities] = await connection.execute(`
        SELECT id FROM available_wellness_activities WHERE is_active = 1 LIMIT 3
      `);

      if (activities.length > 0) {
        // Add some completed activities for the user
        for (let i = 0; i < Math.min(3, activities.length); i++) {
          const activityId = activities[i].id;
          const completedAt = new Date();
          completedAt.setDate(completedAt.getDate() - i); // Different dates

          await connection.execute(`
            INSERT INTO user_wellness_activities (user_id, activity_id, completed_at, duration_minutes, notes)
            VALUES (?, ?, ?, ?, ?)
          `, [userId, activityId, completedAt, 30, 'Sample completed activity']);
        }

        console.log('✅ Added sample user wellness activities');
      }
    }

    // Show final stats
    console.log('\n📊 Final Statistics:');
    
    const [totalActivities] = await connection.execute(`
      SELECT COUNT(*) as count FROM available_wellness_activities WHERE is_active = 1
    `);
    
    const [userCompleted] = await connection.execute(`
      SELECT COUNT(*) as count FROM user_wellness_activities WHERE user_id = ? AND completed_at IS NOT NULL
    `, [userId]);
    
    const [totalPoints] = await connection.execute(`
      SELECT SUM(awa.points) as total FROM user_wellness_activities uwa
      LEFT JOIN available_wellness_activities awa ON uwa.activity_id = awa.id
      WHERE uwa.user_id = ? AND uwa.completed_at IS NOT NULL
    `, [userId]);

    console.log(`   Total Available Activities: ${totalActivities[0].count}`);
    console.log(`   User Completed Activities: ${userCompleted[0].count}`);
    console.log(`   Total Points Earned: ${totalPoints[0].total || 0}`);

    console.log('\n✅ Sample wellness activities data added successfully!');

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

// Run the script
addSampleWellnessActivities();
