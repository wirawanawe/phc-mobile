const mysql = require('mysql2/promise');
require('dotenv').config();

async function addTestWellnessActivities() {
  let connection;
  
  try {
    console.log('🔄 Adding test wellness activities...\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pr1k1t1w',
      database: process.env.DB_NAME || 'phc_dashboard',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database');

    // Get available wellness activities
    console.log('\n📋 Getting available wellness activities...');
    const [activities] = await connection.execute(`
      SELECT id, title, points, duration_minutes
      FROM available_wellness_activities
      WHERE is_active = 1
      LIMIT 3
    `);
    
    if (activities.length === 0) {
      console.log('❌ No available wellness activities found');
      return;
    }

    console.log('✅ Available activities:');
    activities.forEach(activity => {
      console.log(`   - ID: ${activity.id}, Title: ${activity.title}, Points: ${activity.points}, Duration: ${activity.duration_minutes}min`);
    });

    // Clear existing test data for user 5
    console.log('\n📋 Clearing existing test data for user 5...');
    await connection.execute(`
      DELETE FROM user_wellness_activities 
      WHERE user_id = 5 AND activity_date = CURDATE()
    `);
    console.log('✅ Existing test data cleared');

    // Add test wellness activities with different types
    console.log('\n📋 Adding test wellness activities...');
    
    const testActivities = [
      {
        user_id: 5,
        activity_id: activities[0].id,
        activity_type: 'normal',
        duration_minutes: activities[0].duration_minutes,
        notes: 'Test normal activity'
      },
      {
        user_id: 5,
        activity_id: activities[1].id,
        activity_type: 'intense',
        duration_minutes: activities[1].duration_minutes,
        notes: 'Test intense activity'
      },
      {
        user_id: 5,
        activity_id: activities[2].id,
        activity_type: 'relaxed',
        duration_minutes: activities[2].duration_minutes,
        notes: 'Test relaxed activity'
      }
    ];

    for (const testActivity of testActivities) {
      const insertQuery = `
        INSERT INTO user_wellness_activities (
          user_id, activity_id, activity_date, duration_minutes, notes, activity_type, completed_at, created_at
        ) VALUES (?, ?, CURDATE(), ?, ?, ?, NOW(), NOW())
      `;
      
      await connection.execute(insertQuery, [
        testActivity.user_id,
        testActivity.activity_id,
        testActivity.duration_minutes,
        testActivity.notes,
        testActivity.activity_type
      ]);
      
      console.log(`✅ Added ${testActivity.activity_type} activity: ${activities.find(a => a.id === testActivity.activity_id)?.title}`);
    }

    // Verify the added data
    console.log('\n📋 Verifying added data...');
    const [verification] = await connection.execute(`
      SELECT 
        uwa.id,
        uwa.user_id,
        uwa.activity_id,
        uwa.activity_date,
        uwa.duration_minutes,
        uwa.activity_type,
        uwa.notes,
        wa.title,
        wa.points as base_points,
        CASE 
          WHEN uwa.activity_type = 'intense' THEN ROUND(wa.points * 1.5)
          WHEN uwa.activity_type = 'relaxed' THEN ROUND(wa.points * 0.8)
          ELSE wa.points
        END as calculated_points
      FROM user_wellness_activities uwa
      JOIN available_wellness_activities wa ON uwa.activity_id = wa.id
      WHERE uwa.user_id = 5 AND uwa.activity_date = CURDATE()
      ORDER BY uwa.created_at DESC
    `);
    
    console.log('✅ Added activities:');
    verification.forEach(activity => {
      console.log(`   - ${activity.title} (${activity.activity_type})`);
      console.log(`     Duration: ${activity.duration_minutes}min, Base Points: ${activity.base_points}`);
      console.log(`     Calculated Points: ${activity.calculated_points}`);
      console.log('');
    });

    // Calculate total points
    console.log('\n📋 Calculating total points...');
    const [totalPoints] = await connection.execute(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(CASE 
          WHEN uwa.activity_type = 'intense' THEN ROUND(wa.points * 1.5)
          WHEN uwa.activity_type = 'relaxed' THEN ROUND(wa.points * 0.8)
          ELSE wa.points
        END) as total_points
      FROM user_wellness_activities uwa
      JOIN available_wellness_activities wa ON uwa.activity_id = wa.id
      WHERE uwa.user_id = 5 AND uwa.activity_date = CURDATE()
    `);
    
    console.log('✅ Total summary:');
    console.log(`   - Total activities: ${totalPoints[0].total_activities}`);
    console.log(`   - Total points: ${totalPoints[0].total_points || 0}`);

    console.log('\n🎉 Test wellness activities added successfully!');

  } catch (error) {
    console.error('❌ Error during test data addition:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
addTestWellnessActivities();
