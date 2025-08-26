const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'phc_dashboard',
  port: 3306
};

async function addPinFieldsToDatabase() {
  console.log('🔐 Adding PIN fields to mobile_users table...\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Check if PIN fields already exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'phc_dashboard' 
      AND TABLE_NAME = 'mobile_users' 
      AND COLUMN_NAME IN ('pin_enabled', 'pin_code', 'pin_attempts')
    `);

    if (columns.length > 0) {
      console.log('ℹ️  PIN fields already exist in mobile_users table');
      console.log('Found columns:', columns.map(col => col.COLUMN_NAME).join(', '));
      
      // Show current PIN status
      const [pinStatus] = await connection.execute(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN pin_enabled = TRUE THEN 1 ELSE 0 END) as users_with_pin_enabled,
          SUM(CASE WHEN pin_enabled = FALSE THEN 1 ELSE 0 END) as users_without_pin,
          SUM(CASE WHEN pin_code IS NOT NULL THEN 1 ELSE 0 END) as users_with_pin_code,
          SUM(CASE WHEN pin_attempts > 0 THEN 1 ELSE 0 END) as users_with_failed_attempts
        FROM mobile_users
      `);
      
      console.log('\n📊 Current PIN Status:');
      console.log('  Total Users:', pinStatus[0].total_users);
      console.log('  Users with PIN Enabled:', pinStatus[0].users_with_pin_enabled);
      console.log('  Users without PIN:', pinStatus[0].users_without_pin);
      console.log('  Users with PIN Code:', pinStatus[0].users_with_pin_code);
      console.log('  Users with Failed Attempts:', pinStatus[0].users_with_failed_attempts);
      
      return;
    }

    // Add PIN fields to mobile_users table
    console.log('📋 Adding PIN fields to mobile_users table...');
    
    await connection.execute(`
      ALTER TABLE mobile_users 
      ADD COLUMN pin_enabled BOOLEAN DEFAULT FALSE COMMENT 'Status aktif/nonaktif PIN keamanan',
      ADD COLUMN pin_code VARCHAR(255) NULL COMMENT 'PIN keamanan (6 digit) - encrypted',
      ADD COLUMN pin_attempts INT DEFAULT 0 COMMENT 'Jumlah percobaan PIN yang salah',
      ADD COLUMN pin_locked_until DATETIME NULL COMMENT 'Waktu PIN terkunci sampai',
      ADD COLUMN pin_last_attempt DATETIME NULL COMMENT 'Waktu percobaan PIN terakhir'
    `);
    
    console.log('✅ PIN fields added successfully');

    // Add indexes for better performance
    console.log('📋 Adding indexes for PIN fields...');
    
    try {
      await connection.execute('CREATE INDEX idx_pin_enabled ON mobile_users(pin_enabled)');
      await connection.execute('CREATE INDEX idx_pin_locked_until ON mobile_users(pin_locked_until)');
      console.log('✅ Indexes created successfully');
    } catch (error) {
      console.log('⚠️  Some indexes may already exist:', error.message);
    }

    // Show migration results
    console.log('\n📊 Migration Results:');
    
    const [results] = await connection.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN pin_enabled = TRUE THEN 1 ELSE 0 END) as users_with_pin_enabled,
        SUM(CASE WHEN pin_enabled = FALSE THEN 1 ELSE 0 END) as users_without_pin,
        SUM(CASE WHEN pin_code IS NOT NULL THEN 1 ELSE 0 END) as users_with_pin_code,
        SUM(CASE WHEN pin_attempts > 0 THEN 1 ELSE 0 END) as users_with_failed_attempts
      FROM mobile_users
    `);
    
    console.log('  Total Users:', results[0].total_users);
    console.log('  Users with PIN Enabled:', results[0].users_with_pin_enabled);
    console.log('  Users without PIN:', results[0].users_without_pin);
    console.log('  Users with PIN Code:', results[0].users_with_pin_code);
    console.log('  Users with Failed Attempts:', results[0].users_with_failed_attempts);

    // Show table structure
    console.log('\n📋 Updated mobile_users table structure:');
    const [structure] = await connection.execute('DESCRIBE mobile_users');
    
    const pinColumns = structure.filter(col => col.Field.startsWith('pin_'));
    pinColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    console.log('\n🎉 PIN fields migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Restart your application');
    console.log('2. Test PIN feature in the mobile app');
    console.log('3. Users can now enable PIN security from Profile → Pengaturan PIN');

  } catch (error) {
    console.error('❌ Error adding PIN fields:', error.message);
    
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Some PIN fields may already exist. Check the table structure.');
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
if (require.main === module) {
  addPinFieldsToDatabase()
    .then(() => {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error.message);
      process.exit(1);
    });
}

module.exports = { addPinFieldsToDatabase };
