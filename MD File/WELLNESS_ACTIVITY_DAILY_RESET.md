# Wellness Activity Daily Reset Feature

## Overview

Fitur ini memungkinkan aktivitas wellness hanya berlaku di tanggal yang sama, dan akan tereset ketika tanggal berubah, sama seperti sistem mission. Ketika sistem mendeteksi perubahan tanggal, semua aktivitas wellness yang sudah diselesaikan hari ini akan tereset dan user dapat memulai aktivitas yang sama lagi di hari baru.

## Fitur Utama

### 1. **Date-Based Activity Tracking**
- Aktivitas wellness dilacak berdasarkan tanggal spesifik
- User dapat menyelesaikan aktivitas yang sama di tanggal yang berbeda
- Mencegah duplikasi aktivitas pada tanggal yang sama

### 2. **Automatic Daily Reset**
- Sistem otomatis mendeteksi perubahan tanggal
- Semua aktivitas wellness tereset ketika tanggal berubah
- User mendapatkan fresh start setiap hari

### 3. **Integration with Existing Reset System**
- Terintegrasi dengan `DateChangeDetector` yang sudah ada
- Menggunakan event-driven architecture yang sama
- Konsisten dengan sistem reset mission dan tracking lainnya

## Implementasi Teknis

### Database Changes

#### 1. **Migration Script** (`dash-app/init-scripts/22-add-wellness-activity-date.sql`)
```sql
-- Add activity_date column to user_wellness_activities table
ALTER TABLE user_wellness_activities 
ADD COLUMN activity_date DATE NOT NULL DEFAULT CURRENT_DATE 
AFTER activity_id;

-- Add index for efficient date-based queries
CREATE INDEX idx_user_wellness_activities_date ON user_wellness_activities(user_id, activity_date);

-- Add unique constraint to prevent duplicate activities on same date
ALTER TABLE user_wellness_activities 
ADD UNIQUE KEY unique_user_activity_date (user_id, activity_id, activity_date);
```

#### 2. **Table Structure**
```sql
user_wellness_activities:
- id (INT, PRIMARY KEY)
- user_id (INT, NOT NULL)
- activity_id (INT, NOT NULL)
- activity_date (DATE, NOT NULL) -- NEW COLUMN
- duration_minutes (INT)
- notes (TEXT)
- completed_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### API Changes

#### 1. **Activity Completion Endpoint** (`/api/mobile/wellness/activities/complete`)
- **Before**: Checked completion based on `DATE(completed_at)`
- **After**: Checks completion based on `activity_date`
- **Insert**: Includes `activity_date` in insert query

#### 2. **Activity History Endpoint** (`/api/mobile/wellness/activities/history`)
- **Before**: Filtered by `completed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`
- **After**: Filtered by `activity_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`
- **Order**: Orders by `activity_date DESC, completed_at DESC`

#### 3. **Activities List Endpoint** (`/api/mobile/wellness/activities`)
- **Before**: Showed completion status based on all time
- **After**: Shows completion status based on today's date only
- **Query**: Joins with `activity_date = ?` for today's date

#### 4. **New Reset Endpoint** (`/api/mobile/wellness/activities/reset`)
```javascript
POST /api/mobile/wellness/activities/reset
{
  "user_id": 1,
  "activity_id": null // Optional: reset specific activity or all
}
```

### Frontend Changes

#### 1. **DateChangeDetector Integration**
```typescript
// Added wellness activity reset event
eventEmitter.emit('wellnessActivityReset');

