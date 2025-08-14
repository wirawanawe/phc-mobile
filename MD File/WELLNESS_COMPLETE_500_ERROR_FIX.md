# Wellness Activities Complete Endpoint 500 Error Fix

## Problem
The `POST /api/mobile/wellness/activities/complete` endpoint was returning a 500 error instead of proper error responses.

## Root Cause Analysis

### 1. JWT Token Verification Error Handling
- **Issue**: The endpoint was not properly handling JWT verification errors
- **Problem**: When an invalid token was provided, the `jwtVerify` function would throw an error, causing a 500 response instead of a 401
- **Location**: `dash-app/app/api/mobile/wellness/activities/complete/route.js`

### 2. Foreign Key Constraint Mismatch
- **Issue**: Database foreign key constraint was pointing to the wrong table
- **Problem**: The `user_wellness_activities` table had a foreign key constraint referencing `wellness_activities(id)`, but the endpoint was looking for activities in `available_wellness_activities`
- **Location**: Database schema in `phc_dashboard` database

## Fixes Applied

### 1. Improved JWT Error Handling
```javascript
// Before
const { payload } = await jwtVerify(
  token,
  new TextEncoder().encode(process.env.JWT_SECRET)
);

// After
let payload;
try {
  const result = await jwtVerify(
    token,
    new TextEncoder().encode(process.env.JWT_SECRET)
  );
  payload = result.payload;
} catch (jwtError) {
  console.error('JWT verification failed:', jwtError.message);
  return NextResponse.json(
    {
      success: false,
      message: "Invalid or expired token",
    },
    { status: 401 }
  );
}
```

### 2. Fixed Foreign Key Constraint
```sql
-- Removed incorrect foreign key
ALTER TABLE user_wellness_activities DROP FOREIGN KEY user_wellness_activities_ibfk_2;

-- Added correct foreign key
ALTER TABLE user_wellness_activities ADD CONSTRAINT user_wellness_activities_ibfk_2 
FOREIGN KEY (activity_id) REFERENCES available_wellness_activities(id) ON DELETE CASCADE;
```

## Testing Results

### Before Fix
```bash
# Invalid token - returned 500 error
curl -X POST http://localhost:3000/api/mobile/wellness/activities/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{"activity_id": 15, "duration": 30, "notes": "Test"}'

# Response: 500 Internal Server Error
{"success":false,"message":"Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa menit.","error":"Invalid Compact JWS"}

# Valid token - returned 500 error due to foreign key constraint
curl -X POST http://localhost:3000/api/mobile/wellness/activities/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid_token" \
  -d '{"activity_id": 15, "duration": 30, "notes": "Test"}'

# Response: 500 Internal Server Error
{"success":false,"message":"Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa menit.","error":"Database error: Cannot add or update a child row: a foreign key constraint fails"}
```

### After Fix
```bash
# Invalid token - returns proper 401 error
curl -X POST http://localhost:3000/api/mobile/wellness/activities/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{"activity_id": 15, "duration": 30, "notes": "Test"}'

# Response: 401 Unauthorized
{"success":false,"message":"Invalid or expired token"}

# Valid token - returns 200 success
curl -X POST http://localhost:3000/api/mobile/wellness/activities/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid_token" \
  -d '{"activity_id": 15, "duration": 30, "notes": "Test"}'

# Response: 200 OK
{"success":true,"data":{"message":"Activity completed successfully","activity_id":15,"activity_name":"Morning Yoga","duration":30,"points_earned":20,"completed_at":"2025-08-14T04:18:16.719Z","is_completed":true}}

# Duplicate completion - returns 409 conflict
curl -X POST http://localhost:3000/api/mobile/wellness/activities/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid_token" \
  -d '{"activity_id": 15, "duration": 30, "notes": "Test"}'

# Response: 409 Conflict
{"success":false,"message":"Activity already completed today"}
```

## Files Modified

1. **`dash-app/app/api/mobile/wellness/activities/complete/route.js`**
   - Added proper JWT error handling with try-catch block
   - Returns 401 status for invalid tokens instead of 500

2. **Database Schema**
   - Fixed foreign key constraint in `user_wellness_activities` table
   - Now correctly references `available_wellness_activities(id)`

## Verification

The endpoint now properly handles:
- ✅ Missing authorization header (401)
- ✅ Invalid JWT tokens (401)
- ✅ Valid JWT tokens with proper activity completion (200)
- ✅ Duplicate activity completions (409)
- ✅ Missing required fields (400)
- ✅ Database operations with correct foreign key relationships

## Test Commands

```bash
# Test the fixed endpoint
curl -X POST http://localhost:3000/api/mobile/wellness/activities/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"activity_id": 15, "duration": 30, "notes": "Test completion"}'

# Or run the comprehensive test script
node scripts/test-wellness-complete-fixed.js
```

## Status: ✅ FIXED

The 500 error has been resolved and the endpoint now returns appropriate HTTP status codes for different scenarios.
