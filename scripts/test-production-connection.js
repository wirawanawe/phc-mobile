#!/usr/bin/env node

/**
 * Test Production Connection Script
 * Tests the production API connection after forcing production mode
 */

const fetch = require('node-fetch').default;

const PRODUCTION_URL = 'https://dash.doctorphc.id/api/mobile';

async function testProductionConnection() {
  console.log('🚀 Testing Production API Connection...\n');
  
  console.log('📡 Configuration:');
  console.log('   - API Base URL: https://dash.doctorphc.id/api/mobile');
  console.log('   - Mode: Production (forced)');
  console.log('   - No development fallbacks');
  console.log('');
  
  // Test 1: Health endpoint
  console.log('1️⃣ Testing Production Health Endpoint...');
  try {
    const response = await fetch('https://dash.doctorphc.id/api/health');
    const data = await response.json();
    
    console.log(`📊 Health status: ${response.status}`);
    console.log(`📊 Health data:`, data);
    
    if (response.ok) {
      console.log('✅ Production health endpoint: WORKING');
    } else {
      console.log('❌ Production health endpoint: FAILED');
    }
  } catch (error) {
    console.log('❌ Production health endpoint: ERROR -', error.message);
  }
  
  // Test 2: Mobile API health
  console.log('\n2️⃣ Testing Production Mobile API Health...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/health`);
    
    console.log(`📊 Mobile health status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Production mobile API health: WORKING');
      console.log('📊 Response:', data);
    } else {
      console.log('❌ Production mobile API health: FAILED');
    }
  } catch (error) {
    console.log('❌ Production mobile API health: ERROR -', error.message);
  }
  
  // Test 3: Missions endpoint
  console.log('\n3️⃣ Testing Production Missions Endpoint...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/missions`);
    
    console.log(`📊 Missions endpoint status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Production missions endpoint: WORKING');
    } else {
      console.log('❌ Production missions endpoint: FAILED');
    }
  } catch (error) {
    console.log('❌ Production missions endpoint: ERROR -', error.message);
  }
  
  // Test 4: Login endpoint (with rate limiting consideration)
  console.log('\n4️⃣ Testing Production Login Endpoint...');
  console.log('⚠️ Note: Rate limiting may affect this test');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@mobile.com',
        password: 'password123'
      })
    });
    
    console.log(`📊 Login endpoint status: ${response.status}`);
    
    if (response.status === 429) {
      console.log('⚠️ Production login endpoint: RATE LIMITED (expected)');
    } else if (response.ok) {
      console.log('✅ Production login endpoint: WORKING');
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ Production login endpoint: FAILED');
      console.log('📊 Error details:', errorData);
    }
  } catch (error) {
    console.log('❌ Production login endpoint: ERROR -', error.message);
  }
  
  console.log('\n🎯 Summary:');
  console.log('   - Production server: https://dash.doctorphc.id');
  console.log('   - Mobile API: https://dash.doctorphc.id/api/mobile');
  console.log('   - Configuration: Forced to production mode');
  console.log('   - No development fallbacks enabled');
  console.log('\n✅ Production configuration test completed!');
}

// Run the test
testProductionConnection().catch(console.error);
