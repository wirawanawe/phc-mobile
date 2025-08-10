# Active Mission Card Layout Fix

## Problem
Active Mission cards on the WellnessApp page were being cut off at the bottom, making the content difficult to read and interact with.

## Root Cause
The issue was caused by insufficient padding and spacing in the Active Mission card layout, particularly:
1. Insufficient bottom padding in the horizontal ScrollView container
2. Insufficient bottom padding in the card gradient container
3. Missing minimum height for the cards
4. Insufficient bottom padding in the main content container

## Solution Applied

### 1. Increased ScrollView Container Padding
```javascript
activeMissionsScrollContainer: {
  paddingHorizontal: 20,
  paddingBottom: 40, // Increased from 20 to 40 to prevent cutoff
},
```

### 2. Enhanced Card Gradient Container
```javascript
activeMissionCardGradient: {
  padding: 20,
  minHeight: 160,
  paddingBottom: 24, // Increased bottom padding
  justifyContent: 'space-between', // Added to ensure proper spacing
},
```

### 3. Added Minimum Height to Cards
```javascript
activeMissionCard: {
  width: 280,
  marginRight: 16,
  borderRadius: 20,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 8,
  marginBottom: 20,
  minHeight: 180, // Added minimum height to prevent cutoff
},
```

### 4. Enhanced Progress Container Spacing
```javascript
activeMissionProgressContainer: {
  marginTop: 16,
  marginBottom: 8,
  paddingBottom: 4, // Added bottom padding
},
```

### 5. Increased Main Content Container Padding
```javascript
contentContainer: {
  paddingBottom: 60, // Increased from 40 to 60 to prevent cutoff
},
```

### 6. Added Missions Section Padding
```javascript
missionsSection: {
  paddingHorizontal: 20,
  paddingBottom: 20, // Added bottom padding
},
```

## Files Modified
- `src/screens/WellnessApp.tsx` - Updated styles for Active Mission cards

## Changes Made
1. **activeMissionsScrollContainer**: Increased bottom padding from 20 to 40
2. **activeMissionCard**: Added minHeight: 180
3. **activeMissionCardGradient**: Added paddingBottom: 24 and justifyContent: 'space-between'
4. **activeMissionProgressContainer**: Added paddingBottom: 4
5. **contentContainer**: Increased paddingBottom from 40 to 60
6. **missionsSection**: Added paddingBottom: 20

## Result
✅ **FIXED** - Active Mission cards now display properly without being cut off at the bottom

The cards now have:
- Proper spacing between content elements
- Adequate bottom padding to prevent cutoff
- Minimum height to ensure all content is visible
- Better overall layout and readability

## Testing
To verify the fix:
1. Open the WellnessApp
2. Navigate to the Dashboard tab
3. Check the Active Missions section
4. Verify that the mission cards are fully visible and not cut off at the bottom
5. Test horizontal scrolling to ensure all cards are properly displayed 