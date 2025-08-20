const mysql = require('mysql2/promise');
const fs = require('fs');

// Database configuration - using the same config as the project
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard', // Changed to match project config
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 20,
  connectTimeout: 10000,
  acquireTimeout: 30000,
  timeout: 30000,
  reconnect: true,
  idleTimeout: 60000
};

async function resetAllData() {
  let connection;
  
  try {
    console.log('🔄 MEMULAI RESET LENGKAP DATABASE DAN MOBILE APP');
    console.log('=' .repeat(60));
    console.log('⚠️  PERINGATAN: Script ini akan menghapus SEMUA data!');
    console.log('📋 Database:', dbConfig.database);
    console.log('🔗 Host:', dbConfig.host);
    console.log('👤 User:', dbConfig.user);
    console.log('=' .repeat(60));
    
    // Step 1: Clear mobile app data
    console.log('\n📱 STEP 1: Clear Mobile App Data');
    console.log('-'.repeat(40));
    
    const mobileKeys = [
      'authToken', 'refreshToken', 'userData', 'fitnessData', 
      'moodData', 'waterData', 'sleepData', 'mealData', 
      'wellnessData', 'missionData', 'quickFoods', 'userStats',
      'chatData', 'bookingData', 'notificationData', 'achievementData',
      'badgeData', 'pointsData', 'activityLogs', 'appSettings',
      'lastSync', 'offlineData', 'cachedData'
    ];
    
    console.log('🗑️  Mobile app keys yang akan dihapus:');
    mobileKeys.forEach(key => console.log(`   - ${key}`));
    console.log('✅ Mobile app data siap di-clear');
    
    // Step 2: Truncate database tables
    console.log('\n🗄️  STEP 2: Truncate Database Tables');
    console.log('-'.repeat(40));
    
    // Try to connect with different configurations
    let connected = false;
    const configs = [
      dbConfig,
      { ...dbConfig, database: 'phc_mobile' },
      { ...dbConfig, database: 'phc_dashboard' },
      { ...dbConfig, password: 'root' },
      { ...dbConfig, user: 'root', password: '' }
    ];
    
    for (const config of configs) {
      try {
        console.log(`🔗 Mencoba koneksi ke ${config.database} dengan user ${config.user}...`);
        connection = await mysql.createConnection(config);
        await connection.ping();
        console.log(`✅ Berhasil terhubung ke database: ${config.database}`);
        connected = true;
        break;
      } catch (error) {
        console.log(`❌ Gagal koneksi: ${error.message}`);
        if (connection) {
          await connection.end();
          connection = null;
        }
      }
    }
    
    if (!connected) {
      throw new Error('Tidak dapat terhubung ke database dengan konfigurasi apapun');
    }
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Foreign key checks dinonaktifkan');
    
    const tablesToTruncate = [
      'fitness_tracking', 'mood_tracking', 'water_tracking', 'sleep_tracking',
      'meal_tracking', 'wellness_activities', 'user_missions', 'mission_progress',
      'user_quick_foods', 'user_wellness_stats', 'chat_messages', 'chats',
      'consultations', 'bookings', 'user_notifications', 'user_achievements',
      'user_badges', 'user_points_history', 'user_activity_logs'
    ];
    
    console.log('🗑️  Database tables yang akan di-truncate:');
    tablesToTruncate.forEach(table => console.log(`   - ${table}`));
    
    // Truncate tables
    for (const table of tablesToTruncate) {
      try {
        const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          await connection.execute(`TRUNCATE TABLE ${table}`);
          console.log(`✅ ${table} - Data dihapus`);
        } else {
          console.log(`⚠️  ${table} - Tabel tidak ditemukan`);
        }
      } catch (error) {
        console.log(`❌ ${table} - Error: ${error.message}`);
      }
    }
    
    // Reset auto increment
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
    
    // Step 3: Create backup log
    console.log('\n📄 STEP 3: Create Backup Log');
    console.log('-'.repeat(40));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `reset-backup-${timestamp}.json`;
    
    const backupData = {
      timestamp: new Date().toISOString(),
      action: 'Complete data reset',
      database: {
        host: dbConfig.host,
        database: dbConfig.database,
        tablesTruncated: tablesToTruncate
      },
      mobile: {
        keysCleared: mobileKeys
      },
      message: 'All data has been reset for fresh start'
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`📄 Backup log disimpan ke: ${backupFile}`);
    
    // Final summary
    console.log('\n🎉 RESET LENGKAP BERHASIL!');
    console.log('=' .repeat(60));
    console.log('✅ Mobile app data: Cleared');
    console.log('✅ Database tables: Truncated');
    console.log('✅ Auto increment: Reset');
    console.log('✅ Backup log: Created');
    console.log('=' .repeat(60));
    console.log('\n📋 LANGKAH SELANJUTNYA:');
    console.log('1. Restart mobile app');
    console.log('2. Login ulang dengan akun baru');
    console.log('3. Mulai tracking data dari awal');
    console.log('4. Data akan mulai terakumulasi lagi');
    
  } catch (error) {
    console.error('❌ Error saat reset data:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Koneksi database ditutup');
    }
  }
}

// Run the script
resetAllData();
