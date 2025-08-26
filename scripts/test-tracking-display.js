const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function testTrackingDisplay() {
  let connection;
  
  try {
    console.log('🔍 Testing tracking data display...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const today = new Date().toISOString().split('T')[0];
    const userId = 1;
    
    console.log('📅 Testing for date:', today);
    console.log('👤 Using user ID:', userId);

    // Test mood tracking data
    console.log('\n1. Testing mood tracking data...');
    const moodSql = `
      SELECT id, user_id, mood_level, mood_score, stress_level, energy_level, 
             sleep_quality, tracking_date, notes, created_at
      FROM mood_tracking
      WHERE user_id = ? AND tracking_date = ?
      ORDER BY created_at DESC
    `;
    const moodData = await connection.execute(moodSql, [userId, today]);
    console.log('Mood Data Count:', moodData[0].length);
    if (moodData[0].length > 0) {
      console.log('✅ Mood data available for display');
      console.log('Sample mood:', moodData[0][0]);
    } else {
      console.log('❌ No mood data found for today');
    }
    
    // Test water tracking data
    console.log('\n2. Testing water tracking data...');
    const waterSql = `
      SELECT id, user_id, amount_ml, tracking_date, tracking_time, notes, created_at
      FROM water_tracking
      WHERE user_id = ? AND tracking_date = ?
      ORDER BY created_at DESC
    `;
    const waterData = await connection.execute(waterSql, [userId, today]);
    console.log('Water Data Count:', waterData[0].length);
    if (waterData[0].length > 0) {
      console.log('✅ Water data available for display');
      console.log('Sample water:', waterData[0][0]);
    } else {
      console.log('❌ No water data found for today');
    }
    
    // Test fitness tracking data
    console.log('\n3. Testing fitness tracking data...');
    const fitnessSql = `
      SELECT id, user_id, activity_type, activity_name, duration_minutes, calories_burned, 
             distance_km, steps, tracking_date, created_at
      FROM fitness_tracking
      WHERE user_id = ? AND tracking_date = ?
      ORDER BY created_at DESC
    `;
    const fitnessData = await connection.execute(fitnessSql, [userId, today]);
    console.log('Fitness Data Count:', fitnessData[0].length);
    if (fitnessData[0].length > 0) {
      console.log('✅ Fitness data available for display');
      console.log('Sample fitness:', fitnessData[0][0]);
    } else {
      console.log('❌ No fitness data found for today');
    }
    
    // Test meal tracking data
    console.log('\n4. Testing meal tracking data...');
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
    if (mealData[0].length > 0) {
      console.log('✅ Meal data available for display');
      console.log('Sample meal:', mealData[0][0]);
    } else {
      console.log('❌ No meal data found for today');
    }
    
    // Test sleep tracking data
    console.log('\n5. Testing sleep tracking data...');
    const sleepSql = `
      SELECT id, user_id, sleep_date, bedtime, wake_time, sleep_duration_minutes, 
             sleep_quality, notes, created_at
      FROM sleep_tracking
      WHERE user_id = ? AND sleep_date = ?
      ORDER BY created_at DESC
    `;
    const sleepData = await connection.execute(sleepSql, [userId, today]);
    console.log('Sleep Data Count:', sleepData[0].length);
    if (sleepData[0].length > 0) {
      console.log('✅ Sleep data available for display');
      console.log('Sample sleep:', sleepData[0][0]);
    } else {
      console.log('❌ No sleep data found for today');
    }
    
    console.log('\n📊 Summary:');
    console.log(`😊 Mood: ${moodData[0].length} entries`);
    console.log(`💧 Water: ${waterData[0].length} entries`);
    console.log(`🏃‍♂️ Fitness: ${fitnessData[0].length} entries`);
    console.log(`🍽️ Meal: ${mealData[0].length} entries`);
    console.log(`😴 Sleep: ${sleepData[0].length} entries`);
    
    const totalEntries = moodData[0].length + waterData[0].length + fitnessData[0].length + mealData[0].length + sleepData[0].length;
    console.log(`\n🎯 Total tracking entries: ${totalEntries}`);
    
    if (totalEntries > 0) {
      console.log('✅ Data should now be visible in WellnessDetailsScreen!');
    } else {
      console.log('❌ No tracking data found - check if data was added correctly');
    }
    
  } catch (error) {
    console.error('❌ Error testing tracking display:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

testTrackingDisplay();
