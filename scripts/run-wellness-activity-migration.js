const mysql = require('mysql2/promise');
require('dotenv').config();

async function runWellnessActivityMigration() {
  let connection;
  
  try {
    console.log('🔄 Starting wellness activity date migration...');
    
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

    // Check if activity_date column already exists
    console.log('\n📋 Checking if activity_date column exists...');
    const [columns] = await connection.execute(`
      DESCRIBE user_wellness_activities
    `);
    
    const hasActivityDate = columns.some(col => col.Field === 'activity_date');
    
    if (hasActivityDate) {
      console.log('✅ activity_date column already exists');
    } else {
      console.log('📋 Adding activity_date column...');
      
      // Add activity_date column
      await connection.execute(`
        ALTER TABLE user_wellness_activities 
        ADD COLUMN activity_date DATE NOT NULL DEFAULT (CURRENT_DATE) 
        AFTER activity_id
      `);
      
      console.log('✅ activity_date column added');

      // Add index for efficient date-based queries
      console.log('📋 Adding index for activity_date...');
      await connection.execute(`
        CREATE INDEX idx_user_wellness_activities_date 
        ON user_wellness_activities(user_id, activity_date)
      `);
      
      console.log('✅ Index added');

      // Update existing records to have activity_date based on completed_at
      console.log('📋 Updating existing records...');
      const [updateResult] = await connection.execute(`
        UPDATE user_wellness_activities 
        SET activity_date = DATE(completed_at) 
        WHERE activity_date = CURRENT_DATE
      `);
      
      console.log(`✅ Updated ${updateResult.affectedRows} records`);

      // Add unique constraint (check if it exists first)
      console.log('📋 Adding unique constraint...');
      try {
        await connection.execute(`
          ALTER TABLE user_wellness_activities 
          ADD UNIQUE KEY unique_user_activity_date (user_id, activity_id, activity_date)
        `);
        console.log('✅ Unique constraint added');
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('ℹ️ Unique constraint already exists, skipping...');
        } else {
          throw error;
        }
      }

      // Add comments
      console.log('📋 Adding column comments...');
      await connection.execute(`
        ALTER TABLE user_wellness_activities 
        MODIFY COLUMN activity_date DATE NOT NULL DEFAULT CURRENT_DATE 
        COMMENT 'Tanggal aktivitas wellness dilakukan, memungkinkan aktivitas yang sama untuk tanggal berbeda'
      `);
      
      await connection.execute(`
        ALTER TABLE user_wellness_activities 
        COMMENT = 'Tabel untuk melacak aktivitas wellness pengguna dengan dukungan tanggal spesifik'
      `);
      
      console.log('✅ Comments added');
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
      // Show sample records
      const [sampleResult] = await connection.execute(`
        SELECT user_id, activity_id, activity_date, completed_at 
        FROM user_wellness_activities 
        LIMIT 5
      `);
      
      console.log('📋 Sample records:');
      sampleResult.forEach(record => {
        console.log(`   - User ${record.user_id}, Activity ${record.activity_id}, Date: ${record.activity_date}, Completed: ${record.completed_at}`);
      });
    }

    console.log('\n🎉 Wellness activity date migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ activity_date column added to user_wellness_activities table');
    console.log('   ✅ Index created for efficient date-based queries');
    console.log('   ✅ Unique constraint added to prevent duplicates on same date');
    console.log('   ✅ Existing records updated with proper activity_date values');
    console.log('   ✅ Comments added for documentation');

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
runWellnessActivityMigration();
