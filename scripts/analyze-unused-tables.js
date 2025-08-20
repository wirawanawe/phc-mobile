const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

// Tables that are definitely used (based on codebase analysis)
const USED_TABLES = [
  // Core user tables
  'users',
  'mobile_users',
  
  // Tracking tables (actively used)
  'fitness_tracking',
  'mood_tracking', 
  'water_tracking',
  'sleep_tracking',
  'meal_tracking',
    'meal_foods',
  
  // Wellness tables
  'wellness_activities',
  'user_wellness_activities',
  'user_missions',
  'user_quick_foods',
  
  // Communication tables
  'chats',
  'chat_messages',
  
  // Booking/Consultation tables
  'consultations',
  'bookings',
  
  // Health data
  'health_data',
  
  // Master data tables (referenced in code)
  'doctors',
  'clinics',
  'services',
  'polyclinics',
  'companies',
  'insurances',
  'treatments',
  'medicines',
  'patients',
  'visits',
  'examinations',
  'assessments',
  'icd',
  'food_database',
  'missions',
  'available_wellness_activities',
  'clinic_polyclinics',
  'clinic_rooms',
  'doctor_specializations',
  'phc_office_admin',
  'user_water_settings',
  'v_medicine_with_clinic'
];

// Tables that should NOT be dropped (system tables, views, etc.)
const PROTECTED_TABLES = [
  'information_schema',
  'mysql',
  'performance_schema',
  'sys',
  'v_medicine_with_clinic' // This is a view
];

async function analyzeUnusedTables() {
  let connection;
  
  try {
    console.log('🔍 Menganalisis tabel yang tidak digunakan...');
    console.log('=' .repeat(60));
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Terhubung ke database:', dbConfig.database);
    
    // Get all tables in database
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    console.log(`📊 Total tabel di database: ${tables.length}`);
    
    // Analyze which tables are used
    const usedTables = new Set(USED_TABLES);
    const protectedTables = new Set(PROTECTED_TABLES);
    
    const unusedTables = [];
    const usedTablesFound = [];
    const protectedTablesFound = [];
    
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      
      if (protectedTables.has(tableName)) {
        protectedTablesFound.push(tableName);
      } else if (usedTables.has(tableName)) {
        usedTablesFound.push(tableName);
      } else {
        unusedTables.push(tableName);
      }
    }
    
    // Display results
    console.log('\n📋 HASIL ANALISIS:');
    console.log('=' .repeat(60));
    
    console.log(`✅ Tabel yang digunakan (${usedTablesFound.length}):`);
    usedTablesFound.forEach(table => {
      console.log(`   - ${table}`);
    });
    
    console.log(`🛡️  Tabel yang dilindungi (${protectedTablesFound.length}):`);
    protectedTablesFound.forEach(table => {
      console.log(`   - ${table}`);
    });
    
    console.log(`🗑️  Tabel yang tidak digunakan (${unusedTables.length}):`);
    if (unusedTables.length > 0) {
      unusedTables.forEach(table => {
        console.log(`   - ${table}`);
      });
    } else {
      console.log('   Tidak ada tabel yang tidak digunakan!');
    }
    
    // Generate SQL script for dropping unused tables
    if (unusedTables.length > 0) {
      const dropScript = generateDropScript(unusedTables);
      const scriptPath = 'scripts/drop-unused-tables.sql';
      
      fs.writeFileSync(scriptPath, dropScript);
      console.log(`\n📄 Script drop table disimpan ke: ${scriptPath}`);
      
      // Also generate backup script
      const backupScript = generateBackupScript(unusedTables);
      const backupPath = 'scripts/backup-before-drop.sql';
      
      fs.writeFileSync(backupPath, backupScript);
      console.log(`📄 Script backup disimpan ke: ${backupPath}`);
    }
    
    console.log('\n💡 Rekomendasi:');
    if (unusedTables.length > 0) {
      console.log('1. Review tabel yang akan di-drop');
      console.log('2. Jalankan backup terlebih dahulu');
      console.log('3. Test di environment development');
      console.log('4. Jalankan script drop dengan hati-hati');
    } else {
      console.log('✅ Semua tabel masih digunakan, tidak perlu di-drop');
    }
    
  } catch (error) {
    console.error('❌ Error saat menganalisis tabel:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Koneksi database ditutup');
    }
  }
}

function generateDropScript(unusedTables) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return `-- Script untuk drop tabel yang tidak digunakan
-- Generated on: ${new Date().toISOString()}
-- WARNING: Jalankan script ini dengan hati-hati!

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop unused tables
${unusedTables.map(table => `DROP TABLE IF EXISTS \`${table}\`;`).join('\n')}

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verification
SELECT 'Tabel yang berhasil di-drop:' as message;
${unusedTables.map(table => `SELECT '${table}' as dropped_table;`).join('\n')}

SELECT 'Drop unused tables completed successfully!' as message;
`;
}

function generateBackupScript(unusedTables) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return `-- Script backup sebelum drop tabel
-- Generated on: ${new Date().toISOString()}
-- Jalankan script ini sebelum drop tabel untuk backup data

-- Create backup tables
${unusedTables.map(table => `
-- Backup table: ${table}
CREATE TABLE IF NOT EXISTS \`backup_${table}_${timestamp}\` AS 
SELECT * FROM \`${table}\`;

-- Show backup info
SELECT '${table}' as table_name, COUNT(*) as backup_count 
FROM \`backup_${table}_${timestamp}\`;
`).join('\n')}

SELECT 'Backup completed successfully!' as message;
`;
}

// Run the analysis
analyzeUnusedTables();
