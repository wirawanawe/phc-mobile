#!/usr/bin/env node

/**
 * Server Connection Test Script
 * Tests server connectivity from command line
 */

const fetch = require('node-fetch');

const endpoints = [
  'http://localhost:3000/api/health',
  'http://localhost:3000/api/mobile/auth/me',
  'http://127.0.0.1:3000/api/health',
  'http://10.0.2.2:3000/api/health',
  'http://10.242.90.103:3000/api/health'
];

async function testEndpoint(url) {
  try {
    console.log(`🔍 Testing: ${url}`);
    
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`✅ ${url}: ${response.status} (${responseTime}ms)`);
    return {
      url,
      success: true,
      status: response.status,
      responseTime
    };
    
  } catch (error) {
    console.log(`❌ ${url}: ${error.message}`);
    return {
      url,
      success: false,
      error: error.message
    };
  }
}

async function testAllEndpoints() {
  console.log('🔍 Testing server connection...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  console.log('\n📊 Results Summary:');
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Working: ${working.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (working.length > 0) {
    const fastest = working.reduce((best, current) => 
      current.responseTime < best.responseTime ? current : best
    );
    console.log(`🏆 Fastest: ${fastest.url} (${fastest.responseTime}ms)`);
  }
  
  return results;
}

// Run the test
testAllEndpoints().catch(console.error); 