# Time-Based Greeting Implementation

## Overview
The mobile app now features a dynamic greeting system that changes based on the current time of day. The greeting appears on the main screen and automatically updates to reflect the appropriate time-based greeting.

## Implementation Details

### Time Ranges and Greetings

| Time Range | Greeting | Icon | Color |
|------------|----------|------|-------|
| 05:00 - 11:59 | Selamat Pagi | weather-sunny | #D69E2E |
| 12:00 - 14:59 | Selamat Siang | weather-sunny | #D69E2E |
| 15:00 - 17:59 | Selamat Sore | weather-partly-cloudy | #E53E3E |
| 18:00 - 21:59 | Selamat Malam | weather-night | #9F7AEA |
| 22:00 - 04:59 | Selamat Malam | weather-night | #9F7AEA |

### Files Modified

1. **`src/screens/MainScreen.tsx`**
   - Added state management for current greeting
   - Added timer to update greeting every minute
   - Updated greeting display to use dynamic content
   - Imported utility function from greetingUtils

2. **`src/utils/greetingUtils.ts`** (New File)
   - Created reusable utility functions for time-based greetings
   - Includes both Indonesian and English versions
   - Provides consistent interface with text, icon, and color

3. **`src/utils/greetingUtils.test.ts`** (New File)
   - Comprehensive test suite for greeting functions
   - Tests all time ranges and expected outputs
   - Uses mock Date to test different times of day

### Key Features

- **Automatic Updates**: Greeting updates every minute to ensure accuracy
- **Visual Consistency**: Each greeting has appropriate icon and color
- **Reusable**: Utility functions can be used across the app
- **Tested**: Comprehensive test coverage for all scenarios
- **Performance**: Minimal impact on app performance

### Usage

The greeting automatically appears on the main screen and updates based on the current time. The implementation is transparent to users and provides a more personalized experience.

### Future Enhancements

- Support for different languages
- Customizable greeting messages
- Integration with user preferences
- Localization support for different regions 