#!/usr/bin/env node

/**
 * Test Login Fix Script
 * Tests the login functionality to verify the fix is working
 */

const fetch = require('node-fetch').default;

const BASE_URL = 'http://localhost:3000/api/mobile';

async function testLogin() {
  console.log('🔍 Testing login functionality after fix...');
  
  const testUsers = [
    {
      email: 'test@mobile.com',
      password: 'password123',
      name: 'Test User'
    },
    {
      email: 'john.doe@example.com',
      password: 'password123',
      name: 'John Doe'
    }
  ];

  for (const user of testUsers) {
    console.log(`\n🧪 Testing login for: ${user.name} (${user.email})`);
    
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });

      const data = await response.json();
      
      console.log(`📊 Response status: ${response.status}`);
      
      if (response.ok && data.success) {
        console.log(`✅ Login successful for ${user.name}!`);
        console.log(`👤 User ID: ${data.data?.user?.id}`);
        console.log(`🔑 Token: ${data.data?.accessToken ? 'Present' : 'Missing'}`);
        console.log(`🔄 Refresh Token: ${data.data?.refreshToken ? 'Present' : 'Missing'}`);
      } else {
        console.log(`❌ Login failed for ${user.name}:`, data.message || 'Unknown error');
      }
      
    } catch (error) {
      console.error(`❌ Error testing login for ${user.name}:`, error.message);
    }
  }
}

// Test health endpoint first
async function testHealth() {
  console.log('🏥 Testing health endpoint...');
  
  try {
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    
    console.log(`📊 Health status: ${response.status}`);
    console.log(`📊 Health data:`, data);
    
    if (response.ok) {
      console.log('✅ Health endpoint working correctly!');
    } else {
      console.log('❌ Health endpoint failed');
    }
  } catch (error) {
    console.error('❌ Health endpoint error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting login fix verification...\n');
  
  await testHealth();
  await testLogin();
  
  console.log('\n✅ Login fix verification completed!');
}

main().catch(console.error);
