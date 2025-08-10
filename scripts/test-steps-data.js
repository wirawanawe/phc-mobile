const mysql = require('mysql2/promise');

async function addTestStepsData() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'phc_dashboard'
    });

    console.log('✅ Connected to database');

    // Add test fitness data with steps
    const testData = [
      {
        user_id: 1,
        activity_type: 'Walking',
        activity_name: 'Morning Walk',
        duration_minutes: 30,
        calories_burned: 150,
        distance_km: 2.5,
        steps: 3000,
        tracking_date: new Date().toISOString().split('T')[0],
        tracking_time: '08:00:00'
      },
      {
        user_id: 1,
        activity_type: 'Running',
        activity_name: 'Evening Run',
        duration_minutes: 45,
        calories_burned: 400,
        distance_km: 5.0,
        steps: 6000,
        tracking_date: new Date().toISOString().split('T')[0],
        tracking_time: '18:00:00'
      }
    ];

    for (const data of testData) {
      const sql = `
        INSERT INTO fitness_tracking (
          user_id, activity_type, activity_name, duration_minutes, 
          calories_burned, distance_km, steps, tracking_date, tracking_time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const params = [
        data.user_id,
        data.activity_type,
        data.activity_name,
        data.duration_minutes,
        data.calories_burned,
        data.distance_km,
        data.steps,
        data.tracking_date,
        data.tracking_time
      ];

      await connection.execute(sql, params);
      console.log(`✅ Added ${data.activity_type} with ${data.steps} steps`);
    }

    // Verify the data was added
    const [rows] = await connection.execute(`
      SELECT activity_type, SUM(steps) as total_steps, SUM(duration_minutes) as total_duration
      FROM fitness_tracking 
      WHERE user_id = 1 AND tracking_date = ?
      GROUP BY activity_type
    `, [new Date().toISOString().split('T')[0]]);

    console.log('\n📊 Today\'s fitness data:');
    rows.forEach(row => {
      console.log(`- ${row.activity_type}: ${row.total_steps} steps, ${row.total_duration} minutes`);
    });

    console.log('\n🎉 Test steps data added successfully!');

  } catch (error) {
    console.error('❌ Error adding test steps data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addTestStepsData(); 