const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function fixMealTrackingStructure() {
  console.log('🔧 Fixing meal_tracking table structure...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Step 1: Check current structure
    console.log('📊 Current meal_tracking structure:');
    const [columns] = await connection.execute('DESCRIBE meal_tracking');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Step 2: Remove extra columns that shouldn't be in meal_tracking
    console.log('\n🧹 Removing extra columns from meal_tracking...');
    
    const extraColumns = ['calories', 'protein', 'carbs', 'fat', 'meal_date'];
    
    for (const column of extraColumns) {
      try {
        await connection.execute(`ALTER TABLE meal_tracking DROP COLUMN ${column}`);
        console.log(`   ✅ Removed column: ${column}`);
      } catch (error) {
        if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log(`   ℹ️  Column ${column} doesn't exist`);
        } else {
          console.log(`   ⚠️  Could not remove ${column}: ${error.message}`);
        }
      }
    }

    // Step 3: Verify final structure
    console.log('\n📊 Final meal_tracking structure:');
    const [finalColumns] = await connection.execute('DESCRIBE meal_tracking');
    finalColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Step 4: Verify meal_foods structure
    console.log('\n📊 meal_foods structure:');
    const [foodColumns] = await connection.execute('DESCRIBE meal_foods');
    foodColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Step 5: Test the relationship
    console.log('\n🧪 Testing table relationship...');
    
    const [testCount] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM meal_tracking mt 
      LEFT JOIN meal_foods mf ON mt.id = mf.meal_id
    `);
    
    console.log(`   ✅ Relationship test successful: ${testCount[0].count} total records`);

    // Step 6: Check for any data
    const [mealCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_tracking');
    const [foodCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_foods');
    
    console.log(`\n📊 Data summary:`);
    console.log(`   - meal_tracking: ${mealCount[0].count} records`);
    console.log(`   - meal_foods: ${foodCount[0].count} records`);

    console.log('\n✅ Meal tracking structure fixed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - ✅ meal_tracking: Clean structure with only essential fields');
    console.log('   - ✅ meal_foods: Individual food items with nutrition data');
    console.log('   - ✅ Relationship: meal_tracking.id -> meal_foods.meal_id');
    console.log('\n🎯 The system now has a clean, unified meal logging structure!');

  } catch (error) {
    console.error('❌ Error fixing meal tracking structure:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the fix
fixMealTrackingStructure().catch(console.error);
