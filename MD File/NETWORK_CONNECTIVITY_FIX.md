# 🌐 Network Connectivity Fix - Today Summary API

## 🐛 **Problem Description**
**Error:** `Network request failed` when calling `/tracking/today-summary` API endpoint
```
ERROR  🌐 API Request (/tracking/today-summary) Error: {
  "originalError": "Network request failed", 
  "retryDelay": 5000, 
  "shouldRetry": true, 
  "type": "SERVER_UNREACHABLE", 
  "userMessage": "Tidak dapat terhubung ke server. Server mungkin sedang dalam pemeliharaan atau ada masalah koneksi."
}
```

## 🔍 **Root Cause Analysis**

### 1. **Server Not Running**
- The Next.js development server was not running on port 3000
- Mobile app couldn't connect to any server endpoint

### 2. **Incorrect IP Address Configuration**
- Mobile app was trying to connect to `localhost:3000`
- Physical devices and emulators cannot reach `localhost` on the development machine
- Need to use the machine's actual IP address: `10.242.90.103`

### 3. **CORS and External Access Issues**
- Next.js development server wasn't properly configured for external access
- Missing CORS headers for cross-origin requests

## ✅ **Solutions Implemented**

### 1. **Fixed Server Configuration**
**File:** `dash-app/server.js`

**Changes:**
```javascript
// Added CORS headers for external access
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

// Handle preflight requests
if (req.method === 'OPTIONS') {
  res.writeHead(200);
  res.end();
  return;
}
```

### 2. **Updated API URL Configuration**
**File:** `src/utils/quickFix.js`

**Changes:**
```javascript
// For physical devices - use machine IP address
return 'http://10.242.90.103:3000/api/mobile';
```

**File:** `src/services/api.js`

**Changes:**
```javascript
const possibleUrls = Platform.OS === "android" ? [
  "http://localhost:3000/api/mobile",      // Try localhost first
  "http://10.0.2.2:3000/api/mobile",       // Fallback to emulator IP
  "http://10.242.90.103:3000/api/mobile",  // Machine IP for physical devices
  "https://dash.doctorphc.id/api/mobile"   // Production fallback
] : [
  "http://localhost:3000/api/mobile",      // Localhost for iOS simulator
  "http://10.242.90.103:3000/api/mobile",  // Machine IP for physical devices
  "https://dash.doctorphc.id/api/mobile"   // Production fallback
];
```

### 3. **Created Server Startup Script**
**File:** `setup-sh/start-server.sh`

**Usage:**
```bash
./setup-sh/start-server.sh
```

## 🧪 **Testing Results**

### ✅ **Server Health Check**
```bash
curl -X GET "http://10.242.90.103:3000/api/health"
```
**Response:**
```json
{
  "success": true,
  "message": "PHC Mobile API is running",
  "timestamp": "2025-08-23T12:40:23.204Z",
  "version": "1.0.0"
}
```

### ✅ **Today Summary API**
```bash
curl -X GET "http://10.242.90.103:3000/api/mobile/tracking/today-summary?user_id=1"
```
**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-08-23",
    "water": {
      "total_ml": "1600",
      "target_ml": 2000,
      "percentage": 80
    },
    "sleep": {
      "hours": 7,
      "minutes": 30,
      "total_hours": 7.5,
      "quality": "good",
      "target_hours": 8,
      "percentage": 93.75
    },
    "mood": {
      "mood": "neutral",
      "energy_level": null
    },
    "health_data": [...],
    "meal": {
      "calories": "738.00",
      "protein": "44.40",
      "carbs": "52.30",
      "fat": "42.70",
      "meal_count": 4
    },
    "fitness": {
      "exercise_minutes": "135",
      "steps": "13000",
      "distance_km": "15.00"
    }
  }
}
```

## 🚀 **How to Use**

### 1. **Start the Server**
```bash
# Option 1: Use the script
./setup-sh/start-server.sh

# Option 2: Manual start
cd dash-app
npm run dev
```

### 2. **Verify Server is Running**
```bash
# Check if server is listening on port 3000
lsof -i :3000

# Test health endpoint
curl -X GET "http://10.242.90.103:3000/api/health"
```

### 3. **Mobile App Connection**
- The mobile app will automatically detect and use the correct IP address
- For physical devices: `http://10.242.90.103:3000/api/mobile`
- For iOS Simulator: `http://localhost:3000/api/mobile`
- For Android Emulator: `http://10.0.2.2:3000/api/mobile`

## 📱 **Mobile App Configuration**

The mobile app now automatically:
1. Tests multiple URLs to find the best connection
2. Uses the correct IP address based on platform
3. Falls back to production server if local server is unavailable
4. Handles network errors gracefully with retry logic

## 🔧 **Troubleshooting**

### If server won't start:
1. Check if port 3000 is already in use: `lsof -i :3000`
2. Kill existing processes: `pkill -f "node server.js"`
3. Restart the server: `./setup-sh/start-server.sh`

### If mobile app still can't connect:
1. Verify server is running: `curl http://10.242.90.103:3000/api/health`
2. Check firewall settings on your machine
3. Ensure mobile device is on the same network
4. Try using the production server: `https://dash.doctorphc.id/api/mobile`

## ✅ **Status**
- ✅ Server running on `http://10.242.90.103:3000`
- ✅ CORS headers configured for external access
- ✅ API endpoints responding correctly
- ✅ Mobile app can connect to server
- ✅ Today summary API working properly
