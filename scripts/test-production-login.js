#!/usr/bin/env node

/**
 * Test Production Login Script
 * Tests the login functionality in production mode
 */

const fetch = require('node-fetch').default;

const PRODUCTION_BASE_URL = 'https://dash.doctorphc.id/api/mobile';

async function testProductionHealth() {
  console.log('🏥 Testing production health endpoint...');
  
  try {
    const response = await fetch('https://dash.doctorphc.id/api/health');
    const data = await response.json();
    
    console.log(`📊 Health status: ${response.status}`);
    console.log(`📊 Health data:`, data);
    
    if (response.ok) {
      console.log('✅ Production health endpoint working correctly!');
      return true;
    } else {
      console.log('❌ Production health endpoint failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Production health endpoint error:', error.message);
    return false;
  }
}

async function testProductionLogin() {
  console.log('🔍 Testing production login functionality...');
  
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
    console.log(`\n🧪 Testing production login for: ${user.name} (${user.email})`);
    
    try {
      const response = await fetch(`${PRODUCTION_BASE_URL}/auth/login`, {
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
        console.log(`✅ Production login successful for ${user.name}!`);
        console.log(`👤 User ID: ${data.data?.user?.id}`);
        console.log(`🔑 Token: ${data.data?.accessToken ? 'Present' : 'Missing'}`);
        console.log(`🔄 Refresh Token: ${data.data?.refreshToken ? 'Present' : 'Missing'}`);
      } else {
        console.log(`❌ Production login failed for ${user.name}:`, data.message || 'Unknown error');
      }
      
    } catch (error) {
      console.error(`❌ Error testing production login for ${user.name}:`, error.message);
    }
  }
}

async function testProductionEndpoints() {
  console.log('\n🔍 Testing other production endpoints...');
  
  const endpoints = [
    '/missions',
    '/clinics',
    '/doctors',
    '/news'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🧪 Testing endpoint: ${endpoint}`);
    
    try {
      const response = await fetch(`${PRODUCTION_BASE_URL}${endpoint}`);
      console.log(`📊 ${endpoint} status: ${response.status}`);
      
      if (response.ok) {
        console.log(`✅ ${endpoint} working correctly!`);
      } else {
        console.log(`❌ ${endpoint} failed`);
      }
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting production mode testing...\n');
  
  const healthOk = await testProductionHealth();
  
  if (healthOk) {
    await testProductionLogin();
    await testProductionEndpoints();
  } else {
    console.log('\n⚠️ Skipping login tests due to health check failure');
  }
  
  console.log('\n✅ Production mode testing completed!');
}

main().catch(console.error);
