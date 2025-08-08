# Debug: Data Jarak (Distance) Menampilkan 0 di Card Exercise Entries

## Masalah
Data jarak (distance) di card "Your Exercise Entries" menampilkan 0.0 km padahal sudah diinput dengan nilai yang benar.

## Analisis Masalah

### 1. **Kemungkinan Penyebab:**
- Field mapping yang tidak sesuai antara backend dan frontend
- Data tidak tersimpan dengan benar di database
- Tipe data yang tidak sesuai (string vs number)
- Field name yang berbeda antara skema database

### 2. **Debug yang Dilakukan:**

#### A. Frontend Debug (ExerciseHistoryScreen.tsx)
```typescript
// Menambahkan logging untuk debug response API
const loadExerciseHistory = async () => {
  try {
    const response = await api.getFitnessHistory();
    
    console.log('🔍 API Response:', JSON.stringify(response, null, 2));
    
    if (response.success && response.data) {
      // Debug: Log first entry to see field names
      if (response.data.length > 0) {
        console.log('🔍 First entry fields:', Object.keys(response.data[0]));
        console.log('🔍 First entry data:', response.data[0]);
      }
      
      // Map the data to ensure correct field names
      const mappedData = response.data.map((entry: any) => ({
        id: entry.id,
        steps: entry.steps || 0,
        exercise_minutes: entry.exercise_minutes || entry.duration_minutes || 0,
        calories_burned: entry.calories_burned || 0,
        distance_km: entry.distance_km || 0,
        workout_type: entry.workout_type || entry.activity_type || 'Exercise',
        notes: entry.notes || '',
        created_at: entry.created_at,
        updated_at: entry.updated_at
      }));
      
      console.log('🔍 Mapped data:', mappedData);
      setExerciseHistory(mappedData);
    }
  } catch (error) {
    console.error("Error loading exercise history:", error);
  }
};
```

#### B. Distance Display Debug
```typescript
// Menambahkan logging untuk debug distance display
<Text style={styles.statValue}>
  {(() => {
    const distance = entry.distance_km;
    console.log('🔍 Distance for entry', entry.id, ':', distance, 'type:', typeof distance);
    if (typeof distance === 'number' && distance > 0) {
      return distance.toFixed(1);
    } else if (distance === 0) {
      return '0.0';
    } else {
      return '0.0';
    }
  })()}
</Text>
```

### 3. **Script Debug yang Dibuat:**

#### A. `scripts/debug-fitness-data.js`
- Cek struktur tabel database
- Cek data yang tersimpan di database
- Test insert data dengan distance
- Verifikasi data tersimpan dengan benar

#### B. `scripts/test-fitness-distance.js`
- Test API endpoint dengan distance
- Test database langsung
- Verifikasi data dari API ke frontend

## Solusi yang Diterapkan

### 1. **Field Mapping yang Fleksibel**
```typescript
// Map data dengan fallback untuk berbagai nama field
const mappedData = response.data.map((entry: any) => ({
  id: entry.id,
  steps: entry.steps || 0,
  exercise_minutes: entry.exercise_minutes || entry.duration_minutes || 0,
  calories_burned: entry.calories_burned || 0,
  distance_km: entry.distance_km || 0, // Pastikan field name benar
  workout_type: entry.workout_type || entry.activity_type || 'Exercise',
  notes: entry.notes || '',
  created_at: entry.created_at,
  updated_at: entry.updated_at
}));
```

### 2. **Backend Schema Detection**
```javascript
// Deteksi skema database untuk memastikan query yang benar
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

### 3. **Safe Distance Display**
```typescript
// Penanganan yang aman untuk display distance
{(() => {
  const distance = entry.distance_km;
  console.log('🔍 Distance for entry', entry.id, ':', distance, 'type:', typeof distance);
  if (typeof distance === 'number' && distance > 0) {
    return distance.toFixed(1);
  } else if (distance === 0) {
    return '0.0';
  } else {
    return '0.0';
  }
})()}
```

## Cara Menjalankan Debug

### 1. **Debug Database**
```bash
# Update password di script
cd /Volumes/Data\ 2/Project/phc-mobile
node scripts/debug-fitness-data.js
```

### 2. **Test Distance API**
```bash
# Update password di script
node scripts/test-fitness-distance.js
```

### 3. **Cek Log Frontend**
- Buka aplikasi mobile
- Buka ExerciseHistoryScreen
- Cek console log untuk melihat debug output

## Hasil Debug yang Diharapkan

### ✅ **Jika Database OK:**
- Data distance tersimpan dengan benar di database
- Field `distance_km` ada dan berisi nilai yang benar
- Tipe data adalah `number`

### ✅ **Jika API OK:**
- Endpoint mengembalikan data dengan field `distance_km`
- Nilai distance tidak null atau undefined
- Response format konsisten

### ✅ **Jika Frontend OK:**
- Data mapping berhasil
- Distance ditampilkan dengan format yang benar
- Tidak ada error di console

## Troubleshooting

### Jika distance masih 0:

1. **Cek Database:**
   ```sql
   SELECT id, activity_type, distance_km, created_at 
   FROM fitness_tracking 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

2. **Cek API Response:**
   - Buka browser developer tools
   - Cek network tab untuk response API
   - Pastikan field `distance_km` ada dan berisi nilai

3. **Cek Frontend Log:**
   - Buka React Native debugger
   - Cek console log untuk debug output
   - Pastikan data mapping berhasil

### Jika ada error:

1. **Database Error:**
   - Cek koneksi database
   - Cek struktur tabel
   - Cek permission user

2. **API Error:**
   - Cek server log
   - Cek endpoint URL
   - Cek authentication token

3. **Frontend Error:**
   - Cek React Native log
   - Cek data mapping
   - Cek component rendering

## Monitoring

### 1. **Cek Log Server**
```bash
cd dash-app && npm run dev
# Cek console untuk error atau debug info
```

### 2. **Cek Database**
```sql
-- Cek data terbaru
SELECT * FROM fitness_tracking ORDER BY created_at DESC LIMIT 5;

-- Cek field distance_km
SELECT id, distance_km, activity_type FROM fitness_tracking WHERE distance_km > 0;
```

### 3. **Cek Frontend**
- Buka aplikasi mobile
- Buka ExerciseHistoryScreen
- Cek console log untuk debug output

## Catatan Penting

- **Field Mapping**: Pastikan field `distance_km` konsisten antara backend dan frontend
- **Data Type**: Pastikan distance disimpan sebagai `number`, bukan `string`
- **Null Handling**: Pastikan nilai null/undefined ditangani dengan benar
- **Debug Logging**: Gunakan console.log untuk debug di development
- **Testing**: Test dengan berbagai nilai distance (0, 0.5, 1.0, 5.0, dll)
