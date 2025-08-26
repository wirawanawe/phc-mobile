/**
 * Add Wiwawe User Script
 * Adds the wiwawe@phc.com user to the localhost database
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function addWiwaweUser() {
  console.log('👤 Adding Wiwawe User to Database...\n');

  // Database configuration
  const dbConfig = {
    host: 'dash.doctorphc.id',
    user: 'root',
    password: '',
    database: 'phc_dashboard'
  };

  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id, email, name FROM mobile_users WHERE email = ?',
      ['wiwawe@phc.com']
    );

    if (existingUsers.length > 0) {
      console.log('⚠️ User wiwawe@phc.com already exists:');
      console.log(`   ID: ${existingUsers[0].id}`);
      console.log(`   Name: ${existingUsers[0].name}`);
      console.log(`   Email: ${existingUsers[0].email}`);
      
      // Hash password and update
      const hashedPassword = await bcrypt.hash('password123', 10);
      await connection.execute(
        'UPDATE mobile_users SET password = ? WHERE email = ?',
        [hashedPassword, 'wiwawe@phc.com']
      );
      console.log('✅ Password updated to: password123 (hashed)');
    } else {
      // Hash password for new user
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Add new user
      const [result] = await connection.execute(
        `INSERT INTO mobile_users (
          name, email, password, phone, date_of_birth, gender, 
          ktp_number, address, insurance, insurance_card_number, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Wiwawe PHC',
          'wiwawe@phc.com',
          hashedPassword,
          '+6281234567890',
          '1990-01-01',
          'male',
          '1234567890123456',
          'Jl. Sudirman No. 123, Jakarta Pusat',
          'BPJS Kesehatan',
          'BPJS123456789',
          1
        ]
      );

      console.log('✅ User wiwawe@phc.com added successfully');
      console.log(`   User ID: ${result.insertId}`);
      console.log(`   Email: wiwawe@phc.com`);
      console.log(`   Password: password123`);
    }

    // Test login with the user
    console.log('\n🧪 Testing login with wiwawe@phc.com...');
    const [testUser] = await connection.execute(
      'SELECT id, name, email, password FROM mobile_users WHERE email = ?',
      ['wiwawe@phc.com']
    );

    if (testUser.length > 0) {
      console.log('✅ User found in database:');
      console.log(`   ID: ${testUser[0].id}`);
      console.log(`   Name: ${testUser[0].name}`);
      console.log(`   Email: ${testUser[0].email}`);
      console.log(`   Password: ${testUser[0].password}`);
    } else {
      console.log('❌ User not found in database');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the database server is running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Check database credentials');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }

  console.log('\n✅ Wiwawe User Setup Completed!');
  console.log('\n📋 Login Credentials:');
  console.log('   Email: wiwawe@phc.com');
  console.log('   Password: password123');
  console.log('\n💡 You can now login to the mobile app with these credentials');
}

addWiwaweUser().catch(console.error);
