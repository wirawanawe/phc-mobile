# 🔧 Login Alert Troubleshooting Guide

## 🚨 Masalah: Alert Tidak Muncul di Halaman Login

### 🔍 Diagnosa

#### 1. **Periksa Console Logs**
```bash
# Cari log berikut di console:
🔐 Login: Attempting login...
🔐 Login: Result: { success: false, message: "..." }
❌ Login: Failed, showing alert
🔐 Login: Error info: { type: '401', userMessage: '...', ... }
🔐 Login: Alert state set - showLoginAlert: true
🔔 LoginScreen: Alert state changed - showLoginAlert: true
🔔 LoginAlert: Props received: { visible: true, message: '...', ... }
🔔 LoginAlert: Rendering alert with message: ...
```

#### 2. **Periksa State Management**
```typescript
// Di LoginScreen, pastikan state ini ter-set dengan benar:
const [showLoginAlert, setShowLoginAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState("");
const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>('error');
```

#### 3. **Periksa Component Rendering**
```typescript
// Pastikan LoginAlert di-render di JSX:
<LoginAlert
  visible={showLoginAlert}
  message={alertMessage}
  type={alertType}
  onRetry={handleAlertRetry}
  onRegister={handleAlertRegister}
  onForgotPassword={handleAlertForgotPassword}
  onClose={handleAlertClose}
/>
```

### 🛠️ Solusi

#### 1. **Test Alert Manual**
Gunakan tombol "Test Alert" yang sudah ditambahkan untuk memverifikasi komponen berfungsi:

```typescript
const testAlert = () => {
  console.log("🧪 Testing alert...");
  setAlertMessage("Ini adalah test alert untuk memastikan komponen berfungsi");
  setAlertType('error');
  setShowLoginAlert(true);
};
```

#### 2. **Periksa Error Parsing**
Pastikan `parseAuthError` berfungsi dengan benar:

```typescript
// Test error parsing
const testError = new Error("Email tidak terdaftar");
const errorInfo = parseAuthError(testError);
console.log("Parsed error:", errorInfo);
```

#### 3. **Periksa Navigation Flow**
Pastikan tidak ada navigasi otomatis yang mengganggu:

```typescript
// Di handleLogin, pastikan navigasi hanya terjadi saat success
if (result.success) {
  console.log("✅ Login: Success, navigating to Main");
  setTimeout(() => {
    navigation.replace("Main");
  }, 100);
} else {
  console.log("❌ Login: Failed, staying on login page");
  // Show alert, don't navigate
}
```

### 🔧 Debugging Steps

#### Step 1: Test Alert Component
1. Buka halaman login
2. Tap tombol "Test Alert" (merah)
3. Pastikan alert muncul dengan pesan test

#### Step 2: Test Login dengan Credentials Salah
1. Masukkan email yang tidak terdaftar
2. Masukkan password apapun
3. Tap "Masuk"
4. Periksa console logs
5. Pastikan alert muncul dengan pesan error

#### Step 3: Test Login dengan Password Salah
1. Masukkan email yang terdaftar
2. Masukkan password yang salah
3. Tap "Masuk"
4. Periksa console logs
5. Pastikan alert muncul dengan pesan error

### 🐛 Common Issues

#### Issue 1: Alert Tidak Muncul
**Penyebab**: State tidak ter-update dengan benar
**Solusi**: 
```typescript
// Tambahkan debugging
React.useEffect(() => {
  console.log("🔔 LoginScreen: Alert state changed - showLoginAlert:", showLoginAlert, "alertMessage:", alertMessage);
}, [showLoginAlert, alertMessage]);
```

#### Issue 2: Navigasi Otomatis ke Main
**Penyebab**: `isAuthenticated` berubah sebelum alert muncul
**Solusi**:
```typescript
// Tambahkan delay pada navigasi
setTimeout(() => {
  navigation.replace("Main");
}, 100);
```

#### Issue 3: Alert Muncul Tapi Hilang Cepat
**Penyebab**: State di-reset oleh komponen lain
**Solusi**:
```typescript
// Pastikan state tidak di-reset di tempat lain
const handleLogin = async () => {
  setError("");
  setShowLoginAlert(false); // Reset di awal saja
  
  // ... rest of login logic
};
```

### 📊 Monitoring

#### Console Logs yang Harus Ada
```
🔐 Login: Attempting login...
🔐 Login: Result: { success: false, message: "Email tidak terdaftar" }
❌ Login: Failed, showing alert
🔐 Login: Error info: { type: '401', userMessage: 'Email tidak terdaftar...', ... }
🔐 Login: Alert state set - showLoginAlert: true
🔔 LoginScreen: Alert state changed - showLoginAlert: true
🔔 LoginAlert: Props received: { visible: true, message: '...', ... }
🔔 LoginAlert: Rendering alert with message: ...
```

#### State yang Harus Benar
```typescript
showLoginAlert: true
alertMessage: "Email tidak terdaftar. Silakan daftar terlebih dahulu."
alertType: "error"
```

### 🎯 Expected Behavior

1. **User memasukkan credentials salah**
2. **Login API dipanggil**
3. **Backend mengembalikan error 401**
4. **Frontend parse error dengan authErrorHandler**
5. **Alert state di-set: showLoginAlert = true**
6. **LoginAlert component di-render dengan visible = true**
7. **User melihat alert dengan pesan error**
8. **User bisa tap "Coba Lagi", "Daftar", atau "Lupa Password"**
9. **User tetap di halaman login (tidak navigate ke Main)**

### 🔗 Related Files

- `src/screens/LoginScreen.tsx` - Main login logic
- `src/components/LoginAlert.tsx` - Alert component
- `src/utils/authErrorHandler.ts` - Error parsing
- `src/contexts/AuthContext.tsx` - Authentication state
- `dash-app/app/api/mobile/auth/login/route.js` - Backend login endpoint

### 📝 Notes

- Alert menggunakan animasi slide dari atas
- Alert muncul di antara form input dan tombol login
- Alert tidak mengganggu flow login user
- Alert dapat di-close dengan tombol X
- Action buttons muncul sesuai konteks error
