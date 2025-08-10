# API Endpoint Migration Summary

## Overview
Successfully migrated the mobile application API endpoints from `10.242.90.103` to `https://dash.doctorphc.id`.

## Files Updated

### Core API Configuration
1. **`src/services/api.js`**
   - Updated `getApiBaseUrl()` function
   - Changed physical device endpoint from `http://10.242.90.103:3000/api/mobile` to `https://dash.doctorphc.id/api/mobile`
   - Updated production endpoint to use the new domain

2. **`src/utils/networkHelper.js`**
   - Updated `findBestServer()` to prioritize the new production server
   - Updated `getDefaultURL()` to use the new domain for iOS and production

3. **`src/services/socialAuth.js`**
   - Updated OTP verification endpoint from `http://10.242.90.103:3000/api/auth/verify-otp` to `https://dash.doctorphc.id/api/auth/verify-otp`

### Utility Files
4. **`src/services/mockApi.js`**
   - Updated baseURL from `http://10.242.90.103:3000/api` to `https://dash.doctorphc.id/api`

5. **`src/utils/networkDiagnostics.js`**
   - Updated test endpoints to use the new domain

6. **`src/utils/testConnection.js`**
   - Updated health check endpoint

7. **`src/utils/connectionTest.js`**
   - Updated authentication test endpoint

8. **`src/utils/networkDiagnostic.js`**
   - Updated test endpoints

9. **`src/utils/networkTest.js`**
   - Updated server endpoints list

### Android Configuration
10. **`android/app/src/main/res/xml/network_security_config.xml`**
    - Added new domain configuration for `dash.doctorphc.id`
    - Set `cleartextTrafficPermitted="false"` for HTTPS domain
    - Kept existing local development domains for backward compatibility

## Key Changes

### Development vs Production
- **Development (Android Emulator)**: Still uses `http://10.0.2.2:3000/api/mobile`
- **Development (iOS Simulator)**: Now uses `https://dash.doctorphc.id/api/mobile`
- **Physical Devices**: Now uses `https://dash.doctorphc.id/api/mobile`
- **Production**: Uses `https://dash.doctorphc.id/api/mobile`

### Network Security
- Added HTTPS domain to Android network security config
- Disabled cleartext traffic for the production domain
- Maintained HTTP support for local development

## Testing Instructions

### 1. Test on Physical Device
```bash
# Build and install the app
npx expo run:android
# or
npx expo run:ios
```

### 2. Test API Connectivity
```bash
# Test the new endpoint
curl -I https://dash.doctorphc.id/api/health
```

### 3. Test Authentication
- Try logging in with valid credentials
- Verify OTP functionality works
- Test token refresh mechanism

### 4. Test Core Features
- Mission management
- Health data tracking
- Wellness features
- Chat functionality
- Booking system

## Fallback Configuration
The app maintains fallback to the old IP address (`10.242.90.103`) in the server discovery list for backward compatibility during the transition period.

## Notes
- All API calls now use HTTPS for production
- Local development still supports HTTP for emulator/simulator testing
- Network security config updated to support the new domain
- Backward compatibility maintained for development environments

## Verification Checklist
- [ ] App builds successfully
- [ ] Login functionality works
- [ ] API calls return expected responses
- [ ] No network security errors on Android
- [ ] All core features function properly
- [ ] Fallback mechanisms work if needed
