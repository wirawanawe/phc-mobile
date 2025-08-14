# 🏠 Localhost Configuration Guide

## Overview

Aplikasi PHC Mobile sekarang dikonfigurasi untuk menggunakan `localhost` sebagai server utama untuk development, menggantikan penggunaan IP lokal perangkat. Perubahan ini memberikan:

- ✅ **Konsistensi**: Tidak perlu mengubah IP address saat berganti jaringan
- ✅ **Simplicity**: Konfigurasi yang lebih sederhana dan mudah dipahami  
- ✅ **Reliability**: Menghindari masalah koneksi karena perubahan IP dinamis
- ✅ **Standard Practice**: Mengikuti praktik development yang umum digunakan

## 📁 File yang Diubah

### 1. `src/services/api.js`
```javascript
const getServerURL = () => {
  // For local development, use localhost
  return "localhost";
  
  // Use production server
  // return "https://dash.doctorphc.id";
};
```

### 2. `src/utils/networkHelper.js`
```javascript
static async findBestServer() {
  const servers = [
    'http://localhost:3000', // Local development (primary)
    'http://127.0.0.1:3000', // Local development (fallback)
    'http://10.0.2.2:3000', // Android emulator (fallback)
    'http://10.242.90.103:3000', // Server IP (fallback)
    'https://dash.doctorphc.id' // Production server (fallback)
  ];
}

static getDefaultURL() {
  // Use localhost for development
  return 'http://localhost:3000/api/mobile';
}
```

## 🚀 Cara Menggunakan

### 1. Start Backend Server
```bash
cd dash-app
npm run dev
```
Server akan berjalan di `http://localhost:3000`

### 2. Start Mobile Development
```bash
# Terminal baru
npx expo start
# atau
npm start
```

### 3. Test Connection
Aplikasi mobile akan otomatis terhubung ke `localhost:3000`

## 🔧 Troubleshooting

### Issue: "Network request failed"

**Solusi 1: Pastikan Backend Running**
```bash
curl http://localhost:3000/api/health
```
Expected response: `{"status":"ok","timestamp":"..."}`

**Solusi 2: Restart Development Server**
```bash
# Stop existing server (Ctrl+C)
cd dash-app
npm run dev
```

**Solusi 3: Clear React Native Cache**
```bash
npx expo start --clear
# atau
npx react-native start --reset-cache
```

### Issue: Android Emulator Connection

Jika menggunakan Android Emulator dan masih ada masalah:
```javascript
// Temporary fix dalam src/services/api.js
if (Platform.OS === "android" && __DEV__) {
  return "http://10.0.2.2:3000/api/mobile";
}
```

### Issue: Physical Device Testing

Untuk testing di physical device, gunakan IP komputer:
1. Cari IP komputer: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Update sementara di konfigurasi:
```javascript
return "http://YOUR_COMPUTER_IP:3000/api/mobile";
```

## 🛠️ Script Utilities

### Set Localhost Configuration
```bash
node scripts/set-localhost-config.js
```
Script ini akan:
- Update API service configuration
- Update NetworkHelper configuration  
- Test localhost connection
- Provide next steps

### Test API Connection
```bash
node scripts/test-api-connection.js
```

## 📱 Platform Compatibility

| Platform | Configuration | Status |
|----------|---------------|--------|
| iOS Simulator | `localhost:3000` | ✅ Supported |
| Android Emulator | `10.0.2.2:3000` (fallback) | ✅ Supported |
| Physical Device | Computer IP (manual) | ⚠️ Manual setup |
| Production | `dash.doctorphc.id` | ✅ Automatic |

## 🔄 Migration dari IP Address

Jika sebelumnya menggunakan IP address seperti `10.242.90.103`:

1. **Automatic**: Jalankan `node scripts/set-localhost-config.js`
2. **Manual**: Update file configuration sesuai panduan di atas
3. **Verify**: Test connection dengan `curl http://localhost:3000/api/health`

## 📝 Best Practices

1. **Development**: Selalu gunakan `localhost` untuk konsistensi
2. **Testing**: Test di simulator terlebih dahulu sebelum physical device
3. **Production**: Pastikan production URL sudah benar dikonfigurasi
4. **Documentation**: Update dokumentasi jika ada perubahan konfigurasi

## 🆘 Support

Jika masih mengalami masalah:

1. Check backend logs: `cd dash-app && npm run dev`
2. Check mobile app logs: React Native debugger
3. Test API manually: `curl` commands
4. Restart semua services: Backend + Mobile development server

---

*Last updated: $(date)*
*Configuration script: `scripts/set-localhost-config.js`*
