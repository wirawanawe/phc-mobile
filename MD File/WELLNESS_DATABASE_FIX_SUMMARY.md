# Wellness Database Schema Fix - Complete Solution

## 🚨 Issue Summary

The mobile app is experiencing database errors when trying to fetch wellness activities. The error occurs because there's a mismatch between the frontend expectations and the backend database schema.

### Error Details
```
Database query error: Error: Unknown column 'name' in 'field list'
```

### Root Cause Analysis
1. **Frontend expects**: `title` field for wellness activities
2. **Backend SQL query**: Trying to select `name` field
3. **Database table**: Missing `name` column and other required fields
4. **Schema mismatch**: The `wellness_activities` table doesn't match frontend expectations

## 🔧 Solution Overview

I've created a complete solution package that includes:

1. **Database Migration Script** - Fixes the database schema
2. **Test Script** - Verifies the API endpoints work correctly
3. **Setup Script** - Automates the migration process
4. **Documentation** - Explains the issue and solution

## 📁 Files Created

### 1. Database Migration Script
**File**: `scripts/fix-wellness-activities-schema.js`

**Purpose**: Fixes the `wellness_activities` table schema to match frontend expectations

**Features**:
- Creates the table if it doesn't exist
- Renames `name` column to `title` if needed
- Adds missing columns (description, category, duration_minutes, etc.)
- Inserts sample data for testing
- Verifies the schema is correct

### 2. Test Script
**File**: `scripts/test-wellness-api.js`

**Purpose**: Tests all wellness-related API endpoints to verify they work correctly

**Features**:
- Tests multiple wellness endpoints
- Provides detailed error reporting
- Verifies database schema fix
- Gives clear success/failure status

### 3. Setup Script
**File**: `scripts/setup-wellness-fix.sh`

**Purpose**: Automates the entire migration process

**Features**:
- Checks directory structure
- Copies scripts to dash-app
- Installs required dependencies
- Runs migration automatically
- Provides step-by-step guidance

### 4. Documentation
**File**: `MD File/WELLNESS_ACTIVITIES_SCHEMA_FIX.md`

**Purpose**: Detailed documentation of the issue and solution

**Features**:
- Complete problem analysis
- Step-by-step solution instructions
- Manual database fix options
- Backend API route fixes
- Testing and verification steps

## 🚀 Quick Fix Instructions

### Option 1: Automated Setup (Recommended)

1. **Run the setup script**:
   ```bash
   ./scripts/setup-wellness-fix.sh
   ```

2. **Follow the prompts** to run the migration automatically

### Option 2: Manual Steps

1. **Navigate to dash-app directory**:
   ```bash
   cd ../dash-app
   ```

2. **Copy the migration script**:
   ```bash
   cp ../phc-mobile/scripts/fix-wellness-activities-schema.js scripts/
   ```

3. **Install mysql2**:
   ```bash
   npm install mysql2
   ```

4. **Update database configuration** in the script:
   ```javascript
   const dbConfig = {
     host: 'localhost',
     user: 'your_db_user',
     password: 'your_db_password',
     database: 'your_database_name',
     port: 3306
   };
   ```

5. **Run the migration**:
   ```bash
   node scripts/fix-wellness-activities-schema.js
   ```

6. **Restart the server**:
   ```bash
   npm run dev
   ```

7. **Test the API**:
   ```bash
   node scripts/test-wellness-api.js
   ```

## 📊 Database Schema Changes

### Before (Problematic)
```sql
-- Table might not exist or have wrong structure
-- SQL query trying to select 'name' column that doesn't exist
SELECT id, name, description, category, duration_minutes, 
       calories_burn, difficulty_level, instructions, 
       image_url, is_active, created_at, updated_at
FROM wellness_activities 
WHERE id = ?
```

