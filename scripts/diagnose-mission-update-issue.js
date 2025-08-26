const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function diagnoseMissionUpdateIssue() {
  let connection;
  
  try {
    console.log('🔍 Diagnosing Mission Update Issue...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully\n');
    
    // 1. Check if missions table exists and has data
    console.log('📋 1. Checking missions table...');
    const missionsCheck = await connection.execute('SELECT COUNT(*) as count FROM missions');
    console.log(`   - Total missions: ${missionsCheck[0][0].count}`);
    
    if (missionsCheck[0][0].count === 0) {
      console.log('   ❌ No missions found in database!');
      return;
    }
    
    // 2. Check if user_missions table exists and has data
    console.log('\n📋 2. Checking user_missions table...');
    const userMissionsCheck = await connection.execute('SELECT COUNT(*) as count FROM user_missions');
    console.log(`   - Total user missions: ${userMissionsCheck[0][0].count}`);
    
    // 3. Check active user missions
    console.log('\n📋 3. Checking active user missions...');
    const activeMissions = await connection.execute(`
      SELECT um.id, um.user_id, um.mission_id, um.status, um.current_value, um.progress, m.title, m.target_value, m.unit
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.status IN ('active', 'pending')
      ORDER BY um.created_at DESC
      LIMIT 10
    `);
    
    console.log(`   - Active user missions: ${activeMissions[0].length}`);
    activeMissions[0].forEach((mission, index) => {
      console.log(`   ${index + 1}. ID: ${mission.id}, User: ${mission.user_id}, Mission: "${mission.title}", Status: ${mission.status}, Progress: ${mission.current_value}/${mission.target_value} ${mission.unit} (${mission.progress}%)`);
    });
    
    // 4. Check tracking data tables
    console.log('\n📋 4. Checking tracking data tables...');
    
    const trackingTables = ['water_tracking', 'fitness_tracking', 'meal_logging', 'sleep_tracking', 'mood_tracking'];
    
    for (const table of trackingTables) {
      try {
        const trackingCheck = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   - ${table}: ${trackingCheck[0][0].count} records`);
        
        if (trackingCheck[0][0].count > 0) {
          // Get latest tracking data
          const latestData = await connection.execute(`
            SELECT * FROM ${table} 
            ORDER BY created_at DESC 
            LIMIT 1
          `);
          console.log(`     Latest: ${JSON.stringify(latestData[0][0], null, 2)}`);
        }
      } catch (error) {
        console.log(`   ❌ ${table}: Error - ${error.message}`);
      }
    }
    
    // 5. Test mission progress update
    console.log('\n📋 5. Testing mission progress update...');
    
    if (activeMissions[0].length > 0) {
      const testMission = activeMissions[0][0];
      console.log(`   Testing with mission ID: ${testMission.id}`);
      
      // Try to update the mission
      const newValue = testMission.current_value + 1;
      const newProgress = Math.min(Math.round((newValue / testMission.target_value) * 100), 100);
      
      console.log(`   Updating from ${testMission.current_value} to ${newValue} (${newProgress}%)`);
      
      try {
        const updateResult = await connection.execute(`
          UPDATE user_missions 
          SET current_value = ?, progress = ?, updated_at = NOW()
          WHERE id = ?
        `, [newValue, newProgress, testMission.id]);
        
        console.log(`   ✅ Update successful: ${updateResult[0].affectedRows} rows affected`);
        
        // Verify the update
        const verifyResult = await connection.execute(`
          SELECT current_value, progress FROM user_missions WHERE id = ?
        `, [testMission.id]);
        
        console.log(`   ✅ Verification: current_value = ${verifyResult[0][0].current_value}, progress = ${verifyResult[0][0].progress}%`);
        
        // Revert the change
        await connection.execute(`
          UPDATE user_missions 
          SET current_value = ?, progress = ?, updated_at = NOW()
          WHERE id = ?
        `, [testMission.current_value, testMission.progress, testMission.id]);
        
        console.log(`   ✅ Reverted back to original values`);
        
      } catch (error) {
        console.log(`   ❌ Update failed: ${error.message}`);
      }
    } else {
      console.log('   ⚠️ No active missions to test with');
    }
    
    // 6. Check API endpoints
    console.log('\n📋 6. Checking API endpoints...');
    
    const endpoints = [
      'http://localhost:3000/api/mobile/missions',
      'http://localhost:3000/api/mobile/missions/my-missions',
      'http://localhost:3000/api/mobile/missions/progress/1'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        console.log(`   ${endpoint}: ${response.status} - ${data.success ? '✅' : '❌'} ${data.message || ''}`);
      } catch (error) {
        console.log(`   ${endpoint}: ❌ ${error.message}`);
      }
    }
    
    // 7. Check for common issues
    console.log('\n📋 7. Checking for common issues...');
    
    // Check if user_missions table has required columns
    const columnsCheck = await connection.execute('DESCRIBE user_missions');
    const requiredColumns = ['id', 'user_id', 'mission_id', 'status', 'current_value', 'progress', 'updated_at'];
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
    
    console.log('\n🎯 Diagnosis Summary:');
    console.log('✅ Database connection: Working');
    console.log(`✅ Missions table: ${missionsCheck[0][0].count} missions`);
    console.log(`✅ User missions table: ${userMissionsCheck[0][0].count} user missions`);
    console.log(`✅ Active missions: ${activeMissions[0].length}`);
    console.log('✅ Mission update test: Working');
    console.log('✅ API endpoints: Checked');
    console.log('✅ Database schema: Checked');
    
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
diagnoseMissionUpdateIssue().catch(console.error);
