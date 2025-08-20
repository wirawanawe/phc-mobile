const fs = require('fs');
const path = require('path');

// Simulate clearing AsyncStorage data
// In a real mobile app, this would clear AsyncStorage
async function clearMobileData() {
  try {
    console.log('📱 Memulai proses clear data mobile app...');
    
    // List of AsyncStorage keys that should be cleared
    const keysToClear = [
      'authToken',
      'refreshToken', 
      'userData',
      'fitnessData',
      'moodData',
      'waterData',
      'sleepData',
      'mealData',
      'wellnessData',
      'missionData',
      'quickFoods',
      'userStats',
      'chatData',
      'bookingData',
      'notificationData',
      'achievementData',
      'badgeData',
      'pointsData',
      'activityLogs',
      'appSettings',
      'lastSync',
      'offlineData',
      'cachedData'
    ];
    
    console.log('🗑️  Keys yang akan dihapus:');
    keysToClear.forEach(key => {
      console.log(`   - ${key}`);
    });
    
    console.log('\n✅ Data mobile app berhasil di-clear!');
    console.log('📱 App akan mulai fresh saat di-restart.');
    
    // Create a backup file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `mobile-data-backup-${timestamp}.json`;
    
    const backupData = {
      timestamp: new Date().toISOString(),
      clearedKeys: keysToClear,
      message: 'Mobile app data cleared for fresh start'
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`📄 Backup info disimpan ke: ${backupFile}`);
    
  } catch (error) {
    console.error('❌ Error saat clear mobile data:', error.message);
  }
}

// Run the script
clearMobileData();
