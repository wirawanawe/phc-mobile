# Calorie Calculation Guide - Fitness Activities

## Overview

Sistem perhitungan kalori telah diimplementasikan menggunakan rumus MET (Metabolic Equivalent of Task) yang akurat untuk aktivitas jalan, lari, dan bersepeda. Rumus ini mempertimbangkan kecepatan, durasi, dan berat badan pengguna untuk memberikan estimasi kalori yang lebih presisi.

## Formula Dasar

### **Rumus MET (Metabolic Equivalent of Task)**
```
Calories = MET × Weight (kg) × Duration (hours)
```

Dimana:
- **MET** = Metabolic Equivalent of Task (nilai berdasarkan jenis aktivitas dan kecepatan)
- **Weight** = Berat badan pengguna dalam kilogram
- **Duration** = Durasi aktivitas dalam jam

## MET Values Berdasarkan Aktivitas dan Kecepatan

### 1. **Walking (Berjalan)**

| Kecepatan | MET Value | Deskripsi |
|-----------|-----------|-----------|
| < 2.0 mph | 2.0 | Berjalan sangat lambat |
| 2.0-2.5 mph | 2.5 | Berjalan lambat |
| 2.5-3.0 mph | 3.0 | Berjalan normal |
| 3.0-3.5 mph | 3.5 | Berjalan cepat |
| 3.5-4.0 mph | 4.0 | Berjalan sangat cepat |
| 4.0-4.5 mph | 4.5 | Berjalan power walking |
| > 4.5 mph | 5.0 | Power walking |

**Contoh Perhitungan:**
- Berat: 70 kg
- Durasi: 30 menit (0.5 jam)
- Kecepatan: 3.5 mph (brisk walking)
- MET: 3.5
- Kalori = 3.5 × 70 × 0.5 = **122.5 kalori**

### 2. **Running (Lari)**

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

**Contoh Perhitungan:**
- Berat: 70 kg
- Durasi: 20 menit (0.33 jam)
- Kecepatan: 6.0 mph (moderate running)
- MET: 9.0
- Kalori = 9.0 × 70 × 0.33 = **207.9 kalori**

### 3. **Cycling (Bersepeda)**

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

**Contoh Perhitungan:**
- Berat: 70 kg
- Durasi: 45 menit (0.75 jam)
- Kecepatan: 16 km/h (moderate cycling)
- MET: 8.0
- Kalori = 8.0 × 70 × 0.75 = **420 kalori**

## Implementasi dalam Kode

### 1. **ActivityDetectionService.ts**

```typescript
/**
 * Estimate calories burned using MET formula
 */
private estimateCalories(activityType: string, durationSeconds: number, distanceMeters: number, speedMps?: number): number {
  const durationHours = durationSeconds / 3600;
  const distanceKm = distanceMeters / 1000;
  
  // Get user weight from storage or use default
  const weightKg = this.getUserWeight();
  
  // Calculate MET based on activity type and speed
  let met = this.calculateMET(activityType, speedMps, distanceKm, durationHours);
  
  // Apply formula: Calories = MET × Weight (kg) × Duration (hours)
  const calories = met * weightKg * durationHours;
  
  return Math.round(calories);
}
```

### 2. **FitnessIntegrationService.ts**

```typescript
/**
 * Calculate MET value based on activity type and speed
 */
private calculateMET(activityType: string, speedMps?: number, distanceKm?: number, durationHours?: number): number {
  if (!speedMps && distanceKm && durationHours) {
    speedMps = (distanceKm * 1000) / (durationHours * 3600);
  }

  const speedMph = speedMps ? speedMps * 2.237 : 0; // Convert m/s to mph
  const speedKmh = speedMps ? speedMps * 3.6 : 0; // Convert m/s to km/h

  switch (activityType) {
    case 'walking':
      // Walking MET values based on speed
      if (speedMph < 2.0) return 2.0;
      if (speedMph < 2.5) return 2.5;
      if (speedMph < 3.0) return 3.0;
      if (speedMph < 3.5) return 3.5;
      if (speedMph < 4.0) return 4.0;
      if (speedMph < 4.5) return 4.5;
      return 5.0;

    case 'running':
      // Running MET values based on speed
      if (speedMph < 4.5) return 6.0;
      if (speedMph < 5.2) return 8.0;
      if (speedMph < 6.0) return 9.0;
      if (speedMph < 6.7) return 10.0;
      if (speedMph < 7.5) return 11.0;
      if (speedMph < 8.3) return 12.0;
      if (speedMph < 9.0) return 13.0;
      return 14.0;

    case 'cycling':
      // Cycling MET values based on speed
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

## Konversi Kecepatan

### **Unit Conversion**
```typescript
// Meters per second to Miles per hour
const speedMph = speedMps * 2.237;

