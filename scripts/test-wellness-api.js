#!/usr/bin/env node

/**
 * Test Script: Wellness API Endpoints
 * 
 * This script tests the wellness API endpoints to verify they're working correctly
 * after the database schema fix.
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = 'http://10.242.90.103:3000/api/mobile';
const ENDPOINTS = [
  '/wellness/activities',
  '/wellness/activities/1',
  '/wellness/stats?period=7',
  '/wellness/mood-tracker?period=7',
  '/tracking/meal/today',
  '/tracking/today-summary',
  '/missions/stats',
  '/missions/my-missions'
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testWellnessEndpoints() {
  console.log('🧪 Testing Wellness API Endpoints...\n');
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 Testing: ${endpoint}`);
    
    try {
      const result = await makeRequest(url);
      results.push({
        endpoint,
        url,
        status: result.status,
        success: result.status >= 200 && result.status < 300,
        data: result.data,
        error: result.error
      });
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`  ✅ Status: ${result.status} - Success`);
        if (result.data && typeof result.data === 'object') {
          console.log(`  📊 Data keys: ${Object.keys(result.data).join(', ')}`);
        }
      } else {
        console.log(`  ❌ Status: ${result.status} - Failed`);
        if (result.data && result.data.error) {
          console.log(`  🔍 Error: ${result.data.error}`);
        }
      }
    } catch (error) {
      results.push({
        endpoint,
        url,
        status: 'ERROR',
        success: false,
        error: error.message
      });
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Summary
  console.log('📋 Test Summary:');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n🔍 Failed Endpoints:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`  - ${result.endpoint}: ${result.error || result.status}`);
    });
  }
  
  // Specific wellness activities test
  console.log('\n🔍 Detailed Wellness Activities Test:');
  const wellnessTest = results.find(r => r.endpoint === '/wellness/activities/1');
  if (wellnessTest) {
    if (wellnessTest.success) {
      console.log('✅ Wellness activities endpoint is working correctly');
      if (wellnessTest.data && wellnessTest.data.title) {
        console.log(`📝 Activity title: ${wellnessTest.data.title}`);
      }
    } else {
      console.log('❌ Wellness activities endpoint still has issues');
      console.log(`🔍 Error: ${wellnessTest.error || wellnessTest.status}`);
    }
  }
  
  return results;
}

// Database schema verification
async function verifyDatabaseSchema() {
  console.log('\n🔧 Database Schema Verification:');
  console.log('================================');
  
  try {
    // Test the specific endpoint that was causing issues
    const result = await makeRequest(`${API_BASE_URL}/wellness/activities/1`);
    
    if (result.status === 200) {
      console.log('✅ Database schema appears to be fixed');
      console.log('📊 Response structure:');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ Database schema may still have issues');
      console.log(`🔍 Status: ${result.status}`);
      if (result.data && result.data.error) {
        console.log(`🔍 Error: ${result.data.error}`);
      }
    }
  } catch (error) {
    console.log('❌ Cannot connect to API');
    console.log(`🔍 Error: ${error.message}`);
  }
}

// Run tests
async function runTests() {
  try {
    await testWellnessEndpoints();
    await verifyDatabaseSchema();
    
    console.log('\n🎉 Testing completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. If tests failed, run the database migration script');
    console.log('2. Restart the dash-app server');
    console.log('3. Run this test script again');
    console.log('4. Test the mobile app to verify everything works');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { testWellnessEndpoints, verifyDatabaseSchema }; 