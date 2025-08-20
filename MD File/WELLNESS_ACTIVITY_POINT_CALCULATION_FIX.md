# Wellness Activity Point Calculation Fix

## Problem Description

Pada halaman WellnessActivityCompletionScreen ada tipe aktivitas (normal, intensif, santai) dengan pengali poin yang berbeda:
- Normal: x1.0
- Intensif: x1.5  
- Santai: x0.8

Namun, hasil perhitungan poin di riwayat aktivitas tidak sama dengan apa yang sudah dilakukan. Misalnya:
- Point aktivitas: 20
- Tipe aktivitas: Intensif (seharusnya x1.5 = 30 poin)
- Poin yang tampil di riwayat: tetap 20

## Root Cause

1. **Frontend calculation correct**: Perhitungan poin di frontend sudah benar dengan memperhitungkan `activity_type` multiplier
2. **Backend calculation missing**: API endpoint tidak memperhitungkan `activity_type` multiplier
3. **Database missing column**: Tabel `user_wellness_activities` tidak menyimpan `activity_type`
4. **History display incorrect**: Endpoint history tidak menampilkan poin yang sudah dikalikan dengan multiplier

## Solution Implemented

### 1. **Database Migration**

#### Added `activity_type` column to `user_wellness_activities` table
```sql
ALTER TABLE user_wellness_activities 
ADD COLUMN activity_type ENUM('normal', 'intense', 'relaxed') NOT NULL DEFAULT 'normal' 
AFTER notes;
```

#### Migration Script
- **File**: `dash-app/init-scripts/23-add-activity-type-column.sql`
- **Script**: `scripts/run-activity-type-migration.js`
- **Status**: ✅ **COMPLETED**

### 2. **Backend API Updates**

#### Activity Completion Endpoint (`/api/mobile/wellness/activities/complete`)
- **File**: `dash-app/app/api/mobile/wellness/activities/complete/route.js`
- **Changes**:
  - Added activity type multiplier calculation
  - Store `activity_type` in database
  - Calculate final points with multiplier

```javascript
// Activity type multiplier
let activityTypeMultiplier = 1;
if (activity_type) {
  switch (activity_type.toLowerCase()) {
    case 'intense':
      activityTypeMultiplier = 1.5;
      break;
    case 'relaxed':
      activityTypeMultiplier = 0.8;
      break;
    case 'normal':
    default:
      activityTypeMultiplier = 1;
      break;
  }
}

finalPoints = Math.round(basePoints * durationMultiplier * activityTypeMultiplier);
```

#### Activity History Endpoint (`/api/mobile/wellness/activities/history`)
- **File**: `dash-app/app/api/mobile/wellness/activities/history/route.js`
- **Changes**:
  - Added `activity_type` to response
  - Calculate earned points with multiplier in SQL query
  - Show both base points and earned points

```sql
CASE 
  WHEN uwa.activity_type = 'intense' THEN ROUND(wa.points * 1.5)
  WHEN uwa.activity_type = 'relaxed' THEN ROUND(wa.points * 0.8)
  ELSE wa.points
END as points_earned
```

### 3. **Point Calculation Logic**

#### Multipliers
- **Normal**: x1.0 (no change)
- **Intense**: x1.5 (50% bonus)
- **Relaxed**: x0.8 (20% reduction)

#### Calculation Formula
```
Final Points = Base Points × Duration Multiplier × Activity Type Multiplier
```

#### Examples
- Base points: 20
- Normal (30 min): 20 × 1.0 = 20 points
- Intense (30 min): 20 × 1.5 = 30 points  
- Relaxed (30 min): 20 × 0.8 = 16 points

### 4. **Database Schema Updates**

#### Before
```sql
user_wellness_activities:
- id (INT, PRIMARY KEY)
- user_id (INT, NOT NULL)
- activity_id (INT, NOT NULL)
- activity_date (DATE, NOT NULL)
- duration_minutes (INT)
- notes (TEXT)
- completed_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### After
```sql
user_wellness_activities:
- id (INT, PRIMARY KEY)
- user_id (INT, NOT NULL)
- activity_id (INT, NOT NULL)
- activity_date (DATE, NOT NULL)
- duration_minutes (INT)
- notes (TEXT)
- activity_type (ENUM: normal, intense, relaxed) ← NEW COLUMN
- completed_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

## Testing

### Migration Test Results
```
✅ Connected to database
✅ user_wellness_activities table exists
✅ activity_type column added
✅ ENUM values: normal, intense, relaxed
✅ Default value: normal
✅ Comments added for documentation
```

### Point Calculation Test
- **Script**: `scripts/test-point-calculation.js`
- **Verifies**:
  - Database structure with new column
  - API endpoint point calculation
  - History endpoint display
  - Multiplier logic

## User Experience

### Before Fix
- ❌ Poin di riwayat tidak sesuai dengan tipe aktivitas
- ❌ User bingung mengapa poin tidak berubah
- ❌ Tidak ada transparansi dalam perhitungan poin

### After Fix
- ✅ Poin di riwayat sesuai dengan tipe aktivitas yang dipilih
- ✅ User dapat melihat base points dan earned points
- ✅ Transparansi dalam perhitungan poin
- ✅ Konsistensi antara frontend dan backend

## Files Modified

### Database
- `dash-app/init-scripts/23-add-activity-type-column.sql`
- `scripts/run-activity-type-migration.js`

### Backend API
- `dash-app/app/api/mobile/wellness/activities/complete/route.js`
- `dash-app/app/api/mobile/wellness/activities/history/route.js`

### Testing
- `scripts/test-point-calculation.js`

### Documentation
- `MD File/WELLNESS_ACTIVITY_POINT_CALCULATION_FIX.md`

## Benefits

### 1. **Data Integrity**
- ✅ Poin tersimpan dengan benar sesuai tipe aktivitas
- ✅ Konsistensi antara frontend dan backend
- ✅ Historical data accuracy

### 2. **User Experience**
- ✅ Transparansi dalam perhitungan poin
- ✅ User dapat melihat pengaruh tipe aktivitas
- ✅ Motivasi untuk memilih tipe aktivitas yang lebih menantang

### 3. **System Reliability**
- ✅ Perhitungan poin yang akurat
- ✅ Database schema yang konsisten
- ✅ API response yang reliable

## Conclusion

Masalah perhitungan poin wellness activity telah berhasil diperbaiki dengan:

1. **Database migration** untuk menambahkan kolom `activity_type`
2. **Backend API updates** untuk menghitung poin dengan multiplier
3. **History endpoint updates** untuk menampilkan poin yang benar
4. **Testing scripts** untuk memverifikasi fungsionalitas

Sekarang user akan melihat poin yang sesuai dengan tipe aktivitas yang mereka pilih, memberikan pengalaman yang lebih akurat dan transparan.
