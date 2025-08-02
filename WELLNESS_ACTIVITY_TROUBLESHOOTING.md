# Wellness Activity System - Troubleshooting Guide

## Common Issues and Solutions

### 1. Foreign Key Constraint Error

**Error Message:**
```
Cannot add or update a child row: a foreign key constraint fails 
(`phc_dashboard`.`user_wellness_activity`, CONSTRAINT `user_wellness_activity_ibfk_1` 
FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE)
```

**Cause:** User ID yang dikirim tidak ada di tabel `users`

**Solutions:**

#### A. Check Available Users
```bash
mysql -u root -ppr1k1t1w phc_dashboard -e "SELECT id, name, email FROM users;"
```

#### B. Update Default User ID in API Service
```javascript
// In src/services/api.js
async getUserId() {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      if (user && user.id) {
        return user.id;
      }
    }
    
    // Use a valid user ID that exists in database
    console.log('Using default user ID for testing');
    return 1; // Super Admin user ID
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 1; // Super Admin user ID
  }
}
```

#### C. Add Test Users
```bash
node scripts/add-test-users.js
```

### 2. User Authentication Issues

**Problem:** Mobile app tidak menyimpan user data setelah login

**Solutions:**

#### A. Check User Data Storage
```javascript
// Debug user data storage
const userData = await AsyncStorage.getItem("userData");
console.log('User data from storage:', userData);
```

#### B. Update Login Response Handling
```javascript
// In login method, ensure user data is stored
async login(email, password) {
  const response = await this.request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (response.success) {
    // Store user data
    await AsyncStorage.setItem("userData", JSON.stringify(response.data.user));
    await this.setAuthToken(response.data.token);
    await this.setRefreshToken(response.data.refreshToken);
  }

  return response;
}
```

### 3. API Endpoint Errors

**Problem:** 500 errors pada wellness activity endpoints

**Solutions:**

#### A. Check Database Tables
```bash
mysql -u root -ppr1k1t1w phc_dashboard -e "SHOW TABLES LIKE 'wellness%';"
mysql -u root -ppr1k1t1w phc_dashboard -e "SHOW TABLES LIKE 'user_wellness%';"
```

#### B. Verify Table Structure
```bash
mysql -u root -ppr1k1t1w phc_dashboard -e "DESCRIBE wellness_activity;"
mysql -u root -ppr1k1t1w phc_dashboard -e "DESCRIBE user_wellness_activity;"
```

#### C. Check Data in Tables
```bash
mysql -u root -ppr1k1t1w phc_dashboard -e "SELECT COUNT(*) FROM wellness_activity;"
mysql -u root -ppr1k1t1w phc_dashboard -e "SELECT COUNT(*) FROM user_wellness_activity;"
```

### 4. Mobile App Navigation Issues

**Problem:** Screen tidak terbuka atau error navigation

**Solutions:**

#### A. Check Navigation Setup
```javascript
// In App.tsx, ensure route is added
<Stack.Screen
  name="WellnessActivityDetail"
  component={WellnessActivityDetailScreen}
  options={{ headerShown: false }}
/>
```

#### B. Verify Import
```javascript
// In App.tsx, ensure import is correct
import WellnessActivityDetailScreen from "./src/screens/WellnessActivityDetailScreen";
```

#### C. Check Navigation Call
```javascript
// In ActivityScreen.tsx
const handleWellnessActivitySelect = (activity: WellnessActivity) => {
  navigation.navigate('WellnessActivityDetail', { activity });
};
```

### 5. Points Calculation Issues

**Problem:** Points tidak dihitung dengan benar

**Solutions:**

#### A. Check Points Calculation Logic
```javascript
// In completion endpoint
const actualDuration = duration_minutes || activity.duration_minutes || 30;
const pointsEarned = Math.round((actualDuration / activity.duration_minutes) * activity.points) || activity.points || 0;
```

#### B. Verify Activity Points
```bash
mysql -u root -ppr1k1t1w phc_dashboard -e "SELECT id, title, points, duration_minutes FROM wellness_activity;"
```

### 6. History Endpoint Issues

**Problem:** History tidak menampilkan data atau error

**Solutions:**

#### A. Check User ID Parameter
```bash
curl -X GET "http://localhost:3000/api/mobile/wellness/activities/history?user_id=1"
```

#### B. Verify Data Exists
```bash
mysql -u root -ppr1k1t1w phc_dashboard -e "SELECT * FROM user_wellness_activity WHERE user_id = 1;"
```

### 7. Testing Commands

#### Test Completion Endpoint
```bash
curl -X POST "http://localhost:3000/api/mobile/wellness/activities/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "activity_id": 1,
    "duration_minutes": 15,
    "notes": "Test completion",
    "completed_at": "2024-08-03T10:00:00Z"
  }'
```

#### Test History Endpoint
```bash
curl -X GET "http://localhost:3000/api/mobile/wellness/activities/history?user_id=1"
```

#### Test Activities Endpoint
```bash
curl -X GET "http://localhost:3000/api/mobile/wellness/activities"
```

### 8. Database Maintenance

#### Reset Tables (if needed)
```bash
mysql -u root -ppr1k1t1w phc_dashboard -e "TRUNCATE TABLE user_wellness_activity;"
```

#### Recreate Tables
```bash
mysql -u root -ppr1k1t1w phc_dashboard < dash-app/init-scripts/wellness-activity-schema.sql
```

### 9. Mobile App Debugging

#### Check API Calls
```javascript
// Add console.log to debug API calls
console.log('API Response:', response);
console.log('User ID:', await api.getUserId());
```

#### Check Navigation
```javascript
// Add console.log to debug navigation
console.log('Navigating to detail screen with activity:', activity);
```

### 10. Common Fixes

1. **Restart Backend Server**
   ```bash
   cd dash-app
   npm run dev
   ```

2. **Clear Mobile App Cache**
   - Restart Expo development server
   - Clear AsyncStorage if needed

3. **Check Database Connection**
   ```bash
   mysql -u root -ppr1k1t1w phc_dashboard -e "SELECT 1;"
   ```

4. **Verify Environment Variables**
   ```bash
   cat dash-app/.env.local
   ```

## Quick Fix Checklist

- [ ] Check if users exist in database
- [ ] Verify wellness_activity table has data
- [ ] Test API endpoints manually
- [ ] Check mobile app navigation setup
- [ ] Verify user authentication flow
- [ ] Test completion and history endpoints
- [ ] Check console logs for errors
- [ ] Restart backend server if needed 