# Database Cleanup Scripts

Script ini digunakan untuk membersihkan semua data di database kecuali data misi dan habit.

## 📋 Apa yang akan dibersihkan

### Data yang akan DIHAPUS:
- **Dashboard Data:**
  - Semua data pasien (`patients`)
  - Semua data kunjungan (`visits`)
  - Semua data pemeriksaan (`examinations`)
  - Semua data dokter (`doctors`)
  - Semua data obat (`medicines`)
  - Semua data pengguna kecuali superadmin (`users`)
  - Semua data klinik kecuali 1 (`clinics`)
  - Semua data poliklinik (`polyclinics`)
  - Semua data asuransi (`insurances`)
  - Semua data perusahaan (`companies`)
  - Semua data perawatan (`treatments`)
  - Semua data ICD (`icd`)

- **Mobile App Data:**
  - Semua data aktivitas wellness (`wellness_activities`)
  - Semua data tracking mood (`mood_tracking`)
  - Semua data tracking air (`water_tracking`)
  - Semua data tracking tidur (`sleep_tracking`)
  - Semua data tracking fitness (`fitness_tracking`)
  - Semua data kesehatan (`health_data`)
  - Semua data assessment (`assessments`)
  - Semua data chat (`chats`, `chat_messages`)
  - Semua data konsultasi (`consultations`)
  - Semua data makanan (`meal_tracking`, `meal_foods`)
  - Semua data makanan cepat (`user_quick_foods`)
  - Semua data makanan tidak terverifikasi (`food_database` - hanya yang `is_verified = FALSE`)
  - Semua data pengguna mobile (`mobile_users`)

### Data yang akan DIPERTAHANKAN:
- **Mission Data:**
  - Definisi misi (`missions`)
  - Progress misi pengguna (`user_missions`)

- **Habit Data:**
  - Definisi aktivitas habit (`available_habit_activities`)
  - Progress habit pengguna (`user_habit_activities`)

- **System Data:**
  - User superadmin (`users` dengan `role = 'superadmin'`)
  - Struktur klinik dasar (`clinics` dengan `id = 1`)

## 🚀 Cara Menjalankan

### Opsi 1: Menggunakan Shell Script (Direkomendasikan)

```bash
# Dari root directory project
./scripts/run-cleanup.sh
```

Script ini akan:
- Meminta konfirmasi sebelum menjalankan
- Mengatur konfigurasi database otomatis
- Menjalankan cleanup dengan logging yang detail
- Menampilkan hasil verifikasi

### Opsi 2: Menggunakan Node.js Script

```bash
# Dari root directory project
node scripts/clean-database-except-missions-habits.js
```

### Opsi 3: Menggunakan SQL Script Langsung

```bash
# Menggunakan MySQL client
mysql -h localhost -u root -p phc_dashboard < scripts/clean-database-except-missions-habits.sql
```

## ⚙️ Konfigurasi Database

Script menggunakan environment variables berikut:

```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=phc_dashboard
export DB_PORT=3306
```

Atau bisa diatur saat menjalankan script:

```bash
DB_HOST=localhost DB_USER=root DB_PASSWORD=password ./scripts/run-cleanup.sh
```

## 🔍 Verifikasi Hasil

Setelah cleanup selesai, script akan menampilkan:

1. **Data yang Dipertahankan:**
   - Jumlah record di tabel `missions`
   - Jumlah record di tabel `user_missions`
   - Jumlah record di tabel `available_habit_activities`
   - Jumlah record di tabel `user_habit_activities`

2. **Data yang Dibersihkan:**
   - Jumlah record di semua tabel lain (seharusnya 0 atau minimal)

## ⚠️ Peringatan Penting

1. **Backup Database:** Selalu backup database sebelum menjalankan cleanup
2. **Konfirmasi:** Script akan meminta konfirmasi sebelum menjalankan
3. **Irreversible:** Proses ini tidak dapat dibatalkan setelah dijalankan
4. **Testing:** Test di environment development terlebih dahulu

## 🔧 Troubleshooting

### Error: "MySQL client not found"
```bash
# Install MySQL client atau gunakan Node.js script
npm install mysql2
node scripts/clean-database-except-missions-habits.js
```

### Error: "Access denied"
- Periksa konfigurasi database (host, user, password)
- Pastikan user memiliki hak akses penuh ke database

### Error: "Table doesn't exist"
- Pastikan database sudah dibuat dan tabel sudah ada
- Jalankan script setup database terlebih dahulu

## 📝 Log Output

Script akan menampilkan log detail seperti:

```
🚀 Starting database cleanup...
📋 Database config: { host: 'localhost', port: 3306, database: 'phc_dashboard', user: 'root' }
🔗 Connecting to database...
✅ Connected to database successfully
📖 Reading cleanup script...
📝 Found 45 SQL statements to execute
⚡ Executing statement 1/45...
✅ Statement 1 executed successfully
...
📊 PRESERVED DATA:
   MISSIONS: 5 records
   USER_MISSIONS: 0 records
   AVAILABLE_HABIT_ACTIVITIES: 25 records
   USER_HABIT_ACTIVITIES: 0 records

🧹 CLEANED DATA:
   EXAMINATIONS: 0 records
   VISITS: 0 records
   PATIENTS: 0 records
   ...
🎉 Database cleanup completed successfully!
```

## 📞 Support

Jika ada masalah atau pertanyaan, silakan hubungi tim development.
