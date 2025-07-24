const mysql = require("mysql2/promise");
require("dotenv").config();

const setupDatabase = async () => {
  try {
    console.log("🗄️  Setting up MySQL database...");

    // Create connection without database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || "phc_mobile";
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created/verified`);

    // Use the database
    await connection.query(`USE ${dbName}`);

    // Create tables manually (as backup to Sequelize sync)
    const createTables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(500),
        phone VARCHAR(20),
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        height DECIMAL(5,2),
        weight DECIMAL(5,2),
        activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active') DEFAULT 'moderately_active',
        health_goals JSON,
        medical_history JSON,
        preferences JSON,
        points INT DEFAULT 0,
        streak_days INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        last_login DATETIME,
        reset_password_token VARCHAR(255),
        reset_password_expires DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_points (points),
        INDEX idx_created_at (created_at)
      )`,

      `CREATE TABLE IF NOT EXISTS health_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL DEFAULT (CURRENT_DATE),
        blood_pressure_systolic INT,
        blood_pressure_diastolic INT,
        heart_rate INT,
        temperature DECIMAL(4,1),
        oxygen_saturation INT,
        weight DECIMAL(5,2),
        height DECIMAL(5,2),
        bmi DECIMAL(4,2),
        body_fat DECIMAL(4,1),
        sleep_duration DECIMAL(3,1),
        sleep_quality ENUM('poor', 'fair', 'good', 'excellent'),
        deep_sleep DECIMAL(3,1),
        rem_sleep DECIMAL(3,1),
        steps INT,
        calories_burned INT,
        active_minutes INT,
        exercise_minutes INT,
        custom_metrics JSON,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, date),
        INDEX idx_date (date)
      )`,

      `CREATE TABLE IF NOT EXISTS assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('health_risk', 'fitness', 'nutrition', 'mental_health', 'sleep', 'custom') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        questions JSON NOT NULL,
        answers JSON NOT NULL,
        score INT,
        result ENUM('low_risk', 'moderate_risk', 'high_risk', 'excellent', 'good', 'fair', 'poor'),
        recommendations JSON,
        completed_at DATETIME,
        is_completed BOOLEAN DEFAULT FALSE,
        estimated_duration INT,
        category VARCHAR(100),
        tags JSON,
        version VARCHAR(20) DEFAULT '1.0',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_type (user_id, type),
        INDEX idx_type_completed (type, is_completed),
        INDEX idx_completed_at (completed_at)
      )`,
    ];

    for (const createTable of createTables) {
      await connection.query(createTable);
    }

    console.log("✅ Database tables created/verified");

    // Close connection
    await connection.end();

    console.log("🎉 Database setup completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Run: npm run seed (to populate with sample data)");
    console.log("2. Run: npm run dev (to start the server)");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure MySQL is running");
    console.log("2. Check your database credentials in .env file");
    console.log("3. Ensure the database user has CREATE privileges");
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
