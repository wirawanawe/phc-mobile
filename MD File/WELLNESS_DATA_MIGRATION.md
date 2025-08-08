# Wellness Data Migration - Perhitungan Usia Otomatis

## Overview
Implementasi perubahan untuk wellness program yang menghitung usia otomatis dari tanggal lahir dan memindahkan data kesehatan ke tabel `health_data`.

## Perubahan Utama

### 1. Perhitungan Usia Otomatis
- **Fitur**: Usia user dihitung otomatis dari tanggal lahir saat registrasi
- **Rumus**: Usia = Tahun saat ini - Tahun lahir (dengan penyesuaian bulan dan tanggal)
- **Implementasi**: Fungsi `calculateAge()` di API endpoint `/mobile/setup-wellness`

### 2. Migrasi Data Kesehatan
- **Dari**: Tabel `mobile_users` (kolom weight, height, age, blood_type)
- **Ke**: Tabel `health_data` (data_type: 'weight', 'height')
- **Alasan**: Pemisahan data kesehatan untuk tracking historis yang lebih baik

### 3. Struktur Database Baru

#### Tabel `mobile_users` (Setelah Migrasi)
```sql
CREATE TABLE mobile_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  date_of_birth DATE, -- Tetap ada untuk perhitungan usia
  gender ENUM('male','female','other'),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  wellness_program_joined BOOLEAN DEFAULT FALSE,
  wellness_join_date DATETIME NULL,
  fitness_goal ENUM('weight_loss', 'muscle_gain', 'maintenance', 'general_fitness') DEFAULT 'general_fitness',
  activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active') DEFAULT 'moderately_active',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Tabel `health_data` (Untuk Data Kesehatan)
```sql
CREATE TABLE health_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  data_type ENUM('blood_pressure', 'heart_rate', 'temperature', 'weight', 'height', 'bmi', 'blood_sugar', 'cholesterol') NOT NULL,
  value DECIMAL(8,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  systolic_value DECIMAL(8,2),
  diastolic_value DECIMAL(8,2),
  notes TEXT,
  measured_at TIMESTAMP NOT NULL,
  source ENUM('manual', 'device', 'doctor') NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_data_type (data_type),
  INDEX idx_measured_at (measured_at)
);
```

## API Endpoints Baru

### 1. Setup Wellness (`/mobile/setup-wellness`)

#### GET - Check Status
```javascript
GET /api/mobile/setup-wellness
```
**Response:**
```json
{
  "success": true,
  "data": {
    "wellness_program_joined": false,
    "wellness_join_date": null,
    "fitness_goal": "general_fitness",
    "activity_level": "moderately_active",
    "has_health_data": false,
    "needs_setup": true
  }
}
```

#### POST - Setup Wellness
```javascript
POST /api/mobile/setup-wellness
{
  "weight": 70,
  "height": 170,
  "gender": "male",
  "activity_level": "moderately_active",
  "fitness_goal": "weight_loss"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Wellness program berhasil disetup!",
  "data": {
    "age": 25,
    "weight": 70,
    "height": 170,
    "gender": "male",
    "activity_level": "moderately_active",
    "fitness_goal": "weight_loss",
    "wellness_program_joined": true,
    "wellness_join_date": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT - Update Wellness Data
```javascript
PUT /api/mobile/setup-wellness
{
  "weight": 72,
  "height": 170,
  "fitness_goal": "maintenance",
  "activity_level": "very_active"
}
```

### 2. Health Data (`/mobile/health_data`)

#### GET - Get Health Data
```javascript
GET /api/mobile/health_data
GET /api/mobile/health_data?type=weight&limit=10
```
**Response:**
```json
{
  "success": true,
  "data": {
    "age": 25,
    "gender": "male",
    "fitness_goal": "weight_loss",
    "activity_level": "moderately_active",
    "latest_data": {
      "weight": {
        "id": 1,
        "value": 70,
        "unit": "kg",
        "measured_at": "2024-01-01T10:00:00.000Z",
        "source": "manual"
      },
      "height": {
        "id": 2,
        "value": 170,
        "unit": "cm",
        "measured_at": "2024-01-01T10:00:00.000Z",
        "source": "manual"
      }
    },
    "all_data": {
      "weight": [...],
      "height": [...]
    }
  }
}
```

#### POST - Add Health Data
```javascript
POST /api/mobile/health_data
{
  "data_type": "weight",
  "value": 72,
  "unit": "kg",
  "notes": "Setelah olahraga",
  "source": "manual"
}
```

## Frontend Changes

### 1. WellnessApp.tsx
- **Hapus input usia**: User tidak perlu input usia lagi
- **Tampilkan info**: "Usia akan dihitung otomatis dari tanggal lahir Anda"
- **Update API call**: Menggunakan `apiService.setupWellness()` yang baru

### 2. API Service
- **Method baru**: `setupWellness()`, `getWellnessSetupStatus()`, `updateWellnessData()`
- **Method baru**: `getHealthData()`, `addHealthData()`

## Migration Script

### File: `dash-app/init-scripts/22-wellness-data-migration.sql`
```sql
-- 1. Migrasi data dari mobile_users ke health_data
INSERT INTO health_data (user_id, data_type, value, unit, measured_at, source)
SELECT id, 'weight', weight, 'kg', NOW(), 'manual'
FROM mobile_users WHERE weight IS NOT NULL AND weight > 0;

INSERT INTO health_data (user_id, data_type, value, unit, measured_at, source)
SELECT id, 'height', height, 'cm', NOW(), 'manual'
FROM mobile_users WHERE height IS NOT NULL AND height > 0;

-- 2. Hapus kolom kesehatan dari mobile_users
ALTER TABLE mobile_users 
DROP COLUMN IF EXISTS weight,
DROP COLUMN IF EXISTS height,
DROP COLUMN IF EXISTS age,
DROP COLUMN IF EXISTS blood_type;

-- 3. Tambahkan kolom wellness
ALTER TABLE mobile_users 
ADD COLUMN IF NOT EXISTS wellness_program_joined BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS wellness_join_date DATETIME NULL,
ADD COLUMN IF NOT EXISTS fitness_goal ENUM('weight_loss', 'muscle_gain', 'maintenance', 'general_fitness') DEFAULT 'general_fitness',
ADD COLUMN IF NOT EXISTS activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active') DEFAULT 'moderately_active';
```

## Keuntungan Perubahan

### 1. User Experience
- **Tidak perlu input usia**: Otomatis dari tanggal lahir
- **Data historis**: Tracking berat badan dan tinggi badan dari waktu ke waktu
- **Konsistensi**: Data kesehatan terpusat di satu tabel

### 2. Data Management
- **Pemisahan data**: Data kesehatan terpisah dari data user
- **Tracking historis**: Bisa melihat perubahan berat badan/tinggi badan
- **Fleksibilitas**: Bisa menambah tipe data kesehatan baru

### 3. Technical Benefits
- **Normalisasi database**: Struktur yang lebih baik
- **Scalability**: Mudah menambah fitur kesehatan baru
- **Performance**: Index yang optimal untuk query kesehatan

## Testing

### 1. Test Setup Wellness
```bash
# Test setup wellness
curl -X POST http://localhost:3000/api/mobile/setup-wellness \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "weight": 70,
    "height": 170,
    "gender": "male",
    "activity_level": "moderately_active",
    "fitness_goal": "weight_loss"
  }'
```

### 2. Test Get Health Data
```bash
# Test get health data
curl -X GET http://localhost:3000/api/mobile/health_data \
  -H "Authorization: Bearer <token>"
```

### 3. Test Add Health Data
```bash
# Test add health data
curl -X POST http://localhost:3000/api/mobile/health_data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "data_type": "weight",
    "value": 72,
    "unit": "kg",
    "notes": "Setelah olahraga"
  }'
```

## Error Handling

### 1. Tanggal Lahir Tidak Ada
```json
{
  "success": false,
  "message": "Tanggal lahir tidak ditemukan. Silakan update profil terlebih dahulu."
}
```

### 2. Data Tidak Lengkap
```json
{
  "success": false,
  "message": "Semua field harus diisi: weight, height, gender, activity_level, fitness_goal"
}
```

### 3. Nilai Tidak Valid
```json
{
  "success": false,
  "message": "Berat badan dan tinggi badan harus lebih dari 0"
}
```

## Future Enhancements

### 1. BMI Calculation
- Otomatis hitung BMI dari weight dan height
- Simpan di health_data dengan data_type 'bmi'

### 2. Health Trends
- Grafik perubahan berat badan dari waktu ke waktu
- Analisis tren kesehatan

### 3. Health Goals
- Set target berat badan
- Tracking progress menuju goal

### 4. Integration dengan Device
- Sync data dari smart scale
- Import data dari fitness tracker
