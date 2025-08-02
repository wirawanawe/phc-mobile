const mysql = require('mysql2/promise');

// Database configuration - matching the dash-app settings
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'phc_dashboard',
  port: 3306
};

async function createMobileTestUser() {
  console.log('🔧 Creating mobile test user...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Check if mobile_users table exists, if not create it
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'mobile_users'"
    );

    if (tables.length === 0) {
      console.log('📋 Creating mobile_users table...');
      await connection.execute(`
        CREATE TABLE mobile_users (
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
    }

    // Check if test user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id, name, email FROM mobile_users WHERE email = ?',
      ['test@mobile.com']
    );

    if (existingUsers.length > 0) {
      console.log('ℹ️  Mobile test user already exists:', existingUsers[0]);
      return;
    }

    // Create test user
    const [result] = await connection.execute(
      `INSERT INTO mobile_users (
        name, 
        email, 
        password, 
        phone, 
        date_of_birth, 
        gender, 
        height, 
        weight, 
        blood_type, 
        wellness_program_joined,
        wellness_join_date,
        fitness_goal,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        'Mobile Test User',
        'test@mobile.com',
        'password123', // Plain text for testing
        '+6281234567890',
        '1990-01-01',
        'male',
        170,
        70,
        'O+',
        true, // wellness_program_joined
        'weight_loss', // fitness_goal
        1 // is_active
      ]
    );

    console.log('✅ Mobile test user created successfully');
    console.log('User ID:', result.insertId);
    console.log('Email: test@mobile.com');
    console.log('Password: password123');

    // Add some sample missions for the test user
    console.log('\n🔧 Adding sample missions...');
    
    // Check if missions table exists and has data
    const [missions] = await connection.execute('SELECT id FROM missions LIMIT 3');
    
    if (missions.length > 0) {
      for (const mission of missions) {
        await connection.execute(
          `INSERT INTO user_missions (
            user_id, 
            mission_id, 
            status, 
            progress, 
            current_value,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            result.insertId,
            mission.id,
            'active',
            0,
            0
          ]
        );
      }
      console.log('✅ Sample missions added');
    }

    console.log('\n🎉 Mobile test user setup completed!');
    console.log('You can now use these credentials to test the mobile app:');
    console.log('Email: test@mobile.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Error creating mobile test user:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the script
createMobileTestUser(); 