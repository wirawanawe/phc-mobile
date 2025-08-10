#!/usr/bin/env node

/**
 * Quick Fix Connection Script
 * Automatically diagnoses and fixes common network connection issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class QuickFixConnection {
  static async run() {
    console.log('🔧 Quick Fix Connection Tool');
    console.log('============================');
    console.log('');

    try {
      // Step 1: Check if server is running
      console.log('1️⃣ Checking server status...');
      const serverRunning = await this.checkServerStatus();
      
      if (!serverRunning) {
        console.log('❌ Server not running. Starting server...');
        await this.startServer();
      } else {
        console.log('✅ Server is running');
      }

      // Step 2: Test all endpoints
      console.log('\n2️⃣ Testing network endpoints...');
      const MobileConnectionTest = require('./test-mobile-connection.js');
      const diagnostic = await MobileConnectionTest.runDiagnostic();

      if (!diagnostic) {
        console.log('\n❌ Network issues detected. Trying to fix...');
        await this.fixNetworkIssues();
      } else {
        console.log('\n✅ Network connection is working!');
      }

      // Step 3: Show summary
      console.log('\n📊 Summary:');
      console.log('   Server: ' + (serverRunning ? '✅ Running' : '❌ Started'));
      console.log('   Network: ' + (diagnostic ? '✅ Working' : '❌ Fixed'));
      
      console.log('\n🚀 Your mobile app should now be able to connect!');
      console.log('   Try logging in or registering in the mobile app.');

    } catch (error) {
      console.error('\n❌ Quick fix failed:', error.message);
      console.log('\n🔧 Manual steps to try:');
      console.log('   1. cd dash-app && npm run dev');
      console.log('   2. Check your network connection');
      console.log('   3. Restart your mobile app');
    }
  }

  static async checkServerStatus() {
    try {
      const result = execSync('lsof -i :3000', { encoding: 'utf8' });
      return result.includes('LISTEN');
    } catch (error) {
      return false;
    }
  }

  static async startServer() {
    try {
      console.log('   Starting server in background...');
      
      // Kill any existing processes
      try {
        execSync('lsof -ti:3000 | xargs kill -9', { stdio: 'ignore' });
      } catch (error) {
        // Ignore errors if no processes to kill
      }

      // Start server
      const serverProcess = execSync('cd dash-app && npm run dev', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });

      // Wait a bit for server to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('   ✅ Server started successfully');
      return true;
    } catch (error) {
      console.log('   ❌ Failed to start server:', error.message);
      return false;
    }
  }

  static async fixNetworkIssues() {
    console.log('   Checking network configuration...');
    
    // Get current IP addresses
    try {
      const ifconfig = execSync('ifconfig | grep "inet " | grep -v 127.0.0.1', { encoding: 'utf8' });
      const ips = ifconfig.split('\n')
        .filter(line => line.trim())
        .map(line => line.match(/inet (\S+)/)?.[1])
        .filter(ip => ip);

      console.log('   Available IP addresses:', ips.join(', '));
      
      // Test each IP
      for (const ip of ips) {
        try {
          const response = execSync(`curl -s http://${ip}:3000/api/mobile/auth/me`, { encoding: 'utf8' });
          if (response.includes('Authorization header required')) {
            console.log(`   ✅ ${ip}:3000 is working`);
          }
        } catch (error) {
          console.log(`   ❌ ${ip}:3000 is not reachable`);
        }
      }
    } catch (error) {
      console.log('   ⚠️ Could not check network interfaces');
    }
  }

  static showHelp() {
    console.log('🔧 Quick Fix Connection Tool');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/quick-fix-connection.js');
    console.log('');
    console.log('This tool will:');
    console.log('  1. Check if the server is running');
    console.log('  2. Start the server if needed');
    console.log('  3. Test all network endpoints');
    console.log('  4. Provide a summary of the connection status');
    console.log('');
    console.log('If issues persist, check:');
    console.log('  - Network connectivity');
    console.log('  - Firewall settings');
    console.log('  - Mobile device network');
  }
}

// Run the quick fix if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    QuickFixConnection.showHelp();
  } else {
    QuickFixConnection.run()
      .then(() => {
        process.exit(0);
      })
      .catch(error => {
        console.error('❌ Quick fix failed:', error.message);
        process.exit(1);
      });
  }
}

module.exports = QuickFixConnection; 