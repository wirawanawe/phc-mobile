# Production Server Issue Report

## Status Server
- **Production Server**: `https://dash.doctorphc.id`
- **Health Endpoint**: ✅ Working (200 OK)
- **Auth Endpoint**: ❌ Database Error

## Masalah yang Ditemukan

### 1. Health Check - OK
```bash
curl https://dash.doctorphc.id/api/health
# Response: {"status":"ok","timestamp":"2025-08-11T01:25:07.062Z","message":"Server is running"}
```

### 2. Auth Endpoint - Database Error
```bash
curl https://dash.doctorphc.id/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mobile.com","password":"password123"}'

# Error Response:
# {"success":false,"message":"Database error: Database error: Access denied for user 'root'@'localhost' (using password: YES)"}
```

## Root Cause
Server produksi mengalami masalah konfigurasi database:
- Database connection error: "Access denied for user 'root'@'localhost'"
- Kemungkinan password database berubah atau konfigurasi salah

## Solusi Sementara
Untuk saat ini, aplikasi mobile dikonfigurasi kembali menggunakan server lokal:
- **Current Config**: `http://192.168.18.30:3000/api/mobile`
- **Local Server**: ✅ Working
- **Login Test**: ✅ Working dengan kredensial `test@mobile.com`

## Langkah Perbaikan Server Produksi
1. **Check database configuration** di server produksi
2. **Verify MySQL credentials** dan permissions
3. **Update .env.local** di server produksi dengan kredensial database yang benar
4. **Restart** aplikasi di server produksi

## Switching Between Environments
Untuk beralih antara server, edit file `src/services/api.js`:

### Menggunakan Server Produksi:
```javascript
const getServerURL = () => {
  return "https://dash.doctorphc.id";  // Uncomment this
  // return "192.168.18.30";           // Comment this
};
```

### Menggunakan Server Lokal:
```javascript
const getServerURL = () => {
  // return "https://dash.doctorphc.id";  // Comment this
  return "192.168.18.30";               // Uncomment this
};
```

## Testing Results

### Local Server (Current)
- ✅ Health: `http://192.168.18.30:3000/api/health`
- ✅ Login: `http://192.168.18.30:3000/api/mobile/auth/login`
- ✅ Credentials: `test@mobile.com` / `password123`

### Production Server
- ✅ Health: `https://dash.doctorphc.id/api/health`
- ❌ Login: Database connection error
- ❌ All auth endpoints affected

## Next Steps
1. **Untuk development**: Gunakan server lokal (current setting)
2. **Untuk production**: Perbaiki database issue di server produksi
3. **Setelah diperbaiki**: Switch kembali ke production server
