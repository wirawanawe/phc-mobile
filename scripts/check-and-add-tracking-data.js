const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w', // Try with common password
  database: 'phc_dashboard',
  port: 3306
};

async function checkAndAddTrackingData() {
  let connection;
  
  try {
    console.log('🔍 Checking tracking data in database...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Get today's date and yesterday's date
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log('📅 Checking data for dates:', { today, yesterday, twoDaysAgo });

    // Get first user ID
    const [users] = await connection.execute('SELECT id FROM mobile_users LIMIT 1');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const userId = users[0].id;
    console.log('👤 Using user ID:', userId);

    // Check existing data for each tracking type
    console.log('\n📊 Checking existing tracking data...');

    // 1. Check Mood Tracking
    const [moodData] = await connection.execute(
      'SELECT COUNT(*) as count FROM mood_tracking WHERE user_id = ?',
      [userId]
    );
    console.log(`😊 Mood tracking entries: ${moodData[0].count}`);

    // 2. Check Water Tracking
    const [waterData] = await connection.execute(
      'SELECT COUNT(*) as count FROM water_tracking WHERE user_id = ?',
      [userId]
    );
    console.log(`💧 Water tracking entries: ${waterData[0].count}`);

    // 3. Check Fitness Tracking
    const [fitnessData] = await connection.execute(
      'SELECT COUNT(*) as count FROM fitness_tracking WHERE user_id = ?',
      [userId]
    );
    console.log(`🏃‍♂️ Fitness tracking entries: ${fitnessData[0].count}`);

    // 4. Check Sleep Tracking
    const [sleepData] = await connection.execute(
      'SELECT COUNT(*) as count FROM sleep_tracking WHERE user_id = ?',
      [userId]
    );
    console.log(`😴 Sleep tracking entries: ${sleepData[0].count}`);

    // 5. Check Meal Tracking
    const [mealData] = await connection.execute(
      'SELECT COUNT(*) as count FROM meal_tracking WHERE user_id = ?',
      [userId]
    );
    console.log(`🍽️ Meal tracking entries: ${mealData[0].count}`);

    // Add sample data if needed
    console.log('\n➕ Adding sample tracking data if needed...');

    // Add Mood Tracking Data
    if (moodData[0].count === 0) {
      console.log('😊 Adding sample mood tracking data...');
      const moodEntries = [
        {
          user_id: userId,
          mood_level: 'happy',
          mood_score: 8,
          stress_level: 'low',
          energy_level: 'high',
          sleep_quality: 'good',
          tracking_date: today,
          notes: 'Had a great workout this morning'
        },
        {
          user_id: userId,
          mood_level: 'neutral',
          mood_score: 5,
          stress_level: 'moderate',
          energy_level: 'moderate',
          sleep_quality: 'fair',
          tracking_date: yesterday,
          notes: 'Busy day at work'
        },
        {
          user_id: userId,
          mood_level: 'very_happy',
          mood_score: 10,
          stress_level: 'low',
          energy_level: 'very_high',
          sleep_quality: 'excellent',
          tracking_date: twoDaysAgo,
          notes: 'Completed my fitness goal!'
        }
      ];

      for (const mood of moodEntries) {
        try {
          await connection.execute(
            'INSERT INTO mood_tracking (user_id, mood_level, mood_score, stress_level, energy_level, sleep_quality, tracking_date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [mood.user_id, mood.mood_level, mood.mood_score, mood.stress_level, mood.energy_level, mood.sleep_quality, mood.tracking_date, mood.notes]
          );
          console.log(`✅ Added mood entry for ${mood.tracking_date}`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⏭️ Skipping duplicate mood entry for ${mood.tracking_date}`);
          } else {
            console.error(`❌ Error adding mood entry:`, error.message);
          }
        }
      }
    }

    // Add Water Tracking Data
    if (waterData[0].count === 0) {
      console.log('💧 Adding sample water tracking data...');
      const waterEntries = [
        {
          user_id: userId,
          amount_ml: 500,
          tracking_date: today,
          tracking_time: '08:00:00',
          notes: 'Morning water intake'
        },
        {
          user_id: userId,
          amount_ml: 300,
          tracking_date: today,
          tracking_time: '10:30:00',
          notes: 'Mid-morning water'
        },
        {
          user_id: userId,
          amount_ml: 400,
          tracking_date: yesterday,
          tracking_time: '09:00:00',
          notes: 'Daily water intake'
        }
      ];

      for (const water of waterEntries) {
        try {
          await connection.execute(
            'INSERT INTO water_tracking (user_id, amount_ml, tracking_date, tracking_time, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [water.user_id, water.amount_ml, water.tracking_date, water.tracking_time, water.notes]
          );
          console.log(`✅ Added water entry for ${water.tracking_date} at ${water.tracking_time}`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⏭️ Skipping duplicate water entry for ${water.tracking_date}`);
          } else {
            console.error(`❌ Error adding water entry:`, error.message);
          }
        }
      }
    }

    // Add Fitness Tracking Data
    if (fitnessData[0].count === 0) {
      console.log('🏃‍♂️ Adding sample fitness tracking data...');
      const fitnessEntries = [
        {
          user_id: userId,
          activity_type: 'Running',
          activity_name: 'Morning Run',
          duration_minutes: 30,
          calories_burned: 300,
          distance_km: 5.0,
          intensity: 'moderate',
          tracking_date: today,
          tracking_time: '06:00:00',
          notes: 'Great morning run!'
        },
        {
          user_id: userId,
          activity_type: 'Walking',
          activity_name: 'Evening Walk',
          duration_minutes: 45,
          calories_burned: 180,
          distance_km: 3.2,
          intensity: 'low',
          tracking_date: yesterday,
          tracking_time: '18:00:00',
          notes: 'Relaxing evening walk'
        },
        {
          user_id: userId,
          activity_type: 'Cycling',
          activity_name: 'Bike Ride',
          duration_minutes: 60,
          calories_burned: 400,
          distance_km: 15.0,
          intensity: 'high',
          tracking_date: twoDaysAgo,
          tracking_time: '16:00:00',
          notes: 'Intense cycling session'
        }
      ];

      for (const fitness of fitnessEntries) {
        try {
          await connection.execute(
            'INSERT INTO fitness_tracking (user_id, activity_type, activity_name, duration_minutes, calories_burned, distance_km, intensity, tracking_date, tracking_time, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [fitness.user_id, fitness.activity_type, fitness.activity_name, fitness.duration_minutes, fitness.calories_burned, fitness.distance_km, fitness.intensity, fitness.tracking_date, fitness.tracking_time, fitness.notes]
          );
          console.log(`✅ Added fitness entry for ${fitness.tracking_date}`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⏭️ Skipping duplicate fitness entry for ${fitness.tracking_date}`);
          } else {
            console.error(`❌ Error adding fitness entry:`, error.message);
          }
        }
      }
    }

    // Add Sleep Tracking Data
    if (sleepData[0].count === 0) {
      console.log('😴 Adding sample sleep tracking data...');
      const sleepEntries = [
        {
          user_id: userId,
          sleep_date: today,
          bedtime: '22:30:00',
          wake_time: '06:00:00',
          sleep_duration_minutes: 450,
          sleep_quality: 'good',
          notes: 'Good night sleep'
        },
        {
          user_id: userId,
          sleep_date: yesterday,
          bedtime: '23:00:00',
          wake_time: '06:30:00',
          sleep_duration_minutes: 450,
          sleep_quality: 'excellent',
          notes: 'Excellent sleep quality'
        },
        {
          user_id: userId,
          sleep_date: twoDaysAgo,
          bedtime: '22:00:00',
          wake_time: '05:30:00',
          sleep_duration_minutes: 450,
          sleep_quality: 'fair',
          notes: 'Woke up early'
        }
      ];

      for (const sleep of sleepEntries) {
        try {
          await connection.execute(
            'INSERT INTO sleep_tracking (user_id, sleep_date, bedtime, wake_time, sleep_duration_minutes, sleep_quality, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [sleep.user_id, sleep.sleep_date, sleep.bedtime, sleep.wake_time, sleep.sleep_duration_minutes, sleep.sleep_quality, sleep.notes]
          );
          console.log(`✅ Added sleep entry for ${sleep.sleep_date}`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⏭️ Skipping duplicate sleep entry for ${sleep.sleep_date}`);
          } else {
            console.error(`❌ Error adding sleep entry:`, error.message);
          }
        }
      }
    }

    // Add Meal Tracking Data
    if (mealData[0].count === 0) {
      console.log('🍽️ Adding sample meal tracking data...');
      const mealEntries = [
        {
          user_id: userId,
          meal_type: 'breakfast',
          recorded_at: `${today} 07:00:00`,
          notes: 'Healthy breakfast'
        },
        {
          user_id: userId,
          meal_type: 'lunch',
          recorded_at: `${today} 12:00:00`,
          notes: 'Protein-rich lunch'
        },
        {
          user_id: userId,
          meal_type: 'dinner',
          recorded_at: `${today} 19:00:00`,
          notes: 'Light dinner'
        },
        {
          user_id: userId,
          meal_type: 'breakfast',
          recorded_at: `${yesterday} 08:00:00`,
          notes: 'Quick breakfast'
        }
      ];

      for (const meal of mealEntries) {
        try {
          await connection.execute(
            'INSERT INTO meal_tracking (user_id, meal_type, recorded_at, notes, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [meal.user_id, meal.meal_type, meal.recorded_at, meal.notes]
          );
          console.log(`✅ Added meal entry for ${meal.meal_type} on ${meal.recorded_at.split(' ')[0]}`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⏭️ Skipping duplicate meal entry for ${meal.meal_type}`);
          } else {
            console.error(`❌ Error adding meal entry:`, error.message);
          }
        }
      }
    }

    // Final check - show summary
    console.log('\n📊 Final data summary:');
    
    const [finalMood] = await connection.execute(
      'SELECT COUNT(*) as count FROM mood_tracking WHERE user_id = ?',
      [userId]
    );
    const [finalWater] = await connection.execute(
      'SELECT COUNT(*) as count FROM water_tracking WHERE user_id = ?',
      [userId]
    );
    const [finalFitness] = await connection.execute(
      'SELECT COUNT(*) as count FROM fitness_tracking WHERE user_id = ?',
      [userId]
    );
    const [finalSleep] = await connection.execute(
      'SELECT COUNT(*) as count FROM sleep_tracking WHERE user_id = ?',
      [userId]
    );
    const [finalMeal] = await connection.execute(
      'SELECT COUNT(*) as count FROM meal_tracking WHERE user_id = ?',
      [userId]
    );

    console.log(`😊 Mood tracking: ${finalMood[0].count} entries`);
    console.log(`💧 Water tracking: ${finalWater[0].count} entries`);
    console.log(`🏃‍♂️ Fitness tracking: ${finalFitness[0].count} entries`);
    console.log(`😴 Sleep tracking: ${finalSleep[0].count} entries`);
    console.log(`🍽️ Meal tracking: ${finalMeal[0].count} entries`);

    console.log('\n✅ Database check and sample data addition completed!');
    console.log('🎯 WellnessDetailsScreen should now be able to display tracking history data.');

  } catch (error) {
    console.error('❌ Error checking/adding tracking data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the script
checkAndAddTrackingData();
