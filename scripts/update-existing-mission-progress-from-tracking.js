const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function updateExistingMissionProgressFromTracking() {
  let connection;
  
  try {
    console.log('🔄 Updating existing mission progress from tracking data...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully\n');
    
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Processing data for date: ${today}\n`);
    
    // 1. Update water intake missions
    console.log('💧 1. Updating water intake missions...');
    const waterUpdateResult = await connection.execute(`
      UPDATE user_missions um
      JOIN missions m ON um.mission_id = m.id
      JOIN (
        SELECT user_id, SUM(amount_ml) as total_water
        FROM water_tracking 
        WHERE DATE(tracking_date) = ?
        GROUP BY user_id
      ) wt ON um.user_id = wt.user_id
      SET 
        um.current_value = wt.total_water,
        um.progress = LEAST((wt.total_water / m.target_value) * 100, 100),
        um.status = CASE 
          WHEN wt.total_water >= m.target_value THEN 'completed'
          ELSE 'active'
        END,
        um.updated_at = NOW()
      WHERE m.category = 'health_tracking' 
        AND m.unit = 'ml'
        AND um.mission_date = ?
        AND um.status = 'active'
    `, [today, today]);
    
    console.log(`   ✅ Updated ${waterUpdateResult[0].affectedRows} water missions`);
    
    // 2. Update sleep duration missions
    console.log('\n😴 2. Updating sleep duration missions...');
    const sleepUpdateResult = await connection.execute(`
      UPDATE user_missions um
      JOIN missions m ON um.mission_id = m.id
      JOIN (
        SELECT user_id, AVG(sleep_hours) as avg_sleep
        FROM sleep_tracking 
        WHERE DATE(sleep_date) = ?
        GROUP BY user_id
      ) st ON um.user_id = st.user_id
      SET 
        um.current_value = st.avg_sleep,
        um.progress = LEAST((st.avg_sleep / m.target_value) * 100, 100),
        um.status = CASE 
          WHEN st.avg_sleep >= m.target_value THEN 'completed'
          ELSE 'active'
        END,
        um.updated_at = NOW()
      WHERE m.category = 'health_tracking' 
        AND m.unit = 'hours'
        AND um.mission_date = ?
        AND um.status = 'active'
    `, [today, today]);
    
    console.log(`   ✅ Updated ${sleepUpdateResult[0].affectedRows} sleep missions`);
    
    // 3. Update fitness steps missions
    console.log('\n🚶 3. Updating fitness steps missions...');
    const stepsUpdateResult = await connection.execute(`
      UPDATE user_missions um
      JOIN missions m ON um.mission_id = m.id
      JOIN (
        SELECT user_id, SUM(steps) as total_steps
        FROM fitness_tracking 
        WHERE DATE(tracking_date) = ?
        GROUP BY user_id
      ) ft ON um.user_id = ft.user_id
      SET 
        um.current_value = ft.total_steps,
        um.progress = LEAST((ft.total_steps / m.target_value) * 100, 100),
        um.status = CASE 
          WHEN ft.total_steps >= m.target_value THEN 'completed'
          ELSE 'active'
        END,
        um.updated_at = NOW()
      WHERE m.category = 'fitness' 
        AND m.unit IN ('steps', 'langkah')
        AND um.mission_date = ?
        AND um.status = 'active'
    `, [today, today]);
    
    console.log(`   ✅ Updated ${stepsUpdateResult[0].affectedRows} steps missions`);
    
    // 4. Update fitness duration missions
    console.log('\n⏱️ 4. Updating fitness duration missions...');
    const durationUpdateResult = await connection.execute(`
      UPDATE user_missions um
      JOIN missions m ON um.mission_id = m.id
      JOIN (
        SELECT user_id, SUM(duration_minutes) as total_minutes
        FROM fitness_tracking 
        WHERE DATE(tracking_date) = ?
        GROUP BY user_id
      ) ft ON um.user_id = ft.user_id
      SET 
        um.current_value = ft.total_minutes,
        um.progress = LEAST((ft.total_minutes / m.target_value) * 100, 100),
        um.status = CASE 
          WHEN ft.total_minutes >= m.target_value THEN 'completed'
          ELSE 'active'
        END,
        um.updated_at = NOW()
      WHERE m.category = 'fitness' 
        AND m.unit IN ('minutes', 'menit')
        AND um.mission_date = ?
        AND um.status = 'active'
    `, [today, today]);
    
    console.log(`   ✅ Updated ${durationUpdateResult[0].affectedRows} duration missions`);
    
    // 5. Update nutrition calories missions
    console.log('\n🍽️ 5. Updating nutrition calories missions...');
    const caloriesUpdateResult = await connection.execute(`
      UPDATE user_missions um
      JOIN missions m ON um.mission_id = m.id
      JOIN (
        SELECT user_id, SUM(calories) as total_calories
        FROM meal_logging 
        WHERE DATE(recorded_at) = ?
        GROUP BY user_id
      ) ml ON um.user_id = ml.user_id
      SET 
        um.current_value = ml.total_calories,
        um.progress = LEAST((ml.total_calories / m.target_value) * 100, 100),
        um.status = CASE 
          WHEN ml.total_calories >= m.target_value THEN 'completed'
          ELSE 'active'
        END,
        um.updated_at = NOW()
      WHERE m.category = 'nutrition' 
        AND m.unit = 'calories'
        AND um.mission_date = ?
        AND um.status = 'active'
    `, [today, today]);
    
    console.log(`   ✅ Updated ${caloriesUpdateResult[0].affectedRows} calories missions`);
    
    // 6. Update nutrition meal count missions
    console.log('\n🍴 6. Updating nutrition meal count missions...');
    const mealCountUpdateResult = await connection.execute(`
      UPDATE user_missions um
      JOIN missions m ON um.mission_id = m.id
      JOIN (
        SELECT user_id, COUNT(DISTINCT meal_type) as meal_count
        FROM meal_logging 
        WHERE DATE(recorded_at) = ?
        GROUP BY user_id
      ) ml ON um.user_id = ml.user_id
      SET 
        um.current_value = ml.meal_count,
        um.progress = LEAST((ml.meal_count / m.target_value) * 100, 100),
        um.status = CASE 
          WHEN ml.meal_count >= m.target_value THEN 'completed'
          ELSE 'active'
        END,
        um.updated_at = NOW()
      WHERE m.category = 'nutrition' 
        AND m.unit = 'meals'
        AND um.mission_date = ?
        AND um.status = 'active'
    `, [today, today]);
    
    console.log(`   ✅ Updated ${mealCountUpdateResult[0].affectedRows} meal count missions`);
    
    // 7. Update mental health mood score missions
    console.log('\n😊 7. Updating mental health mood score missions...');
    const moodUpdateResult = await connection.execute(`
      UPDATE user_missions um
      JOIN missions m ON um.mission_id = m.id
      JOIN (
        SELECT user_id, AVG(mood_score) as avg_mood
        FROM mood_tracking 
        WHERE DATE(tracking_date) = ?
        GROUP BY user_id
      ) mt ON um.user_id = mt.user_id
      SET 
        um.current_value = mt.avg_mood,
        um.progress = LEAST((mt.avg_mood / m.target_value) * 100, 100),
        um.status = CASE 
          WHEN mt.avg_mood >= m.target_value THEN 'completed'
          ELSE 'active'
        END,
        um.updated_at = NOW()
      WHERE m.category = 'mental_health' 
        AND m.unit = 'mood_score'
        AND um.mission_date = ?
        AND um.status = 'active'
    `, [today, today]);
    
    console.log(`   ✅ Updated ${moodUpdateResult[0].affectedRows} mood score missions`);
    
    // 8. Update mental health stress level missions
    console.log('\n😰 8. Updating mental health stress level missions...');
    const stressUpdateResult = await connection.execute(`
      UPDATE user_missions um
      JOIN missions m ON um.mission_id = m.id
      JOIN (
        SELECT user_id, 
               CASE 
                 WHEN stress_level = 'low' THEN 1
                 WHEN stress_level = 'moderate' THEN 2
                 WHEN stress_level = 'high' THEN 3
                 WHEN stress_level = 'very_high' THEN 4
                 ELSE 2
               END as stress_value
        FROM mood_tracking 
        WHERE DATE(tracking_date) = ?
        ORDER BY created_at DESC
        LIMIT 1
      ) mt ON um.user_id = mt.user_id
      SET 
        um.current_value = mt.stress_value,
        um.progress = LEAST((mt.stress_value / m.target_value) * 100, 100),
        um.status = CASE 
          WHEN mt.stress_value >= m.target_value THEN 'completed'
          ELSE 'active'
        END,
        um.updated_at = NOW()
      WHERE m.category = 'mental_health' 
        AND m.unit = 'stress_level'
        AND um.mission_date = ?
        AND um.status = 'active'
    `, [today, today]);
    
    console.log(`   ✅ Updated ${stressUpdateResult[0].affectedRows} stress level missions`);
    
    // 9. Set completed_at for completed missions
    console.log('\n🎯 9. Setting completed_at for completed missions...');
    const completedUpdateResult = await connection.execute(`
      UPDATE user_missions 
      SET completed_at = NOW()
      WHERE status = 'completed' 
        AND completed_at IS NULL
        AND mission_date = ?
    `, [today]);
    
    console.log(`   ✅ Set completed_at for ${completedUpdateResult[0].affectedRows} completed missions`);
    
    // 10. Show summary
    console.log('\n📊 10. Mission Update Summary:');
    const summaryResult = await connection.execute(`
      SELECT 
        m.category,
        m.unit,
        COUNT(*) as total_missions,
        SUM(CASE WHEN um.status = 'completed' THEN 1 ELSE 0 END) as completed_missions,
        SUM(CASE WHEN um.status = 'active' THEN 1 ELSE 0 END) as active_missions
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.mission_date = ?
      GROUP BY m.category, m.unit
      ORDER BY m.category, m.unit
    `, [today]);
    
    summaryResult[0].forEach(row => {
      console.log(`   ${row.category}/${row.unit}: ${row.completed_missions}/${row.total_missions} completed (${row.active_missions} active)`);
    });
    
    console.log('\n✅ Mission progress update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating mission progress:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the update
updateExistingMissionProgressFromTracking().catch(console.error);
