# Calorie Calculation Implementation - Complete System

## Overview

Sistem perhitungan kalori telah diimplementasikan secara lengkap dengan integrasi profil pengguna untuk memberikan estimasi kalori yang akurat berdasarkan berat badan pengguna yang sebenarnya. Sistem ini menggunakan rumus MET (Metabolic Equivalent of Task) yang mempertimbangkan kecepatan, durasi, dan berat badan pengguna.

## Komponen yang Diimplementasikan

### 1. **UserProfileService.ts** - Manajemen Profil Pengguna
```typescript
// Service untuk mengelola data profil pengguna
class UserProfileService {
  // Menyimpan dan mengambil data profil dari AsyncStorage
  async getUserProfile(): Promise<UserProfile | null>
  async saveUserProfile(profile: Partial<UserProfile>): Promise<boolean>
  
  // Fungsi khusus untuk kalori
  async getUserWeight(): Promise<number>
  async updateUserWeight(weight: number): Promise<boolean>
  
  // Fungsi tambahan untuk kesehatan
  async calculateBMI(): Promise<number | null>
  async calculateBMR(): Promise<number | null>
  async calculateTDEE(): Promise<number | null>
}
```

### 2. **ActivityDetectionService.ts** - Deteksi Aktivitas Otomatis
```typescript
// Service untuk deteksi aktivitas otomatis dengan perhitungan kalori
class ActivityDetectionService {
  // Perhitungan kalori dengan integrasi profil pengguna
  private async estimateCalories(activityType: string, durationSeconds: number, distanceMeters: number, speedMps?: number): Promise<number>
  
  // Perhitungan MET berdasarkan kecepatan
  private calculateMET(activityType: string, speedMps?: number, distanceKm?: number, durationHours?: number): number
  
  // Integrasi dengan UserProfileService
  private async getUserWeight(): Promise<number>
}
```

### 3. **FitnessIntegrationService.ts** - Tracking Manual
```typescript
// Service untuk tracking manual dengan perhitungan kalori
class FitnessIntegrationService {
  // Perhitungan kalori untuk tracking manual
  private async estimateCalories(activityType: string, durationSeconds: number, distanceMeters: number, speedMps?: number): Promise<number>
  
  // Perhitungan MET yang sama dengan ActivityDetectionService
  private calculateMET(activityType: string, speedMps?: number, distanceKm?: number, durationHours?: number): number
  
  // Integrasi dengan UserProfileService
  private async getUserWeight(): Promise<number>
}
```

## Rumus Kalori yang Diimplementasikan

### **Formula Dasar MET**
```
Calories = MET × Weight (kg) × Duration (hours)
```

### **MET Values Berdasarkan Aktivitas dan Kecepatan**

#### **Walking (Berjalan)**
| Kecepatan | MET Value | Deskripsi |
|-----------|-----------|-----------|
| < 2.0 mph | 2.0 | Berjalan sangat lambat |
| 2.0-2.5 mph | 2.5 | Berjalan lambat |
| 2.5-3.0 mph | 3.0 | Berjalan normal |
| 3.0-3.5 mph | 3.5 | Berjalan cepat |
| 3.5-4.0 mph | 4.0 | Berjalan sangat cepat |
| 4.0-4.5 mph | 4.5 | Berjalan power walking |
| > 4.5 mph | 5.0 | Power walking |

#### **Running (Lari)**
| Kecepatan | MET Value | Deskripsi |
|-----------|-----------|-----------|
| < 4.5 mph | 6.0 | Jogging |
| 4.5-5.2 mph | 8.0 | Lari 5.2 mph (8.4 km/h) |
| 5.2-6.0 mph | 9.0 | Lari 6.0 mph (9.7 km/h) |
| 6.0-6.7 mph | 10.0 | Lari 6.7 mph (10.8 km/h) |
| 6.7-7.5 mph | 11.0 | Lari 7.5 mph (12.1 km/h) |
| 7.5-8.3 mph | 12.0 | Lari 8.3 mph (13.4 km/h) |
| 8.3-9.0 mph | 13.0 | Lari 9.0 mph (14.5 km/h) |
| > 9.0 mph | 14.0 | Lari cepat |

