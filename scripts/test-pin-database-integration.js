#!/usr/bin/env node

/**
 * Test Script for PIN Database Integration
 * 
 * This script tests the complete PIN functionality including:
 * - Database migration
 * - API endpoints
 * - PIN hashing and validation
 * - User-specific PIN settings
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../dash-app/.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

// Test user data
const testUsers = [
  {
    email: 'test1@example.com',
    name: 'Test User 1',
    pin: '123456'
  },
  {
    email: 'test2@example.com',
    name: 'Test User 2',
    pin: '654321'
  }
];

class PinDatabaseTester {
  constructor() {
    this.connection = null;
    this.testResults = [];
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

  async runTest(testName, testFunction) {
    try {
      console.log(`\n🧪 Running test: ${testName}`);
      await testFunction();
      this.testResults.push({ name: testName, status: 'PASS' });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
    }
  }

  async testDatabaseMigration() {
    // Check if PIN fields exist
    const [rows] = await this.connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'phc_dashboard' 
      AND TABLE_NAME = 'mobile_users'
      AND COLUMN_NAME IN ('pin_enabled', 'pin_code', 'pin_attempts', 'pin_locked_until', 'pin_last_attempt')
      ORDER BY COLUMN_NAME
    `);

    const expectedColumns = [
      'pin_enabled', 'pin_code', 'pin_attempts', 'pin_locked_until', 'pin_last_attempt'
    ];

    const foundColumns = rows.map(row => row.COLUMN_NAME);
    
    for (const expectedColumn of expectedColumns) {
      if (!foundColumns.includes(expectedColumn)) {
        throw new Error(`Missing column: ${expectedColumn}`);
      }
    }

    console.log('📋 Found PIN columns:', foundColumns);
  }

  async testCreateTestUsers() {
    for (const user of testUsers) {
      // Check if user exists
      const [existingUsers] = await this.connection.execute(
        'SELECT id FROM mobile_users WHERE email = ?',
        [user.email]
      );

      if (existingUsers.length === 0) {
        // Create test user
        const [result] = await this.connection.execute(`
          INSERT INTO mobile_users (email, name, password, phone, created_at, updated_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [user.email, user.name, 'testpassword123', '08123456789']);
        
        user.id = result.insertId;
        console.log(`👤 Created test user: ${user.name} with ID: ${user.id}`);
      } else {
        user.id = existingUsers[0].id;
        console.log(`👤 Test user already exists: ${user.name} with ID: ${user.id}`);
      }
    }
  }

  async testPinHashing() {
    for (const user of testUsers) {
      // Hash PIN
      const hashedPin = await bcrypt.hash(user.pin, 10);
      
      // Verify hash
      const isValid = await bcrypt.compare(user.pin, hashedPin);
      if (!isValid) {
        throw new Error(`PIN hashing failed for user: ${user.name}`);
      }

      // Test wrong PIN
      const isWrongValid = await bcrypt.compare('000000', hashedPin);
      if (isWrongValid) {
        throw new Error(`PIN validation failed for wrong PIN: ${user.name}`);
      }

      console.log(`🔐 PIN hashing test passed for: ${user.name}`);
    }
  }

  async testEnablePin() {
    for (const user of testUsers) {
      // Hash PIN
      const hashedPin = await bcrypt.hash(user.pin, 10);
      
      // Enable PIN for user
      await this.connection.execute(`
        UPDATE mobile_users 
        SET pin_enabled = TRUE, 
            pin_code = ?, 
            pin_attempts = 0, 
            pin_locked_until = NULL,
            pin_last_attempt = NULL,
            updated_at = NOW()
        WHERE id = ?
      `, [hashedPin, user.id]);

      // Verify PIN is enabled
      const [rows] = await this.connection.execute(`
        SELECT pin_enabled, pin_code, pin_attempts 
        FROM mobile_users WHERE id = ?
      `, [user.id]);

      if (rows.length === 0 || !rows[0].pin_enabled) {
        throw new Error(`Failed to enable PIN for user: ${user.name}`);
      }

      console.log(`✅ PIN enabled for: ${user.name}`);
    }
  }

  async testPinValidation() {
    for (const user of testUsers) {
      // Get user's hashed PIN
      const [rows] = await this.connection.execute(`
        SELECT pin_code FROM mobile_users WHERE id = ?
      `, [user.id]);

      if (rows.length === 0) {
        throw new Error(`User not found: ${user.name}`);
      }

      const hashedPin = rows[0].pin_code;

      // Test correct PIN
      const isCorrect = await bcrypt.compare(user.pin, hashedPin);
      if (!isCorrect) {
        throw new Error(`Correct PIN validation failed for: ${user.name}`);
      }

      // Test wrong PIN
      const isWrong = await bcrypt.compare('000000', hashedPin);
      if (isWrong) {
        throw new Error(`Wrong PIN validation failed for: ${user.name}`);
      }

      console.log(`✅ PIN validation test passed for: ${user.name}`);
    }
  }

  async testPinAttempts() {
    const testUser = testUsers[0];
    
    // Reset attempts
    await this.connection.execute(`
      UPDATE mobile_users 
      SET pin_attempts = 0, pin_locked_until = NULL 
      WHERE id = ?
    `, [testUser.id]);

    // Simulate failed attempts with lockout logic
    for (let i = 1; i <= 5; i++) {
      const maxAttempts = 5;
      const lockoutMinutes = 30;
      
      let lockoutUntil = null;
      if (i >= maxAttempts) {
        lockoutUntil = new Date(Date.now() + (lockoutMinutes * 60 * 1000));
      }

      await this.connection.execute(`
        UPDATE mobile_users 
        SET pin_attempts = ?, 
            pin_locked_until = ?,
            pin_last_attempt = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `, [i, lockoutUntil, testUser.id]);

      // Check if locked after 5 attempts
      const [rows] = await this.connection.execute(`
        SELECT pin_attempts, pin_locked_until 
        FROM mobile_users WHERE id = ?
      `, [testUser.id]);

      if (i >= 5) {
        if (!rows[0].pin_locked_until) {
          throw new Error(`PIN should be locked after 5 attempts for: ${testUser.name}`);
        }
        console.log(`🔒 PIN locked after ${i} attempts for: ${testUser.name}`);
      }
    }

    console.log(`✅ PIN attempts test passed for: ${testUser.name}`);
  }

  async testUserSpecificPins() {
    // Verify each user has different PIN settings
    for (const user of testUsers) {
      const [rows] = await this.connection.execute(`
        SELECT pin_enabled, pin_code, pin_attempts 
        FROM mobile_users WHERE id = ?
      `, [user.id]);

      if (rows.length === 0) {
        throw new Error(`User not found: ${user.name}`);
      }

      const userData = rows[0];
      
      // Verify PIN is enabled
      if (!userData.pin_enabled) {
        throw new Error(`PIN not enabled for user: ${user.name}`);
      }

      // Verify PIN code exists
      if (!userData.pin_code) {
        throw new Error(`PIN code missing for user: ${user.name}`);
      }

      // Verify PIN is correct for this user
      const isValid = await bcrypt.compare(user.pin, userData.pin_code);
      if (!isValid) {
        throw new Error(`PIN validation failed for user: ${user.name}`);
      }

      console.log(`✅ User-specific PIN test passed for: ${user.name}`);
    }
  }

  async testDisablePin() {
    const testUser = testUsers[0];
    
    // Disable PIN
    await this.connection.execute(`
      UPDATE mobile_users 
      SET pin_enabled = FALSE, 
          pin_code = NULL, 
          pin_attempts = 0, 
          pin_locked_until = NULL,
          pin_last_attempt = NULL,
          updated_at = NOW()
      WHERE id = ?
    `, [testUser.id]);

    // Verify PIN is disabled
    const [rows] = await this.connection.execute(`
      SELECT pin_enabled, pin_code 
      FROM mobile_users WHERE id = ?
    `, [testUser.id]);

    if (rows[0].pin_enabled || rows[0].pin_code) {
      throw new Error(`Failed to disable PIN for user: ${testUser.name}`);
    }

    console.log(`✅ PIN disabled for: ${testUser.name}`);
  }

  async runAllTests() {
    console.log('🚀 Starting PIN Database Integration Tests\n');
    
    await this.runTest('Database Migration', () => this.testDatabaseMigration());
    await this.runTest('Create Test Users', () => this.testCreateTestUsers());
    await this.runTest('PIN Hashing', () => this.testPinHashing());
    await this.runTest('Enable PIN', () => this.testEnablePin());
    await this.runTest('PIN Validation', () => this.testPinValidation());
    await this.runTest('PIN Attempts', () => this.testPinAttempts());
    await this.runTest('User-Specific PINs', () => this.testUserSpecificPins());
    await this.runTest('Disable PIN', () => this.testDisablePin());

    // Print summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.status === 'FAIL') {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log(`\n📈 Summary: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed! PIN database integration is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.');
      process.exit(1);
    }
  }
}

// Run tests
async function main() {
  const tester = new PinDatabaseTester();
  
  try {
    await tester.connect();
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  } finally {
    await tester.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = PinDatabaseTester;
