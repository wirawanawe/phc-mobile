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

// Tables that are CRITICAL (never drop)
const CRITICAL_TABLES = [
  'users',
  'mobile_users',
  'doctors',
  'clinics',
  'services',
  'polyclinics',
  'companies',
  'insurances',
  'treatments',
  'medicines',
  'patients',
  'icd',
  'food_database',
  'missions',
  'wellness_activities',
  'available_wellness_activities'
];

// Tables that are ACTIVE (currently used in mobile app)
const ACTIVE_TABLES = [
  'fitness_tracking',
  'mood_tracking',
  'water_tracking',
  'sleep_tracking',
  'meal_tracking',
    'meal_foods',
  'user_wellness_activities',
  'user_missions',
  'user_quick_foods',
  'user_water_settings',
  'chats',
  'chat_messages',
  'consultations',
  'bookings',
  'health_data'
];

// Tables that are LEGACY (might be safe to drop)
const LEGACY_TABLES = [
  'assessments',        // Might be old assessment system
  'examinations',       // Might be old examination system
  'visits',            // Might be old visit system
  'clinic_polyclinics', // Junction table that might not be needed
  'clinic_rooms',       // Room management that might not be used
  'doctor_specializations', // Might be redundant with doctor table
  'phc_office_admin'    // Admin system that might not be used
];

// Tables that are PROTECTED (system tables, views)
const PROTECTED_TABLES = [
  'v_medicine_with_clinic' // This is a view
];

