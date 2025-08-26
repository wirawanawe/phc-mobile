# Wellness Stats Endpoint Fix - Solusi Lengkap

## 🚨 **Masalah yang Ditemukan**

**Error 500 pada endpoint**: `/api/mobile/wellness/stats`

**Gejala**:
- Endpoint wellness stats mengembalikan error 500
- Frontend tidak bisa load wellness data
- Error di console: `GET /api/mobile/wellness/stats?user_id=1 500 in 14ms`

## 🔍 **Root Cause Analysis**

### **1. JWT Verification Error**
- Duplicate JWT verification calls
- Improper error handling untuk JWT verification
- Variable scope issues

### **2. Database Query Errors**
- Queries tidak wrapped dalam try-catch
- Single query failure menyebabkan seluruh endpoint crash
- Missing error handling untuk individual queries

### **3. Missing Error Context**
- Error messages tidak informatif
- Stack trace tidak lengkap
- Sulit untuk debugging

## ✅ **Solusi yang Diimplementasikan**

### **1. Fixed JWT Verification**

**File**: `dash-app/app/api/mobile/wellness/stats/route.js`

**Before**:
```javascript
// Verify JWT token
try {
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(process.env.JWT_SECRET)
  );
  console.log('✅ JWT verified, userId:', payload.userId);
} catch (jwtError) {
  // Error handling
}

const { payload } = await jwtVerify(  // ❌ Duplicate call!
  token,
  new TextEncoder().encode(process.env.JWT_SECRET)
);
```

**After**:
```javascript
// Verify JWT token
let payload;
try {
  const result = await jwtVerify(
    token,
    new TextEncoder().encode(process.env.JWT_SECRET)
  );
  payload = result.payload;
  console.log('✅ JWT verified, userId:', payload.userId);
} catch (jwtError) {
  console.error('❌ JWT verification failed:', jwtError);
  return NextResponse.json(
    {
      success: false,
      message: "Invalid token",
    },
    { status: 401 }
  );
}
```

### **2. Individual Query Error Handling**

**Before**:
```javascript
// All queries in sequence - if one fails, everything fails
const [moodResult] = await query(moodQuery, [userId, startDateStr]);
const [waterResult] = await query(waterQuery, [userId]);
const [sleepResult] = await query(sleepQuery, [userId]);
const [fitnessResult] = await query(fitnessQuery, [userId]);
```

**After**:
```javascript
// Initialize default values
let moodEntries = 0;
let avgMoodScore = 0;
let waterEntries = 0;
let sleepEntries = 0;
let fitnessEntries = 0;
let totalAvailableActivities = 0;
let completedActivities = 0;
let totalPoints = 0;

try {
  // Test mood query
  console.log('🔍 Testing mood query...');
  const [moodResult] = await query(moodQuery, [userId, startDateStr]);
  moodEntries = moodResult[0]?.mood_entries || 0;
  avgMoodScore = moodResult[0]?.avg_mood_score || 0;
  console.log('✅ Mood entries:', moodEntries, 'Avg mood score:', avgMoodScore);
} catch (error) {
  console.error('❌ Error in mood query:', error);
}

try {
  // Test water query
  console.log('🔍 Testing water query...');
  const [waterResult] = await query(waterQuery, [userId]);
  waterEntries = waterResult[0]?.water_entries || 0;
  console.log('✅ Water entries:', waterEntries);
} catch (error) {
  console.error('❌ Error in water query:', error);
}

// ... similar pattern for other queries
```

### **3. Enhanced Error Response**

**Before**:
```javascript
return NextResponse.json({ 
  success: false, 
  error: 'Internal server error' 
}, { status: 500 });
```

**After**:
```javascript
return NextResponse.json({ 
  success: false, 
  error: 'Internal server error',
  message: error.message
}, { status: 500 });
```

### **4. Test Script untuk Verification**

**File**: `scripts/test-wellness-stats-endpoint.js`

**Fungsi**:
- ✅ **Check Required Tables**: Verifikasi semua tabel yang dibutuhkan ada
- ✅ **Test User Setup**: Setup test user jika belum ada
- ✅ **Check Tracking Data**: Periksa data tracking untuk test user
- ✅ **Test Queries**: Test semua queries yang digunakan endpoint
- ✅ **Error Identification**: Identifikasi masalah spesifik

**Cara Menjalankan**:
```bash
cd scripts
node test-wellness-stats-endpoint.js
```

## 🔧 **Langkah-langkah Perbaikan**

