#!/usr/bin/env node

/**
 * Mission Connection Check Script
 * 
 * This script checks mission-related connections and identifies any issues
 * that might cause problems like before.
 */

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function checkMissionConnection() {
  let connection;
  
  try {
    console.log('🔍 Starting Mission Connection Check...\n');
    
    // Step 1: Test database connection
    console.log('🔍 Step 1: Testing database connection...');
    await testDatabaseConnection();
    
    // Step 2: Check mission tables structure
    console.log('\n🔍 Step 2: Checking mission tables structure...');
    await checkMissionTablesStructure();
    
    // Step 3: Check mission data integrity
    console.log('\n🔍 Step 3: Checking mission data integrity...');
    await checkMissionDataIntegrity();
    
    // Step 4: Test mission API endpoints
    console.log('\n🔍 Step 4: Testing mission API endpoints...');
    await testMissionAPIEndpoints();
    
    // Step 5: Check mission relationships
    console.log('\n🔍 Step 5: Checking mission relationships...');
    await checkMissionRelationships();
    
    // Step 6: Performance check
    console.log('\n🔍 Step 6: Performance check...');
    await checkMissionPerformance();
    
    console.log('\n🎉 Mission connection check completed!');
    
  } catch (error) {
    console.error('❌ Mission connection check failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function testDatabaseConnection() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('   ✅ Database connection successful');
    
    // Test basic query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('   ✅ Basic query test successful');
    
    // Check database version
    const [versionResult] = await connection.execute('SELECT VERSION() as version');
    console.log(`   📊 Database version: ${versionResult[0].version}`);
    
  } catch (error) {
    console.error('   ❌ Database connection failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function checkMissionTablesStructure() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const requiredTables = [
      'missions',
      'user_missions',
      'mood_tracking',
      'water_tracking',
      'sleep_tracking',
      'fitness_tracking',
      'available_wellness_activities',
      'user_wellness_activities'
    ];
    
    for (const table of requiredTables) {
      try {
        // Check if table exists
        const [tableExists] = await connection.execute(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = ? AND table_name = ?
        `, [dbConfig.database, table]);
        
        if (tableExists[0].count > 0) {
          console.log(`   ✅ Table ${table} exists`);
          
          // Check table structure
          const [columns] = await connection.execute(`DESCRIBE ${table}`);
          console.log(`      📋 Columns: ${columns.length}`);
          
          // Check for required columns in missions table
          if (table === 'missions') {
            const requiredColumns = ['id', 'title', 'category', 'points', 'target_value', 'is_active'];
            const columnNames = columns.map(col => col.Field);
            const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
            
            if (missingColumns.length > 0) {
              console.log(`      ⚠️ Missing columns in missions: ${missingColumns.join(', ')}`);
            } else {
              console.log(`      ✅ All required columns present in missions`);
            }
          }
          
          // Check for required columns in user_missions table
          if (table === 'user_missions') {
            const requiredColumns = ['id', 'user_id', 'mission_id', 'status', 'progress', 'current_value'];
            const columnNames = columns.map(col => col.Field);
            const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
            
            if (missingColumns.length > 0) {
              console.log(`      ⚠️ Missing columns in user_missions: ${missingColumns.join(', ')}`);
            } else {
              console.log(`      ✅ All required columns present in user_missions`);
            }
          }
          
        } else {
          console.log(`   ❌ Table ${table} does not exist`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking table ${table}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('   ❌ Error checking table structure:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function checkMissionDataIntegrity() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Check missions data
    const [missionsCount] = await connection.execute('SELECT COUNT(*) as count FROM missions');
    console.log(`   📊 Total missions: ${missionsCount[0].count}`);
    
    const [activeMissions] = await connection.execute('SELECT COUNT(*) as count FROM missions WHERE is_active = 1');
    console.log(`   📊 Active missions: ${activeMissions[0].count}`);
    
    // Check user_missions data
    const [userMissionsCount] = await connection.execute('SELECT COUNT(*) as count FROM user_missions');
    console.log(`   📊 Total user missions: ${userMissionsCount[0].count}`);
    
    // Check for orphaned user_missions (missions that don't exist)
    const [orphanedMissions] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM user_missions um 
      LEFT JOIN missions m ON um.mission_id = m.id 
      WHERE m.id IS NULL
    `);
    
    if (orphanedMissions[0].count > 0) {
      console.log(`   ⚠️ Orphaned user missions: ${orphanedMissions[0].count}`);
    } else {
      console.log(`   ✅ No orphaned user missions found`);
    }
    
    // Check for invalid status values
    const [invalidStatus] = await connection.execute(`
      SELECT status, COUNT(*) as count 
      FROM user_missions 
      GROUP BY status
    `);
    console.log(`   📊 User mission status distribution:`);
    invalidStatus.forEach(status => {
      console.log(`      - ${status.status}: ${status.count}`);
    });
    
    // Check tracking data
    const trackingTables = ['mood_tracking', 'water_tracking', 'sleep_tracking', 'fitness_tracking'];
    for (const table of trackingTables) {
      try {
        const [trackingCount] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   📊 ${table}: ${trackingCount[0].count} entries`);
      } catch (error) {
        console.log(`   ❌ Error checking ${table}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('   ❌ Error checking data integrity:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function testMissionAPIEndpoints() {
  console.log('   🧪 Testing mission API endpoints...');
  
  // Test endpoints using curl or fetch
  const endpoints = [
    {
      name: 'My Missions',
      url: 'http://localhost:3000/api/mobile/missions/my-missions?user_id=1',
      method: 'GET'
    },
    {
      name: 'Mission Stats',
      url: 'http://localhost:3000/api/mobile/missions/stats?user_id=1&period=week',
      method: 'GET'
    },
    {
      name: 'Available Missions',
      url: 'http://localhost:3000/api/mobile/missions',
      method: 'GET'
    }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`   🔍 Testing ${endpoint.name}...`);
      
      // Note: This is a simplified test - in real scenario you'd need proper authentication
      console.log(`      📍 Endpoint: ${endpoint.url}`);
      console.log(`      ⚠️ Note: Authentication required for full test`);
      
    } catch (error) {
      console.log(`   ❌ Error testing ${endpoint.name}:`, error.message);
    }
  }
}

async function checkMissionRelationships() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('   🔗 Checking mission relationships...');
    
    // Check foreign key relationships
    const [foreignKeys] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? 
        AND REFERENCED_TABLE_NAME IS NOT NULL
        AND TABLE_NAME IN ('user_missions', 'user_wellness_activities')
    `, [dbConfig.database]);
    
    if (foreignKeys.length > 0) {
      console.log(`   ✅ Found ${foreignKeys.length} foreign key relationships:`);
      foreignKeys.forEach(fk => {
        console.log(`      - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log(`   ⚠️ No foreign key relationships found`);
    }
    
    // Check data consistency
    const [inconsistentData] = await connection.execute(`
      SELECT 
        'user_missions' as table_name,
        COUNT(*) as count
      FROM user_missions um
      LEFT JOIN missions m ON um.mission_id = m.id
      WHERE m.id IS NULL
      UNION ALL
      SELECT 
        'user_wellness_activities' as table_name,
        COUNT(*) as count
      FROM user_wellness_activities uwa
      LEFT JOIN available_wellness_activities awa ON uwa.activity_id = awa.id
      WHERE awa.id IS NULL
    `);
    
    let hasInconsistentData = false;
    inconsistentData.forEach(row => {
      if (row.count > 0) {
        console.log(`   ⚠️ Inconsistent data in ${row.table_name}: ${row.count} records`);
        hasInconsistentData = true;
      }
    });
    
    if (!hasInconsistentData) {
      console.log(`   ✅ All mission relationships are consistent`);
    }
    
  } catch (error) {
    console.error('   ❌ Error checking relationships:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function checkMissionPerformance() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('   ⚡ Checking mission performance...');
    
    // Test optimized queries
    const queries = [
      {
        name: 'Optimized My Missions Query',
        sql: `
          SELECT 
            um.id as user_mission_id,
            um.status,
            um.progress,
            um.current_value,
            um.completed_at,
            um.created_at,
            um.updated_at,
            um.notes,
            m.id as mission_id,
            m.title,
            m.description,
            m.category,
            m.points,
            m.target_value,
            m.is_active,
            m.icon,
            m.color,
            m.difficulty,
            COUNT(*) OVER() as total_missions,
            SUM(CASE WHEN um.status = 'active' THEN 1 ELSE 0 END) OVER() as active_missions,
            SUM(CASE WHEN um.status = 'completed' THEN 1 ELSE 0 END) OVER() as completed_missions,
            SUM(CASE WHEN um.status = 'expired' THEN 1 ELSE 0 END) OVER() as expired_missions,
            SUM(CASE WHEN um.status = 'cancelled' THEN 1 ELSE 0 END) OVER() as cancelled_missions,
            SUM(CASE WHEN um.status = 'completed' THEN m.points ELSE 0 END) OVER() as total_points_earned
          FROM user_missions um
          INNER JOIN missions m ON um.mission_id = m.id
          WHERE um.user_id = 1
          ORDER BY um.created_at DESC
          LIMIT 20
        `
      },
      {
        name: 'Optimized Mission Stats Query',
        sql: `
          SELECT 
            COUNT(*) as total_missions,
            SUM(CASE WHEN um.status = 'completed' THEN 1 ELSE 0 END) as completed_missions,
            SUM(CASE WHEN um.status = 'active' THEN 1 ELSE 0 END) as active_missions,
            SUM(CASE WHEN um.status = 'expired' THEN 1 ELSE 0 END) as expired_missions,
            SUM(CASE WHEN um.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_missions,
            SUM(CASE WHEN um.status = 'completed' THEN m.points ELSE 0 END) as total_points_earned
          FROM user_missions um
          INNER JOIN missions m ON um.mission_id = m.id
          WHERE um.user_id = 1
            AND um.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `
      }
    ];
    
    for (const query of queries) {
      try {
        const startTime = Date.now();
        const [result] = await connection.execute(query.sql);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`   ✅ ${query.name}: ${result.length} results in ${duration}ms`);
        
        if (duration > 1000) {
          console.log(`      ⚠️ Query is slow (${duration}ms) - consider optimization`);
        } else if (duration > 500) {
          console.log(`      ⚠️ Query is moderately slow (${duration}ms)`);
        } else {
          console.log(`      ✅ Query performance is good (${duration}ms)`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${query.name} failed:`, error.message);
      }
    }
    
    // Check index usage
    console.log('   📊 Checking index usage...');
    const tables = ['user_missions', 'missions'];
    for (const table of tables) {
      try {
        const [indexes] = await connection.execute(`SHOW INDEX FROM ${table}`);
        const nonPrimaryIndexes = indexes.filter(idx => idx.Key_name !== 'PRIMARY');
        console.log(`   📋 ${table}: ${nonPrimaryIndexes.length} non-primary indexes`);
        
        nonPrimaryIndexes.forEach(idx => {
          console.log(`      - ${idx.Key_name} (${idx.Column_name})`);
        });
      } catch (error) {
        console.log(`   ❌ Error checking indexes for ${table}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('   ❌ Error checking performance:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
if (require.main === module) {
  checkMissionConnection().then(() => {
    console.log('\n🏁 Mission connection check finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Mission connection check failed:', error);
    process.exit(1);
  });
}

module.exports = { checkMissionConnection };
