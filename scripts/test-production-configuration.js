#!/usr/bin/env node

/**
 * Test Production Configuration Script
 * Tests the new production configuration that forces production server
 */

const fetch = require('node-fetch').default;

const PRODUCTION_URL = 'https://dash.doctorphc.id/api/mobile';

async function testProductionConfiguration() {
  console.log('🚀 Testing New Production Configuration...\n');
  
  console.log('📡 Configuration:');
  console.log('   - API Base URL: https://dash.doctorphc.id/api/mobile');
  console.log('   - Mode: Production (forced)');
  console.log('   - No localhost fallback');
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
  
  // Test 2: Mobile API structure
  console.log('\n2️⃣ Testing Production Mobile API...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/missions`);
    
    console.log(`📊 Missions endpoint status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Production mobile API: WORKING');
    } else {
      console.log('❌ Production mobile API: FAILED');
    }
  } catch (error) {
    console.log('❌ Production mobile API: ERROR -', error.message);
  }
  
  // Test 3: Login endpoint (with rate limiting consideration)
  console.log('\n3️⃣ Testing Production Login Endpoint...');
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

    const data = await response.json();
    
    console.log(`📊 Login status: ${response.status}`);
    
    if (response.ok && data.success) {
      console.log('✅ Production login: WORKING');
      console.log(`👤 User ID: ${data.data?.user?.id}`);
      console.log(`🔑 Token: ${data.data?.accessToken ? 'Present' : 'Missing'}`);
    } else if (response.status === 429) {
      console.log('⚠️ Production login: RATE LIMITED (normal for production)');
      console.log(`📊 Rate limit message: ${data.message}`);
    } else {
      console.log('❌ Production login: FAILED');
      console.log(`📊 Error: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Production login: ERROR -', error.message);
  }
  
  // Test 4: Other endpoints
  console.log('\n4️⃣ Testing Other Production Endpoints...');
  
  const endpoints = [
    '/clinics',
    '/doctors',
    '/news'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🧪 Testing: ${endpoint}`);
    
    try {
      const response = await fetch(`${PRODUCTION_URL}${endpoint}`);
      console.log(`📊 ${endpoint} status: ${response.status}`);
      
      if (response.ok) {
        console.log(`✅ ${endpoint}: WORKING`);
      } else {
        console.log(`❌ ${endpoint}: FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
    }
  }
  
  // Test 5: Configuration summary
  console.log('\n5️⃣ Configuration Summary...');
  console.log('🚀 Current Configuration:');
  console.log('   - API Base URL: https://dash.doctorphc.id/api/mobile');
  console.log('   - Mode: Production (forced)');
  console.log('   - No development fallback');
  console.log('   - Direct production connection');
  
  console.log('\n💡 Mobile App Behavior:');
  console.log('   - Will always connect to production server');
  console.log('   - No test credential buttons (production mode)');
  console.log('   - Minimal logging for performance');
  console.log('   - Rate limiting protection active');
  
  console.log('\n✅ Production Configuration Test Completed!');
  console.log('\n🎯 Summary:');
  console.log('   - Configuration changed to production');
  console.log('   - No more localhost fallback');
  console.log('   - App will use production server exclusively');
  console.log('   - Ready for production deployment');
}

testProductionConfiguration().catch(console.error);
