import { Platform } from 'react-native';

// Quick fix for connection issues
export const getQuickApiUrl = () => {
  if (__DEV__) {
    // For iOS Simulator
    if (Platform.OS === 'ios') {
      return 'http://localhost:3000/api/mobile';
    }
    
    // For Android Emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api/mobile';
    }
    
    // For physical devices - use the fastest IP
    return 'http://192.168.18.30:3000/api/mobile';
  }
  
  // Production
  return 'https://dash.doctorphc.id/api/mobile';
};

// Test connection with the quick fix
export const testQuickConnection = async () => {
  const url = getQuickApiUrl();
  console.log('🔧 Quick Fix: Testing connection to:', url);
  
  try {
    const testUrl = url.replace('/api/mobile', '/api/health');
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ Quick Fix: Connection successful');
      return { success: true, url };
    } else {
      console.log('⚠️ Quick Fix: Connection failed with status:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log('❌ Quick Fix: Connection failed:', error.message);
    return { success: false, error: error.message };
  }
};