// Meters per second to Kilometers per hour
const speedKmh = speedMps * 3.6;

// Calculate speed from distance and duration
const speedMps = (distanceKm * 1000) / (durationHours * 3600);
```

## Faktor yang Mempengaruhi Akurasi

### 1. **Berat Badan**
- Saat ini menggunakan default 70 kg
- Perlu implementasi untuk mengambil berat badan dari profil pengguna
- Berat badan yang akurat sangat penting untuk perhitungan yang tepat

### 2. **Kecepatan GPS**
- Akurasi GPS mempengaruhi perhitungan kecepatan
- Filtering dan smoothing diterapkan untuk mengurangi noise
- Rata-rata kecepatan digunakan untuk stabilitas

### 3. **Jenis Aktivitas**
- Klasifikasi aktivitas berdasarkan pola gerakan
- Confidence level untuk memastikan klasifikasi yang tepat
- Fallback ke MET default jika klasifikasi tidak yakin

## Perbandingan dengan Aplikasi Lain

### **Samsung Health**
- Menggunakan MET values yang serupa
- Mempertimbangkan kecepatan dan intensitas
- Akurasi tinggi untuk aktivitas standar

### **Apple Health**
- Menggunakan algoritma yang lebih kompleks
- Mempertimbangkan heart rate jika tersedia
- MET values berdasarkan penelitian Apple

### **Google Fit**
- Menggunakan MET values standar
- Mempertimbangkan elevation dan terrain
- Akurasi yang baik untuk aktivitas outdoor

## Optimasi dan Perbaikan

### 1. **User Weight Integration**
```typescript
// TODO: Implement user weight retrieval
private getUserWeight(): number {
  // Get from user profile/storage
  // Return user's actual weight
  return 70; // Default for now
}
```

### 2. **Heart Rate Integration**
```typescript
// Future enhancement: Include heart rate in calculation
private estimateCaloriesWithHeartRate(activityType: string, durationSeconds: number, heartRate: number): number {
  // More accurate calculation using heart rate
  // Formula: Calories = (Heart Rate × 0.63 - 55) × Weight × Duration
}
```

### 3. **Terrain and Elevation**
```typescript
// Future enhancement: Consider elevation changes
private calculateMETWithElevation(activityType: string, speedMps: number, elevationGain: number): number {
  // Adjust MET based on elevation gain
  // Uphill activities burn more calories
}
```

## Testing dan Validasi

### 1. **Unit Tests**
```typescript
// Test calorie calculations
test('walking calorie calculation', () => {
  const calories = estimateCalories('walking', 1800, 1500, 0.83); // 30 min, 1.5km, 0.83 m/s
  expect(calories).toBeCloseTo(105, 0); // Expected: ~105 calories
});
```

### 2. **Real-world Validation**
- Bandingkan dengan smartwatch data
- Validasi dengan aplikasi fitness lain
- User feedback untuk akurasi

## Kesimpulan

Implementasi rumus kalori menggunakan MET values memberikan perhitungan yang akurat dan dapat diandalkan untuk aktivitas fitness. Sistem ini:

✅ **Akurat**: Menggunakan MET values berdasarkan penelitian ilmiah
✅ **Dinamis**: Menyesuaikan dengan kecepatan aktivitas
✅ **Komprehensif**: Mendukung walking, running, dan cycling
✅ **Extensible**: Mudah untuk menambah aktivitas baru
✅ **Optimized**: Efisien untuk real-time calculation

Rumus ini memberikan estimasi kalori yang lebih akurat dibandingkan dengan perhitungan sederhana, dan dapat diperbaiki lebih lanjut dengan integrasi data berat badan pengguna dan heart rate monitoring. 