# 🔐 Google OAuth Setup Guide untuk PHC Mobile

## 🎯 Tujuan
Setup Google OAuth agar aplikasi dapat melakukan sign-in Google yang sebenarnya, bukan hanya mock authentication.

## 📋 Prerequisites
1. Google Cloud Console account
2. Expo development environment
3. React Native app yang sudah berjalan

## 🚀 Langkah-langkah Setup

### 1. Setup Google Cloud Console

#### 1.1 Buat Project Baru
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik "Select a project" → "New Project"
3. Beri nama project: `PHC Mobile Auth`
4. Klik "Create"

#### 1.2 Enable Google+ API
1. Di sidebar, pilih "APIs & Services" → "Library"
2. Cari "Google+ API" atau "Google Identity"
3. Klik "Enable"

#### 1.3 Buat OAuth 2.0 Credentials

**Untuk Web Application:**
1. Pilih "APIs & Services" → "Credentials"
2. Klik "Create Credentials" → "OAuth 2.0 Client IDs"
3. Pilih "Web application"
4. Beri nama: `PHC Mobile Web Client`
5. Authorized redirect URIs:
   - `https://auth.expo.io/@your-expo-username/phc-mobile`
   - `exp://localhost:19000/--/auth`
   - `exp://10.242.90.103:19000/--/auth`
6. Klik "Create"
7. **Copy Client ID** (akan digunakan sebagai `webClientId`)

**Untuk Android Application:**
1. Klik "Create Credentials" → "OAuth 2.0 Client IDs"
2. Pilih "Android"
3. Beri nama: `PHC Mobile Android Client`
4. Package name: `com.doctorphcindonesia` (sesuaikan dengan app.json)
5. SHA-1 certificate fingerprint: (akan dijelaskan di bawah)
6. Klik "Create"
7. **Copy Client ID** (akan digunakan sebagai `androidClientId`)

**Untuk iOS Application:**
1. Klik "Create Credentials" → "OAuth 2.0 Client IDs"
2. Pilih "iOS"
3. Beri nama: `PHC Mobile iOS Client`
4. Bundle ID: `com.doctorphcindonesia` (sesuaikan dengan app.json)
5. Klik "Create"
6. **Copy Client ID** (akan digunakan sebagai `iosClientId`)

### 2. Dapatkan SHA-1 Certificate Fingerprint

#### 2.1 Untuk Development (Debug)
```bash
cd android
./gradlew signingReport
```

Cari bagian "Variant: debug" dan copy SHA-1 fingerprint.

#### 2.2 Untuk Production (Release)
```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### 3. Update Konfigurasi Aplikasi

#### 3.1 Update app.json
```json
{
  "expo": {
    "scheme": "phc-mobile",
    "android": {
      "package": "com.doctorphcindonesia",
      "googleServicesFile": "./android/app/google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.doctorphcindonesia"
    }
  }
}
```

#### 3.2 Update src/config/socialAuth.ts
```typescript
export const SOCIAL_AUTH_CONFIG = {
  GOOGLE: {
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Ganti dengan Client ID dari Web Application
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // Ganti dengan Client ID dari iOS Application
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com', // Ganti dengan Client ID dari Android Application
    clientSecret: 'YOUR_CLIENT_SECRET', // Opsional, untuk server-side token exchange
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  },
  // ... konfigurasi lainnya
};
```

### 4. Setup Expo AuthSession

#### 4.1 Install Dependencies
```bash
expo install expo-auth-session expo-web-browser
```

#### 4.2 Update app.json untuk AuthSession
```json
{
  "expo": {
    "scheme": "phc-mobile",
    "android": {
      "package": "com.doctorphcindonesia",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "phc-mobile"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 5. Test Google Sign-In

#### 5.1 Development Testing
1. Jalankan aplikasi: `expo start`
2. Buka di emulator/simulator
3. Klik tombol "Google Sign-In"
4. Seharusnya muncul popup Google account picker
5. Pilih akun Google
6. Authorize aplikasi

#### 5.2 Debugging
Cek console logs untuk melihat proses:
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

## 🔧 Troubleshooting

### Error: "Google OAuth configuration is missing"
**Solusi**: Pastikan sudah mengisi `webClientId`, `iosClientId`, dan `androidClientId` di `src/config/socialAuth.ts`

### Error: "redirect_uri_mismatch"
**Solusi**: 
1. Pastikan redirect URI di Google Cloud Console sesuai dengan yang di app.json
2. Untuk development: `exp://localhost:19000/--/auth`
3. Untuk production: `https://auth.expo.io/@your-expo-username/phc-mobile`

### Error: "invalid_client"
**Solusi**: 
1. Pastikan Client ID sudah benar
2. Pastikan package name/bundle ID sesuai
3. Pastikan SHA-1 fingerprint sudah benar

### Error: "Network request failed"
**Solusi**: 
1. Pastikan koneksi internet stabil
2. Pastikan Google Cloud Console API sudah enabled
3. Cek firewall/network settings

## 📱 Platform-Specific Setup

### Android
1. Pastikan `google-services.json` sudah ada di `android/app/`
2. Pastikan SHA-1 fingerprint sudah benar
3. Test di Android emulator dengan `10.242.90.103:3000`

### iOS
1. Pastikan Bundle ID sudah benar
2. Test di iOS simulator dengan `localhost:3000`
3. Pastikan Apple Sign-In capability sudah enabled (jika menggunakan Apple Sign-In juga)

## 🔒 Security Best Practices

1. **Jangan commit Client Secret** ke repository
2. **Gunakan environment variables** untuk production
3. **Validasi token** di backend
4. **Implement rate limiting** untuk mencegah abuse
5. **Monitor OAuth usage** di Google Cloud Console

## 📊 Monitoring

### Google Cloud Console
1. Buka "APIs & Services" → "OAuth consent screen"
2. Monitor user consent dan usage
3. Cek "Credentials" untuk melihat usage statistics

### Application Logs
Monitor console logs untuk:
- Successful sign-ins
- Failed attempts
- Error patterns
- Performance metrics

## 🎉 Expected Result

Setelah setup selesai:
1. ✅ Tombol "Google Sign-In" akan membuka Google account picker
2. ✅ User dapat memilih akun Google yang sudah ada atau login dengan akun baru
3. ✅ Aplikasi akan mendapatkan user info dari Google
4. ✅ User akan ter-register/login di backend
5. ✅ User akan masuk ke aplikasi dengan data dari Google

## 📞 Support

Jika mengalami masalah:
1. Cek console logs untuk error details
2. Verifikasi semua konfigurasi sudah benar
3. Test dengan akun Google yang berbeda
4. Cek Google Cloud Console untuk error messages
