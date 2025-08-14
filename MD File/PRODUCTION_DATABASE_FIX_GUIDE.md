# Panduan Perbaikan Database Produksi

## 🔍 Diagnosis Masalah

Berdasarkan analisis yang telah dilakukan, server produksi `https://dash.doctorphc.id` mengalami masalah database:

```
Error: "Database error: Access denied for user 'root'@'localhost' (using password: YES)"
```

**Status:**
- ✅ Server berjalan normal (health check OK)
- ✅ Aplikasi Next.js berfungsi
- ❌ Koneksi database gagal (MySQL access denied)

## 🛠️ Langkah Perbaikan

### Langkah 1: Akses Server Produksi
SSH ke server produksi Anda:
```bash
ssh username@your-server-ip
# atau melalui panel hosting (aaPanel, cPanel, dll.)
```

### Langkah 2: Periksa File .env.local
```bash
cd /www/wwwroot/dashapp  # sesuaikan dengan lokasi aplikasi Anda
ls -la .env.local
```

Jika file tidak ada atau tidak bisa dibaca:
```bash
# Buat file baru
nano .env.local
```

### Langkah 3: Isi File .env.local
Copy content dari `production-env-template.txt` dan sesuaikan:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password_here
DB_NAME=phc_dashboard
DB_PORT=3306

# JWT Secret
JWT_SECRET=supersecretkey123456789supersecretkey123456789supersecretkey

# Application Configuration
NODE_ENV=production
PORT=3000

# Next.js Configuration
NEXT_PUBLIC_API_URL=https://dash.doctorphc.id/api
```

**⚠️ PENTING:** Ganti `your_actual_mysql_password_here` dengan password MySQL root yang sebenarnya!

### Langkah 4: Dapatkan Password MySQL Root

#### Jika menggunakan aaPanel:
1. Login ke aaPanel
2. Database → MySQL → Root Password
3. Copy password atau reset jika perlu

#### Jika menggunakan cPanel:
1. Login ke cPanel
2. Database → MySQL Database
3. Check MySQL root password

#### Jika akses langsung ke server:
```bash
# Test koneksi MySQL
mysql -u root -p
# Masukkan password, jika berhasil berarti password benar
```

### Langkah 5: Set Permission File
```bash
chmod 600 .env.local
chown www-data:www-data .env.local  # sesuaikan dengan user web server
```

### Langkah 6: Restart Aplikasi

#### Jika menggunakan PM2:
```bash
pm2 restart dash-app
pm2 logs dash-app  # cek log
```

#### Jika menggunakan systemd:
```bash
systemctl restart your-app-service
systemctl status your-app-service
```

#### Jika menggunakan Docker:
```bash
docker-compose restart
```

### Langkah 7: Test Perbaikan
Jalankan script test dari lokal:
```bash
node scripts/fix-production-database.js
```

Atau test manual:
```bash
curl https://dash.doctorphc.id/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mobile.com","password":"password123"}'
```

## 🔄 Alternatif: Buat User Database Khusus

Untuk keamanan yang lebih baik, buat user database khusus:

### 1. Login ke MySQL sebagai root:
```sql
mysql -u root -p
```

### 2. Buat user dan database:
```sql
-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS phc_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user khusus
CREATE USER 'phc_user'@'localhost' IDENTIFIED BY 'strong_password_here';

-- Berikan privileges
GRANT ALL PRIVILEGES ON phc_dashboard.* TO 'phc_user'@'localhost';
FLUSH PRIVILEGES;

-- Test koneksi
EXIT;
mysql -u phc_user -p phc_dashboard
```

### 3. Update .env.local:
```env
DB_USER=phc_user
DB_PASSWORD=strong_password_here
```

## 📋 Checklist Perbaikan

- [ ] SSH ke server produksi
- [ ] Periksa lokasi aplikasi (`/www/wwwroot/dashapp` atau lainnya)
- [ ] Buat/edit file `.env.local`
- [ ] Dapatkan password MySQL root yang benar
- [ ] Isi konfigurasi database dengan benar
- [ ] Set permission file (chmod 600)
- [ ] Restart aplikasi
- [ ] Test koneksi database
- [ ] Verifikasi login endpoint berfungsi

## 🚨 Troubleshooting

### Jika masih error setelah perbaikan:

1. **Cek log aplikasi:**
   ```bash
   pm2 logs dash-app
   # atau
   tail -f /path/to/app/logs/error.log
   ```

2. **Test koneksi MySQL manual:**
   ```bash
   mysql -u root -p -h localhost phc_dashboard
   ```

3. **Periksa firewall/security:**
   - Pastikan MySQL berjalan di port 3306
   - Pastikan tidak ada firewall yang memblokir

4. **Reset MySQL password jika perlu:**
   ```bash
   sudo mysql_secure_installation
   ```

## ✅ Setelah Berhasil

Setelah database produksi diperbaiki, update aplikasi mobile untuk menggunakan server produksi:

```javascript
// src/services/api.js
const getServerURL = () => {
  return "https://dash.doctorphc.id";  // Uncomment this
  // return "192.168.18.30";           // Comment this
};
```

Kemudian restart aplikasi mobile untuk menggunakan server produksi.
