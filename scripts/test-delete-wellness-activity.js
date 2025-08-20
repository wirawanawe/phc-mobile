const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDeleteWellnessActivity() {
  let connection;
  
  try {
    console.log('🧪 Testing delete wellness activity functionality...\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pr1k1t1w',
      database: process.env.DB_NAME || 'phc_dashboard',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database');

    // Check current wellness activities for user 5
    console.log('\n📋 Checking current wellness activities for user 5...');
    const [currentActivities] = await connection.execute(`
      SELECT 
        uwa.id,
        uwa.user_id,
        uwa.activity_id,
        uwa.activity_date,
        uwa.duration_minutes,
        uwa.activity_type,
        uwa.notes,
        uwa.completed_at,
        wa.title
      FROM user_wellness_activities uwa
      JOIN available_wellness_activities wa ON uwa.activity_id = wa.id
      WHERE uwa.user_id = 5
      ORDER BY uwa.completed_at DESC
    `);
    
    console.log('✅ Current activities:');
    if (currentActivities.length === 0) {
      console.log('   No activities found for user 5');
      return;
    }
    
    currentActivities.forEach((activity, index) => {
      console.log(`   ${index + 1}. ID: ${activity.id}, Activity: ${activity.title}, Date: ${activity.activity_date}, Type: ${activity.activity_type}`);
    });

    // Test delete specific record
    const recordToDelete = currentActivities[0];
    console.log(`\n🗑️ Testing delete for record ID: ${recordToDelete.id} (${recordToDelete.title})`);
    
    // Simulate the delete operation
    const deleteResult = await connection.execute(`
      DELETE FROM user_wellness_activities 
      WHERE user_id = ? AND id = ?
    `, [recordToDelete.user_id, recordToDelete.id]);
    
    console.log(`✅ Delete result: ${deleteResult[0].affectedRows} row(s) affected`);

    // Check remaining activities
    console.log('\n📋 Checking remaining activities after delete...');
    const [remainingActivities] = await connection.execute(`
      SELECT 
        uwa.id,
        uwa.user_id,
        uwa.activity_id,
        uwa.activity_date,
        uwa.duration_minutes,
        uwa.activity_type,
        uwa.notes,
        uwa.completed_at,
        wa.title
      FROM user_wellness_activities uwa
      JOIN available_wellness_activities wa ON uwa.activity_id = wa.id
      WHERE uwa.user_id = 5
      ORDER BY uwa.completed_at DESC
    `);
    
    console.log('✅ Remaining activities:');
    if (remainingActivities.length === 0) {
      console.log('   No activities remaining');
    } else {
      remainingActivities.forEach((activity, index) => {
        console.log(`   ${index + 1}. ID: ${activity.id}, Activity: ${activity.title}, Date: ${activity.activity_date}, Type: ${activity.activity_type}`);
      });
    }

    // Test API endpoint simulation
    console.log('\n🌐 Testing API endpoint simulation...');
    
    // Simulate the API call structure
    const apiTestData = {
      user_id: 5,
      record_id: recordToDelete.id
    };
    
    console.log('📤 API Request Data:', JSON.stringify(apiTestData, null, 2));
    
    // Simulate the SQL that would be executed
    const simulatedSql = `
      DELETE FROM user_wellness_activities 
      WHERE user_id = ? AND id = ?
    `;
    const simulatedParams = [apiTestData.user_id, apiTestData.record_id];
    
    console.log('🔍 Simulated SQL:', simulatedSql);
    console.log('🔍 Simulated Params:', simulatedParams);
    
    // Test the SQL directly
    try {
      const testDelete = await connection.execute(simulatedSql, simulatedParams);
      console.log(`✅ Simulated delete result: ${testDelete[0].affectedRows} row(s) affected`);
    } catch (error) {
      console.log('❌ Simulated delete failed:', error.message);
    }

    console.log('\n🎉 Delete functionality test completed!');

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
testDeleteWellnessActivity();
