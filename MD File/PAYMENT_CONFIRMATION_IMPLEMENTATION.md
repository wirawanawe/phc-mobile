# Implementasi Sistem Konfirmasi Pembayaran & Sinkronisasi Waktu Konsultasi

## Overview
Implementasi fitur untuk sistem konfirmasi bukti pembayaran oleh admin dan sinkronisasi waktu konsultasi antara halaman detail dokter dan halaman booking konsultasi.

## Fitur yang Diimplementasikan

### 1. Sistem Konfirmasi Bukti Pembayaran

#### Backend API Endpoints
- `POST /api/consultations/:id/upload-payment-proof` - Upload bukti pembayaran
- `POST /api/consultations/:id/confirm-payment` - Admin konfirmasi pembayaran
- `GET /api/consultations/pending-confirmation` - Daftar pembayaran menunggu konfirmasi

#### Database Schema Updates
Field baru pada tabel `consultations`:
- `payment_proof_url` - URL bukti pembayaran
- `payment_notes` - Catatan pembayaran dari user
- `payment_proof_uploaded_at` - Waktu upload bukti
- `admin_confirmed_at` - Waktu konfirmasi admin
- `admin_rejected_at` - Waktu penolakan admin
- `admin_notes` - Catatan dari admin
- `payment_status` - Status baru: `pending_confirmation`

#### Frontend Screens
- **PaymentProofScreen** - Screen untuk upload bukti pembayaran
- **AdminPaymentConfirmationScreen** - Screen admin untuk konfirmasi pembayaran

### 2. Sinkronisasi Waktu Konsultasi

#### Implementasi
- **DetailDoctor.tsx**: User memilih waktu konsultasi dari daftar slot yang tersedia
- **ConsultationBookingScreen.tsx**: Jika ada `selectedTimeSlot` dari halaman detail dokter, hanya waktu tersebut yang ditampilkan
- **Flow**: Waktu yang dipilih di detail dokter otomatis tersinkronisasi ke halaman booking

#### Fitur Utama
- Jika user memilih waktu di halaman detail dokter, di halaman booking hanya waktu tersebut yang muncul
- Jika user belum memilih waktu di detail dokter, semua slot waktu tersedia di halaman booking
- Tampilan yang berbeda untuk waktu yang sudah dipilih vs waktu yang bisa dipilih

## Flow Penggunaan

### 1. Alur Konfirmasi Pembayaran

#### User Side:
1. User melakukan booking konsultasi
2. User diarahkan ke halaman payment
3. Jika payment gateway gagal, user diarahkan ke halaman upload bukti pembayaran
4. User upload bukti pembayaran (foto/scan)
5. User isi detail pembayaran (metode, referensi, catatan)
6. Bukti pembayaran dikirim ke admin untuk konfirmasi
7. Status konsultasi berubah menjadi `pending_confirmation`

#### Admin Side:
1. Admin login ke dashboard
2. Admin melihat daftar pembayaran yang menunggu konfirmasi
3. Admin klik pembayaran untuk melihat detail dan bukti
4. Admin review bukti pembayaran
5. Admin dapat approve atau reject pembayaran
6. Jika approve: konsultasi aktif, chat room dibuat
7. Jika reject: status pembayaran failed

### 2. Alur Sinkronisasi Waktu

#### Dari Halaman Detail Dokter:
1. User melihat daftar slot waktu yang tersedia
2. User memilih waktu konsultasi (misal: "10:30")
3. User klik "Book Konsultasi"
4. Navigasi ke halaman booking dengan parameter `selectedTimeSlot: "10:30"`

#### Di Halaman Booking Konsultasi:
1. Jika ada `selectedTimeSlot`, hanya waktu tersebut yang ditampilkan
2. Tampilan: "Waktu yang Dipilih: 10:30" dengan border khusus
3. User tidak bisa memilih waktu lain
4. User lanjut isi detail konsultasi lainnya

## Status Pembayaran

1. **pending** - Menunggu pembayaran
2. **pending_confirmation** - Bukti pembayaran diupload, menunggu konfirmasi admin
3. **paid** - Pembayaran dikonfirmasi, konsultasi aktif
4. **failed** - Pembayaran ditolak atau gagal
5. **refunded** - Pembayaran dikembalikan

