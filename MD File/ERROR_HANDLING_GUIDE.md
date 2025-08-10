# 🛡️ Error Handling System Guide

Sistem error handling yang komprehensif untuk aplikasi PHC Mobile yang menangani berbagai jenis error dengan konsisten dan user-friendly.

## 📋 Daftar Isi

1. [Error Types](#error-types)
2. [Error Handler Utils](#error-handler-utils)
3. [Components](#components)
4. [Hooks](#hooks)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

## 🔍 Error Types

Sistem ini mengkategorikan error menjadi beberapa jenis:

### `ErrorType.NETWORK`
- **Penyebab**: Koneksi internet bermasalah, server tidak dapat diakses
- **Pesan**: "Koneksi gagal. Periksa koneksi internet Anda dan coba lagi."
- **Action**: Retry otomatis

### `ErrorType.AUTHENTICATION`
- **Penyebab**: Token expired, user tidak terautentikasi
- **Pesan**: "Sesi Anda telah berakhir. Silakan login kembali."
- **Action**: Logout otomatis

### `ErrorType.VALIDATION`
- **Penyebab**: Data input tidak valid, field required kosong
- **Pesan**: "Mohon periksa kembali data yang Anda masukkan."
- **Action**: Tampilkan error di form

### `ErrorType.SERVER`
- **Penyebab**: Server error (500), backend bermasalah
- **Pesan**: "Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa menit."
- **Action**: Retry otomatis

### `ErrorType.PERMISSION`
- **Penyebab**: User tidak memiliki izin untuk aksi tertentu
- **Pesan**: "Anda tidak memiliki izin untuk melakukan aksi ini."
- **Action**: Tampilkan pesan error

### `ErrorType.NOT_FOUND`
- **Penyebab**: Data tidak ditemukan (404)
- **Pesan**: "Data yang Anda cari tidak ditemukan."
- **Action**: Tampilkan pesan error

### `ErrorType.TIMEOUT`
- **Penyebab**: Request timeout
- **Pesan**: "Koneksi timeout. Silakan coba lagi."
- **Action**: Retry otomatis

### `ErrorType.UNKNOWN`
- **Penyebab**: Error yang tidak dapat dikategorikan
- **Pesan**: "Terjadi kesalahan. Silakan coba lagi."
- **Action**: Tampilkan pesan error

## 🛠️ Error Handler Utils

### `parseError(error)`
Mengurai error dan mengembalikan informasi terstruktur:

```typescript
import { parseError } from '../utils/errorHandler';

const errorInfo = parseError(error);
console.log(errorInfo.type); // ErrorType.NETWORK
console.log(errorInfo.userMessage); // Pesan untuk user
console.log(errorInfo.shouldRetry); // true/false
```

### `handleError(error, options)`
Menangani error dengan opsi kustom:

```typescript
import { handleError } from '../utils/errorHandler';

handleError(error, {
  title: 'Login Error',
  showAlert: true,
  onRetry: () => retryLogin(),
  onLogout: () => logout()
});
```

### `withRetry(fn, maxRetries, delay)`
Mekanisme retry otomatis:

```typescript
import { withRetry } from '../utils/errorHandler';

const result = await withRetry(
  () => apiService.getData(),
  3, // max retries
  1000 // delay in ms
);
```

## 🧩 Components

### `ErrorBoundary`
Menangani error yang tidak tertangkap di React components:

```typescript
import ErrorBoundary from '../components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### `LoadingError`
Menangani loading dan error states:

```typescript
import LoadingError from '../components/LoadingError';

<LoadingError
  loading={loading}
  error={error}
  onRetry={handleRetry}
  loadingText="Memuat data..."
  errorText="Gagal memuat data"
>
  <YourContent />
</LoadingError>
```

## 🎣 Hooks

### `useAsyncOperation`
Hook umum untuk operasi async:

```typescript
import { useAsyncOperation } from '../hooks/useAsyncOperation';

const { execute, loading, error, retry } = useAsyncOperation({
  onSuccess: (data) => console.log('Success:', data),
  onError: (errorInfo) => console.log('Error:', errorInfo),
  title: 'API Error'
});

const handleSubmit = () => {
  execute(async () => {
    return await apiService.submitData(data);
  });
};
```

### `useApiCall`
Hook khusus untuk API calls:

```typescript
import { useApiCall } from '../hooks/useAsyncOperation';

const { execute, loading, error } = useApiCall({
  onSuccess: (data) => setData(data)
});
```

### `useAuthOperation`
Hook khusus untuk operasi autentikasi:

```typescript
import { useAuthOperation } from '../hooks/useAsyncOperation';

const { execute, loading, error } = useAuthOperation(logout, {
  onSuccess: (data) => navigate('Home')
});
```

## 📝 Usage Examples

### 1. Login Screen
```typescript
import { handleError } from '../utils/errorHandler';

const handleLogin = async () => {
  try {
    const success = await login(email, password);
    if (success) {
      navigation.navigate('Main');
    }
  } catch (error) {
    handleError(error, {
      title: 'Login Error',
      showAlert: false // Show in UI instead
    });
  }
};
```

### 2. Data Fetching
```typescript
import { useDataFetch } from '../hooks/useAsyncOperation';

const { execute, loading, error, retry } = useDataFetch({
  onSuccess: (data) => setMissions(data)
});

useEffect(() => {
  execute(async () => {
    const response = await apiService.getMissions();
    return response.data;
  });
}, []);
```

### 3. Form Submission
```typescript
import { useFormSubmit } from '../hooks/useAsyncOperation';

const { execute, loading, error } = useFormSubmit({
  onSuccess: () => {
    Alert.alert('Success', 'Data berhasil disimpan');
    navigation.goBack();
  }
});

const handleSave = () => {
  execute(async () => {
    return await apiService.saveData(formData);
  });
};
```

### 4. API Service
```typescript
import { handleApiError } from '../utils/errorHandler';

async request(endpoint, options = {}) {
  try {
    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    // ... handle response
  } catch (error) {
    const errorInfo = handleApiError(error, `API Request to ${endpoint}`);
    throw new Error(errorInfo.userMessage);
  }
}
```

## ✅ Best Practices

### 1. **Gunakan Error Handler yang Tepat**
```typescript
// ✅ Good
handleError(error, { title: 'Specific Error' });

// ❌ Bad
Alert.alert('Error', 'Something went wrong');
```

### 2. **Gunakan Hooks untuk Operasi Async**
```typescript
// ✅ Good
const { execute, loading, error } = useApiCall();

// ❌ Bad
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### 3. **Bungkus Components dengan ErrorBoundary**
```typescript
// ✅ Good
<ErrorBoundary>
  <Screen />
</ErrorBoundary>

// ❌ Bad
// No error boundary
```

### 4. **Gunakan LoadingError untuk States**
```typescript
// ✅ Good
<LoadingError loading={loading} error={error} onRetry={retry}>
  <Content />
</LoadingError>

// ❌ Bad
{loading ? <Loading /> : error ? <Error /> : <Content />}
```

### 5. **Log Errors untuk Debugging**
```typescript
// ✅ Good
console.error('🔍 Parsing error:', error);
const errorInfo = parseError(error);

// ❌ Bad
console.log('Error:', error);
```

### 6. **Gunakan Retry Mechanism**
```typescript
// ✅ Good
const result = await withRetry(() => apiService.getData(), 3, 1000);

// ❌ Bad
try {
  return await apiService.getData();
} catch (error) {
  // No retry
}
```

## 🔧 Configuration

### Error Messages
Pesan error dapat dikustomisasi di `src/utils/errorHandler.ts`:

```typescript
const ERROR_MESSAGES = {
  [ErrorType.NETWORK]: {
    message: 'Koneksi gagal. Pastikan internet Anda terhubung.',
    userMessage: 'Koneksi gagal. Periksa koneksi internet Anda dan coba lagi.',
    shouldRetry: true,
    shouldLogout: false,
    shouldShowAlert: true
  },
  // ... other error types
};
```

### Retry Configuration
Konfigurasi retry dapat diubah:

```typescript
// Default: 3 retries, 1000ms delay
const result = await withRetry(fn, 5, 2000); // 5 retries, 2s delay
```

## 📊 Monitoring

Sistem ini menyediakan logging untuk monitoring:

```typescript
// Error logs
console.error('🔍 Parsing error:', error);
console.error('❌ Error handled:', errorInfo);

// Retry logs
console.log('🔄 Retry attempt 1/3 after 1000ms');
```

## 🚀 Migration Guide

### Dari Error Handling Lama
```typescript
// ❌ Old way
try {
  const response = await api.getData();
} catch (error) {
  Alert.alert('Error', 'Failed to load data');
}

// ✅ New way
const { execute, loading, error } = useDataFetch({
  onSuccess: (data) => setData(data)
});

useEffect(() => {
  execute(async () => await api.getData());
}, []);
```

### Dari Manual Loading States
```typescript
// ❌ Old way
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// ✅ New way
const { execute, loading, error } = useAsyncOperation();
```

Sistem error handling ini memberikan pengalaman yang konsisten dan user-friendly untuk seluruh aplikasi PHC Mobile. 