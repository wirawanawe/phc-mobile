#!/usr/bin/env node

/**
 * Script untuk beralih antara server lokal dan produksi
 * Usage: node scripts/switch-server.js [local|production]
 */

const fs = require('fs');
const path = require('path');

const API_FILE_PATH = path.join(__dirname, '..', 'src', 'services', 'api.js');

function updateServerConfig(serverType) {
  try {
    // Read current API file
    const apiContent = fs.readFileSync(API_FILE_PATH, 'utf8');
    
    let updatedContent;
    
    if (serverType === 'production') {
      // Switch to production
      updatedContent = apiContent.replace(
        /const getServerURL = \(\) => \{[\s\S]*?\};/,
        `const getServerURL = () => {
  // Use production server
  return "https://dash.doctorphc.id";
  
  // For local development, uncomment this:
  // return "192.168.18.30";
};`
      );
      
      console.log('🚀 Switched to PRODUCTION server');
      console.log('📍 Server: https://dash.doctorphc.id');
      
    } else if (serverType === 'local') {
      // Switch to local
      updatedContent = apiContent.replace(
        /const getServerURL = \(\) => \{[\s\S]*?\};/,
        `const getServerURL = () => {
  // Use local development server
  return "192.168.18.30";
  
  // For production server, uncomment this:
  // return "https://dash.doctorphc.id";
};`
      );
      
      console.log('🏠 Switched to LOCAL server');
      console.log('📍 Server: http://192.168.18.30:3000');
      
    } else {
      throw new Error('Invalid server type. Use "local" or "production"');
    }
    
    // Write updated content
    fs.writeFileSync(API_FILE_PATH, updatedContent);
    
    console.log('✅ Configuration updated successfully');
    console.log('🔄 Please restart your mobile app to apply changes');
    
  } catch (error) {
    console.error('❌ Error updating server configuration:', error.message);
    process.exit(1);
  }
}

function showCurrentConfig() {
  try {
    const apiContent = fs.readFileSync(API_FILE_PATH, 'utf8');
    
    // Extract current server URL
    const match = apiContent.match(/return "([^"]+)";/);
    
    if (match) {
      const currentServer = match[1];
      console.log('📍 Current server configuration:');
      
      if (currentServer.includes('https://')) {
        console.log('🚀 PRODUCTION server:', currentServer);
      } else {
        console.log('🏠 LOCAL server:', `http://${currentServer}:3000`);
      }
    } else {
      console.log('⚠️  Could not determine current server configuration');
    }
    
  } catch (error) {
    console.error('❌ Error reading current configuration:', error.message);
  }
}

function showUsage() {
  console.log('🔧 Server Configuration Switcher');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/switch-server.js [command]');
  console.log('');
  console.log('Commands:');
  console.log('  local       - Switch to local development server');
  console.log('  production  - Switch to production server');
  console.log('  status      - Show current server configuration');
  console.log('  help        - Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/switch-server.js local');
  console.log('  node scripts/switch-server.js production');
  console.log('  node scripts/switch-server.js status');
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'local':
    updateServerConfig('local');
    break;
    
  case 'production':
    updateServerConfig('production');
    break;
    
  case 'status':
    showCurrentConfig();
    break;
    
  case 'help':
  case '--help':
  case '-h':
    showUsage();
    break;
    
  default:
    if (!command) {
      showCurrentConfig();
      console.log('');
      console.log('💡 Use "node scripts/switch-server.js help" for usage information');
    } else {
      console.error(`❌ Unknown command: ${command}`);
      console.log('');
      showUsage();
      process.exit(1);
    }
}
