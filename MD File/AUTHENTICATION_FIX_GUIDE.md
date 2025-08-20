# 🔐 Authentication Fix Guide

## 🚨 Problem Description

You're experiencing repeated "Authentication failed. Please login again." errors when loading weekly progress data. This is caused by expired JWT tokens that need to be refreshed or cleared.

## 🛠️ Quick Fix Solutions

### Option 1: Using the Debug Screen (Recommended)

1. **Navigate to Debug Screen**:
   - In your app, navigate to the Debug screen
   - If you can't find it, try going to Profile → About App → Debug (if available)

2. **Use Debug Tools**:
   - Tap "Check & Fix Auth Issues" first
   - If that doesn't work, tap "Clear Auth Data"
   - Login again with your credentials

### Option 2: Using React Native Debugger

1. **Open React Native Debugger Console**
2. **Run these commands**:
   ```javascript
   // Check current auth status
   require('./src/utils/authFix.js').default.debugAuth()
   
   // Clear authentication data
   require('./src/utils/authFix.js').default.clearAuth()
   
   // Force re-login
   require('./src/utils/authFix.js').default.forceReLogin()
   ```

### Option 3: Using the Command Line Script

1. **Run the fix script**:
   ```bash
   node scripts/fix-auth.js
   ```

2. **Follow the interactive prompts**

### Option 4: Manual Fix (Last Resort)

1. **Close the app completely**
2. **Clear app data from device settings**:
   - iOS: Settings → General → iPhone Storage → PHC Mobile → Delete App
   - Android: Settings → Apps → PHC Mobile → Storage → Clear Data
3. **Reinstall the app**
4. **Login again with your credentials**

## 🔍 Understanding the Issue

### Root Causes

1. **Expired JWT Tokens**: Your authentication tokens have expired (typically after 30-90 days)
2. **Token Refresh Failure**: The automatic token refresh mechanism failed
3. **Multiple API Calls**: Several components are trying to load data simultaneously, causing repeated authentication failures

### Error Pattern

```
ERROR  Error loading weekly progress: [Error: Authentication failed. Please login again.]
LOG  🔐 Authentication error detected in weekly progress loading
```

This pattern repeats because:
- Multiple components (WeeklySummaryCard, TodaySummaryCard, etc.) are loading data
- Each component encounters the same authentication error
- The error handling system processes each error separately

## 🛠️ Technical Details

### Authentication Flow

1. **Token Storage**: JWT tokens are stored in AsyncStorage
2. **Token Validation**: Tokens are validated before API calls
3. **Token Refresh**: Expired tokens should be automatically refreshed
4. **Error Handling**: Authentication errors trigger logout and re-login

### Files Involved

- `src/contexts/AuthContext.tsx` - Main authentication logic
- `src/services/api.js` - API service with token handling
- `src/utils/errorHandler.ts` - Error handling utilities
- `src/utils/authFix.js` - Authentication fix utilities
- `src/screens/DebugScreen.tsx` - Debug interface

## 🔧 Prevention

### For Developers

1. **Implement Better Token Refresh**:
   ```javascript
   // In api.js - enhance token refresh logic
   async refreshAccessToken() {
     try {
       const refreshToken = await AsyncStorage.getItem('refreshToken');
       if (!refreshToken) throw new Error('No refresh token');
       
       const response = await fetch(`${this.baseURL}/auth/refresh`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ refreshToken })
       });
       
       if (response.ok) {
         const data = await response.json();
         await AsyncStorage.setItem('authToken', data.accessToken);
         return data.accessToken;
       }
     } catch (error) {
       throw new Error('Token refresh failed');
     }
   }
   ```

2. **Add Request Debouncing**:
   ```javascript
   // Prevent multiple simultaneous auth requests
   let authRequestInProgress = false;
   
   async function makeAuthenticatedRequest() {
     if (authRequestInProgress) {
       await new Promise(resolve => setTimeout(resolve, 1000));
     }
     authRequestInProgress = true;
     try {
       // Make request
     } finally {
       authRequestInProgress = false;
     }
   }
   ```

### For Users

1. **Regular Login**: Login regularly to refresh tokens
2. **Stable Connection**: Ensure stable internet connection
3. **App Updates**: Keep the app updated to latest version

## 📞 Support

If the above solutions don't work:

1. **Check Backend**: Ensure the backend server is running
2. **Network**: Verify internet connectivity
3. **Credentials**: Try logging in with different credentials
4. **Device**: Test on a different device if possible

## 🔄 Recovery Steps

After fixing the authentication:

1. **Verify Login**: Ensure you can login successfully
2. **Test Features**: Try accessing weekly progress and other features
3. **Monitor Logs**: Watch for any remaining authentication errors
4. **Report Issues**: If problems persist, report with detailed logs

---

**Note**: This guide addresses the immediate authentication issues. For long-term stability, consider implementing the prevention measures listed above.
