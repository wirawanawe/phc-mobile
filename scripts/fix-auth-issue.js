#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 PHC Mobile Authentication Fix Tool');
console.log('=====================================');
console.log('');

console.log('This tool helps fix "Authentication failed. Please login again." errors.');
console.log('');

console.log('📋 Available Options:');
console.log('1. Show authentication fix guide');
console.log('2. Clear authentication data (requires app restart)');
console.log('3. Test API connection');
console.log('4. Show debug instructions');
console.log('5. Exit');
console.log('');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showFixGuide() {
  console.log('\n🔧 Authentication Fix Guide:');
  console.log('============================');
  console.log('');
  console.log('If you\'re seeing "Authentication failed. Please login again." errors:');
  console.log('');
  console.log('1. 📱 In the Mobile App:');
  console.log('   - Navigate to Profile → Debug Tools');
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
  console.log('To clear authentication data:');
  console.log('');
  console.log('1. 📱 On your device:');
  console.log('   - Go to Settings → Apps → PHC Mobile');
  console.log('   - Tap "Storage" → "Clear Data"');
  console.log('   - Restart the app');
  console.log('');
  console.log('2. 🔧 Using React Native Debugger:');
  console.log('   - Run this command in the debugger console:');
  console.log('   require(\'./src/utils/authFix.js\').default.clearAuth()');
  console.log('');
  console.log('3. 🖥️ Using the Debug Screen:');
  console.log('   - Open the app');
  console.log('   - Go to Profile → Debug Tools');
  console.log('   - Tap "Clear Auth Data"');
  console.log('');
}

function testApiConnection() {
  console.log('\n🌐 Testing API Connection...');
  console.log('');
  console.log('To test API connection:');
  console.log('');
  console.log('1. 🔧 Using React Native Debugger:');
  console.log('   - Run this command in the debugger console:');
  console.log('   require(\'./src/services/api.js\').default.debugNetworkConnection()');
  console.log('');
  console.log('2. 🖥️ Using the Debug Screen:');
  console.log('   - Open the app');
  console.log('   - Go to Profile → Debug Tools');
  console.log('   - Tap "Test API Connection"');
  console.log('');
  console.log('3. 🌐 Manual Test:');
  console.log('   - Open your browser');
  console.log('   - Navigate to: http://localhost:3000/api/health');
  console.log('   - You should see a JSON response');
  console.log('');
}

function showDebugInstructions() {
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

function askQuestion() {
  rl.question('Enter your choice (1-5): ', (answer) => {
    switch(answer.trim()) {
      case '1':
        showFixGuide();
        break;
      case '2':
        clearAuthData();
        break;
      case '3':
        testApiConnection();
        break;
      case '4':
        showDebugInstructions();
        break;
      case '5':
        console.log('\n👋 Goodbye!');
        rl.close();
        return;
      default:
        console.log('\n❌ Invalid choice. Please enter a number between 1-5.');
    }
    
    console.log('\n' + '='.repeat(50));
    askQuestion();
  });
}

askQuestion();
