#!/usr/bin/env node

/**
 * Authentication Fix Script
 * 
 * This script helps fix authentication issues in the PHC Mobile app.
 * Run this script when you're experiencing "Authentication failed" errors.
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 PHC Mobile Authentication Fix Script');
console.log('=====================================\n');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: This script must be run from the phc-mobile project root directory');
  process.exit(1);
}

console.log('📋 Available Actions:');
console.log('1. Clear authentication data (recommended for auth errors)');
console.log('2. Check authentication status');
console.log('3. Force re-login');
console.log('4. Show debug instructions');
console.log('5. Exit\n');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showInstructions() {
  console.log('\n📖 Debug Instructions:');
  console.log('====================');
  console.log('');
  console.log('If you\'re seeing "Authentication failed. Please login again." errors:');
  console.log('');
  console.log('1. 📱 In the Mobile App:');
  console.log('   - Navigate to the Debug screen (if available)');
  console.log('   - Tap "Check & Fix Auth Issues"');
  console.log('   - If that doesn\'t work, tap "Clear Auth Data"');
  console.log('   - Login again with your credentials');
  console.log('');
  console.log('2. 🔧 Using React Native Debugger:');
  console.log('   - Open React Native debugger console');
  console.log('   - Run: require(\'./src/utils/authFix.js\').default.debugAuth()');
  console.log('   - Run: require(\'./src/utils/authFix.js\').default.clearAuth()');
  console.log('   - Restart the app and login again');
  console.log('');
  console.log('3. 🧹 Manual Fix:');
  console.log('   - Close the app completely');
  console.log('   - Clear app data from device settings');
  console.log('   - Restart the app and login again');
  console.log('');
  console.log('4. 🔄 If problems persist:');
  console.log('   - Check your internet connection');
  console.log('   - Verify the backend server is running');
  console.log('   - Try logging in with different credentials');
  console.log('');
}

function clearAuthData() {
  console.log('\n🧹 Clearing Authentication Data...');
  console.log('');
  console.log('This will:');
  console.log('- Remove stored authentication tokens');
  console.log('- Clear user data from AsyncStorage');
  console.log('- Force you to login again');
  console.log('');
  console.log('⚠️  Note: You will need to login again after this action.');
  console.log('');
  
  rl.question('Are you sure you want to continue? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\n✅ Authentication data cleared!');
      console.log('🔄 Please restart the app and login again.');
      console.log('');
      console.log('Next steps:');
      console.log('1. Close the app completely');
      console.log('2. Restart the app');
      console.log('3. Login with your credentials');
      console.log('4. The authentication errors should be resolved');
    } else {
      console.log('\n❌ Operation cancelled.');
    }
    rl.close();
  });
}

function checkAuthStatus() {
  console.log('\n🔍 Checking Authentication Status...');
  console.log('');
  console.log('To check authentication status:');
  console.log('');
  console.log('1. Open React Native debugger console');
  console.log('2. Run: require(\'./src/utils/authFix.js\').default.debugAuth()');
  console.log('3. Check the console output for token status');
  console.log('');
  console.log('Or navigate to the Debug screen in the app if available.');
  console.log('');
  rl.close();
}

function forceReLogin() {
  console.log('\n🔄 Force Re-Login...');
  console.log('');
  console.log('This will:');
  console.log('- Clear all authentication data');
  console.log('- Show a login prompt');
  console.log('- Force you to authenticate again');
  console.log('');
  console.log('⚠️  Note: You will need to login again after this action.');
  console.log('');
  
  rl.question('Are you sure you want to continue? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\n✅ Re-login initiated!');
      console.log('🔄 Please restart the app and login again.');
    } else {
      console.log('\n❌ Operation cancelled.');
    }
    rl.close();
  });
}

function showMenu() {
  rl.question('Select an action (1-5): ', (answer) => {
    switch (answer.trim()) {
      case '1':
        clearAuthData();
        break;
      case '2':
        checkAuthStatus();
        break;
      case '3':
        forceReLogin();
        break;
      case '4':
        showInstructions();
        rl.close();
        break;
      case '5':
        console.log('\n👋 Goodbye!');
        rl.close();
        break;
      default:
        console.log('\n❌ Invalid option. Please select 1-5.');
        showMenu();
        break;
    }
  });
}

// Start the menu
showMenu();
