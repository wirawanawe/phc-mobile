# Food Tracking & Water Settings Implementation

## Overview
Implementasi fitur-fitur tracking makanan, air minum, dan olahraga yang tersimpan di database dengan fitur AI recognition dan pengaturan air minum yang dapat diatur oleh user atau dokter.

## Fitur yang Diimplementasikan

### 1. Food Database & Search
- **Database Makanan**: Model `FoodDatabase` untuk menyimpan informasi nutrisi makanan
- **Search API**: Endpoint `/api/food/search` untuk mencari makanan berdasarkan nama, kategori, atau nama Indonesia
- **Data Seed**: Script `seed-food-database.js` dengan 25+ makanan Indonesia dan internasional

### 2. AI Food Recognition
- **Camera Integration**: Fitur scan makanan menggunakan kamera smartphone
- **Image Upload**: Endpoint `/api/food/recognize` untuk upload dan analisis gambar
- **Mock AI**: Simulasi AI recognition dengan data makanan yang dikenali
- **Auto Save**: Makanan yang dikenali otomatis disimpan ke database

### 3. Meal Logging System
- **Real-time Search**: Search makanan dari database saat mengetik
- **Nutrition Calculation**: Perhitungan otomatis kalori, protein, karbohidrat, lemak, dll
- **Meal Categories**: Breakfast, Lunch, Dinner, Snacks
- **Database Storage**: Semua data makanan tersimpan di tabel `meal_logging`

### 4. Water Tracking with Settings
- **Custom Goals**: User dapat mengatur target air minum harian
- **Doctor Settings**: Dokter dapat mengatur target air minum untuk pasien
- **Smart Calculation**: Perhitungan otomatis berdasarkan berat badan, aktivitas, dan iklim
- **Reminder System**: Pengaturan reminder dengan interval yang dapat disesuaikan

### 5. Fitness Tracking
- **Database Integration**: Data olahraga tersimpan di tabel `fitness_tracking`
- **Real-time Updates**: Update data fitness secara real-time
- **Progress Tracking**: Tracking kemajuan olahraga harian

## Database Schema

### FoodDatabase
```sql
CREATE TABLE food_database (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  name_indonesian VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  calories_per_100g DECIMAL(6,2) NOT NULL,
  protein_per_100g DECIMAL(6,2) DEFAULT 0,
  carbs_per_100g DECIMAL(6,2) DEFAULT 0,
  fat_per_100g DECIMAL(6,2) DEFAULT 0,
  fiber_per_100g DECIMAL(6,2) DEFAULT 0,
  sugar_per_100g DECIMAL(6,2) DEFAULT 0,
  sodium_per_100g DECIMAL(8,2) DEFAULT 0,
  serving_size VARCHAR(100),
  serving_weight DECIMAL(6,2),
  barcode VARCHAR(50),
  image_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT FALSE,
  source ENUM('manual', 'api', 'ai_scan') DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### UserWaterSettings
```sql
CREATE TABLE user_water_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  daily_goal_ml INT NOT NULL DEFAULT 2000,
  custom_goal_ml INT,
  doctor_recommended_ml INT,
  doctor_id INT,
  is_doctor_set BOOLEAN DEFAULT FALSE,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_interval_minutes INT DEFAULT 60,
  reminder_start_time TIME DEFAULT '08:00:00',
  reminder_end_time TIME DEFAULT '22:00:00',
  weight_kg DECIMAL(5,2),
  activity_level ENUM('low', 'moderate', 'high') DEFAULT 'moderate',
  climate_factor ENUM('normal', 'hot', 'very_hot') DEFAULT 'normal',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);
```

## API Endpoints

### Food Database
- `GET /api/food/search?query=keyword` - Search makanan
- `GET /api/food/:id` - Get detail makanan
- `POST /api/food/recognize` - AI food recognition
- `POST /api/food` - Add makanan manual
- `GET /api/food/categories` - Get kategori makanan

### Water Settings
- `GET /api/water-settings` - Get pengaturan air user
- `PUT /api/water-settings` - Update pengaturan air
- `PUT /api/water-settings/doctor-set` - Dokter set target air
- `POST /api/water-settings/calculate` - Hitung rekomendasi air

### Tracking
- `POST /api/tracking/meals` - Log makanan
- `POST /api/tracking/water` - Log air minum
- `POST /api/tracking/fitness` - Log olahraga

## Frontend Implementation

### MealLoggingScreen
- Search makanan real-time dari database
- AI camera recognition (placeholder)
- Kalkulasi nutrisi otomatis
- UI untuk menambah/menghapus makanan
- Modal untuk search dan camera

### WaterTrackingScreen
- Settings modal dengan pengaturan lengkap
- Perhitungan otomatis target air
- Toggle reminder settings
- Doctor recommendation display
- Activity level dan climate factor selection

## Setup Instructions

### 1. Database Setup
```bash
cd backend
npm run db:sync
npm run seed:food
```

### 2. Backend Dependencies
```bash
cd backend
npm install multer
```

### 3. Frontend Dependencies
```bash
npm install expo-image-picker
```

### 4. Environment Variables
```env
# Backend .env
UPLOAD_DIR=uploads/food-images
MAX_FILE_SIZE=5242880
```

## Usage Examples

### Search Food
```javascript
// Search makanan dari database
const response = await apiService.request('/food/search?query=nasi');
const foods = response.data;
```

### AI Recognition
```javascript
// Upload gambar untuk AI recognition
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'food-image.jpg'
});

const response = await apiService.post('/food/recognize', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Water Settings
```javascript
// Update pengaturan air
const settings = {
  daily_goal_ml: 2500,
  weight_kg: 70,
  activity_level: 'moderate',
  climate_factor: 'normal',
  reminder_enabled: true
};

await apiService.request('/water-settings', {
  method: 'PUT',
  body: JSON.stringify(settings)
});
```

## Future Enhancements

### 1. Real AI Integration
- Integrasi dengan Google Vision API atau Clarifai
- Machine learning model untuk recognition makanan Indonesia
- Barcode scanning untuk produk kemasan

### 2. Advanced Features
- Meal planning dan scheduling
- Nutrition goals dan tracking
- Social sharing dan challenges
- Integration dengan fitness trackers

### 3. Doctor Dashboard
- Dashboard khusus dokter untuk monitoring pasien
- Automated recommendations berdasarkan data kesehatan
- Progress reports dan analytics

## Testing

### API Testing
```bash
# Test food search
curl -X GET "http://localhost:5432/api/food/search?query=nasi" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test water settings
curl -X GET "http://localhost:5432/api/water-settings" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Testing
```bash
# Check food database
mysql -u root -p phc_mobile
SELECT COUNT(*) FROM food_database;
SELECT * FROM food_database WHERE category = 'Rice Dishes';
```

## Troubleshooting

### Common Issues
1. **Image Upload Fails**: Check file size limits and upload directory permissions
2. **Search Not Working**: Verify database connection and food data seeding
3. **Water Settings Not Saving**: Check user authentication and database constraints

### Debug Commands
```bash
# Check database tables
npm run db:sync

# Reset and reseed data
npm run db:reset
npm run seed:food

# Check server logs
npm run dev
```

## Security Considerations

1. **File Upload Security**: Validate file types and sizes
2. **Authentication**: All endpoints require valid JWT token
3. **Data Validation**: Input validation for all user inputs
4. **SQL Injection**: Use parameterized queries with Sequelize

## Performance Optimization

1. **Database Indexing**: Index on search columns (name, category)
2. **Caching**: Cache frequently searched foods
3. **Image Compression**: Compress uploaded images before storage
4. **Pagination**: Implement pagination for large result sets 