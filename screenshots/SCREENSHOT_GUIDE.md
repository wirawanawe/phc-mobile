# Panduan Screenshot Aplikasi PHC Mobile

## Persiapan

### Untuk iOS (Simulator)
1. Buka Xcode
2. Jalankan iOS Simulator
3. Build dan jalankan aplikasi di simulator
4. Pastikan `xcrun` command tersedia di terminal

### Untuk Android (Emulator)
1. Buka Android Studio atau jalankan emulator dari command line
2. Pastikan Android SDK dan ADB terinstall
3. Jalankan aplikasi di emulator
4. Test koneksi ADB: `adb devices`

## Cara Menggunakan

### Opsi 1: Tool Otomatis (Recommended)

```bash
# Jalankan tool screenshot helper
node scripts/screenshot-helper.js

# Mode otomatis (screenshot setiap 5 detik)
node scripts/screenshot-helper.js --auto 5

# Screenshot tunggal
node scripts/screenshot-helper.js --single "welcome_screen"

# Lihat daftar screenshot
node scripts/screenshot-helper.js --list

# Hapus semua screenshot
node scripts/screenshot-helper.js --clear
```

### Opsi 2: Manual dengan ADB/Simulator

#### iOS Simulator
```bash
# Screenshot langsung
xcrun simctl io booted screenshot screenshot.png
```

#### Android Emulator
```bash
# Screenshot langsung
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshot.png
adb shell rm /sdcard/screenshot.png
```

## Daftar Halaman yang Perlu Di-Screenshot

### 1. Authentication Flow
- [ ] **Welcome Screen** - Halaman selamat datang
- [ ] **Terms & Conditions** - Syarat dan ketentuan
- [ ] **Login Screen** - Halaman login
- [ ] **Register Screen** - Halaman registrasi

### 2. Main Navigation
- [ ] **Main Screen - Home Tab** - Tab beranda
- [ ] **Main Screen - Activity Tab** - Tab aktivitas
- [ ] **Main Screen - Wellness Tab** - Tab wellness (tengah)
- [ ] **Main Screen - Clinics Tab** - Tab klinik
- [ ] **Main Screen - News Tab** - Tab berita

### 3. Profile & Settings
- [ ] **Profile Screen** - Halaman profil utama
- [ ] **Personal Information** - Informasi pribadi
- [ ] **Health Goals** - Tujuan kesehatan
- [ ] **Medical History** - Riwayat medis
- [ ] **Privacy Settings** - Pengaturan privasi
- [ ] **Help & Support** - Bantuan dan dukungan
- [ ] **About App** - Tentang aplikasi

### 4. Wellness & Health Tracking
- [ ] **Wellness App** - Aplikasi wellness utama
- [ ] **Activity Screen** - Halaman aktivitas
- [ ] **Mood Tracking** - Pelacakan mood
- [ ] **Sleep Tracking** - Pelacakan tidur
- [ ] **Water Tracking** - Pelacakan air minum
- [ ] **Fitness Tracking** - Pelacakan fitness
- [ ] **Meal Logging** - Pencatatan makanan
- [ ] **Health Insights** - Wawasan kesehatan

### 5. Medical & Consultation
- [ ] **Doctor Detail** - Detail dokter
- [ ] **Consultation Booking** - Booking konsultasi
- [ ] **Consultation History** - Riwayat konsultasi
- [ ] **Chat Assistant** - Asisten chat AI
- [ ] **Health Education** - Edukasi kesehatan

### 6. News & Content
- [ ] **News Portal** - Portal berita kesehatan
- [ ] **Article Detail** - Detail artikel
- [ ] **Personalized Content** - Konten personal

### 7. Tools & Calculators
- [ ] **Health Calculator** - Kalkulator kesehatan
- [ ] **All Calculators** - Semua kalkulator

### 8. Gamification
- [ ] **Daily Mission** - Misi harian
- [ ] **Mission Detail** - Detail misi
- [ ] **Dashboard** - Dashboard dan laporan

### 9. Notifications & Communication
- [ ] **Notifications** - Halaman notifikasi

## Tips untuk Screenshot yang Baik

### 1. Persiapan Data
- Login dengan akun yang memiliki data lengkap
- Pastikan ada data aktivitas, riwayat, dll.
- Siapkan konten yang representatif

### 2. Kualitas Screenshot
- Gunakan device/simulator dengan resolusi tinggi
- Pastikan UI sudah fully loaded
- Hindari loading state kecuali memang diperlukan

### 3. Konsistensi
- Gunakan theme/mode yang sama (light/dark)
- Waktu screenshot konsisten (untuk timestamp)
- Status bar yang bersih

### 4. Organisasi File
Screenshot akan disimpan dengan format:
```
screenshots/app-screens/
├── 01_WelcomeScreen_2024-01-01T10-00-00.png
├── 02_LoginScreen_2024-01-01T10-01-00.png
├── 03_MainScreen_Home_2024-01-01T10-02-00.png
└── ...
```

## Troubleshooting

### iOS Simulator Issues
```bash
# Reset simulator
xcrun simctl erase all

# List available simulators
xcrun simctl list devices

# Boot specific simulator
xcrun simctl boot "iPhone 15"
```

### Android Emulator Issues
```bash
# Check ADB connection
adb devices

# Restart ADB server
adb kill-server
adb start-server

# Connect to specific device
adb connect <device_ip>:5555
```

### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/screenshot-helper.js
chmod +x scripts/take-screenshots-android.js
```

## Hasil Akhir

Setelah selesai, Anda akan memiliki:
- Screenshot dari semua halaman aplikasi
- File info untuk setiap screenshot
- Index/README file dengan daftar lengkap
- Organized folder structure

Screenshot dapat digunakan untuk:
- Dokumentasi aplikasi
- App store screenshots
- Presentasi dan demo
- Testing dan QA reference
- User manual/guide
