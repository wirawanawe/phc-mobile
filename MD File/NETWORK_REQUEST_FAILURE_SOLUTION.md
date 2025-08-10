# 🔧 Network Request Failure Solution

## 🚨 Problem
```
ERROR ❌ Auth: Token validation failed: [TypeError: Network request failed]
```

## 🔍 Root Cause Analysis

The error occurs during token validation when the mobile app tries to connect to the server. This is typically caused by:

1. **Incorrect IP Address Configuration**: Android emulator uses `10.0.2.2` instead of `10.242.90.103`
2. **Network Security Configuration**: Android API level 28+ blocks HTTP requests by default
3. **Platform-Specific Network Issues**: Different IP addresses needed for different platforms

## ✅ Solution Implemented

### 1. Fixed Network Configuration

**File**: `src/services/api.js`

**Before**:
```javascript
if (Platform.OS === "android") {
  return "http://10.242.90.103:3000/api/mobile";
}
```

**After**:
```javascript
if (Platform.OS === "android") {
  return "http://10.0.2.2:3000/api/mobile";
}
```

### 2. Added Network Security Configuration

**File**: `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.242.90.103</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>
```

### 3. Updated Android Manifest

**File**: `android/app/src/main/AndroidManifest.xml`

Added network security config reference:
```xml
android:networkSecurityConfig="@xml/network_security_config"
```

### 4. Enhanced Error Logging

**File**: `src/contexts/AuthContext.tsx`

Added detailed logging for token validation:
```javascript
console.log('🔍 Auth: Validating token...');
console.log('🔗 Auth: API URL:', apiService.baseURL);
console.log('📡 Auth: Response status:', response.status);
```

**File**: `src/services/api.js`

Added detailed logging for API initialization:
```javascript
console.log('🔧 API: Initializing API service...');
console.log('🔗 API: Base URL set to:', this.baseURL);
console.log('🌐 API: Testing connectivity...');
```

## 🧪 Testing

### Network Connectivity Test

Run the network test to verify connectivity:

```bash
# Test all endpoints
curl -I http://localhost:3000/api/health
curl -I http://10.242.90.103:3000/api/health
curl -I http://10.0.2.2:3000/api/health
```

### Expected Results

- ✅ `localhost:3000` - Accessible (iOS Simulator)
- ✅ `10.242.90.103:3000` - Accessible (Physical Device)
- ✅ `10.0.2.2:3000` - Accessible (Android Emulator)

## 📱 Platform-Specific Configuration

### Android Emulator
- **IP**: `10.0.2.2:3000`
- **Reason**: Android emulator uses special IP to access host machine

### iOS Simulator
- **IP**: `localhost:3000`
- **Reason**: iOS simulator can access localhost directly

### Physical Device
- **IP**: `10.242.90.103:3000`
- **Reason**: Physical device needs actual network IP

## 🔧 Troubleshooting Steps

### Step 1: Verify Server is Running
```bash
cd dash-app
npm run dev
```

### Step 2: Test Network Connectivity
```bash
# From your computer
curl -I http://localhost:3000/api/health
curl -I http://10.242.90.103:3000/api/health
```

### Step 3: Check Mobile App Logs
Look for these log messages:
- `🔧 API: Initializing API service...`
- `🔗 API: Base URL set to: [URL]`
- `🌐 API: Testing connectivity...`
- `✅ API: Connectivity test successful`

### Step 4: Rebuild App (if needed)
```bash
# Clean and rebuild
npx expo run:android --clear
# or
npx expo run:ios --clear
```

## 🚀 Quick Fix Commands

### For Android Emulator
```bash
# The fix is already applied in the code
# Just restart the app
npx expo run:android
```

### For iOS Simulator
```bash
# The fix is already applied in the code
# Just restart the app
npx expo run:ios
```

### For Physical Device
```bash
# The fix is already applied in the code
# Just restart the app
npx expo start
```

## 📋 Verification Checklist

- [ ] Server is running on port 3000
- [ ] Network security config is in place
- [ ] Android manifest includes network security config
- [ ] API configuration uses correct IP for platform
- [ ] Enhanced logging is active
- [ ] App is rebuilt with new configuration

## 🎯 Expected Outcome

After applying these fixes:

1. **Token validation should work** without network request failures
2. **Detailed logs** will help debug any remaining issues
3. **Platform-specific** network configuration will work correctly
4. **HTTP requests** will be allowed on Android

## 🔍 Debugging Commands

### Check Current Configuration
```bash
# View current IP configuration
grep -A 10 "getApiBaseUrl" src/services/api.js
```

### Test Specific Endpoint
```bash
# Test auth endpoint
curl -I http://localhost:3000/api/mobile/auth/me
```

### Monitor App Logs
```bash
# Start app with detailed logging
npx expo start --clear
```

## 📞 Support

If the issue persists:

1. Check the detailed logs in the console
2. Verify the server is accessible from the device/emulator
3. Ensure the correct IP address is being used for your platform
4. Rebuild the app with the new configuration

The enhanced logging will provide detailed information about what's happening during the network requests.
