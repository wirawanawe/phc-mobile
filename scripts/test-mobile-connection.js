#!/usr/bin/env node

/**
 * Mobile Connection Test Script
 * Simulates mobile app connection testing to debug network issues
 */

const fetch = require('node-fetch');

class MobileConnectionTest {
  static async testEndpoint(url, timeout = 10000) {
    try {
      console.log(`🔍 Testing: ${url}`);
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
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
      
      console.log(`✅ ${url} - ${responseTime}ms (Status: ${response.status})`);
      return { success: true, responseTime, status: response.status };
      
    } catch (error) {
      console.log(`❌ ${url} - ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  static async testAllEndpoints() {
      const endpoints = [
    'http://10.242.90.103:3000/api/mobile/auth/me'
  ];

    console.log('🔍 Mobile Connection Test');
    console.log('========================');
    console.log('');

    const results = [];

    for (const endpoint of endpoints) {
      const result = await this.testEndpoint(endpoint);
      results.push({ endpoint, ...result });
    }

    return results;
  }

  static async findBestEndpoint() {
    const results = await this.testAllEndpoints();
    const workingEndpoints = results.filter(r => r.success);
    
    if (workingEndpoints.length === 0) {
      console.log('\n❌ No endpoints are working!');
      console.log('Possible issues:');
      console.log('1. Server is not running');
      console.log('2. Wrong IP addresses');
      console.log('3. Network connectivity issues');
      return null;
    }

    const fastest = workingEndpoints.reduce((best, current) => 
      current.responseTime < best.responseTime ? current : best
    );

    console.log(`\n🚀 Best endpoint: ${fastest.endpoint} (${fastest.responseTime}ms)`);
    return fastest.endpoint.replace('/auth/me', '');
  }

  static async runDiagnostic() {
    console.log('🔧 Mobile Connection Diagnostic');
    console.log('==============================');
    console.log('');

    const results = await this.testAllEndpoints();
    const workingCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log(`\n📊 Summary:`);
    console.log(`   Working endpoints: ${workingCount}/${totalCount}`);

    if (workingCount === 0) {
      console.log('\n❌ No endpoints are working. Please check:');
      console.log('   1. Server is running on port 3000');
      console.log('   2. Network connectivity');
      console.log('   3. IP address configuration');
      return false;
    }

    const bestEndpoint = await this.findBestEndpoint();
    if (bestEndpoint) {
      console.log(`\n✅ Connection successful!`);
      console.log(`   Recommended endpoint: ${bestEndpoint}`);
      return true;
    }

    return false;
  }
}

// Run the diagnostic if this script is executed directly
if (require.main === module) {
  MobileConnectionTest.runDiagnostic()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Diagnostic failed:', error.message);
      process.exit(1);
    });
}

module.exports = MobileConnectionTest; 