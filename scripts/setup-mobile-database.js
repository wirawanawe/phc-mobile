const mysql = require('mysql2/promise');

// Database configuration - matching the dash-app settings
const dbConfig = {
      host: 'dash.doctorphc.id',
  user: 'root',
  password: 'pr1k1t1w', // Updated password
  database: 'phc_dashboard',
  port: 3306
};

async function setupMobileDatabase() {
  console.log('🔧 Setting up mobile database...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Create mobile_users table if it doesn't exist
    console.log('📋 Creating mobile_users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS mobile_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        height DECIMAL(5,2),
        weight DECIMAL(5,2),
        blood_type VARCHAR(5),
        wellness_program_joined BOOLEAN DEFAULT FALSE,
        wellness_join_date DATETIME,
        fitness_goal ENUM('weight_loss', 'muscle_gain', 'maintenance', 'general_health'),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ mobile_users table created');

    // Create missions table if it doesn't exist
    console.log('📋 Creating missions table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS missions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        points INT DEFAULT 0,
        target_value DECIMAL(10,2),
        unit VARCHAR(50),
        type VARCHAR(50) DEFAULT 'daily',
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
        icon VARCHAR(100),
        color VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ missions table created');

    // Create user_missions table if it doesn't exist
    console.log('📋 Creating user_missions table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_missions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        mission_id INT NOT NULL,
        status ENUM('active', 'completed', 'expired', 'cancelled') DEFAULT 'active',
        progress INT DEFAULT 0,
        current_value DECIMAL(10,2) DEFAULT 0,
        completed_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE,
        FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ user_missions table created');

    // Create tracking tables
    console.log('📋 Creating tracking tables...');
    
    // Water tracking
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

    // Sleep tracking
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

    // Mood tracking
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

    // Health data
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

    // Meal tracking
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

    // Fitness tracking
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

    console.log('✅ All tracking tables created');

    // Insert sample missions if they don't exist
    console.log('📋 Adding sample missions...');
    const [existingMissions] = await connection.execute('SELECT COUNT(*) as count FROM missions');
    
    if (existingMissions[0].count === 0) {
      const sampleMissions = [
        {
          title: 'Minum Air 8 Gelas',
          description: 'Minum minimal 8 gelas air putih dalam sehari untuk menjaga hidrasi tubuh',
          category: 'daily_habit',
          points: 15,
          target_value: 8,
          unit: 'gelas',
          type: 'daily',
          difficulty: 'easy',
          icon: 'check-circle',
          color: '#10B981'
        },
        {
          title: 'Olahraga 30 Menit',
          description: 'Lakukan olahraga atau aktivitas fisik selama minimal 30 menit',
          category: 'fitness',
          points: 25,
          target_value: 30,
          unit: 'menit',
          type: 'daily',
          difficulty: 'medium',
          icon: 'dumbbell',
          color: '#F59E0B'
        },
        {
          title: 'Catat Mood Harian',
          description: 'Catat mood dan perasaan Anda setiap hari untuk tracking kesehatan mental',
          category: 'mental_health',
          points: 10,
          target_value: 1,
          unit: 'kali',
          type: 'daily',
          difficulty: 'easy',
          icon: 'brain',
          color: '#8B5CF6'
        }
      ];

      for (const mission of sampleMissions) {
        await connection.execute(`
          INSERT INTO missions (title, description, category, points, target_value, unit, type, difficulty, icon, color)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          mission.title, mission.description, mission.category, mission.points,
          mission.target_value, mission.unit, mission.type, mission.difficulty,
          mission.icon, mission.color
        ]);
      }
      console.log('✅ Sample missions added');
    } else {
      console.log('ℹ️  Missions already exist');
    }

    // Create test user if it doesn't exist
    console.log('📋 Creating test user...');
    const [existingUsers] = await connection.execute(
      'SELECT id, name, email FROM mobile_users WHERE email = ?',
      ['test@mobile.com']
    );

    let userId;
    if (existingUsers.length === 0) {
      const [result] = await connection.execute(
        `INSERT INTO mobile_users (
          name, email, password, phone, date_of_birth, gender, height, weight, 
          blood_type, wellness_program_joined, wellness_join_date, fitness_goal, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [
          'Mobile Test User', 'test@mobile.com', 'password123', '+6281234567890',
          '1990-01-01', 'male', 170, 70, 'O+', true, 'weight_loss', 1
        ]
      );
      userId = result.insertId;
      console.log('✅ Test user created with ID:', userId);
    } else {
      userId = existingUsers[0].id;
      console.log('ℹ️  Test user already exists with ID:', userId);
    }

    // Add sample missions for the test user
    console.log('📋 Adding sample missions for test user...');
    const [missions] = await connection.execute('SELECT id FROM missions LIMIT 3');
    
    if (missions.length > 0) {
      for (const mission of missions) {
        // Check if user already has this mission
        const [existingUserMission] = await connection.execute(
          'SELECT id FROM user_missions WHERE user_id = ? AND mission_id = ?',
          [userId, mission.id]
        );

        if (existingUserMission.length === 0) {
          await connection.execute(
            `INSERT INTO user_missions (user_id, mission_id, status, progress, current_value)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, mission.id, 'active', 0, 0]
          );
        }
      }
      console.log('✅ Sample missions added for test user');
    }

    console.log('\n🎉 Mobile database setup completed!');
    console.log('You can now use these credentials to test the mobile app:');
    console.log('Email: test@mobile.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Error setting up mobile database:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the script
setupMobileDatabase(); 