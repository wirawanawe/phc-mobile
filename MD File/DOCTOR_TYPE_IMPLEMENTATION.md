# 🏥 Doctor Type Implementation - PHC Mobile

## Overview
Sistem telah diimplementasikan untuk membedakan dokter klinik (untuk booking appointment) dengan dokter konsultasi program (untuk konsultasi online), dengan fleksibilitas bahwa dokter klinik juga bisa menjadi dokter konsultasi.

## 🔧 Database Changes

### New Fields Added to `doctors` Table

1. **`doctor_type`** (ENUM)
   - `'clinic'` - Hanya untuk appointment di klinik
   - `'consultation'` - Hanya untuk konsultasi online
   - `'both'` - Bisa melakukan keduanya (default)

2. **`available_for_consultation`** (BOOLEAN)
   - `true` - Tersedia untuk konsultasi online
   - `false` - Tidak tersedia untuk konsultasi online

3. **`consultation_schedule`** (JSON)
   - Jadwal ketersediaan untuk konsultasi online
   - Format: `{day: {available: boolean, hours: [string]}}`

## 📊 Current Doctor Distribution

Berdasarkan hasil implementasi:

- **Consultation Doctors**: 10 dokter (Dokter Umum, Dokter Mata)
- **Clinic Doctors**: 7 dokter (Kardiolog, Dokter Gigi, dan dokter 'both')
- **Both Type**: 3 dokter (Dr. Siti Nurhaliza, Dr. Ahmad Fauzi, Dr. Maya Indah)
- **Total Doctors**: 14 dokter

## 🚀 API Endpoints

### 1. Get All Doctors (with type filter)
```
GET /api/clinics/doctors?type={type}
```
- `type=clinic` - Hanya dokter yang bisa di klinik
- `type=consultation` - Hanya dokter yang bisa konsultasi online
- `type=all` atau tidak ada parameter - Semua dokter

### 2. Get Consultation Doctors Only
```
GET /api/clinics/consultation/doctors
```
- Mengembalikan dokter yang tersedia untuk konsultasi online
- Filter: `doctor_type IN ('consultation', 'both')` AND `available_for_consultation = true`

## 🎯 Frontend Implementation

### ConsultationBookingScreen
- Menggunakan `apiService.getConsultationDoctors()`
- Hanya menampilkan dokter yang tersedia untuk konsultasi online
- Menampilkan jadwal ketersediaan dokter

### ClinicBookingScreen
- Menggunakan `apiService.getClinics()` dengan filter dokter
- Hanya menampilkan dokter yang bisa di klinik (`doctor_type IN ('clinic', 'both')`)
- Tetap menggunakan struktur data klinik yang ada

## 📋 Doctor Type Logic

### Clinic-Only Doctors
- **Spesialisasi**: Kardiolog, Dokter Gigi
- **Alasan**: Memerlukan pemeriksaan fisik, peralatan khusus
- **Ketersediaan**: Hanya di klinik

### Consultation-Only Doctors
- **Spesialisasi**: Dokter Umum, Dokter Mata
- **Alasan**: Bisa dilakukan secara telemedicine
- **Ketersediaan**: Konsultasi online dengan jadwal fleksibel

### Both Type Doctors (Future)
- **Spesialisasi**: Dokter yang bisa melakukan keduanya
- **Alasan**: Fleksibilitas layanan
- **Ketersediaan**: Klinik dan konsultasi online

## 🔄 Migration Scripts

### 1. Add Doctor Fields
```bash
NODE_ENV=development DB_PASSWORD=pr1k1t1w node scripts/add-doctor-fields.js
```

### 2. Update Doctor Types
```bash
NODE_ENV=development DB_PASSWORD=pr1k1t1w node scripts/update-doctor-types.js
```

## 🧪 Testing

### Test Results
Semua endpoint telah ditest dan berfungsi dengan baik:

- **Consultation Doctors**: 10 dokter ✅
- **Clinic Doctors**: 7 dokter ✅  
- **Both Type Doctors**: 14 dokter ✅
- **All Doctors**: 14 dokter ✅

### Test Commands

#### Test Consultation Doctors
```bash
curl -X GET "http://localhost:5432/api/clinics/consultation/doctors" \
  -H "Content-Type: application/json"
```

#### Test Clinic Doctors
```bash
curl -X GET "http://localhost:5432/api/clinics/doctors?type=clinic" \
  -H "Content-Type: application/json"
```

#### Test Both Type Doctors
```bash
curl -X GET "http://localhost:5432/api/clinics/doctors?type=both" \
  -H "Content-Type: application/json"
```

#### Test All Doctors
```bash
curl -X GET "http://localhost:5432/api/clinics/doctors" \
  -H "Content-Type: application/json"
```

#### Test Doctor Details
```bash
curl -X GET "http://localhost:5432/api/clinics/doctors?type=both" \
  -H "Content-Type: application/json" | jq '.data[0] | {name, specialization, doctor_type, available_for_consultation}'
```

## 📱 User Experience

### For Clinic Booking
1. User memilih klinik
2. User memilih layanan
3. User memilih dokter (hanya yang tersedia di klinik)
4. User memilih tanggal dan waktu
5. Booking dibuat

### For Consultation Booking
1. User memilih dokter (hanya yang tersedia untuk konsultasi)
2. User melihat jadwal ketersediaan dokter
3. User memilih tanggal dan waktu
4. User mengisi keluhan
5. Konsultasi dibooking

## 🔮 Future Enhancements

1. **Dynamic Doctor Type Management**
   - Admin panel untuk mengubah tipe dokter
   - Jadwal ketersediaan yang dinamis

2. **Advanced Scheduling**
   - Integrasi dengan kalender dokter
   - Notifikasi ketersediaan real-time

3. **Specialization-Based Filtering**
   - Filter dokter berdasarkan spesialisasi
   - Rekomendasi dokter berdasarkan keluhan

4. **Consultation History**
   - Riwayat konsultasi online
   - Rating dan review untuk dokter

## ⚠️ Important Notes

1. **Data Consistency**: Pastikan data dokter konsisten antara klinik dan konsultasi
2. **Schedule Management**: Jadwal konsultasi harus diupdate secara berkala
3. **User Education**: User perlu memahami perbedaan antara booking klinik dan konsultasi
4. **Error Handling**: Handle kasus ketika dokter tidak tersedia

## 🎉 Benefits

1. **Flexibility**: Dokter bisa memiliki tipe layanan yang berbeda
2. **User Experience**: User mendapatkan dokter yang tepat untuk kebutuhan mereka
3. **Scalability**: Sistem bisa dikembangkan untuk berbagai jenis layanan
4. **Efficiency**: Mengurangi booking yang tidak sesuai dengan kemampuan dokter 