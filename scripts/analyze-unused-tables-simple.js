const fs = require('fs');

// All tables currently in phc_dashboard database
const ALL_TABLES = [
  'assessments',
  'available_wellness_activities',
  'bookings',
  'chat_messages',
  'chats',
  'clinic_polyclinics',
  'clinic_rooms',
  'clinics',
  'companies',
  'consultations',
  'doctor_specializations',
  'doctors',
  'examinations',
  'fitness_tracking',
  'food_database',
  'health_data',
  'icd',
  'insurances',
  'meal_foods',
    'meal_tracking',
  'medicines',
  'missions',
  'mobile_users',
  'mood_tracking',
  'patients',
  'phc_office_admin',
  'polyclinics',
  'services',
  'sleep_tracking',
  'treatments',
  'user_missions',
  'user_quick_foods',
  'user_water_settings',
  'user_wellness_activities',
  'users',
  'v_medicine_with_clinic',
  'visits',
  'water_tracking',
  'wellness_activities'
];

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
  'available_wellness_activities',
  
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
  'clinic_polyclinics',
  'clinic_rooms',
  'doctor_specializations',
  'phc_office_admin',
  'user_water_settings'
];

// Tables that should NOT be dropped (system tables, views, etc.)
const PROTECTED_TABLES = [
  'v_medicine_with_clinic' // This is a view
];

// Tables that might be unused (need manual review)
const POTENTIALLY_UNUSED_TABLES = [
  // Add tables here that you suspect are not used
  // These will be flagged for manual review
];

function analyzeUnusedTables() {
  console.log('🔍 Menganalisis tabel yang tidak digunakan...');
  console.log('=' .repeat(60));
  
  const usedTables = new Set(USED_TABLES);
  const protectedTables = new Set(PROTECTED_TABLES);
  const potentiallyUnused = new Set(POTENTIALLY_UNUSED_TABLES);
  
  const unusedTables = [];
  const usedTablesFound = [];
  const protectedTablesFound = [];
  const needReview = [];
  
  for (const table of ALL_TABLES) {
    if (protectedTables.has(table)) {
      protectedTablesFound.push(table);
    } else if (usedTables.has(table)) {
      usedTablesFound.push(table);
    } else if (potentiallyUnused.has(table)) {
      needReview.push(table);
    } else {
      unusedTables.push(table);
    }
  }
  
  // Display results
  console.log(`📊 Total tabel di database: ${ALL_TABLES.length}`);
  
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
  
  if (needReview.length > 0) {
    console.log(`⚠️  Tabel yang perlu review (${needReview.length}):`);
    needReview.forEach(table => {
      console.log(`   - ${table} (perlu manual review)`);
    });
  }
  
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
  
  // Additional analysis
  console.log('\n🔍 ANALISIS TAMBAHAN:');
  console.log('=' .repeat(60));
  
  // Check for tables that might be legacy
  const legacyTables = ALL_TABLES.filter(table => 
    table.includes('old_') || 
    table.includes('temp_') || 
    table.includes('backup_') ||
    table.includes('test_')
  );
  
  if (legacyTables.length > 0) {
    console.log('🧹 Tabel yang mungkin legacy:');
    legacyTables.forEach(table => {
      console.log(`   - ${table}`);
    });
  }
  
  // Check for tables with no clear purpose
  const unclearTables = ALL_TABLES.filter(table => 
    !usedTables.has(table) && 
    !protectedTables.has(table) &&
    !table.includes('tracking') &&
    !table.includes('user') &&
    !table.includes('doctor') &&
    !table.includes('clinic') &&
    !table.includes('patient') &&
    !table.includes('service') &&
    !table.includes('medicine') &&
    !table.includes('mission') &&
    !table.includes('wellness') &&
    !table.includes('chat') &&
    !table.includes('booking') &&
    !table.includes('consultation')
  );
  
  if (unclearTables.length > 0) {
    console.log('❓ Tabel dengan tujuan tidak jelas:');
    unclearTables.forEach(table => {
      console.log(`   - ${table} (perlu investigasi lebih lanjut)`);
    });
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
