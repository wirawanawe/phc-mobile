#!/usr/bin/env node

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pr1k1t1w',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

const testUserCycleLogic = async () => {
  console.log('🧪 Testing User Cycle Logic\n');
  console.log('=' .repeat(60));
  
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Test 1: Create a new user (should have 0 cycles)
    console.log('\n🧪 Test 1: Creating new user (should have 0 cycles)');
    
    const testUser1 = {
      name: 'Test User 1',
      email: 'testuser1@example.com',
      phone: '081234567890',
      password: 'password123',
      date_of_birth: '1990-01-01',
      gender: 'male'
    };
    
    // Insert test user
    const [insertResult1] = await connection.execute(`
      INSERT INTO mobile_users (
        name, email, phone, password, date_of_birth, gender,
        wellness_program_cycles, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 1, NOW(), NOW())
    `, [testUser1.name, testUser1.email, testUser1.phone, testUser1.password, testUser1.date_of_birth, testUser1.gender]);
    
    const userId1 = insertResult1.insertId;
    console.log(`✅ Created test user 1 with ID: ${userId1}`);
    
    // Check initial cycle count
    const [user1Initial] = await connection.execute(
      'SELECT wellness_program_cycles, wellness_program_joined FROM mobile_users WHERE id = ?',
      [userId1]
    );
    
    console.log(`📊 User 1 initial state:`);
    console.log(`   Cycles: ${user1Initial[0].wellness_program_cycles}`);
    console.log(`   Wellness Joined: ${user1Initial[0].wellness_program_joined ? 'YES' : 'NO'}`);
    
    // Test 2: Simulate first time wellness join (should set cycles to 1)
    console.log('\n🧪 Test 2: First time wellness join (should set cycles to 1)');
    
    await connection.execute(`
      UPDATE mobile_users 
      SET wellness_program_joined = TRUE,
          wellness_join_date = NOW(),
          wellness_program_duration = 30,
          wellness_program_end_date = DATE_ADD(NOW(), INTERVAL 30 DAY),
          wellness_program_cycles = 1,
          fitness_goal = 'weight_loss',
          activity_level = 'moderately_active'
      WHERE id = ?
    `, [userId1]);
    
    const [user1AfterJoin] = await connection.execute(
      'SELECT wellness_program_cycles, wellness_program_joined FROM mobile_users WHERE id = ?',
      [userId1]
    );
    
    console.log(`📊 User 1 after first join:`);
    console.log(`   Cycles: ${user1AfterJoin[0].wellness_program_cycles}`);
    console.log(`   Wellness Joined: ${user1AfterJoin[0].wellness_program_joined ? 'YES' : 'NO'}`);
    
    // Test 3: Simulate program completion and renewal (should increment cycles)
    console.log('\n🧪 Test 3: Program completion and renewal (should increment cycles)');
    
    // Mark program as completed
    await connection.execute(`
      UPDATE mobile_users 
      SET wellness_program_completed = TRUE,
          wellness_program_completion_date = NOW()
      WHERE id = ?
    `, [userId1]);
    
    // Simulate renewal (second join)
    await connection.execute(`
      UPDATE mobile_users 
      SET wellness_program_joined = TRUE,
          wellness_join_date = NOW(),
          wellness_program_duration = 30,
          wellness_program_end_date = DATE_ADD(NOW(), INTERVAL 30 DAY),
          wellness_program_cycles = wellness_program_cycles + 1,
          wellness_program_completed = FALSE,
          wellness_program_completion_date = NULL,
          fitness_goal = 'muscle_gain',
          activity_level = 'very_active'
      WHERE id = ?
    `, [userId1]);
    
    const [user1AfterRenewal] = await connection.execute(
      'SELECT wellness_program_cycles, wellness_program_joined FROM mobile_users WHERE id = ?',
      [userId1]
    );
    
    console.log(`📊 User 1 after renewal:`);
    console.log(`   Cycles: ${user1AfterRenewal[0].wellness_program_cycles}`);
    console.log(`   Wellness Joined: ${user1AfterRenewal[0].wellness_program_joined ? 'YES' : 'NO'}`);
    
    // Test 4: Create another user and test different scenarios
    console.log('\n🧪 Test 4: Creating another user for different scenarios');
    
    const testUser2 = {
      name: 'Test User 2',
      email: 'testuser2@example.com',
      phone: '081234567891',
      password: 'password123',
      date_of_birth: '1995-01-01',
      gender: 'female'
    };
    
    const [insertResult2] = await connection.execute(`
      INSERT INTO mobile_users (
        name, email, phone, password, date_of_birth, gender,
        wellness_program_cycles, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 1, NOW(), NOW())
    `, [testUser2.name, testUser2.email, testUser2.phone, testUser2.password, testUser2.date_of_birth, testUser2.gender]);
    
    const userId2 = insertResult2.insertId;
    console.log(`✅ Created test user 2 with ID: ${userId2}`);
    
    // Test 5: Multiple renewals
    console.log('\n🧪 Test 5: Multiple renewals');
    
    for (let i = 1; i <= 3; i++) {
      await connection.execute(`
        UPDATE mobile_users 
        SET wellness_program_joined = TRUE,
            wellness_join_date = NOW(),
            wellness_program_duration = 30,
            wellness_program_end_date = DATE_ADD(NOW(), INTERVAL 30 DAY),
            wellness_program_cycles = ?,
            wellness_program_completed = FALSE,
            wellness_program_completion_date = NULL
        WHERE id = ?
      `, [i, userId2]);
      
      const [user2State] = await connection.execute(
        'SELECT wellness_program_cycles FROM mobile_users WHERE id = ?',
        [userId2]
      );
      
      console.log(`   Renewal ${i}: Cycles = ${user2State[0].wellness_program_cycles}`);
    }
    
    // Final summary
    console.log('\n📋 FINAL TEST RESULTS:');
    const [finalResults] = await connection.execute(`
      SELECT 
        id,
        name,
        wellness_program_cycles,
        wellness_program_joined,
        wellness_program_completed
      FROM mobile_users 
      WHERE id IN (?, ?)
      ORDER BY id
    `, [userId1, userId2]);
    
    for (const user of finalResults) {
      console.log(`\n👤 ${user.name} (ID: ${user.id}):`);
      console.log(`   Cycles: ${user.wellness_program_cycles}`);
      console.log(`   Joined: ${user.wellness_program_joined ? 'YES' : 'NO'}`);
      console.log(`   Completed: ${user.wellness_program_completed ? 'YES' : 'NO'}`);
      
      // Validate logic
      if (user.wellness_program_joined && user.wellness_program_cycles > 0) {
        console.log(`   ✅ CORRECT: User joined and has cycles`);
      } else if (!user.wellness_program_joined && user.wellness_program_cycles === 0) {
        console.log(`   ✅ CORRECT: User not joined and has 0 cycles`);
      } else {
        console.log(`   ⚠️  ISSUE: Logic inconsistency detected`);
      }
    }
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await connection.execute('DELETE FROM mobile_users WHERE id IN (?, ?)', [userId1, userId2]);
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
};

// Run the test script
testUserCycleLogic().then(() => {
  console.log('\n🎯 User cycle logic test completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
