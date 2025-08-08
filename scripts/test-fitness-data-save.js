const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_password_here', // Replace with your actual password
  database: 'phc_dashboard'
};

async function testFitnessDataSave() {
  let connection;
  
  try {
    console.log('🔍 Testing fitness data save functionality...');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check current schema
    console.log('\n📋 Checking database schema...');
    const [columns] = await connection.execute('DESCRIBE fitness_tracking');
    console.log('Available columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
    // Check if we have any existing data
    console.log('\n📊 Checking existing fitness data...');
    const [existingData] = await connection.execute('SELECT COUNT(*) as count FROM fitness_tracking');
    console.log(`Total fitness entries: ${existingData[0].count}`);
    
    if (existingData[0].count > 0) {
      const [sampleData] = await connection.execute(`
        SELECT id, user_id, activity_type, duration_minutes, exercise_minutes, 
               calories_burned, distance_km, steps, tracking_date, created_at
        FROM fitness_tracking 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      console.log('\n📝 Sample existing data:');
      sampleData.forEach((row, index) => {
        console.log(`Entry ${index + 1}:`);
        console.log(`  - ID: ${row.id}`);
        console.log(`  - Activity: ${row.activity_type}`);
        console.log(`  - Duration: ${row.duration_minutes} minutes`);
        console.log(`  - Exercise Minutes: ${row.exercise_minutes || 'NULL'}`);
        console.log(`  - Calories: ${row.calories_burned || 'NULL'}`);
        console.log(`  - Distance: ${row.distance_km || 'NULL'} km`);
        console.log(`  - Steps: ${row.steps || 'NULL'}`);
        console.log(`  - Date: ${row.tracking_date}`);
      });
    }
    
    // Test inserting new data
    console.log('\n🧪 Testing data insertion...');
    
    const testData = {
      user_id: 1, // Assuming user ID 1 exists
      activity_type: 'Walking',
      activity_name: 'Walking',
      duration_minutes: 30,
      exercise_minutes: 30,
      calories_burned: 150,
      distance_km: 2.5,
      steps: 3000,
      intensity: 'moderate',
      notes: 'Test entry from script',
      tracking_date: new Date().toISOString().split('T')[0],
      tracking_time: new Date().toTimeString().split(' ')[0]
    };
    
    // Check which columns exist to build proper INSERT statement
    const hasExerciseMinutes = columns.some(col => col.Field === 'exercise_minutes');
    const hasIntensity = columns.some(col => col.Field === 'intensity');
    const hasTrackingTime = columns.some(col => col.Field === 'tracking_time');
    
    let insertSQL, insertParams;
    
    if (hasExerciseMinutes) {
      insertSQL = `
        INSERT INTO fitness_tracking (
          user_id, activity_type, activity_name, duration_minutes, exercise_minutes,
          calories_burned, distance_km, steps, intensity, notes, tracking_date, tracking_time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      insertParams = [
        testData.user_id,
        testData.activity_type,
        testData.activity_name,
        testData.duration_minutes,
        testData.exercise_minutes,
        testData.calories_burned,
        testData.distance_km,
        testData.steps,
        testData.intensity,
        testData.notes,
        testData.tracking_date,
        testData.tracking_time
      ];
    } else {
      insertSQL = `
        INSERT INTO fitness_tracking (
          user_id, activity_type, activity_name, duration_minutes,
          calories_burned, distance_km, steps, intensity, notes, tracking_date, tracking_time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      insertParams = [
        testData.user_id,
        testData.activity_type,
        testData.activity_name,
        testData.duration_minutes,
        testData.calories_burned,
        testData.distance_km,
        testData.steps,
        testData.intensity,
        testData.notes,
        testData.tracking_date,
        testData.tracking_time
      ];
    }
    
    console.log('📝 Insert SQL:', insertSQL);
    console.log('📝 Insert Parameters:', insertParams);
    
    const [insertResult] = await connection.execute(insertSQL, insertParams);
    console.log('✅ Test data inserted successfully!');
    console.log(`   Insert ID: ${insertResult.insertId}`);
    
    // Verify the inserted data
    console.log('\n🔍 Verifying inserted data...');
    const [verificationData] = await connection.execute(`
      SELECT id, user_id, activity_type, duration_minutes, exercise_minutes, 
             calories_burned, distance_km, steps, tracking_date, created_at
      FROM fitness_tracking 
      WHERE id = ?
    `, [insertResult.insertId]);
    
    if (verificationData.length > 0) {
      const row = verificationData[0];
      console.log('✅ Data verification successful:');
      console.log(`  - ID: ${row.id}`);
      console.log(`  - Activity: ${row.activity_type}`);
      console.log(`  - Duration: ${row.duration_minutes} minutes`);
      console.log(`  - Exercise Minutes: ${row.exercise_minutes || 'NULL'}`);
      console.log(`  - Calories: ${row.calories_burned || 'NULL'}`);
      console.log(`  - Distance: ${row.distance_km || 'NULL'} km`);
      console.log(`  - Steps: ${row.steps || 'NULL'}`);
      console.log(`  - Date: ${row.tracking_date}`);
      
      // Check if minutes and distance are properly saved
      if (row.duration_minutes === 30 && row.distance_km === 2.5) {
        console.log('✅ Minutes and distance are properly saved!');
      } else {
        console.log('❌ Minutes or distance not saved correctly!');
        console.log(`   Expected duration: 30, got: ${row.duration_minutes}`);
        console.log(`   Expected distance: 2.5, got: ${row.distance_km}`);
      }
    } else {
      console.log('❌ Failed to verify inserted data!');
    }
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await connection.execute('DELETE FROM fitness_tracking WHERE id = ?', [insertResult.insertId]);
    console.log('✅ Test data cleaned up');
    
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
testFitnessDataSave().then(() => {
  console.log('\n🏁 Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
