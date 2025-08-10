const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api/mobile';
const TEST_USER_ID = 1; // Assuming user ID 1 exists

// Mock authentication token (you may need to get a real token)
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzU0NTcyMzk3fQ.example';

async function testFitnessDistance() {
  console.log('🧪 Testing fitness distance functionality...\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MOCK_TOKEN}`
  };

  try {
    // Test 1: POST new fitness entry with distance
    console.log('➕ Test 1: POST /tracking/fitness with distance');
    const testFitnessData = {
      user_id: TEST_USER_ID,
      activity_type: 'Walking',
      activity_name: 'Walking',
      duration_minutes: 30,
      exercise_minutes: 30,
      calories_burned: 150,
      distance_km: 3.5, // Explicit distance value
      steps: 4000,
      intensity: 'moderate',
      notes: 'Test entry with distance from script',
      tracking_date: new Date().toISOString().split('T')[0],
      tracking_time: new Date().toTimeString().split(' ')[0]
    };

    console.log('📝 Test data:', JSON.stringify(testFitnessData, null, 2));

    try {
      const response = await axios.post(`${BASE_URL}/tracking/fitness`, testFitnessData, { headers });
      console.log('✅ POST /tracking/fitness - Success');
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      
      const createdEntryId = response.data.data?.id;
      
      if (createdEntryId) {
        console.log(`   Created entry ID: ${createdEntryId}`);
        
        // Test 2: GET the created entry to verify distance
        console.log('\n📋 Test 2: GET /tracking/fitness/' + createdEntryId);
        try {
          const getResponse = await axios.get(`${BASE_URL}/tracking/fitness/${createdEntryId}`, { headers });
          console.log('✅ GET /tracking/fitness/' + createdEntryId + ' - Success');
          console.log(`   Response: ${JSON.stringify(getResponse.data, null, 2)}`);
          
          const entryData = getResponse.data.data;
          if (entryData) {
            console.log('🔍 Entry data analysis:');
            console.log(`   - Distance field: ${entryData.distance_km}`);
            console.log(`   - Distance type: ${typeof entryData.distance_km}`);
            console.log(`   - Distance > 0: ${entryData.distance_km > 0}`);
            console.log(`   - Expected: 3.5, Got: ${entryData.distance_km}`);
            
            if (entryData.distance_km === 3.5) {
              console.log('✅ Distance saved and retrieved correctly!');
            } else {
              console.log('❌ Distance not saved/retrieved correctly!');
            }
          }
          
        } catch (error) {
          console.log('❌ GET /tracking/fitness/' + createdEntryId + ' - Failed');
          console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }
        
        // Test 3: GET all fitness entries to see if distance appears
        console.log('\n📋 Test 3: GET /tracking/fitness (all entries)');
        try {
          const getAllResponse = await axios.get(`${BASE_URL}/tracking/fitness`, { headers });
          console.log('✅ GET /tracking/fitness - Success');
          
          const allEntries = getAllResponse.data.data;
          console.log(`   Found ${allEntries.length} total entries`);
          
          // Find our test entry
          const testEntry = allEntries.find(entry => entry.id === createdEntryId);
          if (testEntry) {
            console.log('🔍 Test entry in list:');
            console.log(`   - ID: ${testEntry.id}`);
            console.log(`   - Activity: ${testEntry.activity_type}`);
            console.log(`   - Distance: ${testEntry.distance_km}`);
            console.log(`   - Distance type: ${typeof testEntry.distance_km}`);
            
            if (testEntry.distance_km === 3.5) {
              console.log('✅ Distance appears correctly in list!');
            } else {
              console.log('❌ Distance not appearing correctly in list!');
            }
          } else {
            console.log('❌ Test entry not found in list!');
          }
          
        } catch (error) {
          console.log('❌ GET /tracking/fitness - Failed');
          console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }
        
        // Test 4: DELETE the test entry
        console.log('\n🗑️ Test 4: DELETE /tracking/fitness/' + createdEntryId);
        try {
          const deleteResponse = await axios.delete(`${BASE_URL}/tracking/fitness/${createdEntryId}`, { headers });
          console.log('✅ DELETE /tracking/fitness/' + createdEntryId + ' - Success');
          console.log(`   Response: ${JSON.stringify(deleteResponse.data, null, 2)}`);
        } catch (error) {
          console.log('❌ DELETE /tracking/fitness/' + createdEntryId + ' - Failed');
          console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }
      }
      
    } catch (error) {
      console.log('❌ POST /tracking/fitness - Failed');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Test database directly
async function testDatabaseDistance() {
  console.log('\n🔍 Testing database distance directly...\n');
  
  try {
    const mysql = require('mysql2/promise');
    
    const dbConfig = {
      host: 'localhost',
      user: 'root',
      password: 'your_password_here', // Replace with your actual password
      database: 'phc_dashboard'
    };

    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful');

    // Insert test data directly
    const testData = {
      user_id: 1,
      activity_type: 'Running',
      activity_name: 'Running',
      duration_minutes: 45,
      exercise_minutes: 45,
      calories_burned: 300,
      distance_km: 5.2,
      steps: 6000,
      intensity: 'high',
      notes: 'Direct database test',
      tracking_date: new Date().toISOString().split('T')[0],
      tracking_time: new Date().toTimeString().split(' ')[0]
    };

    const insertSQL = `
      INSERT INTO fitness_tracking (
        user_id, activity_type, activity_name, duration_minutes, exercise_minutes,
        calories_burned, distance_km, steps, intensity, notes, tracking_date, tracking_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const insertParams = [
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

    console.log('📝 Inserting test data directly to database...');
    const [insertResult] = await connection.execute(insertSQL, insertParams);
    console.log('✅ Test data inserted, ID:', insertResult.insertId);

    // Retrieve the data
    const [retrievedData] = await connection.execute(`
      SELECT id, user_id, activity_type, duration_minutes, exercise_minutes, 
             calories_burned, distance_km, steps, tracking_date, created_at
      FROM fitness_tracking 
      WHERE id = ?
    `, [insertResult.insertId]);

    if (retrievedData.length > 0) {
      const row = retrievedData[0];
      console.log('🔍 Retrieved data:');
      console.log(`   - ID: ${row.id}`);
      console.log(`   - Activity: ${row.activity_type}`);
      console.log(`   - Distance: ${row.distance_km}`);
      console.log(`   - Distance type: ${typeof row.distance_km}`);
      console.log(`   - Expected: 5.2, Got: ${row.distance_km}`);
      
      if (row.distance_km === 5.2) {
        console.log('✅ Distance saved correctly in database!');
      } else {
        console.log('❌ Distance not saved correctly in database!');
      }
    }

    // Clean up
    await connection.execute('DELETE FROM fitness_tracking WHERE id = ?', [insertResult.insertId]);
    console.log('✅ Test data cleaned up');

    await connection.end();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting fitness distance tests...\n');
  
  await testFitnessDistance();
  await testDatabaseDistance();
  
  console.log('\n🏁 Test suite completed!');
  console.log('\n📝 Summary:');
  console.log('- Check if distance is saved correctly in database');
  console.log('- Check if distance is retrieved correctly via API');
  console.log('- Check if distance appears correctly in frontend');
}

runTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
