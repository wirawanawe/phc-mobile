# Auto Activity Detection System - Samsung Health Style

## Overview

Sistem deteksi aktivitas otomatis PHC Mobile dirancang untuk bekerja seperti Samsung Health, yang secara otomatis mendeteksi dan melacak aktivitas fitness pengguna tanpa perlu interaksi manual. Sistem ini menggunakan kombinasi GPS, sensor gerakan, dan algoritma machine learning untuk mengidentifikasi berbagai jenis aktivitas.

## Fitur Utama

### 1. **Automatic Activity Detection**
- Deteksi otomatis walking, running, cycling
- Tidak perlu manual start/stop
- Berdasarkan pola gerakan dan kecepatan
- Confidence level untuk akurasi

### 2. **Real-time Monitoring**
- Monitoring berkelanjutan 24/7
- Update data setiap 5 detik
- Deteksi perubahan aktivitas secara real-time
- Auto-start dan auto-stop tracking

### 3. **Smart Pattern Recognition**
- Analisis pola gerakan
- Perhitungan kecepatan dan akselerasi
- Deteksi langkah berdasarkan GPS
- Klasifikasi aktivitas berdasarkan MET values

## Cara Kerja Sistem

### 1. **Location Tracking**
```typescript
// GPS tracking dengan akurasi tinggi
Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 1000, // Update setiap detik
    distanceInterval: 5, // Update setiap 5 meter
  },
  (location) => {
    handleLocationUpdate(location);
  }
);
```

### 2. **Step Detection Algorithm**
```typescript
// Deteksi langkah berdasarkan pola gerakan
private detectSteps(location: Location.LocationObject): void {
  const distance = calculateDistance(previous, current);
  const timeDiff = (current.timestamp - previous.timestamp) / 1000;
  
  // Pola langkah: 0.5-2 meter dalam 0.5-2 detik
  if (distance > 0.5 && distance < 2.0 && 
      timeDiff > 0.5 && timeDiff < 2.0) {
    if (timeSinceLastStep > 0.3) { // Minimum 0.3 detik antar langkah
      this.stepCount++;
    }
  }
}
```

### 3. **Activity Classification**
```typescript
// Klasifikasi aktivitas berdasarkan kecepatan dan pola
const activityPatterns = {
  walking: {
    minSpeed: 0.5, // 1.8 km/h
    maxSpeed: 2.0, // 7.2 km/h
    stepPattern: 'regular',
    accelerationPattern: 'moderate',
  },
  running: {
    minSpeed: 2.0, // 7.2 km/h
    maxSpeed: 6.0, // 21.6 km/h
    stepPattern: 'fast',
    accelerationPattern: 'high',
  },
  cycling: {
    minSpeed: 2.5, // 9 km/h
    maxSpeed: 15.0, // 54 km/h
    stepPattern: 'minimal',
    accelerationPattern: 'smooth',
  },
};
```

## Implementasi UI

### 1. **ActivityStatusCard Component**
Komponen yang menampilkan status aktivitas di MainScreen:

```typescript
// Tiga state utama:
// 1. Disabled - Belum diaktifkan
// 2. Monitoring - Sedang memantau
// 3. Active - Aktivitas terdeteksi
```

### 2. **Real-time Metrics Display**
- Durasi aktivitas
- Jarak tempuh
- Jumlah langkah
- Kalori terbakar
- Kecepatan real-time
- Jumlah titik GPS

### 3. **Visual Indicators**
- Icon aktivitas (walk/run/bike)
- Warna berdasarkan jenis aktivitas
- Status "Live" untuk aktivitas aktif
- Progress bar untuk durasi

## Konfigurasi Sistem

### 1. **Detection Parameters**
```typescript
const config: ActivityDetectionConfig = {
  minDuration: 30, // Minimum 30 detik untuk dianggap aktivitas
  minDistance: 50, // Minimum 50 meter
  minSteps: 20, // Minimum 20 langkah
  confidenceThreshold: 70, // 70% confidence untuk auto-start
  autoStartEnabled: true,
  autoStopEnabled: true,
  stationaryTimeout: 300, // 5 menit untuk auto-stop
};
```

### 2. **Speed Thresholds**
- **Walking**: 0.5 - 2.0 m/s (1.8 - 7.2 km/h)
- **Running**: 2.0 - 6.0 m/s (7.2 - 21.6 km/h)
- **Cycling**: 2.5 - 15.0 m/s (9 - 54 km/h)

