# 🔧 Development Mode Setup - PHC Mobile App

## 📋 Overview

Dokumen ini menjelaskan cara mengatur dan memastikan aplikasi PHC Mobile berjalan dalam mode development dengan server lokal.

## ✅ Status Saat Ini

**Aplikasi sudah dalam mode DEVELOPMENT** ✅

- ✅ **Mode**: Development
- ✅ **Server**: http://localhost:3000
- ✅ **API Endpoint**: http://localhost:3000/api/mobile
- ✅ **Database**: Connected dan functional
- ✅ **Test User**: Available (test@mobile.com / password123)

## 🔧 Konfigurasi Development

### 1. **API Configuration** (`src/services/api.js`)

```javascript
// Server URL Configuration
const getServerURL = () => {
  // Force development mode - always use localhost
  console.log('🔧 Development mode: Using localhost server');
  return "localhost";
};

// API Base URL Configuration
const getApiBaseUrl = () => {
  // Force development mode - always use localhost
  console.log('🔧 Development mode: Using localhost API');
  return "http://localhost:3000/api/mobile";
};

// Best API URL Configuration
const getBestApiUrl = async () => {
  // Force development mode - always use localhost
  console.log('🔧 Development mode: Using localhost API');
  return 'http://localhost:3000/api/mobile';
};
```

### 2. **Environment Configuration** (`.env.development`)

```bash
# Development Environment Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_APP_VERSION=1.0.0

# Development API endpoints
EXPO_PUBLIC_MOBILE_API=http://localhost:3000/api/mobile
EXPO_PUBLIC_WEB_API=http://localhost:3000/api

# Development settings
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
```

### 3. **Database Configuration** (`dash-app/.env.local`)

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=pr1k1t1w
DB_NAME=phc_dashboard
DB_PORT=3306
JWT_SECRET=supersecretkey123456789supersecretkey123456789
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🚀 Cara Menjalankan Development Mode

### 1. **Start Backend Server**
```bash
cd dash-app
npm run dev
```

**Expected Output:**
```
✅ Database pool created successfully
🔗 New database connection established
📥 Connection acquired from pool
📤 Connection released back to pool
```

### 2. **Start Mobile Development Server**
```bash
# Di terminal baru
npx expo start --clear
```

**Expected Output:**
```
🔧 Development mode: Using localhost API
🔧 Development mode: Using localhost server
✅ API: Service initialized successfully
```

### 3. **Test Connection**
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "PHC Mobile API is running",
  "timestamp": "2025-08-24T16:30:31.028Z",
  "version": "1.0.0"
}
```

## 🧪 Testing Development Mode

### 1. **Login Test**
```bash
curl -X POST http://localhost:3000/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mobile.com","password":"password123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 2,
      "name": "Test User",
      "email": "test@mobile.com",
      "role": "MOBILE_USER"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 2. **Missions Test**
```bash
curl http://localhost:3000/api/mobile/missions
```

**Expected Response:**
```json
{
  "success": true,
  "data": [15 missions available]
}
```

### 3. **Clinics Test**
```bash
curl http://localhost:3000/api/mobile/clinics
```

**Expected Response:**
```json
{
  "success": true,
  "data": [12 clinics available]
}
```

## 🔄 Switching Between Modes

### Switch to Development Mode
```bash
node scripts/switch-to-development.js
```

### Switch to Production Mode
```bash
node scripts/switch-to-production.js
```

### Check Current Mode
```bash
node scripts/switch-to-development.js --check
```

## 📱 Mobile App Development

### 1. **Development Build**
```bash
npx expo start --dev-client
```

### 2. **Clear Cache and Restart**
```bash
npx expo start --clear
```

### 3. **Development Client**
```bash
npx expo run:android --variant debug
# atau
npx expo run:ios --variant debug
```

## 🔍 Troubleshooting

### Issue: "Network request failed"

**Solution 1: Check Backend Server**
```bash
cd dash-app
npm run dev
```

**Solution 2: Check Database Connection**
```bash
cd dash-app
node test-db-connection.js
```

**Solution 3: Clear Mobile Cache**
```bash
npx expo start --clear
```

### Issue: "Cannot connect to localhost"

**Solution 1: Check Server Status**
```bash
curl http://localhost:3000/api/health
```

**Solution 2: Check Port Availability**
```bash
lsof -i :3000
```

**Solution 3: Restart Development Server**
```bash
# Stop server (Ctrl+C)
cd dash-app
npm run dev
```

### Issue: "Database connection failed"

**Solution 1: Check MySQL Service**
```bash
mysql -u root -ppr1k1t1w -e "SELECT 1;"
```

**Solution 2: Check Database Configuration**
```bash
cd dash-app
cat .env.local
```

**Solution 3: Test Database Connection**
```bash
cd dash-app
node test-db-connection.js
```

## 📊 Development Features

### ✅ Available in Development Mode
- 🔧 **Debug Logging**: Enhanced console logs
- 🧪 **Test Users**: Pre-configured test accounts
- 📊 **Sample Data**: Fallback data for testing
- 🔄 **Hot Reload**: Automatic app refresh
- 🐛 **Error Details**: Detailed error messages
- 📱 **Development Client**: Expo development client

### ❌ Disabled in Development Mode
- 🚀 **Production Server**: No production fallback
- 🔒 **Rate Limiting**: Reduced for testing
- 📊 **Analytics**: Disabled for privacy
- 🔐 **Security**: Relaxed for development

## 🎯 Development Workflow

### 1. **Daily Development**
```bash
# Terminal 1: Backend
cd dash-app
npm run dev

# Terminal 2: Mobile
npx expo start --clear
```

### 2. **Testing Changes**
```bash
# Test API endpoints
curl http://localhost:3000/api/health

# Test mobile app
# Use Expo Go or development client
```

### 3. **Database Changes**
```bash
# Test database connection
cd dash-app
node test-db-connection.js

# Create test users
cd dash-app
node create-test-user.js
```

## 📝 Notes

### Development Mode Indicators
- Console logs show: `🔧 Development mode: Using localhost API`
- Server URL: `http://localhost:3000`
- Debug mode: Enabled
- Test users: Available

### Production Mode Indicators
- Console logs show: `🚀 Production mode: Using production API`
- Server URL: `https://dash.doctorphc.id`
- Debug mode: Disabled
- Test users: Hidden

## ✅ Summary

**Status:** ✅ **DEVELOPMENT MODE ACTIVE**

- ✅ Application configured for development
- ✅ Server running on localhost:3000
- ✅ Database connected and functional
- ✅ Test user available
- ✅ All endpoints working
- ✅ Development features enabled

Aplikasi PHC Mobile sekarang berjalan dalam mode development dan siap untuk development dan testing.

---

**Last Updated:** 2025-08-24  
**Status:** ✅ **DEVELOPMENT MODE CONFIGURED**
