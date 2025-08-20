# API Endpoints untuk Testing di Postman

## Base URL
```
http://localhost:3000/api
```

## Authentication
Sebelum menggunakan API, Anda perlu login terlebih dahulu untuk mendapatkan token.

### Login untuk mendapatkan token:
```
POST http://localhost:3000/api/mobile/auth/login
Content-Type: application/json

{
  "email": "test@mobile.com",
  "password": "password123"
}
```

### Setelah login, tambahkan header Authorization:
```
Authorization: Bearer <your_access_token>
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### POST Endpoints
- `POST /api/mobile/auth/login` - Login user mobile
- `POST /api/mobile/auth/register` - Register user mobile
- `POST /api/mobile/auth/refresh` - Refresh access token
- `POST /api/mobile/auth/google` - Login dengan Google
- `POST /api/mobile/auth/test-token` - Test token validity
- `POST /api/auth/login` - Login dashboard
- `POST /api/auth/register` - Register dashboard
- `POST /api/auth/logout` - Logout

### GET Endpoints
- `GET /api/mobile/auth/me` - Get current user profile
- `GET /api/mobile/auth/test-user` - Test user data
- `GET /api/mobile/auth/check-secret` - Check JWT secret
- `GET /api/auth/me` - Get current user (dashboard)

### PUT Endpoints
- `PUT /api/mobile/auth/profile` - Update user profile

---

## 👤 USER MANAGEMENT ENDPOINTS

### GET Endpoints
- `GET /api/mobile/users` - Get all mobile users
- `GET /api/mobile/users/[id]` - Get user by ID
- `GET /api/mobile/users/stats` - Get user statistics
- `GET /api/users` - Get all dashboard users
- `GET /api/users/[id]` - Get dashboard user by ID

### POST Endpoints
- `POST /api/mobile/users` - Create new mobile user
- `POST /api/users` - Create new dashboard user

### PUT Endpoints
- `PUT /api/mobile/users/update-weight` - Update user weight

### DELETE Endpoints
- `DELETE /api/users/[id]` - Delete dashboard user

---

## 🏥 CLINIC & DOCTOR ENDPOINTS

### GET Endpoints
- `GET /api/mobile/clinics` - Get all clinics
- `GET /api/mobile/clinics/consultation/doctors` - Get consultation doctors
- `GET /api/clinics` - Get all clinics (dashboard)
- `GET /api/clinics/[id]` - Get clinic by ID
- `GET /api/clinics/search-by-polyclinic` - Search clinics by polyclinic
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/[id]` - Get doctor by ID
- `GET /api/doctors/by-polyclinic` - Get doctors by polyclinic

### POST Endpoints
- `POST /api/mobile/clinics` - Create new clinic
- `POST /api/clinics` - Create new clinic (dashboard)
- `POST /api/doctors` - Create new doctor

### PUT Endpoints
- `PUT /api/clinics/[id]` - Update clinic
- `PUT /api/doctors/[id]` - Update doctor

### DELETE Endpoints
- `DELETE /api/clinics/[id]` - Delete clinic
- `DELETE /api/doctors/[id]` - Delete doctor

---

## 📋 PATIENT & VISIT ENDPOINTS

### GET Endpoints
- `GET /api/mobile/visits` - Get mobile visits
- `GET /api/visits` - Get all visits (dashboard)
- `GET /api/visits/[id]` - Get visit by ID
- `GET /api/patients/[id]/visits` - Get patient visits
- `GET /api/patients/visits` - Get all patient visits

### POST Endpoints
- `POST /api/mobile/visits` - Create new visit
- `POST /api/visits` - Create new visit (dashboard)

### PUT Endpoints
- `PUT /api/visits/[id]` - Update visit

### DELETE Endpoints
- `DELETE /api/visits/[id]` - Delete visit

---

## 💊 MEDICINE & EXAMINATION ENDPOINTS

### GET Endpoints
- `GET /api/medicine` - Get all medicines
- `GET /api/medicine/[id]` - Get medicine by ID
- `GET /api/examinations` - Get all examinations
- `GET /api/examinations/[id]` - Get examination by ID

### POST Endpoints
- `POST /api/medicine` - Create new medicine
- `POST /api/examinations` - Create new examination

### PUT Endpoints
- `PUT /api/medicine/[id]` - Update medicine
- `PUT /api/examinations/[id]` - Update examination

### DELETE Endpoints
- `DELETE /api/medicine/[id]` - Delete medicine
- `DELETE /api/examinations/[id]` - Delete examination

