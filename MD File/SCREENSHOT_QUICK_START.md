# Quick Start: Screenshot Aplikasi PHC Mobile

## 🚀 Langkah Cepat

### 1. Persiapan
```bash
# Pastikan aplikasi berjalan di simulator/emulator
npm run ios    # atau
npm run android
```

### 2. Jalankan Screenshot Tool
```bash
# Mode interaktif (recommended)
npm run screenshot

# Mode otomatis (screenshot setiap 5 detik)
npm run screenshot:auto

# Screenshot khusus Android
npm run screenshot:android
```

### 3. Navigasi Manual
Setelah menjalankan tool, Anda perlu manual navigate ke setiap halaman:

1. **Welcome Screen** → Halaman pertama saat buka app
2. **Terms Screen** → Klik "Setuju & Lanjutkan" 
3. **Login Screen** → Tombol "Masuk"
4. **Register Screen** → Tombol "Daftar" dari login
5. **Main Screen** → Setelah login/skip
   - Tab Home (default)
   - Tab Activity 
   - Tab Wellness (tengah)
   - Tab Klinik
   - Tab Berita
6. **Profile Screen** → Icon profile di main screen
7. **Settings Screens** → Dari profile menu

## 📱 Daftar Halaman Utama

### Authentication
- Welcome Screen
- Terms & Conditions  
- Login Screen
- Register Screen

### Main Navigation
- Home Tab
- Activity Tab
- Wellness Tab (center button)
- Clinics Tab
- News Tab

### Profile & Settings
- Profile Screen
- Personal Information
- Health Goals
- Medical History
- Privacy Settings
- Help & Support
- About App

### Wellness Features
- Wellness App
- Activity Tracking
- Mood Tracking
- Sleep Tracking
- Water Tracking
- Fitness Tracking
- Meal Logging

### Medical Features
- Doctor Detail
- Consultation Booking
- Consultation History
- Chat Assistant
- Health Education

### Tools
- Health Calculator
- All Calculators
- Daily Mission
- Notifications

## 🛠️ Commands

```bash
# Screenshot interaktif
npm run screenshot

# Screenshot otomatis
npm run screenshot:auto

# Lihat daftar screenshot
npm run screenshot:list

# Hapus semua screenshot
npm run screenshot:clear

# Help
node scripts/screenshot-helper.js --help
```

## 📁 Hasil

Screenshots akan tersimpan di:
```
screenshots/app-screens/
├── 001_screenshot_2024-01-01T10-00-00.png
├── 002_screenshot_2024-01-01T10-01-00.png
└── ...
```

## 💡 Tips

1. **Data Preparation**: Login dengan akun yang memiliki data lengkap
2. **Consistent Theme**: Gunakan light/dark mode yang konsisten
3. **Full Load**: Tunggu halaman fully loaded sebelum screenshot
4. **Clean Status**: Pastikan status bar bersih (battery, time, etc.)

## 🐛 Troubleshooting

### iOS Simulator tidak terdeteksi
```bash
xcrun simctl list devices
xcrun simctl boot "iPhone 15"
```

### Android Emulator tidak terdeteksi
```bash
adb devices
adb kill-server && adb start-server
```

### Permission denied
```bash
chmod +x scripts/screenshot-helper.js
```

---

**Ready to capture? Run:** `npm run screenshot` 📸
