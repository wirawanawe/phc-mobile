# 🔐 Authentication Issue Fix Guide

## 🚨 Problem Description

The PHC Mobile app is experiencing authentication issues where refresh tokens are being rejected with a 401 "Invalid refresh token" error. This causes a cascade of authentication failures throughout the app.

### Symptoms
- Users see "Authentication failed. Please login again." errors
- App gets stuck in loading states
- API calls fail with 401 errors
- Token refresh attempts fail repeatedly

### Root Causes
1. **Expired Refresh Tokens**: Refresh tokens have a 30-day expiration and may have expired
2. **JWT Secret Mismatch**: If the server's JWT_SECRET was changed, all existing tokens become invalid
3. **Token Corruption**: Tokens stored in AsyncStorage may be corrupted
4. **User Account Issues**: User accounts may have been deactivated or deleted

## 🛠️ Solutions Implemented

### 1. Improved Error Handling

**File: `src/contexts/AuthContext.tsx`**
- Added better logging with emojis for easier debugging
- Created `clearAllAuthData()` helper function
- Improved error messages for different scenarios
- Added session expiration detection

**File: `src/services/api.js`**
- Enhanced refresh token error handling
- Added specific error messages for different failure types
- Improved token validation and debugging

### 2. Debugging Tools

**File: `src/utils/clearStorage.js`**
- Added `debugAuthData()` function to inspect stored tokens
- Added `forceReLogin()` function to clear auth data
- Enhanced error reporting and logging

**File: `src/utils/authDebugger.js`**
- Console-based debugging utility
- Can be run from React Native debugger
- Provides commands to clear auth data and check tokens

**File: `src/screens/DebugScreen.tsx`**
- User-friendly debug screen
- Shows current authentication status
- Provides buttons to clear auth data
- Safe area with confirmation dialogs

### 3. Better User Experience

- Clear error messages instead of generic "network error"
- Automatic cleanup of invalid tokens
- Graceful handling of authentication failures
- User-friendly prompts for re-login

## 🔧 How to Fix the Issue

### For Users (End Users)

1. **Immediate Fix**: Clear authentication data
   - Open the app
   - Navigate to Debug Screen (if available)
   - Tap "Force Re-Login"
   - Login again with your credentials

2. **Alternative Method**: Clear all app data
   - Go to device Settings > Apps > PHC Mobile
   - Clear app data/cache
   - Restart the app and login again

### For Developers

1. **Debug Current State**:
   ```javascript
   // In React Native debugger console:
   require('./src/utils/authDebugger.js').debugAuth()
   ```

2. **Clear Authentication Data**:
   ```javascript
   // In React Native debugger console:
   require('./src/utils/authDebugger.js').clearAuth()
   ```

3. **Check Token Format**:
   ```javascript
   // In React Native debugger console:
   require('./src/utils/authDebugger.js').checkTokens()
   ```

### For Server Administrators

1. **Check JWT Secret**:
   - Verify `JWT_SECRET` in `.env.local` is correct
   - Ensure it hasn't been changed recently
   - Restart the server if secret was updated

2. **Check User Accounts**:
   - Verify user accounts are active in database
   - Check `mobile_users` table for user status

3. **Server Logs**:
   - Monitor `/api/mobile/auth/refresh` endpoint logs
   - Check for JWT verification errors

## 📊 Debugging Information

### Token Structure
- **Access Token**: 7-day expiration, contains user data
- **Refresh Token**: 30-day expiration, contains only user ID and type
- **Format**: JWT with 3 parts (header.payload.signature)

### Common Error Messages
- `"Invalid refresh token"` - Token is expired, corrupted, or invalid
- `"User not found or inactive"` - User account issues
- `"Authentication failed. Please login again."` - Generic auth failure

### Debug Commands
```javascript
// Check current auth status
debugAuth()

// Clear auth data and force re-login
clearAuth()

// Clear all app data
clearAll()

// Validate token format
checkTokens()
```

## 🚀 Prevention Measures

### 1. Token Management
- Implement token rotation for better security
- Add token blacklisting for logout
- Monitor token expiration proactively

### 2. Error Handling
- Graceful degradation when tokens fail
- Automatic retry with exponential backoff
- User-friendly error messages

### 3. Monitoring
- Log authentication failures
- Monitor token refresh success rates
- Alert on unusual authentication patterns

## 📝 Testing the Fix

1. **Test Token Refresh**:
   ```bash
   curl -X POST http://localhost:3000/api/mobile/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"valid_token_here"}'
   ```

2. **Test Login Flow**:
   - Clear all auth data
   - Login with valid credentials
   - Verify tokens are stored correctly
   - Test API calls work

3. **Test Error Scenarios**:
   - Use expired tokens
   - Use invalid tokens
   - Test with missing tokens

## 🔍 Troubleshooting Checklist

- [ ] Server is running on correct port (3000)
- [ ] JWT_SECRET is properly configured
- [ ] Database connection is working
- [ ] User accounts are active
- [ ] Tokens are properly formatted
- [ ] AsyncStorage is accessible
- [ ] Network connectivity is stable

## 📞 Support

If the issue persists after trying these solutions:

1. Check server logs for detailed error messages
2. Verify database connectivity and user data
3. Test with a fresh user account
4. Contact development team with debug information

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: ✅ Implemented 