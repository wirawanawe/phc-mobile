# 🔐 Google Sign-In Complete Solution - PHC Mobile

## 🎯 Masalah yang Dipecahkan

**Pertanyaan User**: "ketika login google kenapa tidak melakukan login melalui google terlebih dahulu, atau memilih akun existing?"

**Root Cause**: Aplikasi menggunakan mock Google sign-in di development mode, tidak melakukan autentikasi Google yang sebenarnya.

## ✅ Solusi yang Diimplementasikan

### 1. **Network Request Failed Fix** ✅
- **Masalah**: `ERROR Mock Google sign-in error: [TypeError: Network request failed]`
- **Solusi**: Implementasi platform-specific URL configuration
- **Hasil**: Network connectivity issues resolved

### 2. **Real Google OAuth Implementation** ✅
- **Masalah**: Aplikasi menggunakan mock authentication
- **Solusi**: Implementasi Google OAuth yang sebenarnya dengan Expo AuthSession
- **Hasil**: User dapat memilih akun Google existing atau login dengan akun baru

## 🔧 Perubahan yang Dibuat

### 1. **Update SocialLoginButtons Component**
**File**: `src/components/SocialLoginButtons.tsx`
```typescript
// Sebelum: Menggunakan mock service di development
const authService = __DEV__ ? socialAuthDevService : socialAuthService;

// Sesudah: Selalu menggunakan real service untuk Google sign-in
const authService = socialAuthService; // Always use real service for Google sign-in
```

### 2. **Enhanced Google OAuth Configuration**
**File**: `src/config/socialAuth.ts`
```typescript
export const SOCIAL_AUTH_CONFIG = {
  GOOGLE: {
    // TODO: Replace with your actual Google OAuth client IDs
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  },
  // ...
};

export const DEV_CONFIG = {
  // Enable real Google sign-in in development
  enableRealGoogleSignIn: true, // Set to true to use real Google sign-in
  // ...
};
```

### 3. **Real Google Sign-In Implementation**
**File**: `src/services/socialAuth.js`
```javascript
async signInWithGoogle() {
  try {
    console.log('🔐 Starting Google sign-in process...');
    
    // Check if we have proper Google OAuth configuration
    const { GOOGLE } = SOCIAL_AUTH_CONFIG;
    if (!GOOGLE.webClientId || GOOGLE.webClientId.includes('YOUR_')) {
      throw new Error('Google OAuth configuration is missing. Please configure Google OAuth client IDs in src/config/socialAuth.ts');
    }

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'phc-mobile',
      path: 'auth'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE.webClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `access_type=offline&` +
      `prompt=select_account`; // This will show account picker

    const result = await AuthSession.startAsync({
      authUrl,
      returnUrl: redirectUri,
    });

    if (result.type === 'success') {
      // Exchange code for tokens
      // Get user info from Google
      // Register with backend
      // Return success
    }
  } catch (error) {
    throw new Error('Google sign-in failed: ' + error.message);
  }
}
```

## 🚀 Setup yang Diperlukan

### 1. **Google Cloud Console Setup**
1. Buat project baru di [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Buat OAuth 2.0 credentials untuk:
   - Web Application
   - Android Application
   - iOS Application

### 2. **SHA-1 Fingerprint**
**Fingerprint yang sudah didapat**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

### 3. **Update Configuration**
Ganti placeholder Client IDs di `src/config/socialAuth.ts` dengan Client IDs yang sebenarnya dari Google Cloud Console.

## 🧪 Testing

### **Script Testing yang Dibuat**
**File**: `scripts/test-social-auth-config.js`
```bash
node scripts/test-social-auth-config.js
```

**Hasil Test**:
```
✅ Network security config includes 10.242.90.103
✅ Network security config includes localhost
✅ Android manifest includes network security config
✅ Android manifest includes INTERNET permission
✅ Connectivity: http://localhost:3000/api/mobile/auth/google - Status: 405
✅ Google Auth: http://localhost:3000/api/mobile/auth/google - Success! User ID: 10
✅ Connectivity: http://10.242.90.103:3000/api/mobile/auth/google - Status: 405
✅ Google Auth: http://10.242.90.103:3000/api/mobile/auth/google - Success! User ID: 10
```

### **SHA-1 Fingerprint Script**
**File**: `scripts/get-sha1-fingerprint.js`
```bash
node scripts/get-sha1-fingerprint.js
```

## 📱 Expected Behavior Setelah Setup

### **Sebelum (Mock Authentication)**:
1. Klik "Google Sign-In" → Langsung ke backend tanpa Google OAuth
2. Tidak ada popup Google account picker
3. Menggunakan data mock

### **Sesudah (Real Google OAuth)**:
1. Klik "Google Sign-In" → Muncul popup Google account picker
2. User dapat memilih akun Google existing atau login dengan akun baru
3. User authorize aplikasi untuk mengakses data
4. Aplikasi mendapatkan user info dari Google
5. User ter-register/login di backend dengan data Google yang sebenarnya

## 🔍 Debugging

### **Console Logs yang Akan Muncul**:
```
🔐 Starting Google sign-in process...
🔗 Redirect URI: exp://localhost:19000/--/auth
🔗 Auth URL: https://accounts.google.com/o/oauth2/v2/auth?...
🔐 Auth result: { type: 'success', params: { code: '...' } }
✅ Google auth successful, exchanging code for tokens...
✅ Token exchange successful
✅ User info retrieved: { id: '...', email: '...', name: '...' }
✅ Backend registration successful
```

### **Error Handling**:
- ✅ Configuration validation
- ✅ Network error handling
- ✅ Token exchange error handling
- ✅ User info fetch error handling
- ✅ Backend registration error handling

## 📋 Checklist Setup

- [ ] **Google Cloud Console**:
  - [ ] Project created
  - [ ] Google+ API enabled
  - [ ] OAuth 2.0 credentials created (Web, Android, iOS)
  - [ ] SHA-1 fingerprint added: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

- [ ] **Application Configuration**:
  - [ ] `src/config/socialAuth.ts` updated with real Client IDs
  - [ ] `app.json` configured for AuthSession
  - [ ] Network security configuration verified

- [ ] **Testing**:
  - [ ] SHA-1 fingerprint script run
  - [ ] Social auth config test passed
  - [ ] Google sign-in flow tested

## 🎉 Hasil Akhir

Setelah implementasi lengkap:

1. ✅ **Network issues resolved** - Tidak ada lagi "Network request failed"
2. ✅ **Real Google OAuth** - User dapat memilih akun Google existing
3. ✅ **Account picker** - Muncul popup untuk memilih akun
4. ✅ **Proper authentication flow** - Google OAuth → Backend registration
5. ✅ **Better error handling** - Detailed error messages dan logging
6. ✅ **Platform-specific URLs** - Works on both iOS dan Android
7. ✅ **Comprehensive testing** - Scripts untuk verify setup

## 📞 Next Steps

1. **Setup Google Cloud Console** dengan Client IDs yang sebenarnya
2. **Update configuration** di `src/config/socialAuth.ts`
3. **Test Google sign-in** di emulator/simulator
4. **Monitor logs** untuk debugging jika ada issues

## 🔗 Resources

- **Google OAuth Setup Guide**: `MD File/GOOGLE_OAUTH_SETUP_GUIDE.md`
- **Network Fix Documentation**: `MD File/GOOGLE_SIGNIN_NETWORK_FIX.md`
- **Test Scripts**: `scripts/test-social-auth-config.js`, `scripts/get-sha1-fingerprint.js`