function deepTableAnalysis() {
  console.log('🔍 ANALISIS MENDALAM TABEL DATABASE');
  console.log('=' .repeat(60));
  
  const criticalTables = new Set(CRITICAL_TABLES);
  const activeTables = new Set(ACTIVE_TABLES);
  const legacyTables = new Set(LEGACY_TABLES);
  const protectedTables = new Set(PROTECTED_TABLES);
  
  const categorizedTables = {
    critical: [],
    active: [],
    legacy: [],
    protected: [],
    uncategorized: []
  };
  
  for (const table of ALL_TABLES) {
    if (criticalTables.has(table)) {
      categorizedTables.critical.push(table);
    } else if (activeTables.has(table)) {
      categorizedTables.active.push(table);
    } else if (legacyTables.has(table)) {
      categorizedTables.legacy.push(table);
    } else if (protectedTables.has(table)) {
      categorizedTables.protected.push(table);
    } else {
      categorizedTables.uncategorized.push(table);
    }
  }
  
  // Display categorization
  console.log(`📊 Total tabel: ${ALL_TABLES.length}`);
  console.log(`🔴 Critical tables: ${categorizedTables.critical.length}`);
  console.log(`🟢 Active tables: ${categorizedTables.active.length}`);
  console.log(`🟡 Legacy tables: ${categorizedTables.legacy.length}`);
  console.log(`🛡️  Protected tables: ${categorizedTables.protected.length}`);
  console.log(`❓ Uncategorized tables: ${categorizedTables.uncategorized.length}`);
  
  console.log('\n📋 KATEGORISASI TABEL:');
  console.log('=' .repeat(60));
  
  console.log('🔴 CRITICAL TABLES (JANGAN DROP):');
  categorizedTables.critical.forEach(table => {
    console.log(`   - ${table}`);
  });
  
  console.log('\n🟢 ACTIVE TABLES (DIGUNAKAN MOBILE APP):');
  categorizedTables.active.forEach(table => {
    console.log(`   - ${table}`);
  });
  
  console.log('\n🟡 LEGACY TABLES (MUNGKIN AMAN DROP):');
  categorizedTables.legacy.forEach(table => {
    console.log(`   - ${table} (perlu review manual)`);
  });
  
  console.log('\n🛡️  PROTECTED TABLES (SYSTEM TABLES):');
  categorizedTables.protected.forEach(table => {
    console.log(`   - ${table}`);
  });
  
  if (categorizedTables.uncategorized.length > 0) {
    console.log('\n❓ UNCATEGORIZED TABLES (PERLU INVESTIGASI):');
    categorizedTables.uncategorized.forEach(table => {
      console.log(`   - ${table} (perlu analisis lebih lanjut)`);
    });
  }
  
  // Generate recommendations
  console.log('\n💡 REKOMENDASI:');
  console.log('=' .repeat(60));
  
  if (categorizedTables.legacy.length > 0) {
    console.log('🟡 TABEL YANG MUNGKIN AMAN DROP:');
    categorizedTables.legacy.forEach(table => {
      console.log(`   - ${table}`);
    });
    
    console.log('\n📋 LANGKAH SEBELUM DROP:');
    console.log('1. Backup tabel legacy terlebih dahulu');
    console.log('2. Cek apakah ada foreign key references');
    console.log('3. Test aplikasi setelah drop');
    console.log('4. Monitor error log');
    
    // Generate drop script for legacy tables
    const dropScript = generateLegacyDropScript(categorizedTables.legacy);
    const scriptPath = 'scripts/drop-legacy-tables.sql';
    
    fs.writeFileSync(scriptPath, dropScript);
    console.log(`\n📄 Script drop legacy tables disimpan ke: ${scriptPath}`);
    
    // Generate backup script
    const backupScript = generateLegacyBackupScript(categorizedTables.legacy);
    const backupPath = 'scripts/backup-legacy-tables.sql';
    
    fs.writeFileSync(backupPath, backupScript);
    console.log(`📄 Script backup legacy tables disimpan ke: ${backupPath}`);
  } else {
    console.log('✅ Tidak ada tabel legacy yang teridentifikasi');
  }
  
  // Additional analysis
  console.log('\n🔍 ANALISIS TAMBAHAN:');
  console.log('=' .repeat(60));
  
  // Check for potential duplicates
  const potentialDuplicates = [
    { table1: 'assessments', table2: 'examinations', reason: 'Kedua tabel untuk pemeriksaan medis' },
    { table1: 'clinic_polyclinics', table2: 'polyclinics', reason: 'Junction table yang mungkin redundant' },
    { table1: 'doctor_specializations', table2: 'doctors', reason: 'Specialization mungkin sudah ada di tabel doctors' }
  ];
  
  console.log('🔄 POTENTIAL DUPLICATES:');
  potentialDuplicates.forEach(dup => {
    if (ALL_TABLES.includes(dup.table1) && ALL_TABLES.includes(dup.table2)) {
      console.log(`   - ${dup.table1} vs ${dup.table2}: ${dup.reason}`);
    }
  });
  
  // Check for unused features
  console.log('\n🚫 POTENTIAL UNUSED FEATURES:');
  const unusedFeatures = [
    'clinic_rooms - Room management system',
    'phc_office_admin - Admin panel system',
    'assessments - Old assessment system',
    'examinations - Old examination system'
  ];
  
  unusedFeatures.forEach(feature => {
    console.log(`   - ${feature}`);
  });
}

function generateLegacyDropScript(legacyTables) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return `-- Script untuk drop legacy tables
-- Generated on: ${new Date().toISOString()}
-- WARNING: Jalankan script ini dengan hati-hati!
-- Pastikan backup sudah dibuat terlebih dahulu

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop legacy tables
${legacyTables.map(table => `DROP TABLE IF EXISTS \`${table}\`;`).join('\n')}

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verification
SELECT 'Legacy tables yang berhasil di-drop:' as message;
${legacyTables.map(table => `SELECT '${table}' as dropped_table;`).join('\n')}

SELECT 'Drop legacy tables completed successfully!' as message;
`;
}

function generateLegacyBackupScript(legacyTables) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return `-- Script backup legacy tables sebelum drop
-- Generated on: ${new Date().toISOString()}
-- Jalankan script ini sebelum drop legacy tables

-- Create backup tables
${legacyTables.map(table => `
-- Backup legacy table: ${table}
CREATE TABLE IF NOT EXISTS \`backup_legacy_${table}_${timestamp}\` AS 
SELECT * FROM \`${table}\`;

-- Show backup info
SELECT '${table}' as table_name, COUNT(*) as backup_count 
FROM \`backup_legacy_${table}_${timestamp}\`;
`).join('\n')}

SELECT 'Legacy tables backup completed successfully!' as message;
`;
}

// Run the analysis
deepTableAnalysis();
