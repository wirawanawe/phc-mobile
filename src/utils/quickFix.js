import { Platform } from 'react-native';

// Quick fix for network issues
export const getQuickApiUrl = () => {
  // Use localhost for development
  console.log('🔧 Development mode: Using localhost API');
  return 'http://localhost:3000/api/mobile';
};

// Test connection with the quick fix
export const testQuickConnection = async () => {
  const url = getQuickApiUrl();
  console.log('🔧 Quick Fix: Testing connection to:', url);
  
  try {
    const testUrl = url + '/health';
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
