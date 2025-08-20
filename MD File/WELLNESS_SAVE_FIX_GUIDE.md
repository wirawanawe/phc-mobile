# 🔧 **Wellness Data Saving Fix Guide**

## ❌ **Masalah: Tidak Bisa Menyimpan Data Saat Awal Memulai Program Wellness**

Berdasarkan diagnosis yang telah dilakukan, masalah utamanya adalah **database tables dan fields untuk wellness program belum dibuat**.

---

## 🔍 **Root Cause Analysis:**

### **Masalah yang Ditemukan:**
1. ❌ **Wellness fields tidak ada** di tabel `mobile_users`
2. ❌ **Database tables mungkin belum dibuat** dengan benar
3. ❌ **Backend endpoint membutuhkan fields** yang tidak tersedia

### **Fields yang Dibutuhkan:**
- `wellness_program_joined` (BOOLEAN)
- `wellness_join_date` (DATETIME)
- `activity_level` (ENUM)
- `fitness_goal` (ENUM)

---

## 🔧 **Solusi Lengkap:**

### **Step 1: Setup Database Tables**

```bash
# 1. Masuk ke direktori backend
cd dash-app

# 2. Jalankan complete setup script
mysql -u [username] -p [database] < init-scripts/00-complete-setup.sql

# 3. Tambahkan wellness fields
mysql -u [username] -p [database] < init-scripts/16-add-wellness-program-fields.sql
```

### **Step 2: Verify Database Setup**

```sql
-- Masuk ke MySQL
mysql -u [username] -p [database]

-- Cek tabel yang ada
SHOW TABLES;

-- Cek struktur tabel mobile_users
DESCRIBE mobile_users;

-- Cek wellness fields
SELECT wellness_program_joined, wellness_join_date, activity_level, fitness_goal 
FROM mobile_users LIMIT 5;
```

### **Step 3: Start Backend Server**

```bash
# Di direktori dash-app
npm run dev
```

### **Step 4: Test Wellness Setup**

1. **Buka aplikasi** dan login
2. **Klik wellness button** (icon heart)
3. **Isi form wellness setup** dengan data yang valid:
   - Berat badan (kg)
   - Tinggi badan (cm)
   - Gender
   - Activity level
   - Fitness goal
4. **Klik "Mulai Program Wellness"**
5. **Seharusnya data tersimpan** dan muncul pesan sukses

---

## 📋 **Expected Database Structure:**

### **Tabel mobile_users harus memiliki fields:**
```sql
CREATE TABLE mobile_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- ... existing fields ...
    wellness_program_joined BOOLEAN DEFAULT FALSE,
    wellness_join_date DATETIME NULL,
    activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active') NULL,
    fitness_goal ENUM('weight_loss', 'muscle_gain', 'maintenance', 'general_health') NULL
);
```

### **Tabel health_data harus ada:**
```sql
CREATE TABLE health_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) DEFAULT 'manual'
);
```

---

## 🚨 **Troubleshooting:**

### **Jika Masih Tidak Bisa Menyimpan:**

#### **1. Check Database Connection**
```bash
# Test database connection
cd dash-app
node -e "
const { query } = require('./lib/db');
query('SELECT 1 as test').then(result => {
  console.log('Database connection OK:', result);
}).catch(error => {
  console.log('Database connection failed:', error);
});
"
```

#### **2. Check Backend Logs**
```bash
# Lihat log backend untuk error
cd dash-app
npm run dev
# Kemudian coba save wellness data dan lihat log error
```

#### **3. Check API Endpoint**
```bash
# Test endpoint dengan curl
curl -X POST http://localhost:3000/api/mobile/setup-wellness \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [token]" \
  -d '{
    "weight": 70,
    "height": 170,
    "gender": "male",
    "activity_level": "moderately_active",
    "fitness_goal": "weight_loss"
  }'
```

#### **4. Use Debug Tools**
1. **Buka Profile screen** di app
2. **Klik "Debug Wellness"**
3. **Run diagnosis** untuk melihat error spesifik

---

## 🎯 **Validation Checklist:**

### **Database Setup:**
- [ ] `mobile_users` table exists
- [ ] `health_data` table exists
- [ ] `wellness_program_joined` field exists
- [ ] `wellness_join_date` field exists
- [ ] `activity_level` field exists
- [ ] `fitness_goal` field exists

### **Backend Setup:**
- [ ] Backend server running on port 3000
- [ ] Database connection working
- [ ] API endpoints responding
- [ ] Authentication working

### **Frontend Setup:**
- [ ] App can connect to backend
- [ ] Form validation working
- [ ] Error handling implemented
- [ ] Success handling implemented

---

## 🔧 **Quick Fix Commands:**

```bash
# 1. Setup database
cd dash-app
mysql -u [username] -p [database] < init-scripts/00-complete-setup.sql
mysql -u [username] -p [database] < init-scripts/16-add-wellness-program-fields.sql

# 2. Start backend
npm run dev

# 3. Test in app
# - Open app
# - Login
# - Try wellness setup
```

---

## 📱 **Expected Behavior After Fix:**

### **Successful Save:**
1. ✅ User mengisi form wellness
2. ✅ Klik "Mulai Program Wellness"
3. ✅ Data tersimpan ke database
4. ✅ Muncul pesan "Wellness program berhasil disetup!"
5. ✅ User diarahkan ke main wellness interface

### **Error Handling:**
1. ✅ Validasi form (semua field harus diisi)
2. ✅ Validasi nilai (weight/height > 0)
3. ✅ Network error handling
4. ✅ Database error handling
5. ✅ User-friendly error messages

---

## 🎉 **Kesimpulan:**

**Masalah penyimpanan data wellness disebabkan oleh:**
- Database tables belum dibuat dengan benar
- Wellness fields belum ditambahkan ke tabel mobile_users
- Backend membutuhkan struktur database yang lengkap

**Setelah menjalankan setup database:**
- ✅ Wellness data saving akan berfungsi
- ✅ User bisa setup program wellness
- ✅ Data tersimpan dengan benar
- ✅ Wellness program bisa diakses

**Silakan jalankan setup database sesuai panduan di atas!** 🚀
