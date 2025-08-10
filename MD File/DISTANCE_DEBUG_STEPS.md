# Debug Steps: Masalah Distance Exercise Belum Muncul

## Status Saat Ini
Data jarak (distance) exercise masih menampilkan 0.0 km di card "Your Exercise Entries" padahal data di database sudah benar.

## Analisis Database
Dari query database, ditemukan:
- ✅ Data distance_km ada di database dengan nilai yang benar (5.00, 3.50, dll)
- ✅ User IDs yang ada: 5, 6, 22
- ✅ Field `distance_km` bertipe `DECIMAL(6,2)`

## Debug Steps yang Telah Dilakukan

### 1. **Database Verification** ✅
```sql
-- Cek data yang ada
SELECT id, user_id, activity_type, distance_km, created_at 
FROM fitness_tracking 
ORDER BY created_at DESC LIMIT 5;

-- Hasil: Data distance ada dan benar
| id | user_id | activity_type | distance_km | created_at |
|----|---------|---------------|-------------|------------|
|  9 |      22 | Running       |        5.00 | 2025-08-07 |
|  6 |       6 | Walking       |        3.50 | 2025-08-07 |
|  5 |       6 | Walking       |        3.50 | 2025-08-07 |
```

### 2. **Frontend Debug Logging** ✅
Menambahkan logging detail di `ExerciseHistoryScreen.tsx`:
```typescript
// Debug API response
console.log('🔍 API Response:', JSON.stringify(response, null, 2));

// Debug field mapping
console.log('🔍 First entry fields:', Object.keys(response.data[0]));
console.log('🔍 Distance field analysis:', firstEntry.distance_km);

// Debug distance display
console.log('🔍 Distance for entry', entry.id, ':', distance, 'type:', typeof distance);
```

### 3. **Backend Schema Detection** ✅
Backend sudah mendeteksi skema dengan benar:
```javascript
// Deteksi skema otomatis
let hasNewSchema = false;
let hasExerciseMinutes = false;

// Query yang fleksibel untuk berbagai skema
if (hasExerciseMinutes) {
  sql = `SELECT id, user_id, activity_type, distance_km, ... FROM fitness_tracking`;
}
```

### 4. **Script Debug** ✅
Membuat script untuk test:
- `scripts/debug-fitness-data.js` - Debug database langsung
- `scripts/test-fitness-distance.js` - Test API dengan distance
- `scripts/test-user-fitness.js` - Test data per user

## Kemungkinan Penyebab Masalah

### 1. **User ID Mismatch** 🔍
- Database memiliki data untuk user ID: 5, 6, 22
- Aplikasi mobile mungkin menggunakan user ID yang berbeda
- **Solusi**: Cek user ID yang digunakan aplikasi mobile

### 2. **Authentication Issue** 🔍
- API memerlukan token yang valid
- Token mungkin tidak valid atau expired
- **Solusi**: Cek token authentication

### 3. **Field Mapping Issue** 🔍
- Field name mungkin berbeda antara backend dan frontend
- **Solusi**: Cek response API untuk field names

### 4. **Data Type Issue** 🔍
- Distance mungkin dikirim sebagai string bukan number
- **Solusi**: Cek tipe data di response API

## Langkah Debug Selanjutnya

### 1. **Cek User ID yang Digunakan**
```bash
# Cek user ID di aplikasi mobile
# Buka console log dan cari "user_id" atau "user"
```

### 2. **Test dengan User ID yang Ada**
```bash
# Update script test dengan user ID yang ada di database
node scripts/test-user-fitness.js
```

### 3. **Cek API Response Langsung**
```bash
# Test API dengan token yang valid
curl -X GET "http://localhost:3000/api/mobile/tracking/fitness" \
  -H "Authorization: Bearer VALID_TOKEN"
```

### 4. **Cek Frontend Log**
- Buka aplikasi mobile
- Buka ExerciseHistoryScreen
- Cek console log untuk debug output

## Script untuk Test

### 1. **Test Database dengan User ID yang Ada**
```bash
# Update password di script
node scripts/test-user-fitness.js
```

### 2. **Test API Response**
```bash
# Test dengan user ID yang ada di database
node scripts/test-fitness-distance.js
```

### 3. **Debug Frontend**
- Buka aplikasi mobile
- Buka ExerciseHistoryScreen
- Cek console log untuk melihat:
  - API response
  - Field mapping
  - Distance display logic

## Expected Results

### ✅ **Jika User ID Benar:**
- API mengembalikan data untuk user yang benar
- Field `distance_km` ada dan berisi nilai
- Frontend menampilkan distance dengan benar

### ✅ **Jika Authentication OK:**
- API tidak mengembalikan "Authentication required"
- Response berisi data fitness

### ✅ **Jika Field Mapping OK:**
- Console log menunjukkan field `distance_km` ada
- Tipe data adalah `number`
- Nilai distance > 0

## Troubleshooting Checklist

- [ ] Cek user ID yang digunakan aplikasi mobile
- [ ] Cek token authentication
- [ ] Cek API response format
- [ ] Cek field mapping di frontend
- [ ] Cek data type conversion
- [ ] Cek console log untuk error

## Next Steps

1. **Identifikasi User ID**: Cek user ID yang digunakan aplikasi mobile
2. **Test dengan User ID yang Benar**: Update script test dengan user ID yang ada
3. **Cek Authentication**: Pastikan token valid
4. **Monitor Console Log**: Cek debug output di aplikasi mobile
5. **Update Scripts**: Update password database di script test

## Monitoring

### Console Log yang Dicari:
```
🔍 API Response: { success: true, data: [...] }
🔍 First entry fields: ['id', 'user_id', 'activity_type', 'distance_km', ...]
🔍 Distance field analysis: 5.0
🔍 Distance for entry 9: 5.0 type: number
```

### Database Query untuk Verifikasi:
```sql
-- Cek data untuk user tertentu
SELECT * FROM fitness_tracking WHERE user_id = YOUR_USER_ID ORDER BY created_at DESC;

-- Cek field distance_km
SELECT id, distance_km, activity_type FROM fitness_tracking WHERE distance_km > 0;
```
