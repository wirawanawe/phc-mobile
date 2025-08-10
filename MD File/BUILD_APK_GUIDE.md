# Panduan Membuat APK untuk Aplikasi PHC Mobile

## Metode 1: Build Lokal (Recommended untuk Development)

### Prerequisites:
- ✅ Java 17 (sudah terinstall)
- ✅ Android Studio & Android SDK (sudah terinstall)
- ✅ Node.js & npm (sudah terinstall)

### Langkah-langkah:

1. **Jalankan script build otomatis:**
   ```bash
   ./build-apk.sh
   ```

2. **Atau build manual:**
   ```bash
   # Set environment variables
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
   export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
   export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
   
   # Build APK
   npx expo run:android --variant release
   ```

### Hasil:
- APK akan tersimpan di: `android/app/build/outputs/apk/release/app-release.apk`
- Waktu build: 10-15 menit

## Metode 2: EAS Build (Recommended untuk Production)

### Langkah-langkah:

1. **Login ke Expo (jika belum):**
   ```bash
   npx eas-cli login
   ```

2. **Build menggunakan EAS:**
   ```bash
   # Build preview APK
   npx eas-cli build --platform android --profile preview
   
   # Build production APK
   npx eas-cli build --platform android --profile production
   ```

### Keuntungan EAS Build:
- ✅ Lebih cepat (build di cloud)
- ✅ Tidak perlu setup lokal yang kompleks
- ✅ Build yang konsisten
- ✅ Auto-signing APK

## Metode 3: Expo Development Build

### Langkah-langkah:

1. **Install development client:**
   ```bash
   npx expo install expo-dev-client
   ```

2. **Build development APK:**
   ```bash
   npx expo run:android
   ```

## Troubleshooting

### Error: "SDK location not found"
```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
```

### Error: "Java not found"
```bash
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
```

### Error: "Gradle build failed"
```bash
# Clean build
rm -rf android/app/build
rm -rf android/.gradle
./build-apk.sh
```

## File Konfigurasi

### app.json
- Package name: `com.phc.doctorapp`
- Version: `1.0.0`
- Build type: `apk`

### eas.json
- Build profiles: `preview` dan `production`
- Distribution: `internal`
- Android build type: `apk`

## Tips

1. **Untuk development cepat:** Gunakan `npx expo start` dan scan QR code
2. **Untuk testing:** Gunakan build lokal dengan `./build-apk.sh`
3. **Untuk production:** Gunakan EAS Build
4. **Untuk sharing:** APK bisa di-share langsung atau upload ke Google Drive

## Struktur APK

Setelah build berhasil, APK akan tersimpan di:
```
android/app/build/outputs/apk/release/app-release.apk
```

APK ini bisa langsung diinstall di device Android atau di-share ke pengguna lain. 