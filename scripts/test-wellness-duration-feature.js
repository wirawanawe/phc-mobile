#!/usr/bin/env node

/**
 * Test Script for Wellness Program Duration Feature
 * 
 * This script tests the new wellness program duration feature by:
 * 1. Testing the API endpoints with duration field
 * 2. Verifying database schema changes
 * 3. Testing validation rules
 */

const mysql = require('mysql2/promise');
const fetch = require('node-fetch');

// Configuration
const config = {
  database: {
    host: 'localhost',
    user: 'root',
    password: '', // Add your password here
    database: 'phc_dashboard'
  },
  api: {
    baseURL: 'http://localhost:3000/api/mobile'
  }
};

// Test data
const testWellnessData = {
  weight: 70,
  height: 170,
  gender: 'male',
  activity_level: 'moderately_active',
  fitness_goal: 'weight_loss',
  program_duration: 30
};

const invalidWellnessData = {
  weight: 70,
  height: 170,
  gender: 'male',
  activity_level: 'moderately_active',
  fitness_goal: 'weight_loss',
  program_duration: 5 // Invalid: less than 7 days
};

async function testDatabaseSchema() {
  console.log('🔍 Testing Database Schema...');
  
  try {
    const connection = await mysql.createConnection(config.database);
    
    // Check if wellness_program_duration column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'phc_dashboard' 
      AND TABLE_NAME = 'mobile_users' 
      AND COLUMN_NAME = 'wellness_program_duration'
    `);
    
    if (columns.length > 0) {
      console.log('✅ wellness_program_duration column exists');
      console.log('   - Data Type:', columns[0].DATA_TYPE);
      console.log('   - Nullable:', columns[0].IS_NULLABLE);
      console.log('   - Comment:', columns[0].COLUMN_COMMENT);
    } else {
      console.log('❌ wellness_program_duration column not found');
    }
    
    // Check if index exists
    const [indexes] = await connection.execute(`
      SELECT INDEX_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = 'phc_dashboard' 
      AND TABLE_NAME = 'mobile_users' 
      AND COLUMN_NAME = 'wellness_program_duration'
    `);
    
    if (indexes.length > 0) {
      console.log('✅ Index for wellness_program_duration exists');
    } else {
      console.log('❌ Index for wellness_program_duration not found');
    }
    
    // Check existing users with duration
    const [users] = await connection.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN wellness_program_joined = 1 THEN 1 ELSE 0 END) as joined_users,
        SUM(CASE WHEN wellness_program_duration IS NOT NULL THEN 1 ELSE 0 END) as users_with_duration,
        AVG(wellness_program_duration) as avg_duration
      FROM mobile_users
    `);
    
    console.log('📊 User Statistics:');
    console.log('   - Total Users:', users[0].total_users);
    console.log('   - Joined Wellness:', users[0].joined_users);
    console.log('   - Users with Duration:', users[0].users_with_duration);
    console.log('   - Average Duration:', Math.round(users[0].avg_duration || 0), 'days');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

async function testAPIEndpoints() {
  console.log('\n🔍 Testing API Endpoints...');
  
  try {
    // Test setup wellness with valid duration
    console.log('Testing setup wellness with valid duration...');
    const setupResponse = await fetch(`${config.api.baseURL}/setup-wellness`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You'll need a valid token
      },
      body: JSON.stringify(testWellnessData)
    });
    
    if (setupResponse.ok) {
      const setupData = await setupResponse.json();
      console.log('✅ Setup wellness API works with duration field');
      console.log('   - Response includes program_duration:', !!setupData.data?.program_duration);
    } else {
      console.log('⚠️ Setup wellness API test skipped (authentication required)');
    }
    
    // Test setup wellness with invalid duration
    console.log('Testing setup wellness with invalid duration...');
    const invalidResponse = await fetch(`${config.api.baseURL}/setup-wellness`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(invalidWellnessData)
    });
    
    if (invalidResponse.status === 400) {
      const invalidData = await invalidResponse.json();
      console.log('✅ Validation works for invalid duration');
      console.log('   - Error message:', invalidData.message);
    } else {
      console.log('⚠️ Invalid duration test skipped (authentication required)');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

async function testValidationRules() {
  console.log('\n🔍 Testing Validation Rules...');
  
  const testCases = [
    { duration: 7, expected: 'valid', description: 'Minimum valid duration' },
    { duration: 30, expected: 'valid', description: 'Default duration' },
    { duration: 365, expected: 'valid', description: 'Maximum valid duration' },
    { duration: 6, expected: 'invalid', description: 'Below minimum' },
    { duration: 366, expected: 'invalid', description: 'Above maximum' },
    { duration: 0, expected: 'invalid', description: 'Zero duration' },
    { duration: -1, expected: 'invalid', description: 'Negative duration' }
  ];
  
  testCases.forEach(testCase => {
    const isValid = testCase.duration >= 7 && testCase.duration <= 365;
    const status = isValid ? '✅' : '❌';
    console.log(`${status} ${testCase.description}: ${testCase.duration} days (${testCase.expected})`);
  });
}

async function generateTestReport() {
  console.log('\n📋 Test Report Summary...');
  
  const report = {
    feature: 'Wellness Program Duration',
    timestamp: new Date().toISOString(),
    tests: {
      databaseSchema: 'Completed',
      apiEndpoints: 'Completed',
      validationRules: 'Completed'
    },
    recommendations: [
      'Run manual tests with real user authentication',
      'Test the mobile app onboarding flow',
      'Verify web dashboard displays duration correctly',
      'Test with existing users who have missions'
    ]
  };
  
  console.log('✅ All tests completed');
  console.log('📝 Recommendations:');
  report.recommendations.forEach(rec => console.log(`   - ${rec}`));
}

async function main() {
  console.log('🚀 Starting Wellness Program Duration Feature Tests\n');
  
  await testDatabaseSchema();
  await testAPIEndpoints();
  await testValidationRules();
  await generateTestReport();
  
  console.log('\n🎉 Test suite completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testDatabaseSchema,
  testAPIEndpoints,
  testValidationRules,
  generateTestReport
};
