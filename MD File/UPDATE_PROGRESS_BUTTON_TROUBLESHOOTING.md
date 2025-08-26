# 🔧 Update Progress Manual Button Troubleshooting Guide

## 🚨 **Masalah yang Ditemukan**

Button "Update Progress Manual" masih bermasalah dan tidak berfungsi dengan baik.

## 🔍 **Diagnosis Steps**

### **Step 1: Run Diagnosis Script**
```bash
cd /Users/wirawanawe/Project/phc-mobile
node scripts/diagnose-update-progress-button.js
```

Script ini akan:
- ✅ Test koneksi database
- ✅ Check struktur tabel user_missions dan missions
- ✅ Identifikasi active user missions
- ✅ Check data consistency issues
- ✅ Simulasi API endpoint
- ✅ Identifikasi common issues

### **Step 2: Run Fix Script**
```bash
node scripts/fix-update-progress-button.js
```

Script ini akan:
- ✅ Fix null values dalam user_missions
- ✅ Fix negative values
- ✅ Fix inconsistent progress calculations
- ✅ Ensure proper mission status
- ✅ Create test missions jika tidak ada
- ✅ Fix missing timestamps

### **Step 3: Test API Endpoint**
```bash
node scripts/test-update-progress-api.js
```

Script ini akan:
- ✅ Test API endpoint tanpa authentication
- ✅ Test API endpoint dengan mock authentication
- ✅ Test dengan invalid user mission ID
- ✅ Test dengan invalid data
- ✅ Test database update langsung

## 🎯 **Common Issues & Solutions**

### **Issue 1: "Invalid Mission ID" Error**

**Symptoms**:
- Dialog error "Invalid Mission ID"
- Button tidak bisa diklik
- Mission data tidak valid

**Root Cause**:
- `userMission.id` tidak valid atau `undefined`
- Data mission corrupt atau hilang
- Navigasi dengan data yang tidak valid

**Solutions**:
```typescript
// Enhanced validation sudah diimplementasikan
if (!userMission.id || typeof userMission.id !== 'number') {
  Alert.alert(
    "⚠️ Invalid Mission ID",
    "ID mission tidak valid. Silakan refresh data atau pilih mission lain.",
    [
      { text: "Refresh Data", onPress: () => refreshUserMissionData() },
      { text: "Go Back", onPress: () => safeGoBack(navigation, 'Main') },
      { text: "Cancel", style: "cancel" }
    ]
  );
  return;
}
```

### **Issue 2: Button Disabled**

**Symptoms**:
- Button tidak bisa diklik
- Button text menunjukkan "Mission Not Available"
- Opacity button berkurang

**Root Cause**:
- `userMission` tidak ada
- `userMission.status` bukan "active"
- `loading` state aktif

**Solutions**:
```typescript
// Check button disabled state
disabled={loading || !userMission || userMission.status !== "active"}

// Check button text
{loading 
  ? 'Updating Progress...' 
  : !userMission 
    ? 'Mission Not Available'
    : userMission.status === "completed"
      ? 'Mission Completed'
      : userMission.status === "cancelled"
        ? 'Mission Cancelled'
        : `Update Progress Manual (${getProgressPercentage()}%)`
}
```

### **Issue 3: API Error**

**Symptoms**:
- Error "Unable to Update Progress"
- Network error messages
- Server error responses

**Root Cause**:
- Authentication issues
- Network connectivity problems
- Server errors
- Invalid API endpoint

**Solutions**:
```typescript
// Enhanced error handling sudah diimplementasikan
if (errorMessage.includes("server error") || errorMessage.includes("500")) {
  Alert.alert(
    "🌐 Server Temporarily Unavailable",
    "Our servers are experiencing high traffic. Please try again in a few minutes.",
    [
      { text: "Try Again", onPress: () => handleUpdateProgress() },
      { text: "Cancel", style: "cancel" }
    ]
  );
} else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
  Alert.alert(
    "📡 Connection Issue",
    "Please check your internet connection and try again.",
    [
      { text: "Retry", onPress: () => handleUpdateProgress() },
      { text: "Cancel", style: "cancel" }
    ]
  );
}
```

### **Issue 4: Database Issues**

**Symptoms**:
- Progress tidak terupdate
- Data tidak konsisten
- Null values dalam database

**Root Cause**:
- Null values dalam user_missions
- Inconsistent progress calculations
- Missing timestamps
- Invalid status values

**Solutions**:
```sql
-- Fix null values
UPDATE user_missions 
SET current_value = 0, progress = 0 
WHERE current_value IS NULL OR progress IS NULL;

-- Fix inconsistent progress calculations
UPDATE user_missions um
JOIN missions m ON um.mission_id = m.id
SET um.progress = ROUND((um.current_value / m.target_value) * 100)
WHERE um.progress != ROUND((um.current_value / m.target_value) * 100)
AND um.status = 'active';

-- Fix missing timestamps
UPDATE user_missions 
SET created_at = NOW(), updated_at = NOW()
WHERE created_at IS NULL OR updated_at IS NULL;
```

