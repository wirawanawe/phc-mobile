# Panduan Test Mobile App Setelah Update Database

## ✅ Status Update Database

### 🔍 **Hasil Update:**
- ✅ **7 missions berhasil diupdate** dengan colors dan icons
- ✅ **Semua missions memiliki colors dan icons** yang sesuai
- ✅ **API berfungsi dengan baik** (status 200)
- ✅ **Data siap untuk mobile app**

### 📊 **Data Missions Setelah Update:**

| ID | Title | Category | Color | Icon |
|----|-------|----------|-------|------|
| 1 | Minum Air 8 Gelas | daily_habit | #10B981 | check-circle |
| 2 | Olahraga 30 Menit | fitness | #F59E0B | dumbbell |
| 3 | Catat Mood Harian | mental_health | #8B5CF6 | brain |
| 4 | Konsumsi 5 Porsi Sayur/Buah | nutrition | #EF4444 | food-apple |
| 5 | Tidur 8 Jam | daily_habit | #10B981 | check-circle |
| 6 | Meditasi 10 Menit | mental_health | #8B5CF6 | brain |
| 7 | Jalan Kaki 10.000 Langkah | fitness | #F59E0B | dumbbell |

## 🧪 Langkah-langkah Test Mobile App

### Langkah 1: Jalankan Mobile App
```bash
# Di terminal, jalankan:
npx expo start
```

### Langkah 2: Buka Mobile App
1. **Buka Expo Go** di device/emulator
2. **Scan QR code** atau **klik link** yang muncul di terminal
3. **Tunggu app loading** selesai

### Langkah 3: Navigasi ke Daily Mission
1. **Login** ke aplikasi (jika belum)
2. **Buka menu** atau **navigasi** ke Daily Mission
3. **Tunggu loading** missions selesai

### Langkah 4: Verifikasi Missions Ditampilkan
**Yang seharusnya terlihat:**
- ✅ **7 missions** ditampilkan dengan colors dan icons
- ✅ **Tidak ada pesan "No missions available"**
- ✅ **Missions dapat diinteraksi** (tap untuk detail)
- ✅ **Colors dan icons sesuai** dengan kategori

## 🔍 Debug Console Logs

### Cek Console Logs di Terminal:
**Yang seharusnya muncul:**
```
🔍 DEBUG: Starting loadData...
🔍 DEBUG: Missions response: {success: true, data: [...]}
🔍 DEBUG: Processed missions: [...]
🔍 DEBUG: Missions count: 7
🔍 DEBUG: Filtered missions count: 7
🔍 DEBUG: Rendering missions, count: 7
```

### Jika Console Logs Tidak Muncul:
1. **Pastikan app sudah di-restart** setelah update
2. **Cek network connectivity**
3. **Cek API endpoint configuration**
4. **Cek authentication status**

## 🚨 Troubleshooting

### Masalah: Missions Masih Kosong
**Solusi:**
1. **Restart mobile app** (tutup dan buka lagi)
2. **Clear cache** dengan `npx expo start --clear`
3. **Cek console logs** untuk error messages
4. **Test API langsung** dengan curl

### Masalah: Console Logs Error
**Solusi:**
1. **Cek network connection**
2. **Pastikan server berjalan** di `http://10.242.90.103:3000`
3. **Test API endpoint** dengan browser/curl
4. **Cek authentication token**

### Masalah: Missions Muncul Tapi Tidak Bisa Diinteraksi
**Solusi:**
1. **Cek user authentication**
2. **Pastikan user sudah login**
3. **Cek user permissions**
4. **Test dengan user lain**

## 📱 Expected Result

### Yang Seharusnya Terlihat di Mobile App:
1. **7 missions** dengan colors dan icons yang sesuai
2. **Progress cards** dengan stats missions
3. **Category filters** (All, Health Tracking, Nutrition, dll)
4. **Mission cards** dengan:
   - Icon dan color sesuai kategori
   - Title dan description
   - Points reward
   - Difficulty badge
   - Progress bar (jika active)

### Yang Seharusnya Bisa Dilakukan:
1. **Tap mission** untuk melihat detail
2. **Accept mission** untuk mulai
3. **Update progress** mission
4. **Filter missions** berdasarkan kategori
5. **View mission stats** dan progress

## 🎯 Success Criteria

**Mobile app dianggap berhasil jika:**
- ✅ **7 missions ditampilkan** dengan colors dan icons
- ✅ **Tidak ada error** di console logs
- ✅ **Missions dapat diinteraksi**
- ✅ **UI responsive** dan smooth
- ✅ **Data konsisten** dengan API

## 📞 Support

Jika masih mengalami masalah:
1. **Cek console logs** untuk debugging info
2. **Test API langsung** dengan curl/browser
3. **Restart app** dan clear cache
4. **Cek network** dan server status
5. **Hubungi development team** jika masalah berlanjut

## 🔄 Next Steps

Setelah missions berhasil ditampilkan:
1. **Test semua fitur missions** (accept, progress, complete)
2. **Test dengan user berbeda**
3. **Test di device berbeda**
4. **Clean up debug code** jika sudah stabil
5. **Dokumentasikan perubahan** untuk tim 