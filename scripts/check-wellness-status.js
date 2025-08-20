#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Wellness Program Status...\n');

// Check if user is logged in by looking for auth data
const checkAuthStatus = () => {
  try {
    // Check if there's any auth data in the app
    console.log('📱 Checking authentication status...');
    
    // Look for AsyncStorage data or auth context
    const authFiles = [
      'src/contexts/AuthContext.tsx',
      'src/services/api.js'
    ];
    
    let hasAuth = false;
    authFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ Found auth file: ${file}`);
        hasAuth = true;
      }
    });
    
    return hasAuth;
  } catch (error) {
    console.log('❌ Error checking auth status:', error.message);
    return false;
  }
};

// Check wellness program logic
const checkWellnessLogic = () => {
  console.log('\n🧠 Checking wellness program logic...');
  
  try {
    const wellnessFile = 'src/screens/WellnessApp.tsx';
    if (fs.existsSync(wellnessFile)) {
      const content = fs.readFileSync(wellnessFile, 'utf8');
      
      // Check for wellness_program_joined logic
      if (content.includes('wellness_program_joined')) {
        console.log('✅ Found wellness_program_joined check');
      } else {
        console.log('❌ Missing wellness_program_joined check');
      }
      
      // Check for missions check
      if (content.includes('hasMissions')) {
        console.log('✅ Found missions check logic');
      } else {
        console.log('❌ Missing missions check logic');
      }
      
      // Check for onboarding logic
      if (content.includes('showOnboarding')) {
        console.log('✅ Found onboarding logic');
      } else {
        console.log('❌ Missing onboarding logic');
      }
      
      // Check for offline mode
      if (content.includes('offlineMode')) {
        console.log('✅ Found offline mode support');
      } else {
        console.log('❌ Missing offline mode support');
      }
      
    } else {
      console.log('❌ WellnessApp.tsx not found');
    }
  } catch (error) {
    console.log('❌ Error checking wellness logic:', error.message);
  }
};

// Check API endpoints
const checkAPIEndpoints = () => {
  console.log('\n🌐 Checking API endpoints...');
  
  try {
    const apiFile = 'src/services/api.js';
    if (fs.existsSync(apiFile)) {
      const content = fs.readFileSync(apiFile, 'utf8');
      
      const endpoints = [
        'getUserProfile',
        'getMyMissions', 
        'getWellnessProgress',
        'setupWellness'
      ];
      
      endpoints.forEach(endpoint => {
        if (content.includes(endpoint)) {
          console.log(`✅ Found ${endpoint} endpoint`);
        } else {
          console.log(`❌ Missing ${endpoint} endpoint`);
        }
      });
    } else {
      console.log('❌ api.js not found');
    }
  } catch (error) {
    console.log('❌ Error checking API endpoints:', error.message);
  }
};

// Check backend wellness endpoints
const checkBackendEndpoints = () => {
  console.log('\n🔧 Checking backend wellness endpoints...');
  
  try {
    const backendDir = 'dash-app/app/api/mobile';
    if (fs.existsSync(backendDir)) {
      const wellnessEndpoints = [
        'wellness/status',
        'wellness/route.js',
        'setup-wellness',
        'my-missions'
      ];
      
      wellnessEndpoints.forEach(endpoint => {
        const endpointPath = path.join(backendDir, endpoint);
        if (fs.existsSync(endpointPath)) {
          console.log(`✅ Found backend endpoint: ${endpoint}`);
        } else {
          console.log(`❌ Missing backend endpoint: ${endpoint}`);
        }
      });
    } else {
      console.log('❌ Backend mobile API directory not found');
    }
  } catch (error) {
    console.log('❌ Error checking backend endpoints:', error.message);
  }
};

// Main execution
const main = () => {
  console.log('🏥 PHC Mobile - Wellness Status Checker\n');
  console.log('=' .repeat(50));
  
  checkAuthStatus();
  checkWellnessLogic();
  checkAPIEndpoints();
  checkBackendEndpoints();
  
  console.log('\n' + '=' .repeat(50));
  console.log('\n📋 Summary:');
  console.log('✅ If user has wellness_program_joined = true → Shows main wellness app');
  console.log('✅ If user has missions → Shows main wellness app');
  console.log('❌ If neither → Shows onboarding screen');
  console.log('🔄 If network error → Shows "Continue Offline" option');
  
  console.log('\n🎯 Expected Behavior for User Who Joined Wellness:');
  console.log('1. User clicks wellness button');
  console.log('2. App checks profile.wellness_program_joined');
  console.log('3. App checks if user has missions');
  console.log('4. If either is true → Shows main wellness interface');
  console.log('5. If network fails → Shows offline mode option');
  
  console.log('\n🔧 To test:');
  console.log('1. Open app and login');
  console.log('2. Click wellness button (heart icon)');
  console.log('3. Should see main wellness interface (not onboarding)');
  console.log('4. If network issues → Click "Continue Offline"');
};

main();
