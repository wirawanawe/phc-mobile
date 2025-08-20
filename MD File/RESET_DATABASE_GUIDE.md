# Panduan Reset Database dan Mobile App

## 🗑️ Reset Lengkap Data

Panduan ini menjelaskan cara menghapus semua data di database dan mobile app untuk memulai dari awal.

## 📋 Yang Akan Dihapus

### Database Tables (phc_dashboard)
- `fitness_tracking` - Data tracking fitness/exercise
- `mood_tracking` - Data tracking mood
- `water_tracking` - Data tracking air minum
- `sleep_tracking` - Data tracking tidur
- `meal_tracking` - Data tracking makanan
- `meal_logging` - Data logging makanan
- `meal_foods` - Data makanan yang dikonsumsi
- `wellness_activities` - Data aktivitas wellness
- `user_wellness_activities` - Data aktivitas wellness user
- `user_missions` - Data misi user
- `user_quick_foods` - Data makanan cepat user
- `chat_messages` - Data pesan chat
- `chats` - Data chat
- `consultations` - Data konsultasi
- `bookings` - Data booking
- `health_data` - Data kesehatan
- `mobile_users` - Data user mobile

### Mobile App Storage
- `authToken` - Token autentikasi
- `refreshToken` - Token refresh
- `userData` - Data user
- `fitnessData` - Data fitness
- `moodData` - Data mood
- `waterData` - Data air minum
- `sleepData` - Data tidur
- `mealData` - Data makanan
- `wellnessData` - Data wellness
- `missionData` - Data misi
- `quickFoods` - Makanan cepat
- `userStats` - Statistik user
- `chatData` - Data chat
- `bookingData` - Data booking
- Dan data lainnya...

## 🚀 Cara Reset

### Method 1: Script Otomatis (Recommended)

```bash
# Jalankan script reset lengkap
./scripts/complete-reset.sh
```

Script ini akan:
1. ✅ Truncate semua tabel database
2. ✅ Reset auto increment counters
3. ✅ Verifikasi data telah dihapus
4. ✅ Berikan instruksi untuk mobile app

### Method 2: Manual Database Reset

```bash
# Truncate database manual
mysql -u root -p phc_dashboard < scripts/truncate-all-data.sql
```

### Method 3: Mobile App Reset

#### A. Developer Menu
1. Buka mobile app
2. Shake device atau tekan `Cmd+D` (iOS simulator) / `Cmd+M` (Android)
3. Pilih "Clear Storage" atau "Reset App"

#### B. Script Clear Storage
```javascript
// Import dan jalankan di app
import clearMobileData from './scripts/clear-mobile-storage.js';
await clearMobileData();
```

## 🔍 Verifikasi Reset

### Cek Database
```sql
-- Cek jumlah data di tabel tracking
SELECT 
    'fitness_tracking' as table_name, COUNT(*) as count FROM fitness_tracking
UNION ALL
SELECT 'mood_tracking', COUNT(*) FROM mood_tracking
UNION ALL
SELECT 'water_tracking', COUNT(*) FROM water_tracking
UNION ALL
SELECT 'sleep_tracking', COUNT(*) FROM sleep_tracking
UNION ALL
SELECT 'meal_tracking', COUNT(*) FROM meal_tracking
UNION ALL
SELECT 'wellness_activities', COUNT(*) FROM wellness_activities
UNION ALL
SELECT 'user_missions', COUNT(*) FROM user_missions;
```

Semua tabel harus menampilkan `count = 0`.

### Cek Mobile App
- App akan meminta login ulang
- Tidak ada data history yang tersimpan
- Semua setting kembali ke default

## 📋 Langkah Setelah Reset

1. **Restart Mobile App**
   - Tutup app sepenuhnya
   - Buka kembali app

2. **Login Ulang**
   - Masukkan kredensial login
   - Atau buat akun baru

3. **Mulai Tracking**
   - Mulai input data fitness
   - Mulai tracking mood
   - Mulai tracking air minum
   - Mulai tracking tidur
   - Mulai tracking makanan

4. **Verifikasi Data**
   - Cek apakah data tersimpan
   - Cek apakah API berfungsi
   - Cek apakah tidak ada error

## ⚠️ Peringatan

- **PERMANENT**: Data yang dihapus tidak dapat dikembalikan
- **BACKUP**: Buat backup sebelum reset jika diperlukan
- **TESTING**: Pastikan ini adalah environment testing
- **PRODUCTION**: Jangan jalankan di production tanpa backup

## 🛠️ Troubleshooting

### Error Koneksi Database
```bash
# Cek MySQL server
brew services list | grep mysql

# Restart MySQL jika perlu
brew services restart mysql
```

### Error Permission Database
```bash
# Coba dengan password yang benar
mysql -u root -p phc_dashboard < scripts/truncate-all-data.sql
```

### Mobile App Masih Ada Data
1. Clear app cache
2. Uninstall dan install ulang app
3. Reset device (hanya untuk testing)

## 📞 Support

Jika ada masalah, cek:
1. Log error di console
2. Status MySQL server
3. Koneksi database
4. Permission database user

---

**Note**: Script ini hanya untuk development/testing. Jangan gunakan di production environment.
