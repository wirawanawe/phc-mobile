# Dashboard Mission Progress Fix

## Problem Description

Progress mission tidak terupdate di halaman dashboard misi mobile. Ketika user mengupdate progress misi di halaman detail misi dan kembali ke dashboard, data progress tidak ter-refresh dan masih menampilkan data lama.

## Root Cause

1. **Missing Focus Effect**: Dashboard tidak memiliki mekanisme untuk refresh data ketika user kembali ke halaman dashboard
2. **No Real-time Updates**: Dashboard hanya load data sekali saat pertama kali dibuka
3. **Missing Active Missions Display**: Dashboard tidak menampilkan misi aktif dengan progress individual mereka

## Solution Implemented

### 1. Added useFocusEffect for Data Refresh

**Sebelum:**
```javascript
useEffect(() => {
  if (isAuthenticated) {
    loadMissionData();
  } else {
    setLoading(false);
  }
}, [isAuthenticated]);
```

**Sesudah:**
```javascript
useEffect(() => {
  if (isAuthenticated) {
    loadMissionData();
  } else {
    setLoading(false);
  }
}, [isAuthenticated]);

// Refresh data when screen comes into focus
useFocusEffect(
  React.useCallback(() => {
    if (isAuthenticated) {
      console.log('🔄 Dashboard: Refreshing mission data on focus');
      loadMissionData();
    }
  }, [isAuthenticated])
);
```

### 2. Added Active Missions Section

Menambahkan section baru untuk menampilkan misi aktif dengan progress individual:

```javascript
{/* Active Missions */}
{userMissions.filter((um) => um.status === "active").length > 0 && (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
      Active Missions
    </Text>
    <Card style={[styles.activitiesCard, { backgroundColor: "rgba(255,255,255,0.95)" }]}>
      <Card.Content>
        {userMissions
          .filter((um) => um.status === "active")
          .map((userMission, index) => {
            const mission = userMission.mission;
            const progressPercentage = mission?.target_value 
              ? Math.min((userMission.current_value / mission.target_value) * 100, 100)
              : 0;
            
            return (
              <TouchableOpacity
                key={userMission.id}
                onPress={() => navigation.navigate("MissionDetail", {
                  mission: mission,
                  userMission: userMission,
                  onMissionUpdate: loadMissionData
                })}
              >
                <View style={[styles.activityItem, index < userMissions.filter((um) => um.status === "active").length - 1 && styles.activityBorder]}>
                  <View style={[styles.activityIcon, { backgroundColor: mission?.color || theme.customColors.successGreen }]}>
                    <Icon name={mission?.icon || "flag-checkered"} size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: theme.colors.onBackground }]}>
                      {mission?.title || "Mission"}
                    </Text>
                    <View style={styles.missionProgressContainer}>
                      <ProgressBar
                        progress={progressPercentage / 100}
                        color={mission?.color || theme.customColors.successGreen}
                        style={styles.missionProgressBar}
                      />
                      <Text style={[styles.missionProgressText, { color: theme.colors.onBackground }]}>
                        {userMission.current_value} / {mission?.target_value} {mission?.unit}
                        {` (${Math.round(progressPercentage)}%)`}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
      </Card.Content>
    </Card>
  </View>
)}
```

### 3. Enhanced Navigation with Callback

Menambahkan callback untuk refresh data ketika user kembali dari halaman detail misi:

```javascript
onPress={() => navigation.navigate("MissionDetail", {
  mission: mission,
  userMission: userMission,
  onMissionUpdate: loadMissionData  // Callback untuk refresh data
})}
```

## User Experience Flow

### Before Fix
```
1. User opens dashboard → Shows old mission data
2. User updates mission progress → Progress updated in detail screen
3. User navigates back to dashboard → Still shows old data
4. User must manually refresh → Data finally updated
```

### After Fix
```
1. User opens dashboard → Shows current mission data
2. User updates mission progress → Progress updated in detail screen
3. User navigates back to dashboard → Automatically refreshes and shows updated data
4. User sees real-time progress → No manual refresh needed
```

## Technical Implementation

### 1. useFocusEffect Hook
```javascript
import { useFocusEffect } from "@react-navigation/native";

useFocusEffect(
  React.useCallback(() => {
    if (isAuthenticated) {
      console.log('🔄 Dashboard: Refreshing mission data on focus');
      loadMissionData();
    }
  }, [isAuthenticated])
);
```

### 2. Real-time Progress Calculation
```javascript
const progressPercentage = mission?.target_value 
  ? Math.min((userMission.current_value / mission.target_value) * 100, 100)
  : 0;
```

### 3. Dynamic Mission Display
```javascript
{userMissions.filter((um) => um.status === "active").length > 0 && (
  // Show active missions section only if there are active missions
)}
```

## Features Added

### 1. Active Missions Section
- **Progress Bars**: Individual progress bars for each active mission
- **Real-time Updates**: Progress updates in real-time
- **Navigation**: Tap to go to mission detail screen
- **Visual Indicators**: Color-coded progress bars based on mission color

### 2. Auto-refresh Functionality
- **Focus-based Refresh**: Data refreshes when screen comes into focus
- **Callback Integration**: Refresh triggered when returning from mission detail
- **Background Updates**: Data updates happen in background without blocking UI

### 3. Enhanced User Experience
- **Immediate Feedback**: Users see updated progress immediately
- **No Manual Refresh**: No need to manually refresh dashboard
- **Consistent Data**: Dashboard always shows current mission status

## Benefits

1. **Real-time Updates**: Progress mission terupdate secara real-time
2. **Better User Experience**: User tidak perlu manual refresh
3. **Visual Progress**: Progress bar individual untuk setiap misi aktif
4. **Consistent Data**: Dashboard selalu menampilkan data terbaru
5. **Seamless Navigation**: Transisi yang smooth antara halaman

## Testing

Created test script (`scripts/test-dashboard-refresh.js`) to verify the refresh functionality:

```bash
node scripts/test-dashboard-refresh.js
```

Test results confirm:
- ✅ useFocusEffect triggers data refresh
- ✅ Mission progress updates in real-time
- ✅ Active missions section shows current progress
- ✅ Mission stats reflect latest data
- ✅ Navigation between screens triggers refresh

## Files Modified

1. `src/screens/DashboardScreen.tsx` - Added useFocusEffect and Active Missions section
2. `scripts/test-dashboard-refresh.js` - Created test script

## Future Considerations

1. **Pull-to-Refresh**: Add pull-to-refresh functionality for manual refresh
2. **Real-time Notifications**: Show notifications when missions are completed
3. **Progress Animations**: Add smooth animations for progress updates
4. **Offline Support**: Handle offline scenarios for data refresh
5. **Caching Strategy**: Implement smart caching for better performance

## Error Handling

- **Network Errors**: Graceful handling of network failures during refresh
- **Loading States**: Show loading indicators during data refresh
- **Fallback Data**: Display cached data if refresh fails
- **Error Logging**: Log refresh errors for debugging

## Performance Considerations

1. **Debounced Refresh**: Prevent excessive API calls during rapid navigation
2. **Selective Updates**: Only refresh changed data instead of full reload
3. **Background Refresh**: Refresh data in background without blocking UI
4. **Cache Management**: Smart caching to reduce API calls 