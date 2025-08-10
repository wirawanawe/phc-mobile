# Multiple Mission Dates Feature

## Overview

This feature allows users to select the same mission multiple times with different `created_at` dates. Previously, users could only select a mission once due to a unique constraint on `(user_id, mission_id)`. Now, users can select the same mission multiple times as long as they choose different dates.

## Database Changes

### Migration Script
- **File**: `dash-app/init-scripts/21-add-mission-date.sql`
- **Purpose**: Updates the user_missions table to support multiple missions with different dates

### Key Changes:
1. **Added `mission_date` column**: Stores the specific date for each mission instance
2. **Removed old unique constraint**: `unique_user_mission (user_id, mission_id)` 
3. **Added new unique constraint**: `unique_user_mission_date (user_id, mission_id, mission_date)`
4. **Added indexes**: For better performance on date-based queries

```sql
-- Add mission_date column
ALTER TABLE user_missions ADD COLUMN mission_date DATE NULL AFTER mission_id;

-- Remove old unique constraint
ALTER TABLE user_missions DROP INDEX unique_user_mission;

-- Add new unique constraint allowing multiple dates
ALTER TABLE user_missions ADD UNIQUE KEY unique_user_mission_date (user_id, mission_id, mission_date);

-- Add performance indexes
CREATE INDEX idx_user_missions_date ON user_missions(user_id, mission_date);
CREATE INDEX idx_user_missions_mission_date ON user_missions(user_id, mission_id, mission_date);
```

## API Changes

### Backend Updates

#### 1. User Missions API (`dash-app/app/api/mobile/user_missions/route.js`)
- **POST endpoint**: Now checks for existing missions by date instead of just user_id and mission_id
- **Validation**: Prevents duplicate missions for the same date
- **Insert**: Includes mission_date in the insert query

#### 2. User Missions [id] API (`dash-app/app/api/mobile/user_missions/[id]/route.js`)
- **PUT endpoint**: Updated to handle mission_date in updates
- **Validation**: Checks for duplicates by date when updating

#### 3. Accept Mission API (`dash-app/app/api/mobile/missions/accept/[missionId]/route.js`)
- **POST endpoint**: Now accepts missions for specific dates
- **Logic**: Allows multiple missions with different dates, prevents duplicates for same date
- **Response**: Includes mission_date in the response

#### 4. My Missions API (`dash-app/app/api/mobile/my-missions/route.js`)
- **GET endpoint**: Updated to filter by mission_date instead of created_at
- **Query**: Uses `mission_date` field for date-based filtering

### Frontend Updates

#### 1. Mission Detail Screen (`src/screens/MissionDetailScreen.tsx`)
- **Date Picker**: Added date selection before accepting missions
- **UI**: Shows selected date and allows users to change it
- **Accept Mission**: Now sends the selected date to the API

#### 2. API Service (`src/services/api.js`)
- **acceptMission method**: Already supports missionDate parameter
- **getMyMissions method**: Supports date filtering

## User Experience

### Before (Old Behavior)
- User could only select a mission once
- If they wanted to do the same mission again, they had to wait or couldn't
- Limited flexibility for mission planning

### After (New Behavior)
- User can select the same mission multiple times
- Each selection is tied to a specific date
- User can plan missions for different days
- Cannot select the same mission twice for the same date

### Example Usage
1. **User selects "Drink 8 glasses of water" for today** ✅
2. **User selects "Drink 8 glasses of water" for tomorrow** ✅
3. **User tries to select "Drink 8 glasses of water" for today again** ❌ (Blocked)
4. **User selects "Drink 8 glasses of water" for next week** ✅

## Testing

### Test Script
- **File**: `scripts/test-multiple-mission-dates.js`
- **Purpose**: Verifies the multiple mission dates functionality
- **Tests**:
  1. Accept mission for today
  2. Accept same mission for tomorrow
  3. Accept same mission for yesterday
  4. Try to accept same mission for same date (should fail)
  5. Get missions for different dates
  6. Get all missions across all dates

### Manual Testing
1. Open the mobile app
2. Go to Daily Missions screen
3. Select a mission
4. Choose a date (today, tomorrow, etc.)
5. Accept the mission
6. Try to select the same mission for the same date (should be blocked)
7. Select the same mission for a different date (should work)

## Benefits

1. **Flexibility**: Users can plan missions for different days
2. **Reusability**: Popular missions can be selected multiple times
3. **Better Planning**: Users can set up missions in advance
4. **Consistency**: Each mission instance is tied to a specific date
5. **Data Integrity**: Prevents duplicate missions for the same date

## Migration Notes

- **Existing Data**: All existing user_missions will have their `mission_date` set to the date of their `created_at`
- **Backward Compatibility**: The system maintains backward compatibility with existing data
- **Performance**: New indexes ensure good performance for date-based queries

## Future Enhancements

1. **Mission Templates**: Allow users to create mission templates for recurring activities
2. **Bulk Mission Selection**: Allow selecting multiple missions for a date range
3. **Mission Scheduling**: Advanced scheduling features for mission planning
4. **Mission History**: Better visualization of mission history across dates 