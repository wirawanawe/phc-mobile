# 🏥 Doctor Duplicate Removal Scripts

Script untuk menghapus data duplikat pada tabel `doctors` di database PHC Mobile.

## 📋 Overview

Script ini akan mengidentifikasi dan menghapus data duplikat berdasarkan kriteria berikut:
1. **Email** - Dokter dengan email yang sama
2. **License Number** - Dokter dengan nomor lisensi yang sama
3. **Name + Phone** - Dokter dengan nama dan nomor telepon yang sama
4. **Name + Specialist** - Dokter dengan nama dan spesialisasi yang sama

## ⚠️ PERINGATAN PENTING

**SEBELUM MENJALANKAN SCRIPT:**
- ✅ **BACKUP DATABASE** terlebih dahulu
- ✅ Pastikan tidak ada transaksi aktif di database
- ✅ Test di environment development terlebih dahulu
- ✅ Data yang dihapus **TIDAK DAPAT DIPULIHKAN**

## 🛠️ Cara Penggunaan

### Metode 1: Menggunakan Shell Script (Direkomendasikan)

```bash
# Dari direktori root project
./scripts/run-remove-duplicates.sh
```

Script ini akan:
- Memeriksa dependencies yang diperlukan
- Meminta konfirmasi sebelum menjalankan
- Menjalankan proses penghapusan duplikat
- Menampilkan hasil akhir

### Metode 2: Menggunakan Node.js Script Langsung

```bash
# Dari direktori root project
node scripts/remove-duplicate-doctors.js
```

### Metode 3: Menggunakan SQL Script

```bash
# Backup database terlebih dahulu
mysqldump -u root -p phc_dashboard > backup_phc_dashboard_$(date +%Y%m%d_%H%M%S).sql

# Jalankan script SQL
mysql -u root -p phc_dashboard < scripts/remove-duplicate-doctors.sql
```

## 🔧 Konfigurasi Database

Pastikan file `.env` berisi konfigurasi database yang benar:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=phc_dashboard
```

## 📊 Apa yang Dilakukan Script

### 1. Identifikasi Duplikat
Script akan mencari duplikat berdasarkan:
- **Email**: Dokter dengan email yang sama
- **License Number**: Dokter dengan nomor lisensi yang sama  
- **Name + Phone**: Dokter dengan nama dan telepon yang sama
- **Name + Specialist**: Dokter dengan nama dan spesialisasi yang sama

### 2. Penanganan Referensi
Sebelum menghapus duplikat, script akan:
- Memeriksa referensi di tabel `visits`
- Memeriksa referensi di tabel `consultations`
- Mengupdate referensi ke record yang akan dipertahankan
- Mempertahankan record dengan ID terkecil

### 3. Penghapusan Duplikat
- Menghapus record duplikat secara aman
- Mempertahankan integritas referensial
- Menampilkan laporan hasil penghapusan

## 📈 Output Script

Script akan menampilkan:
```
🔍 Starting duplicate doctors identification and removal...

📊 Total doctors in database: 25

🔍 Step 1: Finding duplicates based on email...
📋 Found 2 email duplicates:
   - Email: doctor@example.com (3 records, IDs: 1, 5, 12)

🔍 Step 2: Finding duplicates based on license number...
📋 Found 1 license number duplicates:
   - License: SIP.001.2024 (2 records, IDs: 3, 8)

⚠️  Found 3 types of duplicates.
Press Ctrl+C to cancel, or wait 5 seconds to continue with removal...

🗑️  Step 5: Removing duplicates...
   - Email doctor@example.com: Keeping ID 1, removing IDs: 5, 12
     ✅ Deleted 2 duplicate records

📊 Step 6: Verifying results...
📊 Final doctor count: 23
📊 Total records removed: 2

✅ Duplicate removal completed successfully!
```

## 🚨 Troubleshooting

### Error: "Cannot connect to database"
- Periksa konfigurasi database di file `.env`
- Pastikan MySQL server berjalan
- Periksa username dan password database

### Error: "Access denied"
- Pastikan user database memiliki hak akses yang cukup
- Periksa apakah database `phc_dashboard` ada

### Error: "Foreign key constraint"
- Script sudah menangani foreign key constraint secara otomatis
- Jika masih error, periksa apakah ada tabel lain yang mereferensi ke `doctors`

### Script tidak menemukan duplikat
- Ini normal jika database sudah bersih
- Script akan menampilkan "No duplicates found! Database is clean."

## 📝 Log dan Monitoring

Setelah menjalankan script, Anda dapat memeriksa:

```sql
-- Cek jumlah dokter
SELECT COUNT(*) as total_doctors FROM doctors;

-- Cek duplikat yang tersisa (seharusnya 0)
SELECT email, COUNT(*) as count 
FROM doctors 
WHERE email IS NOT NULL 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Cek referensi yang masih valid
SELECT COUNT(*) as visits_with_doctors 
FROM visits v 
JOIN doctors d ON v.doctor_id = d.id;
```

## 🔄 Rollback (Jika Diperlukan)

Jika perlu mengembalikan data:

```bash
# Restore dari backup
mysql -u root -p phc_dashboard < backup_phc_dashboard_YYYYMMDD_HHMMSS.sql
```

## 📞 Support

Jika mengalami masalah:
1. Periksa log error yang ditampilkan
2. Pastikan backup database sudah dibuat
3. Test di environment development terlebih dahulu
4. Hubungi tim development jika masalah berlanjut

## 📋 Checklist Sebelum Menjalankan

- [ ] Database sudah di-backup
- [ ] Environment variables sudah dikonfigurasi
- [ ] Tidak ada transaksi aktif di database
- [ ] Sudah test di environment development
- [ ] Tim sudah diberitahu tentang maintenance
- [ ] Backup script sudah siap untuk rollback

---

**⚠️ Ingat: Data yang dihapus tidak dapat dipulihkan tanpa backup!**
