# 🔐 PIN Database Migration Guide

## Overview
Dokumentasi ini menjelaskan cara menambahkan kolom PIN ke tabel `mobile_users` di database untuk mendukung fitur PIN keamanan.

## Kolom yang Ditambahkan

### Tabel `mobile_users`
```sql
ALTER TABLE mobile_users 
ADD COLUMN pin_enabled BOOLEAN DEFAULT FALSE COMMENT 'Status aktif/nonaktif PIN keamanan',
ADD COLUMN pin_code VARCHAR(255) NULL COMMENT 'PIN keamanan (6 digit) - encrypted',
ADD COLUMN pin_attempts INT DEFAULT 0 COMMENT 'Jumlah percobaan PIN yang salah',
ADD COLUMN pin_locked_until DATETIME NULL COMMENT 'Waktu PIN terkunci sampai',
ADD COLUMN pin_last_attempt DATETIME NULL COMMENT 'Waktu percobaan PIN terakhir';
```

### Indexes
```sql
CREATE INDEX idx_pin_enabled ON mobile_users(pin_enabled);
CREATE INDEX idx_pin_locked_until ON mobile_users(pin_locked_until);
```

### Constraints
```sql
ALTER TABLE mobile_users 
ADD CONSTRAINT chk_pin_attempts CHECK (pin_attempts >= 0 AND pin_attempts <= 10),
ADD CONSTRAINT chk_pin_code_length CHECK (LENGTH(pin_code) = 6 OR pin_code IS NULL);
```

## File Migrasi

### 1. SQL Migration
**File**: `dash-app/init-scripts/18-add-pin-fields.sql`
- Script SQL untuk menambahkan kolom PIN
- Menambahkan indexes dan constraints
- Menampilkan hasil migrasi

### 2. JavaScript Migration
**File**: `scripts/add-pin-fields-to-database.js`
- Script Node.js untuk migrasi
- Pengecekan kolom yang sudah ada
- Error handling yang lebih baik
- Laporan hasil migrasi

### 3. Shell Script
**File**: `scripts/run-pin-migration.sh`
- Script otomatis untuk menjalankan migrasi
- Pengecekan prerequisites
- Verifikasi hasil migrasi
- Laporan lengkap

## Cara Menjalankan Migrasi

### 🚀 Opsi 1: Menggunakan Shell Script (Direkomendasikan)
```bash
./scripts/run-pin-migration.sh
```

### 🔧 Opsi 2: Manual SQL
```bash
mysql -u root -p phc_dashboard < dash-app/init-scripts/18-add-pin-fields.sql
```

### 📱 Opsi 3: JavaScript
```bash
node scripts/add-pin-fields-to-database.js
```

## API Endpoints

### 1. PIN Management (`/api/mobile/pin`)
- **GET**: Get PIN status for user
- **POST**: Enable PIN for user
- **PUT**: Update PIN for user
- **DELETE**: Disable PIN for user

### 2. PIN Validation (`/api/mobile/pin/validate`)
- **POST**: Validate PIN for user
- **GET**: Get PIN validation status

## Contoh Penggunaan API

### Enable PIN
```bash
curl -X POST http://localhost:3001/api/mobile/pin \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user@example.com",
    "pin_code": "123456"
  }'
```

### Validate PIN
```bash
curl -X POST http://localhost:3001/api/mobile/pin/validate \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user@example.com",
    "pin_code": "123456"
  }'
```

### Get PIN Status
```bash
curl "http://localhost:3001/api/mobile/pin?user_id=user@example.com"
```

## Keamanan

### 1. PIN Encryption
- PIN di-hash menggunakan bcrypt dengan salt rounds 10
- PIN tidak disimpan dalam bentuk plain text
- Hash yang aman untuk melindungi data user

### 2. Attempt Limiting
- Maksimal 5 percobaan yang salah
- Lockout otomatis selama 30 menit setelah 5 percobaan
- Reset attempts setelah login berhasil

### 3. Validation
- PIN harus tepat 6 digit angka
- Validasi format di frontend dan backend
- Sanitasi input untuk mencegah injection

## Struktur Database Setelah Migrasi

