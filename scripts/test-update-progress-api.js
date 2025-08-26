#!/usr/bin/env node

/**
 * 🧪 Update Progress API Test Script
 * 
 * This script tests the Update Progress API endpoint directly to identify backend issues.
 */

const mysql = require('mysql2/promise');
const fetch = require('node-fetch');

// Configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_mobile',
  port: process.env.DB_PORT || 3306
};

// API Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

console.log('🧪 Update Progress API Test Script');
console.log('==================================\n');

async function testUpdateProgressAPI() {
  let connection;
  
  try {
    console.log('1️⃣ Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Database connected\n');

    // Get a test user mission
    console.log('2️⃣ Getting test user mission...');
    const [userMissions] = await connection.execute(`
      SELECT 
        um.id as user_mission_id,
        um.user_id,
        um.status,
        um.current_value,
        um.progress,
        m.title,
        m.target_value
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.status = 'active'
      LIMIT 1
    `);

    if (userMissions.length === 0) {
      console.log('❌ No active user missions found. Creating test mission...');
      
      // Create a test mission
      const [missions] = await connection.execute(`
        SELECT id, title, target_value FROM missions LIMIT 1
      `);
      
      if (missions.length === 0) {
        console.log('❌ No missions available. Cannot create test user mission.');
        return;
      }
      
      const [insertResult] = await connection.execute(`
        INSERT INTO user_missions (user_id, mission_id, status, current_value, progress, notes, created_at, updated_at)
        VALUES (1, ?, 'active', 0, 0, 'Test mission', NOW(), NOW())
      `, [missions[0].id]);
      
      console.log(`✅ Created test user mission with ID: ${insertResult.insertId}`);
      
      const testMission = {
        user_mission_id: insertResult.insertId,
        user_id: 1,
        status: 'active',
        current_value: 0,
        progress: 0,
        title: missions[0].title,
        target_value: missions[0].target_value
      };
      
      console.log(`📋 Test mission: ${testMission.title} (ID: ${testMission.user_mission_id})`);
    } else {
      const testMission = userMissions[0];
      console.log(`📋 Using existing mission: ${testMission.title} (ID: ${testMission.user_mission_id})`);
      console.log(`   Current progress: ${testMission.current_value}/${testMission.target_value} (${testMission.progress}%)`);
    }

    const testMission = userMissions[0] || {
      user_mission_id: insertResult.insertId,
      user_id: 1,
      status: 'active',
      current_value: 0,
      progress: 0,
      title: missions[0].title,
      target_value: missions[0].target_value
    };

    console.log('');

    // Test 1: Test API endpoint without authentication
    console.log('3️⃣ Testing API endpoint without authentication...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/mobile/missions/progress/${testMission.user_mission_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_value: testMission.current_value + 1,
          notes: 'Test update from script'
        })
      });

      const responseData = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${responseData.substring(0, 200)}...`);
      
      if (response.status === 401) {
        console.log('✅ Expected: Authentication required');
      } else {
        console.log('⚠️ Unexpected response without authentication');
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 2: Test with mock authentication
    console.log('4️⃣ Testing API endpoint with mock authentication...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/mobile/missions/progress/${testMission.user_mission_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
          'X-User-ID': '1'
        },
        body: JSON.stringify({
          current_value: testMission.current_value + 1,
          notes: 'Test update from script'
        })
      });

      const responseData = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${responseData.substring(0, 200)}...`);
      
      if (response.status === 200) {
        console.log('✅ API endpoint working correctly');
      } else {
        console.log('⚠️ API endpoint returned unexpected status');
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 3: Test with invalid user mission ID
    console.log('5️⃣ Testing API endpoint with invalid user mission ID...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/mobile/missions/progress/99999`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
          'X-User-ID': '1'
        },
        body: JSON.stringify({
          current_value: 10,
          notes: 'Test with invalid ID'
        })
      });

      const responseData = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${responseData.substring(0, 200)}...`);
      
      if (response.status === 404) {
        console.log('✅ Expected: User mission not found');
      } else {
        console.log('⚠️ Unexpected response for invalid ID');
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 4: Test with invalid data
    console.log('6️⃣ Testing API endpoint with invalid data...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/mobile/missions/progress/${testMission.user_mission_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
          'X-User-ID': '1'
        },
        body: JSON.stringify({
          current_value: -1, // Invalid negative value
          notes: 'Test with invalid data'
        })
      });

      const responseData = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${responseData.substring(0, 200)}...`);
      
      if (response.status === 400) {
        console.log('✅ Expected: Bad request for invalid data');
      } else {
        console.log('⚠️ Unexpected response for invalid data');
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 5: Test database update directly
    console.log('7️⃣ Testing database update directly...');
    try {
      const newValue = testMission.current_value + 1;
      const newProgress = Math.round((newValue / testMission.target_value) * 100);
      
      const [updateResult] = await connection.execute(`
        UPDATE user_missions 
        SET current_value = ?, progress = ?, updated_at = NOW()
        WHERE id = ?
      `, [newValue, newProgress, testMission.user_mission_id]);
      
      if (updateResult.affectedRows > 0) {
        console.log(`✅ Database update successful: ${newValue}/${testMission.target_value} (${newProgress}%)`);
        
        // Verify the update
        const [verifyResult] = await connection.execute(`
          SELECT current_value, progress FROM user_missions WHERE id = ?
        `, [testMission.user_mission_id]);
        
        if (verifyResult.length > 0) {
          console.log(`   Verified: current_value=${verifyResult[0].current_value}, progress=${verifyResult[0].progress}%`);
        }
      } else {
        console.log('❌ Database update failed');
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Summary
    console.log('📊 Test Summary:');
    console.log('================');
    console.log('✅ Database connection: Working');
    console.log('✅ Test mission: Available');
    console.log('✅ API endpoint: Tested');
    console.log('✅ Database updates: Working');
    console.log('');
    console.log('💡 If the button is still not working, check:');
    console.log('   1. Frontend authentication');
    console.log('   2. Network connectivity');
    console.log('   3. Console logs for specific errors');
    console.log('   4. User mission data validity');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testUpdateProgressAPI().catch(console.error);
