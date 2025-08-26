import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../dash-app/.env.local') });

const dbConfig = {
  host: process.env.DB_HOST || 'dash.doctorphc.id',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pr1k1t1w',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function fixMealTablesProduction() {
  let connection;
  
  try {
    console.log('🔧 Fixing meal tables in production database...\n');
    
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to production database');

    // Check current table structure
    console.log('\n📋 Checking current table structure...');
    
    const tables = await connection.execute("SHOW TABLES LIKE 'meal_%'");
    console.log('Current meal-related tables:');
    tables[0].forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // Check if meal_tracking table exists
    const mealTrackingTables = await connection.execute("SHOW TABLES LIKE 'meal_tracking'");
    const hasMealTracking = mealTrackingTables[0].length > 0;

    // Check if meal_foods table exists
    const mealFoodsTables = await connection.execute("SHOW TABLES LIKE 'meal_foods'");
    const hasMealFoods = mealFoodsTables[0].length > 0;

    // Check if meal_logging table exists
    const mealLoggingTables = await connection.execute("SHOW TABLES LIKE 'meal_logging'");
    const hasMealLogging = mealLoggingTables[0].length > 0;

    console.log('\n📊 Table Status:');
    console.log(`   meal_tracking: ${hasMealTracking ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   meal_foods: ${hasMealFoods ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   meal_logging: ${hasMealLogging ? '✅ EXISTS' : '❌ MISSING'}`);

    // Create meal_tracking table if it doesn't exist
    if (!hasMealTracking) {
      console.log('\n🔧 Creating meal_tracking table...');
      const createMealTrackingSQL = `
        CREATE TABLE meal_tracking (
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
      console.log('   ✅ meal_tracking table created');
    } else {
      console.log('   ℹ️ meal_tracking table already exists');
    }

    // Create meal_foods table if it doesn't exist
    if (!hasMealFoods) {
      console.log('\n🔧 Creating meal_foods table...');
      const createMealFoodsSQL = `
        CREATE TABLE meal_foods (
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
          
          INDEX idx_meal_id (meal_id),
          INDEX idx_food_id (food_id)
        )
      `;
      
      await connection.execute(createMealFoodsSQL);
      console.log('   ✅ meal_foods table created');
    } else {
      console.log('   ℹ️ meal_foods table already exists');
    }

    // Check if food_database table exists
    const foodDatabaseTables = await connection.execute("SHOW TABLES LIKE 'food_database'");
    const hasFoodDatabase = foodDatabaseTables[0].length > 0;

    if (!hasFoodDatabase) {
      console.log('\n🔧 Creating food_database table...');
      const createFoodDatabaseSQL = `
        CREATE TABLE food_database (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          name_indonesian VARCHAR(255),
          category VARCHAR(100) NOT NULL,
          calories_per_100g DECIMAL(6,2) NOT NULL,
          protein_per_100g DECIMAL(6,2) NOT NULL DEFAULT 0,
          carbs_per_100g DECIMAL(6,2) NOT NULL DEFAULT 0,
          fat_per_100g DECIMAL(6,2) NOT NULL DEFAULT 0,
          fiber_per_100g DECIMAL(6,2) NOT NULL DEFAULT 0,
          sugar_per_100g DECIMAL(6,2) NOT NULL DEFAULT 0,
          sodium_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
          serving_size VARCHAR(100),
          serving_weight DECIMAL(6,2),
          barcode VARCHAR(50),
          image_url VARCHAR(500),
          is_verified BOOLEAN NOT NULL DEFAULT FALSE,
          source ENUM('manual', 'api', 'ai_scan') NOT NULL DEFAULT 'manual',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_name (name),
          INDEX idx_category (category),
          INDEX idx_barcode (barcode),
          INDEX idx_verified (is_verified)
        )
      `;
      
      await connection.execute(createFoodDatabaseSQL);
      console.log('   ✅ food_database table created');
    } else {
      console.log('   ℹ️ food_database table already exists');
    }

    // Add foreign key constraints if they don't exist
    console.log('\n🔧 Checking foreign key constraints...');
    
    try {
      // Add foreign key for meal_foods.meal_id -> meal_tracking.id
      await connection.execute(`
        ALTER TABLE meal_foods 
        ADD CONSTRAINT fk_meal_foods_meal_id 
        FOREIGN KEY (meal_id) REFERENCES meal_tracking(id) ON DELETE CASCADE
      `);
      console.log('   ✅ Added foreign key: meal_foods.meal_id -> meal_tracking.id');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ℹ️ Foreign key meal_foods.meal_id already exists');
      } else {
        console.log('   ⚠️ Could not add foreign key meal_foods.meal_id:', error.message);
      }
    }

    try {
      // Add foreign key for meal_foods.food_id -> food_database.id
      await connection.execute(`
        ALTER TABLE meal_foods 
        ADD CONSTRAINT fk_meal_foods_food_id 
        FOREIGN KEY (food_id) REFERENCES food_database(id) ON DELETE CASCADE
      `);
      console.log('   ✅ Added foreign key: meal_foods.food_id -> food_database.id');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ℹ️ Foreign key meal_foods.food_id already exists');
      } else {
        console.log('   ⚠️ Could not add foreign key meal_foods.food_id:', error.message);
      }
    }

    // Create indexes for better performance
    console.log('\n📈 Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX idx_meal_tracking_user_date ON meal_tracking(user_id, recorded_at)',
      'CREATE INDEX idx_meal_foods_meal ON meal_foods(meal_id, food_id)'
    ];

    for (const indexSQL of indexes) {
      try {
        await connection.execute(indexSQL);
        console.log(`   ✅ Created index: ${indexSQL.split(' ')[2]}`);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`   ℹ️ Index already exists: ${indexSQL.split(' ')[2]}`);
        } else {
          console.log(`   ⚠️ Could not create index: ${error.message}`);
        }
      }
    }

    // Verify final structure
    console.log('\n📋 Final table structure verification...');
    
    const finalTables = await connection.execute("SHOW TABLES LIKE 'meal_%'");
    console.log('Final meal-related tables:');
    finalTables[0].forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    console.log('\n🎉 Meal tables fixed successfully!');
    console.log('\n📱 Mobile app should now work correctly with:');
    console.log('   - meal_tracking: Main meal entries');
    console.log('   - meal_foods: Individual food items in meals');
    console.log('   - food_database: Food reference data');

  } catch (error) {
    console.error('\n❌ Error fixing meal tables:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
fixMealTablesProduction().catch(console.error);
