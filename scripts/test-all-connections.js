#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing All Network Connections');
console.log('==================================');
console.log('📍 Target IP: 10.242.90.103');
console.log('');

// Test endpoints
const endpoints = [
  'http://10.242.90.103:3000/api/mobile/auth/me',
  'http://10.242.90.103:3000/api/mobile/users',
  'http://10.242.90.103:3000/api/mobile/missions',
  'http://10.242.90.103:3000/api/mobile/wellness',
  'http://10.242.90.103:3000/api/mobile/tracking/meal/today',
  'http://10.242.90.103:3000/api/mobile/tracking/water/today',
  'http://10.242.90.103:3000/api/mobile/tracking/sleep/today'
];

// Test each endpoint
let successCount = 0;
let totalCount = endpoints.length;

console.log('🧪 Testing API endpoints...\n');

for (const endpoint of endpoints) {
  try {
    const startTime = Date.now();
    const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${endpoint}`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const statusCode = response.trim();
    const isSuccess = statusCode === '200' || statusCode === '401'; // 401 is expected for auth endpoints
    
    if (isSuccess) {
      console.log(`✅ ${endpoint} - ${statusCode} (${responseTime}ms)`);
      successCount++;
    } else {
      console.log(`❌ ${endpoint} - ${statusCode} (${responseTime}ms)`);
    }
  } catch (error) {
    console.log(`❌ ${endpoint} - FAILED (${error.message})`);
  }
}

console.log(`\n📊 Results: ${successCount}/${totalCount} endpoints working`);

if (successCount === totalCount) {
  console.log('🎉 All endpoints are working correctly!');
} else {
  console.log('⚠️ Some endpoints failed. Please check server status.');
}

console.log('\n🔧 Configuration Summary:');
console.log('   Primary Server: 10.242.90.103:3000');
console.log('   API Base URL: http://10.242.90.103:3000/api/mobile');
console.log('   Health Check: http://10.242.90.103:3000/health');

console.log('\n📱 Mobile App Configuration:');
console.log('   - All services now use 10.242.90.103');
console.log('   - Network tests updated');
console.log('   - Test scripts updated');
console.log('   - Setup scripts updated');

console.log('\n💡 Next Steps:');
console.log('   1. Restart your mobile app');
console.log('   2. Test login functionality');
console.log('   3. Verify all features work correctly'); 