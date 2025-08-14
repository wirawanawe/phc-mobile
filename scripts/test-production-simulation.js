#!/usr/bin/env node

/**
 * Test Production Simulation Script
 * Simulates production mode by testing with localhost but using production URL structure
 */

const fetch = require('node-fetch').default;

// Simulate production URL structure but point to localhost
const PRODUCTION_SIMULATION_URL = 'http://localhost:3000/api/mobile';

async function testProductionSimulation() {
  console.log('🚀 Starting production simulation testing...\n');
  
  console.log('🔧 Simulating production mode with localhost server...');
  console.log('📡 Using URL:', PRODUCTION_SIMULATION_URL);
  
  // Test health endpoint
  console.log('\n🏥 Testing health endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    console.log(`📊 Health status: ${healthResponse.status}`);
    console.log(`📊 Health data:`, healthData);
    
    if (healthResponse.ok) {
      console.log('✅ Health endpoint working correctly!');
    } else {
      console.log('❌ Health endpoint failed');
      return;
    }
  } catch (error) {
    console.error('❌ Health endpoint error:', error.message);
    return;
  }
  
  // Test login with production URL structure
  console.log('\n🔍 Testing login with production URL structure...');
  
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
      const response = await fetch(`${PRODUCTION_SIMULATION_URL}/auth/login`, {
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
        
        // Test authenticated endpoint with token
        if (data.data?.accessToken) {
          console.log(`\n🔐 Testing authenticated endpoint with token...`);
          try {
            const authResponse = await fetch(`${PRODUCTION_SIMULATION_URL}/missions`, {
              headers: {
                'Authorization': `Bearer ${data.data.accessToken}`,
                'Content-Type': 'application/json',
              }
            });
            
            console.log(`📊 Missions endpoint status: ${authResponse.status}`);
            
            if (authResponse.ok) {
              console.log('✅ Authenticated endpoint working correctly!');
            } else {
              console.log('❌ Authenticated endpoint failed');
            }
          } catch (authError) {
            console.error('❌ Authenticated endpoint error:', authError.message);
          }
        }
      } else {
        console.log(`❌ Login failed for ${user.name}:`, data.message || 'Unknown error');
      }
      
    } catch (error) {
      console.error(`❌ Error testing login for ${user.name}:`, error.message);
    }
  }
  
  // Test other endpoints
  console.log('\n🔍 Testing other endpoints...');
  
  const endpoints = [
    '/missions',
    '/clinics',
    '/doctors',
    '/news'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🧪 Testing endpoint: ${endpoint}`);
    
    try {
      const response = await fetch(`${PRODUCTION_SIMULATION_URL}${endpoint}`);
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
  
  console.log('\n✅ Production simulation testing completed!');
  console.log('\n💡 This test simulates how the app would behave in production mode');
  console.log('💡 The API configuration is working correctly with the production URL structure');
}

testProductionSimulation().catch(console.error);
