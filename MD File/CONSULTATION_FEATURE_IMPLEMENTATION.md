# Implementasi Fitur Konsultasi PHC Mobile

## Overview
Fitur Konsultasi telah diimplementasikan sebagai sistem booking konsultasi berbayar dengan dokter yang terintegrasi dengan sistem chat dan video call.

## Fitur yang Diimplementasikan

### 1. Model Database
- **Consultation** - Model untuk menyimpan data konsultasi dengan dokter
- **Doctor** - Updated dengan field `price_per_consultation` untuk harga konsultasi per sesi

### 2. Backend API Routes
- `GET /api/consultations` - Mendapatkan daftar konsultasi user
- `GET /api/consultations/:id` - Mendapatkan detail konsultasi spesifik
- `POST /api/consultations/book` - Booking konsultasi baru dengan dokter
- `POST /api/consultations/:id/pay` - Proses pembayaran konsultasi
- `POST /api/consultations/:id/start` - Mulai konsultasi (untuk video call/phone)
- `POST /api/consultations/:id/end` - Akhiri konsultasi
- `POST /api/consultations/:id/cancel` - Batalkan konsultasi
- `POST /api/consultations/:id/rate` - Berikan rating untuk konsultasi
- `GET /api/clinics/doctors` - Mendapatkan daftar semua dokter

### 3. Frontend Screens
- **ConsultationBookingScreen** - Screen untuk booking konsultasi dengan dokter
- **ConsultationPaymentScreen** - Screen untuk proses pembayaran konsultasi
- **ConsultationHistoryScreen** - Screen untuk melihat riwayat konsultasi (dalam tab bottom navigation)

### 4. Tab Navigation
Tab **KONSULTASI** telah ditambahkan ke bottom navigation dengan fitur:
- Riwayat konsultasi (semua, berlangsung, selesai)
- Quick access untuk booking konsultasi baru
- Status tracking untuk setiap konsultasi

## Flow Penggunaan

### 1. Booking Konsultasi
1. User masuk ke tab **KONSULTASI** dan klik tombol **+** atau **Book Konsultasi**
2. Pilih dokter dari daftar yang tersedia
3. Pilih jenis konsultasi (Chat, Video Call, atau Telepon)
4. Pilih tanggal dan waktu konsultasi
5. Masukkan keluhan/complaint
6. Review ringkasan booking dan klik **Book Konsultasi**
7. Sistem akan membuat booking dengan status `pending_payment`

### 2. Proses Pembayaran
1. Setelah booking berhasil, user diarahkan ke **ConsultationPaymentScreen**
2. Pilih metode pembayaran (Transfer Bank, E-Wallet, Kartu Kredit, Virtual Account)
3. Klik **Pay Now** untuk memproses pembayaran
4. Setelah pembayaran sukses:
   - Status konsultasi berubah menjadi `paid`
   - Chat room otomatis dibuat untuk konsultasi
   - User dapat langsung mulai chat dengan dokter

### 3. Konsultasi
- **Chat**: User dapat langsung chat dengan dokter melalui chat room yang telah dibuat
- **Video Call**: Akan generate room ID untuk video call (butuh implementasi WebRTC)
- **Telepon**: Untuk konsultasi melalui telepon

### 4. Riwayat Konsultasi
- Tab **KONSULTASI** menampilkan semua riwayat konsultasi
- Filter berdasarkan status: Semua, Berlangsung, Selesai
- Klik konsultasi untuk aksi:
  - Status `pending_payment` → Lanjut ke pembayaran
  - Status `paid` → Mulai chat dengan dokter
  - Status lainnya → Lihat detail konsultasi

## Status Konsultasi

1. **pending_payment** - Menunggu pembayaran
2. **paid** - Sudah dibayar, siap konsultasi
3. **confirmed** - Dikonfirmasi dokter
4. **in_progress** - Sedang berlangsung
5. **completed** - Selesai
6. **cancelled** - Dibatalkan
7. **refunded** - Dikembalikan

## Integrasi dengan Sistem Chat

Setelah pembayaran berhasil, sistem otomatis:
1. Membuat chat room dengan `chat_type: "doctor"`
2. Menghubungkan konsultasi dengan chat room
3. Mengirim pesan sistem untuk memulai konsultasi
4. User dapat mengakses chat melalui link dari konsultasi atau dari daftar chat

## Sistem Pembayaran

Saat ini menggunakan simulasi pembayaran, tapi sudah disiapkan untuk integrasi dengan:
- Transfer Bank
- E-Wallet (GoPay, OVO, DANA, LinkAja)
- Kartu Kredit (Visa, Mastercard, JCB)
- Virtual Account Bank (BCA, BRI, BNI, Mandiri)

## Setup Database

Jalankan script untuk membuat tabel dan update data:
```bash
node backend/scripts/create-consultation-table.js
```

Script ini akan:
- Membuat tabel `consultations`
- Update tabel `doctors` dengan field `price_per_consultation`
- Set default harga konsultasi Rp 150.000

## Fitur Video Call (TODO)

Untuk implementasi video call, perlu:
1. Integrasi WebRTC atau service seperti Agora, Jitsi Meet
2. Generate room ID unik untuk setiap video consultation
3. Screen untuk video call interface
4. Control untuk start/end video call

## Manajemen untuk Dokter (TODO)

Fitur yang bisa ditambahkan untuk dokter:
- Dashboard dokter untuk melihat konsultasi
- Accept/reject konsultasi request
- Set jadwal ketersediaan
- Update harga konsultasi
- Lihat history dan rating
- End consultation dengan diagnosis dan resep

## Testing

Untuk testing fitur:
1. Pastikan sudah ada data dokter di database
2. User harus login untuk mengakses fitur konsultasi
3. Test flow: Book → Pay → Chat
4. Cek integrasi dengan sistem chat yang sudah ada

## Keamanan

- Semua endpoint konsultasi membutuhkan autentikasi
- User hanya bisa mengakses konsultasi miliknya sendiri
- Payment reference unique untuk setiap transaksi
- Validasi input untuk mencegah XSS dan injection

## UI/UX Features

- Modern interface dengan design system yang konsisten
- Loading states dan error handling
- Pull-to-refresh untuk list konsultasi
- Status badges dengan color coding
- Empty states dengan call-to-action
- Responsive design untuk berbagai ukuran layar

## Catatan Implementasi

- Semua screen menggunakan TypeScript untuk type safety
- Menggunakan React Native vector icons untuk consistency
- Integration dengan AuthContext untuk state management
- Error handling dengan retry mechanism
- API service sudah disiapkan untuk semua consultation endpoints

Fitur konsultasi ini memberikan pengalaman yang lengkap untuk user melakukan booking dan konsultasi dengan dokter melalui aplikasi PHC Mobile. 