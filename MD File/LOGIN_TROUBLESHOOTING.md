# 🔐 Login Troubleshooting Guide

## ✅ Current Status
- ✅ Backend server is running on localhost:3000
- ✅ Mobile login endpoint is working correctly
- ✅ Test user credentials are valid
- ✅ JWT tokens are being generated properly
- ✅ Health endpoint is responding

## 🎯 Solution

### Working Credentials
Use these credentials to login to the mobile app:
```
Email: mobile@test.com
Password: mobile123
```

### Steps to Fix Login Issues

1. **Ensure Backend is Running**
   ```bash
   cd dash-app
   npm run dev
   ```
   The server should be running on http://localhost:3000

2. **Test Backend Connection**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should return: `{"success":true,"message":"PHC Mobile API is running"}`

3. **Test Login Endpoint**
   ```bash
   curl -X POST http://localhost:3000/api/mobile/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"mobile@test.com","password":"mobile123"}'
   ```

4. **Mobile App Configuration**
   - Make sure the mobile app is running: `expo start`
   - The app should automatically detect the correct API URL
   - For iOS Simulator: uses `localhost:3000`
   - For Android Emulator: uses `10.0.2.2:3000`
   - For physical devices: uses `10.242.90.103:3000`

## 🔧 Common Issues & Solutions

### Issue 1: "Email atau password salah"
**Solution**: Use the correct credentials:
- Email: `mobile@test.com`
- Password: `mobile123`

### Issue 2: Network Connection Failed
**Solutions**:
1. Check if backend is running: `lsof -i :3000`
2. Restart backend: `cd dash-app && npm run dev`
3. Check firewall settings
4. Ensure mobile device/simulator is on the same network

### Issue 3: Timeout Errors
**Solutions**:
1. Check network connectivity
2. Increase timeout in API service
3. Try different network URLs (localhost, 127.0.0.1, machine IP)

### Issue 4: CORS Errors
**Solution**: Backend is already configured with CORS headers for mobile access

## 📱 Mobile App Testing

1. **Start the mobile app**:
   ```bash
   expo start
   ```

2. **Use the test credentials**:
   - Email: `mobile@test.com`
   - Password: `mobile123`

3. **Check console logs** for any network errors

4. **If still failing**, check:
   - Network connectivity
   - Backend server status
   - Mobile app console for specific error messages

## 🚀 Quick Fix Commands

```bash
# 1. Start backend server
cd dash-app && npm run dev

# 2. Test backend health
curl http://localhost:3000/api/health

# 3. Test login
curl -X POST http://localhost:3000/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mobile@test.com","password":"mobile123"}'

# 4. Start mobile app
expo start
```

## 📊 Test Results
- ✅ Health endpoint: Working
- ✅ Login endpoint: Working
- ✅ Token generation: Working
- ✅ Token validation: Working
- ✅ Multiple network URLs: Working (except 10.0.2.2 which is Android emulator specific)

## 🎉 Expected Outcome
After following these steps, you should be able to login successfully to the mobile app using the provided credentials.