### Tabel `mobile_users` (Updated)
```sql
CREATE TABLE mobile_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  wellness_program_joined BOOLEAN DEFAULT FALSE,
  wellness_join_date DATETIME,
  fitness_goal ENUM('weight_loss', 'muscle_gain', 'maintenance', 'general_health'),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- PIN Fields (NEW)
  pin_enabled BOOLEAN DEFAULT FALSE,
  pin_code VARCHAR(255) NULL,
  pin_attempts INT DEFAULT 0,
  pin_locked_until DATETIME NULL,
  pin_last_attempt DATETIME NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Verifikasi Migrasi

### 1. Cek Kolom PIN
```sql
SHOW COLUMNS FROM mobile_users LIKE 'pin_%';
```

### 2. Cek Indexes
```sql
SHOW INDEX FROM mobile_users WHERE Key_name LIKE 'idx_pin_%';
```

### 3. Cek Constraints
```sql
SELECT * FROM information_schema.table_constraints 
WHERE table_name = 'mobile_users' AND constraint_name LIKE 'chk_pin_%';
```

### 4. Cek Data
```sql
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN pin_enabled = TRUE THEN 1 ELSE 0 END) as users_with_pin_enabled,
  SUM(CASE WHEN pin_enabled = FALSE THEN 1 ELSE 0 END) as users_without_pin
FROM mobile_users;
```

## Troubleshooting

### 1. Error: Duplicate Column
```
Error: ER_DUP_FIELDNAME: Duplicate column name 'pin_enabled'
```
**Solusi**: Kolom sudah ada, migrasi tidak diperlukan

### 2. Error: Table Not Found
```
Error: ER_NO_SUCH_TABLE: Table 'phc_dashboard.mobile_users' doesn't exist
```
**Solusi**: Pastikan database dan tabel sudah dibuat

### 3. Error: Permission Denied
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user
```
**Solusi**: Periksa kredensial database dan privileges

### 4. Error: Connection Failed
```
Error: ECONNREFUSED: connect ECONNREFUSED
```
**Solusi**: Pastikan MySQL server berjalan

## Rollback (Jika Diperlukan)

### Hapus Kolom PIN
```sql
ALTER TABLE mobile_users 
DROP COLUMN pin_enabled,
DROP COLUMN pin_code,
DROP COLUMN pin_attempts,
DROP COLUMN pin_locked_until,
DROP COLUMN pin_last_attempt;
```

### Hapus Indexes
```sql
DROP INDEX idx_pin_enabled ON mobile_users;
DROP INDEX idx_pin_locked_until ON mobile_users;
```

### Hapus Constraints
```sql
ALTER TABLE mobile_users 
DROP CONSTRAINT chk_pin_attempts,
DROP CONSTRAINT chk_pin_code_length;
```

## Testing

### 1. Test Database Migration
```bash
# Jalankan migrasi
./scripts/run-pin-migration.sh

# Verifikasi hasil
mysql -u root -p phc_dashboard -e "SHOW COLUMNS FROM mobile_users LIKE 'pin_%';"
```

### 2. Test API Endpoints
```bash
# Test enable PIN
curl -X POST http://localhost:3001/api/mobile/pin \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test@example.com", "pin_code": "123456"}'

# Test validate PIN
curl -X POST http://localhost:3001/api/mobile/pin/validate \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test@example.com", "pin_code": "123456"}'
```

### 3. Test Mobile App
1. Restart aplikasi
2. Buka Profile → Pengaturan PIN
3. Aktifkan PIN dengan kode 123456
4. Test dengan keluar dan masuk aplikasi

## Monitoring

### 1. PIN Usage Statistics
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_users,
  SUM(CASE WHEN pin_enabled = TRUE THEN 1 ELSE 0 END) as users_with_pin,
  ROUND(SUM(CASE WHEN pin_enabled = TRUE THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pin_adoption_rate
FROM mobile_users 
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 2. Failed PIN Attempts
```sql
SELECT 
  COUNT(*) as total_failed_attempts,
  COUNT(DISTINCT user_id) as users_with_failed_attempts,
  AVG(pin_attempts) as avg_attempts_per_user
FROM mobile_users 
WHERE pin_attempts > 0;
```

### 3. PIN Lockouts
```sql
SELECT 
  COUNT(*) as total_lockouts,
  COUNT(DISTINCT user_id) as users_locked_out
FROM mobile_users 
WHERE pin_locked_until IS NOT NULL AND pin_locked_until > NOW();
```

## Conclusion

Migrasi database PIN telah berhasil diimplementasikan dengan:
- ✅ Kolom PIN yang aman dan terenkripsi
- ✅ Attempt limiting dan lockout mechanism
- ✅ API endpoints untuk management dan validasi
- ✅ Script migrasi otomatis
- ✅ Dokumentasi lengkap
- ✅ Testing dan monitoring tools

Fitur PIN keamanan siap digunakan setelah migrasi database selesai.
