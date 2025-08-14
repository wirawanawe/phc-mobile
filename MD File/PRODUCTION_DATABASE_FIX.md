# 🔧 Production Database Connection Fix

## Current Status

✅ **Server Status**: Server production sudah berjalan dan bisa diakses
❌ **Database Status**: Ada masalah koneksi database - "Access denied for user 'root'@'localhost'"

## Problem Analysis

Error yang muncul:
```
Database error: Access denied for user 'root'@'localhost' (using password: YES)
```

Ini menunjukkan bahwa:
1. Aplikasi mencoba menggunakan user `root` dengan password
2. Password yang digunakan salah atau tidak dikonfigurasi dengan benar
3. File `.env.local` mungkin tidak ada atau tidak terbaca

## Solution Steps

### 1. SSH ke Server Production

```bash
ssh root@your-server-ip
# atau
ssh username@your-server-ip
```

### 2. Cek File Environment

```bash
cd /www/wwwroot/dashapp
ls -la .env*
```

Jika file `.env.local` tidak ada, buat file tersebut:

```bash
nano .env.local
```

### 3. Konfigurasi Database yang Benar

Isi file `.env.local` dengan konfigurasi yang benar:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=phc_dashboard
DB_PORT=3306

# JWT Secret (Ganti dengan random string yang aman)
JWT_SECRET=your_super_secret_jwt_key_for_production_min_32_chars

# Application Configuration
NODE_ENV=production
PORT=3000

# Next.js Configuration
NEXT_PUBLIC_API_URL=https://dash.doctorphc.id/api
```

### 4. Cek Password MySQL Root

```bash
# Cek apakah bisa login ke MySQL
mysql -u root -p

# Jika tidak bisa, cek password di aaPanel
# Atau reset password root MySQL
```

### 5. Alternatif: Buat User Database Baru

Jika tidak ingin menggunakan root, buat user baru:

```sql
# Login ke MySQL sebagai root
mysql -u root -p

# Buat user baru
CREATE USER 'phc_user'@'localhost' IDENTIFIED BY 'your_strong_password';

# Berikan privilege
GRANT ALL PRIVILEGES ON phc_dashboard.* TO 'phc_user'@'localhost';
FLUSH PRIVILEGES;

# Test user baru
mysql -u phc_user -p phc_dashboard
```

Kemudian update `.env.local`:
```env
DB_USER=phc_user
DB_PASSWORD=your_strong_password
```

### 6. Cek Database Exists

```sql
mysql -u root -p
SHOW DATABASES;
```

Jika database `phc_dashboard` tidak ada, buat:
```sql
CREATE DATABASE phc_dashboard;
```

### 7. Setup Database Tables

```bash
cd /www/wwwroot/dashapp
npm run db:setup
# atau
node scripts/setup-complete-db.js
```

### 8. Restart Application

```bash
# Jika menggunakan PM2
pm2 restart dash-app

# Jika menggunakan systemd
sudo systemctl restart dash-app

# Atau restart manual
pkill -f "next"
npm start
```

### 9. Test Koneksi

```bash
# Test health check
curl https://dash.doctorphc.id/api/health

# Test mobile API
curl https://dash.doctorphc.id/api/mobile/users?limit=1
```

## Troubleshooting

### Error: "Access denied for user"

1. **Cek password MySQL**:
   ```bash
   mysql -u root -p
   ```

2. **Cek file .env.local**:
   ```bash
   cat .env.local
   ```

3. **Cek permission file**:
   ```bash
   chmod 600 .env.local
   ```

### Error: "Database does not exist"

1. **Buat database**:
   ```sql
   CREATE DATABASE phc_dashboard;
   ```

2. **Setup tables**:
   ```bash
   npm run db:setup
   ```

### Error: "Connection refused"

1. **Cek MySQL service**:
   ```bash
   systemctl status mysql
   # atau
   service mysql status
   ```

2. **Start MySQL jika tidak running**:
   ```bash
   systemctl start mysql
   ```

## Quick Fix Commands

```bash
# 1. SSH ke server
ssh root@your-server-ip

# 2. Masuk ke direktori aplikasi
cd /www/wwwroot/dashapp

# 3. Cek file environment
ls -la .env*

# 4. Buat file .env.local jika tidak ada
nano .env.local

# 5. Isi dengan konfigurasi yang benar
# (Copy dari section 3 di atas)

# 6. Set permission
chmod 600 .env.local

# 7. Test MySQL connection
mysql -u root -p

# 8. Restart aplikasi
pm2 restart dash-app

# 9. Test API
curl https://dash.doctorphc.id/api/health
```

## Verification

Setelah fix, test dengan:

```bash
# 1. Health check
curl https://dash.doctorphc.id/api/health

# 2. Mobile users API
curl https://dash.doctorphc.id/api/mobile/users?limit=1

# 3. Mobile login API
curl -X POST https://dash.doctorphc.id/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mobile.com","password":"password123"}'
```

## Expected Results

✅ **Health Check**: `{"status":"ok","message":"Server is running"}`
✅ **Users API**: `{"success":true,"users":[...]}`
✅ **Login API**: `{"success":true,"data":{"user":{...}}}`

## Mobile App Configuration

Setelah server production berfungsi, mobile app sudah dikonfigurasi untuk menggunakan:
- **Production**: `https://dash.doctorphc.id/api/mobile`
- **Development**: `http://localhost:3000/api/mobile`

Mobile app akan otomatis menggunakan server production ketika tidak dalam mode development.
