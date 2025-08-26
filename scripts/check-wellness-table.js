const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
      host: process.env.DB_HOST || 'dash.doctorphc.id',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pr1k1t1w',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function checkWellnessTable() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Check if wellness_activities table exists
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'wellness_activities'
    `);
    
    if (tables.length === 0) {
      console.log('❌ wellness_activities table does not exist.');
      return;
    }
    
    console.log('✅ wellness_activities table exists.');
    
    // Get table structure
    const [columns] = await connection.execute(`
      DESCRIBE wellness_activities
    `);
    
    console.log('\n📋 Table structure:');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check if there's data
    const [count] = await connection.execute(`
      SELECT COUNT(*) as count FROM wellness_activities
    `);
    
    console.log(`\n📊 Total records: ${count[0].count}`);
    
    if (count[0].count > 0) {
      // Show sample data
      const [sample] = await connection.execute(`
        SELECT * FROM wellness_activities LIMIT 3
      `);
      
      console.log('\n📝 Sample data:');
      sample.forEach((row, index) => {
        console.log(`  Record ${index + 1}:`, row);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking wellness table:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
checkWellnessTable();
