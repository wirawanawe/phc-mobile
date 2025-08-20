const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugPointsCalculation() {
  let connection;
  
  try {
    console.log('🔍 Debugging points calculation...\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pr1k1t1w',
      database: process.env.DB_NAME || 'phc_dashboard',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database');

    // Check user wellness activities with detailed point calculation
    console.log('\n📋 Checking user wellness activities with detailed calculation...');
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
        END as calculated_points,
        CASE 
          WHEN uwa.activity_type = 'intense' THEN 'x1.5'
          WHEN uwa.activity_type = 'relaxed' THEN 'x0.8'
          ELSE 'x1.0'
        END as multiplier_used
      FROM user_wellness_activities uwa
      JOIN available_wellness_activities wa ON uwa.activity_id = wa.id
      WHERE uwa.user_id = 5
      ORDER BY uwa.completed_at DESC
    `);
    
    console.log('✅ User wellness activities with calculation details:');
    if (userActivities.length === 0) {
      console.log('   No user wellness activities found');
    } else {
      userActivities.forEach((activity, index) => {
        console.log(`\n   Activity ${index + 1}:`);
        console.log(`   - Title: ${activity.title}`);
        console.log(`   - Activity Type: ${activity.activity_type || 'normal'}`);
        console.log(`   - Base Points: ${activity.base_points}`);
        console.log(`   - Multiplier: ${activity.multiplier_used}`);
        console.log(`   - Calculated Points: ${activity.calculated_points}`);
        console.log(`   - Duration: ${activity.duration_minutes}min`);
        console.log(`   - Date: ${activity.activity_date}`);
        console.log(`   - Completed: ${activity.completed_at}`);
      });
    }

    // Calculate total points manually
    console.log('\n📋 Manual total points calculation...');
    let totalPoints = 0;
    let totalActivities = 0;
    
    userActivities.forEach(activity => {
      totalPoints += activity.calculated_points || 0;
      totalActivities += 1;
      console.log(`   Adding ${activity.calculated_points} points from ${activity.title} (${activity.activity_type})`);
    });
    
    console.log(`\n✅ Manual calculation results:`);
    console.log(`   - Total activities: ${totalActivities}`);
    console.log(`   - Total points: ${totalPoints}`);

    // Check if there are any NULL or invalid values
    console.log('\n📋 Checking for NULL or invalid values...');
    const [nullCheck] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN uwa.duration_minutes IS NULL THEN 1 END) as null_duration,
        COUNT(CASE WHEN uwa.duration_minutes = 0 THEN 1 END) as zero_duration,
        COUNT(CASE WHEN wa.points IS NULL THEN 1 END) as null_base_points
      FROM user_wellness_activities uwa
      JOIN available_wellness_activities wa ON uwa.activity_id = wa.id
      WHERE uwa.user_id = 5
    `);
    
    console.log('✅ Data quality check:');
    console.log(`   - Total records: ${nullCheck[0].total_records}`);
    console.log(`   - NULL duration: ${nullCheck[0].null_duration}`);
    console.log(`   - Zero duration: ${nullCheck[0].zero_duration}`);
    console.log(`   - NULL base points: ${nullCheck[0].null_base_points}`);

    // Test the exact calculation that frontend uses
    console.log('\n📋 Testing frontend calculation logic...');
    const frontendCalculation = userActivities.reduce((total, activity) => {
      const points = activity.calculated_points || 0;
      console.log(`   Frontend: Adding ${points} to total ${total} = ${total + points}`);
      return total + points;
    }, 0);
    
    console.log(`\n✅ Frontend calculation result: ${frontendCalculation}`);

    // Check if there are any string concatenation issues
    console.log('\n📋 Checking for string concatenation issues...');
    const stringTest = userActivities.reduce((total, activity) => {
      const points = activity.calculated_points || 0;
      return total + points;
    }, 0);
    
    console.log(`✅ String test result: ${stringTest} (type: ${typeof stringTest})`);

    console.log('\n🎉 Points calculation debug completed!');

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the debug
debugPointsCalculation();
