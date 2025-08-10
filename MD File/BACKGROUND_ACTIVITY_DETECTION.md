# Background Activity Detection System

## Overview

Sistem deteksi aktivitas background PHC Mobile dirancang untuk berjalan secara otomatis di background tanpa mengganggu pengalaman pengguna. Sistem ini hanya menampilkan data steps dan jarak yang telah dilalui user di MainScreen, tanpa menampilkan status monitoring yang mengganggu.

## Fitur Utama

### 1. **Background Processing**
- Berjalan otomatis di background setelah user mengaktifkan
- Tidak menampilkan status monitoring yang mengganggu
- Optimized untuk efisiensi baterai
- Update data setiap 30 detik di UI

### 2. **Minimal UI Display**
- Hanya menampilkan data steps dan jarak
- Tidak ada status "monitoring" atau "waiting"
- Clean dan simple interface
- Fokus pada data yang relevan

### 3. **Battery Optimized**
- GPS accuracy: Balanced (bukan BestForNavigation)
- Update interval: 3 detik (bukan 1 detik)
- Detection interval: 10 detik (bukan 5 detik)
- Distance interval: 10 meter (bukan 5 meter)

## Implementasi

### 1. **ActivityStatusCard Component**

#### State Management
```typescript
const [currentActivity, setCurrentActivity] = useState<ActivityData | null>(null);
const [detectionEnabled, setDetectionEnabled] = useState(false);
const [todayData, setTodayData] = useState({ steps: 0, distance: 0 });
```

#### UI States
- **Disabled**: Menampilkan card untuk mengaktifkan auto-detection
- **Enabled**: Menampilkan data steps dan jarak hari ini

#### Data Update
```typescript
// Update today's data every 30 seconds
const updateInterval = setInterval(() => {
  const updatedData = ActivityDetectionService.getTodayActivityData();
  setTodayData(updatedData);
}, 30000);
```

### 2. **ActivityDetectionService**

#### Background Configuration
```typescript
// Location tracking with background mode
this.locationSubscription = await Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.Balanced, // Battery efficient
    timeInterval: 3000, // 3 seconds
    distanceInterval: 10, // 10 meters
  },
  (location) => {
    this.handleLocationUpdate(location);
  }
);

// Detection interval for background
this.detectionInterval = setInterval(() => {
  this.detectActivity();
}, 10000); // 10 seconds
```

#### Data Management
```typescript
// Get today's total activity data
getTodayActivityData(): { steps: number; distance: number } {
  return {
    steps: this.stepCount,
    distance: this.currentActivity ? this.currentActivity.distance : 0,
  };
}

// Reset daily counters
resetDailyCounters(): void {
  this.stepCount = 0;
  if (this.currentActivity) {
    this.currentActivity.steps = 0;
    this.currentActivity.distance = 0;
  }
}
```

### 3. **MainScreen Integration**

#### Activity Data Integration
```typescript
// Load activity data
const loadActivityData = () => {
  const data = ActivityDetectionService.getTodayActivityData();
  setActivityData(data);
};

// Update every 30 seconds
const activityInterval = setInterval(loadActivityData, 30000);
```

#### Today's Summary Update
```typescript
const todayMetrics = [
  // ... other metrics
  {
    id: "3",
    icon: "walk",
    value: activityData.steps.toString(), // From background detection
    unit: "step",
    color: "#E0E7FF",
  },
  // ... other metrics
];
```

## User Experience

### 1. **Initial Setup**
1. User melihat card "Auto Activity Detection"
2. Klik "Enable" untuk mengaktifkan
3. Berikan izin lokasi
4. Sistem mulai berjalan di background

### 2. **Daily Usage**
1. User tidak perlu melakukan apa-apa
2. Sistem otomatis mendeteksi aktivitas
3. Data steps dan jarak terupdate di MainScreen
4. Tidak ada notifikasi atau status yang mengganggu

### 3. **Data Display**
- **Steps**: Jumlah langkah hari ini
- **Distance**: Jarak yang telah dilalui
- **Background Indicator**: "Auto-detection active in background"

## Keunggulan Sistem

### 1. **User Experience**
- ✅ Tidak mengganggu dengan status monitoring
- ✅ Data tersedia langsung di MainScreen
- ✅ Clean dan simple interface
- ✅ Zero manual input required

### 2. **Battery Efficiency**
- ✅ Optimized GPS settings
- ✅ Longer update intervals
- ✅ Background processing
- ✅ Minimal UI updates

### 3. **Data Accuracy**
- ✅ Real-time step counting
- ✅ Accurate distance calculation
- ✅ Persistent data storage
- ✅ Daily data reset

## Perbandingan dengan Samsung Health

### 1. **Similarities**
- ✅ Background activity detection
- ✅ Automatic step counting
- ✅ Distance tracking
- ✅ Clean UI display

### 2. **Improvements**
- 🚀 More battery efficient
- 🚀 Less intrusive UI
- 🚀 Better integration with health missions
- 🚀 Real-time data sync

## Troubleshooting

### 1. **Data Not Updating**
- Periksa apakah auto-detection sudah diaktifkan
- Pastikan izin lokasi sudah diberikan
- Tunggu 30 detik untuk update pertama

### 2. **Battery Drain**
- Sistem sudah dioptimasi untuk efisiensi
- Gunakan power saving mode jika diperlukan
- Pastikan GPS tidak digunakan oleh app lain

### 3. **Inaccurate Data**
- Pastikan berada di area dengan sinyal GPS yang baik
- Tunggu beberapa menit untuk kalibrasi
- Restart app jika diperlukan

## Pengembangan Selanjutnya

### 1. **Advanced Features**
- Heart rate integration
- Sleep tracking integration
- Goal setting and achievements
- Social sharing

### 2. **Data Analytics**
- Weekly/monthly reports
- Activity trends
- Performance insights
- Health recommendations

### 3. **Device Integration**
- Smartwatch sync
- Wearable sensors
- IoT device support
- Cross-platform sync

## Kesimpulan

Sistem deteksi aktivitas background PHC Mobile memberikan pengalaman yang seamless dan tidak mengganggu, sambil tetap memberikan data yang akurat dan relevan. Dengan optimasi baterai dan UI yang clean, pengguna dapat menikmati fitness tracking otomatis tanpa perlu khawatir tentang manual input atau notifikasi yang mengganggu.

Sistem ini dirancang untuk bekerja seperti Samsung Health namun dengan fokus pada kemudahan penggunaan dan efisiensi sumber daya, memberikan pengalaman yang optimal bagi pengguna yang ingin melacak aktivitas fitness mereka secara otomatis. 