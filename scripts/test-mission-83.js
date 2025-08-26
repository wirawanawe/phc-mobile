const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'phc_dashboard',
  port: 3306
};

async function testMission83() {
  let connection;
  try {
    console.log('🔍 Testing mission ID 83...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check if missions table exists
    const [tables] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'missions'
    `, [dbConfig.database]);
    
    if (tables[0].count === 0) {
      console.log('❌ Missions table does not exist');
      return;
    }
    console.log('✅ Missions table exists');
    
    // Check if mission 83 exists
    const [missions] = await connection.execute(`
      SELECT id, title, is_active, category 
      FROM missions 
      WHERE id = 83
    `);
    
    if (missions.length === 0) {
      console.log('❌ Mission ID 83 does not exist');
      
      // Check what missions do exist
      const [allMissions] = await connection.execute(`
        SELECT id, title, is_active 
        FROM missions 
        ORDER BY id DESC 
        LIMIT 10
      `);
      
      console.log('📋 Available missions (last 10):', allMissions);
      return;
    }
    
    console.log('✅ Mission ID 83 exists:', missions[0]);
    
    // Check the full structure of mission 83
    const [fullMission] = await connection.execute(`
      SELECT * FROM missions WHERE id = 83
    `);
    
    console.log('📋 Full mission 83 structure:', Object.keys(fullMission[0]));
    console.log('📋 Mission 83 data:', fullMission[0]);
    
    // Test the exact query from the API endpoint
    const [testQuery] = await connection.execute(`
      SELECT 
        id,
        title,
        description,
        category,
        sub_category,
        points,
        duration_days,
        target_value,
        target_unit,
        unit,
        is_active,
        type,
        difficulty,
        icon,
        color,
        tracking_mapping,
        requirements,
        start_date,
        end_date,
        created_at,
        updated_at
      FROM missions 
      WHERE id = 83
    `);
    
    if (testQuery.length === 0) {
      console.log('❌ Test query returned no results');
    } else {
      console.log('✅ Test query successful:', testQuery[0]);
    }
    
  } catch (error) {
    console.error('❌ Error testing mission 83:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testMission83().then(() => {
  console.log('\n🎯 Test completed');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