## 🔧 **Manual Fixes**

### **Fix 1: Check Database Data**
```sql
-- Check active user missions
SELECT 
  um.id as user_mission_id,
  um.user_id,
  um.status,
  um.current_value,
  um.progress,
  m.title,
  m.target_value
FROM user_missions um
JOIN missions m ON um.mission_id = m.id
WHERE um.status = 'active'
ORDER BY um.id DESC;

-- Check for issues
SELECT 
  COUNT(*) as total_missions,
  SUM(CASE WHEN current_value IS NULL OR progress IS NULL THEN 1 ELSE 0 END) as null_values,
  SUM(CASE WHEN current_value < 0 OR progress < 0 THEN 1 ELSE 0 END) as negative_values,
  SUM(CASE WHEN status IS NULL OR status = '' THEN 1 ELSE 0 END) as invalid_status
FROM user_missions;
```

### **Fix 2: Create Test Missions**
```sql
-- Create test user missions for user ID 1
INSERT INTO user_missions (user_id, mission_id, status, current_value, progress, notes, created_at, updated_at)
SELECT 1, id, 'active', 0, 0, 'Test mission', NOW(), NOW()
FROM missions
LIMIT 5;
```

### **Fix 3: Test API Endpoint**
```bash
# Test with curl
curl -X PUT http://localhost:3000/api/mobile/missions/progress/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"current_value": 5, "notes": "Test update"}'
```

## 📱 **Frontend Debugging**

### **Check Console Logs**
```typescript
// Enhanced logging sudah diimplementasikan
console.log('🔍 handleUpdateProgress called');
console.log('🔍 userMission:', userMission);
console.log('🔍 currentValue:', currentValue);
console.log('🔍 notes:', notes);
```

### **Check Button State**
```typescript
// Debug button disabled state
console.log('Button disabled:', loading || !userMission || userMission.status !== "active");
console.log('Loading:', loading);
console.log('UserMission exists:', !!userMission);
console.log('UserMission status:', userMission?.status);
```

### **Check API Response**
```typescript
// Enhanced API response logging
const response = await apiService.updateMissionProgress(userMission.id, {
  current_value: currentValue,
  notes: notes,
});

console.log('API Response:', response);
```

## 🎯 **Testing Checklist**

### **✅ Pre-Testing**
- [ ] Database connection working
- [ ] Active user missions exist
- [ ] API endpoint accessible
- [ ] Authentication working
- [ ] Network connectivity stable

### **✅ Button Testing**
- [ ] Button is enabled for active missions
- [ ] Button shows correct text
- [ ] Button responds to clicks
- [ ] Loading state works
- [ ] Disabled state works

### **✅ Validation Testing**
- [ ] Mission data validation works
- [ ] Progress value validation works
- [ ] Status validation works
- [ ] Error messages display correctly
- [ ] Recovery options work

### **✅ API Testing**
- [ ] API endpoint responds
- [ ] Authentication works
- [ ] Data updates correctly
- [ ] Error handling works
- [ ] Success responses work

### **✅ Database Testing**
- [ ] Data is saved correctly
- [ ] Progress calculations are accurate
- [ ] Timestamps are updated
- [ ] Status changes correctly
- [ ] No data corruption

## 🚀 **Quick Fix Commands**

### **Run All Fixes**
```bash
# 1. Diagnose issues
node scripts/diagnose-update-progress-button.js

# 2. Fix database issues
node scripts/fix-update-progress-button.js

# 3. Test API endpoint
node scripts/test-update-progress-api.js

# 4. Restart development server
cd dash-app && npm run dev
```

### **Check Logs**
```bash
# Check app logs
tail -f logs/app.log

# Check API logs
tail -f logs/api.log

# Check database logs
tail -f logs/db.log
```

## 🎉 **Expected Results**

### **After Fixes**:
- ✅ Button enabled for active missions
- ✅ Button shows "Update Progress Manual (X%)"
- ✅ Clicking button shows "Updating Progress..."
- ✅ Success message: "Progress Updated" or "Mission Completed!"
- ✅ Progress updates correctly in database
- ✅ UI reflects updated progress

### **Error Handling**:
- ✅ Clear error messages in Indonesian
- ✅ Multiple recovery options
- ✅ Retry functionality for transient errors
- ✅ Graceful fallback for network issues

## 📞 **Support**

Jika masalah masih berlanjut setelah menjalankan semua script di atas:

1. **Check Console Logs**: Lihat error messages di console
2. **Check Network Tab**: Lihat API requests di browser dev tools
3. **Check Database**: Verifikasi data di database
4. **Check Authentication**: Pastikan user sudah login
5. **Check Mission Data**: Pastikan mission data valid

**Contact**: Jika masih bermasalah, berikan error messages dan console logs untuk analisis lebih lanjut.
