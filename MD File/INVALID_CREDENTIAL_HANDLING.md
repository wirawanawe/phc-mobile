# 🔐 Invalid Credential Handling System

Sistem handling untuk invalid credential yang komprehensif dan user-friendly di aplikasi PHC Mobile.

## 📋 Overview

Sistem ini menangani berbagai skenario login yang gagal dengan pesan error yang spesifik dan actionable untuk user.

## 🛡️ Security Features

### 1. **Rate Limiting**
- **Login Rate Limiter**: 5 percobaan per 15 menit per IP
- **Failed Login Rate Limiter**: 10 percobaan gagal per jam per IP
- **Account Lockout**: 3 percobaan gagal per 30 menit per email

### 2. **Client-Side Validation**
- Validasi email format
- Validasi password minimum length (6 karakter)
- Validasi field required

### 3. **Server-Side Validation**
- Validasi email dan password di backend
- Pesan error yang spesifik dan informatif
- Logging untuk security monitoring

## 🎯 Error Types & Messages

### 1. **Invalid Credentials**
```typescript
// Backend Response
{
  "success": false,
  "message": "Email atau password salah. Silakan periksa kembali.",
  "errorType": "INVALID_PASSWORD"
}
```

### 2. **User Not Found**
```typescript
// Backend Response
{
  "success": false,
  "message": "Email tidak terdaftar. Silakan daftar terlebih dahulu.",
  "errorType": "USER_NOT_FOUND"
}
```

### 3. **Account Deactivated**
```typescript
// Backend Response
{
  "success": false,
  "message": "Akun Anda telah dinonaktifkan. Hubungi admin untuk bantuan.",
  "errorType": "ACCOUNT_DEACTIVATED"
}
```

### 4. **Rate Limit Exceeded**
```typescript
// Backend Response
{
  "success": false,
  "message": "Terlalu banyak percobaan login. Silakan tunggu 15 menit sebelum mencoba lagi.",
  "errorType": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 15
}
```

### 5. **Account Locked**
```typescript
// Backend Response
{
  "success": false,
  "message": "Akun Anda telah dikunci sementara karena terlalu banyak percobaan login yang gagal. Silakan tunggu 30 menit.",
  "errorType": "ACCOUNT_LOCKED",
  "retryAfter": 30
}
```

## 🎨 UI Components

### LoginErrorDisplay Component
```typescript
import LoginErrorDisplay from '../components/LoginErrorDisplay';

<LoginErrorDisplay
  error={error}
  onClearError={() => setError("")}
  onRetry={handleLogin}
/>
```

**Features:**
- Icon yang berbeda berdasarkan jenis error
- Warna yang berbeda untuk setiap kategori error
- Tombol "Coba Lagi" untuk retry
- Tombol close untuk dismiss error
- Responsive design

## 🔧 Implementation

### 1. **Frontend (LoginScreen.tsx)**
```typescript
const handleLogin = async () => {
  // Client-side validation
  if (!email.trim() || !password.trim()) {
    setError("Mohon isi semua field yang diperlukan");
    return;
  }

  if (!isValidEmail(email)) {
    setError("Mohon masukkan alamat email yang valid");
    return;
  }

  if (password.length < 6) {
    setError("Password minimal 6 karakter");
    return;
  }

  try {
    const success = await login(email, password);
    if (success) {
      navigation.replace("Main");
    }
  } catch (error: any) {
    // Enhanced error handling
    let errorMessage = "Login gagal. Silakan coba lagi.";
    
    if (error?.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes("invalid credentials")) {
        errorMessage = "Email atau password salah. Silakan periksa kembali.";
      } else if (message.includes("user not found")) {
        errorMessage = "Email tidak terdaftar. Silakan daftar terlebih dahulu.";
      } else if (message.includes("account is deactivated")) {
        errorMessage = "Akun Anda telah dinonaktifkan. Hubungi admin untuk bantuan.";
      } else if (message.includes("too many attempts")) {
        errorMessage = "Terlalu banyak percobaan login. Silakan tunggu beberapa menit.";
      } else if (message.includes("network")) {
        errorMessage = "Koneksi gagal. Periksa internet Anda dan coba lagi.";
      } else {
        errorMessage = error.message;
      }
    }
    
    setError(errorMessage);
    setPassword(""); // Clear password for security
  }
};
```

