# Tracking Page Wellness Access Control Fix

## 🔍 **Issue Description**

**Problem**: Halaman tracking di MainScreen tidak memiliki pengecekan status program wellness. User yang belum mendaftar program wellness masih bisa mengakses fitur tracking kesehatan.

**Expected Behavior**: User harus mendaftar program wellness terlebih dahulu sebelum bisa mengakses fitur tracking kesehatan.

## ✅ **Root Cause**

Halaman tracking di MainScreen.tsx hanya mengecek autentikasi user, tetapi tidak memeriksa apakah user sudah mendaftar program wellness atau belum.

## 🔧 **Solution Applied**

### **1. Frontend Fix (src/screens/MainScreen.tsx - TrackingTab)**

**Added Wellness Program Status Check**:
```javascript
// Check wellness program status when component mounts
useEffect(() => {
  const checkWellnessStatus = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.getWellnessProgramStatus();
      if (response.success && response.data) {
        setWellnessProgramStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking wellness status:', error);
      // Fallback to user data from AuthContext
      if (user) {
        setWellnessProgramStatus({
          has_joined: (user as any).wellness_program_joined === true,
          needs_onboarding: !(user as any).wellness_program_joined
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  checkWellnessStatus();
}, [isAuthenticated, user]);
```

**Added Access Control Logic**:
```javascript
// Show wellness program registration prompt if user hasn't joined
if (!wellnessProgramStatus.has_joined) {
  return (
    <LinearGradient colors={["#FAFBFC", "#F7FAFC"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
      <View style={styles.authPrompt}>
        <Icon name="heart-pulse" size={64} color="#E22345" />
        <Text style={styles.authPromptTitle}>Program Wellness Diperlukan</Text>
        <Text style={styles.authPromptSubtitle}>
          Anda perlu mendaftar program wellness terlebih dahulu untuk mengakses fitur tracking kesehatan
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("WellnessApp")}
        >
          <Text style={styles.loginButtonText}>Daftar Program Wellness</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
```

## 📋 **New Access Rules**

### **User CAN access tracking features if:**
- ✅ User sudah login (`isAuthenticated = true`)
- ✅ User sudah mendaftar program wellness (`wellness_program_joined = true`)

### **User CANNOT access tracking features if:**
- ❌ User belum login
- ❌ User belum mendaftar program wellness

## 🎯 **User Experience**

### **For Users Who Haven't Registered Wellness Program:**
1. ✅ Login ke aplikasi
2. ❌ Klik tab "Tracking"
3. ✅ Melihat pesan "Program Wellness Diperlukan"
4. ✅ Klik "Daftar Program Wellness" untuk diarahkan ke WellnessApp
5. ✅ Selesaikan pendaftaran program wellness
6. ✅ Kembali ke tab "Tracking" untuk mengakses fitur

### **For Users Who Have Registered Wellness Program:**
1. ✅ Login ke aplikasi
2. ✅ Klik tab "Tracking"
3. ✅ Langsung mengakses semua fitur tracking kesehatan

## 🔄 **Migration Impact**

### **Existing Users with Wellness Registration:**
- ✅ No impact - access remains unchanged

### **Existing Users without Wellness Registration:**
- ❌ Will lose access to tracking features
- ✅ Will be prompted to register for wellness program
- ✅ Can regain access after completing registration

## 🧪 **Testing**

### **Test Cases:**

1. **User Not Logged In**
   - Expected: Shows login prompt
   - Status: ✅ Should work correctly

2. **User Logged In but No Wellness Registration**
   - Expected: Shows wellness program registration prompt
   - Status: ✅ Fixed with this update

3. **User Logged In with Wellness Registration**
   - Expected: Shows tracking features
   - Status: ✅ Should work correctly

4. **Network Error During Status Check**
   - Expected: Falls back to AuthContext user data
   - Status: ✅ Should work correctly

## 📝 **Files Modified**

1. `src/screens/MainScreen.tsx` - Added wellness program status check to TrackingTab

## 🎯 **Conclusion**

This fix ensures that users must properly register for the wellness program before accessing the tracking features. The tracking page now has proper access control that matches the wellness app access logic.

### **Benefits:**
- ✅ Consistent access control across the app
- ✅ Proper user flow for wellness program registration
- ✅ Better user experience with clear guidance
- ✅ Prevents unauthorized access to tracking features
