# 📱 Cara Mendapatkan File .APK PHC Mobile App

## 🚀 Metode 1: Build dengan EAS (Recommended)

### Langkah 1: Login ke Expo
```bash
npx eas-cli login
```

### Langkah 2: Build APK Production
```bash
# Menggunakan script yang sudah dibuat
./scripts/build-production.sh

# Atau langsung dengan command
npx eas-cli build --platform android --profile production
```

### Langkah 3: Download APK
1. Setelah build selesai, Anda akan mendapat link download
2. Klik link tersebut untuk download file .apk
3. File akan tersimpan di folder Downloads

## 🔧 Metode 2: Build Lokal (Development)

### Langkah 1: Install Expo CLI
```bash
npm install -g @expo/cli
```

### Langkah 2: Build APK Development
```bash
npx expo run:android --variant release
```

## 📋 Status Build

### Cek Status Build
```bash
npx eas-cli build:list
```

### Cek Detail Build
```bash
npx eas-cli build:view [BUILD_ID]
```

## 📁 Lokasi File APK

### Setelah Build EAS:
- **Download Link**: Akan muncul di terminal setelah build selesai
- **Contoh**: `https://expo.dev/artifacts/eas/...`
- **File Size**: Biasanya 20-50 MB

### Setelah Build Lokal:
- **Android**: `android/app/build/outputs/apk/release/app-release.apk`
- **File Size**: Biasanya 15-30 MB

## 🔍 Troubleshooting

### Jika EAS CLI tidak terinstall:
```bash
# Coba install dengan npm
npm install -g eas-cli

# Atau gunakan npx (tidak perlu install global)
npx eas-cli --version
```

### Jika login gagal:
```bash
# Logout dulu
npx eas-cli logout

# Login ulang
npx eas-cli login
```

### Jika build gagal:
1. Cek koneksi internet
2. Pastikan sudah login ke Expo
3. Cek error log di terminal
4. Coba build ulang

## 📱 Install APK di Device

### Langkah 1: Enable Unknown Sources
1. Buka **Settings** → **Security**
2. Aktifkan **Unknown Sources** atau **Install Unknown Apps**

### Langkah 2: Install APK
1. Buka file .apk yang sudah didownload
2. Klik **Install**
3. Tunggu proses instalasi selesai
4. Buka aplikasi PHC Mobile

## 🧪 Testing APK

### Test Fitur Utama:
- ✅ Login/Register
- ✅ Dashboard
- ✅ Missions
- ✅ Health Data
- ✅ Food Tracking
- ✅ Wellness Activities

### Test Koneksi:
- ✅ API calls ke production server
- ✅ Push notifications
- ✅ Offline mode

## 📊 Informasi Build

### Production Build:
- **Server**: `https://dash.doctorphc.id`
- **API**: `https://dash.doctorphc.id/api/mobile`
- **Version**: 1.0.0
- **Bundle ID**: `com.phc.doctorapp`

### Development Build:
- **Server**: Local development server
- **API**: `http://localhost:3000/api/mobile`
- **Version**: 1.0.0
- **Bundle ID**: `com.phc.doctorapp`

## 🆘 Support

### Jika ada masalah:
1. Cek log error di terminal
2. Pastikan semua dependencies terinstall
3. Coba build ulang
4. Hubungi tim development

### Command yang berguna:
```bash
# Cek status project
npx expo doctor

# Cek dependencies
npm audit

# Clean cache
npx expo start --clear

# Reset Metro cache
npx expo start --reset-cache
```

---

**Last Updated**: $(date)
**Status**: ✅ Ready for Production Build
