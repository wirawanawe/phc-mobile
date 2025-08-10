# Wellness Progress Monitoring - Dashboard Web

## Overview
Fitur Wellness Progress Monitoring memungkinkan dokter untuk memantau perkembangan program wellness pengguna mobile melalui dashboard web. Fitur ini membantu dokter dalam memberikan konsultasi yang lebih akurat berdasarkan data wellness yang komprehensif.

## Fitur Utama

### 1. **Daftar Pengguna Wellness**
- Menampilkan semua pengguna yang terdaftar dalam program wellness
- Filter berdasarkan status aktif/tidak aktif
- Pencarian berdasarkan nama atau email
- Indikator status wellness program

### 2. **Informasi Profil Pengguna**
- Data fisik: berat badan, tinggi badan, usia, jenis kelamin
- Level aktivitas dan tujuan fitness
- Tanggal join program wellness
- Status aktif/tidak aktif

### 3. **Progress Metrics**
- **Total Aktivitas**: Jumlah aktivitas wellness yang telah diselesaikan
- **Misi Selesai**: Jumlah misi yang telah berhasil diselesaikan
- **Total Poin**: Akumulasi poin yang diperoleh dari aktivitas dan misi
- **Aktivitas Minggu Ini**: Aktivitas yang dilakukan dalam 7 hari terakhir
- **Wellness Score**: Skor komprehensif berdasarkan berbagai faktor

### 4. **Distribusi Aktivitas**
- Visualisasi persentase aktivitas berdasarkan kategori:
  - Fitness (olahraga)
  - Nutrition (nutrisi)
  - Mental Health (kesehatan mental)
  - Sleep (tidur)
  - Mood (suasana hati)
  - Water (konsumsi air)

### 5. **Progress Misi**
- Persentase penyelesaian misi
- Jumlah misi selesai vs total misi
- Visualisasi progress bar

### 6. **Data Tracking Harian**
- **Konsumsi Air**: Rata-rata konsumsi air per hari (target: 2000ml)
- **Tidur**: Rata-rata jam tidur per malam (target: 8 jam)
- **Mood**: Rata-rata skor mood (skala 1-10)

### 7. **Daftar Misi**
- Status misi (Selesai, Sedang Berjalan, Belum Dimulai)
- Progress detail untuk misi yang sedang berjalan
- Tanggal penyelesaian untuk misi yang selesai
- Poin yang diperoleh

### 8. **Aktivitas Terbaru**
- 10 aktivitas terbaru yang dilakukan pengguna
- Informasi kategori, poin, dan tanggal aktivitas

## Cara Akses

### Dari Dashboard Mobile
1. Buka dashboard mobile di `/mobile`
2. Klik menu "Wellness Progress" atau quick action "Monitor Progress"
3. Atau akses langsung ke `/mobile/wellness-progress`

### Navigasi
```
Dashboard Mobile → Wellness Progress → Detail User Progress
```

## API Endpoints

