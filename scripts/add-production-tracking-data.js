const mysql = require('mysql2/promise');

// Production database configuration
const dbConfig = {
  host: 'dash.doctorphc.id',
  user: 'root',
  password: 'pr1k1t1w', // Update with actual production password
  database: 'phc_dashboard',
  port: 3306
};

async function addProductionTrackingData() {
  let connection;
  
  try {
    console.log('🚀 Adding tracking data to PRODUCTION database...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to production database');

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log('📅 Adding data for dates:', { today, yesterday, twoDaysAgo });

    // Check if mobile_users table exists and has users
    const [users] = await connection.execute('SELECT id, name, email FROM mobile_users LIMIT 5');
    
    if (users.length === 0) {
      console.log('❌ No users found in production database');
      console.log('🔧 Creating test user first...');
      
      // Create a test user
      await connection.execute(`
        INSERT INTO mobile_users (name, email, phone, password, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, ['Test User', 'mobile@test.com', '08123456789', 'mobile123', 1]);
      
      console.log('✅ Test user created');
      
      // Get the created user
      const [newUsers] = await connection.execute('SELECT id FROM mobile_users WHERE email = ?', ['mobile@test.com']);
      const userId = newUsers[0].id;
      console.log('👤 Using new user ID:', userId);
    } else {
      const userId = users[0].id;
      console.log('👤 Using existing user ID:', userId);
      console.log('👤 User:', users[0].name, `(${users[0].email})`);
    }

    const userId = users.length > 0 ? users[0].id : (await connection.execute('SELECT id FROM mobile_users WHERE email = ?', ['mobile@test.com']))[0][0].id;

    // Check existing data
    console.log('\n🔍 Checking existing tracking data...');
    
    const [moodCount] = await connection.execute('SELECT COUNT(*) as count FROM mood_tracking WHERE user_id = ?', [userId]);
    const [waterCount] = await connection.execute('SELECT COUNT(*) as count FROM water_tracking WHERE user_id = ?', [userId]);
    const [fitnessCount] = await connection.execute('SELECT COUNT(*) as count FROM fitness_tracking WHERE user_id = ?', [userId]);
    const [sleepCount] = await connection.execute('SELECT COUNT(*) as count FROM sleep_tracking WHERE user_id = ?', [userId]);
    const [mealCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_tracking WHERE user_id = ?', [userId]);
    
    console.log(`😊 Mood tracking: ${moodCount[0].count} entries`);
    console.log(`💧 Water tracking: ${waterCount[0].count} entries`);
    console.log(`🏃‍♂️ Fitness tracking: ${fitnessCount[0].count} entries`);
    console.log(`😴 Sleep tracking: ${sleepCount[0].count} entries`);
    console.log(`🍽️ Meal tracking: ${mealCount[0].count} entries`);

    // Add mood tracking data
    console.log('\n1. Adding mood tracking data...');
    const moodData = [
      { date: today, mood: 'happy', score: 8, stress: 'low', energy: 'high', notes: 'Feeling great today!' },
      { date: yesterday, mood: 'neutral', score: 6, stress: 'low', energy: 'medium', notes: 'Normal day' },
      { date: twoDaysAgo, mood: 'sad', score: 4, stress: 'moderate', energy: 'low', notes: 'Feeling a bit down' }
    ];

    for (const mood of moodData) {
      await connection.execute(`
        INSERT INTO mood_tracking (
          user_id, mood_level, mood_score, stress_level, energy_level, 
          tracking_date, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [userId, mood.mood, mood.score, mood.stress, mood.energy, mood.date, mood.notes]);
    }
    console.log('✅ Mood data added (3 entries)');

    // Add water tracking data
    console.log('\n2. Adding water tracking data...');
    const waterData = [
      { date: today, amount: 500, time: '08:00:00', notes: 'Morning water' },
      { date: today, amount: 300, time: '12:00:00', notes: 'Lunch water' },
      { date: today, amount: 400, time: '16:00:00', notes: 'Afternoon water' },
      { date: yesterday, amount: 600, time: '08:00:00', notes: 'Morning water' },
      { date: yesterday, amount: 350, time: '12:00:00', notes: 'Lunch water' }
    ];

    for (const water of waterData) {
      await connection.execute(`
        INSERT INTO water_tracking (
          user_id, amount_ml, tracking_date, tracking_time, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [userId, water.amount, water.date, water.time, water.notes]);
    }
    console.log('✅ Water data added (5 entries)');

    // Add fitness tracking data
    console.log('\n3. Adding fitness tracking data...');
    const fitnessData = [
      { date: today, activity: 'Lari', duration: 30, calories: 200, steps: 5000, distance: 3.5, notes: 'Morning run' },
      { date: yesterday, activity: 'Berjalan', duration: 45, calories: 150, steps: 8000, distance: 5.0, notes: 'Evening walk' },
      { date: twoDaysAgo, activity: 'Bersepeda', duration: 60, calories: 300, steps: 0, distance: 15.0, notes: 'Cycling' }
    ];

    for (const fitness of fitnessData) {
      await connection.execute(`
        INSERT INTO fitness_tracking (
          user_id, activity_type, duration_minutes, calories_burned, 
          steps, distance_km, tracking_date, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [userId, fitness.activity, fitness.duration, fitness.calories, fitness.steps, fitness.distance, fitness.date, fitness.notes]);
    }
    console.log('✅ Fitness data added (3 entries)');

    // Add sleep tracking data
    console.log('\n4. Adding sleep tracking data...');
    const sleepData = [
      { date: today, bedtime: '22:00:00', wake: '06:30:00', quality: 'good', notes: 'Good sleep' },
      { date: yesterday, bedtime: '23:00:00', wake: '07:00:00', quality: 'fair', notes: 'Slept late' },
      { date: twoDaysAgo, bedtime: '21:30:00', wake: '06:00:00', quality: 'excellent', notes: 'Early to bed' }
    ];

    for (const sleep of sleepData) {
      const totalHours = calculateSleepHours(sleep.bedtime, sleep.wake);
      await connection.execute(`
        INSERT INTO sleep_tracking (
          user_id, sleep_date, bedtime, wake_time, total_hours, 
          quality_rating, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [userId, sleep.date, sleep.bedtime, sleep.wake, totalHours, sleep.quality, sleep.notes]);
    }
    console.log('✅ Sleep data added (3 entries)');

    // Add meal tracking data
    console.log('\n5. Adding meal tracking data...');
    
    // First, check if food_database has items
    const [foodItems] = await connection.execute('SELECT id, name FROM food_database LIMIT 3');
    
    if (foodItems.length === 0) {
      console.log('⚠️ No food items in database, creating sample foods...');
      
      // Create sample food items
      const sampleFoods = [
        { name: 'Nasi Putih', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        { name: 'Ayam Goreng', calories: 250, protein: 25, carbs: 0, fat: 15 },
        { name: 'Sayur Bayam', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 }
      ];

      for (const food of sampleFoods) {
        await connection.execute(`
          INSERT INTO food_database (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, created_at)
          VALUES (?, ?, ?, ?, ?, NOW())
        `, [food.name, food.calories, food.protein, food.carbs, food.fat]);
      }
      console.log('✅ Sample food items created');
      
      // Get the created food items
      const [newFoodItems] = await connection.execute('SELECT id FROM food_database LIMIT 3');
      foodItems.push(...newFoodItems);
    }

    // Add meal tracking entries
    const mealData = [
      { date: today, meal_type: 'sarapan', food_id: foodItems[0].id, quantity: 100, notes: 'Breakfast' },
      { date: today, meal_type: 'makan_siang', food_id: foodItems[1].id, quantity: 150, notes: 'Lunch' },
      { date: yesterday, meal_type: 'sarapan', food_id: foodItems[2].id, quantity: 80, notes: 'Breakfast' }
    ];

    for (const meal of mealData) {
      // Insert meal tracking
      const [mealResult] = await connection.execute(`
        INSERT INTO meal_tracking (
          user_id, meal_type, recorded_at, notes, created_at
        ) VALUES (?, ?, ?, ?, NOW())
      `, [userId, meal.meal_type, meal.date, meal.notes]);
      
      const mealId = mealResult.insertId;
      
      // Insert meal foods
      await connection.execute(`
        INSERT INTO meal_foods (
          meal_id, food_id, quantity_grams, created_at
        ) VALUES (?, ?, ?, NOW())
      `, [mealId, meal.food_id, meal.quantity]);
    }
    console.log('✅ Meal data added (3 entries)');

    // Add health data
    console.log('\n6. Adding health data...');
    const healthData = [
      { type: 'weight', value: '70.5', unit: 'kg', date: today },
      { type: 'height', value: '170', unit: 'cm', date: today },
      { type: 'blood_pressure', value: '120/80', unit: 'mmHg', date: yesterday }
    ];

    for (const health of healthData) {
      await connection.execute(`
        INSERT INTO health_data (
          user_id, data_type, value, unit, recorded_date, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [userId, health.type, health.value, health.unit, health.date]);
    }
    console.log('✅ Health data added (3 entries)');

    // Verify the data was added
    console.log('\n🔍 Verifying added data...');
    
    const [finalMoodCount] = await connection.execute('SELECT COUNT(*) as count FROM mood_tracking WHERE user_id = ?', [userId]);
    const [finalWaterCount] = await connection.execute('SELECT COUNT(*) as count FROM water_tracking WHERE user_id = ?', [userId]);
    const [finalFitnessCount] = await connection.execute('SELECT COUNT(*) as count FROM fitness_tracking WHERE user_id = ?', [userId]);
    const [finalSleepCount] = await connection.execute('SELECT COUNT(*) as count FROM sleep_tracking WHERE user_id = ?', [userId]);
    const [finalMealCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_tracking WHERE user_id = ?', [userId]);
    
    console.log(`😊 Mood tracking: ${finalMoodCount[0].count} entries`);
    console.log(`💧 Water tracking: ${finalWaterCount[0].count} entries`);
    console.log(`🏃‍♂️ Fitness tracking: ${finalFitnessCount[0].count} entries`);
    console.log(`😴 Sleep tracking: ${finalSleepCount[0].count} entries`);
    console.log(`🍽️ Meal tracking: ${finalMealCount[0].count} entries`);

    console.log('\n🎉 Production tracking data added successfully!');
    console.log(`📱 Mobile app should now show real data for user ID: ${userId}`);
    console.log(`🔗 Test API: https://dash.doctorphc.id/api/mobile/tracking/today-summary?user_id=${userId}`);

  } catch (error) {
    console.error('❌ Error adding production tracking data:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

function calculateSleepHours(bedtime, wakeTime) {
  const bed = new Date(`2000-01-01T${bedtime}`);
  const wake = new Date(`2000-01-01T${wakeTime}`);
  
  if (wake < bed) {
    wake.setDate(wake.getDate() + 1);
  }
  
  const diffMs = wake - bed;
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

// Run the script
addProductionTrackingData();
