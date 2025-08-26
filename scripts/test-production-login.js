#!/usr/bin/env node

/**
 * Test Production Login Script
 * Tests different login credentials on the production server
 * Usage: node scripts/test-production-login.js
 */

const fetch = require('node-fetch').default;

const PRODUCTION_URL = 'https://dash.doctorphc.id/api/mobile';

// Test credentials to try
const testCredentials = [
  { email: 'test@mobile.com', password: 'password123', description: 'Development test user' },
  { email: 'john.doe@example.com', password: 'password123', description: 'John Doe test user' },
  { email: 'admin@doctorphc.id', password: 'admin123', description: 'Admin user' },
  { email: 'user@doctorphc.id', password: 'user123', description: 'Regular user' },
  { email: 'doctor@doctorphc.id', password: 'doctor123', description: 'Doctor user' },
  { email: 'patient@doctorphc.id', password: 'patient123', description: 'Patient user' }
];

async function testLogin(credentials) {
  try {
    console.log(`🔐 Testing: ${credentials.description}`);
    console.log(`   Email: ${credentials.email}`);
    
    const response = await fetch(`${PRODUCTION_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      }),
      timeout: 10000
    });
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ SUCCESS - Login successful!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      return { success: true, credentials, data };
    } else if (response.status === 401) {
      console.log('❌ FAILED - Invalid credentials');
      return { success: false, credentials, error: 'Invalid credentials' };
    } else if (response.status === 429) {
      console.log('⚠️ RATE LIMITED - Too many attempts');
      return { success: false, credentials, error: 'Rate limited' };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED - HTTP ${response.status}: ${errorText}`);
      return { success: false, credentials, error: `HTTP ${response.status}` };
    }
    
  } catch (error) {
    console.log(`❌ ERROR - ${error.message}`);
    return { success: false, credentials, error: error.message };
  }
}

async function testRegistration() {
  try {
    console.log('\n📝 Testing Registration...');
    
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User',
      phone: '+6281234567890'
    };
    
    console.log(`   Email: ${testUser.email}`);
    
    const response = await fetch(`${PRODUCTION_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
      timeout: 10000
    });
    
    if (response.status === 201 || response.status === 200) {
      const data = await response.json();
      console.log('✅ SUCCESS - Registration successful!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      return { success: true, user: testUser, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED - HTTP ${response.status}: ${errorText}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
  } catch (error) {
    console.log(`❌ ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkServerStatus() {
  try {
    console.log('🏥 Checking server status...');
    
    const response = await fetch(`${PRODUCTION_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is healthy');
      console.log('📊 Status:', data);
      return true;
    } else {
      console.log(`❌ Server error: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Production Login Test');
  console.log('========================');
  console.log(`🌐 Server: ${PRODUCTION_URL}`);
  console.log('');
  
  // Check server status first
  const serverOk = await checkServerStatus();
  if (!serverOk) {
    console.log('❌ Server is not responding. Cannot test login.');
    return;
  }
  
  console.log('\n🔐 Testing Login Credentials...');
  console.log('=' .repeat(50));
  
  const results = [];
  
  for (const credentials of testCredentials) {
    const result = await testLogin(credentials);
    results.push(result);
    console.log(''); // Add spacing between tests
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test registration
  const registrationResult = await testRegistration();
  results.push(registrationResult);
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('=' .repeat(50));
  
  const successfulLogins = results.filter(r => r.success && r.credentials);
  const failedLogins = results.filter(r => !r.success && r.credentials);
  const registrationSuccess = results.find(r => r.success && r.user);
  
  console.log(`✅ Successful logins: ${successfulLogins.length}`);
  console.log(`❌ Failed logins: ${failedLogins.length}`);
  console.log(`📝 Registration: ${registrationSuccess ? 'SUCCESS' : 'FAILED'}`);
  
  if (successfulLogins.length > 0) {
    console.log('\n🎉 Working credentials found:');
    successfulLogins.forEach(result => {
      console.log(`   - ${result.credentials.email} / ${result.credentials.password}`);
    });
  } else {
    console.log('\n⚠️ No working credentials found');
    console.log('💡 You may need to:');
    console.log('   1. Create a new user account');
    console.log('   2. Contact admin for credentials');
    console.log('   3. Use the registration endpoint');
  }
  
  if (registrationSuccess) {
    console.log('\n📝 New user created:');
    console.log(`   Email: ${registrationSuccess.user.email}`);
    console.log(`   Password: ${registrationSuccess.user.password}`);
    console.log('💡 You can use these credentials to login!');
  }
}

main().catch(console.error);
