// Script untuk clear data mobile app
// Jalankan script ini di dalam mobile app untuk clear AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

const clearMobileData = async () => {
  try {
    console.log('📱 Memulai clear data mobile app...');
    
    // List of keys to clear
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
    
    // Clear all specified keys
    await AsyncStorage.multiRemove(keysToClear);
    
    console.log('✅ Mobile app data berhasil di-clear!');
    console.log('📱 App akan mulai fresh saat di-restart.');
    
    return {
      success: true,
      message: 'Mobile app data cleared successfully',
      clearedKeys: keysToClear
    };
    
  } catch (error) {
    console.error('❌ Error saat clear mobile data:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
};

// Export function untuk digunakan di app
export default clearMobileData;

// Jika dijalankan langsung
if (typeof window !== 'undefined') {
  clearMobileData().then(result => {
    console.log('Result:', result);
  });
}
