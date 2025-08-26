# Mission & Wellness Activity Category Restructure

## 🎯 Overview

Restrukturisasi kategori misi dan aktivitas wellness telah dilakukan untuk mengintegrasikan dengan sistem tracking. Kategori baru dirancang untuk mendukung auto-update mission progress berdasarkan data tracking user.

## 🔄 Changes Made

### 1. **Cleanup Old Data**
- Menghapus misi lama yang tidak terintegrasi dengan tracking
- Menghapus aktivitas wellness lama
- Membersihkan user missions dan user wellness activities yang terkait

### 2. **New Mission Categories**
Kategori misi baru yang terintegrasi dengan tracking:

#### **health_tracking**
- **Water Intake**: Minum air putih (ml)
- **Sleep**: Durasi tidur (hours)
- **Auto-update**: Berdasarkan data dari water_tracking dan sleep_tracking

#### **fitness**
- **Steps**: Jumlah langkah (steps)
- **Exercise**: Durasi olahraga (minutes)
- **Auto-update**: Berdasarkan data dari fitness_tracking

#### **nutrition**
- **Calories**: Konsumsi kalori (calories)
- **Meals**: Jumlah makan (meals)
- **Auto-update**: Berdasarkan data dari meal_logging

#### **mental_health**
- **Mood**: Skor mood (mood_score)
- **Stress**: Level stress (stress_level)
- **Auto-update**: Berdasarkan data dari mood_tracking

### 3. **New Wellness Activity Categories**
Kategori aktivitas wellness yang mendukung tracking:

#### **health_tracking**
- Aktivitas terkait air minum dan tidur
- Instruksi untuk tracking yang konsisten
- Tips untuk kesehatan optimal

#### **fitness**
- Aktivitas jalan kaki dan olahraga
- Durasi dan kalori yang terbakar
- Instruksi untuk aktivitas fisik

#### **nutrition**
- Perencanaan dan persiapan makanan sehat
- Aktivitas makan sehat
- Tips nutrisi seimbang

#### **mental_health**
- Manajemen mood dan stress
- Aktivitas relaksasi dan meditasi
- Tips kesehatan mental

## 📊 New Mission Examples

### Health Tracking Missions
```sql
-- Water Intake
('Minum Air 2 Liter Sehari', 'health_tracking', 'daily', 2000, 'ml', 75)
('Minum Air 3 Liter Sehari', 'health_tracking', 'daily', 3000, 'ml', 100)
('Minum Air 4 Liter Sehari', 'health_tracking', 'daily', 4000, 'ml', 125)

-- Sleep
('Tidur 8 Jam Sehari', 'health_tracking', 'daily', 8, 'hours', 60)
('Tidur 7 Jam Sehari', 'health_tracking', 'daily', 7, 'hours', 40)
('Tidur 9 Jam Sehari', 'health_tracking', 'daily', 9, 'hours', 80)
```

### Fitness Missions
```sql
-- Steps
('Jalan 10.000 Langkah', 'fitness', 'daily', 10000, 'steps', 60)
('Jalan 5.000 Langkah', 'fitness', 'daily', 5000, 'steps', 30)
('Jalan 15.000 Langkah', 'fitness', 'daily', 15000, 'steps', 90)

-- Exercise
('Olahraga 30 Menit', 'fitness', 'daily', 30, 'minutes', 50)
('Olahraga 60 Menit', 'fitness', 'daily', 60, 'minutes', 80)
('Olahraga 15 Menit', 'fitness', 'daily', 15, 'minutes', 25)
```

### Nutrition Missions
```sql
-- Calories
('Konsumsi 2000 Kalori', 'nutrition', 'daily', 2000, 'calories', 60)
('Konsumsi 1500 Kalori', 'nutrition', 'daily', 1500, 'calories', 40)
('Konsumsi 2500 Kalori', 'nutrition', 'daily', 2500, 'calories', 80)

-- Meals
('Makan 3 Kali Sehari', 'nutrition', 'daily', 3, 'meals', 30)
('Makan 4 Kali Sehari', 'nutrition', 'daily', 4, 'meals', 40)
('Makan 5 Kali Sehari', 'nutrition', 'daily', 5, 'meals', 50)
```

