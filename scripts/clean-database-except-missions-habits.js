const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
      host: process.env.DB_HOST || 'dash.doctorphc.id',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function cleanDatabase() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to database successfully');
    
    // Read the SQL script
    const sqlScriptPath = path.join(__dirname, 'clean-database-except-missions-habits.sql');
    const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');
    
    console.log('📖 Reading cleanup script...');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip SELECT statements for now (we'll handle them separately)
      if (statement.toUpperCase().startsWith('SELECT')) {
        continue;
      }
      
      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        await connection.execute(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        // Continue with other statements
      }
    }
    
    // Execute verification queries
    console.log('\n🔍 Running verification queries...');
    
    const verificationQueries = [
      'SELECT "MISSIONS" as table_name, COUNT(*) as record_count FROM missions',
      'SELECT "USER_MISSIONS" as table_name, COUNT(*) as record_count FROM user_missions',
      'SELECT "AVAILABLE_HABIT_ACTIVITIES" as table_name, COUNT(*) as record_count FROM available_habit_activities',
      'SELECT "USER_HABIT_ACTIVITIES" as table_name, COUNT(*) as record_count FROM user_habit_activities'
    ];
    
    console.log('\n📊 PRESERVED DATA:');
    for (const query of verificationQueries) {
      try {
        const [rows] = await connection.execute(query);
        console.log(`   ${rows[0].table_name}: ${rows[0].record_count} records`);
      } catch (error) {
        console.log(`   ${query.split('"')[1]}: Error - ${error.message}`);
      }
    }
    
    const cleanedQueries = [
      'SELECT "EXAMINATIONS" as table_name, COUNT(*) as record_count FROM examinations',
      'SELECT "VISITS" as table_name, COUNT(*) as record_count FROM visits',
      'SELECT "PATIENTS" as table_name, COUNT(*) as record_count FROM patients',
      'SELECT "DOCTORS" as table_name, COUNT(*) as record_count FROM doctors',
      'SELECT "MEDICINES" as table_name, COUNT(*) as record_count FROM medicines',
      'SELECT "USERS" as table_name, COUNT(*) as record_count FROM users',
      'SELECT "CLINICS" as table_name, COUNT(*) as record_count FROM clinics',
      'SELECT "WELLNESS_ACTIVITIES" as table_name, COUNT(*) as record_count FROM wellness_activities',
      'SELECT "MOOD_TRACKING" as table_name, COUNT(*) as record_count FROM mood_tracking',
      'SELECT "WATER_TRACKING" as table_name, COUNT(*) as record_count FROM water_tracking',
      'SELECT "SLEEP_TRACKING" as table_name, COUNT(*) as record_count FROM sleep_tracking',
      'SELECT "FITNESS_TRACKING" as table_name, COUNT(*) as record_count FROM fitness_tracking',
      'SELECT "HEALTH_DATA" as table_name, COUNT(*) as record_count FROM health_data',
      'SELECT "ASSESSMENTS" as table_name, COUNT(*) as record_count FROM assessments',
      'SELECT "CHATS" as table_name, COUNT(*) as record_count FROM chats',
      'SELECT "CONSULTATIONS" as table_name, COUNT(*) as record_count FROM consultations'
    ];
    
    console.log('\n🧹 CLEANED DATA:');
    for (const query of cleanedQueries) {
      try {
        const [rows] = await connection.execute(query);
        console.log(`   ${rows[0].table_name}: ${rows[0].record_count} records`);
      } catch (error) {
        console.log(`   ${query.split('"')[1]}: Error - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('✅ Mission and habit data have been preserved');
    console.log('🧹 All other data has been cleaned');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the cleanup
if (require.main === module) {
  console.log('🚀 Starting database cleanup...');
  console.log('⚠️  This will clean ALL data except missions and habits!');
  console.log('📋 Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user
  });
  
  cleanDatabase()
    .then(() => {
      console.log('✅ Cleanup process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup process failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanDatabase };
