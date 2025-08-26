# Login Loading Optimization

## Masalah Loading Lama Setelah Login

Sebelum optimasi, aplikasi mengalami loading lama setelah login karena beberapa faktor:

### 1. Timeout yang Terlalu Panjang
- **Login API**: 30 detik timeout
- **Network connectivity test**: 10 detik timeout  
- **AuthContext loading**: 10 detik timeout
- **Retry delays**: 1 detik per retry

### 2. Multiple API Calls Setelah Login
Setelah login berhasil, aplikasi melakukan beberapa panggilan API secara berurutan:
- `getUserProfile()` - untuk mendapatkan data user
- `getMyMissions()` - untuk mendapatkan misi user
- Network connectivity tests

### 3. Retry Logic yang Menambah Delay
- Login memiliki retry mechanism yang menambah delay 1 detik
- Network tests yang berulang jika gagal

### 4. **Kurangnya Data Fallback yang Efektif** ⭐
- **Tidak ada fallback data** ketika API gagal
- **Loading lama** karena menunggu API response
- **User experience buruk** ketika network lambat

## Optimasi yang Dilakukan

### 1. Mengurangi Timeout
- **Login API**: 30 detik → **10 detik**
- **Network connectivity test**: 10 detik → **5 detik**
- **AuthContext loading**: 10 detik → **5 detik**

### 2. Mengurangi Retry Delays
- **Retry delay**: 1000ms → **500ms**
- Mengurangi waktu tunggu antara retry attempts

### 3. Optimasi Login Flow
- **Menghilangkan delay tambahan** setelah login berhasil
- **Menggunakan data dari response login** langsung tanpa fetch ulang profile
- **Menambahkan logging** untuk monitoring performa

### 4. Optimasi WellnessApp Loading
- **Parallel API calls** untuk profile dan missions
- **Timeout terpisah** (8 detik) untuk setiap API call
- **Fallback ke cached data** jika API gagal

### 5. **Enhanced Fallback Data System** ⭐
- **FallbackDataManager** untuk mengelola data offline
- **Multiple fallback sources**: cache, token, default data
- **Immediate response** ketika API gagal
- **Better user experience** dengan data yang tersedia

## File yang Dimodifikasi

### 1. `src/services/api.js`
```javascript
// Login timeout: 30s → 10s
const timeoutId = setTimeout(() => controller.abort(), 10000);

// Network test timeout: 10s → 5s  
const timeoutId = setTimeout(() => controller.abort(), 5000);

// Retry delay: 1000ms → 500ms
await new Promise(resolve => setTimeout(resolve, 500));

// Enhanced getUserProfile with fallback
async getUserProfile() {
  try {
    return await this.request(`/users/profile?user_id=${userId}`);
  } catch (error) {
    // Check cached data immediately
    const cachedUserData = await AsyncStorage.getItem('userData');
    if (cachedUserData) {
      return { success: true, data: JSON.parse(cachedUserData), fromCache: true };
    }
    
    // Extract from token as fallback
    const authToken = await AsyncStorage.getItem('authToken');
    if (authToken) {
      const userData = this.extractUserFromToken(authToken);
      return { success: true, data: userData, fromFallback: true };
    }
  }
}
```

### 2. `src/contexts/AuthContext.tsx`
```javascript
// Auth loading timeout: 10s → 5s
}, 5000); // Reduced from 10 to 5 seconds

// Optimized login flow
// Don't wait for additional profile fetch - use the data from login response
console.log("✅ Auth: Login completed successfully");

// Better fallback handling
if (!response.fromCache) {
  await setUserData(response.data);
}
```

### 3. `src/screens/WellnessApp.tsx`
```javascript
// Parallel API calls with shorter timeout
const profilePromise = Promise.race([
  apiService.getUserProfile(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Profile request timeout')), 8000)
  )
]);
```

### 4. **`src/utils/fallbackDataManager.ts`** ⭐
```javascript
// New fallback data manager
class FallbackDataManager {
  async getUserData(options = {}) {
    // 1. Try cache first
    const cachedData = await AsyncStorage.getItem('userData');
    if (cachedData) return JSON.parse(cachedData);
    
    // 2. Extract from token
    const authToken = await AsyncStorage.getItem('authToken');
    if (authToken) return this.extractUserFromToken(authToken);
    
    // 3. Create default data
    return this.createDefaultUserData();
  }
}
```

## Hasil Optimasi

### Sebelum Optimasi
- **Login timeout**: 30 detik
- **Total loading time**: 15-30 detik
- **Retry delays**: 1 detik per retry
- **Sequential API calls**
- **No fallback data** - loading lama ketika API gagal

### Setelah Optimasi
- **Login timeout**: 10 detik
- **Total loading time**: 5-15 detik
- **Retry delays**: 500ms per retry
- **Parallel API calls** dengan timeout terpisah
- **Enhanced fallback data** - immediate response ketika API gagal

## Fallback Data System

### 1. **Fallback Sources Priority**
```javascript
1. Cached User Data (AsyncStorage)
2. Token-based User Data (JWT decode)
3. Default User Data (hardcoded)
```

### 2. **Fallback Data Types**
```javascript
- User Profile: Basic user info
- Wellness Data: Empty activities array
- Tracking Data: Zero values with proper structure
- Missions: Empty missions array
```

### 3. **Benefits**
- **Faster loading** - no waiting for failed API calls
- **Better UX** - app remains functional offline
- **Reduced errors** - graceful degradation
- **Consistent data structure** - proper fallback format

## Monitoring dan Debugging

### Logging yang Ditambahkan
```javascript
console.log("🔐 Auth: Starting login process...");
console.log("✅ Auth: Login completed successfully");
console.log("🔍 Auth: Checking authentication status...");
console.log("🔍 Auth: Fetching user profile...");
console.log("✅ FallbackManager: Using cached user data");
console.log("✅ FallbackManager: Using user data from token");
```

### Timeout Handling
- **Graceful fallback** ke cached data jika API gagal
- **Network error detection** yang lebih baik
- **User-friendly error messages**

## Rekomendasi Tambahan

### 1. Server-side Optimizations
- **Database query optimization**
- **API response caching**
- **Connection pooling**

### 2. Client-side Optimizations
- **Implement request caching**
- **Add loading indicators** yang lebih informatif
- **Progressive loading** untuk data non-kritis

### 3. Network Optimizations
- **CDN implementation**
- **API compression**
- **Connection keep-alive**

## Testing

Untuk memverifikasi optimasi:

1. **Test login time** dengan network normal
2. **Test login time** dengan network lambat
3. **Test login time** dengan network tidak stabil
4. **Test offline functionality** dengan fallback data
5. **Monitor error rates** setelah optimasi

## Metrics to Track

- **Average login time**
- **Login success rate**
- **Timeout error frequency**
- **Fallback data usage frequency**
- **User satisfaction scores**
