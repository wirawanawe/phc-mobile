const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read current API configuration
function getCurrentAPIURL() {
  const apiPath = path.join(__dirname, '../src/services/api.js');
  const content = fs.readFileSync(apiPath, 'utf8');
  
  // Look for the primary network interface line
  const match = content.match(/return "http:\/\/(\d+\.\d+\.\d+\.\d+):3000\/api\/mobile"; \/\/ Primary network interface/);
  if (match) {
    return `http://${match[1]}:3000/api/mobile`;
  }
  
  // Fallback: look for any IP in the getLocalIPAddress function
  const fallbackMatch = content.match(/return "(\d+\.\d+\.\d+\.\d+)"; \/\/ Updated to match the primary network interface/);
  if (fallbackMatch) {
    return `http://${fallbackMatch[1]}:3000/api/mobile`;
  }
  
  return null;
}

// Test API endpoints
function testAPIEndpoints(baseURL) {
  const endpoints = [
    '/missions',
    '/auth/login',
    '/tracking/today-summary'
  ];
  
  console.log(`🧪 Testing API endpoints at: ${baseURL}`);
  console.log('─'.repeat(50));
  
  endpoints.forEach(endpoint => {
    try {
      const url = `${baseURL}${endpoint}`;
      const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`, { encoding: 'utf8' });
      const status = response.trim();
      
      if (status === '200') {
        console.log(`✅ ${endpoint} - OK (${status})`);
      } else {
        console.log(`❌ ${endpoint} - Failed (${status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
  });
}

// Test network connectivity
function testNetworkConnectivity() {
  console.log('🌐 Testing network connectivity...');
  console.log('─'.repeat(50));
  
  try {
    // Get current IP
    const output = execSync('ifconfig | grep "inet " | grep -v 127.0.0.1', { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    
    lines.forEach(line => {
      const match = line.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
      if (match) {
        const ip = match[1];
        console.log(`📍 Found IP: ${ip}`);
        
        // Test if backend is reachable
        try {
          const response = execSync(`curl -s -o /dev/null -w "%{http_code}" http://${ip}:3000/api/mobile/missions`, { encoding: 'utf8' });
          const status = response.trim();
          console.log(`   Backend status: ${status === '200' ? '✅ Reachable' : '❌ Not reachable'}`);
        } catch (error) {
          console.log(`   Backend status: ❌ Not reachable`);
        }
      }
    });
  } catch (error) {
    console.log('❌ Error getting network interfaces:', error.message);
  }
}

// Main function
function main() {
  console.log('🔍 API Connection Test');
  console.log('='.repeat(50));
  
  // Test network connectivity
  testNetworkConnectivity();
  console.log('');
  
  // Test API endpoints
  const baseURL = getCurrentAPIURL();
  if (baseURL) {
    testAPIEndpoints(baseURL);
  } else {
    console.log('❌ Could not determine API URL from configuration');
  }
  
  console.log('');
  console.log('💡 Tips:');
  console.log('- If endpoints return 404, check if backend routes are implemented');
  console.log('- If connection fails, run: npm run update-api-ip');
  console.log('- Make sure backend server is running: cd ../dash-app && npm run dev');
}

if (require.main === module) {
  main();
}

module.exports = { testAPIEndpoints, testNetworkConnectivity }; 