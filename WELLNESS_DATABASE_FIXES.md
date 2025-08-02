# Wellness Database Fixes

## Issues Fixed

### 1. Mood Tracking API Error
**Error**: `Unknown column 'recorded_at' in 'field list'`

**Root Cause**: The API was trying to use `recorded_at` column but the database schema uses `tracking_date` and `mood_level` instead of `mood`.

**Files Fixed**:
- `dash-app/app/api/mobile/wellness/mood-tracker/route.js`
- `dash-app/app/api/mobile/wellness/data/route.js`

**Changes Made**:
```sql
-- Before (incorrect)
SELECT DATE(recorded_at) as date, mood, energy_level
FROM mood_tracking
WHERE user_id = ? AND DATE(recorded_at) BETWEEN ? AND ?

-- After (correct)
SELECT DATE(tracking_date) as date, mood_level as mood, energy_level
FROM mood_tracking
WHERE user_id = ? AND DATE(tracking_date) BETWEEN ? AND ?
```

### 2. Wellness Stats API Error
**Error**: `Table 'phc_dashboard.wellness_activity_completions' doesn't exist`

**Root Cause**: The API was trying to query a non-existent table `wellness_activity_completions`. The correct table is `wellness_activities`.

**Files Fixed**:
- `dash-app/app/api/mobile/wellness/stats/route.js`
- `dash-app/app/api/mobile/wellness/data/route.js`
- `dash-app/app/api/mobile/wellness/activities/complete/route.js`
- `dash-app/app/api/mobile/app/analytics/route.js`

**Changes Made**:
```sql
-- Before (incorrect)
FROM wellness_activity_completions wac
JOIN wellness_activities wa ON wac.activity_id = wa.id

-- After (correct)
FROM wellness_activities wa
```

### 3. Column Name Mismatches
**Issues Fixed**:
- `title` → `activity_name`
- `category` → `activity_category`
- `points` → `points_earned`
- `duration_minutes` → `duration`

## Database Schema Reference

### mood_tracking Table
```sql
CREATE TABLE mood_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mood_level ENUM('very_happy', 'happy', 'neutral', 'sad', 'very_sad') NOT NULL,
    energy_level ENUM('very_high', 'high', 'moderate', 'low', 'very_low'),
    tracking_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- ... other fields
);
```

### wellness_activities Table
```sql
CREATE TABLE wellness_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_id VARCHAR(50) NOT NULL,
    activity_name VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_category VARCHAR(50) NOT NULL,
    duration INT NOT NULL DEFAULT 0,
    points_earned INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- ... other fields
);
```

## API Endpoints Fixed

### 1. GET /api/mobile/wellness/mood-tracker
- ✅ Fixed column references
- ✅ Returns mood statistics correctly

### 2. GET /api/mobile/wellness/stats
- ✅ Fixed table references
- ✅ Returns wellness activity statistics correctly

### 3. POST /api/mobile/wellness/mood-tracker
- ✅ Fixed column names for INSERT operations
- ✅ Uses correct date format

### 4. POST /api/mobile/wellness/activities/complete
- ✅ Fixed table structure for activity completion
- ✅ Uses correct column names

### 5. GET /api/mobile/app/analytics
- ✅ Fixed table references for analytics
- ✅ Includes wellness activities in statistics

## Testing Results

Both APIs now return successful responses:

```json
// Mood Tracker API
{
  "success": true,
  "data": {
    "period": {"start_date": "2025-07-03", "end_date": "2025-08-01"},
    "total_entries": 0,
    "mood_distribution": {},
    "energy_distribution": {},
    "average_mood_score": 0,
    "average_energy_score": 0,
    "most_common_mood": null,
    "most_common_energy": null
  }
}

// Wellness Stats API
{
  "success": true,
  "data": {
    "period": "7",
    "start_date": "2025-07-25",
    "end_date": "2025-08-01",
    "total_activities_completed": 0,
    "total_points_earned": 0,
    "total_duration_minutes": 0,
    "favorite_category": null,
    "most_completed_activity": null,
    "streak_days": 0,
    "category_breakdown": {}
  }
}
```

## Files Modified

1. `dash-app/app/api/mobile/wellness/mood-tracker/route.js`
2. `dash-app/app/api/mobile/wellness/stats/route.js`
3. `dash-app/app/api/mobile/wellness/data/route.js`
4. `dash-app/app/api/mobile/wellness/activities/complete/route.js`
5. `dash-app/app/api/mobile/app/analytics/route.js`

## Next Steps

1. Test the mobile app to ensure wellness features work correctly
2. Add sample data to test with real mood and wellness activity entries
3. Monitor API performance and error logs
4. Consider adding data validation for API inputs

## Notes

- All database queries now use the correct table and column names
- The fixes maintain backward compatibility with existing data
- Error handling remains intact
- API response formats are unchanged 