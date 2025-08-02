const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Available network interfaces
const INTERFACES = [
  '10.242.90.103'
];

// Function to update API configuration with specific IP
function updateAPIConfigWithIP(ip) {
  const apiPath = path.join(__dirname, '../src/services/api.js');
  
  try {
    let content = fs.readFileSync(apiPath, 'utf8');
    
    console.log(`🔄 Updating API configuration to use IP: ${ip}`);
    
    // Update the primary network interface IP
    content = content.replace(
      /return "http:\/\/\d+\.\d+\.\d+\.\d+:3000\/api\/mobile"; \/\/ Primary network interface/,
      `return "http://${ip}:3000/api/mobile"; // Primary network interface`
    );
    
    // Update the getLocalIPAddress function
    content = content.replace(
      /return "\d+\.\d+\.\d+\.\d+"; \/\/ Updated to match the primary network interface/,
      `return "${ip}"; // Updated to match the primary network interface`
    );
    
    fs.writeFileSync(apiPath, content);
    console.log(`✅ Updated API configuration to use IP: ${ip}`);
    
    // Test the connection
    try {
      const testURL = `http://${ip}:3000/api/mobile/missions`;
      console.log(`🧪 Testing connection to: ${testURL}`);
      
      const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${testURL}`, { encoding: 'utf8' });
      
      if (response.trim() === '200') {
        console.log('✅ Connection test successful!');
        console.log(`📱 Try this URL on your mobile device: ${testURL}`);
        return true;
      } else {
        console.log(`⚠️ Connection test returned status: ${response.trim()}`);
        return false;
      }
    } catch (testError) {
      console.log('❌ Connection test failed.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error updating API configuration:', error.message);
    return false;
  }
}

// Test all available interfaces
function testAllInterfaces() {
  console.log('🔍 Testing all available network interfaces...\n');
  
  for (const ip of INTERFACES) {
    console.log(`\n📍 Testing interface: ${ip}`);
    console.log('='.repeat(50));
    
    if (updateAPIConfigWithIP(ip)) {
      console.log(`\n🎉 SUCCESS! Mobile app is now configured to use: ${ip}`);
      console.log(`📱 Test on your mobile device browser: http://${ip}:3000/api/mobile/missions`);
      console.log('\n🔄 Restart your mobile app to apply the changes.');
      break;
    } else {
      console.log(`❌ Interface ${ip} is not working properly.`);
    }
  }
}

// Run based on command line argument
const action = process.argv[2];

if (action === 'test-all') {
  testAllInterfaces();
} else if (action && INTERFACES.includes(action)) {
  updateAPIConfigWithIP(action);
} else {
  console.log('🔧 Network Interface Tester');
  console.log('Usage:');
  console.log('  node test-network-interfaces.js test-all     # Test all interfaces');
  console.log('  node test-network-interfaces.js <IP>        # Use specific IP');
  console.log('\nAvailable IPs:');
  INTERFACES.forEach(ip => console.log(`  - ${ip}`));
} 