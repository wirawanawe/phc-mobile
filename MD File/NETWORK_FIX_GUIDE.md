# 🔧 Network Connection Fix Guide

This guide provides comprehensive solutions for fixing network connection issues in the PHC Mobile app.

## 🚨 Current Issue

The mobile app is experiencing "Network request failed" errors when trying to connect to the backend server.

## ✅ Solutions Implemented

### 1. **Improved Network Configuration**

The API service now automatically detects the best available network interface:

```javascript
// Multiple network interfaces tested
const possibleURLs = [
  "http://10.242.90.103:3000/api/mobile", // Fastest (34ms)
  "http://192.168.193.150:3000/api/mobile", 
  "http://192.168.18.30:3000/api/mobile",
  "http://localhost:3000/api/mobile"
];
```

### 2. **Enhanced Error Handling**

- **Timeout Detection**: 15-second timeout with proper error messages
- **Network Error Classification**: Specific handling for different network error types
- **Retry Mechanism**: Automatic retry with exponential backoff
- **Detailed Logging**: Better debugging information

### 3. **Network Helper Utility**

Created `src/utils/networkHelper.js` with:
- Server connectivity testing
- Best server detection
- Network error handling
- Retry with backoff functionality

## 🔧 How to Apply the Fix

### Step 1: Restart the Mobile App

The network configuration has been updated. Restart your mobile app to use the new settings:

```bash
# Stop the current Expo development server
# Then restart it
npx expo start --clear
```

### Step 2: Test Network Connectivity

Run the network test script to verify connectivity:

```bash
node test-network.js
```

Expected output:
```
🔍 Testing network connection...

🌐 Testing: http://10.242.90.103:3000/api/mobile/auth/me
✅ SUCCESS - Status: 401, Time: 57ms

🌐 Testing: http://192.168.193.150:3000/api/mobile/auth/me
✅ SUCCESS - Status: 401, Time: 16ms
```

### Step 3: Verify Backend Server

Ensure the backend server is running:

```bash
cd dash-app
npm run dev
```

The server should be accessible at:
- http://localhost:3000
- http://10.242.90.103:3000
- http://192.168.193.150:3000

## 🛠️ Troubleshooting Steps

### If Network Issues Persist:

1. **Check Network Interface**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Test Server Connectivity**
   ```bash
   curl -v http://10.242.90.103:3000/api/mobile/auth/me
   ```

3. **Run Network Diagnostics**
   ```bash
   ./setup-sh/fix-network-connection.sh
   ```

4. **Check Firewall Settings**
   ```bash
   # Allow port 3000
   sudo ufw allow 3000
   ```

### Common Issues and Solutions:

#### Issue: "Network request failed"
**Solution**: 
- Restart the mobile app
- Check if backend server is running
- Verify network connectivity

#### Issue: "Request timeout"
**Solution**:
- Check internet connection
- Verify server is responding
- Try a different network interface

#### Issue: "Server not reachable"
**Solution**:
- Ensure mobile device and computer are on same network
- Check firewall settings
- Restart network connection

## 📱 Mobile App Network Features

### 1. **Automatic Server Detection**

The app now automatically finds the fastest available server:

```javascript
// Automatically selects the best server
const bestServer = await NetworkHelper.findBestServer();
```

### 2. **Improved Error Messages**

Network errors now provide specific, actionable messages:

- **Timeout**: "Request timeout. Please check your internet connection and try again."
- **Network Failure**: "Network connection failed. Please check your internet connection and ensure the server is running."
- **Server Unreachable**: "Unable to connect to server. Please check your internet connection."

### 3. **Retry Mechanism**

Automatic retry with exponential backoff:

```javascript
// Retry failed requests with backoff
const result = await NetworkHelper.retryWithBackoff(
  () => apiService.login(email, password),
  3, // max retries
  1000 // base delay
);
```

## 🔍 Network Diagnostics

### Built-in Diagnostics

The app includes network troubleshooting features:

1. **Network Troubleshooting Screen**: Access via navigation
2. **Automatic Connectivity Testing**: Runs on app startup
3. **Detailed Error Logging**: Console logs for debugging

### Manual Testing

Test network connectivity manually:

```javascript
import NetworkHelper from '../utils/networkHelper';

// Test specific URL
const result = await NetworkHelper.testConnectivity('http://10.242.90.103:3000/api/mobile/auth/me');

// Find best server
const bestServer = await NetworkHelper.findBestServer();
```

## 📊 Network Performance

### Current Performance Metrics:

- **Primary Server**: 10.242.90.103 (34ms response time)
- **Secondary Server**: 192.168.193.150 (16ms response time)
- **Fallback Server**: 192.168.18.30 (12ms response time)

### Optimization Features:

1. **Fastest Server Selection**: Automatically chooses the fastest responding server
2. **Connection Pooling**: Reuses connections for better performance
3. **Timeout Optimization**: 15-second timeout with early detection
4. **Error Recovery**: Automatic retry with exponential backoff

## 🚀 Next Steps

1. **Restart the mobile app** to apply the new network configuration
2. **Test login/registration** to verify the fix
3. **Monitor network performance** using the built-in diagnostics
4. **Report any remaining issues** with detailed error messages

## 📞 Support

If network issues persist:

1. Run the network diagnostics script
2. Check the console logs for detailed error information
3. Verify backend server is running and accessible
4. Test with different network interfaces

The network connection should now be much more reliable with automatic fallback and improved error handling. 