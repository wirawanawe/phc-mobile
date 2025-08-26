# 🔧 API Configuration Fix - Development Mode

## 🚨 Problem Identified
Aplikasi mobile mengarah ke server production (`dash.doctorphc.id`) dan tidak bisa login karena:
1. Server production tidak memiliki user test yang valid
2. Konfigurasi API menggunakan IP address yang tidak sesuai untuk development
3. Aplikasi tidak konsisten dalam menggunakan localhost untuk development

## ✅ Fixes Applied

### 1. Fixed Quick API URL Configuration
**File:** `src/utils/quickFix.js`
```javascript
// Before: Platform-specific URLs that could point to production
if (Platform.OS === 'ios') {
  return 'http://localhost:3000/api/mobile';
} else if (Platform.OS === 'android') {
  return 'http://10.0.2.2:3000/api/mobile';
} else {
  return 'http://10.242.90.103:3000/api/mobile'; // Could fail and fallback to production
}

// After: Always use localhost for development
if (__DEV__) {
  console.log('🔧 Development mode: Using localhost API');
  return 'http://localhost:3000/api/mobile';
}
```

### 2. Simplified Best API URL Logic
**File:** `src/services/api.js`
```javascript
// Before: Complex URL testing logic that could select production
const getBestApiUrl = async () => {
  // Complex testing of multiple URLs including production fallback
  const possibleUrls = [
    "http://localhost:3000/api/mobile",
    "http://10.0.2.2:3000/api/mobile", 
    "http://10.242.90.103:3000/api/mobile",
    "https://dash.doctorphc.id/api/mobile"  // Production fallback
  ];
  // ... testing logic
};

// After: Simple, direct localhost for development
const getBestApiUrl = async () => {
  if (__DEV__) {
    console.log('🔧 Development mode: Using localhost API');
    return 'http://localhost:3000/api/mobile';
  }
  console.log('🚀 Production mode: Using production API');
  return 'https://dash.doctorphc.id/api/mobile';
};
```

### 3. Consistent API Base URL
**File:** `src/services/api.js`
```javascript
// Updated comment for clarity
const getApiBaseUrl = () => {
  // For development - always use localhost
  if (__DEV__) {
    console.log('🔧 Development mode: Using localhost API');
    return "http://localhost:3000/api/mobile";
  }
  // For production - use production server
  console.log('🚀 Production mode: Using production API');
  return "https://dash.doctorphc.id/api/mobile";
};
```

## 🎯 Result
- ✅ Aplikasi sekarang selalu menggunakan `localhost:3000` untuk development
- ✅ Tidak ada lagi fallback ke server production
- ✅ Konsistensi dalam konfigurasi API
- ✅ Logging yang jelas untuk debugging

## 📱 How to Apply the Fix

### Option 1: Restart with Script
```bash
./restart-mobile-app.sh
```

### Option 2: Manual Restart
```bash
# Stop existing Expo processes
pkill -f "expo start"

# Clear cache and restart
npx expo start --clear
```

## 🔍 Verification

### 1. Check Backend is Running
```bash
curl http://localhost:3000/api/health
# Should return: {"success":true,"message":"PHC Mobile API is running"}
```

### 2. Test Login Endpoint
```bash
curl -X POST http://localhost:3000/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mobile@test.com","password":"mobile123"}'
# Should return successful login response
```

### 3. Check Mobile App Console
Look for these log messages:
```
🔧 Development mode: Using localhost API
🔧 API: Using quick fix URL: http://localhost:3000/api/mobile
```

## 🎉 Expected Outcome
- Aplikasi mobile akan terhubung ke `localhost:3000` untuk development
- Login akan berhasil dengan kredensial: `mobile@test.com` / `mobile123`
- Tidak ada lagi error koneksi ke server production
- Console akan menampilkan log yang jelas tentang mode yang digunakan

## 📋 Test Credentials
```
Email: mobile@test.com
Password: mobile123
```

## 🔧 Troubleshooting
Jika masih mengalami masalah:
1. Pastikan backend server berjalan: `cd dash-app && npm run dev`
2. Restart aplikasi mobile dengan cache clear: `npx expo start --clear`
3. Periksa console log untuk memastikan menggunakan localhost
4. Test koneksi manual dengan curl commands di atas