### 2. **Backend (auth.js)**
```javascript
// Enhanced login route with rate limiting
router.post(
  "/login",
  loginRateLimiter,
  failedLoginRateLimiter,
  accountLockoutRateLimiter,
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email tidak terdaftar. Silakan daftar terlebih dahulu.",
          errorType: "USER_NOT_FOUND"
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: "Akun Anda telah dinonaktifkan. Hubungi admin untuk bantuan.",
          errorType: "ACCOUNT_DEACTIVATED"
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Email atau password salah. Silakan periksa kembali.",
          errorType: "INVALID_PASSWORD"
        });
      }

      // Login successful
      // ... generate tokens and return response
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
  }
);
```

### 3. **Rate Limiting Middleware**
```javascript
// loginRateLimit.js
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan tunggu 15 menit sebelum mencoba lagi.',
    errorType: 'RATE_LIMIT_EXCEEDED'
  }
});

const accountLockoutRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // 3 failed attempts per window
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `account_lockout:${req.body.email}`,
  message: {
    success: false,
    message: 'Akun Anda telah dikunci sementara karena terlalu banyak percobaan login yang gagal.',
    errorType: 'ACCOUNT_LOCKED'
  }
});
```

## 🎨 Error Display Design

### Color Coding
- **🔶 Orange**: Credential errors (password/email)
- **🔵 Blue**: Network errors
- **🔴 Red**: Rate limit errors
- **🟣 Purple**: Account issues (deactivated/locked)

### Icons
- **account-alert**: Credential errors
- **wifi-off**: Network errors
- **clock-alert**: Rate limit errors
- **account-lock**: Account issues
- **alert-circle**: General errors

## 📊 Monitoring & Logging

### 1. **Failed Login Attempts**
```javascript
// Log failed login attempts for security monitoring
console.log(`Failed login attempt for email: ${email} from IP: ${req.ip}`);
```

### 2. **Rate Limit Events**
```javascript
// Log rate limit events
console.log(`Rate limit exceeded for IP: ${req.ip}, email: ${req.body.email}`);
```

### 3. **Account Lockouts**
```javascript
// Log account lockouts
console.log(`Account locked for email: ${req.body.email} due to multiple failed attempts`);
```

## 🔒 Security Best Practices

### 1. **Password Security**
- Clear password field after failed attempts
- Don't reveal which field is incorrect
- Use generic error messages for security

### 2. **Rate Limiting**
- Implement multiple layers of rate limiting
- Use IP-based and email-based limits
- Provide clear retry-after information

### 3. **Error Messages**
- Don't reveal user existence
- Use consistent error messages
- Provide actionable feedback

### 4. **Session Management**
- Clear tokens on failed login
- Implement proper logout
- Use secure token storage

## 🧪 Testing

### 1. **Test Cases**
```javascript
// Test invalid email
await testLogin('invalid-email', 'password123');

// Test invalid password
await testLogin('user@example.com', 'wrongpassword');

// Test non-existent user
await testLogin('nonexistent@example.com', 'password123');

// Test rate limiting
for (let i = 0; i < 6; i++) {
  await testLogin('user@example.com', 'wrongpassword');
}

// Test account lockout
for (let i = 0; i < 4; i++) {
  await testLogin('user@example.com', 'wrongpassword');
}
```

### 2. **Expected Behaviors**
- ✅ Clear error messages
- ✅ Rate limiting enforcement
- ✅ Account lockout after multiple failures
- ✅ Password field cleared after failed attempts
- ✅ Proper error UI display

## 🚀 Future Enhancements

### 1. **Two-Factor Authentication**
- SMS/Email verification
- TOTP support
- Backup codes

### 2. **Advanced Security**
- Device fingerprinting
- Location-based restrictions
- Behavioral analysis

### 3. **User Experience**
- Progressive disclosure of error details
- Contextual help
- Password strength indicators

## 📝 Notes

- Semua pesan error dalam bahasa Indonesia
- Rate limiting menggunakan Redis jika tersedia, fallback ke memory
- Error handling konsisten di seluruh aplikasi
- Security logging untuk monitoring dan audit 