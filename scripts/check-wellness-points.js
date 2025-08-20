const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkWellnessPoints() {
  let connection;
  
  try {
    console.log('🔍 Checking wellness activity points in database...\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pr1k1t1w',
      database: process.env.DB_NAME || 'phc_dashboard',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database');

    // Check wellness activities table structure
    console.log('\n📋 Checking wellness activities table structure...');
    const [columns] = await connection.execute(`
      DESCRIBE user_wellness_activities
    `);
    
    console.log('✅ Table structure:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Check available wellness activities
    console.log('\n📋 Checking available wellness activities...');
    const [activities] = await connection.execute(`
      SELECT id, title, points, duration_minutes, difficulty
      FROM available_wellness_activities
      WHERE is_active = 1
      LIMIT 5
    `);
    
    console.log('✅ Available activities:');
    activities.forEach(activity => {
      console.log(`   - ID: ${activity.id}, Title: ${activity.title}, Points: ${activity.points}, Duration: ${activity.duration_minutes}min`);
    });

    // Check user wellness activities with point calculation
    console.log('\n📋 Checking user wellness activities with point calculation...');
    const [userActivities] = await connection.execute(`
      SELECT 
        uwa.id,
        uwa.user_id,
        uwa.activity_id,
        uwa.activity_date,
        uwa.duration_minutes,
        uwa.activity_type,
        uwa.notes,
        uwa.completed_at,
        wa.title,
        wa.points as base_points,
        wa.duration_minutes as activity_duration,
        CASE 
          WHEN uwa.activity_type = 'intense' THEN ROUND(wa.points * 1.5)
          WHEN uwa.activity_type = 'relaxed' THEN ROUND(wa.points * 0.8)
          ELSE wa.points
        END as calculated_points
      FROM user_wellness_activities uwa
      JOIN available_wellness_activities wa ON uwa.activity_id = wa.id
      ORDER BY uwa.completed_at DESC
      LIMIT 10
    `);
    
    console.log('✅ User wellness activities:');
    if (userActivities.length === 0) {
      console.log('   No user wellness activities found');
    } else {
      userActivities.forEach(activity => {
        console.log(`   - User ${activity.user_id}, Activity: ${activity.title}`);
        console.log(`     Date: ${activity.activity_date}, Type: ${activity.activity_type || 'normal'}`);
        console.log(`     Duration: ${activity.duration_minutes}min, Base Points: ${activity.base_points}`);
        console.log(`     Calculated Points: ${activity.calculated_points}`);
        console.log(`     Completed: ${activity.completed_at}`);
        console.log('');
      });
    }

    // Check total points calculation
    console.log('\n📋 Checking total points calculation...');
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
    `);
    
    console.log('✅ Total summary:');
    console.log(`   - Total activities: ${totalPoints[0].total_activities}`);
    console.log(`   - Total points: ${totalPoints[0].total_points || 0}`);

    // Check points by activity type
    console.log('\n📋 Checking points by activity type...');
    const [pointsByType] = await connection.execute(`
      SELECT 
        uwa.activity_type,
        COUNT(*) as count,
        SUM(CASE 
          WHEN uwa.activity_type = 'intense' THEN ROUND(wa.points * 1.5)
          WHEN uwa.activity_type = 'relaxed' THEN ROUND(wa.points * 0.8)
          ELSE wa.points
        END) as total_points
      FROM user_wellness_activities uwa
      JOIN available_wellness_activities wa ON uwa.activity_id = wa.id
      GROUP BY uwa.activity_type
    `);
    
    console.log('✅ Points by activity type:');
    pointsByType.forEach(type => {
      console.log(`   - ${type.activity_type || 'normal'}: ${type.count} activities, ${type.total_points} points`);
    });

    // Test point calculation with sample data
    console.log('\n🧪 Testing point calculation with sample data...');
    if (activities.length > 0 && userActivities.length > 0) {
      const sampleActivity = activities[0];
      const sampleUserActivity = userActivities[0];
      
      console.log('📊 Sample calculation:');
      console.log(`   Base activity: ${sampleActivity.title} (${sampleActivity.points} points)`);
      console.log(`   User activity type: ${sampleUserActivity.activity_type || 'normal'}`);
      
      let multiplier = 1;
      switch (sampleUserActivity.activity_type) {
        case 'intense':
          multiplier = 1.5;
          break;
        case 'relaxed':
          multiplier = 0.8;
          break;
        default:
          multiplier = 1;
      }
      
      const calculatedPoints = Math.round(sampleActivity.points * multiplier);
      console.log(`   Multiplier: x${multiplier}`);
      console.log(`   Calculated points: ${calculatedPoints}`);
      console.log(`   Database calculated: ${sampleUserActivity.calculated_points}`);
      
      if (calculatedPoints === sampleUserActivity.calculated_points) {
        console.log('   ✅ Point calculation is correct!');
      } else {
        console.log('   ❌ Point calculation mismatch!');
      }
    }

    console.log('\n🎉 Wellness points check completed!');

  } catch (error) {
    console.error('❌ Error during check:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the check
checkWellnessPoints();
