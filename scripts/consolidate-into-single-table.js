const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function consolidateIntoSingleTable() {
  console.log('🔧 Consolidating meal_tracking and meal_foods into single table...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Step 1: Check current data
    console.log('📊 Checking current data...');
    
    const [mealCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_tracking');
    const [foodCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_foods');
    
    console.log(`   - meal_tracking: ${mealCount[0].count} records`);
    console.log(`   - meal_foods: ${foodCount[0].count} records`);

    // Step 2: Create new consolidated table
    console.log('\n🔧 Creating new consolidated meal_logging table...');
    
    const createConsolidatedTableSQL = `
      CREATE TABLE IF NOT EXISTS meal_logging (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
        recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        food_id INT,
        food_name VARCHAR(255),
        food_name_indonesian VARCHAR(255),
        quantity DECIMAL(6,2) NOT NULL DEFAULT 1,
        unit VARCHAR(50) NOT NULL DEFAULT 'serving',
        calories DECIMAL(8,2) NOT NULL DEFAULT 0,
        protein DECIMAL(6,2) NOT NULL DEFAULT 0,
        carbs DECIMAL(6,2) NOT NULL DEFAULT 0,
        fat DECIMAL(6,2) NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_meal_type (meal_type),
        INDEX idx_recorded_at (recorded_at),
        INDEX idx_food_id (food_id)
      )
    `;
    
    await connection.execute(createConsolidatedTableSQL);
    console.log('   ✅ Consolidated meal_logging table created');

    // Step 3: Migrate data from meal_tracking and meal_foods
    console.log('\n📦 Migrating data to consolidated table...');
    
    if (mealCount[0].count > 0) {
      // Get all meal data with food information
      const [mealData] = await connection.execute(`
        SELECT 
          mt.id,
          mt.user_id,
          mt.meal_type,
          mt.recorded_at,
          mt.notes,
          mt.created_at,
          mt.updated_at,
          mf.food_id,
          mf.quantity,
          mf.unit,
          mf.calories,
          mf.protein,
          mf.carbs,
          mf.fat,
          fd.name as food_name,
          fd.name_indonesian as food_name_indonesian
        FROM meal_tracking mt
        LEFT JOIN meal_foods mf ON mt.id = mf.meal_id
        LEFT JOIN food_database fd ON mf.food_id = fd.id
        ORDER BY mt.id, mf.id
      `);
      
      console.log(`   Found ${mealData.length} records to migrate`);
      
      let migratedCount = 0;
      for (const record of mealData) {
        const insertSQL = `
          INSERT INTO meal_logging (
            user_id, meal_type, recorded_at, food_id, food_name, food_name_indonesian,
            quantity, unit, calories, protein, carbs, fat, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await connection.execute(insertSQL, [
          record.user_id,
          record.meal_type,
          record.recorded_at,
          record.food_id,
          record.food_name,
          record.food_name_indonesian,
          record.quantity || 1,
          record.unit || 'serving',
          record.calories || 0,
          record.protein || 0,
          record.carbs || 0,
          record.fat || 0,
          record.notes,
          record.created_at,
          record.updated_at
        ]);
        
        migratedCount++;
      }
      
      console.log(`   ✅ Migrated ${migratedCount} records to consolidated table`);
    } else {
      console.log('   ℹ️  No existing data to migrate');
    }

    // Step 4: Verify migrated data
    console.log('\n📊 Verifying migrated data...');
    
    const [finalCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_logging');
    console.log(`   - meal_logging: ${finalCount[0].count} records`);
    
    if (finalCount[0].count > 0) {
      const [sampleData] = await connection.execute(`
        SELECT id, user_id, meal_type, food_name, calories, created_at 
        FROM meal_logging 
        LIMIT 3
      `);
      
      console.log('   Sample data:');
      sampleData.forEach(record => {
        console.log(`     - ID ${record.id}: ${record.meal_type} - ${record.food_name || 'No food'} (${record.calories} cal)`);
      });
    }

    // Step 5: Drop old tables
    console.log('\n🗑️ Dropping old tables...');
    
    try {
      await connection.execute('DROP TABLE meal_foods');
      console.log('   ✅ meal_foods table dropped');
    } catch (error) {
      console.log('   ⚠️  Could not drop meal_foods:', error.message);
    }
    
    try {
      await connection.execute('DROP TABLE meal_tracking');
      console.log('   ✅ meal_tracking table dropped');
    } catch (error) {
      console.log('   ⚠️  Could not drop meal_tracking:', error.message);
    }

    // Step 6: Final verification
    console.log('\n📊 Final table status:');
    
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'phc_dashboard' 
      AND table_name LIKE '%meal%'
    `);
    
    for (const table of tables) {
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table.table_name}`);
      console.log(`   - ${table.table_name}: ${count[0].count} records`);
    }

    console.log('\n✅ Consolidation into single table completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - ✅ meal_logging: Single consolidated table');
    console.log('   - ✅ meal_tracking: Dropped (old table)');
    console.log('   - ✅ meal_foods: Dropped (old table)');
    console.log('\n🎯 All meal and food data now stored in ONE table!');

  } catch (error) {
    console.error('❌ Error consolidating into single table:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the consolidation
consolidateIntoSingleTable().catch(console.error);
