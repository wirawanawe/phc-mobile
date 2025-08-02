# 🍽️ Meal Tracking 400 Error Fix Guide

## 🚨 Problem Description

The meal tracking endpoint `/api/mobile/tracking/meal/today` is returning a 400 error with the message "User ID is required". This happens when the mobile app tries to access meal tracking data without proper authentication.

### Error Details
- **Endpoint**: `GET /api/mobile/tracking/meal/today`
- **Error**: `400 Bad Request`
- **Message**: `"User ID is required"`
- **Response Time**: ~20ms

### Root Cause
The issue occurs when:
1. **User is not logged in** - No user data in AsyncStorage
2. **User data is corrupted** - Invalid JSON in userData
3. **Authentication tokens expired** - User needs to re-login
4. **Missing user_id parameter** - API call doesn't include user_id

## 🔍 Diagnosis

### 1. Check Current Authentication Status
```javascript
// In React Native debugger console:
require('./src/utils/authDebugger.js').debugAuth()
```

### 2. Test Meal Tracking Specifically
```javascript
// In React Native debugger console:
require('./src/utils/authDebugger.js').testMealTracking()
```

### 3. Check User Data in AsyncStorage
```javascript
// In React Native debugger console:
const AsyncStorage = require('@react-native-async-storage/async-storage');
AsyncStorage.getItem("userData").then(data => console.log('User Data:', data));
```

## 🛠️ Solutions Implemented

### 1. Enhanced Error Handling (`src/services/api.js`)

**Improved User ID Retrieval:**
- Added detailed logging for user ID retrieval
- Better error messages when user data is missing
- Clear indication when user_id parameter is missing

**Enhanced Request Error Handling:**
- Specific handling for "User ID is required" errors
- User-friendly error messages
- Automatic detection of authentication issues

### 2. Debugging Tools (`src/utils/authDebugger.js`)

**New Function: `testMealTracking()`**
- Tests the meal tracking endpoint directly
- Checks authentication status
- Provides specific solutions for different error types

### 3. Better Logging
- Added emojis for easier debugging
- Detailed error messages
- Step-by-step troubleshooting guidance

## 🔧 How to Fix the Issue

### For Users (End Users)

1. **Clear Authentication Data**:
   ```javascript
   // In React Native debugger console:
   require('./src/utils/authDebugger.js').clearAuth()
   ```

2. **Login Again**:
   - Restart the app
   - Login with valid credentials
   - Try accessing meal tracking features

### For Developers

1. **Debug the Issue**:
   ```javascript
   // Check current auth status
   require('./src/utils/authDebugger.js').debugAuth()
   
   // Test meal tracking specifically
   require('./src/utils/authDebugger.js').testMealTracking()
   ```

2. **Clear Auth Data**:
   ```javascript
   // Clear authentication data
   require('./src/utils/authDebugger.js').clearAuth()
   ```

3. **Check User Data**:
   ```javascript
   // Check if user data exists
   const AsyncStorage = require('@react-native-async-storage/async-storage');
   AsyncStorage.getItem("userData").then(data => {
     console.log('User Data:', data);
     if (data) {
       const user = JSON.parse(data);
       console.log('User ID:', user.id);
     }
   });
   ```

### For Server Administrators

1. **Check Server Logs**:
   ```bash
   # Monitor the meal tracking endpoint
   tail -f /path/to/server/logs | grep "meal/today"
   ```

2. **Test Endpoint Directly**:
   ```bash
   # Test without user_id (should return 400)
   curl -X GET "http://localhost:3000/api/mobile/tracking/meal/today"
   
   # Test with user_id (should return 200)
   curl -X GET "http://localhost:3000/api/mobile/tracking/meal/today?user_id=1"
   ```

## 📊 Debugging Information

### Expected Request Format
```
GET /api/mobile/tracking/meal/today?user_id=1
```

### Error Responses
- **400**: `{"success":false,"message":"User ID is required"}`
- **401**: Authentication token issues
- **500**: Server errors

### Success Response Format
```json
{
  "success": true,
  "data": {
    "date": "2025-01-27",
    "totals": {
      "calories": 850,
      "protein": 45,
      "carbs": 120,
      "fat": 25,
      "meal_count": 3,
      "food_count": 8
    },
    "meals_by_type": {
      "breakfast": { ... },
      "lunch": { ... },
      "dinner": { ... }
    },
    "recommended": { ... },
    "percentages": { ... },
    "meal_types": ["breakfast", "lunch", "dinner"]
  }
}
```

## 🔍 Troubleshooting Steps

### Step 1: Check Authentication
```javascript
// Run this in debugger console
require('./src/utils/authDebugger.js').debugAuth()
```

### Step 2: Test Meal Tracking
```javascript
// Run this in debugger console
require('./src/utils/authDebugger.js').testMealTracking()
```

### Step 3: Clear and Re-login
```javascript
// Clear auth data
require('./src/utils/authDebugger.js').clearAuth()

// Then restart app and login again
```

### Step 4: Verify Fix
```javascript
// Test again after login
require('./src/utils/authDebugger.js').testMealTracking()
```

## 🚀 Prevention Measures

### 1. Authentication Checks
- Always verify user is logged in before making API calls
- Check user data exists in AsyncStorage
- Handle authentication errors gracefully

### 2. Error Handling
- Provide user-friendly error messages
- Log detailed error information for debugging
- Implement automatic retry with authentication refresh

### 3. User Experience
- Show loading states during authentication checks
- Provide clear guidance when login is required
- Handle offline scenarios gracefully

## 📝 Testing Checklist

- [ ] User is logged in
- [ ] User data exists in AsyncStorage
- [ ] Auth token is valid
- [ ] API endpoint is accessible
- [ ] user_id parameter is included in request
- [ ] Server responds with 200 status
- [ ] Response contains expected meal data

## 🔧 Quick Fix Commands

```javascript
// 1. Check current status
debugAuth()

// 2. Test meal tracking
testMealTracking()

// 3. Clear auth data if needed
clearAuth()

// 4. Test again after login
testMealTracking()
```

## 📞 Support

If the issue persists after following these steps:

1. Check server logs for detailed error messages
2. Verify database connectivity
3. Test with a fresh user account
4. Contact development team with debug information

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: ✅ Implemented 