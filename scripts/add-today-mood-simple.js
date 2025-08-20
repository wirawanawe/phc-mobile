import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'phc_dashboard',
  port: 3306
};

async function addTodayMood() {
  let connection;
  
  try {
    console.log('🔧 Adding mood entry for today...\n');
    
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

    // Check if mood entry already exists for today
    const [existingMood] = await connection.execute(
      'SELECT id FROM mood_tracking WHERE user_id = ? AND tracking_date = ?',
      [userId, today]
    );

    if (existingMood.length > 0) {
      console.log('✅ Mood entry already exists for today');
      console.log('📊 Existing mood entry ID:', existingMood[0].id);
    } else {
      // Add mood entry for today
      const [result] = await connection.execute(
        'INSERT INTO mood_tracking (user_id, mood_level, stress_level, energy_level, sleep_quality, tracking_date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [userId, 'happy', 'low', 'high', 'good', today, 'Test mood entry for button testing']
      );
      
      console.log('✅ Added mood entry for today');
      console.log('📊 New mood entry ID:', result.insertId);
    }

    // Show all mood entries for this user
    const [allMoods] = await connection.execute(
      'SELECT id, mood_level, tracking_date, created_at FROM mood_tracking WHERE user_id = ? ORDER BY tracking_date DESC LIMIT 5',
      [userId]
    );

    console.log('\n📋 Recent mood entries:');
    allMoods.forEach(mood => {
      console.log(`  - ID: ${mood.id}, Mood: ${mood.mood_level}, Date: ${mood.tracking_date}`);
    });

  } catch (error) {
    console.error('❌ Error adding today mood:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
addTodayMood();
