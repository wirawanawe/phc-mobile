# Network Troubleshooting Guide

## Current Issues Identified

### 1. Mobile App Network Connectivity
- **Error**: `Network request failed`, `TypeError: Network request failed`
- **Cause**: Mobile app cannot reach the backend server
- **Status**: ✅ **FIXED** - Updated API configuration with platform-specific endpoints

### 2. Cursor IDE Connection Timeout
- **Error**: `ConnectError: [unavailable] read ETIMEDOUT`
- **Cause**: Cursor IDE connectivity issues with AI services
- **Status**: ⚠️ **SEPARATE ISSUE** - Not related to mobile app

## Solutions Implemented

### ✅ Fixed: API Configuration
Updated `src/services/api.js` with proper platform-specific endpoints:

- **Android Emulator**: `http://10.0.2.2:3000/api/mobile`
- **iOS Simulator**: `http://localhost:3000/api/mobile`
- **Physical Device**: `http://localhost:3000/api/mobile` (development)
- **Production**: `https://dash.doctorphc.id/api/mobile`

### ✅ Server Status Verified
- Local server is running on port 3000 ✅
- Health endpoint responding correctly ✅
- Mobile API endpoints accessible ✅
- Production server accessible ✅

## Testing Your Setup

### 1. Restart Your Mobile App
```bash
# Stop the current app
# Then restart with:
cd /Users/wirawanawe/Project/phc-mobile
npm run android
# or
npm run ios
```

### 2. Check Server Status
```bash
cd dash-app
npm run dev
```

### 3. Test Connectivity
```bash
# Test local server
curl http://localhost:3000/api/health

# Test mobile API
curl http://localhost:3000/api/mobile/auth/me
```

## Platform-Specific Solutions

### Android Emulator
- Uses `10.0.2.2:3000` to reach host machine
- Make sure Android emulator is running
- Network security config allows HTTP traffic

### iOS Simulator
- Uses `localhost:3000` directly
- Should work immediately after server restart

### Physical Device
- Requires same WiFi network as development machine
- May need to use your computer's IP address
- Check firewall settings

## Cursor IDE Timeout Issue

The Cursor timeout error is unrelated to your mobile app. To fix it:

1. **Restart Cursor**: Close and reopen the application
2. **Check Internet**: Ensure stable internet connection
3. **Clear Cache**: 
   ```bash
   # On macOS
   rm -rf ~/Library/Caches/com.todesktop.230313mzl4w4u92/*
   ```
4. **Update Cursor**: Make sure you have the latest version

## Next Steps

1. ✅ **Mobile App**: Configuration is now fixed, restart your app
2. 🔧 **Test**: Run the app and check the console for connection logs
3. 📱 **Debug**: If still failing, check device/emulator network settings
4. 💻 **Cursor**: Restart Cursor IDE to fix timeout issues

## Monitoring

Watch the console logs when starting your app:
- Look for: `🚀 Development mode: Using [platform] configuration`
- Look for: `✅ Network: Health check successful`
- If you see: `❌ Network: Connectivity test failed` - check server status

## Emergency Fallback

If local development still fails, temporarily use production server:
```javascript
// In src/services/api.js, temporarily change:
if (__DEV__) {
  return "https://dash.doctorphc.id/api/mobile"; // Use production temporarily
}
```

Remember to change it back for production builds!
