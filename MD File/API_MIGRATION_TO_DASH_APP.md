# 🔄 API Migration to Dash-App

## Overview
The PHC Mobile application has been updated to connect to the new `dash-app` API instead of the previous backend server.

## Changes Made

### 1. API Base URL Update
**File**: `src/services/api.js`

**Before**:
```javascript
return "http://10.0.2.2:3000/api"; // Android emulator
return "http://localhost:3000/api"; // iOS simulator
return "http://192.168.1.20:3000/api"; // Physical device
```

**After**:
```javascript
return "http://10.0.2.2:3000/api/mobile"; // Android emulator
return "http://localhost:3000/api/mobile"; // iOS simulator
return "http://192.168.1.20:3000/api/mobile"; // Physical device
```

### 2. API Endpoint Structure
The dash-app uses a different API structure:
- **Old**: `http://localhost:3000/api/auth/login`
- **New**: `http://localhost:3000/api/mobile/auth/login`

### 3. Available Mobile API Endpoints
The dash-app provides these mobile-specific endpoints:
- `/api/mobile/users` - User management
- `/api/mobile/auth` - Authentication
- `/api/mobile/mood_tracking` - Mood tracking
- `/api/mobile/sleep_tracking` - Sleep tracking
- `/api/mobile/health_data` - Health data
- `/api/mobile/missions` - Missions and challenges
- `/api/mobile/wellness` - Wellness activities
- `/api/mobile/food` - Food tracking

## Testing the Connection

### 1. Test Script
Run the test script to verify API connectivity:
```bash
node scripts/test-dash-app-api.js
```

### 2. Manual Testing
Test the API directly:
```bash
curl http://localhost:3000/api/mobile/users
```

## Setup Instructions

### 1. Start Dash-App
```bash
cd ../dash-app
npm run dev
```

### 2. Start Mobile App
```bash
cd phc-mobile
npm start
```

### 3. Update IP Address (if needed)
If testing on a physical device, update the IP address in `src/services/api.js`:
```javascript
return "http://YOUR_IP_ADDRESS:3000/api/mobile";
```

## Troubleshooting

### 1. Connection Issues
- Ensure dash-app is running on port 3000
- Check if the mobile app can reach the dash-app server
- Verify firewall settings

### 2. API Endpoint Not Found
- Some endpoints might not be implemented yet in dash-app
- Check the dash-app API documentation for available endpoints

### 3. Authentication Issues
- The authentication flow might need updates for the new API structure
- Check if JWT tokens are compatible between old and new systems

## Migration Status

✅ **Completed**:
- Updated API base URL configuration
- Updated setup scripts
- Created test script
- Updated documentation

✅ **Completed**:
- Updated API base URL configuration
- Updated setup scripts
- Created test script
- Updated documentation
- Fixed database connection issues
- Verified authentication flow
- Tested core API endpoints

🔄 **In Progress**:
- Testing all mobile app features with new API
- Checking data compatibility

📋 **To Do**:
- Test all mobile app screens
- Verify data synchronization
- Update any hardcoded API endpoints
- Test on physical devices

## Notes

- The dash-app runs on port 3000 (same as the old backend)
- All mobile-specific endpoints are under `/api/mobile/`
- The API structure is more organized and follows REST conventions
- Authentication tokens might need to be regenerated after migration 