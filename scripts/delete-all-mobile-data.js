const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function deleteAllMobileData() {
  console.log('🗑️  Starting deletion of all mobile data...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Start transaction
    await connection.beginTransaction();
    console.log('🔄 Transaction started');

    // List of tables that reference mobile_users.id (user_id)
    // These tables have foreign key constraints with ON DELETE CASCADE
    const relatedTables = [
      'user_missions',
      'health_data', 
      'user_wellness_activities',
      'sleep_tracking',
      'mood_tracking',
      'water_tracking',
      'user_water_settings',
            'fitness_tracking',
      'user_quick_foods',
      'mobile_visits',
      'chats',
      'chat_messages'
    ];

    // First, let's check how many records we have in each table
    console.log('📊 Current data count:');
    
    // Check mobile_users count
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM mobile_users');
    console.log(`   - mobile_users: ${userCount[0].count} records`);

    // Check related tables count
    for (const table of relatedTables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   - ${table}: ${count[0].count} records`);
      } catch (error) {
        console.log(`   - ${table}: Table does not exist or error: ${error.message}`);
      }
    }

    console.log('\n🗑️  Deleting all mobile_users data...');
    
    // Delete all records from mobile_users table
    // Due to foreign key constraints with ON DELETE CASCADE, 
    // all related data will be automatically deleted
    const [deleteResult] = await connection.execute('DELETE FROM mobile_users');
    console.log(`✅ Deleted ${deleteResult.affectedRows} records from mobile_users`);

    // Verify deletion
    console.log('\n📊 Verification - data count after deletion:');
    
    const [finalUserCount] = await connection.execute('SELECT COUNT(*) as count FROM mobile_users');
    console.log(`   - mobile_users: ${finalUserCount[0].count} records`);

    for (const table of relatedTables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   - ${table}: ${count[0].count} records`);
      } catch (error) {
        console.log(`   - ${table}: Table does not exist or error: ${error.message}`);
      }
    }

    // Commit transaction
    await connection.commit();
    console.log('\n✅ Transaction committed successfully');

    console.log('\n🎉 All mobile data has been successfully deleted!');
    console.log('📝 Summary:');
    console.log(`   - Deleted ${deleteResult.affectedRows} mobile users`);
    console.log(`   - All related data in ${relatedTables.length} tables has been automatically deleted`);
    console.log('   - Database is now clean and ready for fresh data');

  } catch (error) {
    // Rollback transaction on error
    if (connection) {
      await connection.rollback();
      console.log('❌ Transaction rolled back due to error');
    }
    
    console.error('❌ Error deleting mobile data:', error);
    throw error;
    
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the function
deleteAllMobileData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
