const mysql = require('mysql2/promise');
require('dotenv').config();

async function testLoginEndpoint() {
  let connection;
  
  try {
    console.log('🧪 Testing login endpoint functionality...\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pr1k1t1w',
      database: process.env.DB_NAME || 'phc_dashboard',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database');

    // Check if mobile_users table exists
    console.log('\n📋 Checking mobile_users table...');
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'mobile_users'
    `);
    
    if (tables.length === 0) {
      console.log('❌ mobile_users table does not exist');
      return;
    }
    console.log('✅ mobile_users table exists');

    // Check mobile_users table structure
    console.log('\n📋 Checking mobile_users table structure...');
    const [columns] = await connection.execute(`
      DESCRIBE mobile_users
    `);
    
    console.log('✅ mobile_users table structure:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Check if there are any users in mobile_users
    console.log('\n📋 Checking mobile_users data...');
    const [users] = await connection.execute(`
      SELECT id, name, email, is_active, created_at
      FROM mobile_users
      LIMIT 5
    `);
    
    console.log('✅ mobile_users data:');
    if (users.length === 0) {
      console.log('   No users found in mobile_users table');
    } else {
      users.forEach(user => {
        console.log(`   - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Active: ${user.is_active}`);
      });
    }

    // Check health_data table
    console.log('\n📋 Checking health_data table...');
    const [healthTables] = await connection.execute(`
      SHOW TABLES LIKE 'health_data'
    `);
    
    if (healthTables.length === 0) {
      console.log('❌ health_data table does not exist');
    } else {
      console.log('✅ health_data table exists');
      
      // Check health_data structure
      const [healthColumns] = await connection.execute(`
        DESCRIBE health_data
      `);
      
      console.log('✅ health_data table structure:');
      healthColumns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }

    // Test the exact query from login endpoint
    console.log('\n📋 Testing login query...');
    try {
      const [testUser] = await connection.execute(`
        SELECT mu.id, mu.name, mu.email, mu.password, mu.phone, mu.date_of_birth, mu.gender, 
               mu.is_active, mu.ktp_number, mu.address, mu.insurance, mu.insurance_card_number,
               MAX(CASE WHEN hd.data_type = 'height' THEN hd.value END) as height,
               MAX(CASE WHEN hd.data_type = 'weight' THEN hd.value END) as weight
        FROM mobile_users mu
        LEFT JOIN health_data hd ON mu.id = hd.user_id AND hd.data_type IN ('height', 'weight')
        WHERE mu.email = ?
        GROUP BY mu.id
      `, ['test@mobile.com']);
      
      console.log('✅ Login query executed successfully');
      if (testUser.length > 0) {
        console.log(`   Found user: ${testUser[0].name} (${testUser[0].email})`);
      } else {
        console.log('   No user found with test@mobile.com');
      }
    } catch (queryError) {
      console.log('❌ Login query failed:', queryError.message);
    }

    // Check environment variables
    console.log('\n📋 Checking environment variables...');
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   DB_USER: ${process.env.DB_USER || 'root'}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'phc_dashboard'}`);

    // Test JWT creation
    console.log('\n📋 Testing JWT creation...');
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET not set - this will cause login to fail');
    } else {
      console.log('✅ JWT_SECRET is set');
    }

    console.log('\n🎉 Login endpoint test completed!');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testLoginEndpoint();
