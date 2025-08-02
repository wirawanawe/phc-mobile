const mysql = require('mysql2/promise');

// Database configuration - match dash-app config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000,
  typeCast: function (field, next) {
    if (field.type === "TINY" && field.length === 1) {
      return field.string() === "1"; // convert to boolean
    }
    return next();
  },
};

async function checkUserMissions() {
  let connection;
  
  try {
    console.log('🔍 Connecting to database...');
    console.log('🔐 Database config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password ? '***' : '(empty)',
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful');
    
    // Check user missions for user ID 5 (from the logs)
    console.log('\n📋 Checking user missions for user ID 5...');
    const [userMissions] = await connection.execute(`
      SELECT 
        um.id,
        um.user_id,
        um.mission_id,
        um.status,
        um.progress,
        um.created_at,
        um.updated_at,
        m.title as mission_title,
        m.target_value,
        m.points
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = 5
      ORDER BY um.created_at DESC
    `);
    
    console.log(`✅ Found ${userMissions.length} user missions for user 5:`);
    userMissions.forEach((mission, index) => {
      console.log(`\n${index + 1}. Mission: ${mission.mission_title}`);
      console.log(`   - User Mission ID: ${mission.id}`);
      console.log(`   - Mission ID: ${mission.mission_id}`);
      console.log(`   - Status: ${mission.status}`);
      console.log(`   - Progress: ${mission.progress}%`);
      console.log(`   - Target: ${mission.target_value}`);
      console.log(`   - Points: ${mission.points}`);
      console.log(`   - Created: ${mission.created_at}`);
      console.log(`   - Updated: ${mission.updated_at}`);
    });
    
    // Check if there are any completed missions for user 5
    const [completedMissions] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM user_missions 
      WHERE user_id = 5 AND status = 'completed'
    `);
    
    console.log(`\n🎯 Completed missions for user 5: ${completedMissions[0].count}`);
    
    // Check all missions available
    console.log('\n📋 Checking all available missions...');
    const [missions] = await connection.execute(`
      SELECT id, title, description, category, difficulty, points, target_value, is_active
      FROM missions 
      WHERE is_active = 1
      ORDER BY id
    `);
    
    console.log(`✅ Found ${missions.length} active missions:`);
    missions.forEach((mission, index) => {
      console.log(`\n${index + 1}. ${mission.title}`);
      console.log(`   - ID: ${mission.id}`);
      console.log(`   - Category: ${mission.category}`);
      console.log(`   - Difficulty: ${mission.difficulty}`);
      console.log(`   - Points: ${mission.points}`);
      console.log(`   - Target: ${mission.target_value}`);
    });
    
    // Check if mission ID 1 exists and is active
    console.log('\n🔍 Checking mission ID 1 specifically...');
    const [mission1] = await connection.execute(`
      SELECT id, title, description, is_active, target_value, points
      FROM missions 
      WHERE id = 1
    `);
    
    if (mission1.length > 0) {
      console.log('✅ Mission ID 1 found:');
      console.log(`   - Title: ${mission1[0].title}`);
      console.log(`   - Active: ${mission1[0].is_active ? 'Yes' : 'No'}`);
      console.log(`   - Target: ${mission1[0].target_value}`);
      console.log(`   - Points: ${mission1[0].points}`);
    } else {
      console.log('❌ Mission ID 1 not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking user missions:', error);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Database access denied. Please check:');
      console.log('   1. MySQL server is running');
      console.log('   2. Database credentials are correct');
      console.log('   3. Database "phc_dashboard" exists');
      console.log('   4. User has proper permissions');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the check
checkUserMissions().catch(console.error); 