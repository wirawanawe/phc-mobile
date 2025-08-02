# Implementasi Fitur Chat PHC Mobile

## Overview
Fitur Chat telah diimplementasikan dengan dua jenis chat utama:
1. **Chat dengan AI** - Asisten kesehatan AI yang mengerti bahasa Indonesia
2. **Chat dengan Dokter** - Konsultasi dengan dokter setelah booking

## Fitur yang Diimplementasikan

### 1. Model Database
- **Chat** - Menyimpan informasi chat (AI atau dokter)
- **ChatMessage** - Menyimpan pesan-pesan dalam chat

### 2. Backend API
- `GET /api/chat` - Mendapatkan daftar chat user
- `POST /api/chat/ai` - Membuat atau mendapatkan chat AI
- `POST /api/chat/doctor/:bookingId` - Membuat chat dengan dokter dari booking
- `GET /api/chat/:chatId/messages` - Mendapatkan pesan dalam chat
- `POST /api/chat/:chatId/messages` - Mengirim pesan
- `DELETE /api/chat/:chatId` - Menutup chat

### 3. Frontend Screens
- **ChatListScreen** - Daftar semua chat (AI dan dokter)
- **ChatDetailScreen** - Interface chat untuk mengirim dan menerima pesan

### 4. AI Assistant (Bahasa Indonesia)
AI telah dikonfigurasi untuk memahami dan merespons dalam bahasa Indonesia dengan topik:
- Nutrisi dan diet
- Olahraga dan kebugaran
- Tidur dan istirahat
- Stres dan kecemasan
- Hidrasi dan air
- Berat badan
- Kesehatan jantung
- Kesehatan mental
- Vitamin dan suplemen
- Darah tinggi
- Diabetes
- Kolesterol

## Cara Penggunaan

### Chat dengan AI
1. User login ke aplikasi
2. Masuk ke menu Chat
3. Klik tombol "+" untuk membuat chat AI baru
4. Mulai bertanya tentang kesehatan dalam bahasa Indonesia
5. AI akan merespons dengan saran kesehatan yang relevan

### Chat dengan Dokter
1. User melakukan booking konsultasi dengan dokter
2. Setelah booking dikonfirmasi, user dapat melanjutkan chat
3. Chat akan tersedia di daftar chat
4. User dapat mengirim pesan dan menerima respons dari dokter
5. Chat akan otomatis tertutup setelah sesi konsultasi selesai

## Fitur Keamanan
- Autentikasi required untuk semua endpoint chat
- User hanya dapat mengakses chat miliknya sendiri
- Validasi input untuk mencegah pesan kosong
- Rate limiting untuk mencegah spam

## UI/UX Features
- **Modern Design** - Menggunakan gradient dan card design
- **Real-time Updates** - Pesan langsung muncul setelah dikirim
- **Loading States** - Indikator loading saat mengirim/menerima pesan
- **Empty States** - Tampilan yang informatif saat belum ada chat
- **Responsive** - Menyesuaikan dengan keyboard dan screen size
- **Pull to Refresh** - Refresh daftar chat dengan pull down

## Technical Implementation

### Database Schema
```sql
-- Chat table
CREATE TABLE chats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  chat_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  doctor_id INT NULL,
  chat_type ENUM('ai', 'doctor') NOT NULL DEFAULT 'ai',
  title VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_message_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ChatMessage table
CREATE TABLE chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  chat_id INT NOT NULL,
  sender_type ENUM('user', 'doctor', 'ai') NOT NULL,
  sender_id INT NULL,
  message TEXT NOT NULL,
  message_type ENUM('text', 'image', 'file', 'system') NOT NULL DEFAULT 'text',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at DATETIME NULL,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Response Format
```json
{
  "success": true,
  "data": {
    "chat": {
      "id": 1,
      "chat_id": "CHAT123456789",
      "chat_type": "ai",
      "title": "Asisten Kesehatan AI",
      "doctor": null
    },
    "messages": [
      {
        "id": 1,
        "sender_type": "ai",
        "message": "Halo! Saya adalah Asisten Kesehatan AI PHC...",
        "message_type": "text",
        "is_read": true,
        "created_at": "2024-01-20T10:00:00Z"
      }
    ]
  }
}
```

## Future Enhancements
1. **Real-time Chat** - Implementasi WebSocket untuk real-time messaging
2. **File Sharing** - Kemampuan mengirim gambar dan dokumen
3. **Voice Messages** - Pesan suara
4. **Chat History** - Export chat history
5. **Typing Indicators** - Menunjukkan dokter sedang mengetik
6. **Push Notifications** - Notifikasi untuk pesan baru
7. **Chat Search** - Pencarian dalam chat
8. **Chat Groups** - Chat grup untuk konsultasi tim dokter

## Testing
Untuk testing fitur chat:
1. Pastikan backend server berjalan di port 5432
2. Login ke aplikasi mobile
3. Masuk ke menu Chat
4. Test chat AI dengan pertanyaan kesehatan dalam bahasa Indonesia
5. Test chat dengan dokter (memerlukan booking terlebih dahulu)

## Troubleshooting
- Jika chat tidak muncul, pastikan user sudah login
- Jika pesan tidak terkirim, cek koneksi internet
- Jika AI tidak merespons, cek log server untuk error
- Jika database error, jalankan `node scripts/create-chat-tables.js` 