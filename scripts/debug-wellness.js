#!/usr/bin/env node

/**
 * Wellness App Debug Script
 * Run this script to diagnose wellness app access issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Wellness App Debug Script');
console.log('============================\n');

// Check if we're in the right directory
const currentDir = process.cwd();
const packageJsonPath = path.join(currentDir, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

console.log('✅ Running from project root:', currentDir);

// Check if required files exist
const requiredFiles = [
  'src/screens/WellnessApp.tsx',
  'src/screens/WellnessDebugScreen.tsx',
  'src/utils/wellnessDebugger.js',
  'src/contexts/AuthContext.tsx',
  'src/services/api.js'
];

console.log('\n🔍 Checking required files:');
let missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(currentDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n❌ Missing ${missingFiles.length} required files. Please ensure all wellness components are present.`);
}

// Check backend server status
console.log('\n🔍 Checking backend server:');
try {
  // Check if dash-app directory exists
  const dashAppPath = path.join(currentDir, 'dash-app');
  if (fs.existsSync(dashAppPath)) {
    console.log('✅ Backend directory (dash-app) found');
    
    // Check if wellness API routes exist
    const wellnessRoutes = [
      'dash-app/app/api/mobile/wellness/status/route.js',
      'dash-app/app/api/mobile/setup-wellness/route.js',
      'dash-app/app/api/mobile/wellness/route.js'
    ];
    
    wellnessRoutes.forEach(route => {
      const routePath = path.join(currentDir, route);
      if (fs.existsSync(routePath)) {
        console.log(`✅ ${route}`);
      } else {
        console.log(`❌ ${route} - MISSING`);
      }
    });
  } else {
    console.log('❌ Backend directory (dash-app) not found');
  }
} catch (error) {
  console.log('❌ Error checking backend:', error.message);
}

// Check network configuration
console.log('\n🔍 Checking network configuration:');
try {
  const apiServicePath = path.join(currentDir, 'src/services/api.js');
  const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');
  
  // Extract API URLs from the file
  const urlMatches = apiServiceContent.match(/http[s]?:\/\/[^\s"']+/g);
  if (urlMatches) {
    console.log('📡 Found API URLs in configuration:');
    urlMatches.forEach(url => {
      console.log(`   - ${url}`);
    });
  }
  
  // Check for localhost/IP configurations
  if (apiServiceContent.includes('localhost') || apiServiceContent.includes('10.0.2.2') || apiServiceContent.includes('192.168')) {
    console.log('⚠️  Development URLs detected - ensure your device can reach the development server');
  }
  
} catch (error) {
  console.log('❌ Error checking network config:', error.message);
}

// Check for common issues in logs
console.log('\n🔍 Common troubleshooting steps:');
console.log('1. ✅ Ensure you are logged in to the app');
console.log('2. ✅ Check your internet connection');
console.log('3. ✅ Verify the backend server is running (npm run dev in dash-app folder)');
console.log('4. ✅ Try clearing app cache and data');
console.log('5. ✅ Use the Debug Wellness option in Profile screen');

console.log('\n🔧 Quick fixes to try:');
console.log('1. Restart the app completely');
console.log('2. Log out and log back in');
console.log('3. Clear app storage and re-login');
console.log('4. Check if backend server is running on correct port');

console.log('\n📱 To debug on device:');
console.log('1. Open the app');
console.log('2. Go to Profile screen');
console.log('3. Tap "Debug Wellness" (if logged in)');
console.log('4. Run diagnosis and apply fixes');

console.log('\n✨ Debug script completed!');