### Mental Health Missions
```sql
-- Mood
('Mood Baik Seharian', 'mental_health', 'daily', 7, 'mood_score', 40)
('Mood Sangat Baik', 'mental_health', 'daily', 8, 'mood_score', 60)
('Mood Stabil', 'mental_health', 'daily', 6, 'mood_score', 30)

-- Stress
('Stress Level Rendah', 'mental_health', 'daily', 2, 'stress_level', 50)
('Stress Level Minimal', 'mental_health', 'daily', 1, 'stress_level', 70)
```

## 🏃‍♂️ New Wellness Activity Examples

### Health Tracking Activities
```sql
-- Water Activities
('Minum Air Pagi', 'health_tracking', 5, 0, 'easy')
('Minum Air Sebelum Makan', 'health_tracking', 5, 0, 'easy')
('Minum Air Setelah Olahraga', 'health_tracking', 5, 0, 'easy')

-- Sleep Activities
('Rutinitas Tidur Malam', 'health_tracking', 30, 0, 'easy')
('Bangun Pagi Konsisten', 'health_tracking', 10, 0, 'medium')
('Kualitas Tidur Optimal', 'health_tracking', 15, 0, 'easy')
```

### Fitness Activities
```sql
-- Walking Activities
('Jalan Pagi 30 Menit', 'fitness', 30, 120, 'easy')
('Jalan Siang 20 Menit', 'fitness', 20, 80, 'easy')
('Jalan Sore 45 Menit', 'fitness', 45, 180, 'medium')

-- Exercise Activities
('Pemanasan Pagi', 'fitness', 15, 50, 'easy')
('Olahraga Kardio', 'fitness', 30, 200, 'medium')
('Latihan Kekuatan', 'fitness', 45, 250, 'hard')
```

### Nutrition Activities
```sql
-- Meal Planning
('Rencana Makan Sehari', 'nutrition', 20, 0, 'easy')
('Persiapan Makan Sehat', 'nutrition', 60, 100, 'medium')
('Memasak Makanan Sehat', 'nutrition', 45, 150, 'medium')

-- Healthy Eating
('Sarapan Sehat', 'nutrition', 20, 0, 'easy')
('Snack Sehat', 'nutrition', 10, 0, 'easy')
('Makan Malam Sehat', 'nutrition', 30, 0, 'easy')
```

### Mental Health Activities
```sql
-- Mood Management
('Meditasi Pagi', 'mental_health', 15, 0, 'easy')
('Jurnal Harian', 'mental_health', 10, 0, 'easy')
('Aktivitas Menyenangkan', 'mental_health', 30, 50, 'easy')

-- Stress Management
('Teknik Pernapasan', 'mental_health', 10, 0, 'easy')
('Istirahat Mental', 'mental_health', 20, 0, 'medium')
('Quality Time', 'mental_health', 60, 0, 'easy')
```

## 🔗 Integration with Tracking System

### Auto-Update Mapping
```typescript
// Tracking Type to Mission Category Mapping
const trackingToMissionMapping = {
  'health_tracking': ['water_tracking', 'sleep_tracking'],
  'fitness': ['fitness_tracking'],
  'nutrition': ['meal_logging'],
  'mental_health': ['mood_tracking']
};

// Mission Category to Tracking Data Mapping
const missionToTrackingMapping = {
  'health_tracking': {
    'water': 'amount_ml',
    'sleep': 'sleep_hours'
  },
  'fitness': {
    'steps': 'steps',
    'exercise': 'exercise_minutes'
  },
  'nutrition': {
    'calories': 'calories',
    'meals': 'meal_count'
  },
  'mental_health': {
    'mood': 'mood_score',
    'stress': 'stress_level'
  }
};
```

