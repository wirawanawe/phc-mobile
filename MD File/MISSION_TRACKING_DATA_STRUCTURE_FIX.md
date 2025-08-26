# 🐛 Mission Tracking Data Structure Fix

## 🚨 **Error Description**

```
ERROR Error getting tracking data for mission: [TypeError: mealResponse.data.filter is not a function (it is undefined)]
```

## 🔍 **Root Cause Analysis**

The error occurred because the `getTrackingDataForMission` method was trying to call `.filter()` directly on `mealResponse.data`, but the API response structure was different than expected.

### **API Response Formats:**

1. **Meal Tracking API**: `{ success: true, data: { entries: [...] } }`
2. **Water Tracking API**: `{ success: true, data: { entries: [...] } }`
3. **Sleep Tracking API**: `{ success: true, data: { sleepData: [...] } }`
4. **Fitness Tracking API**: `{ success: true, data: [...] }` (direct array)
5. **Mood Tracking API**: `{ success: true, data: { entries: [...] } }`

### **Problem:**
The code was assuming all APIs returned data in the same format, but they actually have different structures.

## ✅ **Solution Implemented**

### **1. Fixed Data Structure Handling**

Updated the `getTrackingDataForMission` method in `src/services/api.js` to handle all API response formats correctly:

#### **Before (Incorrect):**
```javascript
// This would fail for meal tracking because mealResponse.data is an object, not an array
const todayMeals = mealResponse.data.filter(entry => 
  new Date(entry.recorded_at).toDateString() === new Date().toDateString()
);
```

#### **After (Correct):**
```javascript
// Handle the correct data structure: { entries: [...] }
const mealEntries = mealResponse.data.entries || mealResponse.data;
if (Array.isArray(mealEntries)) {
  const todayMeals = mealEntries.filter(entry => 
    new Date(entry.recorded_at).toDateString() === new Date().toDateString()
  );
  // ... rest of the logic
}
```

### **2. Updated All Tracking Categories**

#### **Nutrition (Meal) Tracking:**
```javascript
case 'nutrition':
  const mealResponse = await this.getMealLogging();
  if (mealResponse.success && mealResponse.data) {
    // Handle the correct data structure: { entries: [...] }
    const mealEntries = mealResponse.data.entries || mealResponse.data;
    if (Array.isArray(mealEntries)) {
      const todayMeals = mealEntries.filter(entry => 
        new Date(entry.recorded_at).toDateString() === new Date().toDateString()
      );
      if (missionUnit === 'calories') {
        trackingData = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      } else if (missionUnit === 'meals') {
        const uniqueMealTypes = new Set(todayMeals.map(meal => meal.meal_type));
        trackingData = uniqueMealTypes.size;
      }
    }
  }
  break;
```

#### **Health Tracking (Water & Sleep):**
```javascript
case 'health_tracking':
  if (missionUnit === 'ml') {
    const waterResponse = await this.getWaterTracking();
    if (waterResponse.success && waterResponse.data) {
      // Handle water tracking data structure: { entries: [...] }
      const waterEntries = waterResponse.data.entries || waterResponse.data;
      if (Array.isArray(waterEntries)) {
        const todayWater = waterEntries.find(entry => 
          entry.tracking_date === today
        );
        trackingData = todayWater?.amount_ml || 0;
      }
    }
  } else if (missionUnit === 'hours') {
    const sleepResponse = await this.getSleepTracking();
    if (sleepResponse.success && sleepResponse.data) {
      // Handle sleep tracking data structure: { sleepData: [...] }
      const sleepEntries = sleepResponse.data.sleepData || sleepResponse.data;
      if (Array.isArray(sleepEntries)) {
        const todaySleep = sleepEntries.find(entry => 
          entry.sleep_date === today
        );
        trackingData = todaySleep?.sleep_hours || 0;
      }
    }
  }
  break;
```

#### **Fitness Tracking:**
```javascript
case 'fitness':
  const fitnessResponse = await this.getFitnessTracking();
  if (fitnessResponse.success && fitnessResponse.data) {
    // Handle fitness tracking data structure: direct array
    const fitnessEntries = Array.isArray(fitnessResponse.data) ? fitnessResponse.data : [];
    if (fitnessEntries.length > 0) {
      const todayFitness = fitnessEntries.find(entry => 
        entry.recorded_at && new Date(entry.recorded_at).toDateString() === new Date().toDateString()
      );
      if (missionUnit === 'steps' || missionUnit === 'langkah') {
        trackingData = todayFitness?.steps || 0;
      } else if (missionUnit === 'minutes' || missionUnit === 'menit') {
        trackingData = todayFitness?.duration_minutes || 0;
      }
    }
  }
  break;
```

#### **Mental Health (Mood) Tracking:**
```javascript
case 'mental_health':
  const moodResponse = await this.getMoodTracking();
  if (moodResponse.success && moodResponse.data) {
    // Handle mood tracking data structure: { entries: [...] }
    const moodEntries = moodResponse.data.entries || moodResponse.data;
    if (Array.isArray(moodEntries)) {
      const todayMood = moodEntries.find(entry => 
        entry.tracking_date === today
      );
      if (missionUnit === 'mood_score') {
        trackingData = todayMood?.mood_score || 0;
      } else if (missionUnit === 'stress_level') {
        if (todayMood?.stress_level) {
          switch (todayMood.stress_level) {
            case 'low': trackingData = 1; break;
            case 'moderate': trackingData = 2; break;
            case 'high': trackingData = 3; break;
            case 'very_high': trackingData = 4; break;
            default: trackingData = 2;
          }
        }
      }
    }
  }
  break;
```

### **3. Added Debug Logging**

Added comprehensive logging to help debug future issues:

```javascript
console.log(`🔍 MissionDetailService: Getting tracking data for ${missionCategory}/${missionUnit} on ${today}`);
console.log(`🍽️ Meal response:`, mealResponse);
console.log(`🍽️ Meal entries:`, mealEntries);
console.log(`🍽️ Today's meals:`, todayMeals);
```

### **4. Enhanced Error Handling**

Added proper array validation and fallback handling:

```javascript
if (Array.isArray(mealEntries)) {
  // Process data
} else {
  console.log(`❌ Meal entries is not an array:`, typeof mealEntries, mealEntries);
}
```

## 🧪 **Testing**

The fix ensures that:
- ✅ Meal tracking missions work correctly
- ✅ Water tracking missions work correctly  
- ✅ Sleep tracking missions work correctly
- ✅ Fitness tracking missions work correctly
- ✅ Mood tracking missions work correctly
- ✅ Proper error handling for malformed responses
- ✅ Debug logging for troubleshooting

## 📝 **Key Changes Made**

1. **Fixed data structure handling** for all tracking APIs
2. **Added Array.isArray() validation** before calling array methods
3. **Enhanced error logging** for better debugging
4. **Updated field mappings** to match actual API response fields
5. **Added fallback handling** for different response formats

## 🔧 **Files Modified**

- `src/services/api.js` - Updated `getTrackingDataForMission` method

## 🎯 **Result**

The error `mealResponse.data.filter is not a function` is now resolved, and mission tracking data retrieval works correctly for all tracking categories.
