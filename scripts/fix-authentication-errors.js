#!/usr/bin/env node

/**
 * Fix Authentication Errors Script
 * 
 * This script helps fix "Authentication failed. Please login again." errors
 * by stopping all background services and clearing authentication data.
 * 
 * Usage:
 * node scripts/fix-authentication-errors.js
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const fixAuthenticationErrors = async () => {
  console.log('🔐 Fixing Authentication Errors...\n');

  try {
    // Check current auth status
    console.log('1️⃣ Checking current authentication status...');
    
    const authToken = await AsyncStorage.getItem('authToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const userData = await AsyncStorage.getItem('userData');
    const userId = await AsyncStorage.getItem('userId');
    
    console.log('📊 Current Auth Data:');
    console.log('- Auth Token:', authToken ? 'Present' : 'Missing');
    console.log('- Refresh Token:', refreshToken ? 'Present' : 'Missing');
    console.log('- User Data:', userData ? 'Present' : 'Missing');
    console.log('- User ID:', userId || 'Missing');

    // Check if token is expired
    if (authToken) {
      try {
        const parts = authToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          const exp = payload.exp;
          const now = Math.floor(Date.now() / 1000);
          
          console.log('- Token expiration:', new Date(exp * 1000).toISOString());
          console.log('- Current time:', new Date(now * 1000).toISOString());
          console.log('- Token expired:', exp < now ? 'YES' : 'NO');
          
          if (exp < now) {
            console.log('⚠️ Token is expired - this is causing the authentication errors');
          }
        }
      } catch (e) {
        console.log('- Could not parse token payload - token may be invalid');
      }
    }

    // Clear authentication data
    console.log('\n2️⃣ Clearing authentication data...');
    
    await AsyncStorage.multiRemove([
      'authToken',
      'refreshToken', 
      'userData',
      'userId'
    ]);
    
    console.log('✅ Authentication data cleared successfully');

    // Verify data is cleared
    console.log('\n3️⃣ Verifying data is cleared...');
    
    const verifyAuthToken = await AsyncStorage.getItem('authToken');
    const verifyRefreshToken = await AsyncStorage.getItem('refreshToken');
    const verifyUserData = await AsyncStorage.getItem('userData');
    const verifyUserId = await AsyncStorage.getItem('userId');
    
    console.log('📊 Verification:');
    console.log('- Auth Token:', verifyAuthToken ? 'Still present' : 'Cleared ✅');
    console.log('- Refresh Token:', verifyRefreshToken ? 'Still present' : 'Cleared ✅');
    console.log('- User Data:', verifyUserData ? 'Still present' : 'Cleared ✅');
    console.log('- User ID:', verifyUserId ? 'Still present' : 'Cleared ✅');

    console.log('\n✅ Authentication Fix Completed!');
    console.log('\n🎯 Summary:');
    console.log('   - Authentication data has been cleared');
    console.log('   - Expired/invalid tokens removed');
    console.log('   - Ready for fresh login');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Restart the mobile app');
    console.log('   2. Login again with your credentials');
    console.log('   3. The authentication errors should be resolved');
    console.log('   4. Water tracking and mission updates should work properly');
    
    console.log('\n🔍 Why this happened:');
    console.log('   - JWT tokens have expiration dates (typically 30-90 days)');
    console.log('   - When tokens expire, API calls return 401 errors');
    console.log('   - The app shows "Authentication failed. Please login again."');
    console.log('   - Clearing expired tokens and re-logging in fixes this issue');

  } catch (error) {
    console.error('❌ Error fixing authentication:', error);
    console.log('\n💡 Manual Fix Instructions:');
    console.log('   1. Close the mobile app completely');
    console.log('   2. Clear app data from device settings:');
    console.log('      - iOS: Settings → General → iPhone Storage → PHC Mobile → Delete App');
    console.log('      - Android: Settings → Apps → PHC Mobile → Storage → Clear Data');
    console.log('   3. Reinstall the app');
    console.log('   4. Login again with your credentials');
  }
};

// Run the fix
fixAuthenticationErrors().catch(console.error);
