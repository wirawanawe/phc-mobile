# Ringkasan Perbaikan Database Produksi

## 🎯 Masalah yang Ditemukan

Server produksi `https://dash.doctorphc.id` mengalami masalah database:
```
Database error: Access denied for user 'root'@'localhost' (using password: YES)
```

**Status Saat Ini:**
- ✅ Server produksi online dan dapat diakses
- ✅ Health endpoint berfungsi normal
- ❌ Database connection error (MySQL access denied)
- 🔄 Mobile app sementara menggunakan server lokal

## 🛠️ Tools yang Telah Dibuat

### 1. Script Diagnosis (`scripts/fix-production-database.js`)
```bash
node scripts/fix-production-database.js
```
- Mendiagnosis masalah database produksi
- Memberikan rekomendasi perbaikan
- Menganalisis error secara detail

### 2. Script Verifikasi (`scripts/verify-production-fix.js`)
```bash
node scripts/verify-production-fix.js
```
- Memverifikasi apakah perbaikan berhasil
- Test semua endpoint penting
- Konfirmasi database berfungsi normal

### 3. Script Switch Server (`scripts/switch-server.js`)
```bash
# Lihat status saat ini
node scripts/switch-server.js status

# Beralih ke server lokal
node scripts/switch-server.js local

# Beralih ke server produksi
node scripts/switch-server.js production
```

### 4. Template Konfigurasi (`production-env-template.txt`)
Template file `.env.local` yang benar untuk server produksi.

## 📋 Langkah-Langkah Perbaikan

### Langkah 1: Akses Server Produksi
SSH ke server atau akses melalui panel hosting (aaPanel/cPanel).

### Langkah 2: Periksa/Buat File .env.local
```bash
cd /www/wwwroot/dashapp  # sesuaikan lokasi
nano .env.local
```

Isi dengan template yang benar (lihat `production-env-template.txt`).

### Langkah 3: Dapatkan Password MySQL
- **aaPanel**: Database → MySQL → Root Password
- **cPanel**: Database → MySQL Database
- **Manual**: `mysql -u root -p` untuk test

### Langkah 4: Update Konfigurasi
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_mysql_yang_benar
DB_NAME=phc_dashboard
JWT_SECRET=supersecretkey123456789supersecretkey123456789supersecretkey
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://dash.doctorphc.id/api
```

### Langkah 5: Set Permission dan Restart
```bash
chmod 600 .env.local
pm2 restart dash-app  # atau restart service lainnya
```

### Langkah 6: Verifikasi Perbaikan
```bash
node scripts/verify-production-fix.js
```

## 🔄 Setelah Database Diperbaiki

### 1. Switch ke Server Produksi
```bash
node scripts/switch-server.js production
```

### 2. Restart Mobile App
Restart aplikasi mobile Anda untuk menggunakan server produksi.

### 3. Test Login
Coba login dengan kredensial test:
- Email: `test@mobile.com`
- Password: `password123`

## 📱 Status Mobile App Saat Ini

**Current Configuration:**
- 🏠 Server: Local (`http://192.168.18.30:3000`)
- ✅ Status: Berfungsi normal
- 🔑 Login: Dapat login dengan kredensial test

**Setelah Database Produksi Diperbaiki:**
- 🚀 Server: Production (`https://dash.doctorphc.id`)
- 🔄 Perlu restart mobile app
- 🔑 Login: Menggunakan database produksi

## 🚨 Troubleshooting

### Jika Script Diagnosis Menunjukkan Masalah Masih Ada:
1. Periksa kembali password MySQL
2. Pastikan file `.env.local` ada dan readable
3. Restart aplikasi setelah perubahan
4. Cek log aplikasi: `pm2 logs dash-app`

### Jika Login Gagal Setelah Perbaikan:
1. Verifikasi kredensial test ada di database
2. Cek apakah database `phc_dashboard` ada
3. Pastikan user memiliki permission yang benar

## 📞 Bantuan

Jika mengalami kesulitan:
1. Jalankan script diagnosis untuk detail error
2. Periksa log server untuk informasi lebih lanjut
3. Pastikan semua langkah telah diikuti dengan benar

## ✅ Checklist Perbaikan

- [ ] SSH ke server produksi
- [ ] Periksa lokasi aplikasi
- [ ] Buat/edit file `.env.local`
- [ ] Dapatkan password MySQL yang benar
- [ ] Update konfigurasi database
- [ ] Set permission file (chmod 600)
- [ ] Restart aplikasi
- [ ] Jalankan script verifikasi
- [ ] Switch mobile app ke produksi
- [ ] Test login di mobile app

---

**Kontak:** Jika memerlukan bantuan lebih lanjut, silakan hubungi dengan detail error yang ditemukan.
