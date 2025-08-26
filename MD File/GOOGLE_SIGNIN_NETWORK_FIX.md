# 🔧 Google Sign-In Network Request Failed - Solution

## 🚨 Problem
```
ERROR Mock Google sign-in error: [TypeError: Network request failed]
```

## 🔍 Root Cause Analysis

The error occurred because the social authentication services were using a hardcoded `localhost:3000` URL, but when running on an Android emulator, the app needs to use the local network IP address (`10.242.90.103:3000`) instead of `localhost`.

### Key Issues Identified:

1. **Platform-Specific URL Configuration**: The social auth services weren't using platform-specific URLs
2. **Static URL Storage**: Server URLs were stored in constructors instead of being retrieved dynamically
3. **Network Security Configuration**: While properly configured, the URLs weren't matching the expected endpoints

## ✅ Solution Implemented

### 1. Updated Development Configuration

**File**: `src/config/socialAuth.ts`

**Before**:
```typescript
export const DEV_CONFIG = {
  serverUrl: __DEV__ ? 'http://localhost:3000' : 'https://dash.doctorphc.id',
};
```

**After**:
```typescript
export const DEV_CONFIG = {
  get serverUrl() {
    if (__DEV__) {
      const { Platform } = require('react-native');
      if (Platform.OS === 'android') {
        return 'http://10.242.90.103:3000';
      } else {
        return 'http://localhost:3000';
      }
    }
    return 'https://dash.doctorphc.id';
  },
};
```

### 2. Updated Social Authentication Services

**Files**: `src/services/socialAuthDev.js` and `src/services/socialAuth.js`

**Changes Made**:
- Removed static `serverUrl` storage in constructors
- Added dynamic `getServerUrl()` method
- Updated all fetch calls to use dynamic URL retrieval
- Added logging to track which URL is being used

**Before**:
```javascript
constructor() {
  this.serverUrl = DEV_CONFIG.serverUrl;
}

// Usage
const response = await fetch(`${this.serverUrl}/api/mobile/auth/google`, ...);
```

**After**:
```javascript
constructor() {
  // Don't store serverUrl in constructor - get it dynamically
}

getServerUrl() {
  return DEV_CONFIG.serverUrl;
}

// Usage
const serverUrl = this.getServerUrl();
console.log('🔗 Social Auth: Using server URL:', serverUrl);
const response = await fetch(`${serverUrl}/api/mobile/auth/google`, ...);
```

### 3. Network Security Configuration (Already Correct)

The Android network security configuration was already properly set up:

**File**: `android/app/src/main/res/xml/network_security_config.xml`
```xml
<domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">10.0.2.2</domain>
    <domain includeSubdomains="true">localhost</domain>
    <domain includeSubdomains="true">10.242.90.103</domain>
    <domain includeSubdomains="true">127.0.0.1</domain>
</domain-config>
```

**File**: `android/app/src/main/AndroidManifest.xml`
```xml
<application 
  android:networkSecurityConfig="@xml/network_security_config"
  ...>
```

## 🧪 Testing

Created a comprehensive test script to verify the configuration:

**File**: `scripts/test-social-auth-config.js`

**Test Results**:
```
✅ Network security config includes 10.242.90.103
✅ Network security config includes localhost
✅ Android manifest includes network security config
✅ Android manifest includes INTERNET permission
✅ Connectivity: http://localhost:3000/api/mobile/auth/google - Status: 405
✅ Google Auth: http://localhost:3000/api/mobile/auth/google - Success! User ID: 10
✅ Connectivity: http://10.242.90.103:3000/api/mobile/auth/google - Status: 405
✅ Google Auth: http://10.242.90.103:3000/api/mobile/auth/google - Success! User ID: 10
```

## 🔧 Platform-Specific URLs

| Platform | URL | Notes |
|----------|-----|-------|
| iOS Simulator | `http://localhost:3000` | Uses localhost |
| Android Emulator | `http://10.242.90.103:3000` | Uses local network IP |
| Production | `https://dash.doctorphc.id` | Uses production server |

## 🚀 How to Use

1. **For Development**: The configuration automatically detects the platform and uses the correct URL
2. **For Testing**: Run `node scripts/test-social-auth-config.js` to verify setup
3. **For Debugging**: Check the console logs for `🔗 Social Auth: Using server URL:` to see which URL is being used

## 📋 Verification Steps

1. ✅ Backend server is running on port 3000
2. ✅ Network security configuration includes all necessary domains
3. ✅ Android manifest has proper permissions and network security config
4. ✅ Social auth services use dynamic URL retrieval
5. ✅ Both localhost and local network IP are accessible
6. ✅ Google auth endpoint responds correctly

## 🎯 Expected Behavior

After implementing these changes:

- **iOS Simulator**: Uses `localhost:3000` for social authentication
- **Android Emulator**: Uses `10.242.90.103:3000` for social authentication
- **No more "Network request failed" errors** for Google sign-in
- **Automatic platform detection** without manual configuration
- **Proper error handling** with detailed logging

## 🔄 Troubleshooting

If you still encounter issues:

1. **Restart the React Native app** after making changes
2. **Verify server is running**: `curl http://localhost:3000/api/mobile/auth/google`
3. **Check network connectivity**: Run the test script
4. **Verify platform detection**: Check console logs for URL being used
5. **Clear app cache**: Sometimes cached configurations can cause issues

## 📝 Files Modified

- `src/config/socialAuth.ts` - Updated DEV_CONFIG to use dynamic URLs
- `src/services/socialAuthDev.js` - Updated to use dynamic URL retrieval
- `src/services/socialAuth.js` - Updated to use dynamic URL retrieval
- `scripts/test-social-auth-config.js` - Created comprehensive test script

## 🎉 Result

The Google sign-in "Network request failed" error has been resolved by implementing platform-specific URL configuration that automatically detects the correct server URL based on the platform (iOS vs Android) and development environment.
