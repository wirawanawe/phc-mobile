#!/usr/bin/env node

/**
 * Check Current Configuration Script
 * Shows the current API configuration status
 * Usage: node scripts/check-current-config.js
 */

const fs = require('fs');
const path = require('path');

const API_FILE_PATH = path.join(__dirname, '..', 'src', 'services', 'api.js');

function checkApiConfiguration() {
  try {
    const content = fs.readFileSync(API_FILE_PATH, 'utf8');
    
    console.log('📋 Current API Configuration:\n');
    
    // Check getServerURL function
    if (content.includes('return "dash.doctorphc.id"')) {
      console.log('✅ Server URL: Production (dash.doctorphc.id)');
    } else if (content.includes('return "192.168.193.150"')) {
      console.log('🔧 Server URL: Development (192.168.193.150)');
    } else {
      console.log('❓ Server URL: Unknown configuration');
    }
    
    // Check getApiBaseUrl function
    if (content.includes('https://dash.doctorphc.id/api/mobile')) {
      console.log('✅ API Base URL: Production (https://dash.doctorphc.id/api/mobile)');
    } else if (content.includes('http://192.168.193.150:3000/api/mobile')) {
      console.log('🔧 API Base URL: Development (http://192.168.193.150:3000/api/mobile)');
    } else {
      console.log('❓ API Base URL: Unknown configuration');
    }
    
    // Check if forced production
    if (content.includes('Force production server for all environments')) {
      console.log('🚀 Mode: Forced Production (no __DEV__ checks)');
    } else if (content.includes('__DEV__')) {
      console.log('🔧 Mode: Development-aware (uses __DEV__ checks)');
    } else {
      console.log('❓ Mode: Unknown');
    }
    
    console.log('\n📊 Configuration Summary:');
    
    if (content.includes('https://dash.doctorphc.id/api/mobile') && 
        content.includes('Force production server for all environments')) {
      console.log('🎯 Status: PRODUCTION MODE (forced)');
      console.log('🌐 Server: https://dash.doctorphc.id');
      console.log('📱 API: https://dash.doctorphc.id/api/mobile');
    } else if (content.includes('http://192.168.193.150:3000/api/mobile') && 
               content.includes('__DEV__')) {
      console.log('🎯 Status: DEVELOPMENT MODE');
      console.log('🔧 Server: http://192.168.193.150:3000');
      console.log('📱 API: http://192.168.193.150:3000/api/mobile');
    } else {
      console.log('🎯 Status: MIXED CONFIGURATION');
      console.log('⚠️ Some files may have different configurations');
    }
    
  } catch (error) {
    console.error('❌ Error reading configuration:', error.message);
  }
}

function checkOtherFiles() {
  console.log('\n🔍 Checking other configuration files...\n');
  
  const files = [
    { path: 'src/utils/quickFix.js', name: 'Quick Fix' },
    { path: 'src/utils/networkHelper.js', name: 'Network Helper' },
    { path: 'src/utils/networkStatus.js', name: 'Network Status' },
    { path: 'src/utils/networkTest.js', name: 'Network Test' }
  ];
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(__dirname, '..', file.path), 'utf8');
      
      if (content.includes('https://dash.doctorphc.id/api/mobile')) {
        console.log(`✅ ${file.name}: Production`);
      } else if (content.includes('http://192.168.193.150:3000/api/mobile')) {
        console.log(`🔧 ${file.name}: Development`);
      } else {
        console.log(`❓ ${file.name}: Unknown`);
      }
    } catch (error) {
      console.log(`❌ ${file.name}: Error reading file`);
    }
  });
}

function main() {
  console.log('🔍 Checking Current Configuration...\n');
  
  checkApiConfiguration();
  checkOtherFiles();
  
  console.log('\n💡 Available Commands:');
  console.log('   node scripts/switch-to-production.js  - Switch to production');
  console.log('   node scripts/switch-to-development.js - Switch to development');
  console.log('   node scripts/test-production-connection.js - Test production connection');
}

main();