---

## 🎯 MISSION & ACTIVITY ENDPOINTS

### GET Endpoints
- `GET /api/mobile/missions/[id]` - Get mission by ID
- `GET /api/mobile/missions/my-missions` - Get user missions
- `GET /api/mobile/missions/stats` - Get mission statistics
- `GET /api/mobile/missions/category/[category]` - Get missions by category
- `GET /api/mobile/user_missions/[id]` - Get user mission by ID
- `GET /api/mobile/activities-api/[id]` - Get activity by ID
- `GET /api/mobile/wellness/activities/[id]` - Get wellness activity by ID

### POST Endpoints
- `POST /api/mobile/missions/accept/[missionId]` - Accept mission
- `POST /api/mobile/missions/reset` - Reset missions
- `POST /api/mobile/missions/update-colors` - Update mission colors

### PUT Endpoints
- `PUT /api/mobile/missions/[id]` - Update mission
- `PUT /api/mobile/missions/abandon/[userMissionId]` - Abandon mission
- `PUT /api/mobile/missions/reactivate/[userMissionId]` - Reactivate mission
- `PUT /api/mobile/missions/progress/[userMissionId]` - Update mission progress
- `PUT /api/mobile/user_missions/[id]` - Update user mission
- `PUT /api/mobile/activities-api/[id]` - Update activity

### DELETE Endpoints
- `DELETE /api/mobile/missions/[id]` - Delete mission
- `DELETE /api/mobile/user_missions/[id]` - Delete user mission
- `DELETE /api/mobile/activities-api/[id]` - Delete activity

---

## 📊 HEALTH & WELLNESS ENDPOINTS

### GET Endpoints
- `GET /api/mobile/health` - Get health status
- `GET /api/mobile/health/data` - Get health data
- `GET /api/mobile/health_data` - Get all health data
- `GET /api/mobile/health_data/[id]` - Get health data by ID
- `GET /api/mobile/wellness-progress` - Get wellness progress
- `GET /api/mobile/wellness-progress/[id]` - Get wellness progress by ID
- `GET /api/mobile/wellness/stats` - Get wellness statistics
- `GET /api/mobile/sleep_tracking` - Get sleep tracking data
- `GET /api/mobile/sleep_tracking/[id]` - Get sleep tracking by ID
- `GET /api/mobile/mood_tracking` - Get mood tracking data
- `GET /api/mobile/mood_tracking/today` - Get today's mood
- `GET /api/mobile/food` - Get food tracking data
- `GET /api/mobile/water-settings` - Get water settings

### POST Endpoints
- `POST /api/mobile/health/data` - Create health data
- `POST /api/mobile/health_data` - Create health data entry
- `POST /api/mobile/sleep_tracking` - Create sleep tracking
- `POST /api/mobile/mood_tracking` - Create mood tracking
- `POST /api/mobile/food` - Create food tracking
- `POST /api/mobile/water-settings` - Create water settings

### PUT Endpoints
- `PUT /api/mobile/health_data/[id]` - Update health data
- `PUT /api/mobile/sleep_tracking/[id]` - Update sleep tracking
- `PUT /api/mobile/mood_tracking/[id]` - Update mood tracking
- `PUT /api/mobile/water-settings` - Update water settings

### DELETE Endpoints
- `DELETE /api/mobile/health_data/[id]` - Delete health data
- `DELETE /api/mobile/sleep_tracking/[id]` - Delete sleep tracking
- `DELETE /api/mobile/mood_tracking/[id]` - Delete mood tracking

---

## 📅 BOOKING & CONSULTATION ENDPOINTS

### GET Endpoints
- `GET /api/mobile/bookings` - Get all bookings
- `GET /api/mobile/bookings/my-bookings` - Get user bookings

### POST Endpoints
- `POST /api/mobile/bookings` - Create new booking
- `POST /api/mobile/bookings/my-bookings` - Create user booking

---

## 💬 CHAT ENDPOINTS

### GET Endpoints
- `GET /api/chat/[id]` - Get chat by ID

### POST Endpoints
- `POST /api/chat/[id]` - Send message in chat

### PUT Endpoints
- `PUT /api/chat/[id]` - Update chat

---

## 🔧 APP & SYSTEM ENDPOINTS

