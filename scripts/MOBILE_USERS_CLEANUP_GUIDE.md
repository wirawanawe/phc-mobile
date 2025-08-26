# Panduan Pembersihan Data Mobile Users - PHC Mobile Application

## Overview
Panduan ini menjelaskan cara membersihkan data dari tabel `mobile_users` dengan aman tanpa merusak fungsionalitas aplikasi.

## Analisis Tabel mobile_users

### 📊 Relasi Tabel
Tabel `mobile_users` memiliki relasi dengan 17 tabel lain:
- `health_data` (user_id)
- `wellness_activities` (user_id)
- `mood_tracking` (user_id)
- `water_tracking` (user_id)
- `sleep_tracking` (user_id)
- `meal_tracking` (user_id)
- `fitness_tracking` (user_id)
- `user_missions` (user_id)
- `user_quick_foods` (user_id)
- `user_water_settings` (user_id)
- `user_habit_activities` (user_id)
- `chats` (user_id)
- `consultations` (user_id)
- `bookings` (user_id)
- `user_cache` (user_id)
- `user_imports` (user_id)
- `anthropometry_progress` (user_id)

### 🔍 Data yang Dapat Dibersihkan
1. **Data Lama** - User yang dibuat lebih dari 30 hari yang lalu
2. **Data Test/Dummy** - User dengan email/name mengandung kata 'test' atau 'dummy'
3. **Data Inaktif** - User yang tidak aktif

## File yang Dibuat

### 1. `scripts/cleanup-mobile-users-simple.sql`
Script SQL utama untuk pembersihan data dengan fitur:
- ✅ Backup otomatis sebelum pembersihan
- ✅ Pembersihan data lama (30+ hari)
- ✅ Pembersihan data test/dummy
- ✅ Pembersihan data terkait dari tabel lain
- ✅ Verifikasi hasil pembersihan

### 2. `scripts/cleanup-mobile-users.sh`
Script shell untuk menjalankan pembersihan dengan mudah:
- ✅ Pengecekan koneksi database
- ✅ Analisis data yang akan dibersihkan
- ✅ Konfirmasi sebelum pembersihan
- ✅ Laporan hasil pembersihan
- ✅ Informasi backup

### 3. `scripts/cleanup-mobile-users-data.sql`
Script SQL lengkap dengan berbagai opsi pembersihan:
- ✅ Opsi 1: Hapus semua data (HATI-HATI!)
- ✅ Opsi 2: Hapus data lama
- ✅ Opsi 3: Hapus data test/dummy

## Cara Menjalankan Pembersihan

### 🚀 Opsi 1: Menggunakan Script Otomatis (Direkomendasikan)
```bash
./scripts/cleanup-mobile-users.sh
```

### 🔧 Opsi 2: Manual SQL
```bash
# Jalankan script SQL langsung
mysql -u root -p phc_dashboard < scripts/cleanup-mobile-users-simple.sql
```

### 📋 Opsi 3: Custom Cleanup
1. Edit file `scripts/cleanup-mobile-users-data.sql`
2. Pilih opsi pembersihan yang diinginkan
3. Jalankan script

## Keamanan dan Backup

### 🔒 Fitur Keamanan
- ✅ Backup otomatis sebelum pembersihan
- ✅ Hanya menghapus data yang tidak penting
- ✅ Mempertahankan data aktif dan penting
- ✅ Verifikasi hasil pembersihan
- ✅ Kemampuan rollback

### 📦 Backup Data
Script secara otomatis membuat backup:
- `backup_mobile_users_[timestamp]` - Backup data mobile_users
- Semua data terkait juga di-backup

### 🔄 Rollback
Jika terjadi masalah, data dapat dipulihkan:
```sql
-- Pulihkan data mobile_users
INSERT INTO mobile_users SELECT * FROM backup_mobile_users_[timestamp];

-- Pulihkan data terkait (jika diperlukan)
INSERT INTO health_data SELECT * FROM backup_health_data_[timestamp];
-- (dan seterusnya untuk tabel lain)
```

## Jenis Pembersihan

### 🗑️ Pembersihan Data Lama
- **Kriteria**: User dibuat lebih dari 30 hari yang lalu
- **Tujuan**: Membersihkan data lama yang tidak aktif
- **Aman**: Tidak mempengaruhi user aktif

### 🧪 Pembersihan Data Test
- **Kriteria**: Email/name mengandung 'test' atau 'dummy'
- **Tujuan**: Membersihkan data testing
- **Aman**: Tidak mempengaruhi user produksi

### ⚠️ Pembersihan Total (HATI-HATI!)
- **Kriteria**: Semua data mobile_users
- **Tujuan**: Reset total database
- **Risiko**: Menghapus semua data user

## Monitoring dan Verifikasi

### 📊 Sebelum Pembersihan
```sql
-- Cek jumlah data yang akan dibersihkan
SELECT COUNT(*) FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
SELECT COUNT(*) FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%';
```

### 📈 Setelah Pembersihan
```sql
-- Cek hasil pembersihan
SELECT COUNT(*) FROM mobile_users;
SELECT COUNT(*) FROM health_data;
SELECT COUNT(*) FROM wellness_activities;
-- (dan seterusnya)
```

## Troubleshooting

### ❌ Error Koneksi Database
```bash
# Cek apakah MySQL berjalan
sudo systemctl status mysql

# Cek kredensial database
mysql -u root -p -e "SELECT 1;"
```

### ❌ Error Permission
```bash
# Berikan permission execute pada script
chmod +x scripts/cleanup-mobile-users.sh
```

### ❌ Data Tidak Terhapus
- Pastikan kriteria pembersihan sesuai
- Cek apakah ada foreign key constraints
- Verifikasi query DELETE berjalan dengan benar

## Best Practices

### ✅ Sebelum Pembersihan
1. Backup database lengkap
2. Test di environment development
3. Pastikan aplikasi tidak sedang berjalan
4. Review kriteria pembersihan

### ✅ Setelah Pembersihan
1. Test fungsionalitas aplikasi
2. Monitor performa database
3. Verifikasi data yang tersisa
4. Hapus backup tables jika tidak diperlukan

### ✅ Maintenance Rutin
1. Jalankan pembersihan secara berkala (misal: bulanan)
2. Monitor pertumbuhan data
3. Review kriteria pembersihan
4. Update script sesuai kebutuhan

## Kesimpulan

Pembersihan data `mobile_users` adalah proses yang aman dan direkomendasikan untuk:
- ✅ Mengoptimalkan performa database
- ✅ Menghemat ruang penyimpanan
- ✅ Mempertahankan data yang penting
- ✅ Meningkatkan keamanan data

**Penting**: Selalu test di environment development terlebih dahulu sebelum menjalankan di production!
