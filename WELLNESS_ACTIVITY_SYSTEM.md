# Wellness Activity System

## Overview

The wellness activity system has been updated to use a proper database schema with separate tables for master data and user data:

- **`wellness_activity`**: Master table containing morning activities and wellness exercises
- **`user_wellness_activity`**: User-specific wellness activity completion data

## Database Schema

### wellness_activity (Master Table)
```sql
CREATE TABLE wellness_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    duration_minutes INT DEFAULT 30,
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    points INT DEFAULT 10,
    calories_burn INT DEFAULT 0,
    instructions TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### user_wellness_activity (User Data Table)
```sql
CREATE TABLE user_wellness_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_id INT NOT NULL,
    duration_minutes INT,
    notes TEXT,
    points_earned INT DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES wellness_activity(id) ON DELETE CASCADE
);
```

## API Endpoints

### 1. Get Wellness Activities
```
GET /api/mobile/wellness/activities
```
Returns list of available wellness activities from the master table.

**Query Parameters:**
- `category`: Filter by activity category
- `difficulty`: Filter by difficulty level
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

### 2. Complete Wellness Activity
```
POST /api/mobile/wellness/activities/complete
```
Records a user's completion of a wellness activity.

**Request Body:**
```json
{
  "user_id": 123,
  "activity_id": 1,
  "duration_minutes": 30,
  "notes": "Optional notes",
  "completed_at": "2024-01-15T10:30:00Z"
}
```

### 3. Get User Activity History
```
GET /api/mobile/wellness/activities/history
```
Returns user's wellness activity completion history.

**Query Parameters:**
- `user_id`: User ID (required)
- `period`: Number of days to look back (default: 7)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

## Mobile App Features

### ActivityScreen Updates

The ActivityScreen has been enhanced with:

1. **Tab Navigation**: Switch between "Activities" and "History" tabs
2. **Activity List**: Browse available wellness activities
3. **Activity Details**: View selected activity information
4. **Completion Form**: Enter duration and optional notes
5. **History View**: View completed activities with details
6. **Points System**: Earn points based on activity duration

### Key Features

- **Morning Activities**: Focus on wellness activities suitable for morning routines
- **Points Calculation**: Points earned based on actual duration vs. recommended duration
- **Activity History**: Track all completed activities with timestamps
- **Notes Support**: Add personal notes to each activity completion
- **Category Filtering**: Filter activities by category (meditation, yoga, cardio, etc.)
- **Difficulty Levels**: Activities categorized by difficulty (beginner, intermediate, advanced)

## Setup Instructions

### 1. Database Setup
Run the setup script to create the new tables:

```bash
node scripts/setup-wellness-activity-tables.js
```

### 2. Backend API
The API endpoints have been updated to use the new table structure:

- `dash-app/app/api/mobile/wellness/activities/route.js` - Get activities
- `dash-app/app/api/mobile/wellness/activities/complete/route.js` - Complete activity
- `dash-app/app/api/mobile/wellness/activities/history/route.js` - Get history

### 3. Mobile App
The mobile app has been updated with:

- Updated API service methods
- Enhanced ActivityScreen with tab navigation
- History view for completed activities
- Improved UI with better activity cards

## Sample Activities

The system includes 10 sample morning wellness activities:

1. **Morning Meditation** (15 min, 15 points)
2. **Sun Salutation Yoga** (20 min, 20 points)
3. **Morning Walk** (30 min, 25 points)
4. **Breathing Exercise** (10 min, 10 points)
5. **Morning Stretching** (15 min, 15 points)
6. **Mindfulness Practice** (20 min, 20 points)
7. **Light Cardio** (25 min, 30 points)
8. **Strength Training** (45 min, 40 points)
9. **Flexibility Flow** (20 min, 20 points)
10. **Relaxation Session** (20 min, 15 points)

## Points System

Points are calculated based on the ratio of actual duration to recommended duration:

```
points_earned = (actual_duration / recommended_duration) * base_points
```

This encourages users to complete the full recommended duration while allowing flexibility.

## Data Flow

1. **Admin/System**: Creates wellness activities in `wellness_activity` table
2. **User**: Browses available activities in mobile app
3. **User**: Selects and completes an activity
4. **System**: Records completion in `user_wellness_activity` table
5. **User**: Views completion history and progress

## Benefits

- **Separation of Concerns**: Master data separate from user data
- **Scalability**: Easy to add new activities without affecting user data
- **Analytics**: Rich data for tracking user engagement and progress
- **Flexibility**: Support for notes, custom durations, and points calculation
- **User Experience**: Clean interface with activity history and progress tracking 