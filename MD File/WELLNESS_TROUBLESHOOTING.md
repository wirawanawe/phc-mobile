# Wellness App Troubleshooting Guide

## Masalah: Tidak Bisa Masuk ke Halaman Wellness App

### Kemungkinan Penyebab dan Solusi

#### 1. **Masalah Autentikasi (Authentication Issues)**

**Gejala:**
- Muncul pesan "Authentication Required"
- App mengarahkan ke halaman login
- Loading terus-menerus

**Solusi:**
```bash
# Langkah 1: Cek status autentikasi
1. Buka app
2. Pergi ke Profile screen
3. Klik "Debug Wellness" (jika sudah login)
4. Jalankan diagnosis

# Langkah 2: Reset autentikasi
1. Logout dari app
2. Clear app cache/data
3. Login kembali
```

#### 2. **Masalah Koneksi Backend**

**Gejala:**
- Error "Server not reachable"
- Timeout errors
- Network connection failed

**Solusi:**
```bash
# Pastikan backend server berjalan
cd dash-app
npm run dev

# Test koneksi API
curl http://localhost:3000/api/health
curl http://localhost:3000/api/mobile/wellness/activities/public
```

#### 3. **Masalah Setup Wellness Program**

**Gejala:**
- App menampilkan onboarding terus-menerus
- Data profile tidak lengkap
- Error saat save wellness data

**Solusi:**
1. Lengkapi data profile (berat, tinggi, tanggal lahir)
2. Pilih fitness goal dan activity level
3. Pastikan semua field terisi dengan benar

#### 4. **Masalah Navigation**

**Gejala:**
- Error "WellnessApp screen not found"
- Navigation crash
- App freeze saat klik wellness button

**Solusi:**
1. Restart aplikasi
2. Update React Navigation dependencies
3. Clear Metro cache: `npx react-native start --reset-cache`

### Tools Debugging yang Tersedia

#### 1. **Wellness Debug Screen**
- Akses melalui Profile → "Debug Wellness"
- Menampilkan status autentikasi, koneksi API, dan profile
- Dapat menjalankan diagnosis otomatis
- Menyediakan tombol untuk fix common issues

#### 2. **Console Logs**
```javascript
// Di WellnessApp.tsx, cek console untuk:
console.log("WellnessApp: Component mounted");
console.log("WellnessApp: Auth state:", { isAuthenticated, user, authLoading });
console.log("WellnessApp: Profile response:", profileResponse);
```

#### 3. **Debug Script**
```bash
# Jalankan script debugging dari terminal
node debug-wellness.js
```

### Langkah-Langkah Troubleshooting

#### Langkah 1: Cek Status Dasar
1. Pastikan sudah login ke aplikasi
2. Cek koneksi internet
3. Pastikan backend server berjalan

#### Langkah 2: Gunakan Debug Tools
1. Buka app → Profile → "Debug Wellness"
2. Klik "Run Diagnosis"
3. Lihat hasil diagnosis
4. Klik "Fix Issues" jika ada masalah terdeteksi

#### Langkah 3: Manual Fixes
```bash
# Reset autentikasi
1. Logout dari app
2. Clear app storage
3. Login kembali

# Reset wellness data
1. Pergi ke wellness onboarding
2. Isi ulang semua data
3. Save profile
```

#### Langkah 4: Backend Verification
```bash
# Cek backend status
cd dash-app
npm run dev

# Test wellness endpoints
curl http://localhost:3000/api/mobile/wellness/activities/public
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/mobile/wellness/status
```

### Error Messages dan Artinya

| Error Message | Penyebab | Solusi |
|---------------|----------|--------|
| "Authentication Required" | Tidak login atau token expired | Login ulang |
| "User not authenticated" | Token tidak valid | Clear cache dan login ulang |
| "Server not reachable" | Backend tidak jalan atau network issue | Start backend server |
| "Profile not found" | Data user tidak lengkap | Lengkapi profile data |
| "Wellness setup required" | Belum setup wellness program | Isi form onboarding |

### Konfigurasi Network (Development)

Pastikan API URL sesuai dengan environment:

```javascript
// Android Emulator
http://10.0.2.2:3000/api/mobile

// iOS Simulator  
http://localhost:3000/api/mobile

// Physical Device
http://192.168.18.30:3000/api/mobile (sesuaikan dengan IP local)
```

### Contact Support

Jika masalah masih berlanjut setelah mengikuti panduan ini:

1. Jalankan `node debug-wellness.js` dan kirim hasilnya
2. Sertakan screenshot error message
3. Sertakan informasi device dan OS version
4. Sertakan log dari Debug Wellness screen

### Files yang Ditambahkan untuk Debugging

1. `src/utils/wellnessDebugger.js` - Utility untuk diagnosis
2. `src/screens/WellnessDebugScreen.tsx` - Screen untuk debugging  
3. `debug-wellness.js` - Script command line untuk debugging
4. Debug option di Profile screen

### Testing

Untuk memastikan fix berhasil:

1. **Test Navigation:**
   ```
   Main Screen → Klik wellness button → Harus masuk ke WellnessApp
   ```

2. **Test Authentication:**
   ```
   Logout → Login → Coba akses wellness
   ```

3. **Test Profile Setup:**
   ```
   Clear wellness data → Setup ulang → Coba akses wellness
   ```

---

**Note:** Jika menggunakan physical device, pastikan device dan development server berada di network yang sama dan IP address di konfigurasi API sesuai.
