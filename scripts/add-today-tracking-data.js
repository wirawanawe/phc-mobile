const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function addTodayTrackingData() {
  let connection;
  
  try {
    console.log('🔍 Adding tracking data for today...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const today = new Date().toISOString().split('T')[0];
    const userId = 1;
    
    console.log('📅 Adding data for date:', today);
    console.log('👤 Using user ID:', userId);

    // Add mood tracking data for today
    console.log('\n1. Adding mood tracking data...');
    const moodSql = `
      INSERT INTO mood_tracking (
        user_id, mood_level, mood_score, stress_level, energy_level, 
        sleep_quality, tracking_date, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    await connection.execute(moodSql, [
      userId, 'happy', 8, 'low', 'high', 'good', today, 'Feeling good today!'
    ]);
    console.log('✅ Mood data added');

    // Add water tracking data for today
    console.log('\n2. Adding water tracking data...');
    const waterSql = `
      INSERT INTO water_tracking (
        user_id, amount_ml, tracking_date, tracking_time, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `;
    await connection.execute(waterSql, [
      userId, 500, today, '08:00:00', 'Morning water'
    ]);
    await connection.execute(waterSql, [
      userId, 300, today, '12:00:00', 'Lunch water'
    ]);
    await connection.execute(waterSql, [
      userId, 400, today, '16:00:00', 'Afternoon water'
    ]);
    console.log('✅ Water data added (3 entries)');

    // Add fitness tracking data for today
    console.log('\n3. Adding fitness tracking data...');
    const fitnessSql = `
      INSERT INTO fitness_tracking (
        user_id, activity_type, activity_name, duration_minutes, 
        calories_burned, distance_km, steps, tracking_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    await connection.execute(fitnessSql, [
      userId, 'Running', 'Morning Run', 30, 300, 3.5, 3500, today
    ]);
    console.log('✅ Fitness data added');

    // Add meal tracking data for today
    console.log('\n4. Adding meal tracking data...');
    const mealSql = `
      INSERT INTO meal_tracking (
        user_id, meal_type, recorded_at, notes, created_at
      ) VALUES (?, ?, ?, ?, NOW())
    `;
    const mealResult = await connection.execute(mealSql, [
      userId, 'breakfast', `${today} 08:30:00`, 'Healthy breakfast'
    ]);
    
    // Add food to meal
    const mealFoodSql = `
      INSERT INTO meal_foods (
        meal_id, food_id, quantity, unit, calories, protein, carbs, fat
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(mealFoodSql, [
      mealResult.insertId, 1, 1, 'serving', 150, 15, 20, 5
    ]);
    console.log('✅ Meal data added');

    // Add sleep tracking data for today
    console.log('\n5. Adding sleep tracking data...');
    const sleepSql = `
      INSERT INTO sleep_tracking (
        user_id, sleep_date, bedtime, wake_time, sleep_duration_minutes, 
        sleep_quality, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    await connection.execute(sleepSql, [
      userId, today, '22:30:00', '06:30:00', 480, 'good', 'Good sleep last night'
    ]);
    console.log('✅ Sleep data added');

    console.log('\n✅ All tracking data added for today!');
    console.log('🎯 Data should now be visible in WellnessDetailsScreen');
    
  } catch (error) {
    console.error('❌ Error adding tracking data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

addTodayTrackingData();
