const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_password_here', // Replace with your actual password
  database: 'phc_dashboard'
};

async function testDistanceDisplay() {
  let connection;
  
  try {
    console.log('🔍 Testing distance display with existing data...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Get existing fitness data
    console.log('\n📊 Getting existing fitness data...');
    const [existingData] = await connection.execute(`
      SELECT id, user_id, activity_type, duration_minutes, exercise_minutes, 
             calories_burned, distance_km, steps, tracking_date, created_at
      FROM fitness_tracking 
      WHERE distance_km IS NOT NULL AND distance_km > 0
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(`Found ${existingData.length} entries with distance > 0:`);
    existingData.forEach((entry, index) => {
      console.log(`\nEntry ${index + 1}:`);
      console.log(`  - ID: ${entry.id}`);
      console.log(`  - Activity: ${entry.activity_type}`);
      console.log(`  - Distance: ${entry.distance_km} km`);
      console.log(`  - Distance type: ${typeof entry.distance_km}`);
      console.log(`  - Distance > 0: ${entry.distance_km > 0}`);
      console.log(`  - Distance === 0: ${entry.distance_km === 0}`);
      console.log(`  - Distance === null: ${entry.distance_km === null}`);
      console.log(`  - Distance === undefined: ${entry.distance_km === undefined}`);
      
      // Test frontend display logic
      const distance = entry.distance_km;
      let displayValue;
      
      if (typeof distance === 'number' && distance > 0) {
        displayValue = distance.toFixed(1);
        console.log(`  ✅ Frontend would display: ${displayValue} km`);
      } else if (distance === 0) {
        displayValue = '0.0';
        console.log(`  ⚠️ Frontend would display: ${displayValue} km`);
      } else {
        displayValue = '0.0';
        console.log(`  ❌ Frontend would display: ${displayValue} km (should be ${distance})`);
      }
    });
    
    // Test with different data types
    console.log('\n🧪 Testing with different data types...');
    
    const testCases = [
      { value: 5.0, type: 'number' },
      { value: 3.5, type: 'number' },
      { value: 0, type: 'number' },
      { value: null, type: 'null' },
      { value: undefined, type: 'undefined' },
      { value: '5.0', type: 'string' },
      { value: '', type: 'empty string' }
    ];
    
    testCases.forEach((testCase, index) => {
      const distance = testCase.value;
      console.log(`\nTest Case ${index + 1}: ${testCase.type} = ${distance}`);
      console.log(`  - Type: ${typeof distance}`);
      console.log(`  - Value: ${distance}`);
      console.log(`  - > 0: ${distance > 0}`);
      console.log(`  - === 0: ${distance === 0}`);
      console.log(`  - === null: ${distance === null}`);
      console.log(`  - === undefined: ${distance === undefined}`);
      
      let displayValue;
      if (typeof distance === 'number' && distance > 0) {
        displayValue = distance.toFixed(1);
        console.log(`  ✅ Display: ${displayValue} km`);
      } else if (distance === 0) {
        displayValue = '0.0';
        console.log(`  ⚠️ Display: ${displayValue} km`);
      } else {
        displayValue = '0.0';
        console.log(`  ❌ Display: ${displayValue} km (should be ${distance})`);
      }
    });
    
    // Check if there are any entries with distance = 0 or NULL
    console.log('\n🔍 Checking entries with distance = 0 or NULL...');
    const [zeroDistanceData] = await connection.execute(`
      SELECT id, user_id, activity_type, distance_km, tracking_date, created_at
      FROM fitness_tracking 
      WHERE distance_km = 0 OR distance_km IS NULL
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(`Found ${zeroDistanceData.length} entries with distance = 0 or NULL:`);
    zeroDistanceData.forEach((entry, index) => {
      console.log(`  Entry ${index + 1}: ID=${entry.id}, Activity=${entry.activity_type}, Distance=${entry.distance_km}`);
    });
    
    // Check table structure
    console.log('\n📋 Checking table structure...');
    const [columns] = await connection.execute('DESCRIBE fitness_tracking');
    const distanceColumn = columns.find(col => col.Field === 'distance_km');
    if (distanceColumn) {
      console.log('Distance column info:');
      console.log(`  - Field: ${distanceColumn.Field}`);
      console.log(`  - Type: ${distanceColumn.Type}`);
      console.log(`  - Null: ${distanceColumn.Null}`);
      console.log(`  - Default: ${distanceColumn.Default}`);
    }
    
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
testDistanceDisplay().then(() => {
  console.log('\n🏁 Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
