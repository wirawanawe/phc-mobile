# 🔐 Authentication Issue Fix Guide

## 🚨 Problem Description

The PHC Mobile app is experiencing authentication issues where users see "Authentication failed. Please login again." errors. This is causing problems with:

- Sleep data updates
- Wellness score calculations
- API calls throughout the app
- User session management

## 🔍 Root Causes

1. **Expired Authentication Tokens**: JWT tokens have expired and need to be refreshed
2. **Invalid Token Storage**: Tokens stored in AsyncStorage may be corrupted
3. **Network Connectivity Issues**: Temporary network problems affecting API calls
4. **Server Authentication Issues**: Backend authentication system problems

## 🛠️ Solutions

### Option 1: Quick Fix (Recommended)

1. **Open the Debug Screen**:
   - Navigate to the Debug Screen in the app
   - Or use the React Native debugger console

2. **Clear Authentication Data**:
   - Tap "Clear Auth Data" button
   - Or run in debugger: `require('./src/utils/authDebugger.js').clearAuth()`

3. **Login Again**:
   - The app will redirect you to the login screen
   - Enter your credentials and login again

### Option 2: Using React Native Debugger

If you have access to the React Native debugger console:

```javascript
// Check current authentication status
require('./src/utils/authDebugger.js').debugAuth()

// Clear authentication data
require('./src/utils/authDebugger.js').clearAuth()

// Force re-login
require('./src/utils/authDebugger.js').forceReLogin()

// Check token format
require('./src/utils/authDebugger.js').checkTokens()
```

### Option 3: Nuclear Option (Last Resort)

If the above options don't work:

1. **Clear All App Data**:
   - Go to device Settings > Apps > PHC Mobile
   - Clear app data/cache
   - Restart the app

2. **Or use Debug Screen**:
   - Tap "Clear All Data (Nuclear)" button
   - This will clear everything and restart the app

## 🔧 Technical Details

### Authentication Flow

1. **Login**: User provides credentials
2. **Token Generation**: Server returns access token and refresh token
3. **Token Storage**: Tokens stored in AsyncStorage
4. **API Calls**: Access token included in Authorization header
5. **Token Refresh**: When access token expires, refresh token used to get new tokens

### Common Error Messages

- `"Authentication failed. Please login again."` - Token expired or invalid
- `"Invalid refresh token"` - Refresh token expired or corrupted
- `"User not found or inactive"` - User account issues
- `"Network request failed"` - Connectivity problems

### Debug Information

The debug tools will show:
- ✅ **Present**: Token/data exists and is valid
- ❌ **Missing**: Token/data is missing or corrupted
- 🔍 **Token Preview**: First 20 characters of token for verification

## 📱 User Instructions

### For End Users

1. **If you see authentication errors**:
   - Try logging out and logging back in
   - If that doesn't work, use the Debug Screen

2. **To access Debug Screen**:
   - Navigate to Settings or Profile section
   - Look for "Debug" or "Troubleshoot" option
   - Or ask your administrator for access

3. **After clearing data**:
   - You'll need to login again
   - Some app settings may need to be reconfigured
   - Your data is safe on the server

### For Developers

1. **Check server logs**:
   - Monitor `/api/mobile/auth/refresh` endpoint
   - Look for JWT verification errors
   - Check user account status

2. **Verify JWT Secret**:
   - Ensure `JWT_SECRET` in `.env.local` is correct
   - Restart server if secret was changed

3. **Test authentication flow**:
   - Use Postman or similar tool to test login endpoint
   - Verify token refresh endpoint works
   - Check user account exists and is active

## 🚀 Prevention

To prevent future authentication issues:

1. **Regular Token Refresh**: Implement automatic token refresh before expiration
2. **Better Error Handling**: Provide clear error messages to users
3. **Offline Support**: Handle network connectivity issues gracefully
4. **User Education**: Inform users about session timeouts and re-login requirements

## 📞 Support

If you continue to experience issues:

1. **Check Network**: Ensure stable internet connection
2. **Restart App**: Close and reopen the application
3. **Contact Support**: Reach out to your system administrator
4. **Check Server Status**: Verify backend services are running

## 🔄 Recovery Process

After fixing authentication issues:

1. **Verify Login**: Ensure you can login successfully
2. **Test Features**: Try using sleep tracking, wellness features
3. **Check Data**: Verify your data is still accessible
4. **Report Issues**: Let administrators know if problems persist

---

**Note**: This guide is designed to help users resolve common authentication issues. For persistent problems, contact your system administrator or development team.

