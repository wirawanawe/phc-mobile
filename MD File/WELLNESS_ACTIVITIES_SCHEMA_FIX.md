# Wellness Activities Database Schema Fix

## Issue Description

The mobile app is experiencing database errors when trying to fetch wellness activities. The error occurs because there's a mismatch between the frontend expectations and the backend database schema.

### Error Details
```
Database query error: Error: Unknown column 'name' in 'field list'
```

### Root Cause
The SQL query in the backend is trying to select a `name` column from the `wellness_activities` table, but:
1. The database table doesn't have a `name` column
2. The frontend expects a `title` column instead of `name`
3. The table schema is missing several required columns

## Frontend Expectations

Based on the TypeScript interfaces and frontend components, the wellness activities should have these fields:

```typescript
interface WellnessActivity {
  id: string;
  title: string;           // NOT 'name'
  description: string;
  category: string;
  duration: number;
  participants: number;
  maxParticipants: number;
  date: Date;
  location: string;
  points: number;
}
```

## Database Schema Requirements

The `wellness_activities` table should have these columns:

```sql
CREATE TABLE wellness_activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,           -- Main activity name
  description TEXT,                      -- Activity description
  category VARCHAR(100),                 -- Activity category (yoga, fitness, etc.)
  duration_minutes INT DEFAULT 0,        -- Duration in minutes
  calories_burn INT DEFAULT 0,           -- Calories burned
  difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  instructions TEXT,                     -- How to perform the activity
  image_url VARCHAR(500),               -- Activity image
  is_active BOOLEAN DEFAULT TRUE,       -- Whether activity is available
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Solution

### Option 1: Run the Migration Script (Recommended)

1. **Navigate to the dash-app directory**:
   ```bash
   cd ../dash-app
   ```

2. **Copy the migration script** to the dash-app directory:
   ```bash
   cp ../phc-mobile/scripts/fix-wellness-activities-schema.js scripts/
   ```

3. **Install mysql2 if not already installed**:
   ```bash
   npm install mysql2
   ```

4. **Update the database configuration** in the script:
   ```javascript
   const dbConfig = {
     host: 'localhost',
     user: 'your_db_user',
     password: 'your_db_password',
     database: 'your_database_name',
     port: 3306
   };
   ```

5. **Run the migration script**:
   ```bash
   node scripts/fix-wellness-activities-schema.js
   ```

### Option 2: Manual Database Fix

If you prefer to fix the database manually:

1. **Connect to your MySQL database**

2. **Check current table structure**:
   ```sql
   DESCRIBE wellness_activities;
   ```

3. **If the table doesn't exist, create it**:
   ```sql
   CREATE TABLE wellness_activities (
     id INT PRIMARY KEY AUTO_INCREMENT,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     category VARCHAR(100),
     duration_minutes INT DEFAULT 0,
     calories_burn INT DEFAULT 0,
     difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
     instructions TEXT,
     image_url VARCHAR(500),
     is_active BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

4. **If the table exists but has wrong column names**:
   ```sql
   -- Rename 'name' column to 'title' if it exists
   ALTER TABLE wellness_activities 
   CHANGE COLUMN name title VARCHAR(255) NOT NULL;
   
   -- Add missing columns
   ALTER TABLE wellness_activities ADD COLUMN description TEXT;
   ALTER TABLE wellness_activities ADD COLUMN category VARCHAR(100);
   ALTER TABLE wellness_activities ADD COLUMN duration_minutes INT DEFAULT 0;
   ALTER TABLE wellness_activities ADD COLUMN calories_burn INT DEFAULT 0;
   ALTER TABLE wellness_activities ADD COLUMN difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy';
   ALTER TABLE wellness_activities ADD COLUMN instructions TEXT;
   ALTER TABLE wellness_activities ADD COLUMN image_url VARCHAR(500);
   ALTER TABLE wellness_activities ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
   ```

5. **Insert sample data**:
   ```sql
   INSERT INTO wellness_activities (title, description, category, duration_minutes, calories_burn, difficulty_level, instructions) VALUES
   ('Morning Yoga Session', 'Start your day with gentle yoga and meditation', 'yoga', 30, 120, 'easy', 'Find a quiet space and follow the guided session'),
   ('Lunch Break Walking Group', 'Join colleagues for a refreshing walk during lunch', 'fitness', 20, 80, 'easy', 'Meet at the main entrance for a group walk'),
   ('Healthy Cooking Workshop', 'Learn to prepare nutritious meals for busy professionals', 'nutrition', 60, 150, 'medium', 'Bring your own ingredients and learn healthy cooking techniques'),
   ('Stress Management Seminar', 'Learn effective techniques to manage workplace stress', 'mental', 45, 100, 'medium', 'Interactive seminar with practical exercises'),
   ('Team Building Exercise', 'Fun team activities to build camaraderie and wellness', 'social', 90, 200, 'easy', 'Group activities to improve team dynamics'),
   ('Evening Meditation Circle', 'Unwind with guided meditation and mindfulness', 'yoga', 25, 80, 'easy', 'Quiet meditation session to end your day');
   ```

## Backend API Route Fix

The backend API route at `/api/mobile/wellness/[id]/route.js` should be updated to use the correct column names:

```javascript
// Before (causing error)
const query = `
  SELECT 
    id, name, description, category, duration_minutes, 
    calories_burn, difficulty_level, instructions, 
    image_url, is_active, created_at, updated_at
  FROM wellness_activities 
  WHERE id = ?
`;

// After (correct)
const query = `
  SELECT 
    id, title, description, category, duration_minutes, 
    calories_burn, difficulty_level, instructions, 
    image_url, is_active, created_at, updated_at
  FROM wellness_activities 
  WHERE id = ?
`;
```

## Testing

After applying the fix:

1. **Restart the dash-app server**:
   ```bash
   npm run dev
   ```

2. **Test the API endpoint**:
   ```bash
   curl http://localhost:3000/api/mobile/wellness/1
   ```

3. **Test from the mobile app**:
   - Open the mobile app
   - Navigate to Wellness section
   - Verify that wellness activities load without errors

## Verification

The fix is successful when:
- ✅ No more "Unknown column 'name'" errors
- ✅ Wellness activities load properly in the mobile app
- ✅ API endpoints return correct data structure
- ✅ Frontend displays wellness activities correctly

## Related Files

- `scripts/fix-wellness-activities-schema.js` - Migration script
- `src/services/api.js` - Mobile app API service
- `src/types/index.ts` - TypeScript interfaces
- `src/screens/WellnessScreen.tsx` - Wellness screen component
- `src/screens/WellnessApp.tsx` - Main wellness app component 