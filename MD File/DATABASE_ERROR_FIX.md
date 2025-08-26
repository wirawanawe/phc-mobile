# 🗄️ Database Error Fix - Resolved "Table 'meal_foods' doesn't exist"

## 🚨 Problem Identified

The mobile app was showing database errors:
```
ERROR 🌐 API Request (/tracking/meal/cleanup?user_id=1) Error: 
"Database error: Table 'phc_dashboard.meal_foods' doesn't exist"
```

This was causing:
- **API failures** when trying to clean up old meal data
- **Server errors (500)** for meal tracking operations
- **Poor user experience** with database-related errors

## 🔍 Root Cause Analysis

### 1. **Missing Database Tables**
The production database was missing required tables:
- `meal_foods` - Table for storing individual food items in meals
- `meal_tracking` - Table for storing meal entries
- `food_database` - Table for food reference data

### 2. **API Endpoint Assumptions**
The cleanup endpoint assumed all tables existed and didn't handle missing tables gracefully.

### 3. **Database Schema Inconsistency**
The mobile app expected a specific database schema that wasn't properly set up in production.

## ✅ Solution Applied

### 1. **Fixed Cleanup Endpoint** (`dash-app/app/api/mobile/tracking/meal/cleanup/route.js`)
```javascript
// Before: Assumed tables existed
const deleteMealFoodsSql = `
  DELETE mf FROM meal_foods mf
  INNER JOIN meal_tracking mt ON mf.meal_id = mt.id
  WHERE mt.user_id = ? AND mt.recorded_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
`;

// After: Check if tables exist before using them
const tables = await query("SHOW TABLES LIKE 'meal_foods'");
const hasMealFoodsTable = tables.length > 0;

if (hasMealFoodsTable) {
  // Delete meal foods for meals older than 24 hours
  const deleteMealFoodsSql = `
    DELETE mf FROM meal_foods mf
    INNER JOIN meal_tracking mt ON mf.meal_id = mt.id
    WHERE mt.user_id = ? AND mt.recorded_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
  `;
  
  const mealFoodsResult = await query(deleteMealFoodsSql, [user_id]);
  mealFoodsDeleted = mealFoodsResult.affectedRows || 0;
} else {
  console.log("   ℹ️ meal_foods table does not exist, skipping...");
}
```

### 2. **Created Database Fix Script** (`scripts/fix-meal-tables-production.js`)
```javascript
async function fixMealTablesProduction() {
  // Check which tables exist
  const mealTrackingTables = await connection.execute("SHOW TABLES LIKE 'meal_tracking'");
  const mealFoodsTables = await connection.execute("SHOW TABLES LIKE 'meal_foods'");
  const foodDatabaseTables = await connection.execute("SHOW TABLES LIKE 'food_database'");
  
  // Create missing tables
  if (!hasMealTracking) {
    await connection.execute(createMealTrackingSQL);
  }
  
  if (!hasMealFoods) {
    await connection.execute(createMealFoodsSQL);
  }
  
  if (!hasFoodDatabase) {
    await connection.execute(createFoodDatabaseSQL);
  }
  
  // Add foreign key constraints and indexes
  // ...
}
```

### 3. **Enhanced Error Handling**
```javascript
// Better error handling in cleanup endpoint
try {
  // Check which tables exist before operations
  const tables = await query("SHOW TABLES LIKE 'meal_foods'");
  const hasMealFoodsTable = tables.length > 0;
  
  // Handle each table separately
  if (hasMealFoodsTable) {
    // Process meal_foods table
  } else {
    console.log("   ℹ️ meal_foods table does not exist, skipping...");
  }
  
} catch (error) {
  console.error("Error cleaning up old meal data:", error);
  return NextResponse.json({
    success: false,
    message: "Gagal membersihkan data meal lama",
    error: error.message,
  }, { status: 500 });
}
```

## 🗄️ Database Schema

### Required Tables Structure

#### 1. **meal_tracking** (Main meal entries)
```sql
CREATE TABLE meal_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_meal_type (meal_type),
  INDEX idx_recorded_at (recorded_at)
);
```

