const mysql = require('mysql2/promise');
require('dotenv').config();

async function runActivityTypeMigration() {
  let connection;
  
  try {
    console.log('🔄 Starting activity_type migration...');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pr1k1t1w',
      database: process.env.DB_NAME || 'phc_dashboard',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database');

    // Check if user_wellness_activities table exists
    console.log('\n📋 Checking user_wellness_activities table...');
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'user_wellness_activities'
    `);
    
    if (tables.length === 0) {
      console.log('❌ user_wellness_activities table does not exist');
      return;
    }

    console.log('✅ user_wellness_activities table exists');

    // Check if activity_type column already exists
    console.log('\n📋 Checking if activity_type column exists...');
    const [columns] = await connection.execute(`
      DESCRIBE user_wellness_activities
    `);
    
    const hasActivityType = columns.some(col => col.Field === 'activity_type');
    
    if (hasActivityType) {
      console.log('✅ activity_type column already exists');
    } else {
      console.log('📋 Adding activity_type column...');
      
      // Add activity_type column
      await connection.execute(`
        ALTER TABLE user_wellness_activities 
        ADD COLUMN activity_type ENUM('normal', 'intense', 'relaxed') NOT NULL DEFAULT 'normal' 
        AFTER notes
      `);
      
      console.log('✅ activity_type column added');

      // Add comment
      console.log('📋 Adding column comment...');
      await connection.execute(`
        ALTER TABLE user_wellness_activities 
        MODIFY COLUMN activity_type ENUM('normal', 'intense', 'relaxed') NOT NULL DEFAULT 'normal' 
        COMMENT 'Tipe aktivitas: normal (x1), intense (x1.5), relaxed (x0.8)'
      `);
      
      console.log('✅ Comment added');

      // Update table comment
      console.log('📋 Updating table comment...');
      await connection.execute(`
        ALTER TABLE user_wellness_activities 
        COMMENT = 'Tabel untuk melacak aktivitas wellness pengguna dengan dukungan tanggal spesifik dan tipe aktivitas'
      `);
      
      console.log('✅ Table comment updated');
    }

    // Verify the changes
    console.log('\n📋 Verifying table structure...');
    const [finalColumns] = await connection.execute(`
      DESCRIBE user_wellness_activities
    `);
    
    console.log('✅ Final table structure:');
    finalColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Test the functionality
    console.log('\n🧪 Testing functionality...');
    
    // Check if there are any existing records
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total FROM user_wellness_activities
    `);
    
    console.log(`📊 Total wellness activities: ${countResult[0].total}`);
    
    if (countResult[0].total > 0) {
      // Show sample records with activity_type
      const [sampleResult] = await connection.execute(`
        SELECT user_id, activity_id, activity_date, activity_type, duration_minutes, notes 
        FROM user_wellness_activities 
        LIMIT 5
      `);
      
      console.log('📋 Sample records:');
      sampleResult.forEach(record => {
        console.log(`   - User ${record.user_id}, Activity ${record.activity_id}, Date: ${record.activity_date}, Type: ${record.activity_type || 'normal'}, Duration: ${record.duration_minutes}min`);
      });
    }

    console.log('\n🎉 Activity type migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ activity_type column added to user_wellness_activities table');
    console.log('   ✅ ENUM values: normal, intense, relaxed');
    console.log('   ✅ Default value: normal');
    console.log('   ✅ Comments added for documentation');
    console.log('\n🔧 Point calculation multipliers:');
    console.log('   - normal: x1.0');
    console.log('   - intense: x1.5');
    console.log('   - relaxed: x0.8');

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
runActivityTypeMigration();