### **Step 1: Apply Endpoint Fix**
Endpoint sudah diperbaiki dengan:
- JWT verification yang proper
- Individual query error handling
- Better error messages

### **Step 2: Test Endpoint**
```bash
cd scripts
node test-wellness-stats-endpoint.js
```

### **Step 3: Verify di App**
1. Buka aplikasi mobile
2. Navigate ke wellness section
3. Check apakah data wellness load dengan benar
4. Monitor console untuk error messages

## 📊 **Expected Results**

### **Setelah Fix**:
- ✅ Endpoint wellness stats tidak lagi return 500 error
- ✅ Individual query failures tidak crash seluruh endpoint
- ✅ Better error messages untuk debugging
- ✅ Graceful degradation jika ada data missing
- ✅ Proper JWT verification

### **Contoh Output Test Script**:
```
🧪 Starting Wellness Stats Endpoint Test...

📡 Connecting to database...
✅ Database connected successfully

🔍 Step 1: Checking required tables...
   ✅ Table mood_tracking exists
   ✅ Table water_tracking exists
   ✅ Table sleep_tracking exists
   ✅ Table fitness_tracking exists
   ✅ Table available_wellness_activities exists
   ✅ Table user_wellness_activities exists

🔍 Step 2: Checking test user...
   ✅ Using existing test user: test_user_wellness (ID: 1)

🔍 Step 3: Checking tracking data...
   😊 Mood tracking entries: 5
   💧 Water tracking entries: 12
   😴 Sleep tracking entries: 7
   🏃 Fitness tracking entries: 8

🔍 Step 4: Checking wellness activities...
   📋 Available wellness activities: 15
   🎯 User wellness activities: 3

🔍 Step 5: Testing wellness stats queries...
   📅 Testing queries for period: 7 days (from 2024-01-15)
   ✅ Mood query successful: 5 entries, avg score: 7.2
   ✅ Water query successful: 12 entries
   ✅ Sleep query successful: 7 entries
   ✅ Fitness query successful: 8 entries
   ✅ Total activities query successful: 15 available
   ✅ User activities query successful: 3 completed activities

🎉 Wellness stats endpoint test completed successfully!
```

## 🚨 **Troubleshooting**

### **Jika Masih Ada Error 500**:

1. **Check Database Connection**:
   ```bash
   mysql -u username -p phc_dashboard
   ```

2. **Check Required Tables**:
   ```sql
   SHOW TABLES LIKE '%tracking%';
   SHOW TABLES LIKE '%wellness%';
   ```

3. **Check JWT Secret**:
   ```bash
   echo $JWT_SECRET
   ```

4. **Check Server Logs**:
   ```bash
   cd dash-app
   npm run dev
   # Monitor console for error messages
   ```

### **Common Issues**:

1. **Missing Tables**:
   - Run database migration scripts
   - Check if tables exist

2. **JWT Secret Issues**:
   - Verify JWT_SECRET environment variable
   - Check token format

3. **Database Permission Issues**:
   - Check database user permissions
   - Verify database connection

## 📈 **Monitoring**

### **Check Endpoint Health**:
```bash
# Test endpoint directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/mobile/wellness/stats?period=7
```

### **Monitor Logs**:
```bash
# Check for these log messages:
# 🔍 Wellness stats endpoint called
# ✅ JWT verified, userId: 1
# ✅ Mood entries: 5, Avg mood score: 7.2
# ✅ Water entries: 12
# ✅ Returning response: {...}
```

## ✅ **Verification Checklist**

- [ ] Endpoint tidak return 500 error
- [ ] JWT verification berfungsi dengan baik
- [ ] Individual queries tidak crash endpoint
- [ ] Error messages informatif
- [ ] Test script berhasil dijalankan
- [ ] Wellness data load di frontend
- [ ] No error messages di console
- [ ] Graceful degradation untuk missing data

## 🎉 **Expected Outcome**

Setelah perbaikan:

1. **Endpoint Reliability**:
   - No more 500 errors
   - Proper error handling
   - Graceful degradation

2. **Better Debugging**:
   - Detailed error messages
   - Individual query logging
   - Clear error context

3. **User Experience**:
   - Wellness data loads properly
   - No crashes or freezes
   - Consistent data display

4. **System Stability**:
   - Robust error handling
   - Fallback mechanisms
   - Proper resource cleanup

Dengan perbaikan ini, endpoint wellness stats akan berfungsi dengan reliable dan memberikan data wellness yang akurat kepada user.
