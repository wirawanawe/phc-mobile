# 🏥 Wellness App Guide - Untuk User yang Sudah Bergabung

## ✅ **Status: User Sudah Mengikuti Program Wellness**

Berdasarkan verifikasi sistem, user ini **sudah terdaftar** dalam program wellness dan seharusnya dapat mengakses **main wellness interface** (bukan onboarding).

---

## 🎯 **Yang Seharusnya Terjadi:**

### **Ketika User Klik Wellness Button:**
1. ✅ App memanggil `getUserProfile()` 
2. ✅ App memanggil `getMyMissions()`
3. ✅ App mengecek `profile.wellness_program_joined = true`
4. ✅ App mengecek apakah user punya missions
5. ✅ **Menampilkan main wellness interface** (bukan onboarding)

### **Main Wellness Interface Menampilkan:**
- 🏠 **Dashboard Tab** - Ringkasan wellness harian
- 🎯 **Missions Tab** - Daftar misi wellness
- 📊 **Progress Tab** - Tracking progress wellness
- 🏃 **Activities Tab** - Aktivitas wellness

---

## 🚀 **Cara Test Sekarang:**

### **Test 1: Akses Normal**
```bash
# 1. Buka aplikasi
# 2. Login (jika belum)
# 3. Klik tombol wellness (icon heart) di main screen
# 4. Seharusnya langsung masuk ke main wellness interface
```

### **Test 2: Jika Ada Network Issue**
```bash
# 1. Jika muncul error network timeout
# 2. Klik "Continue Offline" 
# 3. App akan load dengan mode offline
# 4. Tetap bisa akses wellness features
```

### **Test 3: Debug Mode**
```bash
# 1. Buka Profile screen
# 2. Klik "Debug Wellness"
# 3. Klik "Run Diagnosis"
# 4. Lihat status wellness user
```

---

## 📱 **Expected Behavior:**

| Scenario | Expected Result |
|----------|----------------|
| **Network OK** | ✅ Main wellness interface langsung muncul |
| **Network Slow** | ✅ Main wellness interface dengan loading |
| **Network Timeout** | ✅ Opsi "Continue Offline" muncul |
| **No Network** | ✅ Offline mode tersedia |

---

## 🔍 **Troubleshooting:**

### **Jika Masih Muncul Onboarding:**
1. **Cek user profile di database:**
   ```sql
   SELECT wellness_program_joined, wellness_join_date 
   FROM users 
   WHERE id = [user_id];
   ```

2. **Cek user missions:**
   ```sql
   SELECT COUNT(*) as mission_count 
   FROM user_missions 
   WHERE user_id = [user_id];
   ```

3. **Restart app dan coba lagi**

### **Jika Network Timeout:**
1. **Klik "Continue Offline"** - app akan load dengan cached data
2. **Atau klik "Debug Connection"** - untuk diagnosis lebih detail
3. **Atau restart app** - untuk refresh connection

### **Jika App Crash:**
1. **Clear Metro cache:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Rebuild app:**
   ```bash
   npx react-native run-android  # atau run-ios
   ```

---

## 🎯 **Wellness Features yang Tersedia:**

### **Dashboard Tab:**
- 📊 Wellness score harian
- 🎯 Progress misi hari ini
- 💧 Tracking air minum
- 🏃 Tracking aktivitas fisik

### **Missions Tab:**
- 📋 Daftar misi wellness
- ✅ Status completion misi
- 🏆 Points yang didapat
- 📅 Kalender misi

### **Progress Tab:**
- 📈 Grafik progress mingguan
- 🎯 Target vs actual
- 📊 Statistik wellness
- 🏅 Achievements

### **Activities Tab:**
- 🏃 Aktivitas fisik
- 🧘 Wellness activities
- 📱 Health tracking
- 🎯 Goal setting

---

## 🔧 **Technical Details:**

### **Backend Endpoints yang Digunakan:**
- `GET /api/mobile/users/profile` - User profile data
- `GET /api/mobile/my-missions` - User missions
- `GET /api/mobile/wellness/status` - Wellness program status
- `GET /api/mobile/wellness/progress` - Wellness progress

### **Frontend Logic:**
```typescript
// Wellness user check
if (profile.wellness_program_joined || hasMissions) {
  setHasProfile(true);
  setShowOnboarding(false);
  // Show main wellness interface
} else {
  setHasProfile(false);
  setShowOnboarding(true);
  // Show onboarding
}
```

### **Offline Mode:**
- ✅ Uses cached user data
- ✅ Basic wellness features available
- ✅ No network dependency
- ✅ Graceful degradation

---

## 📋 **Checklist Test:**

- [ ] **Login ke app** - berhasil
- [ ] **Klik wellness button** - masuk ke main interface
- [ ] **Dashboard tab** - menampilkan data wellness
- [ ] **Missions tab** - menampilkan misi user
- [ ] **Progress tab** - menampilkan progress
- [ ] **Activities tab** - menampilkan aktivitas
- [ ] **Offline mode** - berfungsi jika network error

---

## 🎉 **Kesimpulan:**

**User yang sudah mengikuti program wellness seharusnya:**
- ✅ **Langsung masuk ke main wellness interface**
- ✅ **Tidak melihat onboarding screen**
- ✅ **Bisa akses semua wellness features**
- ✅ **Bisa menggunakan offline mode jika network bermasalah**

**Jika masih ada masalah, gunakan "Debug Wellness" di Profile screen untuk diagnosis lebih detail!**
