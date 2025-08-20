#!/usr/bin/env node

const http = require('http');
const { exec } = require('child_process');

console.log('🔍 Connection Debug Script');
console.log('========================\n');

// Test 1: Check if server is running
console.log('1. Checking if server is running...');
exec('ps aux | grep "node server.js" | grep -v grep', (error, stdout, stderr) => {
  if (error || !stdout) {
    console.log('❌ Server is not running');
    console.log('💡 Start the server with: cd dash-app && npm run dev');
  } else {
    console.log('✅ Server is running');
    console.log('   Process:', stdout.trim());
  }
  
  // Test 2: Check server port
  console.log('\n2. Checking server port...');
  exec('netstat -an | grep 3000', (error, stdout, stderr) => {
    if (error || !stdout) {
      console.log('❌ Port 3000 is not listening');
    } else {
      console.log('✅ Port 3000 is listening');
      console.log('   Status:', stdout.trim());
    }
    
    // Test 3: Test localhost connection
    console.log('\n3. Testing localhost connection...');
    testConnection('http://localhost:3000/api/health');
  });
});

function testConnection(url) {
  const req = http.get(url, (res) => {
    console.log(`✅ ${url}: HTTP ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('   Server is responding correctly');
      
      // Test 4: Test mobile API endpoint
      console.log('\n4. Testing mobile API endpoint...');
      testConnection('http://localhost:3000/api/mobile/auth/login');
    }
  });
  
  req.on('error', (error) => {
    console.log(`❌ ${url}: ${error.message}`);
    console.log('💡 Possible solutions:');
    console.log('   - Make sure the server is running');
    console.log('   - Check if port 3000 is available');
    console.log('   - Try restarting the server');
  });
  
  req.setTimeout(10000, () => {
    console.log(`⏰ ${url}: Timeout`);
    req.destroy();
  });
}

// Test 5: Check network interfaces
console.log('\n5. Checking network interfaces...');
exec('ifconfig | grep "inet " | grep -v 127.0.0.1', (error, stdout, stderr) => {
  if (error || !stdout) {
    console.log('❌ No network interfaces found');
  } else {
    console.log('✅ Available network interfaces:');
    stdout.split('\n').forEach(line => {
      if (line.trim()) {
        console.log('   ' + line.trim());
      }
    });
  }
  
  console.log('\n🔍 Debug Summary:');
  console.log('================');
  console.log('If all tests pass but the app still can\'t connect:');
  console.log('1. Check if you\'re running on iOS simulator or physical device');
  console.log('2. For iOS simulator: use localhost:3000');
  console.log('3. For physical device: use your machine\'s IP address');
  console.log('4. Make sure both devices are on the same network');
  console.log('5. Check firewall settings');
  console.log('6. Try restarting the React Native app');
});
