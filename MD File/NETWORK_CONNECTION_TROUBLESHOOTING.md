# 🔧 Network Connection Troubleshooting Guide

Panduan lengkap untuk mengatasi masalah koneksi jaringan pada aplikasi PHC Mobile.

## 📋 Daftar Isi

1. [Quick Fix](#quick-fix)
2. [Diagnosis Steps](#diagnosis-steps)
3. [Common Issues](#common-issues)
4. [Solutions](#solutions)
5. [Testing Tools](#testing-tools)
6. [Prevention](#prevention)

## 🚀 Quick Fix

Jika Anda mengalami error "Network connection failed", coba langkah-langkah berikut:

### 1. Restart Server
```bash
# Hentikan server yang berjalan
lsof -ti:3000 | xargs kill -9

# Jalankan server baru
cd dash-app
npm run dev
```

### 2. Test Connection
```bash
# Test koneksi dari terminal
curl http://localhost:3000/api/mobile/auth/me

# Atau gunakan script otomatis
./setup-sh/fix-connection.sh
```

### 3. Restart Mobile App
- Tutup aplikasi mobile
- Buka kembali aplikasi
- Coba login/register

## 🔍 Diagnosis Steps

### Step 1: Check Server Status
```bash
# Cek apakah server berjalan
lsof -i :3000

# Test koneksi lokal
curl -s http://localhost:3000/api/mobile/auth/me
```

### Step 2: Check Network Interfaces
```bash
# Lihat IP addresses yang tersedia
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Step 3: Test All Endpoints
```bash
# Jalankan test koneksi mobile
node scripts/test-mobile-connection.js
```

### Step 4: Check Mobile App Logs
- Buka developer tools di aplikasi mobile
- Lihat console logs untuk error messages
- Cek network requests di browser developer tools

## ❌ Common Issues

### 1. Server Not Running
**Symptoms:**
- Error: "Network connection failed"
- All endpoints return connection refused

**Solution:**
```bash
cd dash-app
npm run dev
```

### 2. Wrong IP Address
**Symptoms:**
- Some endpoints work, others don't
- Mobile app can't reach server

**Solution:**
- Update IP addresses in `src/services/api.js`
- Use the connection test script to find best endpoint

### 3. Network Connectivity
**Symptoms:**
- Mobile device not on same network
- Firewall blocking connections

**Solution:**
- Ensure mobile device is on same WiFi network
- Check firewall settings
- Try different network interfaces

### 4. Port Conflicts
**Symptoms:**
- Server won't start
- "Address already in use" error

**Solution:**
```bash
# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9

# Start server again
cd dash-app && npm run dev
```

## 🛠️ Solutions

### Solution 1: Update API Configuration

Edit `src/services/api.js` to use the correct IP addresses:

```javascript
const getApiBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3000/api/mobile";
    }
    if (Platform.OS === "ios") {
      return "http://192.168.1.11:3000/api/mobile"; // Update this IP
    }
    return "http://192.168.1.11:3000/api/mobile"; // Update this IP
  }
  return "https://your-api-domain.com/api/mobile";
};
```

### Solution 2: Use Network Diagnostic

The app now includes automatic network diagnostics:

```javascript
// The API service will automatically find the best endpoint
const apiService = new ApiService();
await apiService.initialize(); // This will test all endpoints
```

### Solution 3: Manual Network Test

Run the network test script:

```bash
node scripts/test-mobile-connection.js
```

### Solution 4: Reset Mobile App

1. Clear app cache
2. Restart the app
3. Try logging in again

## 🧪 Testing Tools

### 1. Connection Test Script
```bash
node scripts/test-mobile-connection.js
```

### 2. Server Status Check
```bash
./setup-sh/fix-connection.sh
```

### 3. Network Diagnostic
```bash
# Test all endpoints
curl -s http://localhost:3000/api/mobile/auth/me
curl -s http://192.168.1.11:3000/api/mobile/auth/me
curl -s http://10.242.90.103:3000/api/mobile/auth/me
```

### 4. Mobile App Network Test
The app includes built-in network testing:

```javascript
import NetworkTest from '../utils/networkTest';

// Test all endpoints
const results = await NetworkTest.testAllEndpoints();

// Find best endpoint
const bestEndpoint = await NetworkTest.findBestEndpoint();

// Run full diagnostic
const diagnostic = await NetworkTest.diagnoseMobileConnection();
```

## 🔧 Error Messages & Solutions

### "Network connection failed"
- **Cause**: Server not running or unreachable
- **Solution**: Start server with `npm run dev` in dash-app directory

### "Authorization header required"
- **Cause**: Server is working, but no auth token
- **Solution**: This is normal for unauthenticated requests

### "Connection timeout"
- **Cause**: Network too slow or server overloaded
- **Solution**: Check network speed, restart server

### "Address already in use"
- **Cause**: Another process using port 3000
- **Solution**: Kill existing process with `lsof -ti:3000 | xargs kill -9`

## 📱 Platform-Specific Issues

### Android
- **Emulator**: Use `10.0.2.2:3000`
- **Physical Device**: Use your computer's IP address
- **Common Issue**: Device not on same network

### iOS
- **Simulator**: Use `localhost:3000`
- **Physical Device**: Use your computer's IP address
- **Common Issue**: Network security settings

## 🚀 Prevention

### 1. Use Automatic Network Detection
The app now automatically finds the best endpoint:

```javascript
// API service will automatically test all endpoints
await apiService.initialize();
```

### 2. Monitor Server Status
```bash
# Check if server is running
ps aux | grep "npm run dev"

# Monitor server logs
tail -f backend.log
```

### 3. Regular Network Testing
```bash
# Run network test regularly
node scripts/test-mobile-connection.js
```

### 4. Keep IP Addresses Updated
Update IP addresses in `src/services/api.js` when network changes.

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look at console output for detailed error messages
2. **Run diagnostics**: Use the provided test scripts
3. **Check network**: Ensure mobile device is on same network as server
4. **Restart everything**: Server, mobile app, and network devices

## 🔄 Quick Commands

```bash
# Start server
cd dash-app && npm run dev

# Test connection
node scripts/test-mobile-connection.js

# Fix connection issues
./setup-sh/fix-connection.sh

# Check server status
lsof -i :3000

# Kill server
lsof -ti:3000 | xargs kill -9
```

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: PHC Mobile Team 