## API Response Examples

### Upload Payment Proof
```json
{
  "success": true,
  "message": "Bukti pembayaran berhasil diupload. Menunggu konfirmasi admin.",
  "data": {
    "consultation_id": 123,
    "status": "pending_confirmation"
  }
}
```

### Get Pending Confirmations (Admin)
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "consultation_id": "CONS12345678ABC",
      "user": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "081234567890"
      },
      "doctor": {
        "name": "Dr. Sarah Wilson",
        "specialization": "Cardiologist"
      },
      "payment_method": "bank_transfer",
      "payment_reference": "TRX123456789",
      "payment_proof_url": "https://example.com/proof.jpg",
      "price": 150000
    }
  ]
}
```

### Confirm Payment (Admin)
```json
{
  "success": true,
  "message": "Payment confirmed successfully. Consultation is now active.",
  "data": {
    "consultation_id": 123,
    "chat_id": "CHAT12345678ABC",
    "status": "paid"
  }
}
```

## Database Migration

Jalankan script untuk menambahkan field baru:
```bash
node backend/scripts/add-payment-proof-fields.js
```

## Frontend Navigation

### Routes yang Ditambahkan:
- `PaymentProof` - Halaman upload bukti pembayaran
- `AdminPaymentConfirmation` - Halaman admin konfirmasi pembayaran

### Navigation Flow:
```
ConsultationPayment -> PaymentProof -> ConsultationHistory
AdminDashboard -> AdminPaymentConfirmation
```

## Security & Validation

### Backend Validation:
- Hanya admin yang bisa mengakses endpoint konfirmasi
- Validasi file upload (image only)
- Validasi payment reference format
- Rate limiting untuk upload bukti pembayaran

### Frontend Validation:
- Validasi format gambar
- Validasi ukuran file
- Validasi input payment reference
- Loading states dan error handling

## Error Handling

### Common Error Scenarios:
1. **File upload gagal** - Retry mechanism
2. **Network error** - Offline handling
3. **Invalid payment proof** - Admin rejection dengan alasan
4. **Duplicate upload** - Prevent multiple submissions

### User Feedback:
- Loading indicators
- Success/error messages
- Retry options
- Clear instructions

## Testing

### Test Cases:
1. Upload bukti pembayaran dengan berbagai format
2. Admin approve/reject pembayaran
3. Sinkronisasi waktu dari detail dokter ke booking
4. Error handling untuk berbagai skenario
5. Permission validation untuk admin

## Future Enhancements

### Planned Features:
1. **Email notifications** - Notify user when payment confirmed/rejected
2. **Push notifications** - Real-time updates
3. **Payment gateway integration** - Direct payment processing
4. **Auto-approval** - For trusted payment methods
5. **Payment history** - Detailed payment logs
6. **Refund processing** - Handle refund requests

### Technical Improvements:
1. **Image compression** - Optimize upload size
2. **CDN integration** - Faster image loading
3. **Batch processing** - Handle multiple confirmations
4. **Audit trail** - Track all payment activities
5. **Analytics** - Payment success rates, processing times

## Dependencies

### Backend:
- Sequelize (database ORM)
- Express validator (input validation)
- Multer (file upload handling)

### Frontend:
- React Native Image Picker (image selection)
- Expo Image Picker (camera integration)
- React Navigation (screen navigation)

## Configuration

### Environment Variables:
```env
# File upload settings
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg

# Payment settings
PAYMENT_CONFIRMATION_TIMEOUT=7200000  # 2 hours
AUTO_APPROVE_AMOUNT=50000  # Auto approve payments under 50k
```

## Monitoring & Logging

### Key Metrics:
- Payment upload success rate
- Admin processing time
- Payment approval/rejection ratio
- User satisfaction scores

### Log Events:
- Payment proof uploaded
- Admin confirmation/rejection
- Payment status changes
- Error occurrences

## Support & Maintenance

### Common Issues:
1. **Image upload fails** - Check file size and format
2. **Admin can't see pending confirmations** - Verify admin role
3. **Payment status not updating** - Check database connection
4. **Time sync issues** - Verify timezone settings

### Maintenance Tasks:
- Regular cleanup of old payment proofs
- Database optimization
- Log rotation
- Security updates 