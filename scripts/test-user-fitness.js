const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
      host: 'dash.doctorphc.id',
  user: 'root',
  password: 'your_password_here', // Replace with your actual password
  database: 'phc_dashboard'
};

async function testUserFitness() {
  let connection;
  
  try {
    console.log('🔍 Testing fitness data for existing users...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Get all users with fitness data
    console.log('\n📊 Getting users with fitness data...');
    const [users] = await connection.execute(`
      SELECT DISTINCT user_id, COUNT(*) as entry_count
      FROM fitness_tracking 
      GROUP BY user_id 
      ORDER BY user_id
    `);
    
    console.log(`Found ${users.length} users with fitness data:`);
    users.forEach(user => {
      console.log(`  - User ID: ${user.user_id}, Entries: ${user.entry_count}`);
    });
    
    // Test each user's data
    for (const user of users) {
      console.log(`\n🔍 Testing User ID: ${user.user_id}`);
      
      const [userData] = await connection.execute(`
        SELECT id, activity_type, duration_minutes, exercise_minutes, 
               calories_burned, distance_km, steps, tracking_date, created_at
        FROM fitness_tracking 
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 3
      `, [user.user_id]);
      
      console.log(`  Found ${userData.length} entries for user ${user.user_id}:`);
      
      userData.forEach((entry, index) => {
        console.log(`\n    Entry ${index + 1}:`);
        console.log(`      - ID: ${entry.id}`);
        console.log(`      - Activity: ${entry.activity_type}`);
        console.log(`      - Duration: ${entry.duration_minutes} minutes`);
        console.log(`      - Exercise Minutes: ${entry.exercise_minutes || 'NULL'}`);
        console.log(`      - Calories: ${entry.calories_burned || 'NULL'}`);
        console.log(`      - Distance: ${entry.distance_km || 'NULL'} km`);
        console.log(`      - Steps: ${entry.steps || 'NULL'}`);
        console.log(`      - Date: ${entry.tracking_date}`);
        
        // Test distance display logic
        const distance = entry.distance_km;
        console.log(`      - Distance analysis:`);
        console.log(`        * Value: ${distance}`);
        console.log(`        * Type: ${typeof distance}`);
        console.log(`        * > 0: ${distance > 0}`);
        console.log(`        * === 0: ${distance === 0}`);
        console.log(`        * === null: ${distance === null}`);
        console.log(`        * === undefined: ${distance === undefined}`);
        
        if (typeof distance === 'number' && distance > 0) {
          console.log(`        ✅ Would display: ${distance.toFixed(1)} km`);
        } else if (distance === 0) {
          console.log(`        ⚠️ Would display: 0.0 km (actual: 0)`);
        } else {
          console.log(`        ❌ Would display: 0.0 km (actual: ${distance})`);
        }
      });
    }
    
    // Check for entries with distance > 0
    console.log('\n🔍 Checking entries with distance > 0...');
    const [distanceEntries] = await connection.execute(`
      SELECT user_id, id, activity_type, distance_km, tracking_date
      FROM fitness_tracking 
      WHERE distance_km > 0
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${distanceEntries.length} entries with distance > 0:`);
    distanceEntries.forEach((entry, index) => {
      console.log(`  ${index + 1}. User ${entry.user_id}, ID ${entry.id}: ${entry.distance_km}km (${entry.activity_type})`);
    });
    
    // Check for entries with distance = 0 or NULL
    console.log('\n🔍 Checking entries with distance = 0 or NULL...');
    const [zeroDistanceEntries] = await connection.execute(`
      SELECT user_id, id, activity_type, distance_km, tracking_date
      FROM fitness_tracking 
      WHERE distance_km = 0 OR distance_km IS NULL
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${zeroDistanceEntries.length} entries with distance = 0 or NULL:`);
    zeroDistanceEntries.forEach((entry, index) => {
      console.log(`  ${index + 1}. User ${entry.user_id}, ID ${entry.id}: ${entry.distance_km} (${entry.activity_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testUserFitness().then(() => {
  console.log('\n🏁 Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
