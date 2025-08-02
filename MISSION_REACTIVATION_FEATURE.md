# Mission Reactivation Feature

## Overview
Fitur ini memungkinkan pengguna untuk mengaktifkan kembali misi yang sudah dibatalkan setelah masa cooldown 24 jam.

## Fitur Utama

### 1. Cooldown Period
- Misi yang dibatalkan memiliki masa cooldown 24 jam
- Pengguna tidak dapat mengaktifkan kembali misi sebelum masa cooldown selesai
- Timer real-time menampilkan sisa waktu cooldown

### 2. Reactivation Process
- Setelah 24 jam, misi dapat diaktifkan kembali
- Progress misi akan direset ke 0
- Status misi berubah dari "cancelled" ke "active"

### 3. UI Components

#### DailyMissionScreen
- Badge "Cancelled" untuk misi yang dibatalkan
- Informasi cooldown dengan timer real-time
- Indikator "Dapat diaktifkan kembali" setelah cooldown selesai

#### MissionDetailScreen
- Progress bar cooldown yang menunjukkan persentase waktu yang telah berlalu
- Tombol "Aktifkan Kembali" setelah cooldown selesai
- Pesan error yang informatif jika mencoba mengaktifkan sebelum waktunya

## API Endpoints

### Reactivate Mission
```
PUT /api/mobile/missions/reactivate/{userMissionId}
```

**Request Body:**
```json
{
  "user_id": "user_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mission berhasil diaktifkan kembali",
  "data": {
    "user_mission_id": "id",
    "status": "active"
  }
}
```

**Error Responses:**
- `Mission masih dalam masa cooldown. Tunggu X jam Y menit lagi`
- `Mission tidak dalam status dibatalkan`
- `User mission tidak ditemukan`

## Implementation Details

### Backend Requirements
1. Endpoint `/missions/reactivate/{userMissionId}`
2. Validasi status misi (harus "cancelled")
3. Validasi waktu cooldown (24 jam)
4. Update status misi ke "active"
5. Reset progress misi ke 0

### Frontend Implementation
1. **Timer System**: Real-time countdown untuk cooldown
2. **UI Updates**: Auto-refresh tampilan saat cooldown selesai
3. **Error Handling**: Pesan error yang user-friendly
4. **State Management**: Proper state updates setelah reactivation

### Mock API Support
- Mock API sudah mendukung fitur reactivation
- Simulasi cooldown 24 jam
- Error handling untuk berbagai skenario

## User Experience

### Flow Pengguna
1. User membatalkan misi → Status berubah ke "cancelled"
2. Timer cooldown mulai berjalan → UI menampilkan sisa waktu
3. Setelah 24 jam → Tombol "Aktifkan Kembali" muncul
4. User klik tombol → Misi diaktifkan kembali
5. Progress direset → User dapat mulai dari awal

### Visual Indicators
- **Red Badge**: Misi dibatalkan
- **Orange Timer**: Cooldown sedang berjalan
- **Green Button**: Dapat diaktifkan kembali
- **Progress Bar**: Persentase cooldown yang telah berlalu

## Testing Scenarios

### Valid Cases
- [ ] Misi dibatalkan → Timer mulai berjalan
- [ ] Setelah 24 jam → Tombol reactivate muncul
- [ ] Klik reactivate → Misi aktif kembali
- [ ] Progress direset ke 0

### Error Cases
- [ ] Coba reactivate sebelum 24 jam → Error message
- [ ] Misi tidak dalam status cancelled → Error message
- [ ] Network error → Fallback ke mock API
- [ ] Server error → Proper error handling

## Future Enhancements
1. **Custom Cooldown**: Mungkin berbeda untuk tiap jenis misi
2. **Notification**: Push notification saat cooldown selesai
3. **Analytics**: Track berapa kali misi di-reactivate
4. **Limits**: Batasan berapa kali misi dapat di-reactivate 