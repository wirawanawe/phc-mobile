# Daily Reset Feature Implementation

## Overview

The daily reset feature automatically resets all tracking data (water intake, exercise logging, sleep tracking, mood checking) when the system date changes. This ensures that users start each day with fresh tracking data and prevents data from carrying over between days.

## Features Implemented

### 1. **Automatic Date Change Detection**
- Monitors system date changes every minute
- Detects when the date changes from one day to the next
- Stores the last checked date in AsyncStorage for persistence

### 2. **Comprehensive Data Reset**
- **Water Tracking**: Resets daily water intake to 0ml
- **Exercise Tracking**: Clears steps, exercise minutes, calories burned, distance
- **Sleep Tracking**: Resets sleep time, wake time, and quality to defaults
- **Mood Tracking**: Clears mood selection and stress level
- **Today's Summary**: Resets all metrics to zero/default values

### 3. **Event-Driven Architecture**
- Uses event emitter pattern for decoupled communication
- Emits specific reset events for each tracking type
- Allows components to respond independently to reset events

## Technical Implementation

### Core Components

#### 1. **DateChangeDetector** (`src/utils/dateChangeDetector.ts`)
```typescript
class DateChangeDetector {
  // Singleton pattern for global date monitoring
  // Checks date every minute
  // Emits reset events when date changes
  // Clears cached data automatically
}
```

#### 2. **Event System**
- `dailyReset`: Main reset event for all tracking data
- `waterReset`: Specific water tracking reset
- `fitnessReset`: Specific fitness tracking reset
- `sleepReset`: Specific sleep tracking reset
- `moodReset`: Specific mood tracking reset
- `mealReset`: Specific meal tracking reset

#### 3. **Component Integration**
All tracking screens now listen for reset events:
- `TodaySummaryCard`: Resets all metrics to zero
- `MainScreen`: Resets summary data and activity data
- `WaterTrackingScreen`: Resets water intake to 0
- `FitnessTrackingScreen`: Clears all fitness form fields
- `SleepTrackingScreen`: Resets sleep time and quality
- `MoodTrackingScreen`: Clears mood and stress selections

### Data Flow

1. **Date Change Detection**
   ```
   System Date Change → DateChangeDetector → Emit Reset Events
   ```

2. **Component Response**
   ```
   Reset Events → Components → Clear Local State → Refresh Data
   ```

3. **User Experience**
   ```
   Date Changes → App Detects Change → All Data Resets → Fresh Start
   ```

## Usage

### Automatic Operation
The feature works automatically without user intervention:
1. App monitors date changes in the background
2. When date changes, all tracking data resets
3. Users see fresh tracking forms and zero values

### Manual Testing
To test the functionality:
1. Log some data in the app (water, fitness, sleep, mood)
2. Change the system date to tomorrow
3. Return to the app - all data should be reset
4. Check Today's Summary card for zero values

### API Integration
The backend API already supports date-based data retrieval:
- `/api/mobile/tracking/today-summary?date=YYYY-MM-DD`
- All tracking endpoints support date parameters
- Data is stored with date timestamps

## Benefits

### 1. **User Experience**
- Clean slate every day
- No confusion about which day's data is being tracked
- Consistent daily tracking experience

### 2. **Data Integrity**
- Prevents data from carrying over between days
- Ensures accurate daily tracking
- Maintains historical data properly

### 3. **Performance**
- Efficient date checking (every minute)
- Minimal impact on app performance
- Uses existing event system

## Configuration

### Check Interval
The date change detector checks every 60 seconds:
```typescript
setInterval(() => {
  this.checkForDateChange();
}, 60000); // Check every minute
```

### Cached Data Clearing
When date changes, the following cached data is cleared:
- `todayWaterIntake`
- `todayFitnessData`
- `todaySleepData`
- `todayMoodData`
- `todayMealData`
- `todaySummaryData`

## Testing

### Test Script
Run the test script to verify functionality:
```bash
node scripts/test-daily-reset.js
```

### Manual Testing Steps
1. Open the app and log tracking data
2. Change system date to tomorrow
3. Return to app and verify data is reset
4. Check Today's Summary shows zero values

## Future Enhancements

### 1. **Custom Reset Times**
- Allow users to set custom reset times (e.g., 6 AM)
- Support different time zones

### 2. **Data Backup**
- Backup previous day's data before reset
- Allow users to review previous day's summary

### 3. **Notifications**
- Notify users when daily reset occurs
- Remind users to log their first entry of the day

### 4. **Streak Tracking**
- Track consecutive days of logging
- Maintain streaks across date changes

## Troubleshooting

### Common Issues

1. **Data Not Resetting**
   - Check if DateChangeDetector is initialized
   - Verify event listeners are properly attached
   - Check console logs for reset events

2. **Performance Issues**
   - Reduce check interval if needed
   - Monitor memory usage of event listeners

3. **Date Detection Issues**
   - Verify system date is correct
   - Check AsyncStorage for last checked date

### Debug Information
Enable debug logging to see reset events:
```typescript
console.log('Date change detected:', oldDate, '->', newDate);
console.log('Daily reset triggered');
```

## Conclusion

The daily reset feature provides a seamless user experience by automatically clearing tracking data when the date changes. This ensures users always start with a clean slate and prevents confusion about which day's data they're tracking.

The implementation is robust, efficient, and integrates well with the existing app architecture while maintaining data integrity and providing a consistent user experience.
