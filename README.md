# 🏥 PHC Mobile - Aplikasi Kesehatan Terpadu

Aplikasi mobile untuk manajemen kesehatan personal dengan integrasi klinik dan tracking kesehatan.

## 🎉 Status: Ready to Use!

✅ **Backend**: Running on port 5432  
✅ **Database**: MySQL connected  
✅ **API**: All endpoints working  
✅ **Mobile**: Configured and ready

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Architecture](#-architecture)
3. [Database Schema](#-database-schema)
4. [Features](#-features)
5. [API Endpoints](#-api-endpoints)
6. [Configuration](#-configuration)
7. [Troubleshooting](#-troubleshooting)
8. [Development](#-development)
9. [Mission System](#-mission-system)
10. [Database Integration](#-database-integration)
11. [Debug Cleanup](#-debug-cleanup)

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Expo CLI (`npm install -g @expo/cli`)

### Option 1: Auto Setup (Recommended)

```bash
# Setup backend dan database
./setup-backend.sh

# Jalankan aplikasi (backend + mobile)
./start-app.sh
```

### Option 2: Manual Setup

#### Database Setup

1. **Start MySQL service**

   ```bash
   # On macOS with Homebrew
   brew services start mysql

   # Or manually start MySQL
   mysql.server start
   ```

2. **Create database**

   ```bash
   mysql -u root -p
   CREATE DATABASE phc_mobile;
   ```

3. **Configure environment**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your database credentials
   ```

#### Backend Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Start backend server**

   ```bash
   # Option 1: From root directory (recommended)
   node start-backend.js

   # Option 2: From backend directory
   cd backend
   node start-with-env.js

   # Option 3: Using the shell script
   ./start-backend.sh
   ```

3. **Verify backend is running**
   ```bash
   curl http://localhost:5432/health
   # Should return: {"status":"OK","message":"PHC Mobile API is running",...}
   ```

#### Frontend Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start Expo development server**

   ```bash
   npm start
   # or
   expo start
   ```

3. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

### Test Login

- **Email**: john@example.com
- **Password**: password123

---

## 🏗️ Architecture

```
PHC-Mobile/
├── backend/                 # Node.js + Express + MySQL
│   ├── config/             # Database configuration
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   └── server.js           # Main server file
├── src/                    # React Native app
│   ├── components/         # Reusable components
│   ├── screens/            # App screens
│   ├── services/           # API services
│   └── contexts/           # React contexts
└── assets/                 # Images and icons
```

---

## 🗄️ Database Schema

### Core Tables

- **users** - User profiles and authentication
- **clinics** - Clinic information
- **services** - Medical services offered
- **doctors** - Doctor profiles
- **bookings** - Appointment bookings

### Tracking Tables

- **mood_tracking** - Mood and stress tracking
- **water_tracking** - Water intake tracking
- **sleep_tracking** - Sleep quality tracking
- **meal_logging** - Nutrition tracking
- **health_data** - General health metrics

### Mission Tables

- **missions** - Available missions
- **user_missions** - User's accepted missions and progress

---

## 📱 Features

### 🔐 Authentication

- User registration & login
- JWT token management
- Password reset functionality

### 🏥 Clinic Management

- Browse clinics by location
- View clinic services and doctors
- Book appointments
- Track booking status

### 📊 Health Tracking

- Mood tracking with stress levels
- Water intake monitoring
- Sleep quality tracking
- Meal logging with nutrition info
- Health data visualization

### 🧮 Health Calculators

- BMI calculator
- BMR calculator
- Health risk assessments

### 📚 Education & News

- Health education content
- Latest health news
- Personalized recommendations

### 🎯 Mission System

- Daily, weekly, and monthly missions
- Health tracking missions
- Nutrition and fitness challenges
- Mental health and mindfulness tasks
- Points and rewards system

---

## 🔗 API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/insurance` - Update insurance info

### Clinics

- `GET /api/clinics` - Get all clinics
- `GET /api/clinics/:id` - Get clinic by ID
- `GET /api/clinics/:id/services` - Get services by clinic
- `GET /api/clinics/:id/doctors` - Get doctors by clinic

### Bookings

- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `PATCH /api/bookings/:id/payment` - Update payment status

### Tracking

- `POST /api/tracking/mood` - Create mood entry
- `GET /api/tracking/mood` - Get mood history
- `POST /api/tracking/water` - Create water entry
- `GET /api/tracking/water` - Get water history
- `POST /api/tracking/sleep` - Create sleep entry
- `GET /api/tracking/sleep` - Get sleep history
- `POST /api/tracking/meal` - Create meal entry
- `GET /api/tracking/meal` - Get meal history

### Missions

- `GET /api/missions` - Get all missions
- `GET /api/missions/category/:category` - Get missions by category
- `GET /api/missions/my-missions` - Get user's missions
- `POST /api/missions/accept/:missionId` - Accept mission
- `PUT /api/missions/progress/:userMissionId` - Update mission progress
- `PUT /api/missions/abandon/:userMissionId` - Abandon mission

### Health & Education

- `GET /api/health/data` - Get health data
- `POST /api/health/data` - Create health data
- `GET /api/assessments` - Get health assessments
- `POST /api/assessments` - Create assessment
- `GET /api/education` - Get education content
- `GET /api/news` - Get health news

### Calculators

- `POST /api/calculators/bmi` - Calculate BMI
- `POST /api/calculators/bmr` - Calculate BMR

---

## ⚙️ Configuration

### Backend Environment (.env)

```env
PORT=5432
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=phc_mobile
DB_USER=root
DB_PASSWORD=pr1k1t1w
DB_DIALECT=mysql
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000
```

### Mobile API Configuration

```javascript
// src/services/api.js
const getApiBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:5432/api";
    }
    if (Platform.OS === "ios") {
      return "http://localhost:5432/api";
    }
    return "http://localhost:5432/api";
  }
  return "https://your-production-domain.com/api";
};
```

---

## 🚨 Troubleshooting

### Backend Issues

**Port 5432 already in use:**

```bash
# Find processes using port 5432
lsof -ti:5432

# Kill the processes
kill -9 $(lsof -ti:5432)

# Restart backend
node start-backend.js
```

**Database connection failed:**

```bash
# Check if MySQL is running
mysql -u root -p -e "SELECT 1;"

# If not running, start MySQL
brew services start mysql
```

**"Cannot find module 'start-with-env.js'":**

- Make sure you're in the correct directory
- The file is in `backend/start-with-env.js`, not in the root
- Use `node start-backend.js` from the root directory

### Frontend Issues

**API request failed:**

- Ensure backend is running on port 5432
- Check if the API URL is correct in `src/services/api.js`
- For physical devices, update the IP address in the API configuration

**Expo connection issues:**

```bash
# Clear Expo cache
expo start --clear

# Reset Metro bundler
npx react-native start --reset-cache
```

### Common Issues & Solutions

#### Issue 1: "Server error" when fetching user profile

**Symptoms:**

```
ERROR  API request failed: [Error: Server error]
ERROR  Error fetching user profile: [Error: Server error]
```

**Solutions:**

1. Check if backend server is running
2. Test API endpoints with curl
3. Verify authentication token
4. Check network configuration

#### Issue 2: "User not found" error

**Solutions:**

1. Check JWT token validity
2. Regenerate token if needed
3. Verify user exists in database

#### Issue 3: Database connection errors

**Solutions:**

1. Check database credentials in .env
2. Start MySQL service
3. Verify database exists

### Common Commands

```bash
# Get your IP address
./get-ip.sh

# Reset database
cd backend && npm run db:reset

# Clear mobile cache
npx expo start --clear

# Test API connection
curl http://localhost:5432/health
```

---

## 🛠️ Development

### Adding New Features

1. Create database model in `backend/models/`
2. Add API routes in `backend/routes/`
3. Create mobile service in `src/services/`
4. Add UI components in `src/components/`
5. Create screens in `src/screens/`

### Code Style

- Backend: ESLint with Airbnb config
- Mobile: TypeScript with strict mode
- Database: Sequelize with migrations

### Development Workflow

1. **Start backend first:**

   ```bash
   node start-backend.js
   ```

2. **Start frontend:**

   ```bash
   npm start
   ```

3. **Test API connection:**
   - Backend health: `http://localhost:5432/health`
   - API endpoint: `http://localhost:5432/api/auth/me`

---

## 🎯 Mission System

### Overview

Sistem misi adalah fitur gamifikasi yang memungkinkan user untuk menerima dan menyelesaikan berbagai misi kesehatan untuk mendapatkan poin dan meningkatkan motivasi dalam menjaga kesehatan.

### Mission Categories

- **Health Tracking**: Misi terkait pemantauan kesehatan
- **Nutrition**: Misi terkait nutrisi dan pola makan
- **Fitness**: Misi terkait olahraga dan kebugaran
- **Mental Health**: Misi terkait kesehatan mental
- **Education**: Misi terkait pembelajaran kesehatan
- **Consultation**: Misi terkait konsultasi medis
- **Daily Habits**: Misi kebiasaan harian positif

### Mission Types

- **Daily**: Misi harian yang reset setiap hari
- **Weekly**: Misi mingguan yang reset setiap minggu
- **Monthly**: Misi bulanan yang reset setiap bulan
- **One Time**: Misi sekali selesai

### Difficulty Levels

- **Easy**: Misi mudah (10-20 poin)
- **Medium**: Misi sedang (25-50 poin)
- **Hard**: Misi sulit (100-200 poin)

### Database Schema

```sql
-- Missions table
CREATE TABLE missions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('health_tracking', 'nutrition', 'fitness', 'mental_health', 'education', 'consultation', 'daily_habit') NOT NULL,
  type ENUM('daily', 'weekly', 'monthly', 'one_time') NOT NULL,
  target_value INT NOT NULL,
  unit VARCHAR(50),
  points INT NOT NULL DEFAULT 10,
  icon VARCHAR(100),
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT TRUE,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  requirements JSON,
  start_date DATETIME,
  end_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User missions table
CREATE TABLE user_missions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  mission_id INT NOT NULL,
  status ENUM('active', 'completed', 'failed', 'expired') DEFAULT 'active',
  progress INT DEFAULT 0,
  current_value INT DEFAULT 0,
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_date DATETIME,
  due_date DATETIME,
  points_earned INT,
  streak_count INT DEFAULT 0,
  last_completed_date DATETIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
);
```

---

## 🗄️ Database Integration

### Database Models

1. **User Model** - Authentication, user profiles, health goals
2. **Clinic Model** - Clinic information, location, ratings
3. **Service Model** - Medical services, pricing, duration
4. **Doctor Model** - Doctor profiles, specializations
5. **Booking Model** - Appointments, status, payments
6. **Tracking Models** - Mood, water, sleep, meal tracking
7. **Mission Models** - Available missions and user progress

### Setup Database

```bash
# Install dependencies
cd backend
npm install

# Setup database
npm run setup-db

# Seed data
npm run db:seed
npm run seed:clinics
npm run seed:missions
```

---

## 🧹 Debug Cleanup

### Files Removed

**Frontend Debug Files:**

- `src/utils/debug-api.js` - Debug utility for API testing

**Backend Debug Files:**

- `backend/debug-auth.js` - Authentication debug script
- `backend/test-auth.js` - Authentication test script
- `backend/test-db.js` - Database test script
- `backend/test-api-booking.js` - Booking API test script
- `backend/test-booking.js` - Booking test script
- `backend/test-frontend-connection.js` - Frontend connection test
- `backend/test-profile-edit.js` - Profile edit test script
- `backend/test-connection.sh` - Connection test shell script
- `backend/quick-fix.sh` - Quick fix shell script
- `backend/generate-token.js` - Token generation script

### Code Cleaned Up

- Removed debug UI from PersonalInformationScreen
- Cleaned console.log statements from 9 frontend files
- Removed debug imports and styles
- Kept important logs like error logging and server startup information

### Benefits

1. **Cleaner codebase** - No more debug clutter
2. **Better performance** - Reduced console output
3. **Professional UI** - No debug buttons visible to users
4. **Easier maintenance** - Cleaner, more readable code
5. **Smaller bundle size** - Removed debug utilities

---

## 🚀 Deployment

### Backend Production

1. Set NODE_ENV=production
2. Configure production database
3. Set up SSL certificates
4. Use PM2 for process management

### Mobile Production

1. Build with Expo EAS
2. Configure production API URL
3. Test on physical devices
4. Submit to app stores

---

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

PHC Mobile Development Team

---

**🎯 Ready for development!** Semua sistem sudah terhubung dan siap digunakan.
