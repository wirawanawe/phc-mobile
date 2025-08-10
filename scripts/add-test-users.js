const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pr1k1t1w',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function addTestUsers() {
  let connection;
  
  try {
    console.log('🚀 Adding test users for wellness activity system...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');
    
    // Test users to add
    const testUsers = [
      {
        name: 'Wellness User 1',
        email: 'wellness1@test.com',
        phone: '081234567890',
        date_of_birth: '1990-01-01',
        gender: 'male',
        password: '$2b$10$testpassword123', // Hashed password
        role: 'user',
        is_active: 1
      },
      {
        name: 'Wellness User 2',
        email: 'wellness2@test.com',
        phone: '081234567891',
        date_of_birth: '1992-05-15',
        gender: 'female',
        password: '$2b$10$testpassword123', // Hashed password
        role: 'user',
        is_active: 1
      },
      {
        name: 'Wellness User 3',
        email: 'wellness3@test.com',
        phone: '081234567892',
        date_of_birth: '1988-12-20',
        gender: 'male',
        password: '$2b$10$testpassword123', // Hashed password
        role: 'user',
        is_active: 1
      }
    ];
    
    console.log(`📝 Adding ${testUsers.length} test users...\n`);
    
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      
      try {
        // Check if user already exists
        const [existingUsers] = await connection.execute(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        );
        
        if (existingUsers.length > 0) {
          console.log(`⚠️  User ${user.email} already exists, skipping...`);
          continue;
        }
        
        // Insert new user
        const insertSql = `
          INSERT INTO users (name, email, phone, date_of_birth, gender, password, role, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const result = await connection.execute(insertSql, [
          user.name,
          user.email,
          user.phone,
          user.date_of_birth,
          user.gender,
          user.password,
          user.role,
          user.is_active
        ]);
        
        console.log(`✅ User ${user.email} added successfully (ID: ${result[0].insertId})`);
        
      } catch (error) {
        console.log(`❌ Error adding user ${user.email}: ${error.message}`);
      }
    }
    
    // Show all users
    console.log('\n📋 Current users in database:');
    const [users] = await connection.execute('SELECT id, name, email FROM users ORDER BY id');
    
    users.forEach(user => {
      console.log(`   ID: ${user.id} | Name: ${user.name} | Email: ${user.email}`);
    });
    
    console.log('\n🎉 Test users setup completed!');
    console.log('\n💡 You can now use these user IDs for testing:');
    users.forEach(user => {
      console.log(`   - User ID ${user.id}: ${user.name} (${user.email})`);
    });
    
  } catch (error) {
    console.error('❌ Error adding test users:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Main execution
if (require.main === module) {
  addTestUsers().catch(console.error);
}

module.exports = { addTestUsers }; 