#### 2. **meal_foods** (Individual food items in meals)
```sql
CREATE TABLE meal_foods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  meal_id INT NOT NULL,
  food_id INT NOT NULL,
  quantity DECIMAL(6,2) NOT NULL DEFAULT 1,
  unit VARCHAR(50) NOT NULL DEFAULT 'serving',
  calories DECIMAL(8,2) NOT NULL DEFAULT 0,
  protein DECIMAL(6,2) NOT NULL DEFAULT 0,
  carbs DECIMAL(6,2) NOT NULL DEFAULT 0,
  fat DECIMAL(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (meal_id) REFERENCES meal_tracking(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_database(id) ON DELETE CASCADE,
  INDEX idx_meal_id (meal_id),
  INDEX idx_food_id (food_id)
);
```

#### 3. **food_database** (Food reference data)
```sql
CREATE TABLE food_database (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_indonesian VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  calories_per_100g DECIMAL(6,2) NOT NULL,
  protein_per_100g DECIMAL(6,2) NOT NULL DEFAULT 0,
  carbs_per_100g DECIMAL(6,2) NOT NULL DEFAULT 0,
  fat_per_100g DECIMAL(6,2) NOT NULL DEFAULT 0,
  fiber_per_100g DECIMAL(6,2) NOT NULL DEFAULT 0,
  sugar_per_100g DECIMAL(6,2) NOT NULL DEFAULT 0,
  sodium_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  serving_size VARCHAR(100),
  serving_weight DECIMAL(6,2),
  barcode VARCHAR(50),
  image_url VARCHAR(500),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  source ENUM('manual', 'api', 'ai_scan') NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_category (category),
  INDEX idx_barcode (barcode),
  INDEX idx_verified (is_verified)
);
```

## 🚀 How to Fix Production Database

### Option 1: Run the Fix Script (Recommended)
```bash
# From project root
node scripts/fix-meal-tables-production.js
```

### Option 2: Manual Database Setup
```sql
-- Connect to production database and run:
USE phc_dashboard;

-- Create meal_tracking table
CREATE TABLE IF NOT EXISTS meal_tracking (
  -- (see schema above)
);

-- Create meal_foods table
CREATE TABLE IF NOT EXISTS meal_foods (
  -- (see schema above)
);

-- Create food_database table
CREATE TABLE IF NOT EXISTS food_database (
  -- (see schema above)
);

-- Add indexes for performance
CREATE INDEX idx_meal_tracking_user_date ON meal_tracking(user_id, recorded_at);
CREATE INDEX idx_meal_foods_meal ON meal_foods(meal_id, food_id);
```

## 📊 Expected Results

### Before Fix
- ❌ Database errors: "Table 'meal_foods' doesn't exist"
- ❌ API failures (500 errors)
- ❌ Cleanup operations failing
- ❌ Poor user experience

### After Fix
- ✅ All required tables exist in production
- ✅ API operations work correctly
- ✅ Cleanup operations succeed
- ✅ Better error handling for missing tables
- ✅ Graceful degradation when tables don't exist

## 🧪 Testing

To verify the fix:

1. **Check database tables exist:**
   ```sql
   SHOW TABLES LIKE 'meal_%';
   SHOW TABLES LIKE 'food_%';
   ```

2. **Test cleanup endpoint:**
   ```bash
   curl -X DELETE "https://dash.doctorphc.id/api/mobile/tracking/meal/cleanup?user_id=1"
   ```

3. **Test meal tracking API:**
   ```bash
   curl -X GET "https://dash.doctorphc.id/api/mobile/tracking/meal?user_id=1"
   ```

4. **Monitor error logs:**
   - Check for database errors in server logs
   - Verify cleanup operations complete successfully

## 📝 Monitoring

Monitor these metrics:
- **Database table existence**: Ensure all required tables exist
- **API error rates**: Check for 500 errors related to missing tables
- **Cleanup operation success**: Monitor cleanup endpoint responses
- **User experience**: Verify meal tracking functionality works

## 🔧 Additional Improvements

### 1. **Database Migration System**
Consider implementing a proper database migration system to prevent schema inconsistencies.

### 2. **Health Checks**
Add database health checks to monitor table existence and structure.

### 3. **Automated Setup**
Create automated scripts for setting up new environments with the correct schema.
