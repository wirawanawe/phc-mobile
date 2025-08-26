const axios = require('axios');

// Test configuration
const BASE_URL = 'https://dash.doctorphc.id/api/mobile';
const TEST_USER_ID = 1; // Assuming user ID 1 exists

// Mock authentication token (you may need to get a real token)
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzU0NTcyMzk3fQ.example';

async function testFitnessEndpoints() {
  console.log('🧪 Testing fitness tracking endpoints...\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MOCK_TOKEN}`
  };

  try {
    // Test 1: GET fitness history
    console.log('📋 Test 1: GET /tracking/fitness');
    try {
      const response = await axios.get(`${BASE_URL}/tracking/fitness`, { headers });
      console.log('✅ GET /tracking/fitness - Success');
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      console.log('❌ GET /tracking/fitness - Failed');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: GET today's fitness
    console.log('📊 Test 2: GET /tracking/fitness/today');
    try {
      const response = await axios.get(`${BASE_URL}/tracking/fitness/today`, { headers });
      console.log('✅ GET /tracking/fitness/today - Success');
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      console.log('❌ GET /tracking/fitness/today - Failed');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: POST new fitness entry
    console.log('➕ Test 3: POST /tracking/fitness');
    const testFitnessData = {
      user_id: TEST_USER_ID,
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

    try {
      const response = await axios.post(`${BASE_URL}/tracking/fitness`, testFitnessData, { headers });
      console.log('✅ POST /tracking/fitness - Success');
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      
      // Store the created entry ID for deletion test
      const createdEntryId = response.data.data?.id;
      
      if (createdEntryId) {
        console.log(`   Created entry ID: ${createdEntryId}`);
        
        // Test 4: DELETE the created entry
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

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Test with invalid entry ID
    console.log('🔍 Test 5: DELETE /tracking/fitness/999999 (non-existent)');
    try {
      const response = await axios.delete(`${BASE_URL}/tracking/fitness/999999`, { headers });
      console.log('✅ DELETE non-existent entry - Success (should return 404)');
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ DELETE non-existent entry - Correctly returned 404');
        console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log('❌ DELETE non-existent entry - Unexpected error');
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
      }
    }

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Test database connection
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    const mysql = require('mysql2/promise');
    
    const dbConfig = {
      host: 'dash.doctorphc.id',
      user: 'root',
      password: 'your_password_here', // Replace with your actual password
      database: 'phc_dashboard'
    };

    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful');

    // Check fitness_tracking table
    const [columns] = await connection.execute('DESCRIBE fitness_tracking');
    console.log(`📋 Fitness tracking table has ${columns.length} columns:`);
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });

    // Check existing data
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM fitness_tracking');
    console.log(`📊 Total fitness entries: ${countResult[0].count}`);

    await connection.end();
    console.log('🔌 Database connection closed\n');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  Please update the database password in the script\n');
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting fitness tracking endpoint tests...\n');
  
  await testDatabaseConnection();
  await testFitnessEndpoints();
  
  console.log('\n🏁 Test suite completed!');
  console.log('\n📝 Summary:');
  console.log('- If all tests show ✅, the endpoints are working correctly');
  console.log('- If any test shows ❌, there may be an issue to investigate');
  console.log('- Check the server logs for more detailed information');
}

runTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
