# User Cycle Logic Fix - Wellness Program

## 🔍 **Masalah yang Diperbaiki**

**Permintaan**: "perbaiki logika ketika daftar user baru program user cycle masih 0, dan akan bertambah ketika wellnessApp terdaftar"

### **Masalah Sebelumnya:**
- User baru mendaftar dengan `wellness_program_cycles = 1` (default)
- Cycle tidak bertambah dengan benar ketika user mendaftar ke wellness program
- Logika increment cycle tidak konsisten

## ✅ **Solusi yang Diterapkan**

### **1. Database Schema Fix**

#### **Update Default Value**
```sql
ALTER TABLE mobile_users 
MODIFY COLUMN wellness_program_cycles INT DEFAULT 0;
```

**Sebelum**: `wellness_program_cycles INT DEFAULT 1`
**Sesudah**: `wellness_program_cycles INT DEFAULT 0`

### **2. Registration API Fix**

#### **File**: `dash-app/app/api/mobile/auth/register/route.js`

**Sebelum**:
```javascript
// Insert new user
const sql = `
  INSERT INTO mobile_users (
    name, email, phone, password, date_of_birth, gender,
    emergency_contact_name, emergency_contact_phone, ktp_number, address, insurance,
    insurance_card_number, is_active, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
`;
```

**Sesudah**:
```javascript
// Insert new user with wellness_program_cycles set to 0
const sql = `
  INSERT INTO mobile_users (
    name, email, phone, password, date_of_birth, gender,
    emergency_contact_name, emergency_contact_phone, ktp_number, address, insurance,
    insurance_card_number, wellness_program_cycles, is_active, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, NOW(), NOW())
`;
```

### **3. Setup Wellness API Fix**

#### **File**: `dash-app/app/api/mobile/setup-wellness/route.js`

**Sebelum**:
```javascript
// Simple increment
await query(
  `UPDATE mobile_users 
   SET wellness_program_cycles = wellness_program_cycles + 1,
       // ... other fields
   WHERE id = ?`,
  [/* params */]
);
```

**Sesudah**:
```javascript
// Check if user is joining for the first time or renewing
const [currentUser] = await query(
  'SELECT wellness_program_joined, wellness_program_cycles FROM mobile_users WHERE id = ?',
  [user.id]
);

let newCycleCount = 1; // Default for first time join
if (currentUser && currentUser.wellness_program_joined) {
  // User is renewing, increment existing cycles
  newCycleCount = (currentUser.wellness_program_cycles || 0) + 1;
  console.log(`🔄 User renewing wellness program. Previous cycles: ${currentUser.wellness_program_cycles}, New cycles: ${newCycleCount}`);
} else {
  console.log(`🎯 User joining wellness program for the first time. Setting cycles to: ${newCycleCount}`);
}

await query(
  `UPDATE mobile_users 
   SET wellness_program_cycles = ?,
       // ... other fields
   WHERE id = ?`,
  [newCycleCount, /* other params */]
);
```

## 📊 **Logika User Cycle yang Benar**

### **Flow User Cycle:**

1. **User Baru Mendaftar**
   - `wellness_program_cycles = 0`
   - `wellness_program_joined = FALSE`

2. **User Mendaftar ke Wellness Program (Pertama Kali)**
   - `wellness_program_cycles = 1`
   - `wellness_program_joined = TRUE`

3. **User Renewal Program (Kedua Kali)**
   - `wellness_program_cycles = 2`
   - `wellness_program_joined = TRUE`

4. **User Renewal Program (Ketiga Kali)**
   - `wellness_program_cycles = 3`
   - `wellness_program_joined = TRUE`

### **Validasi Logika:**
```javascript
// Correct logic validation
if (user.wellness_program_joined && user.wellness_program_cycles > 0) {
  // ✅ User joined and has cycles
} else if (!user.wellness_program_joined && user.wellness_program_cycles === 0) {
  // ✅ User not joined and has 0 cycles
} else {
  // ⚠️ Logic inconsistency detected
}
```

## 🧪 **Test Results**

### **Test Scenario 1: New User Registration**
```
👤 Test User 1 (ID: 1):
   Initial Cycles: 0
   Wellness Joined: NO
   ✅ CORRECT: New user starts with 0 cycles
```

### **Test Scenario 2: First Time Wellness Join**
```
👤 Test User 1 (ID: 1):
   After First Join:
   Cycles: 1
   Wellness Joined: YES
   ✅ CORRECT: First join sets cycles to 1
```

### **Test Scenario 3: Program Renewal**
```
👤 Test User 1 (ID: 1):
   After Renewal:
   Cycles: 2
   Wellness Joined: YES
   ✅ CORRECT: Renewal increments cycles
```

### **Test Scenario 4: Multiple Renewals**
```
👤 Test User 2 (ID: 2):
   Renewal 1: Cycles = 1
   Renewal 2: Cycles = 2
   Renewal 3: Cycles = 3
   ✅ CORRECT: Each renewal increments cycles
```

## 🔧 **Scripts yang Dibuat**

### **1. Fix Script**: `scripts/fix-user-cycle-logic.js`
- Memperbaiki default value database
- Reset cycles untuk user yang belum join wellness
- Validasi logika setelah perbaikan

### **2. Test Script**: `scripts/test-user-cycle-logic.js`
- Test user baru dengan 0 cycles
- Test first time wellness join
- Test program renewal
- Test multiple renewals
- Validasi semua skenario

## 📋 **Summary Perubahan**

### **Database Changes:**
- ✅ Default `wellness_program_cycles` diubah dari 1 ke 0
- ✅ User yang belum join wellness di-reset ke 0 cycles

### **API Changes:**
- ✅ Registration API: User baru dimulai dengan 0 cycles
- ✅ Setup Wellness API: Logic increment cycle yang lebih robust
- ✅ Handling untuk first-time join vs renewal

### **Logic Validation:**
- ✅ User baru: 0 cycles, belum join wellness
- ✅ First join: 1 cycle, joined wellness
- ✅ Renewal: Increment cycles, tetap joined wellness

## 🎯 **Hasil Akhir**

**Logika User Cycle sekarang berfungsi dengan benar:**

1. **User baru mendaftar** → `wellness_program_cycles = 0`
2. **User mendaftar ke wellness program** → `wellness_program_cycles = 1`
3. **User renewal program** → `wellness_program_cycles = 2, 3, 4, dst`

**Semua test berhasil dan logika konsisten!** 🎉

## 🚀 **Cara Test Manual**

```bash
# 1. Test database fix
node scripts/fix-user-cycle-logic.js

# 2. Test logic validation
node scripts/test-user-cycle-logic.js

# 3. Test in app:
#    - Register new user → Should have 0 cycles
#    - Join wellness program → Should have 1 cycle
#    - Complete program and renew → Should have 2 cycles
```