#### **Cycling (Bersepeda)**
| Kecepatan | MET Value | Deskripsi |
|-----------|-----------|-----------|
| < 10 km/h | 4.0 | Bersepeda sangat lambat |
| 10-12 km/h | 5.0 | Bersepeda lambat |
| 12-14 km/h | 6.0 | Bersepeda sedang |
| 14-16 km/h | 8.0 | Bersepeda 12-13.9 mph |
| 16-18 km/h | 10.0 | Bersepeda 14-15.9 mph |
| 18-20 km/h | 12.0 | Bersepeda 16-17.9 mph |
| 20-22 km/h | 14.0 | Bersepeda 18-19.9 mph |
| > 22 km/h | 16.0 | Bersepeda cepat |

## Implementasi Kode Lengkap

### 1. **Perhitungan MET**
```typescript
private calculateMET(activityType: string, speedMps?: number, distanceKm?: number, durationHours?: number): number {
  if (!speedMps && distanceKm && durationHours) {
    speedMps = (distanceKm * 1000) / (durationHours * 3600);
  }

  const speedMph = speedMps ? speedMps * 2.237 : 0; // Convert m/s to mph
  const speedKmh = speedMps ? speedMps * 3.6 : 0; // Convert m/s to km/h

  switch (activityType) {
    case 'walking':
      if (speedMph < 2.0) return 2.0;
      if (speedMph < 2.5) return 2.5;
      if (speedMph < 3.0) return 3.0;
      if (speedMph < 3.5) return 3.5;
      if (speedMph < 4.0) return 4.0;
      if (speedMph < 4.5) return 4.5;
      return 5.0;

    case 'running':
      if (speedMph < 4.5) return 6.0;
      if (speedMph < 5.2) return 8.0;
      if (speedMph < 6.0) return 9.0;
      if (speedMph < 6.7) return 10.0;
      if (speedMph < 7.5) return 11.0;
      if (speedMph < 8.3) return 12.0;
      if (speedMph < 9.0) return 13.0;
      return 14.0;

    case 'cycling':
      if (speedKmh < 10) return 4.0;
      if (speedKmh < 12) return 5.0;
      if (speedKmh < 14) return 6.0;
      if (speedKmh < 16) return 8.0;
      if (speedKmh < 18) return 10.0;
      if (speedKmh < 20) return 12.0;
      if (speedKmh < 22) return 14.0;
      return 16.0;

    default:
      return 3.5;
  }
}
```

### 2. **Perhitungan Kalori dengan Profil Pengguna**
```typescript
private async estimateCalories(activityType: string, durationSeconds: number, distanceMeters: number, speedMps?: number): Promise<number> {
  const durationHours = durationSeconds / 3600;
  const distanceKm = distanceMeters / 1000;
  
  // Get user weight from UserProfileService
  const weightKg = await this.getUserWeight();
  
  // Calculate MET based on activity type and speed
  let met = this.calculateMET(activityType, speedMps, distanceKm, durationHours);
  
  // Apply formula: Calories = MET × Weight (kg) × Duration (hours)
  const calories = met * weightKg * durationHours;
  
  return Math.round(calories);
}

private async getUserWeight(): Promise<number> {
  try {
    const UserProfileService = (await import('./UserProfileService')).default;
    return await UserProfileService.getUserWeight();
  } catch (error) {
    console.error('Failed to get user weight:', error);
    return 70; // Default weight
  }
}
```

## Contoh Perhitungan

### **Contoh 1: Walking (Berjalan)**
- **Berat Pengguna**: 65 kg (dari profil)
- **Durasi**: 45 menit (0.75 jam)
- **Kecepatan**: 3.2 mph (brisk walking)
- **MET**: 3.5
- **Kalori**: 3.5 × 65 × 0.75 = **170.6 kalori**

### **Contoh 2: Running (Lari)**
- **Berat Pengguna**: 70 kg (dari profil)
- **Durasi**: 30 menit (0.5 jam)
- **Kecepatan**: 6.5 mph (moderate running)
- **MET**: 10.0
- **Kalori**: 10.0 × 70 × 0.5 = **350 kalori**

