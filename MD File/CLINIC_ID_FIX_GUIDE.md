# Clinic ID Fix Guide - Solusi Masalah clinic_id Tidak Tersimpan

## 🎯 Masalah yang Diperbaiki

**Masalah:** `clinic_id` tidak tersimpan saat membuat user admin melalui dashboard.

**Penyebab:** API endpoint POST `/api/users` tidak menyertakan `clinic_id` dalam query INSERT.

## ✅ Solusi yang Diimplementasikan

### 1. Perbaikan API Endpoint POST `/api/users`

**File:** `dash-app/app/api/users/route.js`

**Sebelum:**
```javascript
const sql = `
  INSERT INTO users (name, email, password, role, is_active)
  VALUES (?, ?, ?, ?, ?)
`;

const result = await query(sql, [
  body.name,
  body.email,
  hashedPassword,
  body.role || 'staff',
  body.is_active !== undefined ? body.is_active : true
]);
```

**Sesudah:**
```javascript
const sql = `
  INSERT INTO users (name, email, password, role, clinic_id, is_active)
  VALUES (?, ?, ?, ?, ?, ?)
`;

const result = await query(sql, [
  body.name,
  body.email,
  hashedPassword,
  body.role || 'staff',
  body.clinic_id || null,
  body.is_active !== undefined ? body.is_active : true
]);
```

### 2. Perbaikan API Endpoint PUT `/api/users/[id]`

**File:** `dash-app/app/api/users/[id]/route.js`

**Perbaikan:**
- Menggunakan parameterized queries untuk mencegah SQL injection
- Memastikan `clinic_id` diproses dengan benar saat update

```javascript
const result = await query(
  `UPDATE users SET name = ?, email = ?, role = ?, clinic_id = ?, updated_at = NOW() WHERE id = ?`,
  [body.name, body.email, body.role, body.clinic_id || null, params.id]
);
```

### 3. Enhanced Logging

Ditambahkan logging detail untuk debugging:

```javascript
console.log("🔍 POST /api/users - Request body:", JSON.stringify(body, null, 2));
console.log("✅ Validation passed - Creating new user");
console.log("✅ User created successfully with ID:", result.insertId);
```

## 🧪 Testing

### Test Script yang Dibuat

**File:** `scripts/test-clinic-id.js`

Script ini menguji berbagai skenario:

1. **Admin dengan clinic_id = 1**
2. **Admin dengan clinic_id = 2**
3. **Admin tanpa clinic_id (null)**
4. **Staff dengan clinic_id = 1**
5. **Update clinic_id**

### Cara Menjalankan Test

```bash
# Pastikan server berjalan
npm run dev

# Jalankan test script
node scripts/test-clinic-id.js
```

### Hasil Test

```
🚀 Starting Clinic ID Test Suite
📍 Testing endpoint: http://localhost:3000/api/users
⏰ Started at: 2025-08-15T02:37:21.891Z

🧪 Testing: Admin dengan clinic_id = 1
✅ PASS - clinic_id matches: 1

🧪 Testing: Admin dengan clinic_id = 2
✅ PASS - clinic_id matches: 2

🧪 Testing: Admin tanpa clinic_id (null)
✅ PASS - clinic_id matches: null

🧪 Testing: Staff dengan clinic_id = 1
✅ PASS - clinic_id matches: 1

🔄 Testing clinic_id update...
✅ PASS - clinic_id updated successfully: 2

📊 Test Results Summary:
✅ Passed: 5
❌ Failed: 0
📈 Success Rate: 100.0%

🎉 All tests passed! clinic_id is working correctly.
```

## 🔧 Manual Testing dengan curl

### Test Create User dengan clinic_id

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Test",
    "email": "admin.test@example.com",
    "password": "password123",
    "role": "admin",
    "clinic_id": 1
  }'
```

### Test Update User clinic_id

```bash
curl -X PUT http://localhost:3000/api/users/28 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Test Updated",
    "email": "admin.test@example.com",
    "role": "admin",
    "clinic_id": 2
  }'
```

### Verify clinic_id Tersimpan

```bash
curl -X GET http://localhost:3000/api/users/28
```

## 📋 Database Schema

### Users Table Structure

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin', 'doctor', 'staff') NOT NULL DEFAULT 'staff',
  clinic_id INT NULL,  -- ✅ Field ini sekarang tersimpan dengan benar
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_clinic_id (clinic_id)
);
```

## 🔒 Security Improvements

1. **SQL Injection Prevention**: Menggunakan parameterized queries
2. **Input Validation**: Validasi field yang diperlukan
3. **Error Handling**: Error handling yang lebih baik
4. **Logging**: Logging detail untuk debugging

## 🎯 Frontend Form

Form di `dash-app/app/users/components/UserForm.jsx` sudah benar:

```javascript
const submitData = {
  name: formData.name.trim(),
  email: formData.email.trim(),
  password: formData.password,
  role: formData.role,
  clinic_id: formData.clinic_id || null,  // ✅ Mengirim clinic_id
};
```

## 📝 Checklist Verifikasi

- [x] API endpoint POST `/api/users` menyertakan `clinic_id`
- [x] API endpoint PUT `/api/users/[id]` mendukung update `clinic_id`
- [x] Frontend form mengirim `clinic_id` dengan benar
- [x] Database menyimpan `clinic_id` dengan benar
- [x] Test script berhasil (100% pass rate)
- [x] Manual testing dengan curl berhasil
- [x] Security improvements diterapkan

## 🚀 Deployment

Setelah perbaikan ini, `clinic_id` akan tersimpan dengan benar saat:

1. **Membuat user admin baru** melalui dashboard
2. **Membuat user staff** dengan clinic tertentu
3. **Update user** untuk mengubah clinic assignment
4. **Import user** dari script atau API lain

## 🔍 Troubleshooting

Jika masih ada masalah:

1. **Check server logs** untuk error messages
2. **Run test script** untuk verifikasi
3. **Check database** langsung untuk memastikan data tersimpan
4. **Verify frontend form** mengirim data dengan benar

## 📞 Support

Jika ada masalah lebih lanjut:
1. Periksa log server untuk error detail
2. Jalankan test script untuk identifikasi masalah
3. Verifikasi koneksi database
4. Check apakah ada constraint violation di database
