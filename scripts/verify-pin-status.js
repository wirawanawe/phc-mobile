#!/usr/bin/env node

/**
 * Script untuk Memverifikasi Status PIN Semua Users
 * 
 * Script ini akan:
 * - Menampilkan status PIN untuk semua users
 * - Memberikan laporan detail tentang pengaturan PIN
 * - Memverifikasi bahwa PIN telah dinonaktifkan
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

class PinStatusVerifier {
  constructor() {
    this.connection = null;
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

  async getOverallStats() {
    try {
      const [rows] = await this.connection.execute(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN pin_enabled = TRUE THEN 1 ELSE 0 END) as users_with_pin_enabled,
          SUM(CASE WHEN pin_code IS NOT NULL THEN 1 ELSE 0 END) as users_with_pin_code,
          SUM(CASE WHEN pin_attempts > 0 THEN 1 ELSE 0 END) as users_with_attempts,
          SUM(CASE WHEN pin_locked_until IS NOT NULL THEN 1 ELSE 0 END) as users_with_lockouts
        FROM mobile_users
      `);

      console.log('\n📊 Overall PIN Statistics:');
      console.log('==========================');
      console.log(`Total Users: ${rows[0].total_users}`);
      console.log(`Users with PIN Enabled: ${rows[0].users_with_pin_enabled}`);
      console.log(`Users with PIN Code: ${rows[0].users_with_pin_code}`);
      console.log(`Users with Failed Attempts: ${rows[0].users_with_attempts}`);
      console.log(`Users with Lockouts: ${rows[0].users_with_lockouts}`);

      return rows[0];
    } catch (error) {
      console.error('❌ Error getting overall stats:', error.message);
      throw error;
    }
  }

  async getAllUsersPinStatus() {
    try {
      const [rows] = await this.connection.execute(`
        SELECT 
          id,
          name,
          email,
          pin_enabled,
          pin_code,
          pin_attempts,
          pin_locked_until,
          pin_last_attempt,
          created_at,
          updated_at
        FROM mobile_users 
        ORDER BY name
      `);

      console.log('\n👥 Detailed PIN Status for All Users:');
      console.log('=====================================');
      
      if (rows.length === 0) {
        console.log('No users found in database');
        return rows;
      }

      rows.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name} (${user.email})`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   PIN Enabled: ${user.pin_enabled ? '✅ Yes' : '❌ No'}`);
        console.log(`   PIN Code: ${user.pin_code ? '🔐 Set' : '❌ Not Set'}`);
        console.log(`   PIN Attempts: ${user.pin_attempts || 0}`);
        console.log(`   PIN Locked: ${user.pin_locked_until ? '🔒 Yes' : '✅ No'}`);
        console.log(`   Last PIN Attempt: ${user.pin_last_attempt || 'Never'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Updated: ${user.updated_at}`);
      });

      return rows;
    } catch (error) {
      console.error('❌ Error getting users PIN status:', error.message);
      throw error;
    }
  }

  async verifyPinDisabled() {
    try {
      console.log('\n🔍 Verifying PIN Disable Status:');
      console.log('===============================');
      
      const [rows] = await this.connection.execute(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN pin_enabled = TRUE THEN 1 ELSE 0 END) as users_with_pin_enabled,
          SUM(CASE WHEN pin_code IS NOT NULL THEN 1 ELSE 0 END) as users_with_pin_code,
          SUM(CASE WHEN pin_attempts > 0 THEN 1 ELSE 0 END) as users_with_attempts,
          SUM(CASE WHEN pin_locked_until IS NOT NULL THEN 1 ELSE 0 END) as users_with_lockouts
        FROM mobile_users
      `);

      const stats = rows[0];
      const allDisabled = stats.users_with_pin_enabled === 0 && stats.users_with_pin_code === 0;
      
      if (allDisabled) {
        console.log('✅ SUCCESS: All PINs have been disabled');
        console.log('✅ No users have PIN enabled');
        console.log('✅ No users have PIN codes stored');
        console.log('✅ All users can access the app without PIN authentication');
      } else {
        console.log('⚠️  WARNING: Some users still have PIN settings');
        console.log(`   Users with PIN enabled: ${stats.users_with_pin_enabled}`);
        console.log(`   Users with PIN code: ${stats.users_with_pin_code}`);
      }

      return allDisabled;
    } catch (error) {
      console.error('❌ Error verifying PIN disable status:', error.message);
      return false;
    }
  }

  async getUsersWithPinSettings() {
    try {
      const [rows] = await this.connection.execute(`
        SELECT id, name, email, pin_enabled, pin_code, pin_attempts, pin_locked_until
        FROM mobile_users 
        WHERE pin_enabled = TRUE OR pin_code IS NOT NULL
        ORDER BY name
      `);

      if (rows.length > 0) {
        console.log('\n⚠️  Users Still with PIN Settings:');
        console.log('==================================');
        rows.forEach(user => {
          console.log(`- ${user.name} (${user.email})`);
          console.log(`  PIN Enabled: ${user.pin_enabled ? 'Yes' : 'No'}`);
          console.log(`  PIN Code: ${user.pin_code ? 'Set' : 'Not Set'}`);
          console.log(`  Attempts: ${user.pin_attempts || 0}`);
          console.log(`  Locked: ${user.pin_locked_until ? 'Yes' : 'No'}`);
        });
      } else {
        console.log('\n✅ No users found with PIN settings');
      }

      return rows;
    } catch (error) {
      console.error('❌ Error getting users with PIN settings:', error.message);
      return [];
    }
  }

  async runVerification() {
    console.log('🔍 Starting PIN Status Verification\n');
    
    try {
      // Get overall statistics
      await this.getOverallStats();
      
      // Get detailed status for all users
      await this.getAllUsersPinStatus();
      
      // Verify PIN disable status
      const allDisabled = await this.verifyPinDisabled();
      
      // Show users with PIN settings (if any)
      await this.getUsersWithPinSettings();
      
      // Print final summary
      this.printSummary(allDisabled);
      
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      throw error;
    }
  }

  printSummary(allDisabled) {
    console.log('\n📋 Verification Summary:');
    console.log('========================');
    
    if (allDisabled) {
      console.log('🎉 SUCCESS: All PINs have been successfully disabled!');
      console.log('✅ All users can now access the app without PIN authentication');
      console.log('✅ No PIN-related security restrictions are active');
      console.log('✅ Database is clean of PIN settings');
    } else {
      console.log('⚠️  WARNING: Some PIN settings still exist');
      console.log('❌ Some users may still have PIN restrictions');
      console.log('🔧 Consider running the disable script again');
    }
    
    console.log('\n📝 Next Steps:');
    if (allDisabled) {
      console.log('- Users can now access the app without PIN');
      console.log('- PIN feature is completely disabled');
      console.log('- No further action required');
    } else {
      console.log('- Run disable script again to clear remaining PIN settings');
      console.log('- Check for any database constraints or triggers');
      console.log('- Verify application logic is not re-enabling PINs');
    }
  }
}

// Run the verification
async function main() {
  const verifier = new PinStatusVerifier();
  
  try {
    await verifier.connect();
    await verifier.runVerification();
  } catch (error) {
    console.error('❌ Verification script failed:', error.message);
    process.exit(1);
  } finally {
    await verifier.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = PinStatusVerifier;
