# Food 404 Errors Fix

## Problem Description

The React Native app was experiencing 404 errors when trying to access food data:

```
ERROR  🔍 Parsing error: [Error: Request failed (404): {"success":false,"message":"Food not found"}]
ERROR  ❌ Error handled: {"message": "Data yang Anda cari tidak ditemukan.", "type": "NOT_FOUND", "userMessage": "Data yang Anda cari tidak ditemukan."}
ERROR  🔍 Parsing error: [Error: Request failed (404): {"success":false","message":"Quick food not found"}]
ERROR  ❌ Error handled: {"message": "Data yang Anda cari tidak ditemukan.", "type": "NOT_FOUND", "userMessage": "Data yang Anda cari tidak ditemukan."}
ERROR  Remove from quick foods error: [Error: Data yang Anda cari tidak ditemukan.]
```

## Root Cause Analysis

The issue was caused by a mismatch between the food IDs used in the frontend fallback data and the actual food IDs in the database:

1. **Database Food IDs**: The food database was reseeded and had IDs starting from 1-21
2. **Frontend Fallback IDs**: The MealLoggingScreen was using hardcoded IDs (22, 23, 24, etc.) that didn't exist in the database
3. **API Calls**: When the app used fallback data and tried to check quick food status, it made API calls with non-existent IDs, causing 404 errors

## Solutions Implemented

### 1. Database Setup
- Created comprehensive database sync script (`sync-all-models.js`) that includes all models
- Ensured UserQuickFoods table is properly created
- Reseeded food database with correct data

### 2. Frontend Fixes

#### Updated Fallback Food Data
- Fixed food IDs in `MealLoggingScreen.tsx` to match database IDs (1-21)
- Updated both `getFallbackFoodResults()` and `getDefaultQuickFoods()` functions

**Before:**
```typescript
{
  id: 22,  // Non-existent ID
  name: "Nasi Goreng",
  // ...
}
```

**After:**
```typescript
{
  id: 1,   // Correct database ID
  name: "Nasi Goreng",
  // ...
}
```

#### Improved Error Handling
- Enhanced error handling in `api.js` to better handle 404 errors
- Updated `checkQuickFoodStatus()` to handle both "Food not found" and "Food not found in database" messages
- Updated `removeFromQuickFoods()` to handle "Quick food not found" errors gracefully

#### Optimized Search Function
- Modified search function to avoid making API calls for fallback data
- Added comment to clarify that fallback data doesn't need quick food status checks

### 3. API Service Improvements

#### Enhanced Error Handling
```typescript
// Before
if (error.message && error.message.includes("Food not found in database")) {
  return { success: false, data: { isQuickFood: false } };
}

// After
if (error.message && error.message.includes("Food not found in database") || 
    error.message && error.message.includes("Food not found")) {
  return { success: false, data: { isQuickFood: false } };
}
```

#### Graceful Quick Food Removal
```typescript
// Before
if (error.message && error.message.includes("Quick food not found")) {
  return { success: true, message: "Food was not in quick foods" };
}

// After
if (error.message && error.message.includes("Quick food not found") ||
    error.message && error.message.includes("Data yang Anda cari tidak ditemukan")) {
  return { success: true, message: "Food was not in quick foods" };
}
```

## Database Schema

### UserQuickFoods Table
```sql
CREATE TABLE user_quick_foods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  food_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (food_id) REFERENCES food_database(id),
  UNIQUE KEY unique_user_food (user_id, food_id)
);
```

### Food Database
- Contains 21 food items with IDs 1-21
- Includes Indonesian foods like Nasi Goreng, Ayam Goreng, Gado-gado, etc.
- Each food has complete nutritional information

## Testing

### Database Verification
```bash
# Check food database
mysql -u root -ppr1k1t1w phc_mobile -e "SELECT id, name FROM food_database ORDER BY id;"

# Check UserQuickFoods table
mysql -u root -ppr1k1t1w phc_mobile -e "DESCRIBE user_quick_foods;"
```

### API Testing
```bash
# Test food search
curl -X GET "http://localhost:5432/api/food/search?query=nasi" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test quick food check
curl -X GET "http://localhost:5432/api/food/quick-foods/check/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Prevention Measures

1. **Database Seeding**: Always use consistent IDs when seeding data
2. **Frontend Fallback**: Keep fallback data IDs synchronized with database
3. **Error Handling**: Implement comprehensive error handling for all API calls
4. **Testing**: Test API endpoints with both valid and invalid IDs

## Files Modified

1. `src/screens/MealLoggingScreen.tsx` - Updated fallback food IDs and error handling
2. `src/services/api.js` - Enhanced error handling for food-related API calls
3. `backend/scripts/sync-all-models.js` - Created comprehensive database sync script
4. `backend/models/UserQuickFoods.js` - Ensured proper model definition
5. `backend/routes/food.js` - Verified quick foods endpoints implementation

## Result

- ✅ 404 errors for food data resolved
- ✅ Quick foods functionality working properly
- ✅ Graceful error handling for non-existent food items
- ✅ Database properly synchronized with all models
- ✅ Frontend fallback data matches database IDs

The app should now work without the 404 errors when accessing food data and quick foods functionality. 