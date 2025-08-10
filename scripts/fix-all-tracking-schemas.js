const mysql = require('mysql2/promise');

// Database configuration - matching the dash-app settings
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function fixAllTrackingSchemas() {
  console.log('🔧 Fixing all tracking table schemas...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Fix meal_tracking table
    console.log('📋 Fixing meal_tracking table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS meal_tracking (
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
    
    // Add missing columns to meal_tracking if they don't exist
    const mealColumns = ['calories', 'protein', 'carbs', 'fat', 'meal_date'];
    for (const column of mealColumns) {
      const [exists] = await connection.execute(
        `SHOW COLUMNS FROM meal_tracking LIKE '${column}'`
      );
      if (exists.length === 0) {
        console.log(`➕ Adding ${column} column to meal_tracking...`);
        if (column === 'meal_date') {
          await connection.execute(
            `ALTER TABLE meal_tracking ADD COLUMN ${column} DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`
          );
        } else {
          await connection.execute(
            `ALTER TABLE meal_tracking ADD COLUMN ${column} DECIMAL(8,2)`
          );
        }
      }
    }

    // Fix fitness_tracking table
    console.log('📋 Fixing fitness_tracking table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS fitness_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        exercise_type VARCHAR(100),
        exercise_minutes INT,
        steps INT,
        distance_km DECIMAL(5,2),
        tracking_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE
      )
    `);
    
    // Add missing columns to fitness_tracking if they don't exist
    const fitnessColumns = ['exercise_minutes', 'steps', 'distance_km'];
    for (const column of fitnessColumns) {
      const [exists] = await connection.execute(
        `SHOW COLUMNS FROM fitness_tracking LIKE '${column}'`
      );
      if (exists.length === 0) {
        console.log(`➕ Adding ${column} column to fitness_tracking...`);
        if (column === 'steps' || column === 'exercise_minutes') {
          await connection.execute(
            `ALTER TABLE fitness_tracking ADD COLUMN ${column} INT`
          );
        } else {
          await connection.execute(
            `ALTER TABLE fitness_tracking ADD COLUMN ${column} DECIMAL(5,2)`
          );
        }
      }
    }

    // Fix water_tracking table
    console.log('📋 Fixing water_tracking table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS water_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount_ml INT NOT NULL,
        tracking_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE
      )
    `);

    // Fix sleep_tracking table
    console.log('📋 Fixing sleep_tracking table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sleep_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        sleep_duration_minutes INT NOT NULL,
        sleep_quality ENUM('poor', 'fair', 'good', 'excellent'),
        sleep_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE
      )
    `);

    // Fix mood_tracking table
    console.log('📋 Fixing mood_tracking table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS mood_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        mood_level ENUM('very_bad', 'bad', 'neutral', 'good', 'excellent'),
        energy_level ENUM('very_low', 'low', 'medium', 'high', 'very_high'),
        tracking_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE
      )
    `);

    // Fix health_data table
    console.log('📋 Fixing health_data table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS health_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        data_type VARCHAR(100) NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        unit VARCHAR(50),
        measured_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ All tracking table schemas fixed!');

  } catch (error) {
    console.error('❌ Error fixing tracking schemas:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the script
fixAllTrackingSchemas(); 