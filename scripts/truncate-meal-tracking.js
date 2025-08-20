const mysql = require('mysql2/promise');

// Database configuration - matching the dash-app settings
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function truncateMealTracking() {
  console.log('🗑️ Truncating meal_tracking data...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Check if tables exist
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'meal_tracking'"
    );

    if (tables.length === 0) {
      console.log('❌ meal_tracking table does not exist');
      return;
    }

    // Check if meal_foods table exists
    const [mealFoodsTables] = await connection.execute(
      "SHOW TABLES LIKE 'meal_foods'"
    );

    // Get current data count
    const [mealTrackingCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM meal_tracking"
    );

    const [mealFoodsCount] = await connection.execute(
      mealFoodsTables.length > 0 ? "SELECT COUNT(*) as count FROM meal_foods" : "SELECT 0 as count"
    );

    console.log('📊 Current data count:');
    console.log(`- meal_tracking: ${mealTrackingCount[0].count} records`);
    console.log(`- meal_foods: ${mealFoodsCount[0].count} records`);

    if (mealTrackingCount[0].count === 0 && mealFoodsCount[0].count === 0) {
      console.log('ℹ️ No data to truncate - tables are already empty');
      return;
    }

    // Confirm before truncating
    console.log('\n⚠️ WARNING: This will permanently delete all meal tracking data!');
    console.log('This action cannot be undone.');
    
    // In a real scenario, you might want to add user confirmation here
    // For now, we'll proceed with the truncation
    
    // Start transaction
    await connection.beginTransaction();
    console.log('🔄 Starting transaction...');

    try {
      // Delete meal_foods first (due to foreign key constraint)
      if (mealFoodsTables.length > 0) {
        console.log('🗑️ Deleting meal_foods data...');
        await connection.execute('DELETE FROM meal_foods');
        console.log('✅ meal_foods data deleted');
      }

      // Delete meal_tracking data
      console.log('🗑️ Deleting meal_tracking data...');
      await connection.execute('DELETE FROM meal_tracking');
      console.log('✅ meal_tracking data deleted');

      // Reset auto-increment counters
      console.log('🔄 Resetting auto-increment counters...');
      await connection.execute('ALTER TABLE meal_tracking AUTO_INCREMENT = 1');
      
      if (mealFoodsTables.length > 0) {
        await connection.execute('ALTER TABLE meal_foods AUTO_INCREMENT = 1');
      }
      console.log('✅ Auto-increment counters reset');

      // Commit transaction
      await connection.commit();
      console.log('✅ Transaction committed successfully');

      // Verify deletion
      const [finalMealTrackingCount] = await connection.execute(
        "SELECT COUNT(*) as count FROM meal_tracking"
      );

      const [finalMealFoodsCount] = await connection.execute(
        mealFoodsTables.length > 0 ? "SELECT COUNT(*) as count FROM meal_foods" : "SELECT 0 as count"
      );

      console.log('\n📊 Final data count:');
      console.log(`- meal_tracking: ${finalMealTrackingCount[0].count} records`);
      console.log(`- meal_foods: ${finalMealFoodsCount[0].count} records`);

      console.log('\n✅ Meal tracking data truncated successfully!');

    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      console.error('❌ Error during truncation, rolling back transaction:', error.message);
      throw error;
    }

  } catch (error) {
    console.error('❌ Error truncating meal tracking data:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Function to show current meal tracking data (for verification)
async function showCurrentMealData() {
  console.log('📋 Showing current meal tracking data...\n');

  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Check if tables exist
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'meal_tracking'"
    );

    if (tables.length === 0) {
      console.log('❌ meal_tracking table does not exist');
      return;
    }

    // Get meal tracking data
    const [mealData] = await connection.execute(`
      SELECT 
        mt.id,
        mt.user_id,
        mt.meal_type,
        mt.recorded_at,
        mt.notes,
        mt.created_at,
        COUNT(mf.id) as food_count
      FROM meal_tracking mt
      LEFT JOIN meal_foods mf ON mt.id = mf.meal_id
      GROUP BY mt.id
      ORDER BY mt.recorded_at DESC
      LIMIT 10
    `);

    if (mealData.length === 0) {
      console.log('ℹ️ No meal tracking data found');
      return;
    }

    console.log('📊 Recent meal tracking entries:');
    mealData.forEach((meal, index) => {
      console.log(`${index + 1}. ID: ${meal.id}, User: ${meal.user_id}, Type: ${meal.meal_type}`);
      console.log(`   Recorded: ${meal.recorded_at}, Foods: ${meal.food_count}`);
      console.log(`   Notes: ${meal.notes || 'None'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error showing meal data:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--show')) {
    await showCurrentMealData();
  } else {
    await truncateMealTracking();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { truncateMealTracking, showCurrentMealData };
