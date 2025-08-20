import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'phc_dashboard',
  port: 3306
};

async function checkMoodData() {
  let connection;
  
  try {
    console.log('🔍 Checking mood data in database...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check if mood_tracking table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "mood_tracking"');
    if (tables.length === 0) {
      console.log('❌ mood_tracking table does not exist!');
      return;
    }
    console.log('✅ mood_tracking table exists');

    // Check table structure
    const [columns] = await connection.execute('DESCRIBE mood_tracking');
    console.log('\n📋 Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

    // Check if there are any users
    const [users] = await connection.execute('SELECT id, name, email FROM mobile_users LIMIT 5');
    console.log('\n👥 Users in database:');
    if (users.length === 0) {
      console.log('  ❌ No users found in mobile_users table');
    } else {
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
      });
    }

    // Check mood data for all users
    const [moodData] = await connection.execute(`
      SELECT 
        mt.id,
        mt.user_id,
        mt.mood_level,
        mt.stress_level,
        mt.tracking_date,
        mt.created_at,
        u.name as user_name
      FROM mood_tracking mt
      LEFT JOIN mobile_users u ON mt.user_id = u.id
      ORDER BY mt.tracking_date DESC
      LIMIT 10
    `);

    console.log('\n📊 Recent mood entries:');
    if (moodData.length === 0) {
      console.log('  ❌ No mood entries found in database');
    } else {
      moodData.forEach(entry => {
        console.log(`  - ID: ${entry.id}, User: ${entry.user_name || entry.user_id}, Mood: ${entry.mood_level}, Date: ${entry.tracking_date}, Created: ${entry.created_at}`);
      });
    }

    // Check today's date
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n📅 Today's date: ${today}`);

    // Check if there are any entries for today
    const [todayEntries] = await connection.execute(`
      SELECT 
        mt.id,
        mt.user_id,
        mt.mood_level,
        mt.stress_level,
        mt.tracking_date,
        u.name as user_name
      FROM mood_tracking mt
      LEFT JOIN mobile_users u ON mt.user_id = u.id
      WHERE mt.tracking_date = ?
    `, [today]);

    console.log(`\n🎯 Entries for today (${today}):`);
    if (todayEntries.length === 0) {
      console.log('  ❌ No entries found for today');
    } else {
      todayEntries.forEach(entry => {
        console.log(`  - ID: ${entry.id}, User: ${entry.user_name || entry.user_id}, Mood: ${entry.mood_level}`);
      });
    }

    // Check sample data dates
    const [sampleDates] = await connection.execute(`
      SELECT DISTINCT tracking_date 
      FROM mood_tracking 
      ORDER BY tracking_date DESC 
      LIMIT 5
    `);

    console.log('\n📅 Sample data dates:');
    sampleDates.forEach(date => {
      console.log(`  - ${date.tracking_date}`);
    });

  } catch (error) {
    console.error('❌ Error checking mood data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
checkMoodData();
