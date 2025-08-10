const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    console.log('🚀 Starting mission date migration...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'phc_dashboard',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Database connected successfully');

    // Read and execute migration script
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, '../dash-app/init-scripts/21-add-mission-date.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration script loaded');

    // Split and execute SQL statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`  ${i + 1}/${statements.length}: Executing statement...`);
          await connection.execute(statement);
          console.log(`  ✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`  ❌ Error in statement ${i + 1}:`, error.message);
          // Continue with other statements
        }
      }
    }

    // Verify the changes
    console.log('🔍 Verifying migration...');
    const [columns] = await connection.execute("DESCRIBE user_missions");
    console.log('📋 Current user_missions table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Check for mission_date column
    const missionDateColumn = columns.find(col => col.Field === 'mission_date');
    if (missionDateColumn) {
      console.log('✅ mission_date column successfully added');
    } else {
      console.log('❌ mission_date column not found');
    }

    // Check for new index
    const [indexes] = await connection.execute("SHOW INDEX FROM user_missions WHERE Key_name = 'idx_user_missions_date'");
    if (indexes.length > 0) {
      console.log('✅ Date index successfully created');
    } else {
      console.log('❌ Date index not found');
    }

    console.log('🎉 Mission date migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
runMigration().catch(console.error); 