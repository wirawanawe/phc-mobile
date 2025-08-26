# 📊 Data Tracking Source Explanation

## 🔍 **Masalah: Database Production Kosong**

### **Situasi Saat Ini:**
- ✅ Server production (`https://dash.doctorphc.id`) berjalan dengan baik
- ✅ API endpoints berfungsi dan merespons
- ❌ **Database production kosong** - tidak ada data tracking
- ❌ **Mobile app menggunakan fallback data** karena database kosong

## 📱 **Dari Mana Data Tracking Diambil?**

### **1. Sumber Data Utama (Production)**
```javascript
// src/services/api.js - Line 18-21
const getServerURL = () => {
  // Use production server
  return "https://dash.doctorphc.id";
};
```

**API Endpoints yang Digunakan:**
- `https://dash.doctorphc.id/api/mobile/tracking/today-summary?user_id=1`
- `https://dash.doctorphc.id/api/mobile/tracking/meal?user_id=1`
- `https://dash.doctorphc.id/api/mobile/tracking/water?user_id=1`
- `https://dash.doctorphc.id/api/mobile/tracking/fitness?user_id=1`
- `https://dash.doctorphc.id/api/mobile/tracking/sleep?user_id=1`
- `https://dash.doctorphc.id/api/mobile/mood_tracking?user_id=1`

### **2. Fallback Data (Ketika Server Tidak Bisa Diakses)**
```javascript
// src/services/api.js - Line 23-120
const getFallbackData = (endpoint) => {
  if (endpoint.includes('/tracking/today-summary')) {
    return {
      date: new Date().toISOString().split('T')[0],
      water: { total_ml: "1000", target_ml: 2000, percentage: 50 },
      sleep: { hours: 6, minutes: 30, total_hours: 6.5, quality: "good" },
      mood: { mood: "neutral", energy_level: null },
      health_data: [...],
      meal: { calories: "266.00", protein: "15.60", carbs: "24.10", fat: "11.90" },
      fitness: { exercise_minutes: "30", steps: "3456", distance_km: "5.00" }
    };
  }
  // ... more fallback data
};
```

### **3. Kondisi Penggunaan Fallback Data**
```javascript
// src/services/api.js - Line 780-790
if (endpoint.includes('/wellness') || endpoint.includes('/mood') || endpoint.includes('/tracking')) {
  console.log(`🔄 API: No network connection, returning fallback data for ${endpoint}`);
  return {
    success: true,
    data: getFallbackData(endpoint),
    message: 'Using offline data - no internet connection'
  };
}
```

## 🗄️ **Database Production Status**

### **Verifikasi Database Kosong:**
```bash
# Test API endpoint
curl "https://dash.doctorphc.id/api/mobile/tracking/today-summary?user_id=1"

# Response:
{
  "success": true,
  "data": {
    "date": "2025-08-25",
    "water": {"total_ml": "0", "target_ml": 2000, "percentage": 0},
    "sleep": null,
    "mood": null,
    "health_data": [],
    "meal": {"calories": "0.00", "protein": "0.00", "carbs": "0.00", "fat": "0.00", "meal_count": 0},
    "fitness": {"exercise_minutes": "0", "steps": "0", "distance_km": "0.00"},
    "activities_completed": 0,
    "points_earned": 0
  }
}
```

**Kesimpulan:** Semua nilai tracking adalah 0 atau null, menandakan database kosong.

## 🔧 **Solusi untuk Mengisi Database Production**

### **Option 1: Menggunakan API Endpoints (Recommended)**

#### **A. Login dan Dapatkan Token**
```bash
# Login dengan user yang ada
curl -X POST "https://dash.doctorphc.id/api/mobile/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### **B. Tambah Data Tracking via API**
```bash
# Tambah mood tracking
curl -X POST "https://dash.doctorphc.id/api/mobile/tracking/mood" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mood_level": "happy",
    "mood_score": 8,
    "stress_level": "low",
    "energy_level": "high",
    "notes": "Feeling great today!"
  }'

# Tambah water tracking
curl -X POST "https://dash.doctorphc.id/api/mobile/tracking/water" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_ml": 500,
    "notes": "Morning water"
  }'

