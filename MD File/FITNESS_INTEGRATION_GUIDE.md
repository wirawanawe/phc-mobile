# Fitness Integration Guide - Smartwatch & GPS Integration

## Overview

Aplikasi PHC Mobile dapat diintegrasikan dengan perangkat smartwatch dan GPS smartphone untuk mendapatkan data walking dan running secara realtime. Implementasi ini memungkinkan pengguna untuk melacak aktivitas fitness mereka dengan akurasi tinggi menggunakan berbagai sumber data.

## Fitur Utama

### 1. **Real-time GPS Tracking**
- Pelacakan lokasi dengan akurasi tinggi
- Perhitungan jarak menggunakan formula Haversine
- Update data setiap detik
- Penyimpanan koordinat GPS untuk analisis rute

### 2. **Smartwatch Integration**
- **Apple HealthKit** (iOS)
- **Google Fit** (Android)
- **Samsung Health** (Android)
- Sinkronisasi data steps, heart rate, dan kalori

### 3. **Automatic Data Sync**
- Sinkronisasi otomatis setiap 10 detik
- Penyimpanan data ke backend secara realtime
- Backup data lokal untuk koneksi yang tidak stabil

## Implementasi Teknis

### Dependencies yang Diperlukan

```json
{
  "expo-location": "~18.0.0",
  "expo-health-kit": "~5.0.0",
  "react-native-google-fit": "^0.3.0",
  "react-native-samsung-health": "^1.0.0"
}
```

### Struktur Data

```typescript
interface FitnessData {
  steps: number;
  distance: number;
  calories: number;
  heartRate?: number;
  pace?: number;
  duration: number;
  activityType: 'walking' | 'running' | 'cycling';
  coordinates?: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
  }>;
}
```

## Cara Kerja

### 1. **GPS Tracking**
```typescript
// Memulai GPS tracking
const startGPSTracking = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') {
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000, // Update setiap detik
        distanceInterval: 5, // Update setiap 5 meter
      },
      (location) => {
        // Proses data lokasi realtime
        updateFitnessData(location);
      }
    );
  }
};
```

### 2. **Smartwatch Integration**

#### Apple HealthKit (iOS)
```typescript
import HealthKit from 'expo-health-kit';

const connectAppleHealth = async () => {
  const permissions = {
    read: [
      HealthKit.PermissionKind.Steps,
      HealthKit.PermissionKind.DistanceWalkingRunning,
      HealthKit.PermissionKind.ActiveEnergyBurned,
      HealthKit.PermissionKind.HeartRate
    ]
  };
  
  const granted = await HealthKit.requestPermissionsAsync(permissions);
  return granted;
};
```

#### Google Fit (Android)
```typescript
import { GoogleFit } from 'react-native-google-fit';

const connectGoogleFit = async () => {
  const authorized = await GoogleFit.authorize();
  if (authorized) {
    const steps = await GoogleFit.getSteps();
    const distance = await GoogleFit.getDistance();
    const calories = await GoogleFit.getCalories();
  }
};
```

### 3. **Data Processing**

#### Perhitungan Jarak
```typescript
private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
```

#### Estimasi Kalori
```typescript
private estimateCalories(activityType: string, durationSeconds: number, distanceMeters: number): number {
  const durationHours = durationSeconds / 3600;
  
  // MET values for different activities
  const metValues = {
    walking: 3.5,
    running: 8.0,
    cycling: 6.0,
  };

  const met = metValues[activityType] || 3.5;
  const weightKg = 70; // User's weight

  // Calories = MET × weight (kg) × duration (hours)
  return Math.round(met * weightKg * durationHours);
}
```

## Penggunaan Aplikasi

### 1. **Memulai Session**
1. Buka aplikasi PHC Mobile
2. Navigasi ke "Fitness Tracking"
3. Klik "Start Real-time Tracking"
4. Pilih jenis aktivitas (Walking/Running/Cycling)
5. Klik "Start Session"

### 2. **Selama Tracking**
- Aplikasi akan menampilkan data realtime:
  - Durasi aktivitas
  - Jarak tempuh
  - Jumlah langkah
  - Kalori terbakar
  - Jumlah titik GPS yang dilacak

### 3. **Mengakhiri Session**
1. Klik "Stop Session"
2. Data akan disimpan otomatis ke backend
3. Ringkasan session akan ditampilkan

## Keunggulan Implementasi

### 1. **Akurasi Tinggi**
- GPS dengan akurasi navigasi
- Perhitungan jarak menggunakan formula Haversine
- Estimasi kalori berdasarkan MET values

### 2. **Real-time Sync**
- Data tersinkronisasi setiap 10 detik
- Backup lokal untuk koneksi tidak stabil
- Penyimpanan otomatis saat session berakhir

### 3. **Multi-device Support**
- Smartphone GPS
- Apple Watch (iOS)
- Google Fit (Android)
- Samsung Health (Android)

### 4. **User Experience**
- Interface yang intuitif
- Visualisasi data realtime
- Notifikasi status koneksi device
- Instruksi penggunaan yang jelas

## Persyaratan Sistem

### iOS
- iOS 13.0 atau lebih baru
- Location Services enabled
- HealthKit permissions (untuk Apple Watch)

### Android
- Android 6.0 (API level 23) atau lebih baru
- Location permissions
- Google Fit app (untuk Google Fit integration)

## Troubleshooting

### 1. **GPS Tidak Berfungsi**
- Pastikan Location Services diaktifkan
- Periksa permission location di settings
- Pastikan berada di area dengan sinyal GPS yang baik

### 2. **Smartwatch Tidak Terhubung**
- Pastikan smartwatch terhubung dengan smartphone
- Periksa permission HealthKit/Google Fit
- Restart aplikasi jika diperlukan

### 3. **Data Tidak Tersinkronisasi**
- Periksa koneksi internet
- Pastikan backend server berjalan
- Cek log error di console

## Keamanan dan Privasi

### 1. **Data Protection**
- Data GPS hanya disimpan selama session aktif
- Koordinat tidak dibagikan ke pihak ketiga
- Enkripsi data saat transmisi

### 2. **User Consent**
- Permission request untuk location services
- Consent untuk akses health data
- Opsi untuk menghapus data tracking

### 3. **Compliance**
- Mematuhi GDPR untuk data privacy
- Implementasi data retention policy
- Audit trail untuk akses data

## Pengembangan Selanjutnya

### 1. **Fitur Tambahan**
- Route visualization dengan peta
- Social sharing untuk achievements
- Integration dengan fitness apps lain
- AI-powered workout recommendations

### 2. **Analytics**
- Detailed workout analytics
- Progress tracking over time
- Performance comparison
- Goal setting and achievement

### 3. **Device Support**
- Garmin Connect integration
- Fitbit integration
- Polar Flow integration
- Strava integration

## Kesimpulan

Implementasi fitness integration ini memberikan pengguna PHC Mobile kemampuan untuk melacak aktivitas fitness mereka dengan akurasi tinggi menggunakan GPS smartphone dan data dari smartwatch. Sistem ini dirancang untuk memberikan pengalaman yang seamless dengan sinkronisasi realtime dan penyimpanan data yang aman.

Dengan fitur ini, aplikasi dapat bersaing dengan aplikasi fitness terkemuka sambil tetap mempertahankan fokus pada kesehatan holistik yang menjadi nilai utama PHC Mobile. 