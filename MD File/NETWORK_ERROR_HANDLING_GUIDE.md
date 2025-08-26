# Network Error Handling Guide

## Overview

Sistem penanganan error jaringan yang baru telah dibuat untuk memberikan pengalaman pengguna yang lebih baik ketika terjadi masalah koneksi. Sistem ini mencakup:

- **Klasifikasi error yang lebih baik** - Mengidentifikasi jenis error jaringan yang spesifik
- **Pesan error yang informatif** - Memberikan informasi yang jelas kepada pengguna
- **Mekanisme retry otomatis** - Mencoba ulang secara otomatis dengan exponential backoff
- **Troubleshooting steps** - Memberikan panduan langkah-langkah untuk mengatasi masalah
- **UI Components** - Banner error yang dapat digunakan di seluruh aplikasi

## Komponen Utama

### 1. NetworkErrorHandler (`src/utils/networkErrorHandler.ts`)

Handler utama untuk menangani semua jenis error jaringan.

```typescript
import { handleNetworkError, getNetworkErrorType, NetworkErrorType } from '../utils/networkErrorHandler';

// Menangani error jaringan
const errorInfo = handleNetworkError(error, {
  showAlert: true,
  onRetry: () => {
    // Logic untuk retry
  },
  onCancel: () => {
    // Logic untuk cancel
  },
  context: 'API Call'
});
```

### 2. NetworkErrorBanner (`src/components/NetworkErrorBanner.tsx`)

Komponen UI untuk menampilkan error jaringan sebagai banner.

```typescript
import NetworkErrorBanner from '../components/NetworkErrorBanner';

<NetworkErrorBanner
  error={currentError}
  onRetry={handleRetry}
  onDismiss={handleDismiss}
  showTroubleshooting={true}
  autoHide={false}
/>
```

### 3. useNetworkError Hook (`src/hooks/useNetworkError.ts`)

Hook untuk mengelola state error jaringan di komponen React.

```typescript
import { useNetworkError } from '../hooks/useNetworkError';

const { 
  currentError, 
  errorInfo, 
  isNetworkError, 
  handleError, 
  clearError,
  retryWithNetworkRetry 
} = useNetworkError();
```

## Jenis Error Jaringan

### 1. NO_INTERNET
- **Pesan**: "Tidak ada koneksi internet. Silakan periksa koneksi WiFi atau data seluler Anda."
- **Retry**: Ya (3x dengan delay 2 detik)
- **Troubleshooting**: Periksa WiFi/data seluler, restart aplikasi

### 2. SERVER_UNREACHABLE
- **Pesan**: "Tidak dapat terhubung ke server. Server mungkin sedang dalam pemeliharaan atau ada masalah koneksi."
- **Retry**: Ya (5x dengan delay 5 detik)
- **Troubleshooting**: Periksa internet, coba lagi nanti, hubungi support

### 3. SERVER_DOWN
- **Pesan**: "Server sedang tidak tersedia. Silakan coba lagi dalam beberapa menit atau hubungi tim support."
- **Retry**: Ya (3x dengan delay 10 detik)
- **Troubleshooting**: Server maintenance, cek status server, hubungi support

### 4. TIMEOUT
- **Pesan**: "Permintaan memakan waktu terlalu lama. Koneksi internet Anda mungkin lambat."
- **Retry**: Ya (3x dengan delay 3 detik)
- **Troubleshooting**: Periksa kecepatan internet, pindah area, matikan VPN

### 5. DNS_ERROR
- **Pesan**: "Gagal menemukan server. Ada masalah dengan koneksi internet Anda."
- **Retry**: Ya (3x dengan delay 2 detik)
- **Troubleshooting**: Restart router, ganti WiFi, gunakan data seluler

### 6. CONNECTION_REFUSED
- **Pesan**: "Server menolak koneksi. Server mungkin sedang overload atau dalam pemeliharaan."
- **Retry**: Ya (4x dengan delay 8 detik)
- **Troubleshooting**: Server sibuk, coba lagi nanti, hubungi support

### 7. SSL_ERROR
- **Pesan**: "Ada masalah dengan keamanan koneksi. Silakan coba lagi atau hubungi tim support."
- **Retry**: Ya (2x dengan delay 2 detik)
- **Troubleshooting**: Update aplikasi, restart, periksa waktu perangkat

## Cara Penggunaan

### 1. Di API Service

API service sudah diupdate untuk menggunakan handler baru:

```javascript
// Di src/services/api.js
import { handleNetworkError, getNetworkErrorType } from '../utils/networkErrorHandler';

// Error handling otomatis sudah terintegrasi
const response = await apiService.request('/endpoint');
```

### 2. Di Komponen React

```typescript
import React from 'react';
import { useNetworkError } from '../hooks/useNetworkError';
import NetworkErrorBanner from '../components/NetworkErrorBanner';
import apiService from '../services/api';

const MyComponent = () => {
  const { 
    currentError, 
    errorInfo, 
    handleError, 
    clearError,
    retryWithNetworkRetry 
  } = useNetworkError();

  const fetchData = async () => {
    try {
      const data = await retryWithNetworkRetry(
        () => apiService.request('/data'),
        {
          context: 'Fetch Data',
          onRetry: () => {
            console.log('Retrying data fetch...');
          }
        }
      );
      // Handle success
    } catch (error) {
      handleError(error, {
        context: 'Data Fetch',
        onRetry: fetchData
      });
    }
  };

  return (
    <View>
      <NetworkErrorBanner
        error={currentError}
        onRetry={fetchData}
        onDismiss={clearError}
      />
      {/* Component content */}
    </View>
  );
};
```

