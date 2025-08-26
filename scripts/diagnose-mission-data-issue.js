const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function diagnoseMissionDataIssue() {
  let connection;
  
  try {
    console.log('🔍 Diagnosing Mission Data Issue...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully\n');
    
    // 1. Check missions table structure and data
    console.log('📋 1. Checking missions table...');
    const missionsCheck = await connection.execute('SELECT COUNT(*) as count FROM missions');
    console.log(`   - Total missions: ${missionsCheck[0][0].count}`);
    
    if (missionsCheck[0][0].count === 0) {
      console.log('   ❌ No missions found in database!');
      return;
    }
    
    // Get sample missions
    const sampleMissions = await connection.execute(`
      SELECT id, title, category, unit, target_value, is_active
      FROM missions 
      ORDER BY id 
      LIMIT 5
    `);
    
    console.log('   - Sample missions:');
    sampleMissions[0].forEach(mission => {
      console.log(`     ID: ${mission.id}, Title: "${mission.title}", Category: ${mission.category}, Unit: ${mission.unit}, Target: ${mission.target_value}, Active: ${mission.is_active}`);
    });
    
    // 2. Check user_missions table structure and data
    console.log('\n📋 2. Checking user_missions table...');
    const userMissionsCheck = await connection.execute('SELECT COUNT(*) as count FROM user_missions');
    console.log(`   - Total user missions: ${userMissionsCheck[0][0].count}`);
    
    // Get sample user missions
    const sampleUserMissions = await connection.execute(`
      SELECT um.id, um.user_id, um.mission_id, um.status, um.current_value, um.progress, m.title
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      ORDER BY um.id DESC
      LIMIT 5
    `);
    
    console.log('   - Sample user missions:');
    sampleUserMissions[0].forEach(userMission => {
      console.log(`     ID: ${userMission.id}, User: ${userMission.user_id}, Mission: ${userMission.mission_id} ("${userMission.title}"), Status: ${userMission.status}, Progress: ${userMission.current_value}/${userMission.progress}%`);
    });
    
    // 3. Check for invalid user mission IDs
    console.log('\n📋 3. Checking for invalid user mission IDs...');
    const invalidUserMissions = await connection.execute(`
      SELECT um.id, um.user_id, um.mission_id, um.status
      FROM user_missions um
      LEFT JOIN missions m ON um.mission_id = m.id
      WHERE m.id IS NULL
    `);
    
    if (invalidUserMissions[0].length > 0) {
      console.log(`   ❌ Found ${invalidUserMissions[0].length} user missions with invalid mission_id:`);
      invalidUserMissions[0].forEach(um => {
        console.log(`     User Mission ID: ${um.id}, User: ${um.user_id}, Invalid Mission ID: ${um.mission_id}, Status: ${um.status}`);
      });
    } else {
      console.log('   ✅ All user missions have valid mission_id references');
    }
    
    // 4. Check for missing user mission data
    console.log('\n📋 4. Checking for missing user mission data...');
    const missingDataUserMissions = await connection.execute(`
      SELECT id, user_id, mission_id, status, current_value, progress
      FROM user_missions
      WHERE id IS NULL OR user_id IS NULL OR mission_id IS NULL
    `);
    
    if (missingDataUserMissions[0].length > 0) {
      console.log(`   ❌ Found ${missingDataUserMissions[0].length} user missions with missing data:`);
      missingDataUserMissions[0].forEach(um => {
        console.log(`     ID: ${um.id}, User: ${um.user_id}, Mission: ${um.mission_id}, Status: ${um.status}, Current: ${um.current_value}, Progress: ${um.progress}`);
      });
    } else {
      console.log('   ✅ All user missions have complete data');
    }
    
    // 5. Check for specific user missions (user_id = 1)
    console.log('\n📋 5. Checking user missions for user_id = 1...');
    const user1Missions = await connection.execute(`
      SELECT um.id, um.mission_id, um.status, um.current_value, um.progress, m.title, m.category, m.unit
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = 1
      ORDER BY um.id DESC
    `);
    
    console.log(`   - User 1 has ${user1Missions[0].length} missions:`);
    user1Missions[0].forEach(um => {
      console.log(`     ID: ${um.id}, Mission: ${um.mission_id} ("${um.title}"), Status: ${um.status}, Progress: ${um.current_value}/${um.progress}%, Category: ${um.category}, Unit: ${um.unit}`);
    });
    
    // 6. Test specific user mission ID (e.g., 83)
    console.log('\n📋 6. Testing specific user mission ID 83...');
    const testUserMission = await connection.execute(`
      SELECT um.id, um.user_id, um.mission_id, um.status, um.current_value, um.progress, m.title
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.id = 83
    `);
    
    if (testUserMission[0].length > 0) {
      const um = testUserMission[0][0];
      console.log(`   ✅ User mission 83 found:`);
      console.log(`     ID: ${um.id}, User: ${um.user_id}, Mission: ${um.mission_id} ("${um.title}"), Status: ${um.status}, Progress: ${um.current_value}/${um.progress}%`);
    } else {
      console.log('   ❌ User mission 83 not found');
    }
    
    // 7. Check API endpoint response
    console.log('\n📋 7. Testing API endpoints...');
    
    const endpoints = [
      'http://localhost:3000/api/mobile/missions/83',
      'http://localhost:3000/api/mobile/missions/user-mission/83',
      'http://localhost:3000/api/mobile/missions/progress/83'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        console.log(`   ${endpoint}: ${response.status} - ${data.success ? '✅' : '❌'} ${data.message || ''}`);
        
        if (data.success && data.data) {
          console.log(`     Data: ${JSON.stringify(data.data, null, 2)}`);
        }
      } catch (error) {
        console.log(`   ${endpoint}: ❌ ${error.message}`);
      }
    }
    
    // 8. Check for common issues
    console.log('\n📋 8. Checking for common issues...');
    
    // Check if user_missions table has required columns
    const columnsCheck = await connection.execute('DESCRIBE user_missions');
    const requiredColumns = ['id', 'user_id', 'mission_id', 'status', 'current_value', 'progress'];
    const existingColumns = columnsCheck[0].map(col => col.Field);
    
    console.log('   Required columns:', requiredColumns);
    console.log('   Existing columns:', existingColumns);
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    if (missingColumns.length > 0) {
      console.log(`   ❌ Missing columns: ${missingColumns.join(', ')}`);
    } else {
      console.log('   ✅ All required columns exist');
    }
    
    // Check for foreign key constraints
    try {
      const fkCheck = await connection.execute(`
        SELECT 
          CONSTRAINT_NAME,
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'phc_dashboard'
        AND TABLE_NAME = 'user_missions'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      console.log(`   Foreign key constraints: ${fkCheck[0].length} found`);
      fkCheck[0].forEach(fk => {
        console.log(`     - ${fk.CONSTRAINT_NAME}: ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking foreign keys: ${error.message}`);
    }
    
    // 9. Check for data consistency issues
    console.log('\n📋 9. Checking for data consistency issues...');
    
    // Check for user missions with invalid status
    const invalidStatusMissions = await connection.execute(`
      SELECT id, user_id, mission_id, status
      FROM user_missions
      WHERE status NOT IN ('pending', 'active', 'completed', 'cancelled', 'abandoned')
    `);
    
    if (invalidStatusMissions[0].length > 0) {
      console.log(`   ❌ Found ${invalidStatusMissions[0].length} user missions with invalid status:`);
      invalidStatusMissions[0].forEach(um => {
        console.log(`     ID: ${um.id}, Status: ${um.status}`);
      });
    } else {
      console.log('   ✅ All user missions have valid status');
    }
    
    // Check for user missions with invalid progress values
    const invalidProgressMissions = await connection.execute(`
      SELECT id, user_id, mission_id, progress
      FROM user_missions
      WHERE progress < 0 OR progress > 100
    `);
    
    if (invalidProgressMissions[0].length > 0) {
      console.log(`   ❌ Found ${invalidProgressMissions[0].length} user missions with invalid progress:`);
      invalidProgressMissions[0].forEach(um => {
        console.log(`     ID: ${um.id}, Progress: ${um.progress}%`);
      });
    } else {
      console.log('   ✅ All user missions have valid progress values');
    }
    
    console.log('\n🎯 Diagnosis Summary:');
    console.log('✅ Database connection: Working');
    console.log(`✅ Missions table: ${missionsCheck[0][0].count} missions`);
    console.log(`✅ User missions table: ${userMissionsCheck[0][0].count} user missions`);
    console.log(`✅ User 1 missions: ${user1Missions[0].length}`);
    console.log('✅ Data consistency: Checked');
    console.log('✅ API endpoints: Tested');
    console.log('✅ Foreign key constraints: Checked');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the diagnosis
diagnoseMissionDataIssue().catch(console.error);
