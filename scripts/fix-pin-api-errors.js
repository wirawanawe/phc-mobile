#!/usr/bin/env node

/**
 * Script untuk Mendiagnosis dan Memperbaiki Error PIN API
 * 
 * Script ini akan:
 * - Test semua endpoint PIN API
 * - Identifikasi masalah koneksi
 * - Verifikasi database connectivity
 * - Test mobile app API calls
 */

const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config({ path: '../dash-app/.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

class PinApiDiagnostic {
  constructor() {
    this.connection = null;
    this.results = [];
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(dbConfig);
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ Database disconnected');
    }
  }

  async testDatabaseConnection() {
    try {
      console.log('\n🔍 Testing Database Connection...');
      
      // Test basic query
      const [rows] = await this.connection.execute('SELECT COUNT(*) as count FROM mobile_users');
      console.log(`✅ Database query successful: ${rows[0].count} users found`);
      
      // Test PIN fields
      const [pinRows] = await this.connection.execute(`
        SELECT pin_enabled, pin_code, pin_attempts 
        FROM mobile_users 
        WHERE id = 1
      `);
      console.log(`✅ PIN fields accessible: ${pinRows.length} rows returned`);
      
      return true;
    } catch (error) {
      console.error('❌ Database test failed:', error.message);
      return false;
    }
  }

  async testApiEndpoint(endpoint, method = 'GET', data = null) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`\n🔍 Testing ${method} ${url}`);
      
      let response;
      if (method === 'GET') {
        response = await axios.get(url);
      } else if (method === 'POST') {
        response = await axios.post(url, data);
      } else if (method === 'PUT') {
        response = await axios.put(url, data);
      } else if (method === 'DELETE') {
        response = await axios.delete(url);
      }
      
      console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      console.error(`❌ ${method} ${endpoint} failed:`, error.message);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  async testAllPinEndpoints() {
    console.log('\n🚀 Testing All PIN API Endpoints...');
    
    const tests = [
      {
        name: 'Get PIN Status (User 1)',
        endpoint: '/mobile/pin?user_id=1',
        method: 'GET'
      },
      {
        name: 'Get PIN Status (User 2)',
        endpoint: '/mobile/pin?user_id=2',
        method: 'GET'
      },
      {
        name: 'Get PIN Status (Email)',
        endpoint: '/mobile/pin?user_id=wiwawe@gmail.com',
        method: 'GET'
      },
      {
        name: 'Get PIN Validation Status (User 1)',
        endpoint: '/mobile/pin/validate?user_id=1',
        method: 'GET'
      },
      {
        name: 'Enable PIN (Test)',
        endpoint: '/mobile/pin',
        method: 'POST',
        data: {
          user_id: 'test-user-api',
          pin_code: '123456'
        }
      },
      {
        name: 'Disable PIN (Test)',
        endpoint: '/mobile/pin?user_id=test-user-api',
        method: 'DELETE'
      }
    ];

    for (const test of tests) {
      console.log(`\n🧪 ${test.name}`);
      const result = await this.testApiEndpoint(test.endpoint, test.method, test.data);
      this.results.push({
        name: test.name,
        ...result
      });
    }
  }

  async testMobileAppApiCalls() {
    console.log('\n📱 Testing Mobile App API Calls...');
    
    // Simulate mobile app API calls
    const mobileTests = [
      {
        name: 'Mobile App - Get PIN Status',
        endpoint: '/mobile/pin?user_id=1',
        method: 'GET'
      },
      {
        name: 'Mobile App - Validate PIN',
        endpoint: '/mobile/pin/validate',
        method: 'POST',
        data: {
          user_id: '1',
          pin_code: '123456'
        }
      }
    ];

    for (const test of mobileTests) {
      console.log(`\n📱 ${test.name}`);
      const result = await this.testApiEndpoint(test.endpoint, test.method, test.data);
      this.results.push({
        name: test.name,
        ...result
      });
    }
  }

  async checkServerStatus() {
    try {
      console.log('\n🔍 Checking Server Status...');
      
      const response = await axios.get('http://localhost:3000');
      console.log(`✅ Server is running on port 3000`);
      console.log(`   Status: ${response.status}`);
      
      return true;
    } catch (error) {
      console.error('❌ Server not accessible:', error.message);
      console.log('💡 Make sure the server is running with: cd dash-app && npm run dev');
      return false;
    }
  }

  async diagnoseError(errorMessage) {
    console.log('\n🔍 Diagnosing Error:', errorMessage);
    
    if (errorMessage.includes('Resource not found')) {
      console.log('💡 This error typically means:');
      console.log('   1. API endpoint doesn\'t exist');
      console.log('   2. Server is not running');
      console.log('   3. Wrong API URL in mobile app');
      console.log('   4. Network connectivity issues');
      
      // Check server status
      await this.checkServerStatus();
      
      // Test basic API endpoints
      await this.testApiEndpoint('/mobile/pin?user_id=1', 'GET');
    }
  }

  async runDiagnostics() {
    console.log('🔍 Starting PIN API Diagnostics\n');
    
    try {
      // Test database connection
      const dbOk = await this.testDatabaseConnection();
      if (!dbOk) {
        console.log('❌ Database issues detected. Please check database configuration.');
        return;
      }
      
      // Check server status
      const serverOk = await this.checkServerStatus();
      if (!serverOk) {
        console.log('❌ Server issues detected. Please start the server first.');
        return;
      }
      
      // Test all PIN endpoints
      await this.testAllPinEndpoints();
      
      // Test mobile app API calls
      await this.testMobileAppApiCalls();
      
      // Print summary
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Diagnostics failed:', error.message);
    }
  }

  printSummary() {
    console.log('\n📊 Diagnostics Summary:');
    console.log('========================');
    
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`- ${result.name}: ${result.error}`);
      });
      
      console.log('\n💡 Recommendations:');
      console.log('1. Check if server is running on port 3000');
      console.log('2. Verify database connection');
      console.log('3. Check API endpoint URLs in mobile app');
      console.log('4. Ensure all PIN API routes are properly configured');
    } else {
      console.log('\n🎉 All tests passed! PIN API is working correctly.');
    }
  }
}

// Run diagnostics
async function main() {
  const diagnostic = new PinApiDiagnostic();
  
  try {
    await diagnostic.connect();
    await diagnostic.runDiagnostics();
  } catch (error) {
    console.error('❌ Diagnostic script failed:', error.message);
    process.exit(1);
  } finally {
    await diagnostic.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = PinApiDiagnostic;
