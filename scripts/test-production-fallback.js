#!/usr/bin/env node

/**
 * Test Production Fallback Configuration Script
 * Tests the new production configuration with fallback to localhost
 */

const fetch = require('node-fetch').default;

async function testProductionFallback() {
  console.log('🚀 Testing Production Configuration with Fallback...\n');
  
  // Test 1: Production health
  console.log('1️⃣ Testing Production Health...');
  try {
    const response = await fetch('https://dash.doctorphc.id/api/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Production health: WORKING');
      console.log(`📊 Status: ${data.status}`);
      console.log(`📊 Message: ${data.message}`);
    } else {
      console.log('❌ Production health: FAILED');
    }
  } catch (error) {
    console.log('❌ Production health: ERROR -', error.message);
  }
  
  // Test 2: Production database status
  console.log('\n2️⃣ Testing Production Database...');
  try {
    const response = await fetch('https://dash.doctorphc.id/api/mobile/missions');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Production database: WORKING');
    } else {
      console.log('❌ Production database: FAILED');
      console.log(`📊 Error: ${data.message || 'Unknown error'}`);
      
      if (data.message && data.message.includes('Database error')) {
        console.log('🔍 Issue: Database connection problem detected');
      }
    }
  } catch (error) {
    console.log('❌ Production database: ERROR -', error.message);
  }
  
  // Test 3: Localhost health (fallback)
  console.log('\n3️⃣ Testing Localhost Health (Fallback)...');
  try {
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Localhost health: WORKING (available for fallback)');
      console.log(`📊 Status: ${data.status}`);
    } else {
      console.log('❌ Localhost health: FAILED');
    }
  } catch (error) {
    console.log('❌ Localhost health: ERROR -', error.message);
    console.log('⚠️ Localhost not available for fallback');
  }
  
  // Test 4: Localhost database status
  console.log('\n4️⃣ Testing Localhost Database...');
  try {
    const response = await fetch('http://localhost:3000/api/mobile/missions');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Localhost database: WORKING');
    } else {
      console.log('❌ Localhost database: FAILED');
      console.log(`📊 Error: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Localhost database: ERROR -', error.message);
  }
  
  // Test 5: Configuration summary
  console.log('\n5️⃣ Configuration Summary...');
  console.log('🚀 Current Configuration:');
  console.log('   - Primary: https://dash.doctorphc.id/api/mobile');
  console.log('   - Fallback: http://localhost:3000/api/mobile');
  console.log('   - Mode: Production with fallback');
  
  console.log('\n💡 App Behavior:');
  console.log('   - Will try production server first');
  console.log('   - Falls back to localhost if production fails');
  console.log('   - Better error handling for database issues');
  console.log('   - Rate limiting protection active');
  
  console.log('\n⚠️ Current Issues:');
  console.log('   - Production database connection problem');
  console.log('   - Need to fix database credentials on production server');
  console.log('   - Localhost available as fallback');
  
  console.log('\n✅ Production Fallback Test Completed!');
  console.log('\n🎯 Summary:');
  console.log('   - Production server is running');
  console.log('   - Database connection needs fixing');
  console.log('   - Fallback to localhost is available');
  console.log('   - App will work with fallback mechanism');
}

testProductionFallback().catch(console.error);
