# Wellness Program Completion & History Feature

## Overview
Fitur ini menangani program wellness yang sudah berakhir dan menampilkan summary lengkap dari program yang telah selesai. Ketika user melewati durasi program, sistem akan otomatis menandai program sebagai selesai dan menyimpan data summary ke history.

## Fitur Utama

### 1. **Automatic Program Completion**
- Sistem otomatis menandai program sebagai selesai ketika melewati durasi
- Menyimpan summary lengkap program ke tabel history
- Menghitung statistik program (aktivitas, misi, poin, metrik kesehatan)
- Increment program cycles untuk tracking jumlah siklus

### 2. **Program Status Tracking**
- **Active**: Program sedang berjalan
- **Completed**: Program sudah selesai
- **Expired**: Program sudah melewati durasi tapi belum ditandai selesai
- **Not Joined**: User belum join program wellness

### 3. **Program History**
- Menyimpan semua data program yang telah selesai
- Summary lengkap untuk setiap program
- Metrik kesehatan (air minum, tidur, mood)
- Tingkat penyelesaian program

### 4. **Renew Program**
- User dapat mendaftar ulang untuk program baru
- Reset status program dan mulai siklus baru
- Mempertahankan history program sebelumnya

## Database Schema

### Tabel `mobile_users` - Field Baru
```sql
ALTER TABLE mobile_users 
ADD COLUMN wellness_program_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN wellness_program_end_date DATETIME NULL,
ADD COLUMN wellness_program_completion_date DATETIME NULL,
ADD COLUMN wellness_program_cycles INT DEFAULT 1;
```

### Tabel `wellness_program_history` - Baru
```sql
CREATE TABLE wellness_program_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  program_start_date DATETIME NOT NULL,
  program_end_date DATETIME NOT NULL,
  program_duration INT NOT NULL,
  total_activities INT DEFAULT 0,
  completed_missions INT DEFAULT 0,
  total_points INT DEFAULT 0,
  wellness_score DECIMAL(5,2) DEFAULT 0,
  avg_water_intake DECIMAL(8,2) DEFAULT 0,
  avg_sleep_hours DECIMAL(4,2) DEFAULT 0,
  avg_mood_score DECIMAL(3,1) DEFAULT 0,
  fitness_goal VARCHAR(50) NULL,
  activity_level VARCHAR(50) NULL,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_program_dates (program_start_date, program_end_date),
  FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE
);
```

## API Endpoints

### 1. **Check Program Status** (`GET /api/mobile/wellness/check-program-status`)
Mengecek status program wellness user dan otomatis menandai program yang sudah selesai.

**Response:**
```json
{
  "success": true,
  "data": {
    "program_status": "completed", // active, completed, expired, not_joined
    "should_renew": true,
    "days_remaining": 0,
    "days_completed": 30,
    "program_duration": 30,
    "join_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-01-31T00:00:00.000Z",
    "completion_date": "2024-01-31T00:00:00.000Z",
    "program_cycles": 2,
    "fitness_goal": "weight_loss",
    "activity_level": "moderately_active",
    "program_history": [
      {
        "id": 1,
        "program_start_date": "2024-01-01T00:00:00.000Z",
        "program_end_date": "2024-01-31T00:00:00.000Z",
        "program_duration": 30,
        "total_activities": 45,
        "completed_missions": 12,
        "total_points": 1250,
        "wellness_score": 85.5,
        "avg_water_intake": 1800.0,
        "avg_sleep_hours": 7.2,
        "avg_mood_score": 7.5,
        "fitness_goal": "weight_loss",
        "activity_level": "moderately_active",
        "completion_rate": 85.0,
        "created_at": "2024-01-31T00:00:00.000Z"
      }
    ]
  }
}
```

### 2. **Setup Wellness** (Updated)
Endpoint setup wellness sudah diupdate untuk menangani renew program.

**Request Body:**
```json
{
  "weight": 70,
  "height": 170,
  "gender": "male",
  "activity_level": "moderately_active",
  "fitness_goal": "weight_loss",
  "program_duration": 30
}
```

## Frontend Implementation

### 1. **ProfileScreen Updates**
- Menampilkan status program wellness
- Tombol "Daftar Program Baru" untuk renew
- Informasi sisa hari untuk program aktif
- Jumlah siklus program yang telah diikuti

### 2. **WellnessHistoryScreen** (New)
Halaman baru untuk menampilkan riwayat lengkap program wellness:

**Fitur:**
- Daftar semua program yang telah selesai
- Detail lengkap setiap program (expandable)
- Statistik program (aktivitas, misi, poin, skor)
- Metrik kesehatan (air minum, tidur, mood)
- Tingkat penyelesaian dengan progress bar
- Tujuan fitness dan level aktivitas

