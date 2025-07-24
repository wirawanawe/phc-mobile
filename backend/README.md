# PHC Mobile Backend API

Backend API untuk aplikasi PHC Mobile yang menyediakan layanan kesehatan digital dengan fitur-fitur komprehensif.

## 🚀 Fitur Utama

- **Authentication & Authorization** - Sistem login/register dengan JWT
- **User Management** - Manajemen profil pengguna dan data kesehatan
- **Health Data Tracking** - Pencatatan dan analisis data kesehatan
- **Assessments** - Kuesioner dan penilaian kesehatan
- **Education** - Konten edukasi kesehatan yang dipersonalisasi
- **Fitness Tracking** - Pelacakan aktivitas fisik dan workout
- **Wellness Activities** - Aktivitas mindfulness dan wellness
- **Health News** - Berita dan artikel kesehatan terkini
- **Health Calculators** - Kalkulator kesehatan (BMI, BMR, dll)
- **Consultations** - Booking konsultasi dengan tenaga kesehatan

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM untuk MySQL
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger
- **compression** - Response compression
- **express-rate-limit** - Rate limiting

## 📋 Prerequisites

- Node.js (v14 atau lebih baru)
- MySQL (v8.0 atau lebih baru)
- npm atau yarn

## 🔧 Installation

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd PHC-Mobile/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp env.example .env
   ```

   Edit file `.env` dengan konfigurasi yang sesuai:

   ```env
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=phc_mobile
   DB_USER=root
   DB_PASSWORD=your_password
   DB_DIALECT=mysql
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   CORS_ORIGIN=http://localhost:3000
   API_VERSION=v1
   ```

4. **Setup MySQL Database**

   ```bash
   # Buat database
   mysql -u root -p
   CREATE DATABASE phc_mobile;
   USE phc_mobile;
   EXIT;
   ```

5. **Run the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`

Register user baru

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/login`

Login user

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/forgot-password`

Reset password

```json
{
  "email": "john@example.com"
}
```

### User Management Endpoints

#### GET `/api/users/profile`

Get profil user (memerlukan authentication)

#### PUT `/api/users/profile`

Update profil user

```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "height": 175,
  "weight": 70
}
```

#### GET `/api/users/health-data`

Get data kesehatan user

#### POST `/api/users/health-data`

Tambah data kesehatan

```json
{
  "vitals": {
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "heartRate": 72,
    "temperature": 36.8
  },
  "measurements": {
    "weight": 70,
    "height": 175,
    "bmi": 22.9
  }
}
```

### Health Data Endpoints

#### GET `/api/health/data`

Get data kesehatan dengan filtering

#### POST `/api/health/data`

Tambah entry data kesehatan

#### GET `/api/health/analytics`

Get analisis data kesehatan

### Assessment Endpoints

#### GET `/api/assessments`

Get daftar assessment

#### POST `/api/assessments`

Buat assessment baru

#### GET `/api/assessments/templates`

Get template assessment

#### POST `/api/assessments/from-template`

Buat assessment dari template

### Education Endpoints

#### GET `/api/education`

Get konten edukasi

#### GET `/api/education/:id`

Get detail konten edukasi

#### POST `/api/education/:id/progress`

Track progress pembelajaran

#### GET `/api/education/recommended`

Get rekomendasi konten

### Fitness Endpoints

#### GET `/api/fitness/workouts`

Get template workout

#### POST `/api/fitness/workouts/complete`

Complete workout

#### GET `/api/fitness/challenges`

Get fitness challenges

#### GET `/api/fitness/stats`

Get statistik fitness

### Wellness Endpoints

#### GET `/api/wellness/activities`

Get aktivitas wellness

#### POST `/api/wellness/activities/complete`

Complete aktivitas wellness

#### GET `/api/wellness/mood-tracker`

Get data mood tracking

#### POST `/api/wellness/mood-tracker`

Log mood entry

### News Endpoints

#### GET `/api/news`

Get berita kesehatan

#### GET `/api/news/:id`

Get detail berita

#### POST `/api/news/:id/like`

Like/unlike berita

#### GET `/api/news/trending`

Get berita trending

### Calculator Endpoints

#### GET `/api/calculators`

Get kalkulator kesehatan

#### POST `/api/calculators/:id/calculate`

Hitung metrik kesehatan

#### GET `/api/calculators/history`

Get riwayat kalkulasi

### Consultation Endpoints

#### GET `/api/consultations/types`

Get tipe konsultasi

#### GET `/api/consultations/providers`

Get daftar provider

#### POST `/api/consultations/book`

Book konsultasi

#### GET `/api/consultations/bookings`

Get riwayat booking

## 🔐 Authentication

API menggunakan JWT (JSON Web Tokens) untuk authentication. Setelah login berhasil, client harus menyertakan token dalam header:

```
Authorization: Bearer <jwt_token>
```

## 📊 Database Schema

### User Model

- Basic info (name, email, password)
- Health profile (age, gender, height, weight)
- Health goals dan preferences
- Activity level dan medical history
- Points dan achievements

### Health Data Model

- Vital signs (blood pressure, heart rate, temperature)
- Measurements (weight, height, BMI)
- Sleep data
- Activity data
- Custom metrics

### Assessment Model

- Assessment type dan questions
- User responses
- Results dan insights
- Completion status

## 🚀 Deployment

### Environment Variables untuk Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/phc_mobile
JWT_SECRET=very_secure_jwt_secret_key
JWT_EXPIRE=30d
CORS_ORIGIN=https://your-frontend-domain.com
API_VERSION=v1
```

### Docker Deployment

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm run start        # Start production server

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Untuk bantuan dan dukungan:

- Email: support@phcmobile.com
- Documentation: [API Docs](https://docs.phcmobile.com)
- Issues: [GitHub Issues](https://github.com/phcmobile/backend/issues)

## 🔄 Changelog

### v1.0.0 (2024-01-15)

- Initial release
- Authentication system
- User management
- Health data tracking
- Assessment system
- Education content
- Fitness tracking
- Wellness activities
- Health news
- Health calculators
- Consultation booking
