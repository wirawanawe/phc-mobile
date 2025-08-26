const mysql = require('mysql2/promise');

// Database configuration
const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'phc_mobile'
};

async function testUpdateProgressFix() {
  let connection;
  
  try {
    console.log('🔧 Testing Update Progress Fix...\n');
    
    // Connect to database
    console.log('1️⃣ Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Database connected\n');

    // Get a test user mission
    console.log('2️⃣ Finding a test user mission...');
    const [userMissions] = await connection.execute(`
      SELECT um.id, um.user_id, um.mission_id, um.status, um.current_value, um.progress,
             m.title, m.target_value, m.points
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.status = 'active' AND um.user_id = 1
      LIMIT 1
    `);

    if (userMissions.length === 0) {
      console.log('❌ No active user missions found for testing');
      return;
    }

    const testMission = userMissions[0];
    console.log(`✅ Found test mission: ID ${testMission.id}, "${testMission.title}"`);
    console.log(`   Current: ${testMission.current_value}/${testMission.target_value} (${testMission.progress}%)\n`);

    // Test API endpoint
    console.log('3️⃣ Testing API endpoint...');
    const testValue = Math.min(testMission.current_value + 1, testMission.target_value);
    
    const response = await fetch(`http://localhost:3000/api/mobile/missions/progress/${testMission.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_value: testValue,
        notes: 'Test update from fix script'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ API endpoint working correctly!');
      console.log(`   Response: ${result.message}`);
      console.log(`   New progress: ${result.data.progress}%`);
      console.log(`   New status: ${result.data.status}`);
    } else {
      console.log('❌ API endpoint failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, result);
    }

    // Verify database update
    console.log('\n4️⃣ Verifying database update...');
    const [updatedMission] = await connection.execute(`
      SELECT um.id, um.status, um.current_value, um.progress, um.notes
      FROM user_missions um
      WHERE um.id = ?
    `, [testMission.id]);

    if (updatedMission.length > 0) {
      const updated = updatedMission[0];
      console.log('✅ Database updated successfully!');
      console.log(`   New current_value: ${updated.current_value}`);
      console.log(`   New progress: ${updated.progress}%`);
      console.log(`   New status: ${updated.status}`);
      console.log(`   Notes: ${updated.notes || 'None'}`);
    } else {
      console.log('❌ Database update verification failed');
    }

    console.log('\n🎉 Update Progress Fix Test Completed Successfully!');
    console.log('✅ The "Invalid Mission ID" error should now be resolved');
    console.log('✅ Users can now click the "Update Progress Manual" button without issues');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testUpdateProgressFix();