### 3. Manual Error Handling

```typescript
import { handleNetworkError, NetworkErrorType } from '../utils/networkErrorHandler';

const handleApiError = (error) => {
  const errorInfo = handleNetworkError(error, {
    showAlert: true,
    onRetry: () => {
      // Retry logic
    },
    context: 'Custom API Call'
  });

  // Check error type
  if (errorInfo.type === NetworkErrorType.SERVER_DOWN) {
    // Handle server down specifically
  }
};
```

### 4. Connection Check

```typescript
import { checkNetworkStatus } from '../utils/networkErrorHandler';

const checkConnection = async () => {
  const result = await checkNetworkStatus();
  
  if (result.isConnected) {
    console.log('Network is working');
  } else {
    console.log('Network error:', result.errorType);
    // Handle network error
  }
};
```

## Fitur Utama

### 1. Automatic Retry dengan Exponential Backoff

```typescript
// Retry otomatis dengan delay yang meningkat
const data = await retryWithNetworkRetry(
  () => apiService.request('/data'),
  {
    context: 'Data Fetch',
    showAlert: true
  }
);
```

### 2. Troubleshooting Steps

Setiap jenis error menyediakan langkah-langkah troubleshooting yang spesifik:

```typescript
const errorInfo = handleNetworkError(error);
// errorInfo.troubleshootingSteps berisi array langkah-langkah
```

### 3. User-Friendly Messages

Pesan error dalam bahasa Indonesia yang mudah dipahami:

```typescript
// Contoh pesan
"Tidak dapat terhubung ke server. Server mungkin sedang dalam pemeliharaan atau ada masalah koneksi."
```

### 4. Visual Feedback

NetworkErrorBanner memberikan feedback visual yang jelas:

- **Warna berbeda** untuk setiap jenis error
- **Icon yang sesuai** dengan jenis error
- **Tombol retry** untuk mencoba ulang
- **Tombol troubleshooting** untuk bantuan

## Best Practices

### 1. Gunakan Hook untuk State Management

```typescript
// ✅ Good
const { handleError, clearError } = useNetworkError();

// ❌ Avoid
const [error, setError] = useState(null);
```

### 2. Berikan Context yang Jelas

```typescript
// ✅ Good
handleError(error, { context: 'User Profile Update' });

// ❌ Avoid
handleError(error);
```

### 3. Implementasikan Retry Logic

```typescript
// ✅ Good
const fetchData = async () => {
  try {
    await retryWithNetworkRetry(
      () => apiService.request('/data'),
      { context: 'Data Fetch' }
    );
  } catch (error) {
    handleError(error, { onRetry: fetchData });
  }
};
```

### 4. Gunakan Banner untuk Error Persisten

```typescript
// ✅ Good - Untuk error yang perlu perhatian user
<NetworkErrorBanner error={currentError} />

// ❌ Avoid - Untuk error sementara
Alert.alert('Error', error.message);
```

## Testing

### 1. NetworkErrorExampleScreen

Gunakan `NetworkErrorExampleScreen` untuk testing:

```typescript
// Navigate to example screen
navigation.navigate('NetworkErrorExample');
```

### 2. Simulasi Error

```typescript
// Simulasi berbagai jenis error
simulateNetworkError(NetworkErrorType.SERVER_UNREACHABLE);
simulateNetworkError(NetworkErrorType.TIMEOUT);
simulateNetworkError(NetworkErrorType.NO_INTERNET);
```

### 3. Real API Testing

```typescript
// Test dengan API yang tidak ada
await apiService.request('/non-existent-endpoint');
```

## Troubleshooting

### 1. Error Tidak Muncul

- Pastikan import handler sudah benar
- Periksa apakah error termasuk kategori network error
- Pastikan `showAlert: true` atau menggunakan NetworkErrorBanner

### 2. Retry Tidak Berfungsi

- Periksa apakah `shouldRetry: true` untuk error type tersebut
- Pastikan `onRetry` callback sudah diimplementasi
- Periksa `maxRetries` dan `retryDelay` settings

### 3. Banner Tidak Muncul

- Pastikan `error` prop sudah diset
- Periksa styling dan z-index
- Pastikan komponen berada di posisi yang benar

## Migration dari Sistem Lama

### 1. Update Import

```typescript
// ❌ Old
import { handleError } from '../utils/errorHandler';

// ✅ New
import { handleNetworkError } from '../utils/networkErrorHandler';
```

### 2. Update Error Handling

```typescript
// ❌ Old
try {
  const data = await apiService.request('/data');
} catch (error) {
  handleError(error);
}

// ✅ New
try {
  const data = await retryWithNetworkRetry(
    () => apiService.request('/data'),
    { context: 'Data Fetch' }
  );
} catch (error) {
  handleError(error, { onRetry: fetchData });
}
```

### 3. Update UI Components

```typescript
// ❌ Old
Alert.alert('Network Error', 'Connection failed');

// ✅ New
<NetworkErrorBanner error={currentError} onRetry={handleRetry} />
```

## Kesimpulan

Sistem penanganan error jaringan yang baru memberikan:

1. **Pengalaman pengguna yang lebih baik** dengan pesan yang jelas
2. **Retry otomatis** yang cerdas dengan exponential backoff
3. **Troubleshooting steps** yang membantu user mengatasi masalah
4. **UI yang konsisten** dengan NetworkErrorBanner
5. **Type safety** dengan TypeScript
6. **Testing yang mudah** dengan example screen

Gunakan sistem ini untuk semua network-related errors di aplikasi untuk memberikan pengalaman yang konsisten dan user-friendly.
