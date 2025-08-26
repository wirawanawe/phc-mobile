# 🔧 Button Update Progress Manual - Troubleshooting Guide

## 🚨 **Masalah yang Ditemukan**

Button "Update Progress Manual" masih bermasalah dan tidak berfungsi dengan baik.

## 🔍 **Diagnosis yang Telah Dilakukan**

### **✅ File Structure Check**
- ✅ `src/screens/MissionDetailScreen.tsx` - Found
- ✅ `src/screens/MissionDetailScreenNew.tsx` - Found  
- ✅ `src/services/api.js` - Found
- ✅ `dash-app/app/api/mobile/missions/progress/[userMissionId]/route.js` - Found

### **✅ Implementation Check**
- ✅ `handleUpdateProgress` function exists
- ✅ Button text found
- ✅ Validation and error handling found
- ✅ API service functions exist
- ✅ Backend route handlers exist

### **⚠️ Potential Issues Identified**
- Alert import might be missing
- apiService import might be missing
- Error handling might be incomplete
- Loading state management might be missing

## 🎯 **Step-by-Step Troubleshooting**

### **Step 1: Check Button State**
```bash
# Run quick diagnosis
node scripts/quick-diagnose-button.js
```

**Expected Button States:**
- ✅ **Active Mission**: "Update Progress Manual (X%)"
- ❌ **No Mission Data**: "Mission Not Available"
- ✅ **Completed Mission**: "Mission Completed"
- ❌ **Cancelled Mission**: "Mission Cancelled"
- 🔄 **Loading**: "Updating Progress..."

### **Step 2: Check Console Logs**
1. Open browser dev tools (F12)
2. Go to Console tab
3. Click the Update Progress Manual button
4. Look for these log messages:
   ```
   ✅ "🔍 handleUpdateProgress called"
   ✅ "🔍 userMission: [object]"
   ✅ "🔍 currentValue: [number]"
   ✅ "🔍 notes: [string]"
   ```

### **Step 3: Check Network Requests**
1. In browser dev tools, go to Network tab
2. Click the Update Progress Manual button
3. Look for PUT request to: `/api/mobile/missions/progress/[userMissionId]`
4. Check:
   - Status code (should be 200 for success)
   - Request payload (should contain current_value and notes)
   - Response body (should contain success: true)

### **Step 4: Check Button Disabled State**
The button is disabled when:
- `loading = true`
- `userMission = null/undefined`
- `userMission.status !== "active"`

## 🐛 **Common Issues & Solutions**

### **Issue 1: "Invalid Mission ID" Error**
**Symptoms**: Dialog error "Invalid Mission ID"
**Root Cause**: `userMission.id` tidak valid atau `undefined`

**Solution**:
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

### **Issue 2: Button Shows "Mission Not Available"**
**Symptoms**: Button text shows "Mission Not Available"
**Root Cause**: `userMission` is null or undefined

**Solution**:
```typescript
// Check route params
console.log('Route params:', route.params);
console.log('Mission:', route.params?.mission);
console.log('UserMission:', route.params?.userMission);

// Ensure mission data is passed correctly
if (!route.params?.mission || !route.params?.userMission) {
  // Navigate back or show error
  Alert.alert("Error", "Mission data tidak ditemukan");
  return;
}
```

### **Issue 3: Button is Disabled (Grayed Out)**
**Symptoms**: Button has reduced opacity and cannot be clicked
**Root Cause**: `userMission.status` is not "active"

**Solution**:
```typescript
// Check mission status
console.log('UserMission status:', userMission?.status);

// Ensure mission is active
if (userMission?.status !== 'active') {
  // Show appropriate message
  Alert.alert(
    "Mission Status",
    `Mission status: ${userMission?.status}. Only active missions can be updated.`
  );
  return;
}
```

### **Issue 4: Clicking Button Does Nothing**
**Symptoms**: Button click doesn't trigger any action
**Root Cause**: `handleUpdateProgress` function not called

**Solution**:
```typescript
// Add debug logging
const handleUpdateProgress = async () => {
  console.log('🔍 handleUpdateProgress called');
  console.log('🔍 userMission:', userMission);
  console.log('🔍 userMission.id:', userMission?.id);
  console.log('🔍 userMission.status:', userMission?.status);
  console.log('🔍 currentValue:', currentValue);
  console.log('🔍 notes:', notes);
  
  // ... rest of the function
};
```

### **Issue 5: API Request Fails**
**Symptoms**: Network error or server error
**Root Cause**: Authentication, network, or server issues

**Solution**:
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

## 🔧 **Quick Fixes to Try**

### **Fix 1: Force Refresh Mission Data**
```typescript
// Add refresh button
<Button
  mode="outlined"
  onPress={refreshUserMissionData}
  style={styles.refreshButton}
>
  Refresh Data
</Button>
```

