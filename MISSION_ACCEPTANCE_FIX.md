# Mission Acceptance Error Handling Fix

## Problem Description

The mobile app was experiencing an issue where when a user tried to accept a mission that was already completed, the backend would return a 409 Conflict error with the message "Mission sudah diselesaikan" (Mission already completed). However, the frontend API service was catching this error and falling back to the mock API, which would create a new user mission instead of properly handling the error.

### Symptoms
- User tries to accept a completed mission
- Backend returns 409 Conflict: "Mission sudah diselesaikan"
- Frontend falls back to mock API
- Mock API creates a new user mission (incorrect behavior)
- User sees inconsistent state

### Root Cause
The `acceptMission` function in `src/services/api.js` was catching ALL errors and falling back to the mock API, including valid server responses like 409 Conflict errors that should be handled by the UI.

## Solution Implemented

### 1. Updated API Service Error Handling

Modified the `acceptMission`, `updateMissionProgress`, and `abandonMission` functions in `src/services/api.js` to properly handle specific error cases without falling back to the mock API.

#### Before (Problematic Code):
```javascript
async acceptMission(missionId) {
  try {
    const response = await this.request(`/missions/accept/${missionId}`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
    return response;
  } catch (error) {
    console.log("🌐 Real API failed, trying mock API for acceptMission");
    return await mockApiService.acceptMission(missionId); // ❌ Always falls back
  }
}
```

#### After (Fixed Code):
```javascript
async acceptMission(missionId) {
  try {
    const response = await this.request(`/missions/accept/${missionId}`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
    return response;
  } catch (error) {
    // Don't fall back to mock API for specific error cases that should be handled by the UI
    if (error.message.includes("Mission sudah diselesaikan") || 
        error.message.includes("Mission sudah diterima") ||
        error.message.includes("sudah dalam progress") ||
        error.message.includes("sudah dibatalkan") ||
        error.message.includes("tidak dapat ditinggalkan")) {
      console.log("⚠️ Mission status error - not falling back to mock API:", error.message);
      throw error; // Re-throw the error to be handled by the UI
    }
    
    // Only fall back to mock API for network/connection errors
    if (error.message.includes("Network") || 
        error.message.includes("connection") || 
        error.message.includes("fetch") || 
        error.message.includes("timeout") ||
        error.message.includes("Server error")) {
      console.log("🌐 Network error detected, trying mock API for acceptMission");
      return await mockApiService.acceptMission(missionId);
    }
    
    // For other errors, re-throw to be handled by the UI
    throw error;
  }
}
```

### 2. Error Categories Handled

The fix now properly categorizes different types of errors:

#### Mission Status Errors (NOT fallback to mock API):
- `"Mission sudah diselesaikan"` - Mission already completed
- `"Mission sudah diterima"` - Mission already accepted
- `"sudah dalam progress"` - Mission already in progress
- `"sudah dibatalkan"` - Mission already cancelled
- `"tidak dapat ditinggalkan"` - Mission cannot be abandoned

#### Network Errors (DO fallback to mock API):
- Network connection issues
- Timeout errors
- Server errors (500+)
- Fetch errors

### 3. UI Error Handling

The MissionDetailScreen already had comprehensive error handling for these cases:

```javascript
if (errorMessage.includes("mission sudah diterima") || errorMessage.includes("sudah dalam progress")) {
  Alert.alert(
    "🔄 Mission Already Accepted",
    "Mission sudah diterima dan sedang dalam progress. Halaman akan diperbarui untuk menampilkan mode update progress.",
    [{ text: "OK", onPress: async () => { await refreshUserMissionData(); } }]
  );
} else if (errorMessage.includes("sudah diselesaikan")) {
  Alert.alert(
    "🔄 Mission Status Error",
    error.message,
    [{ text: "OK", onPress: async () => { await refreshUserMissionData(); } }]
  );
}
```

## Testing

### Test Scripts Created

1. **`scripts/test-mission-error-handling.js`** - Tests error parsing logic
2. **`scripts/test-mission-acceptance-fix.js`** - Tests the new API service error handling
3. **`scripts/test-mission-fix-verification.js`** - Comprehensive verification tests

### Test Results

All tests pass:
- ✅ Completed missions correctly throw 409 errors without falling back to mock API
- ✅ New missions are accepted successfully
- ✅ Error messages are properly categorized
- ✅ UI error handling works correctly

## Benefits

1. **Correct Error Handling**: 409 Conflict errors are now properly handled by the UI instead of being masked by mock API fallbacks
2. **Consistent State**: Users see accurate mission status instead of incorrect mock data
3. **Better User Experience**: Clear error messages explain what happened and what to do next
4. **Maintainable Code**: Clear separation between network errors (fallback to mock) and business logic errors (handle in UI)

## Files Modified

- `src/services/api.js` - Updated `acceptMission`, `updateMissionProgress`, and `abandonMission` functions
- `scripts/test-mission-error-handling.js` - Created test for error parsing
- `scripts/test-mission-acceptance-fix.js` - Created test for API service fix
- `scripts/test-mission-fix-verification.js` - Created comprehensive verification test

## Verification

To verify the fix is working:

1. Run the test scripts:
   ```bash
   node scripts/test-mission-error-handling.js
   node scripts/test-mission-acceptance-fix.js
   node scripts/test-mission-fix-verification.js
   ```

2. Test in the mobile app:
   - Try to accept a mission that's already completed
   - Should see proper error message instead of incorrect mock data
   - Try to accept a new mission
   - Should work normally

## Future Considerations

1. **Monitor Logs**: Watch for any new error patterns that might need similar handling
2. **Error Analytics**: Consider adding error tracking to identify common issues
3. **User Feedback**: Monitor user reports to ensure error messages are clear and helpful 