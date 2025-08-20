# Password Hashing Fix - PHC Mobile

## Masalah yang Ditemukan

Password di database masih belum ter-hash dengan benar. Beberapa endpoint API menyimpan password dalam bentuk plain text ke database, yang merupakan masalah keamanan serius.

## File yang Bermasalah

### 1. `dash-app/app/api/users/route.js`
- **Masalah**: Password tidak di-hash sebelum disimpan ke database
- **Baris**: 125-130
- **Status**: ✅ **DIPERBAIKI**

### 2. Database Existing Users
- **Masalah**: 24 user memiliki password plain text di database
- **Status**: ✅ **DIPERBAIKI**

## Solusi yang Diterapkan

### 1. Perbaikan API Endpoint
```javascript
// SEBELUM (TIDAK AMAN)
const sql = `
  INSERT INTO users (name, email, password, role, is_active)
  VALUES ('${body.name}', '${body.email}', '${body.password}', '${body.role || 'staff'}', ${body.is_active !== undefined ? body.is_active : true})
`;

// SESUDAH (AMAN)
const bcrypt = await import('bcryptjs');
const hashedPassword = await bcrypt.default.hash(body.password, 10);

const sql = `
  INSERT INTO users (name, email, password, role, is_active)
  VALUES ('${body.name}', '${body.email}', '${hashedPassword}', '${body.role || 'staff'}', ${body.is_active !== undefined ? body.is_active : true})
`;
```

### 2. Script Perbaikan Database
File: `dash-app/scripts/fix-password-hashing.js`

Script ini akan:
- Mengecek semua user di tabel `users` dan `mobile_users`
- Mengidentifikasi password yang belum ter-hash (tidak dimulai dengan `$2a$` atau `$2b$`)
- Meng-hash password tersebut menggunakan bcrypt dengan salt rounds 10
- Menampilkan laporan lengkap tentang user yang diperbaiki

## Hasil Perbaikan

```
📋 Summary:
Users table: 1 updated, 1 skipped
Mobile users table: 23 updated, 0 skipped
Total updated: 24

✅ Password hashing fix completed successfully!
```

## Cara Menjalankan Script Perbaikan

```bash
cd dash-app
node scripts/fix-password-hashing.js
```

## Endpoint yang Sudah Aman

Berikut adalah endpoint yang sudah menggunakan password hashing dengan benar:

### ✅ Sudah Aman
- `POST /api/auth/register` - Dashboard registration
- `POST /api/auth/login` - Dashboard login
- `POST /api/mobile/auth/register` - Mobile app registration
- `POST /api/mobile/auth/login` - Mobile app login
- `POST /api/settings/users` - Admin user creation
- `PUT /api/profile/update` - Password update

### ✅ Baru Diperbaiki
- `POST /api/users` - User creation (admin panel)

## Verifikasi Keamanan

Untuk memverifikasi bahwa password sudah aman, cek di database:

```sql
-- Cek password yang sudah ter-hash (aman)
SELECT email, password FROM users WHERE password LIKE '$2a$%' OR password LIKE '$2b$%';

-- Cek password yang masih plain text (tidak aman)
SELECT email, password FROM users WHERE password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%';
```

## Best Practices untuk Password Hashing

1. **Selalu gunakan bcrypt** dengan salt rounds minimal 10
2. **Jangan pernah menyimpan password plain text** di database
3. **Gunakan prepared statements** untuk mencegah SQL injection
4. **Validasi input** sebelum hashing
5. **Gunakan environment variables** untuk JWT secret

## Contoh Implementasi yang Benar

```javascript
import bcrypt from 'bcryptjs';

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

## Monitoring

Setelah perbaikan ini, pastikan untuk:
1. Monitor log aplikasi untuk error autentikasi
2. Test login dengan user yang passwordnya sudah di-hash
3. Verifikasi bahwa user baru yang dibuat memiliki password ter-hash
4. Backup database sebelum dan sesudah perbaikan

## Catatan Penting

- Password yang sudah di-hash **tidak bisa di-decode** kembali ke plain text
- User yang sudah ada tetap bisa login dengan password asli mereka
- Pastikan semua endpoint yang membuat user baru menggunakan hashing
- Review semua script database untuk memastikan tidak ada password plain text
