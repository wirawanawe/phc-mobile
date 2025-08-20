const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function verifyMobileDataDeletion() {
  console.log('🔍 Verifying mobile data deletion...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // List of all tables that should be empty
    const mobileTables = [
      'mobile_users',
      'user_missions',
      'health_data', 
      'user_wellness_activities',
      'sleep_tracking',
      'mood_tracking',
      'water_tracking',
      'user_water_settings',
            'fitness_tracking',
      'user_quick_foods',
      'chats',
      'chat_messages'
    ];

    console.log('📊 Checking data count in mobile-related tables:');
    console.log('=' .repeat(60));
    
    let totalRecords = 0;
    let tablesWithData = 0;

    for (const table of mobileTables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const recordCount = count[0].count;
        totalRecords += recordCount;
        
        if (recordCount > 0) {
          console.log(`❌ ${table}: ${recordCount} records (SHOULD BE EMPTY)`);
          tablesWithData++;
        } else {
          console.log(`✅ ${table}: ${recordCount} records`);
        }
      } catch (error) {
        if (error.message.includes("doesn't exist")) {
          console.log(`ℹ️  ${table}: Table does not exist`);
        } else {
          console.log(`⚠️  ${table}: Error checking - ${error.message}`);
        }
      }
    }

    console.log('=' .repeat(60));
    
    if (totalRecords === 0) {
      console.log('🎉 SUCCESS: All mobile data has been completely deleted!');
      console.log('✅ Database is clean and ready for fresh data');
    } else {
      console.log(`⚠️  WARNING: Found ${totalRecords} records in ${tablesWithData} tables`);
      console.log('❌ Some mobile data still exists and needs to be cleaned up');
    }

    // Also check if there are any orphaned records in other tables that might reference mobile_users
    console.log('\n🔍 Checking for potential orphaned records...');
    
    const orphanedChecks = [
      {
        table: 'missions',
        description: 'Missions (should remain, but checking for any issues)',
        query: 'SELECT COUNT(*) as count FROM missions'
      },
      {
        table: 'wellness_activities', 
        description: 'Wellness activities (should remain, but checking for any issues)',
        query: 'SELECT COUNT(*) as count FROM wellness_activities'
      }
    ];

    for (const check of orphanedChecks) {
      try {
        const [count] = await connection.execute(check.query);
        console.log(`ℹ️  ${check.description}: ${count[0].count} records`);
      } catch (error) {
        console.log(`⚠️  ${check.description}: Error - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error verifying mobile data deletion:', error);
    throw error;
    
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the function
verifyMobileDataDeletion()
  .then(() => {
    console.log('\n✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