# Tambah fitness tracking
curl -X POST "https://dash.doctorphc.id/api/mobile/tracking/fitness" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_type": "Lari",
    "duration_minutes": 30,
    "calories_burned": 200,
    "steps": 5000,
    "distance_km": 3.5,
    "notes": "Morning run"
  }'
```

### **Option 2: Database Direct Access (Jika Memungkinkan)**

#### **A. Koneksi Database Production**
```javascript
const dbConfig = {
  host: 'dash.doctorphc.id',
  user: 'root',
  password: 'production_password',
  database: 'phc_dashboard',
  port: 3306
};
```

#### **B. Script untuk Menambah Data**
```javascript
// scripts/add-production-tracking-data.js
// Script untuk menambah data tracking ke database production
```

### **Option 3: Menggunakan Mobile App**

#### **A. Login ke Mobile App**
1. Buka aplikasi mobile
2. Login dengan kredensial yang valid
3. Mulai tracking data melalui UI aplikasi

#### **B. Data akan Otomatis Tersimpan**
- Mood tracking
- Water intake
- Fitness activities
- Sleep tracking
- Meal logging

## 📊 **Struktur Database yang Diperlukan**

### **Tables yang Harus Ada:**
```sql
-- User management
mobile_users

-- Tracking tables
mood_tracking
water_tracking
fitness_tracking
sleep_tracking
meal_tracking
meal_foods
health_data

-- Supporting tables
food_database
missions
user_missions
wellness_activities
```

### **Sample Data yang Diperlukan:**
```sql
-- Sample user
INSERT INTO mobile_users (name, email, phone, password, is_active) 
VALUES ('Test User', 'mobile@test.com', '08123456789', 'mobile123', 1);

-- Sample tracking data
INSERT INTO mood_tracking (user_id, mood_level, mood_score, tracking_date) 
VALUES (1, 'happy', 8, '2025-08-25');

INSERT INTO water_tracking (user_id, amount_ml, tracking_date) 
VALUES (1, 500, '2025-08-25');
```

## 🎯 **Rekomendasi Langkah Selanjutnya**

### **1. Immediate Action (Hari Ini)**
1. **Login ke mobile app** dengan user yang valid
2. **Mulai tracking data** melalui UI aplikasi
3. **Verifikasi data tersimpan** dengan test API

### **2. Short Term (Minggu Ini)**
1. **Buat script automation** untuk menambah sample data
2. **Setup user management** yang proper
3. **Test semua tracking features**

### **3. Long Term (Bulan Ini)**
1. **Implementasi data migration** dari development ke production
2. **Setup monitoring** untuk database usage
3. **Backup strategy** untuk data tracking

## 🔍 **Cara Verifikasi Data Tracking**

### **1. Test API Endpoints**
```bash
# Test today summary
curl "https://dash.doctorphc.id/api/mobile/tracking/today-summary?user_id=1"

# Test mood tracking
curl "https://dash.doctorphc.id/api/mobile/mood_tracking?user_id=1"

# Test water tracking
curl "https://dash.doctorphc.id/api/mobile/tracking/water?user_id=1"
```

### **2. Check Mobile App**
1. Buka aplikasi mobile
2. Login dengan user yang valid
3. Navigate ke tracking screens
4. Verifikasi data muncul (bukan fallback data)

### **3. Database Query (Jika Akses Tersedia)**
```sql
-- Check user data
SELECT * FROM mobile_users LIMIT 5;

-- Check tracking data
SELECT COUNT(*) FROM mood_tracking;
SELECT COUNT(*) FROM water_tracking;
SELECT COUNT(*) FROM fitness_tracking;
```

## ✅ **Kesimpulan**

**Data tracking diambil dari:**
1. **Database production** (`https://dash.doctorphc.id`) - **Sumber utama**
2. **Fallback data** (hardcoded) - **Ketika server tidak bisa diakses**

**Database kosong karena:**
- Belum ada user yang melakukan tracking
- Belum ada data sample yang ditambahkan
- Mobile app baru saja di-deploy ke production

**Solusi:**
- Mulai tracking data melalui mobile app
- Atau tambah sample data via API/database
- Verifikasi data tersimpan dengan test API
