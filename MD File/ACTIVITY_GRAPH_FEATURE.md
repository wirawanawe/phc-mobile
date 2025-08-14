# Activity Graph Feature

## Overview
The Activity Graph feature provides comprehensive visualization of user wellness and activity tracking data over a week. It displays various metrics including steps, water intake, sleep, mood, exercise, and calories in beautiful, interactive charts.

## Features

### 📊 Multiple Chart Types
- **Steps Tracking**: Daily step count visualization
- **Water Intake**: Daily water consumption tracking
- **Sleep Hours**: Sleep duration monitoring
- **Mood Score**: Daily mood assessment (1-10 scale)
- **Exercise Minutes**: Physical activity duration
- **Calories**: Daily caloric intake

### 🎨 Visual Elements
- **Bar Charts**: Clear representation of daily values
- **Line Charts**: Trend visualization over time
- **Gradient Colors**: Each metric has its own color scheme
- **Interactive Selectors**: Easy switching between different metrics
- **Statistics Cards**: Today's value, average, and highest values

### 📱 User Interface
- **Modern Design**: Clean, intuitive interface
- **Responsive Layout**: Adapts to different screen sizes
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful fallback to sample data
- **Authentication**: Requires user login

## Technical Implementation

### File Structure
```
src/screens/ActivityGraphScreen.tsx
```

### Key Components
1. **Chart Selector**: Horizontal scrollable buttons for metric selection
2. **Statistics Panel**: Three cards showing key metrics
3. **Bar Chart**: Visual representation of daily values
4. **Line Chart**: Trend analysis
5. **Insights Section**: Helpful tips and targets

### Data Sources
- **Primary**: API integration with wellness progress data
- **Fallback**: Sample data generation for demonstration
- **Real-time**: Auto-refresh functionality

### API Integration
The screen integrates with the existing wellness API to fetch:
- Water tracking data
- Mood tracking data
- Sleep tracking data
- Fitness tracking data
- Caloric intake data

## Usage

### Navigation
The Activity Graph screen is accessible through:
1. Main app navigation → Wellness App → Graph tab
2. Direct navigation to `ActivityGraphScreen`

### User Flow
1. User logs into the app
2. Navigates to Wellness App
3. Taps the "Graph" tab
4. Views default steps chart
5. Switches between different metrics using the selector
6. Views statistics and insights

### Chart Interaction
- **Tap chart selector**: Switch between different metrics
- **Toggle time range**: Switch between week and month views (future feature)
- **Pull to refresh**: Reload data from API
- **Tap refresh button**: Manual data refresh

## Data Visualization

### Color Schemes
- **Steps**: Green gradient (#10B981 → #059669)
- **Water**: Blue gradient (#3B82F6 → #2563EB)
- **Sleep**: Purple gradient (#8B5CF6 → #7C3AED)
- **Mood**: Orange gradient (#F59E0B → #D97706)
- **Exercise**: Red gradient (#EF4444 → #DC2626)
- **Calories**: Pink gradient (#FF6B8A → #E22345)

### Chart Types
1. **Bar Chart**: Shows daily values with gradient-filled bars
2. **Line Chart**: Displays trends with connected data points
3. **Statistics Cards**: Key metrics in card format

## Future Enhancements

### Planned Features
- **Monthly View**: Extended time range visualization
- **Export Data**: PDF/CSV export functionality
- **Goal Setting**: Custom target setting for each metric
- **Notifications**: Achievement alerts and reminders
- **Social Sharing**: Share progress with friends
- **Advanced Analytics**: Trend analysis and predictions

### Technical Improvements
- **Performance**: Optimize chart rendering for large datasets
- **Offline Support**: Cache data for offline viewing
- **Real-time Updates**: Live data synchronization
- **Customization**: User-defined chart preferences

## Dependencies

### Required Packages
- `react-native-paper`: UI components
- `expo-linear-gradient`: Gradient effects
- `react-native-vector-icons`: Icons
- `@react-navigation/native`: Navigation
- `react-native-safe-area-context`: Safe area handling

### API Dependencies
- `apiService.getWellnessProgress()`: Fetch tracking data
- Authentication context for user data

## Testing

### Test Scenarios
1. **Authentication**: Verify login requirement
2. **Data Loading**: Test API integration and fallback
3. **Chart Switching**: Verify metric selector functionality
4. **Responsive Design**: Test on different screen sizes
5. **Error Handling**: Test network failure scenarios

### Sample Data
The screen includes sample data generation for testing:
- Steps: 2,000-10,000 per day
- Water: 500-2,000 ml per day
- Sleep: 6-9 hours per day
- Mood: 6-10 score per day
- Exercise: 15-75 minutes per day
- Calories: 1,200-2,000 kcal per day

## Integration Notes

### Wellness App Integration
The ActivityGraphScreen is integrated into the WellnessApp as the "Graph" tab, replacing the previous DoctorTab component.

### Navigation Updates
- Updated tab navigation in WellnessApp.tsx
- Changed tab icon to chart-bar for better representation
- Maintained existing navigation structure

### API Compatibility
The screen is designed to work with the existing wellness API structure and gracefully handles missing or incomplete data.

## Support

For technical support or feature requests related to the Activity Graph feature, please refer to the main project documentation or contact the development team.