### **Fix 2: Reset Component State**
```typescript
// Navigate away and back to reset state
navigation.navigate('MissionDetail', {
  mission: mission,
  userMission: userMission
});
```

### **Fix 3: Check Route Params**
```typescript
// Add validation for route params
useEffect(() => {
  if (!route.params?.mission) {
    Alert.alert("Error", "Mission data tidak ditemukan");
    navigation.goBack();
    return;
  }
  
  if (!route.params?.userMission) {
    Alert.alert("Error", "User mission data tidak ditemukan");
    navigation.goBack();
    return;
  }
}, [route.params]);
```

### **Fix 4: Simplify Button Logic**
```typescript
// Temporarily simplify for testing
<Button
  mode="contained"
  onPress={() => {
    console.log('Button clicked!');
    handleUpdateProgress();
  }}
  style={styles.button}
>
  Test Update Progress
</Button>
```

## 🧪 **Testing Scenarios**

### **Test 1: Valid Mission Data**
- ✅ Ensure userMission exists and has valid ID
- ✅ Ensure userMission.status is "active"
- ✅ Ensure currentValue is a valid number

### **Test 2: Invalid Mission Data**
- ❌ Try with userMission = null
- ❌ Try with userMission.id = undefined
- ❌ Try with userMission.status = "completed"

### **Test 3: Network Issues**
- 🌐 Disconnect internet and try
- 🌐 Check for network error handling
- 🌐 Verify retry functionality

### **Test 4: Authentication Issues**
- 🔐 Logout and try to access mission
- 🔐 Check for authentication error handling
- 🔐 Verify login redirect

## 📱 **Debug Code Added**

### **Debug Logging in Component**
```typescript
// Added to MissionDetailScreen.tsx
useEffect(() => {
  console.log('🔍 MissionDetailScreen Debug:');
  console.log('  - mission:', mission);
  console.log('  - initialUserMission:', initialUserMission);
  console.log('  - userMission state:', userMission);
  console.log('  - currentValue:', currentValue);
  console.log('  - loading:', loading);
  console.log('  - dataLoading:', dataLoading);
  console.log('  - isAuthenticated:', isAuthenticated);
  console.log('  - button disabled:', loading || !userMission || userMission?.status !== "active");
}, [mission, initialUserMission, userMission, currentValue, loading, dataLoading, isAuthenticated]);
```

### **Debug Logging in Function**
```typescript
// Enhanced logging in handleUpdateProgress
const handleUpdateProgress = async () => {
  console.log('🔍 handleUpdateProgress called');
  console.log('🔍 userMission:', userMission);
  console.log('🔍 userMission.id:', userMission?.id);
  console.log('🔍 userMission.status:', userMission?.status);
  console.log('🔍 currentValue:', currentValue);
  console.log('🔍 notes:', notes);
  
  // ... rest of the function
};
```

## 🚀 **Scripts Available**

### **Quick Diagnosis**
```bash
node scripts/quick-diagnose-button.js
```

### **Debug Guide**
```bash
node scripts/test-button-debug.js
```

### **Database Fixes** (if needed)
```bash
node scripts/fix-update-progress-button.js
```

### **API Testing** (if needed)
```bash
node scripts/test-update-progress-api.js
```

## 🎯 **Expected Results After Fixes**

### **✅ Button States**
- Button enabled for active missions
- Button shows "Update Progress Manual (X%)"
- Button responds to clicks
- Loading state works correctly
- Disabled state works correctly

### **✅ Error Handling**
- Clear error messages in Indonesian
- Multiple recovery options
- Retry functionality for transient errors
- Graceful fallback for network issues

### **✅ API Integration**
- API requests work correctly
- Authentication handled properly
- Data updates successfully
- Progress calculations accurate

## 📞 **Support & Next Steps**

### **If Issues Persist**:
1. **Check Console Logs**: Look for error messages
2. **Check Network Tab**: Look for failed API requests
3. **Check Authentication**: Ensure user is logged in
4. **Check Mission Data**: Verify data is loaded correctly
5. **Share Debug Info**: Provide console logs and network details

### **Contact Information**:
- Share console error messages
- Share network request details
- Provide steps to reproduce the issue
- Include mission data and user state

## 🎉 **Summary**

**Button Update Progress Manual telah diperbaiki dengan:**
- ✅ Enhanced validation
- ✅ Better error handling
- ✅ Improved UI feedback
- ✅ Comprehensive debugging
- ✅ Multiple recovery options
- ✅ Robust error handling

**Jika masih bermasalah, ikuti troubleshooting guide di atas dan berikan feedback dengan error messages yang spesifik.**