### GET Endpoints
- `GET /api/mobile/app/config` - Get app configuration
- `GET /api/mobile/app/version` - Get app version
- `GET /api/mobile/app/status` - Get app status
- `GET /api/mobile/app/analytics` - Get app analytics
- `GET /api/mobile/app/quick-actions` - Get quick actions
- `GET /api/mobile/app/cache` - Get cache data
- `GET /api/mobile/app/backup` - Get backup data
- `GET /api/mobile/app/export` - Get export data
- `GET /api/mobile/app/import` - Get import data
- `GET /api/mobile/app/sync` - Get sync data
- `GET /api/mobile/settings` - Get app settings
- `GET /api/mobile/about` - Get app information
- `GET /api/mobile/help` - Get help information
- `GET /api/mobile/help/contact` - Get contact information
- `GET /api/mobile/education` - Get education content
- `GET /api/mobile/feedback` - Get feedback
- `GET /api/mobile/notifications` - Get notifications
- `GET /api/mobile/news` - Get news
- `GET /api/mobile/calculators` - Get calculators
- `GET /api/mobile/fitness` - Get fitness data
- `GET /api/mobile/test-connection` - Test connection
- `GET /api/health` - Health check

### POST Endpoints
- `POST /api/mobile/app/cache` - Update cache
- `POST /api/mobile/app/backup` - Create backup
- `POST /api/mobile/app/export` - Export data
- `POST /api/mobile/app/import` - Import data
- `POST /api/mobile/app/sync` - Sync data
- `POST /api/mobile/settings` - Update settings
- `POST /api/mobile/feedback` - Submit feedback
- `POST /api/mobile/notifications/mark-all-read` - Mark all notifications as read
- `POST /api/mobile/test-connection` - Test connection
- `POST /api/clear-rate-limit` - Clear rate limit

### DELETE Endpoints
- `DELETE /api/mobile/app/cache` - Clear cache

---

## 🏢 MASTER DATA ENDPOINTS

### GET Endpoints
- `GET /api/master/companies` - Get all companies
- `GET /api/master/companies/[id]` - Get company by ID
- `GET /api/master/polyclinics` - Get all polyclinics
- `GET /api/master/polyclinics/[id]` - Get polyclinic by ID
- `GET /api/master/insurance` - Get all insurance
- `GET /api/master/insurance/[id]` - Get insurance by ID
- `GET /api/master/treatments` - Get all treatments
- `GET /api/master/treatments/[id]` - Get treatment by ID
- `GET /api/regions/provinces` - Get provinces
- `GET /api/regions/cities` - Get cities
- `GET /api/regions/districts` - Get districts
- `GET /api/regions/villages` - Get villages
- `GET /api/postal-codes` - Get postal codes

### POST Endpoints
- `POST /api/master/companies` - Create new company
- `POST /api/master/polyclinics` - Create new polyclinic
- `POST /api/master/insurance` - Create new insurance
- `POST /api/master/treatments` - Create new treatment

### PUT Endpoints
- `PUT /api/master/companies/[id]` - Update company
- `PUT /api/master/polyclinics/[id]` - Update polyclinic
- `PUT /api/master/insurance/[id]` - Update insurance
- `PUT /api/master/treatments/[id]` - Update treatment

### DELETE Endpoints
- `DELETE /api/master/companies/[id]` - Delete company
- `DELETE /api/master/polyclinics/[id]` - Delete polyclinic
- `DELETE /api/master/insurance/[id]` - Delete insurance
- `DELETE /api/master/treatments/[id]` - Delete treatment

---

## ⚙️ SETTINGS ENDPOINTS

### GET Endpoints
- `GET /api/settings/companies` - Get settings companies
- `GET /api/settings/companies/[id]` - Get settings company by ID
- `GET /api/settings/polyclinics` - Get settings polyclinics
- `GET /api/settings/polyclinics/[id]` - Get settings polyclinic by ID
- `GET /api/settings/insurance` - Get settings insurance
- `GET /api/settings/insurance/[id]` - Get settings insurance by ID
- `GET /api/settings/treatments` - Get settings treatments
- `GET /api/settings/treatments/[id]` - Get settings treatment by ID
- `GET /api/settings/icd` - Get ICD codes
- `GET /api/settings/icd/[id]` - Get ICD code by ID
- `GET /api/settings/users` - Get settings users
- `GET /api/settings/doctors` - Get settings doctors
- `GET /api/settings/clinics` - Get settings clinics

### POST Endpoints
- `POST /api/settings/companies` - Create settings company
- `POST /api/settings/polyclinics` - Create settings polyclinic
- `POST /api/settings/insurance` - Create settings insurance
- `POST /api/settings/treatments` - Create settings treatment
- `POST /api/settings/icd` - Create ICD code

