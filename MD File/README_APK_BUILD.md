# 🚀 Cara Membuat APK Aplikasi PHC Mobile

## 📋 Ringkasan
Aplikasi PHC Mobile sudah siap untuk di-build menjadi APK. Berikut adalah beberapa metode yang tersedia:

## 🎯 Metode yang Direkomendasikan

### Metode 1: EAS Build (PALING MUDAH) ⭐

**Keuntungan:**
- ✅ Tidak perlu setup lokal yang kompleks
- ✅ Build di cloud (lebih cepat)
- ✅ Auto-signing APK
- ✅ Download APK langsung dari browser

**Langkah-langkah:**

1. **Login ke Expo:**
   ```bash
   npx eas-cli login
   ```
   - Email: `doctorphcindonesia@gmail.com`
   - Masukkan password Expo account

2. **Build APK:**
   ```bash
   ./build-apk-eas.sh
   ```
   
   Atau manual:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```

3. **Download APK:**
   - Tunggu build selesai (5-10 menit)
   - Download APK dari link yang diberikan
   - Install di Android device

## 🔧 Metode Alternatif

### Metode 2: Build Lokal (Untuk Development)

**Prerequisites:**
- Java 17 ✅ (sudah terinstall)
- Android Studio ✅ (sudah terinstall)
- Android SDK ✅ (sudah terinstall)
- NDK ❌ (perlu diinstall)

**Langkah-langkah:**

1. **Install NDK (jika belum):**
   ```bash
   ./install-ndk.sh
   ```

2. **Build APK:**
   ```bash
   ./build-apk.sh
   ```

### Metode 3: Development Testing

**Untuk testing cepat tanpa build APK:**

1. **Start development server:**
   ```bash
   npx expo start
   ```

2. **Scan QR code dengan Expo Go app di Android**

## 📁 File yang Sudah Disediakan

- ✅ `build-apk-eas.sh` - Script untuk EAS Build
- ✅ `build-apk.sh` - Script untuk build lokal
- ✅ `install-ndk.sh` - Script untuk install NDK
- ✅ `app.json` - Konfigurasi aplikasi
- ✅ `eas.json` - Konfigurasi EAS Build
- ✅ `BUILD_APK_SOLUTION.md` - Solusi lengkap
- ✅ `BUILD_APK_GUIDE.md` - Panduan detail

## 🚀 Quick Start (RECOMMENDED)

```bash
# 1. Login ke Expo
npx eas-cli login

# 2. Build APK
./build-apk-eas.sh

# 3. Download dan install APK
```

## 📱 Hasil Build

### EAS Build:
- ⏱️ Waktu: 5-10 menit
- 📥 Download: Link browser
- 📱 Install: Langsung di Android

### Local Build:
- ⏱️ Waktu: 10-15 menit
- 📁 Lokasi: `android/app/build/outputs/apk/release/app-release.apk`
- 📱 Install: Copy file ke Android

## 🔧 Konfigurasi Aplikasi

**Package Name:** `com.phc.doctorapp`
**Version:** `1.0.0`
**Build Type:** `apk`
**Permissions:** Internet, Location

## 🎉 Selamat!

Setelah APK berhasil dibuat, Anda dapat:
1. Install di device Android
2. Share ke pengguna lain
3. Upload ke Google Drive untuk distribusi
4. Test semua fitur aplikasi

## 📞 Troubleshooting

**Jika build gagal:**
1. Pastikan sudah login ke Expo
2. Check koneksi internet
3. Gunakan `--clear-cache` flag
4. Coba build ulang

**Untuk support lebih lanjut:**
- Check file `BUILD_APK_SOLUTION.md`
- Check file `BUILD_APK_GUIDE.md` 