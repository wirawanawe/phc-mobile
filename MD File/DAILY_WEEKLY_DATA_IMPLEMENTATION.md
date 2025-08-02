# Daily dan Weekly Data Implementation

## Overview

Implementasi ini memisahkan data harian dan mingguan sesuai dengan requirement:

1. **Data Harian**: Reset setiap hari sesuai tanggal input
2. **Data Weekly**: Mengakumulasi data harian selama seminggu
3. **TodaySummaryCard**: Tetap menampilkan data harian saja
4. **WellnessApp**: Menampilkan data weekly di halaman WellnessApp

## Komponen yang Dibuat

### 1. API Endpoint Baru: `/tracking/weekly-summary`

**File**: `dash-app/app/api/mobile/tracking/weekly-summary/route.js`

**Fungsi**:
- Mengambil data 7 hari terakhir
- Menghitung total dan rata-rata harian
- Menghitung wellness score berdasarkan rata-rata mingguan
- Mengembalikan breakdown data per kategori (nutrition, water, fitness, sleep)

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-07",
      "days": 7
    },
    "weekly_totals": {
      "calories": 14000,
      "water_ml": 14000,
      "steps": 70000,
      "exercise_minutes": 210,
      "distance_km": 35,
      "sleep_hours": 56,
      "meal_count": 21,
      "days_with_activity": 7
    },
    "weekly_averages": {
      "calories_per_day": 2000,
      "water_ml_per_day": 2000,
      "steps_per_day": 10000,
      "exercise_minutes_per_day": 30,
      "distance_km_per_day": 5,
      "sleep_hours_per_day": 8
    },
    "wellness_score": 85,
    "daily_breakdown": {
      "nutrition": [...],
      "water": [...],
      "fitness": [...],
      "sleep": [...]
    }
  }
}
```

### 2. WeeklySummaryCard Component

**File**: `src/components/WeeklySummaryCard.tsx`

**Fitur**:
- Menampilkan rata-rata harian untuk 7 hari terakhir
- Design berbeda dengan TodaySummaryCard (gradient ungu-pink)
- Wellness score berdasarkan rata-rata mingguan
- Update setiap 5 menit (lebih lambat dari daily)
- Menampilkan periode tanggal (contoh: "1-7 Jan")

**Metrics yang Ditampilkan**:
- Kalori rata-rata per hari
- Air minum rata-rata per hari
- Langkah rata-rata per hari
- Olahraga rata-rata per hari
- Jarak rata-rata per hari
- Tidur rata-rata per hari

### 3. API Service Update

**File**: `src/services/api.js`

**Method Baru**:
```javascript
async getWeeklySummary() {
  const queryString = await this.createQueryStringWithUserId();
  return await this.request(`/tracking/weekly-summary?${queryString}`);
}
```

### 4. WellnessApp Integration

**File**: `src/screens/WellnessApp.tsx`

**Perubahan**:
- Import WeeklySummaryCard
- Tambah section "Weekly Summary" di DashboardTab
- Posisi setelah "Today's Summary"

## Perbedaan Daily vs Weekly

### TodaySummaryCard (Daily Data)
- **Data**: Hanya data hari ini
- **Reset**: Otomatis reset setiap hari
- **Update**: Setiap 30 detik
- **Design**: Gradient ungu (purple)
- **Score**: Berdasarkan target harian
- **Lokasi**: Semua halaman yang menggunakan TodaySummaryCard

### WeeklySummaryCard (Weekly Data)
- **Data**: Rata-rata 7 hari terakhir
- **Akumulasi**: Mengumpulkan data harian
- **Update**: Setiap 5 menit
- **Design**: Gradient ungu-pink (purple-pink)
- **Score**: Berdasarkan rata-rata mingguan
- **Lokasi**: Hanya di WellnessApp Dashboard

## Date Change Detection

### TodaySummaryCard
```javascript
// Check for date change every minute
const dateCheckInterval = setInterval(() => {
  const today = new Date().toDateString();
  if (lastDateCheck.current !== today) {
    lastDateCheck.current = today;
    loadTodayData(); // Reload data when date changes
  }
}, 60000);
```

### WeeklySummaryCard
- Tidak perlu date change detection karena selalu mengambil 7 hari terakhir
- Data otomatis terupdate ketika ada data baru

## Testing

**File**: `scripts/test-weekly-summary.js`

Untuk test API endpoint:
```bash
node scripts/test-weekly-summary.js
```

## Database Queries

API endpoint menggunakan query berikut untuk mengumpulkan data:

### Nutrition Data
```sql
SELECT 
  tracking_date as date,
  SUM(calories) as total_calories,
  COUNT(*) as meal_count
FROM meal_tracking
WHERE user_id = ? AND tracking_date BETWEEN ? AND ?
GROUP BY tracking_date
```

### Water Data
```sql
SELECT 
  tracking_date as date,
  SUM(amount_ml) as total_ml,
  COUNT(*) as entries
FROM water_tracking
WHERE user_id = ? AND tracking_date BETWEEN ? AND ?
GROUP BY tracking_date
```

### Fitness Data
```sql
SELECT 
  tracking_date as date,
  SUM(steps) as total_steps,
  SUM(duration_minutes) as total_exercise_minutes,
  SUM(distance_km) as total_distance_km
FROM fitness_tracking
WHERE user_id = ? AND tracking_date BETWEEN ? AND ?
GROUP BY tracking_date
```

### Sleep Data
```sql
SELECT 
  tracking_date as date,
  SUM(sleep_hours) as total_hours,
  AVG(sleep_quality) as avg_quality
FROM sleep_tracking
WHERE user_id = ? AND tracking_date BETWEEN ? AND ?
GROUP BY tracking_date
```

## Wellness Score Calculation

### Daily Score (TodaySummaryCard)
- Steps: 25 points (target: 10,000)
- Exercise: 25 points (target: 30 minutes)
- Water: 25 points (target: 2.5 liters)
- Calories: 25 points (target: 2000 calories)
- Distance: 25 points (target: 10km)

### Weekly Score (WeeklySummaryCard)
- Steps: 25 points (target: 10,000 per day average)
- Exercise: 25 points (target: 30 minutes per day average)
- Water: 25 points (target: 2000ml per day average)
- Calories: 25 points (target: 2000 calories per day average)

## Deployment Notes

1. Pastikan database tables sudah ada:
   - `meal_tracking`
   - `water_tracking`
   - `fitness_tracking`
   - `sleep_tracking`

2. Restart server setelah menambah endpoint baru

3. Test dengan data dummy jika diperlukan

## Future Enhancements

1. **Weekly Trends**: Menampilkan trend mingguan
2. **Goal Setting**: Target mingguan yang bisa diset user
3. **Notifications**: Notifikasi pencapaian target mingguan
4. **Export**: Export data mingguan ke PDF/Excel
5. **Comparison**: Bandingkan minggu ini vs minggu lalu 