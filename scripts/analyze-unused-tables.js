const mysql = require('mysql2/promise');

// Database configuration - update these values based on your setup
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Update this if you have a password
  database: 'phc_dashboard',
  port: 3306
};

// Tables that are actively used in the application (based on codebase analysis)
const ACTIVE_TABLES = {
  // Dashboard tables
  'users': 'User authentication and management',
  'clinics': 'Clinic information',
  'doctors': 'Doctor information',
  'polyclinics': 'Polyclinic information',
  'insurances': 'Insurance information',
  'companies': 'Company information',
  'treatments': 'Treatment information',
  'icd': 'ICD codes',
  'patients': 'Patient information',
  'visits': 'Visit information',
  'examinations': 'Examination information',
  'medicines': 'Medicine inventory',
  'clinic_rooms': 'Clinic room management',
  'clinic_polyclinics': 'Clinic-polyclinic relationships',
  'phc_office_admin': 'Admin information',
  'postal_codes': 'Postal code information',
  'services': 'Service information',
  'bookings': 'Booking information',
  'consultations': 'Consultation information',
  'assessments': 'Assessment information',
  'chats': 'Chat information',
  'chat_messages': 'Chat message information',
  'user_cache': 'User cache information',
  'user_imports': 'User import information',
  'help_content': 'Help content',
  'education_content': 'Education content',
  'available_wellness_activities': 'Wellness activities',
  'available_habit_activities': 'Habit activities',
  'user_habit_activities': 'User habit activities',
  'user_wellness_activities': 'User wellness activities',
  'mobile_visits': 'Mobile visit information',
  'anthropometry_progress': 'Anthropometry progress',
  
  // Mobile tables
  'mobile_users': 'Mobile user information',
  'food_database': 'Food database',
  'missions': 'Mission information',
  'user_missions': 'User mission tracking',
  'wellness_activities': 'Wellness activities',
  'mood_tracking': 'Mood tracking',
  'water_tracking': 'Water tracking',
  'user_water_settings': 'User water settings',
  'sleep_tracking': 'Sleep tracking',
  'meal_tracking': 'Meal tracking',
  'meal_foods': 'Meal food items',
  'fitness_tracking': 'Fitness tracking',
  'user_quick_foods': 'User quick foods',
  'health_data': 'Health data'
};

async function analyzeDatabase() {
  let connection;
  
  try {
    console.log('🔍 Analyzing database for unused tables...\n');
    console.log('Database config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');
    
    // Get all tables in the database
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'phc_dashboard' 
      ORDER BY TABLE_NAME
    `);
    
    const existingTables = tables.map(row => row.TABLE_NAME);
    
    console.log(`📊 Found ${existingTables.length} tables in database:\n`);
    
    // Categorize tables
    const activeTables = [];
    const unusedTables = [];
    const unknownTables = [];
    
    existingTables.forEach(tableName => {
      if (ACTIVE_TABLES[tableName]) {
        activeTables.push({
          name: tableName,
          description: ACTIVE_TABLES[tableName]
        });
      } else {
        // Check if it might be a system table or temporary table
        if (tableName.startsWith('__') || 
            tableName.includes('temp') || 
            tableName.includes('backup') ||
            tableName.includes('old_') ||
            tableName.includes('test_')) {
          unusedTables.push({
            name: tableName,
            reason: 'System/temporary table'
          });
        } else {
          unknownTables.push({
            name: tableName,
            reason: 'Not found in active tables list'
          });
        }
      }
    });
    
    // Display results
    console.log('✅ ACTIVE TABLES (Keep):');
    console.log('=' .repeat(50));
    activeTables.forEach(table => {
      console.log(`  • ${table.name.padEnd(30)} - ${table.description}`);
    });
    
    console.log(`\n📈 Total active tables: ${activeTables.length}\n`);
    
    if (unusedTables.length > 0) {
      console.log('🗑️  UNUSED TABLES (Safe to remove):');
      console.log('=' .repeat(50));
      unusedTables.forEach(table => {
        console.log(`  • ${table.name.padEnd(30)} - ${table.reason}`);
      });
      console.log(`\n📉 Total unused tables: ${unusedTables.length}\n`);
    }
    
    if (unknownTables.length > 0) {
      console.log('❓ UNKNOWN TABLES (Verify before removing):');
      console.log('=' .repeat(50));
      unknownTables.forEach(table => {
        console.log(`  • ${table.name.padEnd(30)} - ${table.reason}`);
      });
      console.log(`\n❓ Total unknown tables: ${unknownTables.length}\n`);
    }
    
    // Generate removal script
    if (unusedTables.length > 0) {
      console.log('📝 GENERATED REMOVAL SCRIPT:');
      console.log('=' .repeat(50));
      console.log('-- Remove unused tables');
      console.log('-- Generated on: ' + new Date().toISOString());
      console.log('');
      
      unusedTables.forEach(table => {
        console.log(`DROP TABLE IF EXISTS ${table.name}; -- ${table.reason}`);
      });
      
      console.log('\n-- Verification query:');
      console.log("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'phc_dashboard' ORDER BY TABLE_NAME;");
    }
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`Total tables in database: ${existingTables.length}`);
    console.log(`Active tables (keep): ${activeTables.length}`);
    console.log(`Unused tables (safe to remove): ${unusedTables.length}`);
    console.log(`Unknown tables (verify): ${unknownTables.length}`);
    
    if (unknownTables.length > 0) {
      console.log('\n⚠️  WARNING: There are unknown tables that should be verified before removal!');
      console.log('Please check if these tables are used in any part of the application.');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing database:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check database credentials in the script');
    console.log('3. Ensure the database "phc_dashboard" exists');
    console.log('4. Verify user permissions');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the analysis
analyzeDatabase();
