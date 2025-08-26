# Test Update Progress Guide

## 🎯 Langkah-langkah Test Update Progress

### 1. Persiapan
```bash
# Clear logs terlebih dahulu
./scripts/debug-mission-update.sh clear

# Monitor logs untuk melihat debugging info
./scripts/debug-mission-update.sh monitor
```

### 2. Test di Aplikasi

#### Step 1: Buka Aplikasi
1. Pastikan aplikasi sudah berjalan di emulator/device
2. Login ke aplikasi
3. Navigasi ke halaman mission (Dashboard atau Daily Mission)

#### Step 2: Pilih Mission
1. Pilih mission yang ingin di-update progress
2. Pastikan mission status adalah "active" atau "accepted"
3. Klik mission untuk membuka detail

#### Step 3: Test Update Progress
1. Di halaman detail mission, masukkan nilai progress
2. Klik tombol "Update Progress"
3. Perhatikan console logs untuk debugging info

### 3. Expected Behavior

#### ✅ Jika Berhasil:
- Tidak ada error alert
- Progress berhasil di-update
- Status mission berubah sesuai progress
- Jika 100%, mission menjadi completed

#### ❌ Jika Masih Error:
- Perhatikan console logs untuk debugging info
- Error akan menunjukkan detail masalah

### 4. Debugging Info yang Harus Diperhatikan

#### Console Logs yang Penting:
```
🔍 handleUpdateProgress called (New)
🔍 Current userMission: { ... }
🔍 User Mission user_mission_id: 1
🔍 Final userMissionId to use: 1
🔄 Sending update request to API...
🔍 userMissionId being sent: 1
📤 API Response: { ... }
```

#### Error Patterns:
```
❌ userMissionId is missing or invalid (New): undefined
❌ userMission.id is missing or invalid: undefined
❌ Still no valid userMission ID after reload
```

### 5. Troubleshooting

#### Jika Masih Error "ID mission tidak valid":

1. **Check Data Source:**
   ```bash
   # Lihat logs untuk debugging
   ./scripts/debug-mission-update.sh logs
   ```

2. **Check API Connection:**
   ```bash
   # Test API health
   ./scripts/debug-mission-update.sh api
   ```

3. **Restart App:**
   ```bash
   # Restart aplikasi
   ./scripts/debug-mission-update.sh restart
   ```

4. **Clear Cache:**
   - Di aplikasi, pull-to-refresh di halaman mission
   - Atau restart aplikasi

### 6. Test Cases

#### Test Case 1: Mission Baru
- Accept mission baru
- Update progress ke 50%
- Expected: Progress berhasil di-update

#### Test Case 2: Mission dengan Progress
- Pilih mission yang sudah ada progress
- Update progress ke 100%
- Expected: Mission completed

#### Test Case 3: Mission Completed
- Pilih mission yang sudah completed
- Try to update progress
- Expected: Error "Mission sudah diselesaikan"

#### Test Case 4: Network Error
- Disconnect internet
- Try to update progress
- Expected: Error handling yang proper

### 7. Monitoring

#### Real-time Monitoring:
```bash
# Monitor logs secara real-time
./scripts/debug-mission-update.sh monitor
```

#### Check Recent Logs:
```bash
# Lihat logs terbaru
./scripts/debug-mission-update.sh logs
```

### 8. Success Indicators

#### ✅ Berhasil jika:
- Console logs menunjukkan `userMissionId: 1` (atau ID valid)
- API response success
- Progress berhasil di-update di UI
- Tidak ada error alert

#### ❌ Masih ada masalah jika:
- Console logs menunjukkan `userMissionId: undefined`
- Error alert muncul
- Progress tidak berubah di UI

### 9. Next Steps

Jika masih ada masalah:
1. Catat error message yang muncul
2. Screenshot console logs
3. Share debugging info untuk analisis lebih lanjut
