const mysql = require('mysql2/promise');
require('dotenv').config();

async function deleteMealTrackingData() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pr1k1t1w',
      database: process.env.DB_NAME || 'phc_dashboard',
      port: process.env.DB_PORT || 3306
    });

    console.log('🗑️  Starting meal tracking data deletion...\n');

    // Check current data counts
    console.log('📊 Current data counts:');
    
    const [mealTrackingCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_tracking');
    console.log(`- meal_tracking: ${mealTrackingCount[0].count} records`);
    
    const [mealFoodsCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_foods');
    console.log(`- meal_foods: ${mealFoodsCount[0].count} records`);
    
    const [foodDatabaseCount] = await connection.execute('SELECT COUNT(*) as count FROM food_database');
    console.log(`- food_database: ${foodDatabaseCount[0].count} records`);
    
    const [mealLoggingCount] = await connection.execute('    console.log(`- meal_tracking: ${mealLoggingCount[0].count} records`);
    
    console.log('\n⚠️  WARNING: This will delete ALL meal tracking data!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    // Wait 5 seconds for user to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🗑️  Deleting meal tracking data...\n');
    
    // Delete in correct order to respect foreign key constraints
    // 1. Delete meal_foods first (references meal_tracking)
    console.log('1. Deleting meal_foods records...');
    const mealFoodsResult = await connection.execute('DELETE FROM meal_foods');
    console.log(`   ✅ Deleted ${mealFoodsResult[0].affectedRows} meal_foods records`);
    
    // 2. Delete meal_tracking records
    console.log('2. Deleting meal_tracking records...');
    const mealTrackingResult = await connection.execute('DELETE FROM meal_tracking');
    console.log(`   ✅ Deleted ${mealTrackingResult[0].affectedRows} meal_tracking records`);
    
    // 3. Delete food_database records
    console.log('3. Deleting food_database records...');
    const foodDatabaseResult = await connection.execute('DELETE FROM food_database');
    console.log(`   ✅ Deleted ${foodDatabaseResult[0].affectedRows} food_database records`);
    
    // 4. Delete meal_tracking records (old table) - handle if table doesn't exist
    console.log('4. Deleting meal_tracking records (old table)...');
    try {
      const mealLoggingResult = await connection.execute('      console.log(`   ✅ Deleted ${mealLoggingResult[0].affectedRows} meal_tracking records`);
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('   ℹ️  meal_tracking table does not exist (normal)');
      } else {
        throw error;
      }
    }
    
    // Verify deletion
    console.log('\n📊 Verification - Data counts after deletion:');
    
    const [mealTrackingCountAfter] = await connection.execute('SELECT COUNT(*) as count FROM meal_tracking');
    console.log(`- meal_tracking: ${mealTrackingCountAfter[0].count} records`);
    
    const [mealFoodsCountAfter] = await connection.execute('SELECT COUNT(*) as count FROM meal_foods');
    console.log(`- meal_foods: ${mealFoodsCountAfter[0].count} records`);
    
    const [foodDatabaseCountAfter] = await connection.execute('SELECT COUNT(*) as count FROM food_database');
    console.log(`- food_database: ${foodDatabaseCountAfter[0].count} records`);
    
    const [mealLoggingCountAfter] = await connection.execute('    console.log(`- meal_tracking: ${mealLoggingCountAfter[0].count} records`);
    
    console.log('\n✅ All meal tracking data has been successfully deleted!');
    console.log('📝 Note: The table structures remain intact, only the data has been removed.');
    
  } catch (error) {
    console.error('❌ Error deleting meal tracking data:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('💡 Some tables may not exist. This is normal if they were never created.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
deleteMealTrackingData()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }); 