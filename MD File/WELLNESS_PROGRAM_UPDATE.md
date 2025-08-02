# Wellness Program Update - Integration with Mission System

## Overview
Wellness App telah diintegrasikan dengan sistem Mission untuk memberikan pengalaman yang lebih terpadu. Sekarang Wellness Program mencakup semua fitur mission dan tracking dalam satu aplikasi yang komprehensif.

## Perubahan Utama

### 1. Integrasi Wellness dengan Mission
- **Wellness Program** sekarang mencakup semua aktivitas mission
- User yang sudah terdaftar dalam mission otomatis dianggap sudah join Wellness Program
- Tidak perlu mengisi data diri lagi jika sudah memiliki mission aktif

### 2. Card yang Ditampilkan di Main Screen
Sekarang hanya menampilkan 2 card utama:
- **Wellness Program** - Menggabungkan mission, auto fitness, log meal, track water, log exercise
- **Clinics Booking** - Booking konsultasi dengan dokter dan layanan kesehatan

### 3. Database Updates
Field baru yang ditambahkan ke tabel `users`:
- `wellness_program_joined` (BOOLEAN) - Status user dalam program wellness
- `wellness_join_date` (DATETIME) - Tanggal user join program wellness
- `fitness_goal` (ENUM) - Tujuan fitness user

### 4. UI/UX Improvements
- **Onboarding Screen**: Form data diri untuk user baru
- **Dashboard**: Menampilkan progress mission dan aktivitas wellness
- **Mission Tab**: Daftar mission yang tersedia
- **Tracking Tab**: Fitur tracking kesehatan (meal, water, fitness, sleep, mood)

### 5. Navigation Updates
- Tab **MISSION** di MainScreen diubah menjadi **WELLNESS**
- Center button diubah dari "plus" menjadi "heart-pulse" icon
- Semua navigasi mission sekarang mengarah ke WellnessApp

## Fitur Wellness Program

### Dashboard Tab
- Progress mission dan poin
- Quick actions untuk aktivitas kesehatan
- Ringkasan aktivitas hari ini
- Mission aktif atau prompt untuk mulai mission

### Mission Tab
- Daftar semua mission yang tersedia
- Progress tracking untuk setiap mission
- Kategori mission (health tracking, nutrition, fitness, mental health, dll)

### Tracking Tab
- **Log Makanan**: Catat asupan kalori harian
- **Track Air**: Monitor konsumsi air minum
- **Log Olahraga**: Catat aktivitas fisik
- **Auto Fitness**: Deteksi aktivitas otomatis

## Logic Check User Profile

### Kondisi untuk Skip Onboarding:
1. User memiliki `wellness_program_joined = true` di database, ATAU
2. User sudah memiliki mission aktif (data di tabel `user_missions`)

### Kondisi untuk Tampilkan Onboarding:
1. User belum join program wellness, DAN
2. User belum memiliki mission aktif

## API Endpoints

### Update User Profile
```javascript
PUT /api/auth/profile
{
  "weight": 70,
  "height": 170,
  "age": 25,
  "gender": "male",
  "activity_level": "moderate",
  "fitness_goal": "weight_loss",
  "wellness_program_joined": true,
  "wellness_join_date": "2024-01-01T00:00:00.000Z"
}
```

## File Changes

### Frontend
- `src/screens/MainScreen.tsx` - Update card display dan navigation
- `src/screens/WellnessApp.tsx` - Integrasi mission dengan wellness
- `src/services/api.js` - API calls untuk user profile

### Backend
- `backend/models/User.js` - Model updates untuk field wellness
- `backend/routes/auth.js` - Route updates untuk handle wellness fields

## Testing

### Test Cases
1. **User Baru**: Harus mengisi onboarding form
2. **User dengan Mission**: Langsung masuk ke dashboard wellness
3. **User dengan Wellness Program**: Langsung masuk ke dashboard wellness
4. **Navigation**: Semua tab dan button mengarah ke WellnessApp

### Database Verification
```sql
-- Check wellness fields
DESCRIBE users;

-- Check user wellness status
SELECT id, name, wellness_program_joined, wellness_join_date 
FROM users 
WHERE wellness_program_joined = true;
```

## Migration Notes
- Field wellness sudah ada di database
- Tidak perlu migration script tambahan
- Existing users akan tetap berfungsi normal
- New users akan melalui onboarding process

## Future Enhancements
- Analytics dashboard untuk wellness progress
- Personalized mission recommendations
- Integration dengan wearable devices
- Social features untuk wellness community 