// Added cache clearing for wellness activities
await AsyncStorage.multiRemove([
  'todayWaterIntake',
  'todayFitnessData',
  'todaySleepData',
  'todayMoodData',
  'todayMealData',
  'todayWellnessActivities' // NEW
]);
```

#### 2. **ActivityScreen Updates**
```typescript
// Listen for wellness activity reset events
useEffect(() => {
  const handleWellnessActivityReset = () => {
    console.log('ActivityScreen - Wellness activity reset detected, refreshing data...');
    loadWellnessActivities();
    if (isAuthenticated) {
      loadUserActivityHistory();
    }
  };

  eventEmitter.on('wellnessActivityReset', handleWellnessActivityReset);
  return () => {
    eventEmitter.off('wellnessActivityReset', handleWellnessActivityReset);
  };
}, [isAuthenticated]);
```

#### 3. **API Service Updates**
```typescript
// Added reset method
async resetWellnessActivities() {
  try {
    const userId = await this.getUserId();
    return await this.request("/wellness/activities/reset", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  } catch (error) {
    console.log('🔐 API: Error resetting wellness activities:', error.message);
    return {
      success: false,
      message: 'Failed to reset wellness activities'
    };
  }
}
```

## Flow Aktivitas Wellness

### 1. **User Menyelesaikan Aktivitas**
```
User completes activity → API checks activity_date → 
If not completed today → Insert with today's date → Success
If already completed today → Return error "Activity already completed today"
```

### 2. **Date Change Detection**
```
System date changes → DateChangeDetector detects change → 
Emit wellnessActivityReset event → ActivityScreen refreshes data → 
All activities show as "available" again
```

### 3. **Daily Reset Process**
```
Date changes → Trigger daily reset → 
Clear wellness activity cache → Refresh from API → 
Show fresh activity list → User can complete activities again
```

## Benefits

### 1. **User Experience**
- ✅ Clean slate every day untuk aktivitas wellness
- ✅ Tidak ada kebingungan tentang aktivitas mana yang sudah diselesaikan hari ini
- ✅ Konsisten dengan sistem mission dan tracking lainnya
- ✅ User dapat mengulang aktivitas favorit setiap hari

### 2. **Data Integrity**
- ✅ Mencegah data carryover antar hari
- ✅ Memastikan tracking harian yang akurat
- ✅ Mempertahankan data historis dengan benar
- ✅ Mencegah duplikasi aktivitas pada tanggal yang sama

### 3. **Performance**
- ✅ Efficient date checking (setiap menit)
- ✅ Minimal impact pada performa aplikasi
- ✅ Menggunakan event system yang sudah ada
- ✅ Index database untuk query yang cepat

## Testing

### Manual Testing Steps
1. **Complete wellness activity**: Selesaikan aktivitas wellness
2. **Verify completion**: Pastikan aktivitas ditandai sebagai "completed"
3. **Change system date**: Ubah tanggal sistem ke hari berikutnya
4. **Return to app**: Kembali ke aplikasi
5. **Verify reset**: Pastikan aktivitas kembali menjadi "available"

### Test Script
```bash
# Run migration
node scripts/run-wellness-activity-migration.js

# Test API endpoints
curl -X GET "http://localhost:3000/api/mobile/wellness/activities"
curl -X POST "http://localhost:3000/api/mobile/wellness/activities/complete" \
  -H "Content-Type: application/json" \
  -d '{"activity_id": 1, "duration": 30}'
curl -X POST "http://localhost:3000/api/mobile/wellness/activities/reset" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'
```

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/phc_dashboard

# JWT
JWT_SECRET=your-secret-key

# API
API_BASE_URL=http://localhost:3000/api/mobile
```

### Check Interval
Date change detector checks every 60 seconds:
```typescript
setInterval(() => {
  this.checkForDateChange();
}, 60000); // Check every minute
```

## Troubleshooting

### Common Issues

#### 1. **Activities not resetting**
- Check if DateChangeDetector is initialized
- Verify event listeners are properly set up
- Check database for activity_date column

#### 2. **Duplicate activities on same date**
- Verify unique constraint is working
- Check API validation logic
- Ensure activity_date is properly set

#### 3. **Performance issues**
- Check database indexes
- Verify query optimization
- Monitor event listener cleanup

### Debug Commands
```bash
# Check table structure
DESCRIBE user_wellness_activities;

# Check for duplicate activities
SELECT user_id, activity_id, activity_date, COUNT(*) 
FROM user_wellness_activities 
GROUP BY user_id, activity_id, activity_date 
HAVING COUNT(*) > 1;

# Check today's activities
SELECT * FROM user_wellness_activities 
WHERE activity_date = CURDATE();
```

## Conclusion

Fitur wellness activity daily reset telah berhasil diimplementasikan dengan:

- **Robust date-based tracking system**
- **Automatic daily reset functionality**
- **Efficient event-driven architecture**
- **Proper integration with existing components**
- **Complete testing and documentation**

Users will now experience automatic daily resets for wellness activities when the system date changes, ensuring they always start each day with fresh wellness activity options and a clean slate for their health and wellness journey.
