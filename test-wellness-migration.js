const mysql = require('mysql2/promise');

// Test script untuk memverifikasi wellness data migration
async function testWellnessMigration() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'your_password', // Ganti dengan password MySQL Anda
      database: 'phc_dashboard'
    });

    console.log('🔍 Testing Wellness Data Migration...\n');

    // 1. Test struktur tabel mobile_users
    console.log('1. Checking mobile_users table structure...');
    const [mobileUsersColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'phc_dashboard' 
      AND TABLE_NAME = 'mobile_users'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Mobile Users Columns:');
    mobileUsersColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // 2. Test struktur tabel health_data
    console.log('\n2. Checking health_data table structure...');
    const [healthDataColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'phc_dashboard' 
      AND TABLE_NAME = 'health_data'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Health Data Columns:');
    healthDataColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // 3. Test data migration
    console.log('\n3. Checking migrated data...');
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM mobile_users');
    const [healthDataCount] = await connection.execute('SELECT COUNT(*) as count FROM health_data');
    const [weightData] = await connection.execute('SELECT COUNT(*) as count FROM health_data WHERE data_type = "weight"');
    const [heightData] = await connection.execute('SELECT COUNT(*) as count FROM health_data WHERE data_type = "height"');
    
    console.log(`Total Users: ${userCount[0].count}`);
    console.log(`Total Health Data Records: ${healthDataCount[0].count}`);
    console.log(`Weight Records: ${weightData[0].count}`);
    console.log(`Height Records: ${heightData[0].count}`);

    // 4. Test wellness columns
    console.log('\n4. Checking wellness columns...');
    const [wellnessUsers] = await connection.execute('SELECT COUNT(*) as count FROM mobile_users WHERE wellness_program_joined = 1');
    console.log(`Users with wellness_program_joined = true: ${wellnessUsers[0].count}`);

    // 5. Test sample data
    console.log('\n5. Sample data verification...');
    const [sampleUser] = await connection.execute(`
      SELECT id, name, email, date_of_birth, wellness_program_joined, fitness_goal, activity_level
      FROM mobile_users 
      LIMIT 1
    `);
    
    if (sampleUser.length > 0) {
      const user = sampleUser[0];
      console.log('Sample User:');
      console.log(`  - ID: ${user.id}`);
      console.log(`  - Name: ${user.name}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Date of Birth: ${user.date_of_birth}`);
      console.log(`  - Wellness Joined: ${user.wellness_program_joined}`);
      console.log(`  - Fitness Goal: ${user.fitness_goal}`);
      console.log(`  - Activity Level: ${user.activity_level}`);

      // Test age calculation
      if (user.date_of_birth) {
        const birthDate = new Date(user.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        console.log(`  - Calculated Age: ${age} years`);
      }
    }

    // 6. Test health data for sample user
    if (sampleUser.length > 0) {
      const userId = sampleUser[0].id;
      const [userHealthData] = await connection.execute(`
        SELECT data_type, value, unit, measured_at
        FROM health_data 
        WHERE user_id = ? 
        ORDER BY measured_at DESC
      `, [userId]);
      
      console.log('\nUser Health Data:');
      userHealthData.forEach(record => {
        console.log(`  - ${record.data_type}: ${record.value} ${record.unit} (${record.measured_at})`);
      });
    }

    console.log('\n✅ Wellness Data Migration Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testWellnessMigration();
