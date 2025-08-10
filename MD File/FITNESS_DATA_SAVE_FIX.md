# Fix: Data Minutes dan Distance Exercise Tidak Tersimpan di Database

## Masalah
Data minutes (durasi latihan) dan distance (jarak) exercise tidak tersimpan dengan benar di database. Hal ini menyebabkan:
- Data exercise tidak lengkap
- Error di ExerciseHistoryScreen saat mencoba mengakses data yang undefined
- Informasi fitness tracking tidak akurat

## Root Cause
Masalah terjadi karena ada konflik antara dua skema database yang berbeda:

### Skema Lama (02-mobile-app-tables.sql)
```sql
CREATE TABLE fitness_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_name VARCHAR(100) NOT NULL,
    duration_minutes INT NOT NULL,
    calories_burned INT,
    distance_km DECIMAL(6,2),
    intensity ENUM('low', 'moderate', 'high', 'very_high'),
    notes TEXT,
    tracking_date DATE NOT NULL,
    tracking_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Skema Baru (00-complete-setup.sql)
```sql
CREATE TABLE fitness_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tracking_date DATE NOT NULL,
    steps INT DEFAULT 0,
    distance_km DECIMAL(6,2) DEFAULT 0,
    calories_burned INT DEFAULT 0,
    active_minutes INT DEFAULT 0,
    workout_type VARCHAR(100),
    workout_duration_minutes INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Solusi yang Diterapkan

### 1. Perbaikan Backend API (dash-app/app/api/mobile/tracking/fitness/route.js)

#### Deteksi Skema Otomatis
```javascript
// Check database schema first to determine which columns exist
let hasNewSchema = false;
let hasExerciseMinutes = false;

try {
  const schemaCheck = await query("SHOW COLUMNS FROM fitness_tracking LIKE 'workout_type'");
  hasNewSchema = schemaCheck.length > 0;
} catch (error) {
  hasNewSchema = false;
}

try {
  const exerciseMinutesCheck = await query("SHOW COLUMNS FROM fitness_tracking LIKE 'exercise_minutes'");
  hasExerciseMinutes = exerciseMinutesCheck.length > 0;
} catch (error) {
  hasExerciseMinutes = false;
}
```

#### Query INSERT yang Fleksibel
```javascript
if (hasNewSchema) {
  // Use new schema (workout_type, workout_duration_minutes)
  sql = `INSERT INTO fitness_tracking (
    user_id, workout_type, workout_duration_minutes, calories_burned,
    distance_km, steps, notes, tracking_date, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
} else if (hasExerciseMinutes) {
  // Use updated old schema with exercise_minutes column
  sql = `INSERT INTO fitness_tracking (
    user_id, activity_type, activity_name, duration_minutes, exercise_minutes,
    calories_burned, distance_km, steps, intensity, notes, tracking_date, tracking_time, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
} else {
  // Use old schema (activity_type, activity_name, duration_minutes)
  sql = `INSERT INTO fitness_tracking (
    user_id, activity_type, activity_name, duration_minutes, calories_burned,
    distance_km, steps, intensity, notes, tracking_date, tracking_time, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
}
```

### 2. Perbaikan Frontend (src/screens/ExerciseHistoryScreen.tsx)

#### Penanganan Data yang Aman
```typescript
// Sebelum (error-prone)
{(entry.distance_km || 0).toFixed(1)}

// Sesudah (safe)
{typeof entry.distance_km === 'number' ? entry.distance_km.toFixed(1) : '0.0'}
```

#### Perbaikan untuk Semua Field Numerik
```typescript
// Steps
{typeof entry.steps === 'number' ? entry.steps.toLocaleString() : '0'}

// Exercise Minutes
{typeof entry.exercise_minutes === 'number' ? entry.exercise_minutes : 0}

// Calories
{typeof entry.calories_burned === 'number' ? entry.calories_burned : 0}

// Distance
{typeof entry.distance_km === 'number' ? entry.distance_km.toFixed(1) : '0.0'}
```

### 3. Perbaikan Endpoint /today

Endpoint `/today` juga diperbaiki untuk menangani skema yang berbeda:

```javascript
if (hasExerciseMinutes) {
  sql = `SELECT 
    activity_type,
    SUM(COALESCE(exercise_minutes, duration_minutes)) as total_duration,
    SUM(calories_burned) as total_calories,
    SUM(distance_km) as total_distance,
    SUM(steps) as total_steps,
    COUNT(*) as activity_count
  FROM fitness_tracking
  WHERE user_id = ? AND tracking_date = ?
  GROUP BY activity_type
  ORDER BY total_duration DESC`;
}
```

## Testing

### Script Test (scripts/test-fitness-data-save.js)
Script test dibuat untuk memverifikasi bahwa data tersimpan dengan benar:

```javascript
// Test data insertion
const testData = {
  user_id: 1,
  activity_type: 'Walking',
  duration_minutes: 30,
  exercise_minutes: 30,
  calories_burned: 150,
  distance_km: 2.5,
  steps: 3000
};

// Verify data is saved correctly
if (row.duration_minutes === 30 && row.distance_km === 2.5) {
  console.log('✅ Minutes and distance are properly saved!');
}
```

## Cara Menjalankan Test

1. Update password database di `scripts/test-fitness-data-save.js`
2. Jalankan test:
```bash
cd /Volumes/Data\ 2/Project/phc-mobile
node scripts/test-fitness-data-save.js
```

## Hasil yang Diharapkan

Setelah perbaikan ini:
- ✅ Data minutes (durasi latihan) tersimpan dengan benar
- ✅ Data distance (jarak) tersimpan dengan benar
- ✅ Tidak ada error di ExerciseHistoryScreen
- ✅ Data fitness tracking lengkap dan akurat
- ✅ Kompatibilitas dengan berbagai skema database

## Monitoring

Untuk memastikan perbaikan berfungsi:
1. Cek log backend untuk melihat skema yang terdeteksi
2. Test menyimpan data fitness baru
3. Verifikasi data tersimpan di database
4. Cek ExerciseHistoryScreen tidak error

## Catatan Penting

- Perbaikan ini backward compatible dengan skema lama
- Deteksi skema otomatis memastikan aplikasi bekerja dengan berbagai versi database
- Penanganan error yang lebih baik di frontend
- Data test dibersihkan setelah testing
