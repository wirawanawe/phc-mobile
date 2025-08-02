# Panduan Menghapus Riwayat Chat untuk Semua Pasien

## Overview
Dokumen ini menjelaskan cara menghapus semua riwayat chat untuk semua pasien di sistem PHC Mobile.

## ⚠️ PERINGATAN
**Tindakan ini akan menghapus SEMUA data chat secara permanen dan tidak dapat dibatalkan!**
- Semua riwayat chat AI akan dihapus
- Semua riwayat chat dengan dokter akan dihapus
- Semua pesan dalam chat akan dihapus
- Data yang dihapus TIDAK dapat dipulihkan

## Metode 1: Menggunakan Script Node.js (Direkomendasikan)

### Script Otomatis (Tanpa Konfirmasi)
```bash
cd backend
node scripts/clear-all-chats.js
```

### Script dengan Konfirmasi (Lebih Aman)
```bash
cd backend
node scripts/clear-all-chats-safe.js
```

Script ini akan:
1. Menampilkan jumlah data yang akan dihapus
2. Meminta konfirmasi ganda
3. Menghapus semua data chat
4. Memverifikasi penghapusan

## Metode 2: Menggunakan SQL Langsung

### Langkah 1: Backup Database (PENTING!)
```bash
mysqldump -u root -p phc_mobile > backup_phc_mobile_$(date +%Y%m%d_%H%M%S).sql
```

### Langkah 2: Jalankan Script SQL
```bash
mysql -u root -p phc_mobile < backend/scripts/clear-chats.sql
```

## Metode 3: Menggunakan MySQL Command Line

```bash
# Login ke MySQL
mysql -u root -p

# Pilih database
USE phc_mobile;

# Hapus semua pesan chat
DELETE FROM chat_messages;

# Hapus semua chat
DELETE FROM chats;

# Reset auto increment
ALTER TABLE chat_messages AUTO_INCREMENT = 1;
ALTER TABLE chats AUTO_INCREMENT = 1;

# Verifikasi penghapusan
SELECT COUNT(*) as remaining_chats FROM chats;
SELECT COUNT(*) as remaining_messages FROM chat_messages;
```

## Verifikasi Penghapusan

Setelah menjalankan script, verifikasi bahwa data telah dihapus:

```bash
# Menggunakan MySQL
mysql -u root -p -e "USE phc_mobile; SELECT COUNT(*) as chats FROM chats; SELECT COUNT(*) as messages FROM chat_messages;"

# Atau menggunakan script Node.js
cd backend
node -e "
const Chat = require('./models/Chat');
const ChatMessage = require('./models/ChatMessage');

async function check() {
  const chats = await Chat.count();
  const messages = await ChatMessage.count();
  console.log('Remaining chats:', chats);
  console.log('Remaining messages:', messages);
}
check();
"
```

## Dampak Setelah Penghapusan

### 1. Aplikasi Mobile
- Semua riwayat chat akan kosong
- User tidak akan melihat chat sebelumnya
- Fitur chat tetap berfungsi untuk chat baru

### 2. Backend API
- Endpoint `/api/chat` akan mengembalikan array kosong
- Endpoint `/api/chat/:chatId/messages` akan mengembalikan 404
- Chat baru masih dapat dibuat

### 3. Database
- Tabel `chats` akan kosong
- Tabel `chat_messages` akan kosong
- Auto increment akan direset ke 1

## Troubleshooting

### Error: "Cannot delete or update a parent row"
Jika terjadi error foreign key constraint:
```sql
-- Nonaktifkan foreign key checks sementara
SET FOREIGN_KEY_CHECKS = 0;

-- Jalankan penghapusan
DELETE FROM chat_messages;
DELETE FROM chats;

-- Aktifkan kembali foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
```

### Error: "Access denied"
Pastikan user MySQL memiliki hak akses yang cukup:
```sql
GRANT ALL PRIVILEGES ON phc_mobile.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

## Backup dan Restore

### Membuat Backup
```bash
# Backup seluruh database
mysqldump -u root -p phc_mobile > backup_full_$(date +%Y%m%d_%H%M%S).sql

# Backup hanya tabel chat
mysqldump -u root -p phc_mobile chats chat_messages > backup_chats_$(date +%Y%m%d_%H%M%S).sql
```

### Restore dari Backup
```bash
# Restore seluruh database
mysql -u root -p phc_mobile < backup_full_20240120_143000.sql

# Restore hanya tabel chat
mysql -u root -p phc_mobile < backup_chats_20240120_143000.sql
```

## Catatan Penting

1. **Selalu buat backup** sebelum menjalankan script penghapusan
2. **Test di environment development** terlebih dahulu
3. **Koordinasi dengan tim** sebelum menghapus data di production
4. **Dokumentasikan waktu penghapusan** untuk audit trail
5. **Monitor aplikasi** setelah penghapusan untuk memastikan tidak ada error

## Support

Jika mengalami masalah, hubungi tim development atau buat issue di repository project. 