### PUT Endpoints
- `PUT /api/settings/companies/[id]` - Update settings company
- `PUT /api/settings/polyclinics/[id]` - Update settings polyclinic
- `PUT /api/settings/insurance/[id]` - Update settings insurance
- `PUT /api/settings/treatments/[id]` - Update settings treatment
- `PUT /api/settings/icd/[id]` - Update ICD code

### DELETE Endpoints
- `DELETE /api/settings/companies/[id]` - Delete settings company
- `DELETE /api/settings/polyclinics/[id]` - Delete settings polyclinic
- `DELETE /api/settings/insurance/[id]` - Delete settings insurance
- `DELETE /api/settings/treatments/[id]` - Delete settings treatment
- `DELETE /api/settings/icd/[id]` - Delete ICD code

---

## 📊 DASHBOARD ENDPOINTS

### GET Endpoints
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/rooms` - Get dashboard rooms
- `GET /api/dashboard/wellness-activities` - Get wellness activities

---

## 🧪 LABORATORY ENDPOINTS

### GET Endpoints
- `GET /api/laboratory/results` - Get laboratory results

### POST Endpoints
- `POST /api/laboratory/results` - Create laboratory result

---

## 📝 PROFILE ENDPOINTS

### PUT Endpoints
- `PUT /api/profile/update` - Update profile

---

## 🔍 TEST ENDPOINTS

### GET Endpoints
- `GET /api/mobile/test-db` - Test database connection
- `GET /api/mobile/test-tables` - Test database tables
- `GET /api/mobile/test-wellness` - Test wellness features
- `GET /api/test-users` - Test users
- `GET /api/test-db` - Test database

### POST Endpoints
- `POST /api/mobile/test` - Test mobile API
- `POST /api/mobile/setup-wellness` - Setup wellness features

### PUT Endpoints
- `PUT /api/mobile/setup-wellness` - Update wellness setup

---

## 📋 Contoh Request Body untuk POST/PUT

### Login
```json
{
  "email": "test@mobile.com",
  "password": "password123"
}
```

### Register
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "081234567890"
}
```

### Create Health Data
```json
{
  "data_type": "weight",
  "value": 70.5,
  "unit": "kg",
  "date": "2024-01-15"
}
```

### Create Mission
```json
{
  "title": "Daily Walk",
  "description": "Walk 10,000 steps today",
  "category": "fitness",
  "points": 100
}
```

---

## 🔧 Tips untuk Testing di Postman

1. **Setup Environment Variables:**
   - `base_url`: `http://localhost:3000/api`
   - `token`: Setelah login, simpan token di sini

2. **Headers yang diperlukan:**
   ```
   Content-Type: application/json
   Authorization: Bearer {{token}}
   ```

3. **Pre-request Script untuk auto-login:**
   ```javascript
   if (!pm.environment.get("token")) {
       pm.sendRequest({
           url: pm.environment.get("base_url") + "/mobile/auth/login",
           method: "POST",
           header: {
               "Content-Type": "application/json"
           },
           body: {
               mode: "raw",
               raw: JSON.stringify({
                   email: "test@mobile.com",
                   password: "password123"
               })
           }
       }, function (err, response) {
           if (response.code === 200) {
               const data = response.json();
               pm.environment.set("token", data.data.accessToken);
           }
       });
   }
   ```

4. **Test Script untuk validasi response:**
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   
   pm.test("Response has success property", function () {
       const response = pm.response.json();
       pm.expect(response).to.have.property('success');
   });
   ```

---

## 🚀 Cara Menjalankan Server

1. Masuk ke direktori `dash-app`:
   ```bash
   cd dash-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables di file `.env`:
   ```
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   JWT_SECRET=your_jwt_secret
   ```

4. Jalankan server:
   ```bash
   npm run dev
   ```

5. Server akan berjalan di `http://localhost:3000`

---

## 📝 Catatan Penting

- Semua endpoint mobile menggunakan prefix `/api/mobile/`
- Endpoint dashboard menggunakan prefix `/api/` (tanpa mobile)
- Pastikan database sudah ter-setup dengan benar
- Gunakan token yang valid untuk endpoint yang memerlukan authentication
- Beberapa endpoint mungkin memerlukan role/permission tertentu
- Test connection endpoint bisa digunakan untuk memastikan server berjalan dengan baik
