# 🚀 Production Mode Setup - PHC Mobile App

## Overview
The PHC Mobile application has been successfully configured for production mode. All development configurations have been removed and the app is now set to use the production server exclusively.

## Changes Made

### 1. API Configuration (`src/services/api.js`)
- **Before**: Used development URLs when `__DEV__` was true
- **After**: Forces production server URL for all builds
- **Production URL**: `https://dash.doctorphc.id/api/mobile`

### 2. Network Helper (`src/utils/networkHelper.js`)
- **Before**: Multiple development server endpoints
- **After**: Single production server endpoint
- **Production URL**: `https://dash.doctorphc.id`

### 3. Connection Test (`src/utils/connectionTest.js`)
- **Before**: Multiple development endpoints for testing
- **After**: Single production endpoint
- **Production URL**: `https://dash.doctorphc.id/api/mobile/auth/me`

### 4. Rate Limiting
- **Before**: Development mode could clear rate limits
- **After**: Production mode respects rate limits and waits appropriately

## Production Configuration Status

✅ **API URLs forced to production**  
✅ **App.json production profile exists**  
✅ **EAS production profile exists**  
✅ **No development configurations found**  

## Build Configuration

### EAS Build Profiles
- **Development**: `eas build --platform android --profile development`
- **Preview**: `eas build --platform android --profile preview`
- **Production**: `eas build --platform android --profile production`

### App Configuration
- **Bundle Identifier**: `com.phc.doctorapp`
- **Version**: `1.0.0`
- **Build Type**: APK

## How to Build for Production

### Option 1: Using the Build Script
```bash
./scripts/build-production.sh
```

### Option 2: Direct EAS Command
```bash
eas build --platform android --profile production
```

### Option 3: iOS Build
```bash
eas build --platform ios --profile production
```

## Verification

To verify that the app is properly configured for production:

```bash
node scripts/verify-production-config.js
```

This script checks:
- API URLs are forced to production
- No development configurations remain
- Build profiles are properly configured

## Production Server Details

- **Base URL**: `https://dash.doctorphc.id`
- **API Endpoint**: `https://dash.doctorphc.id/api/mobile`
- **Health Check**: `https://dash.doctorphc.id/api/health`

## Important Notes

1. **No Development Fallbacks**: The app will only connect to the production server
2. **Rate Limiting**: Production mode respects rate limits without clearing them
3. **Error Handling**: Enhanced error messages for production environment
4. **Network Timeouts**: Optimized for production network conditions

## Testing Production Build

1. Build the APK using the production profile
2. Install on a physical device
3. Test all major features:
   - User authentication
   - Mission management
   - Health data tracking
   - Wellness activities
   - Food tracking

## Rollback to Development

If you need to switch back to development mode:

1. Edit `src/services/api.js`
2. Restore the `__DEV__` checks
3. Add back development server URLs
4. Update utility files accordingly

## Support

For issues with production builds or configuration:
1. Check the verification script output
2. Review the build logs
3. Test connectivity to production server
4. Verify API endpoints are accessible

---

**Last Updated**: $(date)
**Status**: ✅ Production Ready
