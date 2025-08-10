const mysql = require('mysql2/promise');

// Database configuration - matching the dash-app settings
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'phc_dashboard', // Changed from phc_mobile to phc_dashboard
  port: 3306
};

async function createTestUser() {
  console.log('🔧 Creating test user...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Check if test user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id, name, email FROM mobile_users WHERE email = ?',
      ['test@example.com']
    );

    if (existingUsers.length > 0) {
      console.log('ℹ️  Test user already exists:', existingUsers[0]);
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
        is_active,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'Test User',
        'test@example.com',
        'password123', // Plain text for testing
        '+6281234567890',
        '1990-01-01',
        'male',
        170,
        70,
        'O+',
        1 // Active
      ]
    );

    console.log('✅ Test user created successfully');
    console.log('User ID:', result.insertId);
    console.log('Email: test@example.com');
    console.log('Password: password123');

    // Add some sample missions for the test user
    console.log('\n🔧 Adding sample missions...');
    
    // Get available missions
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

    console.log('\n🎉 Test user setup completed!');
    console.log('You can now use these credentials to test the API:');
    console.log('Email: test@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the script
createTestUser(); 