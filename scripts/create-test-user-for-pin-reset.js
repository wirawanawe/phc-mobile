#!/usr/bin/env node

/**
 * Script untuk Membuat User Test untuk Forgot PIN
 * 
 * Script ini akan:
 * - Membuat user test dengan email dan nomor telepon
 * - Mengaktifkan PIN untuk user tersebut
 * - Memberikan laporan lengkap tentang user yang dibuat
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../dash-app/.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

class TestUserCreator {
  constructor() {
    this.connection = null;
    this.testUser = {
      name: 'Test User For PIN Reset',
      email: 'test@example.com',
      phone: '+6281234567890',
      password: 'test123456',
      pin: '123456'
    };
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(dbConfig);
      console.log('✅ Connected to database');
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ Disconnected from database');
    }
  }

  async checkUserExists() {
    try {
      const [rows] = await this.connection.execute(
        'SELECT id, name, email, phone, pin_enabled FROM mobile_users WHERE email = ?',
        [this.testUser.email]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('❌ Error checking user:', error.message);
      throw error;
    }
  }

  async createUser() {
    try {
      console.log('\n🔄 Creating test user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(this.testUser.password, 10);
      
      // Hash PIN
      const hashedPin = await bcrypt.hash(this.testUser.pin, 10);
      
      // Insert user
      const [result] = await this.connection.execute(`
        INSERT INTO mobile_users (
          name, email, phone, password, pin_enabled, pin_code,
          is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, TRUE, ?, TRUE, NOW(), NOW())
      `, [
        this.testUser.name,
        this.testUser.email,
        this.testUser.phone,
        hashedPassword,
        hashedPin
      ]);
      
      console.log(`✅ User created with ID: ${result.insertId}`);
      return result.insertId;
    } catch (error) {
      console.error('❌ Error creating user:', error.message);
      throw error;
    }
  }

  async updateExistingUser(userId) {
    try {
      console.log('\n🔄 Updating existing user...');
      
      // Hash PIN if not already hashed
      const hashedPin = await bcrypt.hash(this.testUser.pin, 10);
      
      // Update user
      await this.connection.execute(`
        UPDATE mobile_users 
        SET phone = ?, 
            pin_enabled = TRUE, 
            pin_code = ?,
            is_active = TRUE,
            updated_at = NOW()
        WHERE id = ?
      `, [this.testUser.phone, hashedPin, userId]);
      
      console.log(`✅ User updated with ID: ${userId}`);
    } catch (error) {
      console.error('❌ Error updating user:', error.message);
      throw error;
    }
  }

  async verifyUser(userId) {
    try {
      console.log('\n🔍 Verifying user...');
      
      const [rows] = await this.connection.execute(`
        SELECT id, name, email, phone, pin_enabled, is_active, created_at, updated_at
        FROM mobile_users WHERE id = ?
      `, [userId]);
      
      if (rows.length > 0) {
        const user = rows[0];
        console.log('✅ User verification successful:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   PIN Enabled: ${user.pin_enabled ? 'Yes' : 'No'}`);
        console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Updated: ${user.updated_at}`);
        return user;
      } else {
        console.log('❌ User not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error verifying user:', error.message);
      throw error;
    }
  }

  async run() {
    try {
      console.log('🎯 CREATING TEST USER FOR PIN RESET');
      console.log('====================================');
      console.log(`Name: ${this.testUser.name}`);
      console.log(`Email: ${this.testUser.email}`);
      console.log(`Phone: ${this.testUser.phone}`);
      console.log(`Password: ${this.testUser.password}`);
      console.log(`PIN: ${this.testUser.pin}`);
      
      // Connect to database
      await this.connect();
      
      // Check if user exists
      const existingUser = await this.checkUserExists();
      
      let userId;
      if (existingUser) {
        console.log('\n⚠️  User already exists, updating...');
        userId = existingUser.id;
        await this.updateExistingUser(userId);
      } else {
        console.log('\n🆕 Creating new user...');
        userId = await this.createUser();
      }
      
      // Verify user
      await this.verifyUser(userId);
      
      console.log('\n🎉 TEST USER SETUP COMPLETED');
      console.log('=============================');
      console.log('📋 Test Credentials:');
      console.log(`   Email: ${this.testUser.email}`);
      console.log(`   Password: ${this.testUser.password}`);
      console.log(`   PIN: ${this.testUser.pin}`);
      console.log(`   Phone: ${this.testUser.phone}`);
      
      console.log('\n🧪 Testing Instructions:');
      console.log('1. Run forgot PIN test script:');
      console.log('   node scripts/test-forgot-pin-feature.js');
      console.log('2. Test mobile app integration');
      console.log('3. Verify OTP simulation in console');
      
      console.log('\n⚠️  Important Notes:');
      console.log('- This is a test user for development only');
      console.log('- WhatsApp OTP will be simulated in console');
      console.log('- Use real user data for production testing');
      
    } catch (error) {
      console.error('\n❌ Error creating test user:', error.message);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run the script
const creator = new TestUserCreator();
creator.run().catch(console.error);
