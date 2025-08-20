#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Wellness User Status...\n');

// Check user profile data
const checkUserProfile = () => {
  console.log('👤 Checking user profile data...');
  
  try {
    // Look for user data in various locations
    const possibleUserDataLocations = [
      'src/contexts/AuthContext.tsx',
      'src/services/api.js',
      'dash-app/app/api/mobile/users/profile/route.js'
    ];
    
    let foundUserData = false;
    possibleUserDataLocations.forEach(location => {
      if (fs.existsSync(location)) {
        console.log(`✅ Found user data location: ${location}`);
        foundUserData = true;
      }
    });
    
    if (!foundUserData) {
      console.log('❌ No user data locations found');
    }
    
    return foundUserData;
  } catch (error) {
    console.log('❌ Error checking user profile:', error.message);
    return false;
  }
};

// Check wellness program status endpoint
const checkWellnessStatus = () => {
  console.log('\n🏥 Checking wellness program status...');
  
  try {
    const wellnessStatusFile = 'dash-app/app/api/mobile/wellness/status/route.js';
    if (fs.existsSync(wellnessStatusFile)) {
      const content = fs.readFileSync(wellnessStatusFile, 'utf8');
      
      console.log('✅ Found wellness status endpoint');
      
      // Check what fields are returned
      const fields = [
        'wellness_program_joined',
        'wellness_join_date',
        'fitness_goal',
        'activity_level',
        'has_missions',
        'mission_count'
      ];
      
      fields.forEach(field => {
        if (content.includes(field)) {
          console.log(`  ✅ Returns: ${field}`);
        } else {
          console.log(`  ❌ Missing: ${field}`);
        }
      });
      
    } else {
      console.log('❌ Wellness status endpoint not found');
    }
  } catch (error) {
    console.log('❌ Error checking wellness status:', error.message);
  }
};

// Check missions endpoint
const checkMissionsEndpoint = () => {
  console.log('\n🎯 Checking missions endpoint...');
  
  try {
    const missionsFile = 'dash-app/app/api/mobile/my-missions/route.js';
    if (fs.existsSync(missionsFile)) {
      const content = fs.readFileSync(missionsFile, 'utf8');
      
      console.log('✅ Found missions endpoint');
      
      // Check if it returns user missions
      if (content.includes('user_missions') || content.includes('missions')) {
        console.log('  ✅ Returns user missions data');
      } else {
        console.log('  ❌ Missing missions data return');
      }
      
    } else {
      console.log('❌ Missions endpoint not found');
    }
  } catch (error) {
    console.log('❌ Error checking missions endpoint:', error.message);
  }
};

// Check frontend logic for wellness user
const checkFrontendWellnessLogic = () => {
  console.log('\n📱 Checking frontend wellness logic...');
  
  try {
    const wellnessFile = 'src/screens/WellnessApp.tsx';
    if (fs.existsSync(wellnessFile)) {
      const content = fs.readFileSync(wellnessFile, 'utf8');
      
      // Check the specific logic for wellness users
      const wellnessUserChecks = [
        'profile.wellness_program_joined',
        'hasMissions',
        'missionsResponse.data.length > 0',
        'setShowOnboarding(false)',
        'setHasProfile(true)'
      ];
      
      wellnessUserChecks.forEach(check => {
        if (content.includes(check)) {
          console.log(`✅ Found: ${check}`);
        } else {
          console.log(`❌ Missing: ${check}`);
        }
      });
      
    } else {
      console.log('❌ WellnessApp.tsx not found');
    }
  } catch (error) {
    console.log('❌ Error checking frontend logic:', error.message);
  }
};

// Check API service for wellness user handling
const checkAPIService = () => {
  console.log('\n🌐 Checking API service for wellness user...');
  
  try {
    const apiFile = 'src/services/api.js';
    if (fs.existsSync(apiFile)) {
      const content = fs.readFileSync(apiFile, 'utf8');
      
      // Check API methods for wellness users
      const apiMethods = [
        'getUserProfile',
        'getMyMissions',
        'getWellnessProgress',
        'getWellnessProgramStatus'
      ];
      
      apiMethods.forEach(method => {
        if (content.includes(method)) {
          console.log(`✅ Found API method: ${method}`);
        } else {
          console.log(`❌ Missing API method: ${method}`);
        }
      });
      
    } else {
      console.log('❌ api.js not found');
    }
  } catch (error) {
    console.log('❌ Error checking API service:', error.message);
  }
};

// Main execution
const main = () => {
  console.log('🏥 PHC Mobile - Wellness User Verification\n');
  console.log('=' .repeat(60));
  
  checkUserProfile();
  checkWellnessStatus();
  checkMissionsEndpoint();
  checkFrontendWellnessLogic();
  checkAPIService();
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📋 Wellness User Status Logic:');
  console.log('');
  console.log('🔍 When user clicks wellness button:');
  console.log('1. App calls getUserProfile()');
  console.log('2. App calls getMyMissions()');
  console.log('3. Checks profile.wellness_program_joined');
  console.log('4. Checks if missions exist (missionsResponse.data.length > 0)');
  console.log('');
  console.log('✅ If wellness_program_joined = true OR has missions:');
  console.log('   → setHasProfile(true)');
  console.log('   → setShowOnboarding(false)');
  console.log('   → Shows main wellness interface');
  console.log('');
  console.log('❌ If neither condition is met:');
  console.log('   → setHasProfile(false)');
  console.log('   → setShowOnboarding(true)');
  console.log('   → Shows onboarding screen');
  console.log('');
  console.log('🔄 If network error occurs:');
  console.log('   → Shows "Continue Offline" option');
  console.log('   → Uses cached user data if available');
  
  console.log('\n🎯 For User Who Already Joined Wellness:');
  console.log('✅ Should see main wellness interface (not onboarding)');
  console.log('✅ Should see wellness dashboard with missions');
  console.log('✅ Should see wellness progress tracking');
  console.log('✅ Should see wellness activities');
  
  console.log('\n🔧 To verify in app:');
  console.log('1. Login to app');
  console.log('2. Click wellness button (heart icon)');
  console.log('3. Should see main wellness interface');
  console.log('4. If see onboarding → User not properly registered');
  console.log('5. If see network error → Click "Continue Offline"');
};

main();
