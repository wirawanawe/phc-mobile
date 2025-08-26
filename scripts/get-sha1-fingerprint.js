#!/usr/bin/env node

/**
 * Get SHA-1 Fingerprint for Google OAuth Setup
 * This script helps get the SHA-1 certificate fingerprint needed for Google OAuth
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Getting SHA-1 Fingerprint for Google OAuth Setup...\n');

function getSHA1Fingerprint() {
  try {
    // Check if we're in the right directory
    const androidDir = path.join(__dirname, '../android');
    if (!fs.existsSync(androidDir)) {
      console.error('❌ Android directory not found. Make sure you\'re in the project root.');
      return;
    }

    console.log('📱 Getting SHA-1 fingerprint for Android...');
    
    // Try to get SHA-1 using gradle
    try {
      const result = execSync('cd android && ./gradlew signingReport', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Parse the output to find SHA-1
      const lines = result.split('\n');
      let foundDebug = false;
      
      for (const line of lines) {
        if (line.includes('Variant: debug')) {
          foundDebug = true;
          console.log('   📋 Found debug variant');
        }
        
        if (foundDebug && line.includes('SHA1:')) {
          const sha1 = line.split('SHA1:')[1].trim();
          console.log(`   ✅ SHA-1 Fingerprint: ${sha1}`);
          console.log('\n📋 Copy this SHA-1 fingerprint to Google Cloud Console:');
          console.log(`   ${sha1}`);
          return sha1;
        }
      }
      
      console.log('   ⚠️  SHA-1 not found in gradle output');
      
    } catch (gradleError) {
      console.log('   ⚠️  Gradle command failed, trying alternative method...');
    }

    // Alternative method using keytool
    try {
      const keystorePath = path.join(androidDir, 'app/debug.keystore');
      if (fs.existsSync(keystorePath)) {
        console.log('   🔑 Using debug.keystore...');
        const result = execSync(
          `keytool -list -v -keystore "${keystorePath}" -alias androiddebugkey -storepass android -keypass android`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        
        const lines = result.split('\n');
        for (const line of lines) {
          if (line.includes('SHA1:')) {
            const sha1 = line.split('SHA1:')[1].trim();
            console.log(`   ✅ SHA-1 Fingerprint: ${sha1}`);
            console.log('\n📋 Copy this SHA-1 fingerprint to Google Cloud Console:');
            console.log(`   ${sha1}`);
            return sha1;
          }
        }
      } else {
        console.log('   ❌ debug.keystore not found');
      }
    } catch (keytoolError) {
      console.log('   ❌ Keytool command failed');
    }

    console.log('\n❌ Could not get SHA-1 fingerprint automatically.');
    console.log('\n🔧 Manual Steps:');
    console.log('1. Open Android Studio');
    console.log('2. Go to View → Tool Windows → Gradle');
    console.log('3. Navigate to YourApp → Tasks → android → signingReport');
    console.log('4. Double click signingReport');
    console.log('5. Look for "SHA1:" in the output');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function showGoogleOAuthSetupSteps() {
  console.log('\n📋 Google OAuth Setup Steps:');
  console.log('\n1. 🔗 Go to Google Cloud Console:');
  console.log('   https://console.cloud.google.com/');
  
  console.log('\n2. 📁 Create a new project or select existing project');
  
  console.log('\n3. 🔧 Enable Google+ API:');
  console.log('   - Go to APIs & Services → Library');
  console.log('   - Search for "Google+ API" or "Google Identity"');
  console.log('   - Click Enable');
  
  console.log('\n4. 🔑 Create OAuth 2.0 Credentials:');
  console.log('   - Go to APIs & Services → Credentials');
  console.log('   - Click "Create Credentials" → "OAuth 2.0 Client IDs"');
  console.log('   - Choose "Android"');
  console.log('   - Package name: com.doctorphcindonesia');
  console.log('   - SHA-1: (use the fingerprint above)');
  
  console.log('\n5. 📱 Update src/config/socialAuth.ts:');
  console.log('   - Replace YOUR_ANDROID_CLIENT_ID with the actual Client ID');
  
  console.log('\n6. 🧪 Test the setup:');
  console.log('   - Run: expo start');
  console.log('   - Open in Android emulator');
  console.log('   - Try Google Sign-In');
}

// Run the script
getSHA1Fingerprint();
showGoogleOAuthSetupSteps();

console.log('\n🎯 Next Steps:');
console.log('1. Copy the SHA-1 fingerprint above');
console.log('2. Follow the Google OAuth setup steps');
console.log('3. Update the configuration files');
console.log('4. Test Google Sign-In in the app');
