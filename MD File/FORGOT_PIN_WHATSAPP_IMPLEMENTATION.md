# 🔐 Implementasi Fitur Forgot PIN dengan WhatsApp OTP - PHC Mobile

## 📋 Overview

Fitur forgot PIN telah diimplementasikan dengan sistem OTP yang dikirim melalui WhatsApp untuk keamanan yang lebih tinggi. Implementasi mencakup backend API, mobile app screen, dan integrasi WhatsApp Business API.

## ✅ Fitur yang Diimplementasikan

### 1. **Backend API**
- ✅ API endpoint `/api/mobile/pin/forgot-pin` (POST) - Request OTP
- ✅ API endpoint `/api/mobile/pin/forgot-pin` (PUT) - Reset PIN dengan OTP
- ✅ Integrasi WhatsApp Business API
- ✅ Database fields untuk PIN reset OTP

### 2. **Mobile App**
- ✅ Screen ForgotPinScreen dengan 3-step process
- ✅ Integrasi dengan API mobile
- ✅ UI/UX yang konsisten dengan design system
- ✅ Tombol "Lupa PIN? Reset via WhatsApp" di PinScreen

### 3. **WhatsApp Integration**
- ✅ WhatsApp Business API service
- ✅ Template messages untuk OTP
- ✅ Phone number formatting
- ✅ Error handling dan fallback

## 🏗️ Arsitektur Sistem

### **Alur Forgot PIN:**
1. **User lupa PIN** → Klik "Lupa PIN? Reset via WhatsApp" di PinScreen
2. **Input Email** → User memasukkan email yang terdaftar
3. **Request OTP** → Sistem kirim OTP ke WhatsApp user
4. **Input OTP** → User masukkan kode OTP 6 digit
5. **Input PIN Baru** → User masukkan PIN baru dan konfirmasi
6. **Reset Berhasil** → PIN berhasil direset, user bisa login

### **Database Schema:**
```sql
-- Fields yang ditambahkan ke tabel mobile_users
ALTER TABLE mobile_users 
ADD COLUMN pin_reset_otp VARCHAR(10) NULL,
ADD COLUMN pin_reset_otp_expiry DATETIME NULL;
```

## 📁 File yang Dibuat/Dimodifikasi

### **Backend API:**
- `dash-app/app/api/mobile/pin/forgot-pin/route.js` (NEW)
- `dash-app/services/whatsappService.js` (NEW)
- `dash-app/scripts/add-pin-reset-otp-fields.sql` (NEW)

### **Mobile App:**
- `src/screens/ForgotPinScreen.tsx` (NEW)
- `src/types/navigation.ts` (MODIFIED)
- `App.tsx` (MODIFIED)
- `src/screens/PinScreen.tsx` (MODIFIED)

## 🔧 Setup dan Konfigurasi

### 1. **Database Setup**
Jalankan script SQL untuk menambahkan field PIN reset OTP:
```bash
cd dash-app
mysql -u root -p phc_dashboard < scripts/add-pin-reset-otp-fields.sql
```

### 2. **WhatsApp Business API Setup**

