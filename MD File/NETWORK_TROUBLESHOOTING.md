# Network Troubleshooting Guide

## Overview
This guide helps you resolve connection timeout issues in the PHC Mobile app.

## Quick Fixes

### 1. Restart the App
- Close the app completely
- Reopen the app
- Try loading mission data again

### 2. Check Server Status
Ensure the backend server is running:
```bash
cd dash-app
node server.js
```

### 3. Test Network Connectivity
Run the network diagnostic script:
```bash
node scripts/test-network.js
```

## Common Issues & Solutions

### Issue: "Koneksi timeout. Silakan coba lagi."
**Symptoms:**
- App shows timeout error when loading mission data
- Network requests fail with timeout errors

**Solutions:**
1. **Check Internet Connection**
   - Ensure your device has internet access
   - Try switching between WiFi and mobile data

2. **Verify Server is Running**
   - Check if the backend server is running on port 3000
   - Look for the server process: `ps aux | grep node`

3. **Test Server Connectivity**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should return HTTP 200

4. **Check IP Configuration**
   - For physical devices, ensure they're on the same network as the server
   - The app automatically tests multiple IP addresses:
     - `192.168.193.150:3000` (fastest)
     - `192.168.18.30:3000`
     - `10.242.90.103:3000`
     - `localhost:3000` (fallback)

### Issue: Slow Response Times
**Solutions:**
1. **Use the Fastest IP Address**
   - The app automatically selects the fastest available IP
   - Check console logs for "Found working URL" messages

2. **Optimize Network Settings**
   - Move closer to WiFi router
   - Close other bandwidth-heavy applications

### Issue: Authentication Errors
**Solutions:**
1. **Clear App Data**
   - Clear app storage/cache
   - Log out and log back in

2. **Check Token Expiry**
   - The app automatically refreshes tokens
   - If issues persist, try logging out and back in

## Network Diagnostic Screen

The app includes a built-in network diagnostic screen that can help identify issues:

1. Navigate to the diagnostic screen in the app
2. Run the diagnostic test
3. Follow the recommended actions

## Development Environment

### For Android Emulator:
- Uses `10.0.2.2:3000` (special Android emulator IP)
- Ensure emulator is running and server is accessible

### For iOS Simulator:
- Uses `localhost:3000`
- Ensure simulator is running and server is accessible

### For Physical Devices:
- Automatically tests multiple IP addresses
- Prioritizes the fastest available connection
- Falls back to localhost if needed

## Server Configuration

### Backend Server:
- Runs on port 3000
- Health endpoint: `/api/health`
- Mobile API endpoint: `/api/mobile/*`

### CORS Configuration:
- Server should allow requests from mobile app
- Check server logs for CORS errors

## Debugging Steps

1. **Check Console Logs**
   - Look for network-related messages
   - Identify which IP addresses are being tested
   - Check for timeout or connection errors

2. **Monitor Network Activity**
   - Use browser dev tools to monitor requests
   - Check response times and status codes

3. **Test Individual Endpoints**
   ```bash
   # Test health endpoint
   curl http://localhost:3000/api/health
   
   # Test missions endpoint
   curl http://localhost:3000/api/mobile/missions
   ```

## Performance Optimization

### Timeout Settings:
- Request timeout: 15 seconds
- Connectivity test timeout: 5 seconds per IP
- Retry attempts: 3 with exponential backoff

### Caching:
- API responses are cached when possible
- Network status is monitored continuously

## Support

If issues persist:
1. Check the network diagnostic screen in the app
2. Run the network test script
3. Review server logs for errors
4. Ensure all network configurations are correct

## Environment Variables

The app uses different configurations based on the environment:

- **Development**: Tests multiple local IP addresses
- **Production**: Uses `https://dash.doctorphc.id`

Make sure the correct environment is set when building the app.
