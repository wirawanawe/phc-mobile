# 🔧 Development Mode Switch - Resolved Production Server Issues

## 🚨 Problem Identified

The mobile app was still pointing to production server (`dash.doctorphc.id`) which caused:
- **Database errors**: "Table 'meal_foods' doesn't exist"
- **API failures**: Production server doesn't have required tables
- **Poor development experience**: Can't test locally

## 🔍 Root Cause Analysis

### 1. **API Configuration Still Pointing to Production**
```javascript
// Before: Still using production URLs
const getBestApiUrl = async () => {
  if (__DEV__) {
    return 'http://10.242.90.103:3000/api/mobile'; // Wrong IP
  }
  return 'http://localhost:3000/api/mobile'; // Wrong for production
};
```

### 2. **Database Configuration Mixed**
- Some files pointing to `dash.doctorphc.id`
- Others pointing to `localhost`
- Inconsistent configuration across the app

### 3. **Missing Local Database Setup**
- Local database doesn't have required meal tables
- No sample data for testing

## ✅ Solution Applied

### 1. **Fixed API Configuration** (`src/services/api.js`)
```javascript
// After: Force development mode
const getServerURL = () => {
  // Force localhost for development
  console.log('🔧 Development mode: Using localhost server');
  return "localhost";
};

const getBestApiUrl = async () => {
  // Force development mode for now
  console.log('🔧 Development mode: Using local development API');
  return 'http://localhost:3000/api/mobile';
};
```

### 2. **Created Development Switch Script** (`scripts/switch-to-development-mode.js`)
```javascript
// Automated script to switch all configurations
const developmentConfig = {
  apiBaseUrl: 'http://localhost:3000/api/mobile',
  serverUrl: 'localhost',
  dbHost: 'localhost',
  dbPort: 3306
};

// Updates multiple files automatically
const filesToUpdate = [
  '../src/services/api.js',
  '../dash-app/lib/db.js'
];
```

### 3. **Created Local Database Setup** (`scripts/setup-local-meal-tables.js`)
```javascript
// Creates all required tables in local database
async function setupLocalMealTables() {
  // Create meal_tracking table
  // Create meal_foods table  
  // Create food_database table
  // Add foreign key constraints
  // Add performance indexes
  // Add sample food data
}
```

## 🚀 How to Switch to Development Mode

### Step 1: Run Development Switch Script
```bash
# From project root
node scripts/switch-to-development-mode.js
```

### Step 2: Setup Local Database
```bash
# Create meal tables in local database
node scripts/setup-local-meal-tables.js
```

### Step 3: Start Local Server
```bash
# In dash-app directory
cd dash-app
npm run dev
```

### Step 4: Test Mobile App
```bash
# Start mobile app
npx expo start
```

## 📊 Configuration Changes

### Before (Production Mode)
```javascript
// API URLs
apiBaseUrl: 'https://dash.doctorphc.id/api/mobile'
serverUrl: 'dash.doctorphc.id'

// Database
dbHost: 'dash.doctorphc.id'
dbPort: 3306
```

### After (Development Mode)
```javascript
// API URLs  
apiBaseUrl: 'http://localhost:3000/api/mobile'
serverUrl: 'localhost'

// Database
dbHost: 'localhost'
dbPort: 3306
```

## 🗄️ Local Database Schema

### Required Tables Created
1. **meal_tracking** - Main meal entries
2. **meal_foods** - Individual food items in meals
3. **food_database** - Food reference data

### Sample Data Added
- **Nasi Putih** - Indonesian rice
- **Ayam Goreng** - Fried chicken
- **Sayur Bayam** - Spinach vegetables

## 📱 Expected Results

### Before Switch
- ❌ API errors pointing to production
- ❌ Database errors: "Table doesn't exist"
- ❌ Can't test locally
- ❌ Poor development experience

### After Switch
- ✅ API points to localhost:3000
- ✅ Local database with all required tables
- ✅ Sample data for testing
- ✅ Full local development capability
- ✅ No more production server dependencies

## 🧪 Testing

### 1. **Test API Connection**
```bash
curl http://localhost:3000/api/mobile/test-connection
```

### 2. **Test Database Connection**
```bash
# Check if tables exist
mysql -u root -p phc_dashboard -e "SHOW TABLES LIKE 'meal_%';"
```

### 3. **Test Mobile App**
- Start mobile app
- Try login functionality
- Test meal tracking features
- Verify no database errors

## 📝 Monitoring

### Check Configuration
```bash
# Verify API configuration
grep -r "localhost:3000" src/services/api.js

# Verify database configuration  
grep -r "localhost" dash-app/lib/db.js
```

### Check Database Tables
```sql
-- Connect to local database
USE phc_dashboard;

-- Check tables exist
SHOW TABLES LIKE 'meal_%';
SHOW TABLES LIKE 'food_%';

-- Check sample data
SELECT * FROM food_database LIMIT 5;
```

## 🔧 Troubleshooting

### If Local Server Not Accessible
1. **Check if server is running:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Check firewall settings:**
   ```bash
   # Allow localhost connections
   sudo ufw allow 3000
   ```

3. **Check database connection:**
   ```bash
   mysql -u root -p -h localhost
   ```

### If Tables Still Missing
1. **Run setup script again:**
   ```bash
   node scripts/setup-local-meal-tables.js
   ```

2. **Check database permissions:**
   ```sql
   GRANT ALL PRIVILEGES ON phc_dashboard.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

## 🎯 Benefits

### 1. **Full Local Development**
- No dependency on production server
- Faster development cycle
- No network issues

### 2. **Better Testing**
- Controlled test environment
- Sample data for testing
- Easy to reset data

### 3. **Improved Debugging**
- Local logs and errors
- Direct database access
- Faster error resolution

### 4. **Team Collaboration**
- Consistent development environment
- Easy setup for new developers
- No production conflicts
