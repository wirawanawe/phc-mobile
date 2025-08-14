const fs = require('fs');
const path = require('path');

/**
 * Script untuk mengupdate konfigurasi API agar menggunakan localhost
 * daripada IP lokal perangkat untuk development
 */

function updateApiServiceConfig() {
  const apiPath = path.join(__dirname, '../src/services/api.js');
  
  try {
    let content = fs.readFileSync(apiPath, 'utf8');
    
    console.log('🔄 Updating API service configuration to use localhost...');
    
    // Update getServerURL function to return localhost
    content = content.replace(
      /const getServerURL = \(\) => \{[\s\S]*?return ".*?";[\s\S]*?\};/,
      `const getServerURL = () => {
  // For local development, use localhost
  return "localhost";
  
  // Use production server
  // return "https://dash.doctorphc.id";
};`
    );
    
    fs.writeFileSync(apiPath, content);
    console.log('✅ Updated API service configuration');
    
  } catch (error) {
    console.error('❌ Error updating API service:', error.message);
  }
}

function updateNetworkHelperConfig() {
  const networkHelperPath = path.join(__dirname, '../src/utils/networkHelper.js');
  
  try {
    let content = fs.readFileSync(networkHelperPath, 'utf8');
    
    console.log('🔄 Updating NetworkHelper configuration to prioritize localhost...');
    
    // Update server priority order
    content = content.replace(
      /const servers = \[[\s\S]*?\];/,
      `const servers = [
      'http://localhost:3000', // Local development (primary)
      'http://127.0.0.1:3000', // Local development (fallback)
      'http://10.0.2.2:3000', // Android emulator (fallback)
      'http://10.242.90.103:3000', // Server IP from server.js (fallback)
      'https://dash.doctorphc.id' // Production server (fallback)
    ];`
    );
    
    // Update getDefaultURL method
    content = content.replace(
      /static getDefaultURL\(\) \{[\s\S]*?return '.*?';[\s\S]*?\}/,
      `static getDefaultURL() {
    // Use localhost for development
    return 'http://localhost:3000/api/mobile';
  }`
    );
    
    fs.writeFileSync(networkHelperPath, content);
    console.log('✅ Updated NetworkHelper configuration');
    
  } catch (error) {
    console.error('❌ Error updating NetworkHelper:', error.message);
  }
}

function testLocalhostConnection() {
  const { execSync } = require('child_process');
  
  console.log('🧪 Testing localhost connection...');
  
  try {
    const testURL = 'http://localhost:3000/api/health';
    console.log(`Testing: ${testURL}`);
    
    const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${testURL}`, { 
      encoding: 'utf8',
      timeout: 5000 
    });
    
    if (response.trim() === '200') {
      console.log('✅ Localhost connection successful!');
      console.log('📱 Mobile app should now connect to localhost:3000');
    } else {
      console.log(`⚠️ Connection test returned status: ${response.trim()}`);
      console.log('💡 Make sure the backend server is running on localhost:3000');
    }
  } catch (testError) {
    console.log('❌ Connection test failed.');
    console.log('💡 Make sure to start the backend server:');
    console.log('   cd dash-app && npm run dev');
  }
}

function main() {
  console.log('🚀 Setting up localhost configuration for PHC Mobile...\n');
  
  updateApiServiceConfig();
  updateNetworkHelperConfig();
  
  console.log('\n🎉 Configuration updated successfully!');
  console.log('📋 Summary of changes:');
  console.log('  • API service now uses localhost as primary server');
  console.log('  • NetworkHelper prioritizes localhost over IP addresses');
  console.log('  • Both configs fallback to production server if needed\n');
  
  testLocalhostConnection();
  
  console.log('\n📝 Next steps:');
  console.log('  1. Make sure backend server is running: cd dash-app && npm run dev');
  console.log('  2. Restart your React Native development server');
  console.log('  3. Refresh your mobile app to use the new configuration');
}

if (require.main === module) {
  main();
}

module.exports = {
  updateApiServiceConfig,
  updateNetworkHelperConfig,
  testLocalhostConnection
};