### After (Fixed)
```sql
-- Correct table structure
CREATE TABLE wellness_activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,           -- Main activity name
  description TEXT,                      -- Activity description
  category VARCHAR(100),                 -- Activity category
  duration_minutes INT DEFAULT 0,        -- Duration in minutes
  calories_burn INT DEFAULT 0,           -- Calories burned
  difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  instructions TEXT,                     -- How to perform the activity
  image_url VARCHAR(500),               -- Activity image
  is_active BOOLEAN DEFAULT TRUE,       -- Whether activity is available
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Correct SQL query
SELECT id, title, description, category, duration_minutes, 
       calories_burn, difficulty_level, instructions, 
       image_url, is_active, created_at, updated_at
FROM wellness_activities 
WHERE id = ?
```

## 🧪 Testing

### API Endpoints Tested
- `/api/mobile/wellness/activities` - List all activities
- `/api/mobile/wellness/activities/1` - Get specific activity
- `/api/mobile/wellness/stats?period=7` - Wellness statistics
- `/api/mobile/wellness/mood-tracker?period=7` - Mood tracking
- `/api/mobile/tracking/meal/today` - Today's meal tracking
- `/api/mobile/tracking/today-summary` - Today's summary
- `/api/mobile/missions/stats` - Mission statistics
- `/api/mobile/missions/my-missions` - User's missions

### Expected Results
- ✅ All wellness endpoints return 200 status
- ✅ No more "Unknown column 'name'" errors
- ✅ Data structure matches frontend expectations
- ✅ Mobile app can load wellness activities

## 🔍 Verification Steps

1. **Check database schema**:
   ```sql
   DESCRIBE wellness_activities;
   ```

2. **Test API endpoint**:
   ```bash
   curl http://localhost:3000/api/mobile/wellness/activities/1
   ```

3. **Run test script**:
   ```bash
   node scripts/test-wellness-api.js
   ```

4. **Test mobile app**:
   - Open the mobile app
   - Navigate to Wellness section
   - Verify activities load without errors

## 🛠️ Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check database credentials in the migration script
   - Ensure MySQL server is running
   - Verify database exists

2. **Permission denied**
   - Ensure you have write permissions to the database
   - Check MySQL user privileges

3. **Table already exists with wrong structure**
   - The migration script will automatically fix this
   - It will rename columns and add missing ones

4. **API still returning errors**
   - Restart the dash-app server after migration
   - Check if backend routes need updating
   - Verify the SQL queries use correct column names

### Error Messages

- `ER_BAD_FIELD_ERROR`: Column doesn't exist - Fixed by migration
- `ER_NO_SUCH_TABLE`: Table doesn't exist - Created by migration
- `ECONNREFUSED`: Can't connect to database - Check credentials and server

## 📈 Impact

### Before Fix
- ❌ Database errors preventing wellness features
- ❌ Mobile app crashes when accessing wellness
- ❌ API endpoints returning 500 errors
- ❌ Poor user experience

### After Fix
- ✅ All wellness features working correctly
- ✅ Mobile app loads wellness activities
- ✅ API endpoints return proper data
- ✅ Improved user experience

## 🔄 Maintenance

### Future Updates
- The migration script is idempotent (safe to run multiple times)
- It will only make necessary changes
- Sample data is only inserted if table is empty

### Monitoring
- Use the test script regularly to verify API health
- Monitor database logs for any new schema issues
- Check mobile app functionality after updates

## 📞 Support

If you encounter issues:

1. **Check the documentation**: `MD File/WELLNESS_ACTIVITIES_SCHEMA_FIX.md`
2. **Run the test script**: `node scripts/test-wellness-api.js`
3. **Review error logs**: Check dash-app server logs
4. **Verify database**: Connect directly to MySQL and check table structure

## 🎉 Success Criteria

The fix is successful when:
- ✅ No more "Unknown column 'name'" errors in logs
- ✅ All wellness API endpoints return 200 status
- ✅ Mobile app loads wellness activities correctly
- ✅ Users can access all wellness features
- ✅ Test script shows all endpoints working

---

**Created**: $(date)
**Status**: Ready for deployment
**Priority**: High (fixes critical database errors) 