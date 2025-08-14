# Fix: Layanan Klinik Tidak Muncul pada Booking Online Mobile

## Masalah
Setelah memilih klinik pada aplikasi mobile untuk booking online, layanan (services) yang ada di klinik tidak muncul.

## Penyebab
1. **API `/api/mobile/clinics` tidak mengembalikan data layanan**: API hanya mengembalikan data dasar klinik tanpa informasi layanan (polyclinics) dan dokter yang tersedia.

2. **Relasi database tidak lengkap**: Tidak semua klinik memiliki relasi dengan polyclinics melalui tabel `clinic_polyclinics`.

3. **Data dokter tidak terhubung dengan polyclinic**: Beberapa dokter tidak memiliki `polyclinic_id` yang menghubungkan mereka dengan layanan tertentu.

## Solusi yang Diterapkan

### 1. Perbaikan API `/api/mobile/clinics`
**File**: `dash-app/app/api/mobile/clinics/route.js`

Menambahkan query untuk mengambil:
- **Services (polyclinics)** untuk setiap klinik dengan informasi:
  - ID, nama, kode, deskripsi
  - Harga default ("Konsultasi")
  - Durasi default ("30 min")
  
- **Doctors** untuk setiap service dengan informasi:
  - ID, nama, spesialisasi, rating
  
- **All doctors** untuk klinik (backward compatibility)

### 2. Struktur Database
Sistem menggunakan struktur:
```
clinics → clinic_polyclinics → polyclinics (services)
                ↓
doctors (terhubung ke clinic_id dan polyclinic_id)
```

### 3. Populasi Data
**File**: `dash-app/init-scripts/20-populate-clinic-polyclinic-data.sql`

- Menambahkan relasi `clinic_polyclinics` untuk semua klinik aktif
- Mengupdate dokter dengan `polyclinic_id` yang sesuai
- Menambahkan dokter baru untuk klinik yang belum memiliki dokter
- Memberikan rating default untuk semua dokter

## Hasil

### Response API Sebelum Perbaikan:
```json
{
  "success": true,
  "data": [
    {
      "id": 9,
      "name": "Klinik PHC Jakarta Pusat",
      "services": [],  // KOSONG
      "doctors": []    // KOSONG
    }
  ]
}
```

### Response API Setelah Perbaikan:
```json
{
  "success": true,
  "data": [
    {
      "id": 9,
      "name": "Klinik PHC Jakarta Pusat",
      "services": [
        {
          "id": 3,
          "name": "Poli Anak",
          "code": "POLI-ANAK", 
          "description": "Pelayanan kesehatan khusus anak-anak",
          "price": "Konsultasi",
          "duration": "30 min",
          "doctors": [
            {
              "id": 49,
              "name": "Dr. Ahmad Fauzi",
              "specialization": "Dokter Anak",
              "rating": "4.70"
            }
          ]
        }
      ],
      "doctors": [
        {
          "id": 49,
          "name": "Dr. Ahmad Fauzi", 
          "specialization": "Dokter Anak",
          "service_id": 3,
          "rating": "4.70"
        }
      ]
    }
  ]
}
```

## Testing
Untuk memverifikasi perbaikan:

1. **Test API**:
   ```bash
   curl "http://localhost:3000/api/mobile/clinics?limit=1" | jq '.data[0].services'
   ```

2. **Test di Mobile App**:
   - Buka aplikasi mobile
   - Pilih "Booking Online" 
   - Pilih salah satu klinik
   - Verifikasi bahwa layanan (Poli Umum, Poli Gigi, dll) muncul
   - Pilih layanan dan verifikasi dokter muncul

## Files yang Dimodifikasi
1. `dash-app/app/api/mobile/clinics/route.js` - API endpoint perbaikan
2. `dash-app/init-scripts/20-populate-clinic-polyclinic-data.sql` - Script populasi data

## Status
✅ **RESOLVED** - Layanan klinik sekarang muncul dengan lengkap pada booking online mobile app.
