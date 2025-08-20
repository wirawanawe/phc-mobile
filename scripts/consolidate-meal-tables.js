const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function consolidateMealTables() {
  console.log('🔧 Consolidating meal tables into single system...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Step 1: Check current table status
    console.log('📊 Checking current table status...');
    
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'phc_dashboard' 
      AND table_name IN ('meal_logging', 'meal_tracking', 'meal_foods')
    `);
    
    const existingTables = tables.map(t => t.table_name);
    console.log('   Existing tables:', existingTables);

    // Step 2: Migrate data from meal_logging to meal_tracking if needed
    if (existingTables.includes('meal_logging')) {
      console.log('\n📦 Migrating data from meal_logging to meal_tracking...');
      
      // Check if meal_logging has data
      const [mealLoggingCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_logging');
      console.log(`   Found ${mealLoggingCount[0].count} records in meal_logging`);
      
      if (mealLoggingCount[0].count > 0) {
        // Get all meal_logging records
        const [mealLoggingData] = await connection.execute(`
          SELECT id, user_id, meal_type, meal_date, meal_time, notes, created_at, updated_at
          FROM meal_logging
        `);
        
        console.log(`   Migrating ${mealLoggingData.length} meal records...`);
        
        for (const meal of mealLoggingData) {
          // Create meal_tracking entry
          const recordedAt = new Date(`${meal.meal_date} ${meal.meal_time || '12:00:00'}`);
          
          const insertMealTrackingSQL = `
            INSERT INTO meal_tracking (user_id, meal_type, recorded_at, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          
          const mealResult = await connection.execute(insertMealTrackingSQL, [
            meal.user_id,
            meal.meal_type,
            recordedAt,
            meal.notes,
            meal.created_at,
            meal.updated_at
          ]);
          
          const newMealId = mealResult[0].insertId;
          console.log(`   ✅ Migrated meal ${meal.id} -> meal_tracking ${newMealId}`);
        }
      }
    }

    // Step 3: Ensure meal_tracking table has all necessary columns
    console.log('\n🔧 Ensuring meal_tracking table structure is complete...');
    
    const createMealTrackingSQL = `
      CREATE TABLE IF NOT EXISTS meal_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
        recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_meal_type (meal_type),
        INDEX idx_recorded_at (recorded_at)
      )
    `;
    
    await connection.execute(createMealTrackingSQL);
    console.log('   ✅ meal_tracking table structure verified');

    // Step 4: Ensure meal_foods table exists
    console.log('\n🔧 Ensuring meal_foods table structure is complete...');
    
    const createMealFoodsSQL = `
      CREATE TABLE IF NOT EXISTS meal_foods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        meal_id INT NOT NULL,
        food_id INT NOT NULL,
        quantity DECIMAL(6,2) NOT NULL DEFAULT 1,
        unit VARCHAR(50) NOT NULL DEFAULT 'serving',
        calories DECIMAL(8,2) NOT NULL DEFAULT 0,
        protein DECIMAL(6,2) NOT NULL DEFAULT 0,
        carbs DECIMAL(6,2) NOT NULL DEFAULT 0,
        fat DECIMAL(6,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (meal_id) REFERENCES meal_tracking(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES food_database(id) ON DELETE CASCADE,
        INDEX idx_meal_id (meal_id),
        INDEX idx_food_id (food_id)
      )
    `;
    
    await connection.execute(createMealFoodsSQL);
    console.log('   ✅ meal_foods table structure verified');

    // Step 5: Create indexes for better performance
    console.log('\n📈 Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_meal_tracking_user_date ON meal_tracking(user_id, recorded_at)',
      'CREATE INDEX IF NOT EXISTS idx_meal_foods_meal ON meal_foods(meal_id, food_id)'
    ];
    
    for (const indexSQL of indexes) {
      try {
        await connection.execute(indexSQL);
        console.log('   ✅ Index created');
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('   ℹ️  Index already exists');
        } else {
          console.log('   ⚠️  Index creation skipped:', error.message);
        }
      }
    }

    // Step 6: Remove old meal_logging table
    console.log('\n🗑️ Removing old meal_logging table...');
    
    try {
      await connection.execute('DROP TABLE IF EXISTS meal_logging');
      console.log('   ✅ meal_logging table removed');
    } catch (error) {
      console.log('   ⚠️  Could not remove meal_logging table:', error.message);
    }

    // Step 7: Verify final status
    console.log('\n📊 Final table status:');
    
    const [finalTables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'phc_dashboard' 
      AND table_name IN ('meal_tracking', 'meal_foods')
    `);
    
    for (const table of finalTables) {
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table.table_name}`);
      console.log(`   - ${table.table_name}: ${count[0].count} records`);
    }

    // Step 8: Test the consolidated system
    console.log('\n🧪 Testing consolidated meal system...');
    
    // Check if we have any meal data
    const [mealCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_tracking');
    const [foodCount] = await connection.execute('SELECT COUNT(*) as count FROM meal_foods');
    
    console.log(`   - Total meals: ${mealCount[0].count}`);
    console.log(`   - Total food items: ${foodCount[0].count}`);
    
    if (mealCount[0].count > 0) {
      // Show sample data
      const [sampleMeal] = await connection.execute(`
        SELECT mt.*, COUNT(mf.id) as food_count
        FROM meal_tracking mt
        LEFT JOIN meal_foods mf ON mt.id = mf.meal_id
        GROUP BY mt.id
        LIMIT 1
      `);
      
      if (sampleMeal.length > 0) {
        console.log(`   - Sample meal: ${sampleMeal[0].meal_type} (${sampleMeal[0].food_count} foods)`);
      }
    }

    console.log('\n✅ Meal table consolidation completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - ✅ meal_tracking: Main meal entries table');
    console.log('   - ✅ meal_foods: Individual food items in meals');
    console.log('   - ✅ meal_logging: Removed (old system)');
    console.log('\n🎯 The system now uses a single, unified meal logging structure!');

  } catch (error) {
    console.error('❌ Error consolidating meal tables:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the consolidation
consolidateMealTables().catch(console.error);