### 3. **Pattern Analysis**
- **Regularity**: Konsistensi kecepatan
- **Acceleration**: Pola akselerasi
- **Step Frequency**: Frekuensi langkah
- **Movement Smoothness**: Kelancaran gerakan

## Event System

### 1. **Activity Events**
```typescript
// Event yang dipancarkan oleh sistem
ActivityDetectionService.on('activity_started', (activity) => {
  // Aktivitas baru terdeteksi
});

ActivityDetectionService.on('activity_updated', (activity) => {
  // Update data aktivitas
});

ActivityDetectionService.on('activity_stopped', (activity) => {
  // Aktivitas berakhir
});
```

### 2. **UI Updates**
- Real-time update metrics
- Visual feedback untuk status
- Notifikasi aktivitas terdeteksi
- Auto-save data ke backend

## Integrasi dengan MainScreen

### 1. **ActivityStatusCard Placement**
```typescript
// Ditampilkan di atas Quick Actions
<ActivityStatusCard onPress={() => navigation.navigate("RealtimeFitness")} />
```

### 2. **Quick Actions Update**
- Fitness Tracking sebagai action pertama
- Icon radar untuk menandakan auto-detection
- Warna hijau untuk menonjolkan fitur

### 3. **Navigation Flow**
```
MainScreen → ActivityStatusCard → RealtimeFitnessScreen
```

## Keunggulan Sistem

### 1. **User Experience**
- **Zero Manual Input**: Tidak perlu start/stop manual
- **Seamless Integration**: Terintegrasi dengan UI utama
- **Real-time Feedback**: Update langsung di MainScreen
- **Smart Notifications**: Notifikasi aktivitas terdeteksi

### 2. **Accuracy**
- **GPS Precision**: Akurasi navigasi untuk tracking
- **Pattern Recognition**: Algoritma canggih untuk klasifikasi
- **Confidence Scoring**: Level kepercayaan untuk setiap deteksi
- **Multi-factor Analysis**: Kombinasi kecepatan, pola, dan langkah

### 3. **Battery Efficiency**
- **Optimized Intervals**: Update setiap 5 detik untuk efisiensi
- **Smart Location**: Hanya tracking saat diperlukan
- **Background Processing**: Minimal impact pada performa

## Perbandingan dengan Samsung Health

### 1. **Similarities**
- ✅ Auto-detection walking/running/cycling
- ✅ Real-time GPS tracking
- ✅ Step counting
- ✅ Calorie estimation
- ✅ Activity classification
- ✅ Auto-start/stop

### 2. **Enhancements**
- 🚀 Confidence scoring system
- 🚀 Pattern analysis algorithms
- 🚀 Real-time UI updates
- 🚀 Integration with health missions
- 🚀 Comprehensive activity data

## Troubleshooting

### 1. **Detection Issues**
- **Problem**: Aktivitas tidak terdeteksi
- **Solution**: Periksa location permissions, pastikan GPS aktif

### 2. **Accuracy Issues**
- **Problem**: Deteksi tidak akurat
- **Solution**: Tunggu 30 detik untuk kalibrasi, pastikan area GPS baik

### 3. **Battery Drain**
- **Problem**: Baterai cepat habis
- **Solution**: Sistem sudah dioptimasi, gunakan power saving mode

## Pengembangan Selanjutnya

### 1. **Advanced Features**
- Heart rate integration
- Elevation tracking
- Route visualization
- Social sharing
- Achievement system

### 2. **Machine Learning**
- Personalized activity patterns
- Predictive analytics
- Smart goal setting
- Performance optimization

### 3. **Device Integration**
- Smartwatch sync
- Wearable sensors
- IoT device support
- Cross-platform sync

## Kesimpulan

Sistem deteksi aktivitas otomatis PHC Mobile memberikan pengalaman yang setara dengan Samsung Health, dengan tambahan fitur canggih seperti confidence scoring dan real-time UI updates. Sistem ini dirancang untuk memberikan kemudahan maksimal bagi pengguna sambil tetap mempertahankan akurasi dan efisiensi baterai.

Dengan implementasi ini, pengguna dapat fokus pada aktivitas fitness mereka tanpa perlu khawatir tentang manual tracking, sementara aplikasi secara otomatis mencatat dan menganalisis setiap gerakan mereka. 