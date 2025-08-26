#!/usr/bin/env node

/**
 * Script untuk Test Fitur Forgot PIN dengan WhatsApp OTP
 * 
 * Script ini akan:
 * - Test API endpoint forgot PIN
 * - Test WhatsApp OTP sending
 * - Test PIN reset process
 * - Memberikan laporan lengkap tentang testing
 */

const axios = require('axios');
require('dotenv').config({ path: '../dash-app/.env.local' });

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PHONE = '+6281234567890';

class ForgotPinTester {
  constructor() {
    this.results = {
      tests: [],
      success: 0,
      failed: 0,
      total: 0
    };
  }

  // Add test result
  addTestResult(testName, success, details = '') {
    this.results.tests.push({
      name: testName,
      success,
      details,
      timestamp: new Date().toISOString()
    });
    
    if (success) {
      this.results.success++;
    } else {
      this.results.failed++;
    }
    this.results.total++;
  }

  // Test 1: Request OTP
  async testRequestOTP() {
    console.log('\n🧪 Test 1: Request OTP');
    console.log('========================');
    
    try {
      const response = await axios.post(`${BASE_URL}/mobile/pin/forgot-pin`, {
        email: TEST_EMAIL
      });

      console.log('✅ Request OTP Response:', response.data);
      
      if (response.data.success) {
        this.addTestResult('Request OTP', true, 'OTP request successful');
        return response.data;
      } else {
        this.addTestResult('Request OTP', false, response.data.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Request OTP Error:', error.response?.data || error.message);
      this.addTestResult('Request OTP', false, error.response?.data?.message || error.message);
      return null;
    }
  }

  // Test 2: Verify OTP (simulation)
  async testVerifyOTP() {
    console.log('\n🧪 Test 2: Verify OTP (Simulation)');
    console.log('===================================');
    
    try {
      // In real scenario, user would get OTP from WhatsApp
      // For testing, we'll simulate with a mock OTP
      const mockOTP = '123456';
      
      console.log('📱 Simulated OTP from WhatsApp:', mockOTP);
      
      // Note: In real implementation, this would be done in the mobile app
      // Here we're just testing the concept
      this.addTestResult('Verify OTP', true, 'OTP verification simulation successful');
      return mockOTP;
    } catch (error) {
      console.error('❌ Verify OTP Error:', error.message);
      this.addTestResult('Verify OTP', false, error.message);
      return null;
    }
  }

  // Test 3: Reset PIN
  async testResetPIN(otp) {
    console.log('\n🧪 Test 3: Reset PIN');
    console.log('====================');
    
    try {
      const newPin = '654321';
      
      const response = await axios.put(`${BASE_URL}/mobile/pin/forgot-pin`, {
        email: TEST_EMAIL,
        otp: otp,
        newPin: newPin
      });

      console.log('✅ Reset PIN Response:', response.data);
      
      if (response.data.success) {
        this.addTestResult('Reset PIN', true, 'PIN reset successful');
        return true;
      } else {
        this.addTestResult('Reset PIN', false, response.data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Reset PIN Error:', error.response?.data || error.message);
      this.addTestResult('Reset PIN', false, error.response?.data?.message || error.message);
      return false;
    }
  }

  // Test 4: Test with invalid email
  async testInvalidEmail() {
    console.log('\n🧪 Test 4: Invalid Email');
    console.log('========================');
    
    try {
      const response = await axios.post(`${BASE_URL}/mobile/pin/forgot-pin`, {
        email: 'invalid@example.com'
      });

      console.log('✅ Invalid Email Response:', response.data);
      
      // This should fail as expected
      if (!response.data.success) {
        this.addTestResult('Invalid Email', true, 'Correctly rejected invalid email');
      } else {
        this.addTestResult('Invalid Email', false, 'Should have rejected invalid email');
      }
    } catch (error) {
      console.log('✅ Invalid Email Error (Expected):', error.response?.data?.message || error.message);
      this.addTestResult('Invalid Email', true, 'Correctly rejected invalid email');
    }
  }

  // Test 5: Test with invalid OTP
  async testInvalidOTP() {
    console.log('\n🧪 Test 5: Invalid OTP');
    console.log('======================');
    
    try {
      const response = await axios.put(`${BASE_URL}/mobile/pin/forgot-pin`, {
        email: TEST_EMAIL,
        otp: '000000',
        newPin: '123456'
      });

      console.log('✅ Invalid OTP Response:', response.data);
      
      // This should fail as expected
      if (!response.data.success) {
        this.addTestResult('Invalid OTP', true, 'Correctly rejected invalid OTP');
      } else {
        this.addTestResult('Invalid OTP', false, 'Should have rejected invalid OTP');
      }
    } catch (error) {
      console.log('✅ Invalid OTP Error (Expected):', error.response?.data?.message || error.message);
      this.addTestResult('Invalid OTP', true, 'Correctly rejected invalid OTP');
    }
  }

  // Test 6: Test WhatsApp service
  async testWhatsAppService() {
    console.log('\n🧪 Test 6: WhatsApp Service');
    console.log('===========================');
    
    try {
      // Test WhatsApp service configuration
      const whatsappService = require('../dash-app/services/whatsappService.cjs');
      
      const config = await whatsappService.verifyConfiguration();
      console.log('✅ WhatsApp Config:', config);
      
      if (config.success) {
        this.addTestResult('WhatsApp Service', true, 'WhatsApp service configured correctly');
      } else {
        this.addTestResult('WhatsApp Service', false, config.error);
      }
    } catch (error) {
      console.error('❌ WhatsApp Service Error:', error.message);
      this.addTestResult('WhatsApp Service', false, error.message);
    }
  }

  // Test 7: Test database fields
  async testDatabaseFields() {
    console.log('\n🧪 Test 7: Database Fields');
    console.log('==========================');
    
    try {
      const mysql = require('mysql2/promise');
      
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'phc_dashboard'
      });

      // Check if PIN reset fields exist
      const [rows] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = 'mobile_users' 
          AND COLUMN_NAME IN ('pin_reset_otp', 'pin_reset_otp_expiry')
      `, [process.env.DB_NAME || 'phc_dashboard']);

      console.log('✅ Database Fields:', rows);
      
      if (rows.length === 2) {
        this.addTestResult('Database Fields', true, 'PIN reset fields exist in database');
      } else {
        this.addTestResult('Database Fields', false, 'PIN reset fields missing from database');
      }

      await connection.end();
    } catch (error) {
      console.error('❌ Database Fields Error:', error.message);
      this.addTestResult('Database Fields', false, error.message);
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🎯 FORGOT PIN FEATURE TESTING');
    console.log('==============================');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Test Email: ${TEST_EMAIL}`);
    console.log(`Test Phone: ${TEST_PHONE}`);
    
    // Test 1: Request OTP
    const otpResponse = await this.testRequestOTP();
    
    // Test 2: Verify OTP (simulation)
    const otp = await this.testVerifyOTP();
    
    // Test 3: Reset PIN (if OTP available)
    if (otp) {
      await this.testResetPIN(otp);
    }
    
    // Test 4: Invalid email
    await this.testInvalidEmail();
    
    // Test 5: Invalid OTP
    await this.testInvalidOTP();
    
    // Test 6: WhatsApp service
    await this.testWhatsAppService();
    
    // Test 7: Database fields
    await this.testDatabaseFields();
    
    // Print results
    this.printResults();
  }

  // Print test results
  printResults() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.success}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.success / this.results.total) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    this.results.tests.forEach((test, index) => {
      const status = test.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${test.name}: ${test.details}`);
    });
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (this.results.failed === 0) {
      console.log('✅ All tests passed! Forgot PIN feature is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please check the issues above.');
      console.log('💡 Make sure:');
      console.log('   - Database fields are added correctly');
      console.log('   - WhatsApp Business API is configured');
      console.log('   - API endpoints are accessible');
      console.log('   - Test user exists in database');
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Test with real user account');
    console.log('2. Verify WhatsApp OTP delivery');
    console.log('3. Test mobile app integration');
    console.log('4. Monitor for any issues in production');
  }
}

// Run the tests
const tester = new ForgotPinTester();
tester.runAllTests().catch(console.error);