### 1. **GET /api/mobile/wellness-progress/[id]**
Mendapatkan data progress wellness user yang detail.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "wellness_program_joined": true,
    "wellness_join_date": "2024-01-01T00:00:00.000Z",
    "weight": 70,
    "height": 170,
    "age": 25,
    "gender": "male",
    "activity_level": "moderately_active",
    "fitness_goal": "weight_loss"
  },
  "progress": {
    "totalActivities": 45,
    "completedMissions": 12,
    "totalMissions": 15,
    "totalPoints": 1250,
    "weeklyActivities": 7,
    "completionRate": 80,
    "wellnessScore": 85,
    "activityDistribution": {
      "fitness": 20,
      "nutrition": 15,
      "mental_health": 5,
      "sleep": 3,
      "mood": 2
    },
    "recentActivities": [...],
    "missions": [...],
    "trackingData": {
      "avgWaterIntake": 1800,
      "avgMoodScore": 7.5,
      "avgSleepHours": 7.2,
      "waterData": [...],
      "moodData": [...],
      "sleepData": [...]
    }
  }
}
```

## Perhitungan Wellness Score

Wellness Score dihitung berdasarkan beberapa faktor:

1. **Activity Completion Factor** (25%): Aktivitas mingguan vs target harian
2. **Mission Completion Factor** (25%): Persentase misi yang selesai
3. **Water Intake Factor** (20%): Rata-rata konsumsi air vs target 2L
4. **Sleep Factor** (15%): Rata-rata jam tidur vs target 8 jam
5. **Mood Factor** (15%): Rata-rata skor mood (skala 1-10)

**Formula:**
```
Wellness Score = (Activity Score + Mission Score + Water Score + Sleep Score + Mood Score) / 5
```

## Manfaat untuk Konsultasi Dokter

### 1. **Data Komprehensif**
- Dokter dapat melihat progress wellness secara menyeluruh
- Informasi profil dan tujuan fitness user
- Data tracking harian yang konsisten

### 2. **Identifikasi Masalah**
- Wellness score yang rendah dapat mengindikasikan masalah
- Distribusi aktivitas yang tidak seimbang
- Konsumsi air atau tidur yang kurang optimal

### 3. **Personalized Recommendations**
- Berdasarkan tujuan fitness user
- Level aktivitas dan kemampuan fisik
- Progress misi dan aktivitas yang sudah dilakukan

### 4. **Monitoring Progress**
- Tracking perubahan wellness score dari waktu ke waktu
- Evaluasi efektivitas program wellness
- Identifikasi area yang perlu perbaikan

## Database Tables Used

### 1. **users**
- `wellness_program_joined`: Status join program wellness
- `wellness_join_date`: Tanggal join program
- `weight`, `height`, `age`, `gender`: Data fisik
- `activity_level`, `fitness_goal`: Preferensi aktivitas

### 2. **wellness_activities**
- Aktivitas wellness yang dilakukan user
- Kategori, durasi, poin, tanggal selesai

### 3. **user_missions**
- Misi yang diambil user
- Status, progress, poin yang diperoleh

### 4. **water_tracking**
- Data konsumsi air harian
- Target dan actual intake

### 5. **mood_tracking**
- Data mood harian
- Skor mood (1-10)

### 6. **sleep_tracking**
- Data tidur harian
- Jam tidur per malam

## Keamanan dan Privasi

### 1. **Data Protection**
- Hanya dokter yang dapat mengakses data wellness user
- Data tidak dapat diakses oleh user lain
- Enkripsi data sensitif

### 2. **Access Control**
- Autentikasi dokter yang valid
- Authorization berdasarkan role dokter
- Log aktivitas akses data

### 3. **Data Retention**
- Data wellness disimpan sesuai kebijakan privasi
- User dapat request penghapusan data
- Backup data untuk keamanan

## Future Enhancements

### 1. **Analytics Dashboard**
- Grafik trend wellness score
- Perbandingan progress antar user
- Analisis korelasi aktivitas dan kesehatan

### 2. **Alert System**
- Notifikasi untuk wellness score yang menurun
- Alert untuk aktivitas yang tidak konsisten
- Reminder untuk konsultasi rutin

### 3. **Integration Features**
- Export data untuk laporan medis
- Integration dengan sistem EMR
- API untuk aplikasi kesehatan pihak ketiga

### 4. **Advanced Analytics**
- Machine learning untuk prediksi progress
- Personalized recommendations
- Risk assessment berdasarkan data wellness

## Troubleshooting

### 1. **Data Tidak Muncul**
- Periksa koneksi database
- Pastikan user memiliki data wellness
- Cek log error di console

### 2. **Wellness Score Tidak Akurat**
- Periksa data tracking yang tersedia
- Pastikan semua faktor terhitung dengan benar
- Validasi data input dari mobile app

### 3. **Performance Issues**
- Optimasi query database
- Implementasi caching untuk data yang sering diakses
- Pagination untuk data yang besar

## Support

Untuk bantuan teknis atau pertanyaan tentang fitur Wellness Progress Monitoring, silakan hubungi tim development atau buat issue di repository project. 