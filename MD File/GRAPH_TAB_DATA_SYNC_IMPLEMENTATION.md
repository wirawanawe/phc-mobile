# Graph Tab Data Sync Implementation

## Overview

The Graph tab in the PHC Mobile app now syncs data directly with the database through the weekly summary API endpoint. This ensures that all chart data displayed is real-time and accurate.

## Features Implemented

### 1. Real-time Database Sync
- **API Integration**: Graph tab fetches data from `/api/mobile/tracking/weekly-summary`
- **Data Mapping**: Properly maps database fields to chart data structure
- **Error Handling**: Graceful fallback to zero values when API fails

### 2. Auto-refresh Functionality
- **Focus-based Refresh**: Data refreshes when user navigates back to Graph tab
- **Event-driven Updates**: Listens for activity logging events to refresh data
- **Pull-to-refresh**: Users can manually refresh by pulling down the screen

### 3. Visual Sync Indicators
- **Sync Status**: Shows last sync time in header
- **Loading States**: Visual indicators during data loading
- **Success Messages**: Confirmation when data syncs successfully

## Technical Implementation

### 1. Data Flow
```
User Activity → Database → Weekly Summary API → Graph Tab → Chart Display
```

### 2. API Endpoint
```javascript
// Endpoint: /api/mobile/tracking/weekly-summary
// Method: GET
// Parameters: user_id (from JWT token or query param)

Response Structure:
{
  success: true,
  data: {
    period: { start_date, end_date, days },
    weekly_totals: { calories, water_ml, steps, exercise_minutes, ... },
    weekly_averages: { calories_per_day, water_ml_per_day, ... },
    wellness_score: number,
    daily_breakdown: {
      nutrition: [...],
      water: [...],
      fitness: [...],
      sleep: [...],
      mood: [...]
    }
  }
}
```

### 3. Chart Data Mapping
```typescript
interface WeeklyData {
  date: string;
  steps: number;           // From fitness_tracking.total_steps
  waterIntake: number;     // From water_tracking.total_ml
  sleepHours: number;      // From sleep_tracking.total_hours
  moodScore: number;       // From mood_tracking.avg_mood_score
  exerciseMinutes: number; // From fitness_tracking.total_exercise_minutes
  calories: number;        // From meal_tracking.total_calories
}
```

### 4. Event Listeners
The Graph tab listens for these events to auto-refresh:
- `mealLogged`: When user logs a meal
- `waterLogged`: When user logs water intake
- `fitnessLogged`: When user logs fitness activity
- `sleepLogged`: When user logs sleep data
- `moodLogged`: When user logs mood
- `dataRefresh`: General data refresh event

## Database Tables Used

### 1. fitness_tracking
- `total_steps`: Daily step count
- `total_exercise_minutes`: Exercise duration
- `total_distance_km`: Distance covered

### 2. water_tracking
- `total_ml`: Daily water intake

### 3. sleep_tracking
- `total_hours`: Sleep duration (converted from minutes)

### 4. mood_tracking
- `avg_mood_score`: Average mood score (mapped from mood levels)

### 5. meal_tracking + meal_foods
- `total_calories`: Daily calorie intake

## User Experience Features

### 1. Sync Status Display
```typescript
// Shows last sync time in header
{lastSyncTime && (
  <Text style={styles.syncTime}>
    {' • Terakhir sync: ' + lastSyncTime.toLocaleTimeString('id-ID')}
  </Text>
)}
```

### 2. Pull-to-refresh
```typescript
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => loadWeeklyData(true)}
      colors={["#E22345"]}
    />
  }
>
```

### 3. Success Notifications
```typescript
// Shows success message after sync
{showSyncSuccess && (
  <View style={styles.syncSuccessContainer}>
    <Text>Data berhasil disinkronkan</Text>
  </View>
)}
```

## Error Handling

### 1. API Failures
- Falls back to zero values instead of random data
- Shows loading states during retry
- Logs errors for debugging

### 2. Network Issues
- Graceful degradation
- User-friendly error messages
- Retry mechanisms

### 3. Data Validation
- Validates date ranges
- Handles missing data gracefully
- Ensures chart data integrity

## Performance Optimizations

### 1. Caching
- Caches weekly data to reduce API calls
- Only refreshes when necessary

### 2. Efficient Queries
- Single API call for all chart data
- Optimized database queries with proper indexing

### 3. Memory Management
- Proper cleanup of event listeners
- Efficient state management

## Testing

### 1. Manual Testing
```bash
# Test the API endpoint
curl "http://localhost:3000/api/mobile/tracking/weekly-summary?user_id=1"
```

### 2. Automated Testing
```bash
# Run the test script
node scripts/test-graph-sync.js
```

### 3. Test Scenarios
- [ ] Data loads correctly on app start
- [ ] Data refreshes when navigating back to Graph tab
- [ ] Data updates when logging new activities
- [ ] Pull-to-refresh works correctly
- [ ] Error handling works for network issues
- [ ] All chart types display correct data

## Future Enhancements

### 1. Real-time Updates
- WebSocket integration for live updates
- Push notifications for data changes

### 2. Offline Support
- Local data caching
- Sync when connection restored

### 3. Advanced Analytics
- Trend analysis
- Predictive insights
- Goal tracking

## Troubleshooting

### Common Issues

1. **No Data Displayed**
   - Check if user has logged any activities
   - Verify API endpoint is accessible
   - Check database connection

2. **Data Not Updating**
   - Verify event listeners are working
   - Check if API is returning fresh data
   - Ensure proper authentication

3. **Performance Issues**
   - Check API response times
   - Verify database query optimization
   - Monitor memory usage

### Debug Commands
```bash
# Check API status
curl -I "http://localhost:3000/api/mobile/tracking/weekly-summary?user_id=1"

# Check database connection
mysql -u username -p database_name -e "SELECT COUNT(*) FROM fitness_tracking;"

# Monitor API logs
tail -f dash-app/backend.log
```

## Conclusion

The Graph tab now provides a seamless, real-time data sync experience with the database. Users can see their actual activity data reflected in beautiful charts, with automatic updates and intuitive refresh mechanisms.
