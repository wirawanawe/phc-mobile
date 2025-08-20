# Wellness Program Duration Feature

## Overview
Fitur durasi program wellness memungkinkan user untuk menentukan berapa lama mereka akan mengikuti program wellness saat pertama kali mendaftar. Durasi program ini akan ditampilkan di halaman report program wellness untuk monitoring progress.

## Fitur Utama

### 1. **Pemilihan Durasi Program**
- User dapat memilih durasi program wellness saat onboarding
- Rentang durasi: 7-365 hari
- Default durasi: 30 hari
- Validasi input untuk memastikan durasi dalam rentang yang valid

### 2. **Database Schema**
Field baru yang ditambahkan ke tabel `mobile_users`:
```sql
wellness_program_duration INT NULL COMMENT 'Durasi program wellness dalam hari'
```

### 3. **API Endpoints yang Diupdate**

#### Setup Wellness (`POST /api/mobile/setup-wellness`)
**Request Body:**
```json
{
  "weight": 70,
  "height": 170,
  "gender": "male",
  "activity_level": "moderately_active",
  "fitness_goal": "weight_loss",
  "program_duration": 30
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
    "program_duration": 30,
    "wellness_program_joined": true,
    "wellness_join_date": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Wellness Status (`GET /api/mobile/wellness/status`)
**Response:**
```json
{
  "success": true,
  "data": {
    "has_joined": true,
    "join_date": "2024-01-01T00:00:00.000Z",
    "program_duration": 30,
    "fitness_goal": "weight_loss",
    "activity_level": "moderately_active",
    "has_missions": true,
    "mission_count": 5,
    "profile_complete": true,
    "needs_onboarding": false,
    "age": 25
  }
}
```

#### Wellness Progress (`GET /api/mobile/wellness-progress/[id]`)
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
    "wellness_program_duration": 30,
    "age": 25,
    "gender": "male",
    "activity_level": "moderately_active",
    "fitness_goal": "weight_loss"
  },
  "progress": {
    // ... existing progress data
  }
}
```

### 4. **Frontend Updates**

#### Onboarding Form (WellnessApp.tsx)
- Menambahkan field input untuk durasi program
- Validasi input (7-365 hari)
- Default value: 30 hari
- Styling yang konsisten dengan form lainnya

#### Report Wellness Progress (Web Dashboard)
- Menampilkan durasi program di informasi profil user
- Format: "X hari" atau "-" jika tidak ada data

### 5. **Validasi**
- **Minimum durasi**: 7 hari
- **Maximum durasi**: 365 hari
- **Default durasi**: 30 hari untuk user yang sudah ada
- **Input validation**: Hanya menerima angka dalam rentang valid

## Database Migration

### Script Migration
File: `dash-app/scripts/add-wellness-duration-field.sql`

```sql
-- Add wellness program duration field
ALTER TABLE mobile_users 
ADD COLUMN wellness_program_duration INT NULL COMMENT 'Durasi program wellness dalam hari';

-- Add index for performance
CREATE INDEX idx_wellness_program_duration ON mobile_users(wellness_program_duration);

-- Update existing users
UPDATE mobile_users 
SET wellness_program_duration = 30
WHERE wellness_program_joined = TRUE AND wellness_program_duration IS NULL;
```

### Cara Menjalankan Migration
```bash
# Masuk ke direktori backend
cd dash-app

# Jalankan script migration
mysql -u [username] -p [database] < scripts/add-wellness-duration-field.sql
```

## UI/UX Improvements

### Onboarding Screen
- Field durasi program ditambahkan setelah field fitness goal
- Input dengan validasi real-time
- Hint text menunjukkan rentang yang valid
- Styling yang konsisten dengan field lainnya

### Report Screen
- Informasi durasi program ditampilkan di bagian profil user
- Format yang mudah dibaca (contoh: "30 hari")
- Konsisten dengan informasi profil lainnya

## Testing

### Test Cases
1. **Valid Input**: Durasi 7-365 hari
2. **Invalid Input**: Durasi < 7 atau > 365 hari
3. **Empty Input**: Durasi kosong
4. **Existing Users**: User yang sudah ada mendapat default 30 hari
5. **API Response**: Semua endpoint mengembalikan field durasi program
6. **UI Display**: Field durasi ditampilkan dengan benar di form dan report

### Manual Testing Steps
1. **Setup Database**: Jalankan script migration
2. **Test Onboarding**: Daftar user baru dan pilih durasi program
3. **Test API**: Verifikasi semua endpoint mengembalikan field durasi
4. **Test Report**: Cek halaman report menampilkan durasi program
5. **Test Validation**: Coba input durasi di luar rentang valid

## Future Enhancements

### 1. **Progress Tracking**
- Menampilkan progress berdasarkan durasi program
- Indikator sisa waktu program
- Notifikasi ketika program akan berakhir

### 2. **Program Extension**
- Kemampuan untuk memperpanjang durasi program
- Opsi untuk mengubah durasi setelah program dimulai

### 3. **Analytics**
- Analisis performa berdasarkan durasi program
- Rekomendasi durasi optimal berdasarkan goal user

### 4. **Notifications**
- Reminder ketika program akan berakhir
- Saran untuk memperpanjang program jika progress baik

## Files Modified

### Backend
- `dash-app/app/api/mobile/setup-wellness/route.js`
- `dash-app/app/api/mobile/wellness/status/route.js`
- `dash-app/app/api/mobile/wellness-progress/[id]/route.js`
- `dash-app/app/api/mobile/wellness-progress/route.js`
- `dash-app/init-scripts/16-add-wellness-program-fields.sql`
- `dash-app/scripts/add-wellness-duration-field.sql`

### Frontend
- `src/screens/WellnessApp.tsx`
- `dash-app/app/mobile/wellness-progress/page.js`

### Documentation
- `MD File/WELLNESS_PROGRAM_DURATION_FEATURE.md`

## Deployment Notes

1. **Database Migration**: Jalankan script migration terlebih dahulu
2. **API Updates**: Deploy backend dengan endpoint yang diupdate
3. **Frontend Updates**: Deploy mobile app dan web dashboard
4. **Testing**: Verifikasi semua fitur berfungsi dengan benar
5. **Monitoring**: Pantau error log untuk masalah yang mungkin muncul
