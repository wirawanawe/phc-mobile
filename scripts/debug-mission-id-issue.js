const mysql = require('mysql2/promise');

// Database configuration
const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'phc_mobile'
};

async function debugMissionIdIssue() {
  let connection;
  
  try {
    console.log('🔍 Debugging Mission ID Issue...\n');
    
    // Connect to database
    console.log('1️⃣ Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Database connected\n');

    // Check user missions for user_id = 1
    console.log('2️⃣ Checking user missions for user_id = 1...');
    const [userMissions] = await connection.execute(`
      SELECT um.id, um.user_id, um.mission_id, um.status, um.current_value, um.progress,
             m.title, m.target_value, m.points
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = 1
      ORDER BY um.id DESC
      LIMIT 5
    `);

    if (userMissions.length === 0) {
      console.log('❌ No user missions found for user_id = 1');
      return;
    }

    console.log(`✅ Found ${userMissions.length} user missions:`);
    userMissions.forEach((mission, index) => {
      console.log(`   ${index + 1}. User Mission ID: ${mission.id}`);
      console.log(`      Mission: "${mission.title}" (ID: ${mission.mission_id})`);
      console.log(`      Status: ${mission.status}`);
      console.log(`      Progress: ${mission.current_value}/${mission.target_value} (${mission.progress}%)`);
      console.log(`      Points: ${mission.points}`);
      console.log('');
    });

    // Test API endpoints
    console.log('3️⃣ Testing API endpoints...');
    
    // Test 1: GET user mission endpoint
    console.log('   Testing GET /api/mobile/missions/user-mission/[id]...');
    const testMission = userMissions[0];
    
    try {
      const getResponse = await fetch(`http://localhost:3000/api/mobile/missions/user-mission/${testMission.id}`);
      const getResult = await getResponse.json();
      
      console.log(`   Status: ${getResponse.status}`);
      console.log(`   Response:`, getResult);
      
      if (getResponse.status === 401) {
        console.log('   ⚠️ API requires authentication - this is expected');
      } else if (getResponse.ok && getResult.success) {
        console.log('   ✅ GET endpoint working correctly');
      } else {
        console.log('   ❌ GET endpoint failed');
      }
    } catch (error) {
      console.log('   ❌ GET endpoint error:', error.message);
    }
    console.log('');

    // Test 2: GET mission progress endpoint
    console.log('   Testing GET /api/mobile/missions/progress/[id]...');
    try {
      const progressResponse = await fetch(`http://localhost:3000/api/mobile/missions/progress/${testMission.id}`);
      const progressResult = await progressResponse.json();
      
      console.log(`   Status: ${progressResponse.status}`);
      console.log(`   Response:`, progressResult);
      
      if (progressResponse.ok && progressResult.success) {
        console.log('   ✅ Progress GET endpoint working correctly');
      } else {
        console.log('   ❌ Progress GET endpoint failed');
      }
    } catch (error) {
      console.log('   ❌ Progress GET endpoint error:', error.message);
    }
    console.log('');

    // Test 3: PUT mission progress endpoint
    console.log('   Testing PUT /api/mobile/missions/progress/[id]...');
    try {
      const putResponse = await fetch(`http://localhost:3000/api/mobile/missions/progress/${testMission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_value: testMission.current_value + 1,
          notes: 'Debug test'
        })
      });
      
      const putResult = await putResponse.json();
      
      console.log(`   Status: ${putResponse.status}`);
      console.log(`   Response:`, putResult);
      
      if (putResponse.ok && putResult.success) {
        console.log('   ✅ Progress PUT endpoint working correctly');
      } else {
        console.log('   ❌ Progress PUT endpoint failed');
      }
    } catch (error) {
      console.log('   ❌ Progress PUT endpoint error:', error.message);
    }
    console.log('');

    // Check for potential issues
    console.log('4️⃣ Checking for potential issues...');
    
    // Check if any user missions have null or invalid IDs
    const [invalidMissions] = await connection.execute(`
      SELECT um.id, um.user_id, um.mission_id, um.status
      FROM user_missions um
      WHERE um.id IS NULL OR um.mission_id IS NULL OR um.user_id IS NULL
    `);
    
    if (invalidMissions.length > 0) {
      console.log('   ❌ Found user missions with null values:');
      invalidMissions.forEach(mission => {
        console.log(`      ID: ${mission.id}, User: ${mission.user_id}, Mission: ${mission.mission_id}`);
      });
    } else {
      console.log('   ✅ No null values found in user_missions');
    }

    // Check for orphaned user missions
    const [orphanedMissions] = await connection.execute(`
      SELECT um.id, um.mission_id
      FROM user_missions um
      LEFT JOIN missions m ON um.mission_id = m.id
      WHERE m.id IS NULL
    `);
    
    if (orphanedMissions.length > 0) {
      console.log('   ❌ Found orphaned user missions:');
      orphanedMissions.forEach(mission => {
        console.log(`      User Mission ID: ${mission.id}, Mission ID: ${mission.mission_id} (not found)`);
      });
    } else {
      console.log('   ✅ No orphaned user missions found');
    }

    console.log('\n5️⃣ Analysis and Recommendations...');
    console.log('');
    console.log('🔍 Possible causes of "Invalid Mission ID" error:');
    console.log('   1. Frontend validation failing due to userMission.id being null/undefined');
    console.log('   2. API authentication issues preventing data loading');
    console.log('   3. Data structure mismatch between frontend and backend');
    console.log('   4. Network connectivity issues');
    console.log('');
    console.log('💡 Recommended fixes:');
    console.log('   1. Check mobile app authentication status');
    console.log('   2. Verify userMission data structure in frontend');
    console.log('   3. Add better error handling for authentication failures');
    console.log('   4. Implement fallback data loading mechanisms');
    console.log('   5. Add comprehensive logging to track data flow');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the debug
debugMissionIdIssue();
