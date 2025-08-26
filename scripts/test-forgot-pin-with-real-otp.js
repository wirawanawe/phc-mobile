#!/usr/bin/env node

/**
 * Script untuk Test Forgot PIN dengan OTP yang Benar
 * 
 * Script ini akan:
 * - Request OTP dan dapatkan OTP yang benar
 * - Test reset PIN dengan OTP yang valid
 * - Memberikan laporan lengkap tentang testing
 */

const axios = require('axios');
require('dotenv').config({ path: '../dash-app/.env.local' });

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const TEST_EMAIL = 'test@example.com';

class ForgotPinRealTester {
  constructor() {
    this.results = {
      tests: [],
      success: 0,
      failed: 0,
      total: 0
    };
    this.otp = null;
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

  // Test 1: Request OTP and get real OTP
  async testRequestOTP() {
    console.log('\n🧪 Test 1: Request OTP (Get Real OTP)');
    console.log('=======================================');
    
    try {
      const response = await axios.post(`${BASE_URL}/mobile/pin/forgot-pin`, {
        email: TEST_EMAIL
      });

      console.log('✅ Request OTP Response:', response.data);
      
      if (response.data.success) {
        this.otp = response.data.data.otp;
        console.log(`📱 Real OTP received: ${this.otp}`);
        this.addTestResult('Request OTP', true, `OTP: ${this.otp}`);
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

  // Test 2: Reset PIN with real OTP
  async testResetPIN() {
    console.log('\n🧪 Test 2: Reset PIN with Real OTP');
    console.log('=====================================');
    
    if (!this.otp) {
      console.log('❌ No OTP available, skipping test');
      this.addTestResult('Reset PIN', false, 'No OTP available');
      return false;
    }

    try {
      const newPin = '654321';
      
      const response = await axios.put(`${BASE_URL}/mobile/pin/forgot-pin`, {
        email: TEST_EMAIL,
        otp: this.otp,
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

  // Test 3: Verify new PIN works
  async testVerifyNewPIN() {
    console.log('\n🧪 Test 3: Verify New PIN Works');
    console.log('===============================');
    
    try {
      // Test PIN validation endpoint
      const response = await axios.post(`${BASE_URL}/mobile/pin/validate`, {
        user_id: TEST_EMAIL,
        pin_code: '654321'
      });

      console.log('✅ Verify New PIN Response:', response.data);
      
      if (response.data.success) {
        this.addTestResult('Verify New PIN', true, 'New PIN works correctly');
        return true;
      } else {
        this.addTestResult('Verify New PIN', false, response.data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Verify New PIN Error:', error.response?.data || error.message);
      this.addTestResult('Verify New PIN', false, error.response?.data?.message || error.message);
      return false;
    }
  }

  // Test 4: Reset PIN back to original
  async testResetToOriginalPIN() {
    console.log('\n🧪 Test 4: Reset PIN Back to Original');
    console.log('=======================================');
    
    // Request new OTP
    try {
      const otpResponse = await axios.post(`${BASE_URL}/mobile/pin/forgot-pin`, {
        email: TEST_EMAIL
      });

      if (otpResponse.data.success) {
        const newOtp = otpResponse.data.data.otp;
        console.log(`📱 New OTP for reset: ${newOtp}`);
        
        // Reset to original PIN
        const resetResponse = await axios.put(`${BASE_URL}/mobile/pin/forgot-pin`, {
          email: TEST_EMAIL,
          otp: newOtp,
          newPin: '123456'
        });

        console.log('✅ Reset to Original PIN Response:', resetResponse.data);
        
        if (resetResponse.data.success) {
          this.addTestResult('Reset to Original PIN', true, 'PIN reset back to original');
          return true;
        } else {
          this.addTestResult('Reset to Original PIN', false, resetResponse.data.message);
          return false;
        }
      } else {
        this.addTestResult('Reset to Original PIN', false, 'Failed to get new OTP');
        return false;
      }
    } catch (error) {
      console.error('❌ Reset to Original PIN Error:', error.response?.data || error.message);
      this.addTestResult('Reset to Original PIN', false, error.response?.data?.message || error.message);
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🎯 FORGOT PIN FEATURE TESTING (WITH REAL OTP)');
    console.log('==============================================');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Test Email: ${TEST_EMAIL}`);
    
    // Test 1: Request OTP
    await this.testRequestOTP();
    
    // Test 2: Reset PIN with real OTP
    await this.testResetPIN();
    
    // Test 3: Verify new PIN works
    await this.testVerifyNewPIN();
    
    // Test 4: Reset PIN back to original
    await this.testResetToOriginalPIN();
    
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
      console.log('✅ All tests passed! Forgot PIN feature is working perfectly.');
      console.log('🚀 Ready for production use!');
    } else {
      console.log('⚠️  Some tests failed. Please check the issues above.');
      console.log('💡 Make sure:');
      console.log('   - API endpoints are accessible');
      console.log('   - Database is working correctly');
      console.log('   - Test user exists and is active');
    }
    
    console.log('\n📱 MOBILE APP TESTING:');
    console.log('1. Open mobile app');
    console.log('2. Go to PIN screen');
    console.log('3. Click "Lupa PIN? Reset via WhatsApp"');
    console.log('4. Enter email: test@example.com');
    console.log('5. Check console for OTP');
    console.log('6. Enter OTP and set new PIN');
    console.log('7. Verify PIN reset works');
    
    console.log('\n🔧 PRODUCTION SETUP:');
    console.log('1. Configure WhatsApp Business API');
    console.log('2. Set environment variables:');
    console.log('   - WHATSAPP_PHONE_NUMBER_ID');
    console.log('   - WHATSAPP_ACCESS_TOKEN');
    console.log('3. Test with real user accounts');
    console.log('4. Monitor for any issues');
  }
}

// Run the tests
const tester = new ForgotPinRealTester();
tester.runAllTests().catch(console.error);
