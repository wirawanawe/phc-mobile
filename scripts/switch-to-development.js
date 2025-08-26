#!/usr/bin/env node

/**
 * Switch to Development Mode Script
 * Temporarily switches the app to use development server
 * Usage: node scripts/switch-to-development.js
 */

const fs = require('fs');
const path = require('path');

const API_FILE_PATH = path.join(__dirname, '..', 'src', 'services', 'api.js');
const QUICK_FIX_PATH = path.join(__dirname, '..', 'src', 'utils', 'quickFix.js');
const NETWORK_HELPER_PATH = path.join(__dirname, '..', 'src', 'utils', 'networkHelper.js');
const NETWORK_STATUS_PATH = path.join(__dirname, '..', 'src', 'utils', 'networkStatus.js');
const NETWORK_TEST_PATH = path.join(__dirname, '..', 'src', 'utils', 'networkTest.js');

function updateApiFile() {
  try {
    let content = fs.readFileSync(API_FILE_PATH, 'utf8');
    
    // Update getServerURL function
    content = content.replace(
      /const getServerURL = \(\) => \{[\s\S]*?\};/,
      `const getServerURL = () => {
  // Temporary development mode - production server is down
  if (__DEV__) {
    return "192.168.193.150";
  }
  return "dash.doctorphc.id";
};`
    );
    
    // Update getApiBaseUrl function
    content = content.replace(
      /const getApiBaseUrl = \(\) => \{[\s\S]*?\};/,
      `const getApiBaseUrl = () => {
  // Temporary development mode - production server is down
  if (__DEV__) {
    console.log('🔧 Development mode: Using Mac IP address API');
    return "http://192.168.193.150:3000/api/mobile";
  }
  console.log('🚀 Production mode: Using production API');
  return "https://dash.doctorphc.id/api/mobile";
};`
    );
    
    // Update getBestApiUrl function
    content = content.replace(
      /const getBestApiUrl = async \(\) => \{[\s\S]*?\};/,
      `const getBestApiUrl = async () => {
  // Temporary development mode - production server is down
  if (__DEV__) {
    console.log('🔧 Development mode: Using Mac IP address API');
    return 'http://192.168.193.150:3000/api/mobile';
  }
  console.log('🚀 Production mode: Using production API');
  return 'https://dash.doctorphc.id/api/mobile';
};`
    );
    
    fs.writeFileSync(API_FILE_PATH, content);
    console.log('✅ Updated src/services/api.js');
  } catch (error) {
    console.error('❌ Error updating api.js:', error.message);
  }
}

function updateQuickFixFile() {
  try {
    let content = fs.readFileSync(QUICK_FIX_PATH, 'utf8');
    
    content = content.replace(
      /export const getQuickApiUrl = \(\) => \{[\s\S]*?\};/,
      `export const getQuickApiUrl = () => {
  // Temporary development mode - production server is down
  if (__DEV__) {
    console.log('🔧 Development mode: Using Mac IP address API');
    return 'http://192.168.193.150:3000/api/mobile';
  }
  console.log('🚀 Production mode: Using production API');
  return 'https://dash.doctorphc.id/api/mobile';
};`
    );
    
    fs.writeFileSync(QUICK_FIX_PATH, content);
    console.log('✅ Updated src/utils/quickFix.js');
  } catch (error) {
    console.error('❌ Error updating quickFix.js:', error.message);
  }
}

function updateNetworkHelperFile() {
  try {
    let content = fs.readFileSync(NETWORK_HELPER_PATH, 'utf8');
    
    // Update findBestServer function
    content = content.replace(
      /static async findBestServer\(\) \{[\s\S]*?const servers = \[[\s\S]*?\];/,
      `static async findBestServer() {
    const servers = [
      'http://192.168.193.150:3000', // Local development (primary)
      'http://localhost:3000', // Local development (fallback)
      'http://127.0.0.1:3000', // Local development (fallback)
      'http://10.0.2.2:3000', // Android emulator (fallback)
      'https://dash.doctorphc.id' // Production server (fallback)
    ];`
    );
    
    // Update getDefaultURL function
    content = content.replace(
      /static getDefaultURL\(\) \{[\s\S]*?\}/,
      `static getDefaultURL() {
    // Temporary development mode - production server is down
    if (__DEV__) {
      return 'http://192.168.193.150:3000/api/mobile';
    }
    return 'https://dash.doctorphc.id/api/mobile';
  }`
    );
    
    fs.writeFileSync(NETWORK_HELPER_PATH, content);
    console.log('✅ Updated src/utils/networkHelper.js');
  } catch (error) {
    console.error('❌ Error updating networkHelper.js:', error.message);
  }
}

function updateNetworkStatusFile() {
  try {
    let content = fs.readFileSync(NETWORK_STATUS_PATH, 'utf8');
    
    content = content.replace(
      /export const getRecommendedApiUrl = async \(\) => \{[\s\S]*?\};/,
      `export const getRecommendedApiUrl = async () => {
  // Temporary development mode - production server is down
  const status = await checkNetworkStatus();
  
  if (status.bestUrl) {
    return status.bestUrl;
  }
  
  // Fallback based on platform
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://192.168.193.150:3000/api/mobile';
    }
    if (Platform.OS === 'ios') {
      return 'http://localhost:3000/api/mobile';
    }
    return 'http://192.168.193.150:3000/api/mobile';
  }
  
  return 'https://dash.doctorphc.id/api/mobile';
};`
    );
    
    fs.writeFileSync(NETWORK_STATUS_PATH, content);
    console.log('✅ Updated src/utils/networkStatus.js');
  } catch (error) {
    console.error('❌ Error updating networkStatus.js:', error.message);
  }
}

function updateNetworkTestFile() {
  try {
    let content = fs.readFileSync(NETWORK_TEST_PATH, 'utf8');
    
    content = content.replace(
      /export const getBestEndpoint = async \(\) => \{[\s\S]*?\};/,
      `export const getBestEndpoint = async () => {
  // Temporary development mode - production server is down
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://192.168.193.150:3000/api/mobile';
    }
    
    if (Platform.OS === 'ios') {
      return 'http://localhost:3000/api/mobile';
    }
    
    const testResult = await testNetworkConnectivity();
    if (testResult.success) {
      return testResult.url.replace('/api/mobile/health', '/api/mobile');
    }
  }
  
  return 'https://dash.doctorphc.id/api/mobile';
};`
    );
    
    fs.writeFileSync(NETWORK_TEST_PATH, content);
    console.log('✅ Updated src/utils/networkTest.js');
  } catch (error) {
    console.error('❌ Error updating networkTest.js:', error.message);
  }
}

function main() {
  console.log('🔄 Switching to Development Mode...\n');
  console.log('⚠️ Note: This is a temporary switch while production server is down\n');
  
  updateApiFile();
  updateQuickFixFile();
  updateNetworkHelperFile();
  updateNetworkStatusFile();
  updateNetworkTestFile();
  
  console.log('\n✅ Successfully switched to Development Mode!');
  console.log('📱 Development server: http://192.168.193.150:3000/api/mobile');
  console.log('🔄 Please restart your mobile app to apply changes');
  console.log('\n💡 To switch back to production when server is fixed:');
  console.log('   node scripts/switch-to-production.js');
}

main();
