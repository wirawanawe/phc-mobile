#!/usr/bin/env node

/**
 * Quick Fix Script for Wellness App Timeout Issues
 * This script helps resolve network timeout problems
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Wellness App Timeout Fix');
console.log('==========================\n');

// Function to execute command with error handling
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    const result = execSync(command, { encoding: 'utf8', cwd: process.cwd() });
    console.log(`✅ ${description} completed`);
    return result;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return null;
  }
}

// Check if backend server is running
console.log('🔍 Step 1: Checking backend server status...');
try {
  const healthCheck = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health', { encoding: 'utf8' });
  if (healthCheck.trim() === '200') {
    console.log('✅ Backend server is running');
  } else {
    console.log('⚠️  Backend server responded with status:', healthCheck.trim());
  }
} catch (error) {
  console.log('❌ Backend server is not reachable');
  console.log('🔧 Starting backend server...');
  
  // Try to start the backend server
  try {
    const dashAppPath = path.join(process.cwd(), 'dash-app');
    if (fs.existsSync(dashAppPath)) {
      console.log('📁 Found dash-app directory, starting server...');
      // Start server in background
      execSync('cd dash-app && npm run dev > ../backend.log 2>&1 &', { encoding: 'utf8' });
      console.log('🔄 Backend server starting... (check backend.log for details)');
      
      // Wait a bit for server to start
      console.log('⏳ Waiting 10 seconds for server to start...');
      execSync('sleep 10', { encoding: 'utf8' });
      
      // Test again
      try {
        const healthCheck2 = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health', { encoding: 'utf8' });
        if (healthCheck2.trim() === '200') {
          console.log('✅ Backend server started successfully');
        } else {
          console.log('⚠️  Backend server status after start:', healthCheck2.trim());
        }
      } catch (testError) {
        console.log('❌ Backend server still not reachable after start attempt');
      }
    } else {
      console.log('❌ dash-app directory not found');
    }
  } catch (startError) {
    console.log('❌ Failed to start backend server:', startError.message);
  }
}

// Test wellness endpoints specifically
console.log('\n🔍 Step 2: Testing wellness endpoints...');
try {
  const wellnessTest = execSync('curl -s http://localhost:3000/api/mobile/wellness/activities/public | head -c 100', { encoding: 'utf8' });
  if (wellnessTest.includes('"success":true')) {
    console.log('✅ Wellness API endpoints are working');
  } else {
    console.log('⚠️  Wellness API response:', wellnessTest.substring(0, 100));
  }
} catch (error) {
  console.log('❌ Wellness API endpoints not reachable');
}

// Clear Metro cache to resolve potential bundling issues
console.log('\n🔍 Step 3: Clearing Metro cache...');
runCommand('npx react-native start --reset-cache --port 8081 > metro.log 2>&1 &', 'Clear Metro cache');

// Restart the app development server
console.log('\n🔍 Step 4: App development recommendations...');
console.log('📱 To fix the wellness app timeout issue:');
console.log('');
console.log('1. 🔄 Restart the React Native app completely:');
console.log('   - Close the app on your device/emulator');
console.log('   - Stop Metro bundler (Ctrl+C)');
console.log('   - Run: npx react-native start --reset-cache');
console.log('   - Rebuild the app: npx react-native run-android (or run-ios)');
console.log('');
console.log('2. 📡 If on physical device, check network:');
console.log('   - Ensure device and computer are on same WiFi');
console.log('   - Update IP address in src/services/api.js if needed');
console.log('   - Current IP in config: 192.168.18.30');
console.log('');
console.log('3. 🔧 Use the debug tools in the app:');
console.log('   - Open app → Profile → "Debug Wellness"');
console.log('   - Run diagnosis and apply fixes');
console.log('');
console.log('4. ⚡ Quick test:');
console.log('   - Try accessing wellness app again');
console.log('   - If still fails, the timeout handling should now allow offline access');

console.log('\n✨ Quick fix script completed!');
console.log('💡 The app should now handle timeouts more gracefully and allow offline wellness access.');
