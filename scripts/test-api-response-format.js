const mysql = require('mysql2/promise');

const dbConfig = {
      host: 'dash.doctorphc.id',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function testApiResponseFormat() {
  let connection;
  
  try {
    console.log('🔍 Testing API response format...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const today = new Date().toISOString().split('T')[0];
    const userId = 1; // Test with user ID 1
    
    console.log('📅 Testing for date:', today);
    console.log('👤 Using user ID:', userId);

    // Test mood tracking data format
    console.log('\n1. Testing mood tracking data format...');
    const moodSql = `
      SELECT id, user_id, mood_level, mood_score, stress_level, energy_level, 
             sleep_quality, tracking_date, tracking_time, notes, created_at
      FROM mood_tracking
      WHERE user_id = ? AND tracking_date = ?
      ORDER BY created_at DESC
    `;
    const moodData = await connection.execute(moodSql, [userId, today]);
    console.log('Mood Data Count:', moodData[0].length);
    console.log('Mood Data Sample:', moodData[0][0] || 'No data');
    
    // Test water tracking data format
    console.log('\n2. Testing water tracking data format...');
    const waterSql = `
      SELECT id, user_id, amount_ml, tracking_date, tracking_time, notes, created_at
      FROM water_tracking
      WHERE user_id = ? AND tracking_date = ?
      ORDER BY created_at DESC
    `;
    const waterData = await connection.execute(waterSql, [userId, today]);
    console.log('Water Data Count:', waterData[0].length);
    console.log('Water Data Sample:', waterData[0][0] || 'No data');
    
    // Test fitness tracking data format
    console.log('\n3. Testing fitness tracking data format...');
    const fitnessSql = `
      SELECT id, user_id, workout_type, workout_duration_minutes, calories_burned, 
             distance_km, steps, tracking_date, tracking_time, notes, created_at
      FROM fitness_tracking
      WHERE user_id = ? AND tracking_date = ?
      ORDER BY created_at DESC
    `;
    const fitnessData = await connection.execute(fitnessSql, [userId, today]);
    console.log('Fitness Data Count:', fitnessData[0].length);
    console.log('Fitness Data Sample:', fitnessData[0][0] || 'No data');
    
    // Test meal tracking data format
    console.log('\n4. Testing meal tracking data format...');
    const mealSql = `
      SELECT 
        mt.id, mt.user_id, mt.meal_type, mt.recorded_at, mt.notes, mt.created_at,
        mf.food_id, mf.quantity, mf.unit, mf.calories, mf.protein, mf.carbs, mf.fat,
        fd.name as food_name
      FROM meal_tracking mt
      LEFT JOIN meal_foods mf ON mt.id = mf.meal_id
      LEFT JOIN food_database fd ON mf.food_id = fd.id
      WHERE mt.user_id = ? AND DATE(CONVERT_TZ(mt.recorded_at, '+00:00', '+07:00')) = ?
      ORDER BY mt.recorded_at DESC
    `;
    const mealData = await connection.execute(mealSql, [userId, today]);
    console.log('Meal Data Count:', mealData[0].length);
    console.log('Meal Data Sample:', mealData[0][0] || 'No data');
    
    // Test sleep tracking data format
    console.log('\n5. Testing sleep tracking data format...');
    const sleepSql = `
      SELECT id, user_id, sleep_date, bedtime, wake_time, sleep_duration_minutes, 
             sleep_quality, notes, created_at
      FROM sleep_tracking
      WHERE user_id = ? AND sleep_date = ?
      ORDER BY created_at DESC
    `;
    const sleepData = await connection.execute(sleepSql, [userId, today]);
    console.log('Sleep Data Count:', sleepData[0].length);
    console.log('Sleep Data Sample:', sleepData[0][0] || 'No data');
    
    console.log('\n✅ API response format testing completed!');
    
  } catch (error) {
    console.error('❌ Error testing API response format:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

testApiResponseFormat();
