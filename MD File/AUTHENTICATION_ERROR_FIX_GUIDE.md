# 🔐 Authentication Error Fix Guide

## 🚨 Problem Description

You're experiencing authentication errors when trying to track water and update missions:

```
ERROR  Error tracking water and updating missions: [Error: Authentication failed. Please login again.]
ERROR  Save water entry error: [Error: Authentication failed. Please login again.]
```

## 🔍 Root Cause

The issue is caused by **expired JWT tokens**. JWT tokens have expiration dates (typically 30-90 days), and when they expire:

1. **API calls fail** with 401 authentication errors
2. **Background services** continue trying to make API calls
3. **User gets locked out** of features that require authentication
4. **Error messages** appear: "Authentication failed. Please login again."

## ✅ Quick Fix Solutions

### Option 1: Using React Native Debugger (Recommended)

1. **Open React Native Debugger Console**
2. **Run this one-liner**:
   ```javascript
   require('@react-native-async-storage/async-storage').default.multiRemove(['authToken', 'refreshToken', 'userData', 'userId']).then(() => console.log('✅ Auth cleared!')).catch(e => console.error('❌ Error:', e.message));
   ```
3. **Restart the app**
4. **Login again** with your credentials

### Option 2: Using the Debug Screen

1. **Navigate to Debug Screen** in your app
2. **Tap "Clear Auth Data"**
3. **Login again** with your credentials

### Option 3: Manual App Reset

1. **Close the mobile app completely**
2. **Clear app data from device settings**:
   - **iOS**: Settings → General → iPhone Storage → PHC Mobile → Delete App
   - **Android**: Settings → Apps → PHC Mobile → Storage → Clear Data
3. **Reinstall the app**
4. **Login again** with your credentials

### Option 4: Using the Auth Fix Utility

If you have access to the debug console, you can also use:

```javascript
// Check current auth status
require('./src/utils/authFix.js').default.debugAuth()

// Clear authentication data
require('./src/utils/authFix.js').default.clearAuth()

// Force re-login
require('./src/utils/authFix.js').default.forceReLogin()
```

## 🔧 Technical Details

### What Happens When Tokens Expire

1. **JWT Token Structure**: `header.payload.signature`
2. **Expiration Check**: The `exp` field in the payload contains the expiration timestamp
3. **API Response**: When expired, backend returns 401 Unauthorized
4. **Error Cascade**: Multiple components try to make API calls, all fail

### Token Expiration Timeline

- **Access Token**: 30-90 days (configurable)
- **Refresh Token**: 365 days (if implemented)
- **Auto-refresh**: Should happen automatically but may fail

### Files Involved

- `src/services/api.js` - Main API service with authentication
- `src/contexts/AuthContext.tsx` - Authentication context
- `src/utils/authFix.js` - Authentication debugging utilities
- `src/services/TrackingMissionService.ts` - Mission tracking service

## 🎯 Expected Results After Fix

### ✅ **Immediate Results**
- Authentication errors stop appearing
- Water tracking works properly
- Mission updates function correctly
- API calls succeed

### ✅ **Long-term Benefits**
- Fresh authentication tokens
- Proper session management
- Better error handling
- Improved app stability

## 🔍 Verification Steps

After applying the fix:

1. **Check Logs**: No more "Authentication failed" errors
2. **Test Water Tracking**: Add water and verify it saves
3. **Test Mission Updates**: Check if missions update properly
4. **Test Other Features**: Verify all authenticated features work

## 🚀 Prevention Measures

### For Developers

1. **Implement Token Refresh**: Automatic token refresh before expiration
2. **Better Error Handling**: Graceful handling of 401 errors
3. **Session Monitoring**: Track token expiration and warn users
4. **Background Service Management**: Stop services when authentication fails

### For Users

1. **Regular App Updates**: Keep the app updated
2. **Proper Logout**: Use the logout button instead of force-closing
3. **Network Stability**: Ensure stable internet connection
4. **Report Issues**: Report authentication problems early

## 📱 User Experience

### Before Fix
- ❌ Water tracking fails
- ❌ Mission updates don't work
- ❌ Authentication errors in logs
- ❌ Frustrating user experience

### After Fix
- ✅ Water tracking works smoothly
- ✅ Mission updates function properly
- ✅ No authentication errors
- ✅ Smooth user experience

## 🎉 Status: RESOLVABLE

The authentication errors are **easily fixable** by clearing expired tokens and re-logging in. This is a common issue with JWT-based authentication systems and has a straightforward solution.

---

**💡 Quick Summary**: Clear authentication data → Restart app → Login again → Problem solved!
