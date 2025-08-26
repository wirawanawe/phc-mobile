#!/usr/bin/env node

/**
 * Production Server Monitor Script
 * Continuously monitors the production server status
 * Usage: node scripts/monitor-production-server.js
 */

const fetch = require('node-fetch').default;

const PRODUCTION_URL = 'https://dash.doctorphc.id';
const HEALTH_ENDPOINT = `${PRODUCTION_URL}/api/health`;
const MOBILE_HEALTH_ENDPOINT = `${PRODUCTION_URL}/api/mobile/health`;

let checkCount = 0;
let lastStatus = null;

async function checkServerHealth() {
  checkCount++;
  const timestamp = new Date().toLocaleTimeString();
  
  console.log(`\n🔍 Check #${checkCount} - ${timestamp}`);
  console.log('=' .repeat(50));
  
  try {
    // Test main health endpoint
    console.log('🏥 Testing main health endpoint...');
    const healthResponse = await fetch(HEALTH_ENDPOINT, {
      method: 'GET',
      timeout: 10000
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Main health endpoint: WORKING');
      console.log('📊 Response:', healthData);
    } else {
      console.log(`❌ Main health endpoint: HTTP ${healthResponse.status}`);
    }
    
  } catch (error) {
    console.log('❌ Main health endpoint: ERROR -', error.message);
  }
  
  try {
    // Test mobile health endpoint
    console.log('\n📱 Testing mobile health endpoint...');
    const mobileResponse = await fetch(MOBILE_HEALTH_ENDPOINT, {
      method: 'GET',
      timeout: 10000
    });
    
    if (mobileResponse.ok) {
      const mobileData = await mobileResponse.json();
      console.log('✅ Mobile health endpoint: WORKING');
      console.log('📊 Response:', mobileData);
    } else {
      console.log(`❌ Mobile health endpoint: HTTP ${mobileResponse.status}`);
    }
    
  } catch (error) {
    console.log('❌ Mobile health endpoint: ERROR -', error.message);
  }
  
  // Test login endpoint (with rate limiting consideration)
  try {
    console.log('\n🔐 Testing login endpoint...');
    const loginResponse = await fetch(`${PRODUCTION_URL}/api/mobile/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@mobile.com',
        password: 'password123'
      }),
      timeout: 10000
    });
    
    if (loginResponse.status === 429) {
      console.log('⚠️ Login endpoint: RATE LIMITED (expected)');
    } else if (loginResponse.ok) {
      console.log('✅ Login endpoint: WORKING');
    } else {
      console.log(`❌ Login endpoint: HTTP ${loginResponse.status}`);
    }
    
  } catch (error) {
    console.log('❌ Login endpoint: ERROR -', error.message);
  }
  
  // Determine overall status
  const isWorking = await checkOverallStatus();
  
  if (isWorking && lastStatus !== 'WORKING') {
    console.log('\n🎉 SERVER IS BACK ONLINE!');
    console.log('🚀 Production server is now working');
    console.log('📱 Mobile app should now connect successfully');
    console.log('\n💡 You can now:');
    console.log('   1. Test the mobile app');
    console.log('   2. Try logging in');
    console.log('   3. Use all features normally');
  } else if (!isWorking && lastStatus !== 'DOWN') {
    console.log('\n⚠️ SERVER IS STILL DOWN');
    console.log('🔧 Server production masih mengalami masalah');
    console.log('📱 Mobile app akan mengalami error 502');
  }
  
  lastStatus = isWorking ? 'WORKING' : 'DOWN';
  
  console.log('\n📊 Summary:');
  console.log(`   Server Status: ${isWorking ? '✅ ONLINE' : '❌ OFFLINE'}`);
  console.log(`   Check Count: ${checkCount}`);
  console.log(`   Last Check: ${timestamp}`);
  
  if (isWorking) {
    console.log('\n🎯 Server is working! You can stop monitoring with Ctrl+C');
  } else {
    console.log('\n⏰ Next check in 30 seconds...');
  }
}

async function checkOverallStatus() {
  try {
    const response = await fetch(HEALTH_ENDPOINT, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

function main() {
  console.log('🚀 Production Server Monitor');
  console.log('============================');
  console.log(`🌐 Server: ${PRODUCTION_URL}`);
  console.log('⏰ Checking every 30 seconds');
  console.log('🛑 Press Ctrl+C to stop monitoring');
  console.log('');
  
  // Initial check
  checkServerHealth();
  
  // Set up interval
  const interval = setInterval(checkServerHealth, 30000);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Monitoring stopped by user');
    console.log(`📊 Total checks performed: ${checkCount}`);
    clearInterval(interval);
    process.exit(0);
  });
}

main();
