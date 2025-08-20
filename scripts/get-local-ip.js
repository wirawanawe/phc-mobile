#!/usr/bin/env node

/**
 * Script untuk mendapatkan IP address lokal mesin
 * Berguna untuk konfigurasi mobile development
 */

const { execSync } = require('child_process');

function getLocalIP() {
  try {
    // Get the first non-localhost IP address
    const ip = execSync("ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1", { encoding: 'utf8' }).trim();
    
    console.log('🌐 Local IP Address:', ip);
    console.log('📱 Use this IP for mobile development configuration');
    console.log('🔗 API URL would be:', `http://${ip}:3000/api/mobile`);
    
    return ip;
  } catch (error) {
    console.error('❌ Error getting local IP:', error.message);
    return null;
  }
}

function testConnection(ip) {
  if (!ip) return;
  
  try {
    console.log('\n🧪 Testing connection to server...');
    const healthResponse = execSync(`curl -s http://${ip}:3000/api/health`, { encoding: 'utf8' });
    
    if (healthResponse.includes('"status":"ok"')) {
      console.log('✅ Server is accessible via IP address');
      console.log('📊 Health check response:', healthResponse.trim());
    } else {
      console.log('⚠️  Server responded but health check failed');
      console.log('📊 Response:', healthResponse.trim());
    }
  } catch (error) {
    console.log('❌ Cannot connect to server via IP address');
    console.log('💡 Make sure the backend server is running: cd dash-app && npm run dev');
  }
}

// Run the script
const localIP = getLocalIP();
testConnection(localIP);

module.exports = { getLocalIP, testConnection };
