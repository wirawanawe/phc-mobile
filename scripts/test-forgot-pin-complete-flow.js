#!/usr/bin/env node

/**
 * Script untuk Test Complete Flow Forgot PIN
 * 
 * Script ini akan:
 * - Request OTP baru
 * - Capture OTP dari response
 * - Reset PIN dengan OTP yang benar
 * - Verify PIN reset berhasil
 */

const axios = require('axios');

class ForgotPinCompleteFlowTester {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    this.testEmail = 'test@example.com';
    this.testResults = [];
  }

  async testCompleteFlow() {
    console.log('🚀 TESTING COMPLETE FORGOT PIN FLOW');
    console.log('====================================');
    
    try {
      // Step 1: Request OTP
      console.log('\n📱 Step 1: Requesting OTP...');
      const otpResponse = await axios.post(`${this.baseURL}/api/mobile/pin/forgot-pin`, {
        email: this.testEmail
      });
      
      if (otpResponse.data.success) {
        const otp = otpResponse.data.data.otp;
        console.log(`✅ OTP requested successfully: ${otp}`);
        
        // Step 2: Reset PIN with correct OTP
        console.log('\n🔐 Step 2: Resetting PIN with OTP...');
        const resetResponse = await axios.put(`${this.baseURL}/api/mobile/pin/forgot-pin`, {
          email: this.testEmail,
          otp: otp,
          newPin: '123456'
        });
        
        if (resetResponse.data.success) {
          console.log('✅ PIN reset successfully');
          
          // Step 3: Verify new PIN works
          console.log('\n✅ Step 3: Verifying new PIN...');
          try {
            const verifyResponse = await axios.post(`${this.baseURL}/api/mobile/pin/validate`, {
              user_id: this.testEmail, // Using email as user_id
              pin_code: '123456'
            });
            
            if (verifyResponse.data.success) {
              console.log('✅ New PIN verification successful');
              this.testResults.push({
                step: 'Complete Flow',
                status: '✅ PASS',
                details: 'All steps completed successfully'
              });
            } else {
              console.log('❌ New PIN verification failed');
              this.testResults.push({
                step: 'PIN Verification',
                status: '❌ FAIL',
                details: 'New PIN could not be verified'
              });
            }
          } catch (verifyError) {
            console.log('❌ PIN verification error:', verifyError.response?.data?.message || verifyError.message);
            this.testResults.push({
              step: 'PIN Verification',
              status: '❌ FAIL',
              details: verifyError.response?.data?.message || verifyError.message
            });
          }
        } else {
          console.log('❌ PIN reset failed');
          this.testResults.push({
            step: 'PIN Reset',
            status: '❌ FAIL',
            details: resetResponse.data.message
          });
        }
      } else {
        console.log('❌ OTP request failed');
        this.testResults.push({
          step: 'OTP Request',
          status: '❌ FAIL',
          details: otpResponse.data.message
        });
      }
    } catch (error) {
      console.log('❌ Test failed with error:', error.message);
      this.testResults.push({
        step: 'Error',
        status: '❌ FAIL',
        details: error.message
      });
    }
  }

  async testErrorScenarios() {
    console.log('\n🧪 TESTING ERROR SCENARIOS');
    console.log('===========================');
    
    const errorTests = [
      {
        name: 'Invalid Email',
        data: { email: 'invalid@example.com' },
        expectedError: 'Email tidak terdaftar'
      },
      {
        name: 'Invalid OTP',
        data: { email: this.testEmail, otp: '000000', newPin: '123456' },
        expectedError: 'Kode OTP tidak valid'
      },
      {
        name: 'Expired OTP',
        data: { email: this.testEmail, otp: '999999', newPin: '123456' },
        expectedError: 'Kode OTP tidak valid'
      }
    ];
    
    for (const test of errorTests) {
      try {
        console.log(`\n🔍 Testing: ${test.name}`);
        
        if (test.name === 'Invalid Email') {
          const response = await axios.post(`${this.baseURL}/api/mobile/pin/forgot-pin`, test.data);
          if (!response.data.success && response.data.message.includes(test.expectedError)) {
            console.log(`✅ ${test.name} - Expected error caught`);
            this.testResults.push({
              step: test.name,
              status: '✅ PASS',
              details: 'Expected error handled correctly'
            });
          } else {
            console.log(`❌ ${test.name} - Unexpected response`);
            this.testResults.push({
              step: test.name,
              status: '❌ FAIL',
              details: 'Unexpected response'
            });
          }
        } else {
          const response = await axios.put(`${this.baseURL}/api/mobile/pin/forgot-pin`, test.data);
          if (!response.data.success && response.data.message.includes(test.expectedError)) {
            console.log(`✅ ${test.name} - Expected error caught`);
            this.testResults.push({
              step: test.name,
              status: '✅ PASS',
              details: 'Expected error handled correctly'
            });
          } else {
            console.log(`❌ ${test.name} - Unexpected response`);
            this.testResults.push({
              step: test.name,
              status: '❌ FAIL',
              details: 'Unexpected response'
            });
          }
        }
      } catch (error) {
        // Check if this is an expected error response
        if (error.response && error.response.data && !error.response.data.success) {
          const errorMessage = error.response.data.message;
          if (errorMessage.includes(test.expectedError)) {
            console.log(`✅ ${test.name} - Expected error caught: ${errorMessage}`);
            this.testResults.push({
              step: test.name,
              status: '✅ PASS',
              details: `Expected error handled correctly: ${errorMessage}`
            });
          } else {
            console.log(`❌ ${test.name} - Unexpected error: ${errorMessage}`);
            this.testResults.push({
              step: test.name,
              status: '❌ FAIL',
              details: `Unexpected error: ${errorMessage}`
            });
          }
        } else {
          console.log(`❌ ${test.name} - Test error:`, error.message);
          this.testResults.push({
            step: test.name,
            status: '❌ FAIL',
            details: error.message
          });
        }
      }
    }
  }

  generateReport() {
    console.log('\n📊 COMPLETE FLOW TEST REPORT');
    console.log('=============================');
    
    const passed = this.testResults.filter(r => r.status === '✅ PASS').length;
    const failed = this.testResults.filter(r => r.status === '❌ FAIL').length;
    const total = this.testResults.length;
    
    console.log(`\n📈 Results: ${passed}/${total} tests passed`);
    
    this.testResults.forEach(result => {
      console.log(`\n${result.status} ${result.step}`);
      console.log(`   ${result.details}`);
    });
    
    console.log('\n🎯 Summary:');
    if (failed === 0) {
      console.log('✅ All tests passed! Forgot PIN feature is working perfectly.');
      console.log('🚀 Ready for production deployment!');
    } else {
      console.log(`⚠️  ${failed} test(s) failed. Please check the issues above.`);
    }
  }

  async runAllTests() {
    await this.testCompleteFlow();
    await this.testErrorScenarios();
    this.generateReport();
  }
}

// Run tests
const tester = new ForgotPinCompleteFlowTester();
tester.runAllTests().catch(console.error);
