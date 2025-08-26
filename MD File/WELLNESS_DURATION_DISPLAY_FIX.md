# Wellness Duration Display Fix

## Problem Description

Pada halaman wellness app, durasi program menunjukkan 30 hari sedangkan user hanya mengikuti program selama 13 hari. Hal ini menyebabkan kebingungan karena tidak ada perbedaan yang jelas antara durasi target program dan hari aktual berpartisipasi user.

## Root Cause

Sistem sebelumnya hanya menampilkan `wellness_program_duration` (durasi target program) tanpa menampilkan informasi berapa hari user sebenarnya telah berpartisipasi dalam program wellness.

## Solution Implemented

### 1. Enhanced API Endpoints

#### Updated: `dash-app/app/api/mobile/wellness-progress/[id]/route.js`
- Menambahkan perhitungan `days_since_joining` berdasarkan `wellness_join_date`
- Menambahkan perhitungan `days_remaining` (sisa hari dalam program)
- Mengembalikan field baru dalam response API

#### Updated: `dash-app/app/api/mobile/wellness-progress/route.js`
- Menambahkan perhitungan yang sama untuk list user
- Setiap user dalam list sekarang memiliki informasi hari berpartisipasi

#### Updated: `dash-app/app/api/mobile/wellness/status/route.js`
- Menambahkan perhitungan `days_since_joining` dan `days_remaining`
- Konsisten dengan endpoint wellness progress lainnya

### 2. Enhanced Frontend Display

#### Updated: `dash-app/app/mobile/wellness-progress/page.js`
- Menambahkan kolom "Hari Berpartisipasi" yang menampilkan hari aktual user berpartisipasi
- Menambahkan kolom "Sisa Hari" yang menampilkan sisa waktu program
- Tetap menampilkan "Durasi Program" sebagai informasi target durasi
- Menambahkan informasi hari berpartisipasi di user list

### 3. Calculation Logic

```javascript
// Calculate actual days since joining wellness program
let daysSinceJoining = 0;
if (user.wellness_join_date) {
  const joinDate = new Date(user.wellness_join_date);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - joinDate.getTime());
  daysSinceJoining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate remaining days in program
let daysRemaining = 0;
if (user.wellness_program_duration && daysSinceJoining > 0) {
  daysRemaining = Math.max(0, user.wellness_program_duration - daysSinceJoining);
}
```

## Display Information

Sekarang halaman wellness progress menampilkan informasi yang lebih lengkap:

1. **Durasi Program**: Target durasi program (misal: 30 hari)
2. **Hari Berpartisipasi**: Hari aktual user telah berpartisipasi (misal: 13 hari)
3. **Sisa Hari**: Sisa waktu dalam program (misal: 17 hari)

## Benefits

1. **Clarity**: User dapat melihat perbedaan antara target durasi dan hari aktual berpartisipasi
2. **Progress Tracking**: User dapat melihat progress mereka dalam program
3. **Motivation**: User dapat melihat sisa waktu untuk menyelesaikan program
4. **Consistency**: Semua endpoint wellness menggunakan perhitungan yang sama

## Testing

Script test telah dibuat di `scripts/test-wellness-duration-fix.js` untuk memverifikasi:
- Perhitungan hari berpartisipasi yang akurat
- Perhitungan sisa hari yang benar
- Konsistensi data antar endpoint

## Files Modified

### Backend
- `dash-app/app/api/mobile/wellness-progress/[id]/route.js`
- `dash-app/app/api/mobile/wellness-progress/route.js`
- `dash-app/app/api/mobile/wellness/status/route.js`

### Frontend
- `dash-app/app/mobile/wellness-progress/page.js`

### Testing
- `scripts/test-wellness-duration-fix.js`

## Example Output

**Sebelum:**
```
Durasi Program: 30 hari
```

**Sesudah:**
```
Durasi Program: 30 hari
Hari Berpartisipasi: 13 hari
Sisa Hari: 17 hari
```

## Deployment Notes

1. **No Database Changes**: Tidak ada perubahan schema database
2. **Backward Compatible**: API tetap kompatibel dengan versi sebelumnya
3. **Automatic Calculation**: Perhitungan dilakukan secara otomatis di backend
4. **Real-time Updates**: Data diupdate secara real-time berdasarkan tanggal hari ini
