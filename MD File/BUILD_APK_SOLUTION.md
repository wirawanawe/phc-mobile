# Solusi Lengkap Membuat APK Aplikasi PHC Mobile

## 🚨 Masalah Saat Ini
Build lokal mengalami error karena NDK (Native Development Kit) tidak terinstall dengan benar.

## ✅ Solusi yang Tersedia

### Metode 1: EAS Build (RECOMMENDED - Paling Mudah)

EAS Build adalah layanan cloud dari Expo untuk build aplikasi tanpa setup lokal yang kompleks.

#### Langkah-langkah:

1. **Install EAS CLI (jika belum):**
   ```bash
   npm install -g eas-cli
   ```

2. **Login ke Expo:**
   ```bash
   npx eas-cli login
   ```
   - Masukkan email: `doctorphcindonesia@gmail.com`
   - Masukkan password Expo account

3. **Build APK:**
   ```bash
   # Build preview APK (untuk testing)
   npx eas-cli build --platform android --profile preview
   
   # Build production APK (untuk release)
   npx eas-cli build --platform android --profile production
   ```

#### Keuntungan:
- ✅ Tidak perlu setup NDK lokal
- ✅ Build di cloud (lebih cepat)
- ✅ Auto-signing APK
- ✅ Download APK langsung dari browser

### Metode 2: Fix NDK Issue (Untuk Build Lokal)

Jika ingin tetap menggunakan build lokal:

1. **Install Android SDK Command-line Tools:**
   - Buka Android Studio
   - Go to Tools > SDK Manager
   - Tab "SDK Tools"
   - Check "Android SDK Command-line Tools (latest)"
   - Click Apply

2. **Install NDK:**
   ```bash
   ./install-ndk.sh
   ```

3. **Build APK:**
   ```bash
   ./build-apk.sh
   ```

### Metode 3: Expo Development Build (Paling Sederhana)

Untuk testing cepat:

1. **Start development server:**
   ```bash
   npx expo start
   ```

2. **Scan QR code dengan Expo Go app di Android**

## 📱 Hasil Build

### EAS Build:
- APK akan tersedia untuk download di browser
- Link download akan diberikan setelah build selesai
- Waktu build: 5-10 menit

### Local Build:
- APK location: `android/app/build/outputs/apk/release/app-release.apk`
- Waktu build: 10-15 menit

## 🔧 Konfigurasi Aplikasi

### app.json (Sudah dikonfigurasi):
```json
{
  "expo": {
    "name": "DOCTOR PHC Indonesia",
    "package": "com.phc.doctorapp",
    "version": "1.0.0",
    "android": {
      "buildType": "apk"
    }
  }
}
```

### eas.json (Sudah dikonfigurasi):
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## 🎯 Rekomendasi

**Untuk saat ini, gunakan EAS Build (Metode 1)** karena:
1. Tidak perlu setup NDK yang kompleks
2. Build lebih cepat dan reliable
3. APK langsung bisa didownload
4. Tidak perlu install Android Studio Command-line Tools

## 📋 Checklist Build APK

- [ ] Login ke Expo account
- [ ] Run EAS build command
- [ ] Download APK dari browser
- [ ] Test APK di device Android
- [ ] Share APK ke pengguna

## 🚀 Quick Start

```bash
# 1. Login ke Expo
npx eas-cli login

# 2. Build APK
npx eas-cli build --platform android --profile preview

# 3. Download APK dari link yang diberikan
# 4. Install di Android device
```

## 📞 Support

Jika mengalami masalah:
1. Pastikan sudah login ke Expo account
2. Check koneksi internet
3. Pastikan app.json dan eas.json sudah benar
4. Gunakan EAS Build untuk menghindari masalah NDK lokal 