const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function verifyTrackingDataDisplay() {
  let connection;
  
  try {
    console.log('🔍 Verifying tracking data for WellnessDetailsScreen display...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Checking data for date:', today);

    // Get first user ID
    const [users] = await connection.execute('SELECT id FROM mobile_users LIMIT 1');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const userId = users[0].id;
    console.log('👤 Using user ID:', userId);

    console.log('\n📊 Verifying data structure for each tracking type...');

    // 1. Verify Mood Tracking Data Structure
    console.log('\n😊 Mood Tracking Data:');
    const [moodData] = await connection.execute(
      'SELECT * FROM mood_tracking WHERE user_id = ? AND tracking_date = ? ORDER BY created_at DESC',
      [userId, today]
    );
    
    if (moodData.length > 0) {
      console.log(`✅ Found ${moodData.length} mood entries for today`);
      console.log('📋 Sample mood entry structure:');
      console.log(JSON.stringify(moodData[0], null, 2));
    } else {
      console.log('⚠️ No mood data for today, checking other dates...');
      const [recentMood] = await connection.execute(
        'SELECT * FROM mood_tracking WHERE user_id = ? ORDER BY tracking_date DESC LIMIT 1',
        [userId]
      );
      if (recentMood.length > 0) {
        console.log(`📅 Recent mood entry from: ${recentMood[0].tracking_date}`);
        console.log(JSON.stringify(recentMood[0], null, 2));
      }
    }

    // 2. Verify Water Tracking Data Structure
    console.log('\n💧 Water Tracking Data:');
    const [waterData] = await connection.execute(
      'SELECT * FROM water_tracking WHERE user_id = ? AND tracking_date = ? ORDER BY tracking_time ASC',
      [userId, today]
    );
    
    if (waterData.length > 0) {
      console.log(`✅ Found ${waterData.length} water entries for today`);
      console.log('📋 Sample water entry structure:');
      console.log(JSON.stringify(waterData[0], null, 2));
    } else {
      console.log('⚠️ No water data for today, checking other dates...');
      const [recentWater] = await connection.execute(
        'SELECT * FROM water_tracking WHERE user_id = ? ORDER BY tracking_date DESC LIMIT 1',
        [userId]
      );
      if (recentWater.length > 0) {
        console.log(`📅 Recent water entry from: ${recentWater[0].tracking_date}`);
        console.log(JSON.stringify(recentWater[0], null, 2));
      }
    }

    // 3. Verify Fitness Tracking Data Structure
    console.log('\n🏃‍♂️ Fitness Tracking Data:');
    const [fitnessData] = await connection.execute(
      'SELECT * FROM fitness_tracking WHERE user_id = ? AND tracking_date = ? ORDER BY tracking_time ASC',
      [userId, today]
    );
    
    if (fitnessData.length > 0) {
      console.log(`✅ Found ${fitnessData.length} fitness entries for today`);
      console.log('📋 Sample fitness entry structure:');
      console.log(JSON.stringify(fitnessData[0], null, 2));
    } else {
      console.log('⚠️ No fitness data for today, checking other dates...');
      const [recentFitness] = await connection.execute(
        'SELECT * FROM fitness_tracking WHERE user_id = ? ORDER BY tracking_date DESC LIMIT 1',
        [userId]
      );
      if (recentFitness.length > 0) {
        console.log(`📅 Recent fitness entry from: ${recentFitness[0].tracking_date}`);
        console.log(JSON.stringify(recentFitness[0], null, 2));
      }
    }

    // 4. Verify Sleep Tracking Data Structure
    console.log('\n😴 Sleep Tracking Data:');
    const [sleepData] = await connection.execute(
      'SELECT * FROM sleep_tracking WHERE user_id = ? AND sleep_date = ?',
      [userId, today]
    );
    
    if (sleepData.length > 0) {
      console.log(`✅ Found ${sleepData.length} sleep entries for today`);
      console.log('📋 Sample sleep entry structure:');
      console.log(JSON.stringify(sleepData[0], null, 2));
    } else {
      console.log('⚠️ No sleep data for today, checking other dates...');
      const [recentSleep] = await connection.execute(
        'SELECT * FROM sleep_tracking WHERE user_id = ? ORDER BY sleep_date DESC LIMIT 1',
        [userId]
      );
      if (recentSleep.length > 0) {
        console.log(`📅 Recent sleep entry from: ${recentSleep[0].sleep_date}`);
        console.log(JSON.stringify(recentSleep[0], null, 2));
      }
    }

    // 5. Verify Meal Tracking Data Structure
    console.log('\n🍽️ Meal Tracking Data:');
    const [mealData] = await connection.execute(
      'SELECT * FROM meal_tracking WHERE user_id = ? AND DATE(recorded_at) = ? ORDER BY recorded_at ASC',
      [userId, today]
    );
    
    if (mealData.length > 0) {
      console.log(`✅ Found ${mealData.length} meal entries for today`);
      console.log('📋 Sample meal entry structure:');
      console.log(JSON.stringify(mealData[0], null, 2));
    } else {
      console.log('⚠️ No meal data for today, checking other dates...');
      const [recentMeal] = await connection.execute(
        'SELECT * FROM meal_tracking WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1',
        [userId]
      );
      if (recentMeal.length > 0) {
        console.log(`📅 Recent meal entry from: ${recentMeal[0].recorded_at.split(' ')[0]}`);
        console.log(JSON.stringify(recentMeal[0], null, 2));
      }
    }

    // Test API-like queries to simulate what WellnessDetailsScreen would fetch
    console.log('\n🔧 Testing API-like queries for WellnessDetailsScreen...');

    // Test mood history query
    console.log('\n😊 Testing mood history query:');
    const [moodHistory] = await connection.execute(
      'SELECT * FROM mood_tracking WHERE user_id = ? ORDER BY tracking_date DESC LIMIT 10',
      [userId]
    );
    console.log(`📊 Found ${moodHistory.length} mood history entries`);

    // Test water history query
    console.log('\n💧 Testing water history query:');
    const [waterHistory] = await connection.execute(
      'SELECT * FROM water_tracking WHERE user_id = ? ORDER BY tracking_date DESC, tracking_time ASC LIMIT 10',
      [userId]
    );
    console.log(`📊 Found ${waterHistory.length} water history entries`);

    // Test fitness history query
    console.log('\n🏃‍♂️ Testing fitness history query:');
    const [fitnessHistory] = await connection.execute(
      'SELECT * FROM fitness_tracking WHERE user_id = ? ORDER BY tracking_date DESC, tracking_time ASC LIMIT 10',
      [userId]
    );
    console.log(`📊 Found ${fitnessHistory.length} fitness history entries`);

    // Test sleep history query
    console.log('\n😴 Testing sleep history query:');
    const [sleepHistory] = await connection.execute(
      'SELECT * FROM sleep_tracking WHERE user_id = ? ORDER BY sleep_date DESC LIMIT 10',
      [userId]
    );
    console.log(`📊 Found ${sleepHistory.length} sleep history entries`);

    // Test meal history query
    console.log('\n🍽️ Testing meal history query:');
    const [mealHistory] = await connection.execute(
      'SELECT * FROM meal_tracking WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 10',
      [userId]
    );
    console.log(`📊 Found ${mealHistory.length} meal history entries`);

    console.log('\n✅ Data verification completed!');
    console.log('🎯 WellnessDetailsScreen should be able to display all tracking data correctly.');
    console.log('\n📝 Summary:');
    console.log(`- Mood tracking: ${moodHistory.length} entries available`);
    console.log(`- Water tracking: ${waterHistory.length} entries available`);
    console.log(`- Fitness tracking: ${fitnessHistory.length} entries available`);
    console.log(`- Sleep tracking: ${sleepHistory.length} entries available`);
    console.log(`- Meal tracking: ${mealHistory.length} entries available`);

  } catch (error) {
    console.error('❌ Error verifying tracking data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the script
verifyTrackingDataDisplay();