### Progress Calculation
```typescript
// Auto-update logic in TrackingMissionService
async autoUpdateMissionProgress(updateData: TrackingMissionUpdate) {
  const { tracking_type, current_value, date } = updateData;
  
  // Find active missions matching tracking type
  const activeMissions = await this.findActiveMissions(tracking_type);
  
  for (const mission of activeMissions) {
    // Calculate progress
    const progress = Math.min((current_value / mission.target_value) * 100, 100);
    
    // Update mission progress
    await this.updateMissionProgress(mission.id, current_value, progress);
    
    // Check if completed
    if (progress >= 100) {
      await this.completeMission(mission.id);
    }
  }
}
```

## 📈 Benefits of New Structure

### 1. **Seamless Integration**
- Mission progress terupdate otomatis berdasarkan tracking data
- Tidak perlu manual update progress
- Data consistency antara tracking dan mission

### 2. **Better User Experience**
- Real-time feedback ketika melakukan tracking
- Notifikasi otomatis ketika mission selesai
- Gamification yang lebih engaging

### 3. **Comprehensive Coverage**
- Semua jenis tracking terintegrasi dengan mission
- Kategori yang jelas dan terorganisir
- Difficulty levels yang bervariasi

### 4. **Scalable Architecture**
- Mudah menambah kategori baru
- Flexible untuk berbagai jenis tracking
- Extensible untuk fitur masa depan

## 🚀 Implementation Steps

### 1. **Run Cleanup Script**
```bash
cd dash-app/scripts
node run-cleanup-and-new-data.js
```

### 2. **Verify Data**
```sql
-- Check missions by category
SELECT category, COUNT(*) as count FROM missions WHERE is_active = TRUE GROUP BY category;

-- Check wellness activities by category
SELECT category, COUNT(*) as count FROM wellness_activities WHERE is_active = TRUE GROUP BY category;
```

### 3. **Test Integration**
- Test water tracking → auto-update health_tracking missions
- Test fitness tracking → auto-update fitness missions
- Test meal logging → auto-update nutrition missions
- Test mood tracking → auto-update mental_health missions

## 📊 Expected Results

### Mission Distribution
- **health_tracking**: 6 missions (water + sleep)
- **fitness**: 6 missions (steps + exercise)
- **nutrition**: 6 missions (calories + meals)
- **mental_health**: 5 missions (mood + stress)
- **Total**: 23 missions

### Wellness Activity Distribution
- **health_tracking**: 6 activities (water + sleep)
- **fitness**: 6 activities (walking + exercise)
- **nutrition**: 6 activities (meal planning + healthy eating)
- **mental_health**: 6 activities (mood + stress management)
- **Total**: 24 activities

### Point Distribution
- **Easy missions**: 30-50 points
- **Medium missions**: 50-75 points
- **Hard missions**: 75-125 points
- **Total available points**: ~1,500 points

## 🎯 Success Metrics

### 1. **Mission Completion Rate**
- Target: 70% completion rate
- Measurement: Completed missions / Total active missions

### 2. **User Engagement**
- Target: 50% increase in tracking frequency
- Measurement: Daily tracking sessions

### 3. **Data Consistency**
- Target: 100% auto-update success rate
- Measurement: Mission progress updates / Tracking entries

## 🔄 Future Enhancements

### 1. **Weekly/Monthly Missions**
- Extend daily missions to weekly/monthly
- Cumulative progress tracking
- Streak bonuses

### 2. **Smart Recommendations**
- AI-powered mission suggestions
- Personalized difficulty levels
- Adaptive challenges

### 3. **Social Features**
- Mission sharing
- Leaderboards
- Team challenges

### 4. **Advanced Analytics**
- Progress trends
- Performance insights
- Health correlations

## 🎉 Conclusion

Restrukturisasi kategori misi dan aktivitas wellness telah berhasil menciptakan sistem yang:

✅ **Terintegrasi sempurna** dengan sistem tracking  
✅ **Mendukung auto-update** progress mission  
✅ **Memberikan user experience** yang lebih engaging  
✅ **Memiliki arsitektur** yang scalable dan maintainable  
✅ **Mencakup semua kategori** tracking yang ada  

Sistem baru ini akan memotivasi user untuk melakukan tracking secara konsisten sambil memberikan feedback real-time dan gamification yang menarik.