### 3. **Navigation Updates**
- Menu "Riwayat Program Wellness" di ProfileScreen
- Navigasi ke WellnessHistoryScreen
- Auto-navigate ke WellnessApp untuk renew program

## Workflow Program Completion

### 1. **Program Active**
```
User → Join Program → Set Duration → Program Active
```

### 2. **Program Expired**
```
Program End Date < Current Date → Auto Mark as Completed
→ Save to History → Increment Cycles → Show Renew Option
```

### 3. **Program Renew**
```
User Click "Daftar Program Baru" → Navigate to WellnessApp
→ Fill New Program Data → Reset Status → Start New Cycle
```

## UI Components

### ProfileScreen - Wellness Status Section
```
┌─────────────────────────────────────┐
│ Status Program Wellness             │
├─────────────────────────────────────┤
│ ✅ Program Selesai                  │
│ Program selesai! Total 2 siklus     │
│ 1 program sebelumnya                │
│                                     │
│ [Daftar Program Baru]               │
└─────────────────────────────────────┘
```

### WellnessHistoryScreen - Program Card
```
┌─────────────────────────────────────┐
│ #1 01 Jan 2024 - 31 Jan 2024       │
│ 30 hari                    [▼]     │
├─────────────────────────────────────┤
│ Tujuan: Menurunkan Berat Badan     │
│ Aktivitas: Sedang                  │
│                                     │
│ Tingkat Penyelesaian: 85%          │
│ ████████████████░░░░ 85%           │
│                                     │
│ 🏋️ 45  🏆 12  ⭐ 1250  ❤️ 86       │
│ Aktivitas Misi Poin Skor           │
│                                     │
│ Metrik Kesehatan:                   │
│ 💧 1800ml/hari  😴 7.2 jam  😊 7.5/10 │
└─────────────────────────────────────┘
```

## Data Calculation

### Program Completion Rate
```javascript
completion_rate = (days_completed / program_duration) * 100
```

### Health Metrics Average
```javascript
avg_water_intake = SUM(water_tracking.amount_ml) / COUNT(water_tracking)
avg_sleep_hours = SUM(sleep_tracking.sleep_hours) / COUNT(sleep_tracking)
avg_mood_score = SUM(mood_tracking.mood_score) / COUNT(mood_tracking)
```

### Program Statistics
```javascript
total_activities = COUNT(user_wellness_activities WHERE completed_at BETWEEN start_date AND end_date)
completed_missions = COUNT(user_missions WHERE status = 'completed' AND created_at BETWEEN start_date AND end_date)
total_points = SUM(user_missions.points_earned WHERE created_at BETWEEN start_date AND end_date)
```

## Testing Scenarios

### 1. **Program Active**
- User masih dalam durasi program
- Menampilkan sisa hari
- Tidak ada tombol renew

### 2. **Program Completed**
- Program sudah melewati durasi
- Otomatis ditandai selesai
- Data tersimpan di history
- Menampilkan tombol renew

### 3. **Program Renew**
- User klik "Daftar Program Baru"
- Navigasi ke WellnessApp
- Reset status program
- Increment program cycles

### 4. **History Display**
- Menampilkan semua program selesai
- Detail lengkap setiap program
- Expandable program cards
- Empty state jika belum ada history

## Files Modified

### Backend
- `dash-app/app/api/mobile/wellness/check-program-status/route.js` (New)
- `dash-app/app/api/mobile/setup-wellness/route.js` (Updated)
- `dash-app/scripts/add-wellness-program-history.sql` (New)

### Frontend
- `src/screens/ProfileScreen.tsx` (Updated)
- `src/screens/WellnessHistoryScreen.tsx` (New)
- `src/services/api.js` (Updated)

### Documentation
- `MD File/WELLNESS_PROGRAM_COMPLETION_FEATURE.md` (New)

## Deployment Steps

1. **Database Migration:**
   ```bash
   cd dash-app
   mysql -u [username] -p [database] < scripts/add-wellness-program-history.sql
   ```

2. **Backend Deployment:**
   - Deploy API endpoint baru
   - Update setup wellness endpoint

3. **Frontend Deployment:**
   - Deploy ProfileScreen updates
   - Deploy WellnessHistoryScreen
   - Update navigation

4. **Testing:**
   - Test program completion workflow
   - Test history display
   - Test renew program functionality

## Future Enhancements

### 1. **Program Analytics**
- Trend analysis dari multiple programs
- Progress comparison antar program
- Personalized recommendations

### 2. **Achievement System**
- Badges untuk program completion
- Milestone rewards
- Streak tracking

### 3. **Social Features**
- Share program results
- Compare with friends
- Community challenges

### 4. **Advanced Metrics**
- BMI tracking over time
- Goal achievement rate
- Health improvement trends
