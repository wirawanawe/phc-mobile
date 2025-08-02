const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to get the primary IP address
function getPrimaryIP() {
  try {
    // Get all IP addresses
    const output = execSync('ifconfig | grep "inet " | grep -v 127.0.0.1', { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    
    // Extract IP addresses
    const ips = lines.map(line => {
      const match = line.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    }).filter(ip => ip);
    
    // Prefer 192.168.x.x addresses for local development
    const localIP = ips.find(ip => ip.startsWith('192.168.'));
    if (localIP) {
      return localIP;
    }
    
    // Fallback to first available IP
    return ips[0] || 'localhost';
  } catch (error) {
    console.error('Error getting IP address:', error.message);
    return 'localhost';
  }
}

// Function to update API configuration
function updateAPIConfig() {
  const apiPath = path.join(__dirname, '../src/services/api.js');
  
  try {
    let content = fs.readFileSync(apiPath, 'utf8');
    const newIP = getPrimaryIP();
    
    console.log(`🔍 Detected IP address: ${newIP}`);
    
    // Update the primary network interface IP
    content = content.replace(
      /return "http:\/\/\d+\.\d+\.\d+\.\d+:3000\/api\/mobile"; \/\/ Primary network interface/,
      `return "http://${newIP}:3000/api/mobile"; // Primary network interface`
    );
    
    // Update the getLocalIPAddress function
    content = content.replace(
      /return "\d+\.\d+\.\d+\.\d+"; \/\/ Updated to match the primary network interface/,
      `return "${newIP}"; // Updated to match the primary network interface`
    );
    
    fs.writeFileSync(apiPath, content);
    console.log(`✅ Updated API configuration to use IP: ${newIP}`);
    
    // Test the connection
    try {
      const testURL = `http://${newIP}:3000/api/mobile/missions`;
      console.log(`🧪 Testing connection to: ${testURL}`);
      
      const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${testURL}`, { encoding: 'utf8' });
      
      if (response.trim() === '200') {
        console.log('✅ Connection test successful!');
      } else {
        console.log(`⚠️ Connection test returned status: ${response.trim()}`);
      }
    } catch (testError) {
      console.log('⚠️ Connection test failed. Make sure the backend server is running.');
    }
    
  } catch (error) {
    console.error('❌ Error updating API configuration:', error.message);
  }
}

// Run the update
if (require.main === module) {
  console.log('🔄 Updating API configuration...');
  updateAPIConfig();
}

module.exports = { getPrimaryIP, updateAPIConfig }; 