# 🔐 Login Troubleshooting Guide

## Issue: "Invalid credentials" error when trying to login

### ✅ What I've Fixed

1. **Fixed test credentials mismatch**: Updated `john@example.com` to `john.doe@example.com` in LoginScreen
2. **Updated API configuration**: Set the correct IP address for physical device testing
3. **Added debugging logs**: Enhanced error logging to help identify issues
4. **Verified backend functionality**: Confirmed the backend is working correctly

### 🧪 Test Credentials

Use these credentials to test login:

- **John Doe**: `john.doe@example.com` / `password123`
- **Jane Smith**: `jane.smith@example.com` / `password123`
- **Admin User**: `admin@phc.com` / `password123`

### 🔧 API Configuration

The API is now configured to use:
- **iOS Simulator**: `http://localhost:5432/api`
- **Android Emulator**: `http://10.0.2.2:5432/api`
- **Physical Device**: `http://192.168.18.30:5432/api`

### 🚀 How to Test

1. **Restart your React Native app** to pick up the new configuration
2. **Use the test credentials** from the login screen (tap the test credential buttons)
3. **Check the console logs** for debugging information

### 🔍 Debugging Steps

If you still get "Invalid credentials":

1. **Check the console logs** for:
   - `🔐 Attempting login with:` - Shows the email and API URL being used
   - `🏥 Health check response:` - Shows if the server is reachable
   - `❌ Login failed:` - Shows detailed error information

2. **Verify network connectivity**:
   ```bash
   node scripts/test-api-connection.js
   ```

3. **Test the API directly**:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"email":"john.doe@example.com","password":"password123"}' \
     http://192.168.18.30:5432/api/auth/login
   ```

### 📱 Platform-Specific Notes

- **iOS Simulator**: Should work with `localhost`
- **Android Emulator**: Should work with `10.0.2.2`
- **Physical Device**: Must use your computer's IP address (currently set to `192.168.18.30`)

### 🔄 If Still Not Working

1. **Check if you're on the same network** as your development machine
2. **Try a different IP address** from the test results:
   - `10.242.90.103`
   - `192.168.193.150`
3. **Restart the backend server**:
   ```bash
   cd backend
   npm run dev
   ```
4. **Clear React Native cache**:
   ```bash
   npx react-native start --reset-cache
   ```

### 📞 Support

If the issue persists, please provide:
1. The console logs from the login attempt
2. Your device/platform (iOS/Android, simulator/physical)
3. The network you're connected to 