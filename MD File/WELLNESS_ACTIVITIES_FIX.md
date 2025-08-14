# Wellness Activities Server Error Fix

## Problem
The mobile app was experiencing server errors when trying to load user activity history and wellness activities:
```
ERROR  Error loading user activity history: [Error: Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa menit.]
ERROR  Error loading wellness activities: [Error: Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa menit.]
```

## Root Cause
The API endpoints were looking for a table called `wellness_activities` with specific column names, but the actual database table was called `available_wellness_activities` with different column names.

## Database Schema Mismatch

### Expected Schema (API was looking for):
```sql
wellness_activities:
- id
- name (as title)
- description
- category
- duration_minutes
- difficulty
- points
- is_active
```

### Actual Schema (Database had):
```sql
available_wellness_activities:
- id
- title
- description
- category
- duration_minutes
- difficulty
- points
- is_active
```

## Fixes Applied

### 1. Updated API Endpoints
Fixed the following API endpoints to use the correct table name and column names:

- `dash-app/app/api/mobile/wellness/activities/route.js`
- `dash-app/app/api/mobile/wellness/activities/history/route.js`
- `dash-app/app/api/mobile/wellness/activities/[id]/route.js`
- `dash-app/app/api/mobile/wellness/activities/complete/route.js`
- `dash-app/app/api/mobile/wellness-progress/[id]/route.js`
- `dash-app/app/app/api/mobile/app/analytics/route.js`

### 2. Updated Mobile App API Service
Modified the mobile app's API service to handle authentication failures gracefully:

- `src/services/api.js` - Added fallback to public endpoint for wellness activities
- `src/services/api.js` - Added graceful handling for wellness activity history
- `src/services/api.js` - Added server error handling with fallback to public endpoint

### 3. Created Public Endpoint
Created a public wellness activities endpoint for testing:
- `dash-app/app/api/mobile/wellness/activities/public/route.js`

## Testing

### 1. Test Database Connection
```bash
curl -X GET "http://localhost:3000/api/mobile/health"
```

### 2. Test Public Wellness Activities
```bash
curl -X GET "http://localhost:3000/api/mobile/wellness/activities/public"
```

### 3. Test Authentication
```bash
curl -X GET "http://localhost:3000/api/mobile/auth/test" -H "Authorization: Bearer your-token"
```

## Current Status
- ✅ Database connection working
- ✅ Wellness activities data available (14 activities)
- ✅ Public endpoint working
- ✅ API endpoints fixed
- ✅ History endpoint fixed (column name corrected)
- ✅ Mobile app error handling improved
- ⚠️ Authentication required for personalized features (history, completion)

## Next Steps
1. Ensure user is logged in to the mobile app
2. Verify JWT token is being sent correctly
3. Test the complete wellness activities flow

## Files Modified
- `dash-app/app/api/mobile/wellness/activities/route.js`
- `dash-app/app/api/mobile/wellness/activities/history/route.js` (fixed column name)
- `dash-app/app/api/mobile/wellness/activities/[id]/route.js`
- `dash-app/app/api/mobile/wellness/activities/complete/route.js`
- `dash-app/app/api/mobile/wellness-progress/[id]/route.js`
- `dash-app/app/app/api/mobile/app/analytics/route.js`
- `src/services/api.js` (enhanced error handling)
- `dash-app/app/api/mobile/wellness/activities/public/route.js` (new)

## Database Verification
```sql
-- Check wellness activities count
SELECT COUNT(*) as count FROM available_wellness_activities;

-- Check sample data
SELECT id, title, category, duration_minutes, points 
FROM available_wellness_activities 
LIMIT 3;
```
