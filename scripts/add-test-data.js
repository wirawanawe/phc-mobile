const mysql = require('mysql2/promise');

async function addTestData() {
  let connection;
  
  try {
    // Database configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pr1k1t1w',
      database: process.env.DB_NAME || 'phc_dashboard',
      port: process.env.DB_PORT || 3306
    };

    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Connected to database successfully!');
    
    const today = new Date().toISOString().split('T')[0];
    const userId = 6; // Test user ID
    
    console.log(`Adding test data for user ${userId} on ${today}...`);
    
    // Add meal tracking data
    await connection.execute(`
      INSERT INTO meal_tracking (user_id, meal_type, recorded_at, created_at, updated_at) 
      VALUES (?, 'breakfast', NOW(), NOW(), NOW())
    `, [userId]);
    
    const mealId = await connection.execute(`
      SELECT LAST_INSERT_ID() as id
    `);
    
    // Add meal foods
    await connection.execute(`
      INSERT INTO meal_foods (meal_id, food_id, quantity, unit, calories, protein, carbs, fat) 
      VALUES (?, 1, 100, 'grams', 130, 2.7, 28, 0.3)
    `, [mealId[0][0].id]);
    
    // Add water tracking
    await connection.execute(`
      INSERT INTO water_tracking (user_id, amount_ml, tracking_date, tracking_time, created_at, updated_at) 
      VALUES (?, 500, ?, NOW(), NOW(), NOW())
    `, [userId, today]);
    
    // Add fitness tracking
    await connection.execute(`
      INSERT INTO fitness_tracking (user_id, activity_type, activity_name, duration_minutes, calories_burned, distance_km, steps, tracking_date, tracking_time) 
      VALUES (?, 'walking', 'Morning Walk', 30, 150, 2.5, 3000, ?, NOW())
    `, [userId, today]);
    
    // Add mood tracking
    await connection.execute(`
      INSERT INTO mood_tracking (user_id, mood_level, energy_level, tracking_date, created_at, updated_at) 
      VALUES (?, 4, 3, ?, NOW(), NOW())
    `, [userId, today]);
    
    // Add sleep tracking
    await connection.execute(`
      INSERT INTO sleep_tracking (user_id, sleep_duration_minutes, sleep_quality, sleep_date, created_at, updated_at) 
      VALUES (?, 480, 4, ?, NOW(), NOW())
    `, [userId, today]);
    
    console.log('✅ Test data added successfully!');
    console.log('📊 Added:');
    console.log('   • 1 meal entry (breakfast)');
    console.log('   • 1 water entry (500ml)');
    console.log('   • 1 fitness entry (30 min walking)');
    console.log('   • 1 mood entry (level 4)');
    console.log('   • 1 sleep entry (8 hours)');
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Run the script
if (require.main === module) {
  addTestData()
    .then(() => {
      console.log('\n🎉 Test data script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
} 