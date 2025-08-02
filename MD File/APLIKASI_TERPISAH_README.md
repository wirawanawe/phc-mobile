# Aplikasi Terpisah: Wellness dan Clinics Booking

## Overview

Aplikasi PHC Mobile telah dipisahkan menjadi dua aplikasi terpisah untuk memberikan pengalaman yang lebih fokus dan terorganisir:

1. **Wellness App** - Fokus pada kesehatan dan kebugaran
2. **Clinics App** - Fokus pada booking konsultasi dan layanan kesehatan

## 1. Wellness App

### Fitur Utama:
- **Mission System** - Sistem misi harian untuk motivasi kesehatan
- **Auto Fitness** - Deteksi aktivitas otomatis menggunakan sensor
- **Meal Logging** - Pencatatan asupan makanan dan kalori
- **Water Tracking** - Monitoring konsumsi air minum
- **Exercise Logging** - Pencatatan aktivitas olahraga

### Onboarding:
Sebelum memulai program wellness, user harus mengisi data:
- Berat badan (kg)
- Tinggi badan (cm)
- Usia
- Jenis kelamin
- Level aktivitas (Sangat Sedikit, Ringan, Sedang, Aktif, Sangat Aktif)
- Tujuan fitness (Menurunkan Berat Badan, Menambah Massa Otot, Mempertahankan, Kesehatan Umum)

### Struktur Tab:
1. **Dashboard** - Ringkasan aktivitas dan progress
2. **Mission** - Daftar misi yang tersedia
3. **Tracking** - Menu untuk log meal, track water, log exercise, dan auto fitness

### Navigasi:
- Dari MainScreen, user dapat mengakses Wellness App melalui card "Wellness App"
- Navigasi: `MainScreen` → `WellnessApp`

## 2. Clinics App

### Fitur Utama:
- **Clinic Discovery** - Pencarian dan penelusuran klinik/rumah sakit
- **Service Booking** - Booking layanan kesehatan
- **Appointment Management** - Manajemen jadwal konsultasi
- **Booking History** - Riwayat booking

### Tampilan Modern:
- Gradient header dengan search bar
- Card design yang modern dan menarik
- Quick actions untuk booking cepat
- Status indicators yang jelas
- Rating dan review system

### Struktur Tab:
1. **Beranda** - Daftar klinik terdekat dan quick actions
2. **Booking** - Proses booking step-by-step
3. **Riwayat** - Riwayat booking dan status

### Navigasi:
- Dari MainScreen, user dapat mengakses Clinics App melalui card "Clinics Booking"
- Navigasi: `MainScreen` → `ClinicsApp`

## Implementasi Teknis

### File Baru:
- `src/screens/WellnessApp.tsx` - Aplikasi Wellness terpisah
- `src/screens/ClinicsApp.tsx` - Aplikasi Clinics terpisah

### Modifikasi File:
- `App.tsx` - Menambahkan route untuk aplikasi terpisah
- `src/screens/MainScreen.tsx` - Menambahkan card navigasi ke aplikasi terpisah

### Komponen yang Digunakan:
- **WellnessApp**: Menggunakan komponen yang sudah ada seperti MissionPromptCard, ProgressRing, ActivityDetectionService
- **ClinicsApp**: Menggunakan komponen yang sudah ada seperti Card, Chip, Button dari react-native-paper

## Cara Menggunakan

### Untuk User:
1. Buka aplikasi PHC Mobile
2. Login ke akun
3. Di halaman utama, akan muncul dua card:
   - **Wellness App** - Klik untuk masuk ke aplikasi wellness
   - **Clinics Booking** - Klik untuk masuk ke aplikasi booking klinik

### Untuk Developer:
1. **Wellness App**: Semua fitur wellness terintegrasi dalam satu aplikasi
2. **Clinics App**: Semua fitur booking klinik dengan UI yang lebih modern
3. Kedua aplikasi dapat diakses secara independen dari MainScreen

## Keuntungan Pemisahan

1. **Fokus Pengguna**: User dapat fokus pada satu jenis aktivitas
2. **UI/UX yang Lebih Baik**: Tampilan yang lebih modern dan terorganisir
3. **Maintainability**: Kode yang lebih terstruktur dan mudah dikelola
4. **Scalability**: Mudah untuk menambah fitur baru di masing-masing aplikasi
5. **Performance**: Loading yang lebih cepat karena fitur yang lebih fokus

## Integrasi dengan Backend

Kedua aplikasi menggunakan API yang sama:
- **Wellness App**: Menggunakan endpoint untuk missions, tracking, dan user profile
- **Clinics App**: Menggunakan endpoint untuk clinics, bookings, dan services

## Testing

Untuk testing aplikasi terpisah:
1. Jalankan aplikasi
2. Login dengan akun yang valid
3. Klik card "Wellness App" atau "Clinics Booking"
4. Test semua fitur dalam masing-masing aplikasi

## Future Enhancements

1. **Wellness App**:
   - Integrasi dengan wearable devices
   - AI-powered meal recommendations
   - Social features untuk sharing progress

2. **Clinics App**:
   - Video consultation
   - Payment integration
   - Prescription management
   - Health records integration 