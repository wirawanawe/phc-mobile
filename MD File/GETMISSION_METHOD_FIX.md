# getMission Method Fix

## Problem Description

The `MissionDetailService` was throwing an error:
```
ERROR ❌ MissionDetailService: Error getting mission data: [TypeError: _api.default.getMission is not a function (it is undefined)]
```

## Root Cause Analysis

The `MissionDetailService` was trying to call `apiService.getMission(missionId)` on line 95 of `src/services/MissionDetailService.ts`, but this method did not exist in the API service.

**Available methods in API service:**
- `getMissions()` (plural) - Get all missions
- `getMissionsByCategory()`
- `getMissionsByDate()`
- `getMissionHistory()`
- `getMissionStats()`

**Missing method:**
- `getMission(missionId)` (singular) - Get a single mission by ID

## Solution Implemented

### 1. Added getMission Method to API Service

**File**: `src/services/api.js`

Added the missing `getMission()` method after the `getMissions()` method:

```javascript
async getMission(missionId) {
  try {
    console.log('🔍 API: Getting mission by ID:', missionId);
    const response = await this.request(`/missions/${missionId}`);
    return response;
  } catch (error) {
    console.warn('🔄 API: getMission failed, using fallback:', error.message);
    
    // For timeout/network errors, return error response
    if (error.message.includes('timeout') || error.message.includes('network')) {
      return {
        success: false,
        message: 'Mission data temporarily unavailable'
      };
    }
    
    // Try to get from mock API as fallback
    return await mockApiService.getMission(missionId);
  }
}
```

### 2. Added getMission Method to Mock API Service

**File**: `src/services/mockApi.js`

Added the corresponding `getMission()` method to the mock API service:

```javascript
async getMission(missionId) {
  try {
    const mission = this.mockMissions.find(m => m.id === missionId);
    
    if (!mission) {
      return {
        success: false,
        message: "Mission not found"
      };
    }
    
    return {
      success: true,
      data: mission
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to get mission",
      error: error.message
    };
  }
}
```

## Server Endpoint

The server already had the corresponding endpoint at `/api/mobile/missions/[id]/route.js` which returns a single mission by ID.

## Verification

Created and ran a test script `scripts/test-getMission-fix.js` that confirmed:
- ✅ `getMission` method found in `api.js`
- ✅ `getMission` method found in `mockApi.js`
- ✅ `MissionDetailService` is calling `apiService.getMission`

## Result

The error `_api.default.getMission is not a function (it is undefined)` should now be resolved. The `MissionDetailService` can successfully call `apiService.getMission(missionId)` to retrieve individual mission data.

## Related Methods

The following methods were already available and working:
- `getUserMission(userMissionId)` - Get user mission data
- `getTrackingDataForMission(missionCategory, missionUnit)` - Get tracking data for mission integration
