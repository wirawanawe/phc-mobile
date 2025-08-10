const mysql = require('mysql2/promise');

// Database configuration - matching the dash-app settings
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function fixMealTrackingSchema() {
  console.log('🔧 Fixing meal_tracking table schema...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Check if meal_tracking table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'meal_tracking'"
    );

    if (tables.length === 0) {
      console.log('📋 Creating meal_tracking table...');
      await connection.execute(`
        CREATE TABLE meal_tracking (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          meal_name VARCHAR(255),
          calories DECIMAL(8,2),
          protein DECIMAL(8,2),
          carbs DECIMAL(8,2),
          fat DECIMAL(8,2),
          meal_date DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ meal_tracking table created');
    } else {
      console.log('📋 Updating meal_tracking table schema...');
      
      // Check if calories column exists
      const [columns] = await connection.execute(
        "SHOW COLUMNS FROM meal_tracking LIKE 'calories'"
      );
      
      if (columns.length === 0) {
        console.log('➕ Adding calories column...');
        await connection.execute(
          'ALTER TABLE meal_tracking ADD COLUMN calories DECIMAL(8,2)'
        );
      }
      
      // Check if protein column exists
      const [proteinColumns] = await connection.execute(
        "SHOW COLUMNS FROM meal_tracking LIKE 'protein'"
      );
      
      if (proteinColumns.length === 0) {
        console.log('➕ Adding protein column...');
        await connection.execute(
          'ALTER TABLE meal_tracking ADD COLUMN protein DECIMAL(8,2)'
        );
      }
      
      // Check if carbs column exists
      const [carbsColumns] = await connection.execute(
        "SHOW COLUMNS FROM meal_tracking LIKE 'carbs'"
      );
      
      if (carbsColumns.length === 0) {
        console.log('➕ Adding carbs column...');
        await connection.execute(
          'ALTER TABLE meal_tracking ADD COLUMN carbs DECIMAL(8,2)'
        );
      }
      
      // Check if fat column exists
      const [fatColumns] = await connection.execute(
        "SHOW COLUMNS FROM meal_tracking LIKE 'fat'"
      );
      
      if (fatColumns.length === 0) {
        console.log('➕ Adding fat column...');
        await connection.execute(
          'ALTER TABLE meal_tracking ADD COLUMN fat DECIMAL(8,2)'
        );
      }
      
      // Check if meal_date column exists
      const [mealDateColumns] = await connection.execute(
        "SHOW COLUMNS FROM meal_tracking LIKE 'meal_date'"
      );
      
      if (mealDateColumns.length === 0) {
        console.log('➕ Adding meal_date column...');
        await connection.execute(
          'ALTER TABLE meal_tracking ADD COLUMN meal_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP'
        );
      }
      
      console.log('✅ meal_tracking table schema updated');
    }

    console.log('\n🎉 Meal tracking schema fix completed!');

  } catch (error) {
    console.error('❌ Error fixing meal tracking schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the script
fixMealTrackingSchema(); 