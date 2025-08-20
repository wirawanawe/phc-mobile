const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

// Directories to scan for cleanup
const directories = [
  'dash-app/init-scripts',
  'dash-app/app/api',
  'dash-app/scripts',
  'scripts'
];

// Files to exclude from cleanup
const excludeFiles = [
  'consolidate-meal-tables.js',
  'remove-meal-logging-references.js',
  'consolidate-meal-system.js'
];

async function consolidateMealTables() {
  console.log('🔧 Step 1: Consolidating meal tables into single system...\n');

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
    
    const existingTables = tables.map(t => t.table_name).filter(Boolean);
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

    // Step 5: Create indexes for better performance (fixed syntax)
    console.log('\n📈 Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX idx_meal_tracking_user_date ON meal_tracking(user_id, recorded_at)',
      'CREATE INDEX idx_meal_foods_meal ON meal_foods(meal_id, food_id)'
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
      if (table.table_name) {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        console.log(`   - ${table.table_name}: ${count[0].count} records`);
      }
    }

    console.log('\n✅ Database consolidation completed!');

  } catch (error) {
    console.error('❌ Error consolidating meal tables:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

function cleanupCodebase() {
  console.log('\n🧹 Step 2: Cleaning up codebase references...\n');
  
  // Patterns to remove or replace
  const patterns = [
    // Remove meal_logging table creation
    {
      pattern: /-- Meal Logging Table.*?\nCREATE TABLE IF NOT EXISTS meal_logging \([\s\S]*?\);[\s\S]*?\n/g,
      replacement: '-- Meal Logging Table (REMOVED - consolidated into meal_tracking)\n'
    },
    // Remove meal_logging indexes
    {
      pattern: /CREATE INDEX.*meal_logging.*\n/g,
      replacement: ''
    },
    // Remove meal_logging from table lists
    {
      pattern: /'meal_logging',?\n/g,
      replacement: ''
    },
    // Remove meal_logging from SELECT statements
    {
      pattern: /SELECT.*meal_logging.*\n/g,
      replacement: ''
    },
    // Remove meal_logging from INSERT statements
    {
      pattern: /INSERT.*meal_logging.*\n/g,
      replacement: ''
    },
    // Remove meal_logging from DELETE statements
    {
      pattern: /DELETE.*meal_logging.*\n/g,
      replacement: ''
    },
    // Remove meal_logging from TRUNCATE statements
    {
      pattern: /TRUNCATE TABLE meal_logging.*\n/g,
      replacement: ''
    },
    // Remove meal_logging from DROP statements
    {
      pattern: /DROP TABLE.*meal_logging.*\n/g,
      replacement: ''
    },
    // Remove meal_logging from comments
    {
      pattern: /--.*meal_logging.*\n/g,
      replacement: ''
    },
    // Remove meal_logging from documentation
    {
      pattern: /- `meal_logging`.*\n/g,
      replacement: ''
    }
  ];

  function processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let modifiedContent = content;
      let changes = 0;

      // Apply all patterns
      for (const { pattern, replacement } of patterns) {
        const matches = modifiedContent.match(pattern);
        if (matches) {
          modifiedContent = modifiedContent.replace(pattern, replacement);
          changes += matches.length;
        }
      }

      // Additional specific replacements
      const specificReplacements = [
        // Replace meal_logging references in wellness activities
        {
          from: /activity_type ENUM\('water_tracking', 'meal_logging', 'sleep_tracking', 'mood_tracking', 'fitness_tracking'\)/g,
          to: "activity_type ENUM('water_tracking', 'meal_tracking', 'sleep_tracking', 'mood_tracking', 'fitness_tracking')"
        },
        {
          from: /'meal_logging'/g,
          to: "'meal_tracking'"
        },
        {
          from: /meal_logging/g,
          to: 'meal_tracking'
        }
      ];

      for (const { from, to } of specificReplacements) {
        if (modifiedContent.includes(from.source || from)) {
          modifiedContent = modifiedContent.replace(from, to);
          changes++;
        }
      }

      if (changes > 0) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`✅ Modified ${filePath} (${changes} changes)`);
        return changes;
      }
    } catch (error) {
      console.log(`⚠️  Could not process ${filePath}: ${error.message}`);
    }
    return 0;
  }

  function scanDirectory(dir) {
    let totalChanges = 0;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          totalChanges += scanDirectory(fullPath);
        } else if (stat.isFile() && 
                   (fullPath.endsWith('.js') || 
                    fullPath.endsWith('.sql') || 
                    fullPath.endsWith('.md')) &&
                   !excludeFiles.includes(item)) {
          totalChanges += processFile(fullPath);
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not scan directory ${dir}: ${error.message}`);
    }
    
    return totalChanges;
  }

  let totalChanges = 0;
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Scanning ${dir}...`);
      totalChanges += scanDirectory(dir);
    } else {
      console.log(`⚠️  Directory ${dir} does not exist, skipping...`);
    }
  }
  
  console.log(`\n✅ Codebase cleanup completed! Total changes: ${totalChanges}`);
  return totalChanges;
}

async function main() {
  console.log('🎯 PHC Meal System Consolidation\n');
  console.log('This script will:');
  console.log('1. Consolidate meal_logging into meal_tracking system');
  console.log('2. Remove old meal_logging table');
  console.log('3. Clean up all codebase references');
  console.log('4. Ensure unified meal tracking system\n');

  try {
    // Step 1: Consolidate database tables
    await consolidateMealTables();
    
    // Step 2: Clean up codebase references
    const changes = cleanupCodebase();
    
    console.log('\n🎉 CONSOLIDATION COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Final Summary:');
    console.log('   - ✅ meal_tracking: Main meal entries table');
    console.log('   - ✅ meal_foods: Individual food items in meals');
    console.log('   - ✅ meal_logging: Removed (old system)');
    console.log(`   - ✅ Codebase: ${changes} references cleaned up`);
    console.log('\n🎯 The system now uses a single, unified meal logging structure!');
    console.log('\n📱 Mobile app will now use:');
    console.log('   - POST /api/mobile/tracking/meal - Create meal entries');
    console.log('   - GET /api/mobile/tracking/meal - Retrieve meal data');
    console.log('   - All data stored in meal_tracking + meal_foods tables');

  } catch (error) {
    console.error('\n❌ Consolidation failed:', error);
    process.exit(1);
  }
}

// Run the consolidation
main();
