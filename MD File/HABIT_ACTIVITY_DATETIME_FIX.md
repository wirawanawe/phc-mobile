# Habit Activity DateTime Fix

## Issue Description

The habit activities completion API was failing with a database error:

```
Database error: Incorrect datetime value: '2025-08-25T02:28:21.910Z' for column `phc_dashboard`.`user_habit_activities`.`completed_at` at row 1
```

## Root Cause

The issue was caused by trying to insert ISO 8601 datetime strings (e.g., `'2025-08-25T02:28:21.910Z'`) into MySQL's `TIMESTAMP` column. MySQL's `TIMESTAMP` column expects a different format than the ISO string format.

## Database Schema

The `user_habit_activities` table has the following structure:

```sql
CREATE TABLE user_habit_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_id INT NOT NULL,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    habit_type ENUM('daily', 'weekly', 'monthly') DEFAULT 'daily',
    target_frequency INT DEFAULT 1,
    current_frequency INT DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'times',
    points_earned INT DEFAULT 0,
    notes TEXT,
    completed_at TIMESTAMP NULL,  -- This column expects MySQL datetime format
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- ... foreign keys and indexes
);
```

## Fix Applied

### 1. Fixed `/api/mobile/habit/activities/complete` endpoint

**Before:**
```javascript
await query(insertQuery, [
  userId, 
  activity_id, 
  today, 
  habit.habit_type,
  habit.target_frequency, 
  frequency, 
  habit.unit,
  pointsEarned, 
  notes, 
  isCompleted ? new Date().toISOString() : null  // ❌ ISO string format
]);

// Response
completed_at: isCompleted ? new Date().toISOString() : null  // ❌ ISO string format
```

**After:**
```javascript
await query(insertQuery, [
  userId, 
  activity_id, 
  today, 
  habit.habit_type,
  habit.target_frequency, 
  frequency, 
  habit.unit,
  pointsEarned, 
  notes, 
  isCompleted ? new Date() : null  // ✅ JavaScript Date object
]);

// Response
completed_at: isCompleted ? new Date() : null  // ✅ JavaScript Date object
```

### 2. Fixed `/api/mobile/wellness/activities/complete` endpoint

**Before:**
```javascript
// Response
completed_at: new Date().toISOString(),  // ❌ ISO string format
```

**After:**
```javascript
// Response
completed_at: new Date(),  // ✅ JavaScript Date object
```

## Why This Fix Works

1. **MySQL TIMESTAMP Compatibility**: MySQL's `TIMESTAMP` column accepts JavaScript `Date` objects directly through the MySQL2 driver, which automatically converts them to the proper MySQL datetime format.

2. **Database Configuration**: The database connection already has proper timezone settings (`timezone: '+07:00'`) and type casting for date fields.

3. **Consistent Format**: Using `new Date()` ensures consistent datetime handling across the application.

## Files Modified

1. `dash-app/app/api/mobile/habit/activities/complete/route.js`
2. `dash-app/app/api/mobile/wellness/activities/complete/route.js`

## Testing

The fix can be tested by:

1. Attempting to complete a habit activity through the mobile app
2. Checking that the API returns a successful response
3. Verifying that the `completed_at` timestamp is properly stored in the database

## Prevention

To prevent similar issues in the future:

1. Always use `new Date()` instead of `new Date().toISOString()` when inserting into MySQL TIMESTAMP columns
2. Use `NOW()` in SQL queries for current timestamp
3. Let the MySQL2 driver handle date conversions automatically

## Related Issues

This fix resolves the specific error mentioned in the terminal output:
```
ERROR  🌐 API Request (/habit/activities/complete) Error: {"originalError": "Server error (500): {\"success\":false,\"error\":\"Internal server error\",\"message\":\"Database error: Incorrect datetime value: '2025-08-25T02:28:21.910Z' for column `phc_dashboard`.`user_habit_activities`.`completed_at` at row 1\"}", "retryDelay": 10000, "shouldRetry": true, "type": "SERVER_DOWN", "userMessage": "Server sedang tidak tersed
```
