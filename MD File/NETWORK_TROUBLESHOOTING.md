# 🌐 Network Troubleshooting Guide

This guide helps resolve "Network request failed" errors in the PHC Mobile app.

## 🔍 Quick Diagnosis

### 1. Check Server Status
```bash
# In the dash-app directory
cd dash-app
npm run dev
```

The server should start on `http://localhost:3000`

### 2. Test Server Connectivity
```bash
curl http://localhost:3000/api/mobile/auth/me
```

Expected response: `{"success":false,"message":"Authorization header required"}`

### 3. Check Available IP Addresses
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## 🛠️ Common Solutions

### Issue 1: Server Not Running
**Symptoms**: All endpoints fail with "Network request failed"

**Solution**:
1. Navigate to `dash-app` directory
2. Run `npm run dev`
3. Verify server starts on port 3000

### Issue 2: Wrong IP Address
**Symptoms**: Some endpoints work, others don't

**Solution**:
1. Update IP addresses in `src/utils/networkHelper.js`
2. Update IP addresses in `src/services/api.js`
3. Use your computer's actual IP address

### Issue 3: Firewall Blocking
**Symptoms**: Server running but mobile app can't connect

**Solution**:
1. Check macOS firewall settings
2. Allow incoming connections on port 3000
3. Temporarily disable firewall for testing

### Issue 4: Network Configuration
**Symptoms**: Works on simulator but not on physical device

**Solution**:
- **Android Emulator**: Use `10.0.2.2:3000`
- **iOS Simulator**: Use `localhost:3000`
- **Physical Device**: Use computer's IP address

## 📱 Platform-Specific Configuration

### Android
```javascript
// In src/services/api.js
if (Platform.OS === "android") {
  return "http://10.0.2.2:3000/api/mobile"; // Emulator
  // or
  return "http://YOUR_COMPUTER_IP:3000/api/mobile"; // Physical device
}
```

### iOS
```javascript
// In src/services/api.js
if (Platform.OS === "ios") {
  return "http://localhost:3000/api/mobile"; // Simulator
  // or
  return "http://YOUR_COMPUTER_IP:3000/api/mobile"; // Physical device
}
```

## 🔧 Debug Tools

### 1. Network Diagnostic Screen
Use the `NetworkTestScreen` to test connectivity:
- Run network diagnostic
- Test registration
- Test login
- View detailed results

### 2. Console Logs
Check console output for:
- `🔍 Testing connectivity to:`
- `✅ Network test successful`
- `❌ Network test failed`

### 3. API Service Logs
Look for:
- `🚀 API Service initialized with URL:`
- `🔍 Attempting registration to:`
- `📥 Registration response status:`

## 📋 Troubleshooting Checklist

- [ ] Server is running on port 3000
- [ ] Server responds to curl test
- [ ] IP addresses are correct
- [ ] Firewall allows port 3000
- [ ] Device and computer on same network
- [ ] Using correct IP for platform (emulator vs physical)
- [ ] Network diagnostic passes
- [ ] Registration test succeeds

## 🚨 Emergency Solutions

### If Nothing Works:

1. **Restart Everything**:
   ```bash
   # Stop server
   Ctrl+C in dash-app terminal
   
   # Restart server
   cd dash-app && npm run dev
   
   # Restart mobile app
   npx expo start --clear
   ```

2. **Use Localhost Only**:
   ```javascript
   // Temporarily force localhost
   return "http://localhost:3000/api/mobile";
   ```

3. **Check Network Interface**:
   ```bash
   # Find your computer's IP
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Test each IP
   for ip in $(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'); do
     echo "Testing $ip:3000"
     curl -s --connect-timeout 5 http://$ip:3000/api/mobile/auth/me && echo " - OK" || echo " - FAILED"
   done
   ```

## 📞 Getting Help

If you're still having issues:

1. Run the Network Diagnostic Screen
2. Check console logs for error details
3. Verify server is running and accessible
4. Test with curl commands
5. Check network configuration

## 🔄 Recent Updates

- Updated IP addresses to match current network configuration
- Added comprehensive network diagnostic tool
- Improved error handling with detailed logging
- Created NetworkTestScreen for debugging
- Enhanced API service with better error reporting 