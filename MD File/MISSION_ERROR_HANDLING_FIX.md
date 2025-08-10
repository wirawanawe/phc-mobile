# Mission Error Handling Fix

## Problem Description

The mobile app was experiencing network errors when users tried to accept missions that were already active. The error logs showed:

```
ERROR  🌐 Network error: [Error: Request failed (409): {"success":false,"message":"Mission sudah diterima dan sedang dalam progress"}]
ERROR  🔍 Parsing error: [Error: An unexpected network error occurred. Please try again.]
ERROR  ❌ Error handled: {"message": "An unexpected network error occurred. Please try again.", "type": "UNKNOWN", "userMessage": "Terjadi kesalahan. Silakan coba lagi."}
```

The issue was that the app was treating the 409 status code (Conflict) as a generic network error instead of handling it as a specific business logic error.

## Root Cause

1. **Missing 409 Status Code Handling**: The API service's `request` method didn't have specific handling for 409 status codes
2. **Generic Error Messages**: The error handler was treating all 409 errors as unknown errors
3. **Poor User Experience**: Users received generic "network error" messages instead of specific mission-related feedback

## Solution Implemented

### 1. Enhanced Error Handler (`src/utils/errorHandler.ts`)

- **Added CONFLICT Error Type**: New error type specifically for 409 status codes
- **Updated Error Messages**: Added Indonesian error messages for conflict scenarios
- **Enhanced Message Parsing**: Added detection for mission-related conflict messages

```typescript
export enum ErrorType {
  // ... existing types
  CONFLICT = 'CONFLICT',
  UNKNOWN = 'UNKNOWN'
}

// Added conflict error messages
[ErrorType.CONFLICT]: {
  message: 'Data yang Anda coba ubah sudah ada. Silakan coba lagi.',
  userMessage: 'Data yang Anda coba ubah sudah ada. Silakan coba lagi.',
  shouldRetry: false,
  shouldLogout: false,
  shouldShowAlert: true
}
```

### 2. Enhanced API Service (`src/services/api.js`)

- **Added 409 Status Code Handling**: Specific handling for different types of mission conflicts
- **Improved Error Messages**: User-friendly Indonesian messages for each conflict type

```javascript
// Handle 409 Conflict errors specifically for missions
if (response.status === 409) {
  console.log("⚠️ 409 Conflict detected:", errorText);
  if (errorText.includes("Mission sudah diterima") || errorText.includes("sudah dalam progress")) {
    throw new Error("Mission sudah diterima dan sedang dalam progress. Silakan cek misi aktif Anda.");
  } else if (errorText.includes("sudah diselesaikan")) {
    throw new Error("Mission sudah diselesaikan. Tidak dapat diperbarui lagi.");
  } else if (errorText.includes("sudah dibatalkan")) {
    throw new Error("Mission sudah dibatalkan. Tidak dapat diperbarui lagi.");
  } else if (errorText.includes("tidak dapat ditinggalkan")) {
    throw new Error("Mission yang sudah diselesaikan tidak dapat ditinggalkan.");
  }
  throw new Error(`Konflik data: ${errorText || response.statusText}`);
}
```

### 3. Enhanced Mission Screens

#### MissionDetailScreen (`src/screens/MissionDetailScreen.tsx`)
- **Added Specific Error Handling**: Handles mission conflict errors with appropriate user feedback
- **Improved User Experience**: Shows specific alerts for different mission states

#### DailyMissionScreen (`src/screens/DailyMissionScreen.tsx`)
- **Consistent Error Handling**: Same error handling as MissionDetailScreen
- **Better User Guidance**: Provides navigation options to view active missions

### 4. Backend API Analysis

The backend correctly returns 409 status codes for various mission conflicts:

- **Mission Acceptance**: `"Mission sudah diterima dan sedang dalam progress"`
- **Mission Progress**: `"Mission sudah diselesaikan"` or `"Mission sudah dibatalkan"`
- **Mission Abandonment**: `"Mission yang sudah diselesaikan tidak dapat ditinggalkan"`

## Error Scenarios Handled

1. **Mission Already Accepted**: User tries to accept a mission they already have active
2. **Mission Already Completed**: User tries to update progress on a completed mission
3. **Mission Already Cancelled**: User tries to update progress on a cancelled mission
4. **Cannot Abandon Completed Mission**: User tries to abandon a completed mission

## User Experience Improvements

### Before Fix
```
❌ Error: An unexpected network error occurred. Please try again.
```

### After Fix
```
🔄 Mission Already Accepted
Mission sudah diterima dan sedang dalam progress. Silakan cek misi aktif Anda.
[Lihat Misi Aktif] [OK]
```

## Testing

Created test script (`scripts/test-mission-error-handling.js`) to verify error handling:

```bash
node scripts/test-mission-error-handling.js
```

Test results confirm proper handling of all conflict scenarios.

## Files Modified

1. `src/utils/errorHandler.ts` - Added CONFLICT error type and handling
2. `src/services/api.js` - Enhanced 409 status code handling
3. `src/screens/MissionDetailScreen.tsx` - Added specific error handling
4. `src/screens/DailyMissionScreen.tsx` - Added specific error handling
5. `scripts/test-mission-error-handling.js` - Created test script

## Benefits

1. **Better User Experience**: Users receive clear, actionable error messages
2. **Reduced Support Tickets**: Clear error messages reduce confusion
3. **Improved App Stability**: Proper error handling prevents app crashes
4. **Consistent Error Handling**: All mission-related conflicts handled uniformly
5. **Indonesian Language Support**: All error messages in Indonesian for better user experience

## Future Considerations

1. **Extend to Other Features**: Apply similar error handling to other features that may return 409 status codes
2. **Error Analytics**: Track specific error types to identify common user issues
3. **Retry Logic**: Consider implementing smart retry logic for transient errors
4. **Offline Handling**: Improve error handling for offline scenarios 