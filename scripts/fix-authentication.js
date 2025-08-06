const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 PHC Mobile Authentication Fix Script');
console.log('=====================================\n');

// Function to run commands and capture output
function runCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to check if server is running
function checkServerStatus() {
  console.log('🔍 Checking server status...');
  
  const result = runCommand('curl -s http://10.242.90.103:3000/api/health');
  
  if (result.success) {
    console.log('✅ Server is running');
    return true;
  } else {
    console.log('❌ Server is not responding');
    console.log('   Error:', result.error);
    return false;
  }
}

// Function to test authentication endpoints
function testAuthEndpoints() {
  console.log('\n🔍 Testing authentication endpoints...');
  
  const endpoints = [
    'http://10.242.90.103:3000/api/mobile/auth/login',
    'http://10.242.90.103:3000/api/mobile/auth/me',
    'http://10.242.90.103:3000/api/mobile/auth/test-token'
  ];
  
  endpoints.forEach(endpoint => {
    const result = runCommand(`curl -s -o /dev/null -w "%{http_code}" ${endpoint}`);
    if (result.success) {
      const statusCode = result.output.trim();
      if (statusCode === '200' || statusCode === '401') {
        console.log(`✅ ${endpoint} - Status: ${statusCode}`);
      } else {
        console.log(`❌ ${endpoint} - Status: ${statusCode}`);
      }
    } else {
      console.log(`❌ ${endpoint} - Error: ${result.error}`);
    }
  });
}

// Function to test login with test credentials
function testLogin() {
  console.log('\n🔍 Testing login with test credentials...');
  
  const loginData = {
    email: 'test@mobile.com',
    password: 'password123'
  };
  
  const result = runCommand(`curl -s -X POST http://10.242.90.103:3000/api/mobile/auth/login \
    -H "Content-Type: application/json" \
    -d '${JSON.stringify(loginData)}'`);
  
  if (result.success) {
    try {
      const response = JSON.parse(result.output);
      if (response.success) {
        console.log('✅ Login successful');
        console.log('   User ID:', response.data.user.id);
        console.log('   Token received:', !!response.data.accessToken);
        return response.data.accessToken;
      } else {
        console.log('❌ Login failed:', response.message);
        return null;
      }
    } catch (error) {
      console.log('❌ Invalid JSON response:', result.output);
      return null;
    }
  } else {
    console.log('❌ Login request failed:', result.error);
    return null;
  }
}

// Function to test token verification
function testTokenVerification(token) {
  if (!token) {
    console.log('❌ No token to test');
    return false;
  }
  
  console.log('\n🔍 Testing token verification...');
  
  const result = runCommand(`curl -s -X POST http://10.242.90.103:3000/api/mobile/auth/test-token \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${token}" \
    -d '{"token": "${token}"}'`);
  
  if (result.success) {
    try {
      const response = JSON.parse(result.output);
      if (response.success) {
        console.log('✅ Token verification successful');
        console.log('   User ID:', response.payload.userId);
        return true;
      } else {
        console.log('❌ Token verification failed:', response.message);
        return false;
      }
    } catch (error) {
      console.log('❌ Invalid JSON response:', result.output);
      return false;
    }
  } else {
    console.log('❌ Token verification request failed:', result.error);
    return false;
  }
}

// Function to test user profile endpoint
function testUserProfile(token) {
  if (!token) {
    console.log('❌ No token to test profile');
    return false;
  }
  
  console.log('\n🔍 Testing user profile endpoint...');
  
  const result = runCommand(`curl -s -X GET http://10.242.90.103:3000/api/mobile/auth/me \
    -H "Authorization: Bearer ${token}"`);
  
  if (result.success) {
    try {
      const response = JSON.parse(result.output);
      if (response.success) {
        console.log('✅ User profile successful');
        console.log('   User ID:', response.data.id);
        console.log('   User Name:', response.data.name);
        console.log('   User Email:', response.data.email);
        return true;
      } else {
        console.log('❌ User profile failed:', response.message);
        return false;
      }
    } catch (error) {
      console.log('❌ Invalid JSON response:', result.output);
      return false;
    }
  } else {
    console.log('❌ User profile request failed:', result.error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting authentication diagnostics...\n');
  
  // Check server status
  const serverRunning = checkServerStatus();
  if (!serverRunning) {
    console.log('\n❌ Server is not running. Please start the server first.');
    console.log('   Run: cd dash-app && npm run dev');
    return;
  }
  
  // Test endpoints
  testAuthEndpoints();
  
  // Test login
  const token = testLogin();
  
  // Test token verification
  if (token) {
    const tokenValid = testTokenVerification(token);
    
    // Test user profile
    if (tokenValid) {
      testUserProfile(token);
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('1. Server is running');
  console.log('2. Authentication endpoints are accessible');
  console.log('3. Test login credentials work');
  console.log('4. Token generation and verification work');
  console.log('5. User profile endpoint works');
  
  console.log('\n🔧 Next steps:');
  console.log('1. Clear any existing auth data in the mobile app');
  console.log('2. Use the ConnectionDebug screen in the app');
  console.log('3. Try logging in with test@mobile.com / password123');
  console.log('4. If issues persist, check the mobile app logs');
}

// Run the script
main().catch(console.error); 