### **Contoh 3: Cycling (Bersepeda)**
- **Berat Pengguna**: 75 kg (dari profil)
- **Durasi**: 60 menit (1 jam)
- **Kecepatan**: 18 km/h (moderate cycling)
- **MET**: 10.0
- **Kalori**: 10.0 × 75 × 1 = **750 kalori**

## Integrasi dengan UI

### 1. **RealtimeFitnessScreen**
- Menampilkan kalori real-time saat tracking
- Update otomatis setiap 10 detik
- Menampilkan MET value yang digunakan

### 2. **ActivityStatusCard**
- Menampilkan kalori dari background detection
- Update otomatis setiap 30 detik
- Menampilkan total kalori hari ini

### 3. **MainScreen**
- Menampilkan kalori di Today's Summary
- Data dari background detection
- Update otomatis

## Keunggulan Implementasi

### ✅ **Akurat**
- Menggunakan MET values berdasarkan penelitian ilmiah
- Mempertimbangkan kecepatan aktivitas
- Berat badan pengguna yang sebenarnya

### ✅ **Dinamis**
- Menyesuaikan dengan kecepatan GPS
- Update real-time
- Klasifikasi aktivitas otomatis

### ✅ **Terintegrasi**
- Profil pengguna terintegrasi
- Background dan manual tracking
- Data tersimpan di backend

### ✅ **Optimized**
- Async/await untuk performa
- Error handling yang robust
- Fallback ke default values

### ✅ **Extensible**
- Mudah menambah aktivitas baru
- MET values dapat dikustomisasi
- Formula dapat diperluas

## Testing dan Validasi

### 1. **Unit Tests**
```typescript
// Test MET calculation
test('walking MET calculation', () => {
  const met = calculateMET('walking', 1.5); // 3.36 mph
  expect(met).toBe(3.5);
});

// Test calorie calculation
test('calorie calculation with user weight', async () => {
  const calories = await estimateCalories('running', 1800, 3000, 1.67); // 30 min, 3km, 6 mph
  expect(calories).toBeCloseTo(315, 0); // Expected: ~315 calories for 70kg user
});
```

### 2. **Real-world Validation**
- Bandingkan dengan smartwatch data
- Validasi dengan aplikasi fitness lain
- User feedback untuk akurasi

## Future Enhancements

### 1. **Heart Rate Integration**
```typescript
// More accurate calculation using heart rate
private estimateCaloriesWithHeartRate(activityType: string, durationSeconds: number, heartRate: number): number {
  // Formula: Calories = (Heart Rate × 0.63 - 55) × Weight × Duration
}
```

### 2. **Terrain and Elevation**
```typescript
// Consider elevation changes
private calculateMETWithElevation(activityType: string, speedMps: number, elevationGain: number): number {
  // Adjust MET based on elevation gain
}
```

### 3. **Personalized MET Values**
```typescript
// User-specific MET calibration
private getPersonalizedMET(activityType: string, userFitnessLevel: string): number {
  // Adjust MET based on user's fitness level
}
```

## Kesimpulan

Implementasi sistem perhitungan kalori telah selesai dengan fitur-fitur berikut:

🎯 **Rumus MET yang Akurat**: Menggunakan MET values berdasarkan penelitian ilmiah
👤 **Integrasi Profil Pengguna**: Berat badan pengguna yang sebenarnya
⚡ **Real-time Calculation**: Update otomatis saat tracking
🔄 **Background Processing**: Deteksi otomatis dengan perhitungan kalori
📱 **UI Integration**: Tampilan kalori di semua screen yang relevan
🛡️ **Error Handling**: Robust error handling dengan fallback values
📊 **Data Persistence**: Data tersimpan di backend untuk analisis

Sistem ini memberikan estimasi kalori yang akurat dan dapat diandalkan untuk aktivitas fitness, dengan kemungkinan pengembangan lebih lanjut untuk fitur-fitur advanced seperti heart rate monitoring dan personalized MET values. 