#!/usr/bin/env node

/**
 * Script untuk Menonaktifkan PIN untuk Semua Users
 * 
 * Script ini akan:
 * - Menonaktifkan PIN untuk semua users di database
 * - Reset semua PIN attempts dan lockouts
 * - Memberikan laporan lengkap tentang operasi yang dilakukan
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../dash-app/.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

class PinDisableManager {
  constructor() {
    this.connection = null;
    this.stats = {
      totalUsers: 0,
      usersWithPinEnabled: 0,
      usersWithPinCode: 0,
      usersWithAttempts: 0,
      usersWithLockouts: 0,
      disabledCount: 0,
      errors: []
    };
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

  async getCurrentStats() {
    try {
      // Get current PIN statistics
      const [rows] = await this.connection.execute(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN pin_enabled = TRUE THEN 1 ELSE 0 END) as users_with_pin_enabled,
          SUM(CASE WHEN pin_code IS NOT NULL THEN 1 ELSE 0 END) as users_with_pin_code,
          SUM(CASE WHEN pin_attempts > 0 THEN 1 ELSE 0 END) as users_with_attempts,
          SUM(CASE WHEN pin_locked_until IS NOT NULL THEN 1 ELSE 0 END) as users_with_lockouts
        FROM mobile_users
      `);

      this.stats.totalUsers = rows[0].total_users;
      this.stats.usersWithPinEnabled = rows[0].users_with_pin_enabled;
      this.stats.usersWithPinCode = rows[0].users_with_pin_code;
      this.stats.usersWithAttempts = rows[0].users_with_attempts;
      this.stats.usersWithLockouts = rows[0].users_with_lockouts;

      console.log('\n📊 Current PIN Statistics:');
      console.log('==========================');
      console.log(`Total Users: ${this.stats.totalUsers}`);
      console.log(`Users with PIN Enabled: ${this.stats.usersWithPinEnabled}`);
      console.log(`Users with PIN Code: ${this.stats.usersWithPinCode}`);
      console.log(`Users with Failed Attempts: ${this.stats.usersWithAttempts}`);
      console.log(`Users with Lockouts: ${this.stats.usersWithLockouts}`);

      return rows[0];
    } catch (error) {
      console.error('❌ Error getting current stats:', error.message);
      throw error;
    }
  }

  async disablePinForAllUsers() {
    try {
      console.log('\n🔄 Disabling PIN for all users...');
      
      // Disable PIN for all users
      const [result] = await this.connection.execute(`
        UPDATE mobile_users 
        SET pin_enabled = FALSE, 
            pin_code = NULL, 
            pin_attempts = 0, 
            pin_locked_until = NULL,
            pin_last_attempt = NULL,
            updated_at = NOW()
        WHERE pin_enabled = TRUE OR pin_code IS NOT NULL
      `);

      this.stats.disabledCount = result.affectedRows;
      
      console.log(`✅ Successfully disabled PIN for ${result.affectedRows} users`);
      
      return result;
    } catch (error) {
      console.error('❌ Error disabling PIN for all users:', error.message);
      this.stats.errors.push(error.message);
      throw error;
    }
  }

  async verifyDisableOperation() {
    try {
      console.log('\n🔍 Verifying disable operation...');
      
      // Check if any users still have PIN enabled
      const [rows] = await this.connection.execute(`
        SELECT 
          COUNT(*) as users_with_pin_enabled,
          SUM(CASE WHEN pin_code IS NOT NULL THEN 1 ELSE 0 END) as users_with_pin_code,
          SUM(CASE WHEN pin_attempts > 0 THEN 1 ELSE 0 END) as users_with_attempts,
          SUM(CASE WHEN pin_locked_until IS NOT NULL THEN 1 ELSE 0 END) as users_with_lockouts
        FROM mobile_users
        WHERE pin_enabled = TRUE OR pin_code IS NOT NULL
      `);

      const remainingUsers = rows[0].users_with_pin_enabled + rows[0].users_with_pin_code;
      
      if (remainingUsers === 0) {
        console.log('✅ Verification successful: All PINs have been disabled');
        return true;
      } else {
        console.log(`⚠️  Warning: ${remainingUsers} users still have PIN settings`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error verifying disable operation:', error.message);
      this.stats.errors.push(error.message);
      return false;
    }
  }

  async getUsersWithPinEnabled() {
    try {
      const [rows] = await this.connection.execute(`
        SELECT id, name, email, pin_enabled, pin_attempts, pin_locked_until
        FROM mobile_users 
        WHERE pin_enabled = TRUE OR pin_code IS NOT NULL
        ORDER BY name
      `);

      if (rows.length > 0) {
        console.log('\n👥 Users with PIN settings:');
        console.log('============================');
        rows.forEach(user => {
          console.log(`- ${user.name} (${user.email})`);
          console.log(`  PIN Enabled: ${user.pin_enabled ? 'Yes' : 'No'}`);
          console.log(`  Attempts: ${user.pin_attempts || 0}`);
          console.log(`  Locked: ${user.pin_locked_until ? 'Yes' : 'No'}`);
        });
      } else {
        console.log('\n✅ No users found with PIN settings');
      }

      return rows;
    } catch (error) {
      console.error('❌ Error getting users with PIN enabled:', error.message);
      this.stats.errors.push(error.message);
      return [];
    }
  }

  async runDisableOperation() {
    console.log('🚀 Starting PIN Disable Operation for All Users\n');
    
    try {
      // Get current statistics
      await this.getCurrentStats();
      
      // Show users with PIN enabled before operation
      await this.getUsersWithPinEnabled();
      
      // Confirm operation
      console.log('\n⚠️  WARNING: This operation will disable PIN for ALL users!');
      console.log('This action cannot be undone automatically.');
      console.log('\nPress Ctrl+C to cancel or any key to continue...');
      
      // Wait for user input (simplified for script execution)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Disable PIN for all users
      await this.disablePinForAllUsers();
      
      // Verify operation
      const verificationSuccess = await this.verifyDisableOperation();
      
      // Show final statistics
      await this.getCurrentStats();
      
      // Print summary
      this.printSummary(verificationSuccess);
      
    } catch (error) {
      console.error('❌ Operation failed:', error.message);
      this.printSummary(false);
      throw error;
    }
  }

  printSummary(success) {
    console.log('\n📋 Operation Summary:');
    console.log('====================');
    console.log(`Total Users: ${this.stats.totalUsers}`);
    console.log(`Users with PIN Disabled: ${this.stats.disabledCount}`);
    console.log(`Operation Status: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (success) {
      console.log('\n🎉 PIN disable operation completed successfully!');
      console.log('All users can now access the app without PIN authentication.');
    } else {
      console.log('\n⚠️  PIN disable operation completed with warnings.');
      console.log('Please check the errors above and verify the results.');
    }
  }
}

// Run the operation
async function main() {
  const manager = new PinDisableManager();
  
  try {
    await manager.connect();
    await manager.runDisableOperation();
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
    process.exit(1);
  } finally {
    await manager.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = PinDisableManager;
