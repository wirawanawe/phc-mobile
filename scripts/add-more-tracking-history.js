const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function addMoreTrackingHistory() {
  let connection;
  
  try {
    console.log('📈 Adding more tracking history data...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Get first user ID
    const [users] = await connection.execute('SELECT id FROM mobile_users LIMIT 1');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const userId = users[0].id;
    console.log('👤 Using user ID:', userId);

    // Generate dates for the last 7 days
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    console.log('📅 Adding data for dates:', dates);

    // Add Mood Tracking History
    console.log('\n😊 Adding mood tracking history...');
    const moodEntries = [
      { mood_level: 'very_happy', mood_score: 10, stress_level: 'low', energy_level: 'very_high', sleep_quality: 'excellent', notes: 'Amazing day! Completed all goals!' },
      { mood_level: 'happy', mood_score: 8, stress_level: 'low', energy_level: 'high', sleep_quality: 'good', notes: 'Great workout session' },
      { mood_level: 'neutral', mood_score: 5, stress_level: 'moderate', energy_level: 'moderate', sleep_quality: 'fair', notes: 'Regular work day' },
      { mood_level: 'sad', mood_score: 3, stress_level: 'high', energy_level: 'low', sleep_quality: 'poor', notes: 'Feeling tired today' },
      { mood_level: 'happy', mood_score: 7, stress_level: 'low', energy_level: 'high', sleep_quality: 'good', notes: 'Good day with family' },
      { mood_level: 'neutral', mood_score: 6, stress_level: 'moderate', energy_level: 'moderate', sleep_quality: 'fair', notes: 'Busy but productive' },
      { mood_level: 'very_happy', mood_score: 9, stress_level: 'low', energy_level: 'very_high', sleep_quality: 'excellent', notes: 'Weekend vibes!' }
    ];

    for (let i = 0; i < dates.length; i++) {
      const mood = moodEntries[i];
      try {
        await connection.execute(
          'INSERT INTO mood_tracking (user_id, mood_level, mood_score, stress_level, energy_level, sleep_quality, tracking_date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [userId, mood.mood_level, mood.mood_score, mood.stress_level, mood.energy_level, mood.sleep_quality, dates[i], mood.notes]
        );
        console.log(`✅ Added mood entry for ${dates[i]}: ${mood.mood_level}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⏭️ Skipping duplicate mood entry for ${dates[i]}`);
        } else {
          console.error(`❌ Error adding mood entry:`, error.message);
        }
      }
    }

    // Add Water Tracking History
    console.log('\n💧 Adding water tracking history...');
    const waterEntries = [
      { amount_ml: 500, time: '08:00:00', notes: 'Morning water' },
      { amount_ml: 300, time: '10:30:00', notes: 'Mid-morning' },
      { amount_ml: 400, time: '12:00:00', notes: 'Lunch time' },
      { amount_ml: 250, time: '14:30:00', notes: 'Afternoon' },
      { amount_ml: 350, time: '16:00:00', notes: 'Late afternoon' },
      { amount_ml: 200, time: '18:00:00', notes: 'Evening' },
      { amount_ml: 300, time: '20:00:00', notes: 'Night' }
    ];

    for (let i = 0; i < dates.length; i++) {
      // Add 3-5 water entries per day
      const entriesPerDay = Math.floor(Math.random() * 3) + 3; // 3-5 entries
      for (let j = 0; j < entriesPerDay; j++) {
        const water = waterEntries[j % waterEntries.length];
        try {
          await connection.execute(
            'INSERT INTO water_tracking (user_id, amount_ml, tracking_date, tracking_time, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [userId, water.amount_ml, dates[i], water.time, water.notes]
          );
          console.log(`✅ Added water entry for ${dates[i]} at ${water.time}: ${water.amount_ml}ml`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⏭️ Skipping duplicate water entry for ${dates[i]}`);
          } else {
            console.error(`❌ Error adding water entry:`, error.message);
          }
        }
      }
    }

    // Add Fitness Tracking History
    console.log('\n🏃‍♂️ Adding fitness tracking history...');
    const fitnessActivities = [
      { activity_type: 'Running', activity_name: 'Morning Run', duration_minutes: 30, calories_burned: 300, distance_km: 5.0, intensity: 'moderate', time: '06:00:00', notes: 'Great morning run!' },
      { activity_type: 'Walking', activity_name: 'Evening Walk', duration_minutes: 45, calories_burned: 180, distance_km: 3.2, intensity: 'low', time: '18:00:00', notes: 'Relaxing evening walk' },
      { activity_type: 'Cycling', activity_name: 'Bike Ride', duration_minutes: 60, calories_burned: 400, distance_km: 15.0, intensity: 'high', time: '16:00:00', notes: 'Intense cycling session' },
      { activity_type: 'Weight Lifting', activity_name: 'Gym Workout', duration_minutes: 45, calories_burned: 250, distance_km: null, intensity: 'moderate', time: '17:00:00', notes: 'Strength training' },
      { activity_type: 'Yoga', activity_name: 'Morning Yoga', duration_minutes: 30, calories_burned: 120, distance_km: null, intensity: 'low', time: '07:00:00', notes: 'Peaceful yoga session' },
      { activity_type: 'Swimming', activity_name: 'Pool Swim', duration_minutes: 40, calories_burned: 320, distance_km: 1.5, intensity: 'moderate', time: '15:00:00', notes: 'Refreshing swim' },
      { activity_type: 'HIIT', activity_name: 'High Intensity Training', duration_minutes: 25, calories_burned: 280, distance_km: null, intensity: 'very_high', time: '19:00:00', notes: 'Intense workout!' }
    ];

    for (let i = 0; i < dates.length; i++) {
      // Add 1-2 fitness activities per day
      const activitiesPerDay = Math.floor(Math.random() * 2) + 1; // 1-2 activities
      for (let j = 0; j < activitiesPerDay; j++) {
        const fitness = fitnessActivities[(i + j) % fitnessActivities.length];
        try {
          await connection.execute(
            'INSERT INTO fitness_tracking (user_id, activity_type, activity_name, duration_minutes, calories_burned, distance_km, intensity, tracking_date, tracking_time, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [userId, fitness.activity_type, fitness.activity_name, fitness.duration_minutes, fitness.calories_burned, fitness.distance_km, fitness.intensity, dates[i], fitness.time, fitness.notes]
          );
          console.log(`✅ Added fitness entry for ${dates[i]}: ${fitness.activity_type}`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⏭️ Skipping duplicate fitness entry for ${dates[i]}`);
          } else {
            console.error(`❌ Error adding fitness entry:`, error.message);
          }
        }
      }
    }

    // Add Sleep Tracking History
    console.log('\n😴 Adding sleep tracking history...');
    const sleepEntries = [
      { bedtime: '22:30:00', wake_time: '06:00:00', sleep_duration_minutes: 450, sleep_quality: 'good', notes: 'Good night sleep' },
      { bedtime: '23:00:00', wake_time: '06:30:00', sleep_duration_minutes: 450, sleep_quality: 'excellent', notes: 'Excellent sleep quality' },
      { bedtime: '22:00:00', wake_time: '05:30:00', sleep_duration_minutes: 450, sleep_quality: 'fair', notes: 'Woke up early' },
      { bedtime: '23:30:00', wake_time: '07:00:00', sleep_duration_minutes: 450, sleep_quality: 'good', notes: 'Restful sleep' },
      { bedtime: '22:15:00', wake_time: '06:15:00', sleep_duration_minutes: 480, sleep_quality: 'excellent', notes: 'Perfect sleep cycle' },
      { bedtime: '00:00:00', wake_time: '06:00:00', sleep_duration_minutes: 360, sleep_quality: 'poor', notes: 'Late to bed' },
      { bedtime: '21:30:00', wake_time: '05:30:00', sleep_duration_minutes: 480, sleep_quality: 'excellent', notes: 'Early to bed, early to rise' }
    ];

    for (let i = 0; i < dates.length; i++) {
      const sleep = sleepEntries[i];
      try {
        await connection.execute(
          'INSERT INTO sleep_tracking (user_id, sleep_date, bedtime, wake_time, sleep_duration_minutes, sleep_quality, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [userId, dates[i], sleep.bedtime, sleep.wake_time, sleep.sleep_duration_minutes, sleep.sleep_quality, sleep.notes]
        );
        console.log(`✅ Added sleep entry for ${dates[i]}: ${sleep.sleep_quality} quality`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⏭️ Skipping duplicate sleep entry for ${dates[i]}`);
        } else {
          console.error(`❌ Error adding sleep entry:`, error.message);
        }
      }
    }

    // Add Meal Tracking History
    console.log('\n🍽️ Adding meal tracking history...');
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealNotes = [
      'Healthy breakfast with oatmeal and fruits',
      'Protein-rich lunch with chicken and vegetables',
      'Light dinner with salmon and quinoa',
      'Quick snack with nuts and yogurt',
      'Balanced breakfast with eggs and toast',
      'Vegetarian lunch with lentils and rice',
      'Grilled fish dinner with sweet potato'
    ];

    for (let i = 0; i < dates.length; i++) {
      // Add 2-4 meals per day
      const mealsPerDay = Math.floor(Math.random() * 3) + 2; // 2-4 meals
      for (let j = 0; j < mealsPerDay; j++) {
        const mealType = mealTypes[j % mealTypes.length];
        const mealTime = j === 0 ? '07:00:00' : j === 1 ? '12:00:00' : j === 2 ? '19:00:00' : '15:00:00';
        const note = mealNotes[(i + j) % mealNotes.length];
        
        try {
          await connection.execute(
            'INSERT INTO meal_tracking (user_id, meal_type, recorded_at, notes, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [userId, mealType, `${dates[i]} ${mealTime}`, note]
          );
          console.log(`✅ Added meal entry for ${dates[i]}: ${mealType}`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⏭️ Skipping duplicate meal entry for ${dates[i]}`);
          } else {
            console.error(`❌ Error adding meal entry:`, error.message);
          }
        }
      }
    }

    // Final summary
    console.log('\n📊 Final tracking history summary:');
    
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

    console.log('\n✅ Tracking history data addition completed!');
    console.log('🎯 WellnessDetailsScreen now has comprehensive tracking history data to display.');

  } catch (error) {
    console.error('❌ Error adding tracking history:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the script
addMoreTrackingHistory();
