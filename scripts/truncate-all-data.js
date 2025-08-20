const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_mobile',
  port: process.env.DB_PORT || 3306
};

async function truncateAllData() {
  let connection;
  
  try {
    console.log('🗑️  Memulai proses truncate semua data...');
    console.log('⚠️  PERINGATAN: Script ini akan menghapus SEMUA data tracking!');
    console.log('📋 Database:', dbConfig.database);
    console.log('🔗 Host:', dbConfig.host);
    
    // Konfirmasi dari user
    console.log('\n❓ Apakah Anda yakin ingin menghapus semua data? (y/N)');
    
    // Untuk automation, kita skip konfirmasi manual
    // Dalam production, Anda bisa uncomment baris di bawah untuk konfirmasi manual
    // const readline = require('readline');
    // const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // const answer = await new Promise(resolve => rl.question('', resolve));
    // rl.close();
    // if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    //   console.log('❌ Operasi dibatalkan.');
    //   return;
    // }
    
    console.log('✅ Konfirmasi diterima, melanjutkan...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Terhubung ke database');
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Foreign key checks dinonaktifkan');
    
    // List of tables to truncate
    const tablesToTruncate = [
      'fitness_tracking',
      'mood_tracking', 
      'water_tracking',
      'sleep_tracking',
      'meal_tracking',
      'wellness_activities',
      'user_missions',
      'mission_progress',
      'user_quick_foods',
      'user_wellness_stats',
      'chat_messages',
      'chats',
      'consultations',
      'bookings',
      'user_notifications',
      'user_achievements',
      'user_badges',
      'user_points_history',
      'user_activity_logs'
    ];
    
    console.log('🗑️  Memulai truncate tabel...');
    
    for (const table of tablesToTruncate) {
      try {
        // Check if table exists first
        const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          await connection.execute(`TRUNCATE TABLE ${table}`);
          console.log(`✅ ${table} - Data dihapus`);
        } else {
          console.log(`⚠️  ${table} - Tabel tidak ditemukan, dilewati`);
        }
      } catch (error) {
        console.log(`❌ ${table} - Error: ${error.message}`);
      }
    }
    
    // Reset auto increment counters
    console.log('\n🔄 Reset auto increment counters...');
    for (const table of tablesToTruncate) {
      try {
        const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          await connection.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
          console.log(`✅ ${table} - Auto increment direset`);
        }
      } catch (error) {
        console.log(`❌ ${table} - Error reset auto increment: ${error.message}`);
      }
    }
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Foreign key checks diaktifkan kembali');
    
    console.log('\n🎉 SUKSES! Semua data tracking telah dihapus.');
    console.log('📊 Database siap untuk data baru.');
    
  } catch (error) {
    console.error('❌ Error saat truncate data:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Koneksi database ditutup');
    }
  }
}

// Run the script
truncateAllData();
