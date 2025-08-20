# 🚀 Panduan Setup Postman untuk PHC Mobile API

## 📁 File yang Tersedia

1. **`PHC_Mobile_API_Collection.json`** - Collection utama dengan semua endpoint API
2. **`PHC_Mobile_Environment.json`** - Environment variables untuk testing
3. **`API_ENDPOINTS_POSTMAN.md`** - Dokumentasi lengkap semua endpoint

## 🔧 Cara Import ke Postman

### 1. Import Collection
1. Buka Postman
2. Klik tombol **"Import"** di pojok kiri atas
3. Pilih file **`PHC_Mobile_API_Collection.json`**
4. Klik **"Import"**

### 2. Import Environment
1. Klik tombol **"Import"** lagi
2. Pilih file **`PHC_Mobile_Environment.json`**
3. Klik **"Import"**

### 3. Setup Environment
1. Di dropdown environment (pojok kanan atas), pilih **"PHC Mobile Environment"**
2. Klik icon gear ⚙️ untuk mengatur environment variables

## 🔑 Environment Variables

### Variables yang Tersedia:
- `base_url` - Base URL API (default: `http://localhost:3000/api`)
- `token` - Access token (akan diisi otomatis setelah login)
- `refresh_token` - Refresh token
- `user_id`, `doctor_id`, `clinic_id`, dll - ID untuk testing
- `test_email`, `test_password` - Kredensial test user

### Cara Mengubah Base URL:
1. Klik icon gear ⚙️ di environment dropdown
2. Edit value `base_url` sesuai server Anda:
   - Local: `http://localhost:3000/api`
   - Development: `http://your-dev-server:3000/api`
   - Production: `https://your-production-server.com/api`

## 🎯 Fitur Collection

### ✅ Auto-Login
Collection ini memiliki **Pre-request Script** yang akan otomatis login jika token belum tersedia.

### ✅ Bearer Token Authentication
Semua request yang memerlukan authentication akan otomatis menggunakan Bearer token.

### ✅ Response Validation
Setiap request memiliki **Test Script** yang memvalidasi:
- Status code (200/201)
- Response structure
- Response time (< 2000ms)

### ✅ Organized Folders
Collection diorganisir dalam folder berdasarkan kategori:
- 🔐 Authentication
- 👤 User Management
- 🏥 Clinic & Doctor
- 📋 Patient & Visit
- 💊 Medicine & Examination
- 🎯 Mission & Activity
- 📊 Health & Wellness
- 📅 Booking & Consultation
- 💬 Chat
- 🔧 App & System
- 🏢 Master Data
- ⚙️ Settings
- 📊 Dashboard
- 🧪 Laboratory
- 🔍 Test Endpoints

## 🚀 Cara Testing

### 1. Jalankan Server
```bash
cd dash-app
npm install
npm run dev
```

### 2. Test Connection
1. Buka folder **"🔍 Test Endpoints"**
2. Jalankan **"Test Connection"** untuk memastikan server berjalan
3. Jalankan **"Health Check"** untuk memastikan API responsif

### 3. Login
1. Buka folder **"🔐 Authentication"**
2. Jalankan **"Mobile Login"** dengan kredensial:
   ```json
   {
     "email": "test@mobile.com",
     "password": "password123"
   }
   ```
3. Token akan otomatis disimpan di environment

### 4. Test Endpoint Lainnya
Setelah login berhasil, Anda bisa test semua endpoint lainnya. Token akan otomatis digunakan.

## 📋 Contoh Testing Workflow

### Testing User Management:
1. **Get All Mobile Users** - Lihat daftar user
2. **Create New Mobile User** - Buat user baru
3. **Get User by ID** - Ambil detail user
4. **Update User Weight** - Update data user

### Testing Health & Wellness:
1. **Get Health Status** - Cek status kesehatan
2. **Create Health Data** - Tambah data kesehatan
3. **Get Sleep Tracking** - Lihat data tidur
4. **Create Sleep Tracking** - Tambah data tidur
5. **Get Mood Tracking** - Lihat data mood
6. **Create Mood Tracking** - Tambah data mood

### Testing Missions:
1. **Get User Missions** - Lihat mission user
2. **Accept Mission** - Terima mission
3. **Update Mission Progress** - Update progress mission

## 🔧 Customization

### Menambah Request Baru:
1. Klik kanan pada folder yang sesuai
2. Pilih **"Add Request"**
3. Isi detail request:
   - Method (GET, POST, PUT, DELETE)
   - URL dengan variable: `{{base_url}}/path/to/endpoint`
   - Headers: `Content-Type: application/json`
   - Body (jika diperlukan)

### Mengubah Request Body:
1. Klik pada request
2. Tab **"Body"**
3. Pilih **"raw"** dan **"JSON"**
4. Edit body sesuai kebutuhan

### Menambah Test Script:
1. Klik pada request
2. Tab **"Tests"**
3. Tambahkan script validasi:
```javascript
pm.test("Custom test", function () {
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
});
```

## 🐛 Troubleshooting

### Error 401 Unauthorized:
- Pastikan sudah login dan token valid
- Cek apakah token belum expired
- Jalankan ulang request login

### Error 404 Not Found:
- Pastikan server berjalan di port yang benar
- Cek base_url di environment variables
- Pastikan endpoint path benar

### Error 500 Internal Server Error:
- Cek log server untuk detail error
- Pastikan database terhubung
- Cek environment variables di server

### Token Tidak Terisi Otomatis:
- Pastikan response login berformat yang benar
- Cek Pre-request Script di collection
- Coba login manual dan copy token ke environment

## 📊 Monitoring & Analytics

### Response Time:
- Collection akan menampilkan response time untuk setiap request
- Test script akan gagal jika response time > 2000ms

### Success Rate:
- Monitor success rate dari test results
- Identifikasi endpoint yang sering error

### API Performance:
- Gunakan Postman's built-in monitoring
- Set up alerts untuk response time yang lambat

## 🔒 Security Best Practices

### Environment Variables:
- Jangan commit file environment ke repository
- Gunakan secret type untuk sensitive data
- Rotate credentials secara berkala

### Token Management:
- Token akan otomatis refresh jika diperlukan
- Jangan share token dengan orang lain
- Monitor token usage

### API Testing:
- Test dengan data dummy
- Jangan test dengan data production
- Backup data sebelum testing

## 📞 Support

Jika mengalami masalah:
1. Cek dokumentasi di `API_ENDPOINTS_POSTMAN.md`
2. Pastikan server berjalan dengan benar
3. Cek log server untuk error details
4. Test dengan endpoint yang lebih sederhana terlebih dahulu

---

## 🎉 Selamat Testing!

Collection ini sudah siap digunakan untuk testing semua endpoint API PHC Mobile. Semua request sudah dikonfigurasi dengan benar dan akan otomatis menggunakan authentication yang diperlukan.