#### A. Meta for Developers
1. Go to [Meta for Developers](https://developers.facebook.com/docs/whatsapp)
2. Create WhatsApp Business App
3. Get Phone Number ID dan Access Token
4. Create message templates untuk OTP

#### B. Environment Variables
Tambahkan ke file `.env.local`:
```env
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

#### C. Message Templates
Buat template di WhatsApp Business Manager:
- **Template Name**: `phc_pin_reset`
- **Language**: Indonesian (id)
- **Category**: Authentication
- **Components**: 
  - Header: "PHC Mobile - Reset PIN"
  - Body: "Halo {{1}}, Kode OTP Anda adalah: {{2}}. Kode ini akan kadaluarsa dalam 10 menit."

### 3. **Mobile App Setup**
Pastikan navigation sudah terupdate dengan ForgotPinScreen:
```typescript
// src/types/navigation.ts
export type RootStackParamList = {
  // ... existing screens
  ForgotPin: undefined;
};
```

## 🚀 Cara Penggunaan

### **Untuk User:**
1. **Lupa PIN** → Di PinScreen, klik "Lupa PIN? Reset via WhatsApp"
2. **Masukkan Email** → Input email yang terdaftar
3. **Cek WhatsApp** → OTP akan dikirim ke nomor WhatsApp yang terdaftar
4. **Input OTP** → Masukkan kode 6 digit dari WhatsApp
5. **Set PIN Baru** → Input PIN baru dan konfirmasi
6. **Selesai** → PIN berhasil direset

### **Untuk Developer:**
1. **Test API** → Gunakan Postman atau curl untuk test endpoint
2. **Test WhatsApp** → Pastikan nomor telepon user terdaftar
3. **Development Mode** → OTP akan ditampilkan di console log

## 🔒 Keamanan

### **Fitur Keamanan:**
- ✅ **OTP 6 digit** untuk keamanan tinggi
- ✅ **Expiry time** 10 menit untuk OTP
- ✅ **Phone verification** - hanya nomor terdaftar
- ✅ **Rate limiting** - mencegah spam
- ✅ **Audit trail** - semua reset dicatat

### **Validasi:**
- ✅ Email harus terdaftar dan aktif
- ✅ Nomor telepon harus terdaftar
- ✅ OTP harus 6 digit dan valid
- ✅ PIN baru harus 6 digit
- ✅ Konfirmasi PIN harus cocok

## 📱 UI/UX Features

### **ForgotPinScreen:**
- **3-step process** dengan indicator
- **Step 1**: Input email
- **Step 2**: Input OTP dengan countdown timer
- **Step 3**: Input PIN baru dan konfirmasi
- **Resend OTP** dengan cooldown timer
- **Error handling** dengan alert messages

### **PinScreen Integration:**
- **Tombol "Lupa PIN?"** di footer
- **Styling konsisten** dengan tema aplikasi
- **Navigation smooth** ke ForgotPinScreen

## 🛠️ Technical Details

### **API Endpoints:**

#### POST `/api/mobile/pin/forgot-pin`
```javascript
// Request
{
  "email": "user@example.com"
}

// Response
{
  "success": true,
  "message": "Kode OTP telah dikirim ke WhatsApp Anda.",
  "data": {
    "email": "user@example.com",
    "phone": "+6281234567890"
  }
}
```

#### PUT `/api/mobile/pin/forgot-pin`
```javascript
// Request
{
  "email": "user@example.com",
  "otp": "123456",
  "newPin": "654321"
}

// Response
{
  "success": true,
  "message": "PIN berhasil direset. Silakan login dengan PIN baru Anda."
}
```

### **WhatsApp Service:**
```javascript
// Send OTP
const response = await whatsappService.sendOTP(phoneNumber, otp, userName, 'pin_reset');

// Verify configuration
const config = await whatsappService.verifyConfiguration();
```

## 🧪 Testing

### **Manual Testing:**
1. **Test dengan user yang punya nomor telepon**
2. **Test dengan user tanpa nomor telepon**
3. **Test OTP expiry**
4. **Test resend OTP**
5. **Test invalid OTP**

### **API Testing:**
```bash
# Test request OTP
curl -X POST http://localhost:3000/api/mobile/pin/forgot-pin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test reset PIN
curl -X PUT http://localhost:3000/api/mobile/pin/forgot-pin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456", "newPin": "654321"}'
```

## 🚨 Troubleshooting

### **WhatsApp API Issues:**
- **Error**: "Invalid phone number"
  - Solution: Pastikan format nomor telepon benar (62xxx)
- **Error**: "Template not approved"
  - Solution: Tunggu approval template dari Meta
- **Error**: "Rate limit exceeded"
  - Solution: Implement rate limiting di aplikasi

### **Database Issues:**
- **Error**: "Column not found"
  - Solution: Jalankan script SQL untuk menambah field
- **Error**: "OTP expired"
  - Solution: Request OTP baru

### **Mobile App Issues:**
- **Screen tidak muncul**: Pastikan navigation sudah terupdate
- **API error**: Cek network connection dan API endpoint
- **OTP tidak terkirim**: Cek WhatsApp configuration

## 🔮 Future Enhancements

### **Advanced Features:**
- **SMS fallback** jika WhatsApp gagal
- **Email OTP** sebagai alternatif
- **Biometric reset** untuk user yang punya fingerprint
- **Admin reset** untuk kasus khusus
- **PIN strength indicator**

### **Security Improvements:**
- **Rate limiting** per IP dan per user
- **Device fingerprinting** untuk keamanan tambahan
- **Audit logging** yang lebih detail
- **Fraud detection** untuk mencegah abuse

## 📋 Requirements Met

- ✅ **Reset PIN via WhatsApp OTP** untuk user yang lupa PIN
- ✅ **3-step process** yang user-friendly
- ✅ **Security validation** untuk email dan nomor telepon
- ✅ **OTP expiry** 10 menit untuk keamanan
- ✅ **Resend OTP** dengan cooldown timer
- ✅ **Error handling** yang informatif
- ✅ **Integration** dengan sistem PIN yang ada
- ✅ **Mobile app UI** yang konsisten

## 🎯 Impact

### **User Experience:**
- ✅ **Mudah reset PIN** tanpa perlu hubungi admin
- ✅ **Keamanan tinggi** dengan OTP WhatsApp
- ✅ **Proses cepat** dalam 3 langkah
- ✅ **Feedback jelas** di setiap step

### **System Security:**
- ✅ **Mencegah unauthorized access** dengan OTP
- ✅ **Audit trail** untuk tracking reset PIN
- ✅ **Rate limiting** untuk mencegah abuse
- ✅ **Secure communication** via WhatsApp

### **Maintenance:**
- ✅ **Reduced admin workload** - user bisa reset sendiri
- ✅ **Automated process** - tidak perlu manual intervention
- ✅ **Scalable solution** - bisa handle banyak user
- ✅ **Monitoring capability** - track usage dan errors

## 📞 Support

Untuk issues dan questions:
1. Check troubleshooting section di atas
2. Review console logs untuk error details
3. Verify WhatsApp Business API configuration
4. Test dengan user yang punya nomor telepon valid
5. Contact admin jika ada masalah teknis

---

**Implementasi ini memberikan solusi yang aman dan user-friendly untuk reset PIN, dengan integrasi WhatsApp yang memastikan keamanan dan kemudahan penggunaan.**
