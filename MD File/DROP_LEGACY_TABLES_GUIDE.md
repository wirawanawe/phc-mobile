# Panduan Drop Legacy Tables

## 🗑️ Drop Tabel Legacy yang Tidak Digunakan

Panduan ini menjelaskan cara menghapus tabel legacy yang sudah tidak digunakan di database `phc_dashboard`.

## 📊 Hasil Analisis Database

### Total Tabel: 40

**Kategorisasi:**
- 🔴 **Critical Tables**: 16 (JANGAN DROP)
- 🟢 **Active Tables**: 16 (Digunakan mobile app)
- 🟡 **Legacy Tables**: 7 (Mungkin aman drop)
- 🛡️ **Protected Tables**: 1 (System tables/views)

## 🟡 Legacy Tables yang Dapat Di-Drop

Berdasarkan analisis mendalam, tabel berikut diidentifikasi sebagai **legacy tables** yang mungkin aman untuk di-drop:

1. **`assessments`** - Sistem assessment lama
2. **`clinic_polyclinics`** - Junction table yang mungkin redundant
3. **`clinic_rooms`** - Sistem manajemen ruangan yang tidak digunakan
4. **`doctor_specializations`** - Specialization yang mungkin redundant dengan tabel doctors
5. **`examinations`** - Sistem pemeriksaan lama
6. **`phc_office_admin`** - Sistem admin panel yang tidak digunakan
7. **`visits`** - Sistem kunjungan lama

## 🚀 Cara Drop Legacy Tables

### Method 1: Script Otomatis (Recommended)

```bash
# Jalankan script drop legacy tables dengan aman
./scripts/drop-legacy-tables-safe.sh
```

Script ini akan:
1. ✅ Backup semua legacy tables
2. ✅ Drop legacy tables dengan aman
3. ✅ Verifikasi hasil drop
4. ✅ Berikan instruksi selanjutnya

### Method 2: Manual Drop

```bash
# Step 1: Backup legacy tables
mysql -u root -p phc_dashboard < scripts/backup-legacy-tables.sql

# Step 2: Drop legacy tables
mysql -u root -p phc_dashboard < scripts/drop-legacy-tables.sql
```

## 📋 Langkah Sebelum Drop

### 1. Backup Legacy Tables
```sql
-- Backup semua legacy tables dengan timestamp
CREATE TABLE backup_legacy_assessments_2024-01-XX AS SELECT * FROM assessments;
CREATE TABLE backup_legacy_clinic_polyclinics_2024-01-XX AS SELECT * FROM clinic_polyclinics;
-- dst...
```

### 2. Cek Foreign Key References
```sql
-- Cek apakah ada foreign key yang merujuk ke legacy tables
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'phc_dashboard'
AND REFERENCED_TABLE_NAME IN (
    'assessments',
    'clinic_polyclinics',
    'clinic_rooms',
    'doctor_specializations',
    'examinations',
    'phc_office_admin',
    'visits'
);
```

### 3. Test Aplikasi
- Test semua fitur aplikasi
- Cek error log
- Pastikan tidak ada broken references

## 🔍 Verifikasi Setelah Drop

### Cek Tabel yang Tersisa
```sql
-- Cek total tabel setelah drop
SELECT COUNT(*) as total_tables 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'phc_dashboard' 
AND TABLE_TYPE = 'BASE TABLE';

-- List semua tabel yang tersisa
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'phc_dashboard' 
AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
```

### Expected Result
Setelah drop legacy tables, total tabel seharusnya berkurang dari **40** menjadi **33** tabel.

## 🛠️ Troubleshooting

### Jika Ada Error Setelah Drop

1. **Restore dari Backup**
```sql
-- Restore tabel yang di-drop
CREATE TABLE assessments AS SELECT * FROM backup_legacy_assessments_2024-01-XX;
CREATE TABLE clinic_polyclinics AS SELECT * FROM backup_legacy_clinic_polyclinics_2024-01-XX;
-- dst...
```

2. **Cek Error Log**
```bash
# Cek error log aplikasi
tail -f backend.log
```

3. **Test Fitur yang Bermasalah**
- Identifikasi fitur yang error
- Cek apakah ada referensi ke tabel yang di-drop
- Perbaiki kode jika diperlukan

## 📊 Analisis Tambahan

### Potential Duplicates
- **`assessments` vs `examinations`**: Kedua tabel untuk pemeriksaan medis
- **`clinic_polyclinics` vs `polyclinics`**: Junction table yang mungkin redundant
- **`doctor_specializations` vs `doctors`**: Specialization mungkin sudah ada di tabel doctors

### Unused Features
- **`clinic_rooms`**: Room management system
- **`phc_office_admin`**: Admin panel system
- **`assessments`**: Old assessment system
- **`examinations`**: Old examination system

## ⚠️ Peringatan

- **PERMANENT**: Drop table bersifat permanen
- **BACKUP**: Selalu backup sebelum drop
- **TESTING**: Test di environment development dulu
- **MONITORING**: Monitor aplikasi setelah drop

## 📞 Support

Jika ada masalah:
1. Cek error log aplikasi
2. Restore dari backup jika diperlukan
3. Test fitur yang bermasalah
4. Perbaiki kode jika ada referensi ke tabel yang di-drop

---

**Note**: Script ini hanya untuk development/testing. Jangan gunakan di production environment tanpa backup yang memadai.
