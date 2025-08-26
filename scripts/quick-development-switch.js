#!/usr/bin/env node

/**
 * Quick Development Switch Script
 * Quickly switches to development mode for immediate use
 * Usage: node scripts/quick-development-switch.js
 */

const fs = require('fs');
const path = require('path');

const API_FILE_PATH = path.join(__dirname, '..', 'src', 'services', 'api.js');

function switchToDevelopment() {
  try {
    console.log('🔧 Quick Switch to Development Mode...\n');
    
    // Read current API file
    const content = fs.readFileSync(API_FILE_PATH, 'utf8');
    
    // Check if already in development mode
    if (content.includes('__DEV__') && content.includes('192.168.193.150')) {
      console.log('✅ Application is already in development mode');
      console.log('📍 Server: http://192.168.193.150:3000');
      return;
    }
    
    // Update to development mode
    let updatedContent = content.replace(
      /const getServerURL = \(\) => \{[\s\S]*?\};/,
      `const getServerURL = () => {
  // Quick development mode - production server is down
  if (__DEV__) {
    return "192.168.193.150";
  }
  return "dash.doctorphc.id";
};`
    );
    
    updatedContent = updatedContent.replace(
      /const getApiBaseUrl = \(\) => \{[\s\S]*?\};/,
      `const getApiBaseUrl = () => {
  // Quick development mode - production server is down
  if (__DEV__) {
    console.log('🔧 Development mode: Using Mac IP address API');
    return "http://192.168.193.150:3000/api/mobile";
  }
  console.log('🚀 Production mode: Using production API');
  return "https://dash.doctorphc.id/api/mobile";
};`
    );
    
    updatedContent = updatedContent.replace(
      /const getBestApiUrl = async \(\) => \{[\s\S]*?\};/,
      `const getBestApiUrl = async () => {
  // Quick development mode - production server is down
  if (__DEV__) {
    console.log('🔧 Development mode: Using Mac IP address API');
    return 'http://192.168.193.150:3000/api/mobile';
  }
  console.log('🚀 Production mode: Using production API');
  return 'https://dash.doctorphc.id/api/mobile';
};`
    );
    
    // Write updated content
    fs.writeFileSync(API_FILE_PATH, updatedContent);
    
    console.log('✅ Successfully switched to DEVELOPMENT mode');
    console.log('📍 Server: http://192.168.193.150:3000');
    console.log('🔧 API Endpoint: http://192.168.193.150:3000/api/mobile');
    console.log('\n🔄 Please restart your mobile app to apply changes');
    console.log('💡 Use: npx expo start --clear');
    
    console.log('\n⚠️ Note: This is a temporary switch');
    console.log('💡 To switch back to production when server is fixed:');
    console.log('   node scripts/switch-to-production.js');
    
  } catch (error) {
    console.error('❌ Error switching to development mode:', error.message);
    process.exit(1);
  }
}

function checkServerStatus() {
  console.log('🔍 Checking production server status...');
  
  const { execSync } = require('child_process');
  
  try {
    const result = execSync('curl -I https://dash.doctorphc.id/api/health --max-time 10', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('200')) {
      console.log('✅ Production server is working!');
      console.log('💡 You can stay in production mode');
      return true;
    } else {
      console.log('❌ Production server is still down');
      return false;
    }
  } catch (error) {
    console.log('❌ Production server is down (connection failed)');
    return false;
  }
}

function main() {
  console.log('🚀 Quick Development Switch');
  console.log('==========================');
  console.log('This will switch the app to development mode for immediate use');
  console.log('while the production server is down.\n');
  
  // Check if production server is working
  const serverWorking = checkServerStatus();
  
  if (serverWorking) {
    console.log('\n💡 Production server is working!');
    console.log('   You may not need to switch to development mode.');
    console.log('   Do you still want to switch? (y/N)');
    
    // For now, proceed with switch since user requested it
    console.log('\n🔄 Proceeding with development switch...\n');
  } else {
    console.log('\n⚠️ Production server is down');
    console.log('🔄 Switching to development mode...\n');
  }
  
  switchToDevelopment();
}

main();
