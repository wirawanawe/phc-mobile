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
    console.log('📅 Adding tracking data for today...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Today\'s date:', today);

    // Get first user ID
    const [users] = await connection.execute('SELECT id FROM mobile_users LIMIT 1');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const userId = users[0].id;
    console.log('👤 Using user ID:', userId);

    // Check if data already exists for today
    console.log('\n🔍 Checking existing data for today...');
    
    const [existingMood] = await connection.execute(
      'SELECT COUNT(*) as count FROM mood_tracking WHERE user_id = ? AND tracking_date = ?',
      [userId, today]
    );
    const [existingWater] = await connection.execute(
      'SELECT COUNT(*) as count FROM water_tracking WHERE user_id = ? AND tracking_date = ?',
      [userId, today]
    );
    const [existingFitness] = await connection.execute(
      'SELECT COUNT(*) as count FROM fitness_tracking WHERE user_id = ? AND tracking_date = ?',
      [userId, today]
    );
    const [existingSleep] = await connection.execute(
      'SELECT COUNT(*) as count FROM sleep_tracking WHERE user_id = ? AND sleep_date = ?',
      [userId, today]
    );
    const [existingMeal] = await connection.execute(
      'SELECT COUNT(*) as count FROM meal_tracking WHERE user_id = ? AND DATE(recorded_at) = ?',
      [userId, today]
    );

    console.log(`😊 Mood tracking: ${existingMood[0].count} entries`);
    console.log(`💧 Water tracking: ${existingWater[0].count} entries`);
    console.log(`🏃‍♂️ Fitness tracking: ${existingFitness[0].count} entries`);
    console.log(`😴 Sleep tracking: ${existingSleep[0].count} entries`);
    console.log(`🍽️ Meal tracking: ${existingMeal[0].count} entries`);

    // Add Mood Tracking for Today
    if (existingMood[0].count === 0) {
      console.log('\n😊 Adding mood tracking for today...');
      try {
        await connection.execute(
          'INSERT INTO mood_tracking (user_id, mood_level, mood_score, stress_level, energy_level, sleep_quality, tracking_date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [userId, 'happy', 8, 'low', 'high', 'good', today, 'Great day! Feeling energetic and productive']
        );
        console.log('✅ Added mood entry for today');
      } catch (error) {
        console.error('❌ Error adding mood entry:', error.message);
      }
    }

    // Add Water Tracking for Today
    if (existingWater[0].count === 0) {
      console.log('\n💧 Adding water tracking for today...');
      const waterEntries = [
        { amount_ml: 500, time: '08:00:00', notes: 'Morning water' },
        { amount_ml: 300, time: '10:30:00', notes: 'Mid-morning hydration' },
        { amount_ml: 400, time: '12:00:00', notes: 'Lunch time water' },
        { amount_ml: 250, time: '14:30:00', notes: 'Afternoon refreshment' },
        { amount_ml: 350, time: '16:00:00', notes: 'Late afternoon water' }
      ];

      for (const water of waterEntries) {
        try {
          await connection.execute(
            'INSERT INTO water_tracking (user_id, amount_ml, tracking_date, tracking_time, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [userId, water.amount_ml, today, water.time, water.notes]
          );
          console.log(`✅ Added water entry: ${water.amount_ml}ml at ${water.time}`);
        } catch (error) {
          console.error('❌ Error adding water entry:', error.message);
        }
      }
    }

    // Add Fitness Tracking for Today
    if (existingFitness[0].count === 0) {
      console.log('\n🏃‍♂️ Adding fitness tracking for today...');
      const fitnessActivities = [
        {
          activity_type: 'Running',
          activity_name: 'Morning Run',
          duration_minutes: 30,
          calories_burned: 300,
          distance_km: 5.0,
          intensity: 'moderate',
          time: '06:00:00',
          notes: 'Great morning run! Felt energized'
        },
        {
          activity_type: 'Weight Lifting',
          activity_name: 'Gym Session',
          duration_minutes: 45,
          calories_burned: 250,
          distance_km: null,
          intensity: 'moderate',
          time: '17:00:00',
          notes: 'Strength training - upper body focus'
        }
      ];

      for (const fitness of fitnessActivities) {
        try {
          await connection.execute(
            'INSERT INTO fitness_tracking (user_id, activity_type, activity_name, duration_minutes, calories_burned, distance_km, intensity, tracking_date, tracking_time, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [userId, fitness.activity_type, fitness.activity_name, fitness.duration_minutes, fitness.calories_burned, fitness.distance_km, fitness.intensity, today, fitness.time, fitness.notes]
          );
          console.log(`✅ Added fitness entry: ${fitness.activity_type}`);
        } catch (error) {
          console.error('❌ Error adding fitness entry:', error.message);
        }
      }
    }

    // Add Sleep Tracking for Today
    if (existingSleep[0].count === 0) {
      console.log('\n😴 Adding sleep tracking for today...');
      try {
        await connection.execute(
          'INSERT INTO sleep_tracking (user_id, sleep_date, bedtime, wake_time, sleep_duration_minutes, sleep_quality, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [userId, today, '22:30:00', '06:00:00', 450, 'excellent', 'Perfect sleep! Woke up feeling refreshed']
        );
        console.log('✅ Added sleep entry for today');
      } catch (error) {
        console.error('❌ Error adding sleep entry:', error.message);
      }
    }

    // Add Meal Tracking for Today
    if (existingMeal[0].count === 0) {
      console.log('\n🍽️ Adding meal tracking for today...');
      const mealEntries = [
        {
          meal_type: 'breakfast',
          time: '07:00:00',
          notes: 'Healthy breakfast - oatmeal with fruits and nuts'
        },
        {
          meal_type: 'lunch',
          time: '12:00:00',
          notes: 'Protein-rich lunch - grilled chicken with vegetables'
        },
        {
          meal_type: 'dinner',
          time: '19:00:00',
          notes: 'Light dinner - salmon with quinoa and salad'
        },
        {
          meal_type: 'snack',
          time: '15:00:00',
          notes: 'Afternoon snack - Greek yogurt with berries'
        }
      ];

      for (const meal of mealEntries) {
        try {
          await connection.execute(
            'INSERT INTO meal_tracking (user_id, meal_type, recorded_at, notes, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [userId, meal.meal_type, `${today} ${meal.time}`, meal.notes]
          );
          console.log(`✅ Added meal entry: ${meal.meal_type}`);
        } catch (error) {
          console.error('❌ Error adding meal entry:', error.message);
        }
      }
    }

    // Final verification
    console.log('\n📊 Final data summary for today:');
    
    const [finalMood] = await connection.execute(
      'SELECT COUNT(*) as count FROM mood_tracking WHERE user_id = ? AND tracking_date = ?',
      [userId, today]
    );
    const [finalWater] = await connection.execute(
      'SELECT COUNT(*) as count FROM water_tracking WHERE user_id = ? AND tracking_date = ?',
      [userId, today]
    );
    const [finalFitness] = await connection.execute(
      'SELECT COUNT(*) as count FROM fitness_tracking WHERE user_id = ? AND tracking_date = ?',
      [userId, today]
    );
    const [finalSleep] = await connection.execute(
      'SELECT COUNT(*) as count FROM sleep_tracking WHERE user_id = ? AND sleep_date = ?',
      [userId, today]
    );
    const [finalMeal] = await connection.execute(
      'SELECT COUNT(*) as count FROM meal_tracking WHERE user_id = ? AND DATE(recorded_at) = ?',
      [userId, today]
    );

    console.log(`😊 Mood tracking: ${finalMood[0].count} entries`);
    console.log(`💧 Water tracking: ${finalWater[0].count} entries`);
    console.log(`🏃‍♂️ Fitness tracking: ${finalFitness[0].count} entries`);
    console.log(`😴 Sleep tracking: ${finalSleep[0].count} entries`);
    console.log(`🍽️ Meal tracking: ${finalMeal[0].count} entries`);

    console.log('\n✅ Today\'s tracking data addition completed!');
    console.log('🎯 WellnessDetailsScreen should now display data when showing "Today".');

  } catch (error) {
    console.error('❌ Error adding today\'s tracking data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the script
addTodayTrackingData();
