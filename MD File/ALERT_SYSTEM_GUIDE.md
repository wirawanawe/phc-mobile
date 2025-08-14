# Alert System Guide

Sistem alert yang komprehensif untuk aplikasi PHC Mobile, mengikuti pola yang sama dengan sleep tracking alert.

## Overview

Sistem alert ini terdiri dari beberapa komponen:

1. **CustomAlert Component** - Komponen modal alert yang dapat dikustomisasi
2. **useAlert Hook** - Hook untuk mengelola state alert dalam komponen
3. **alertUtils** - Utility functions untuk alert yang konsisten
4. **AlertExamplesScreen** - Contoh penggunaan semua jenis alert

## Jenis Alert

### 1. Success Alert
- **Warna**: Hijau (#10B981)
- **Icon**: check-circle
- **Gunakan untuk**: Konfirmasi aksi berhasil
- **Auto-close**: Ya (2 detik)

```typescript
showSuccessAlert(
  'Berhasil Disimpan',
  'Data Anda telah berhasil disimpan.',
  () => console.log('Success callback')
);
```

### 2. Error Alert
- **Warna**: Merah (#EF4444)
- **Icon**: close-circle
- **Gunakan untuk**: Error dan kesalahan
- **Auto-close**: Tidak

```typescript
showErrorAlert(
  'Terjadi Kesalahan',
  'Tidak dapat menyimpan data. Silakan coba lagi.',
  () => console.log('Error callback')
);
```

### 3. Warning Alert
- **Warna**: Orange (#F59E0B)
- **Icon**: alert-circle
- **Gunakan untuk**: Peringatan dan validasi
- **Auto-close**: Tidak

```typescript
showWarningAlert(
  'Peringatan',
  'Data yang Anda masukkan mungkin tidak lengkap.',
  () => console.log('Warning callback')
);
```

### 4. Info Alert
- **Warna**: Biru (#3B82F6)
- **Icon**: information
- **Gunakan untuk**: Informasi penting
- **Auto-close**: Tidak

```typescript
showInfoAlert(
  'Informasi',
  'Fitur ini akan segera tersedia.',
  () => console.log('Info callback')
);
```

### 5. Confirmation Alert
- **Warna**: Ungu (#8B5CF6)
- **Icon**: help-circle
- **Gunakan untuk**: Meminta konfirmasi user
- **Auto-close**: Tidak
- **Tombol**: 2 tombol (Ya/Batal)

```typescript
showConfirmationAlert(
  'Konfirmasi Hapus',
  'Apakah Anda yakin ingin menghapus item ini?',
  () => console.log('User confirmed'),
  () => console.log('User cancelled'),
  'Ya, Hapus',
  'Batal'
);
```

### 6. Loading Alert
- **Warna**: Abu-abu (#6B7280)
- **Icon**: loading
- **Gunakan untuk**: Menampilkan loading state
- **Auto-close**: Tidak (manual close)

```typescript
showLoadingAlert(
  'Memproses Data',
  'Mohon tunggu sebentar...'
);
```

## Cara Penggunaan

### 1. Menggunakan useAlert Hook

```typescript
import useAlert from '../hooks/useAlert';
import CustomAlert from '../components/CustomAlert';

const MyScreen = () => {
  const { 
    alertState, 
    showSuccessAlert, 
    showErrorAlert, 
    showWarningAlert,
    showInfoAlert,
    showConfirmationAlert,
    showLoadingAlert,
    showAlert // untuk konfigurasi custom
  } = useAlert();

  const handleSave = async () => {
    try {
      // Simulasi save
      await saveData();
      showSuccessAlert('Berhasil', 'Data tersimpan');
    } catch (error) {
      showErrorAlert('Error', 'Gagal menyimpan data');
    }
  };

  return (
    <View>
      {/* Your component content */}
      
      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onPress={alertState.onPress}
        onCancel={alertState.onCancel}
        buttonText={alertState.buttonText}
        cancelButtonText={alertState.cancelButtonText}
        showCancelButton={alertState.showCancelButton}
        autoClose={alertState.autoClose}
        autoCloseDelay={alertState.autoCloseDelay}
      />
    </View>
  );
};
```

### 2. Menggunakan alertUtils (Native Alert)

```typescript
import { showSuccessAlert, showErrorAlert, ALERT_MESSAGES } from '../utils/alertUtils';

// Menggunakan fungsi helper
showSuccessAlert('Berhasil', 'Data tersimpan');

// Menggunakan predefined messages
showErrorAlert(
  ALERT_MESSAGES.NETWORK_ERROR.title,
  ALERT_MESSAGES.NETWORK_ERROR.message
);
```

### 3. Custom Alert Configuration

```typescript
showAlert(
  'Judul Alert',
  'Pesan alert',
  'info', // type
  {
    buttonText: 'Mengerti',
    autoClose: true,
    autoCloseDelay: 4000,
    onPress: () => console.log('Custom callback')
  }
);
```

## Predefined Alert Messages

Sistem ini menyediakan pesan alert yang sudah standar:

### Authentication
- `LOGIN_SUCCESS`
- `LOGIN_FAILED`
- `REGISTER_SUCCESS`
- `REGISTER_FAILED`
- `LOGOUT_CONFIRMATION`

### Network & Connection
- `NETWORK_ERROR`
- `SERVER_ERROR`
- `TIMEOUT_ERROR`

### Data Operations
- `SAVE_SUCCESS`
- `SAVE_FAILED`
- `DELETE_CONFIRMATION`
- `DELETE_SUCCESS`
- `DELETE_FAILED`

### Form Validation
- `VALIDATION_ERROR`
- `EMAIL_INVALID`
- `PASSWORD_MISMATCH`
- `PASSWORD_TOO_SHORT`

### Health & Wellness
- `HEALTH_DATA_SAVED`
- `MISSION_COMPLETED`
- `MISSION_PROGRESS_UPDATED`
- `SLEEP_DATA_SAVED`
- `EXERCISE_LOGGED`

### Consultation & Booking
- `CONSULTATION_BOOKED`
- `BOOKING_FAILED`
- `PAYMENT_REQUIRED`

### General
- `FEATURE_COMING_SOON`
- `PERMISSION_REQUIRED`
- `UPDATE_AVAILABLE`
- `MAINTENANCE_MODE`

## Error Handling

### Menggunakan handleErrorWithAlert

```typescript
import { handleErrorWithAlert } from '../utils/alertUtils';

const handleApiCall = async () => {
  try {
    const result = await apiService.getData();
    // Handle success
  } catch (error) {
    handleErrorWithAlert(error, 'API Call');
  }
};
```

### Custom Error Handling

```typescript
import { showErrorAlert } from '../utils/alertUtils';

const handleError = (error: any) => {
  if (error?.message?.includes('network')) {
    showErrorAlert('Koneksi Gagal', 'Periksa internet Anda');
  } else if (error?.message?.includes('unauthorized')) {
    showErrorAlert('Sesi Habis', 'Silakan login kembali');
  } else {
    showErrorAlert('Error', 'Terjadi kesalahan yang tidak terduga');
  }
};
```

## Best Practices

### 1. Konsistensi Pesan
- Gunakan predefined messages untuk konsistensi
- Buat pesan yang jelas dan informatif
- Hindari pesan yang terlalu teknis

### 2. Timing Alert
- Success alerts: Auto-close 2-3 detik
- Error alerts: Manual close
- Loading alerts: Manual close setelah proses selesai

### 3. User Experience
- Jangan spam user dengan terlalu banyak alert
- Gunakan alert yang tepat untuk konteks
- Berikan opsi retry untuk error network

### 4. Accessibility
- Alert dapat di-close dengan back button
- Pesan yang jelas dan mudah dipahami
- Warna yang kontras untuk visibility

## Migration dari Alert.alert

### Sebelum (Native Alert)
```typescript
Alert.alert(
  'Konfirmasi',
  'Apakah Anda yakin?',
  [
    { text: 'Batal', style: 'cancel' },
    { text: 'Ya', onPress: handleConfirm }
  ]
);
```

### Sesudah (Custom Alert)
```typescript
showConfirmationAlert(
  'Konfirmasi',
  'Apakah Anda yakin?',
  handleConfirm,
  undefined,
  'Ya',
  'Batal'
);
```

## Testing Alert

Untuk testing alert, gunakan `AlertExamplesScreen`:

```typescript
// Navigate ke screen contoh
navigation.navigate('AlertExamples');
```

Screen ini menampilkan semua jenis alert yang tersedia dan dapat digunakan untuk testing UI/UX.

## Troubleshooting

### Alert tidak muncul
1. Pastikan `CustomAlert` component sudah di-render
2. Periksa `alertState.visible` sudah true
3. Pastikan tidak ada error di console

### Alert tidak auto-close
1. Periksa `autoClose` sudah true
2. Pastikan `autoCloseDelay` sudah diset
3. Periksa `onPress` callback tidak menghalangi auto-close

### Styling tidak konsisten
1. Pastikan menggunakan `useAlert` hook
2. Periksa tidak ada override style
3. Pastikan menggunakan predefined alert types

## Contoh Implementasi Lengkap

Lihat file-file berikut untuk contoh implementasi:
- `src/screens/RegisterScreen.tsx` - Implementasi di form registration
- `src/screens/AlertExamplesScreen.tsx` - Contoh semua jenis alert
- `src/screens/SleepTrackingScreen.tsx` - Implementasi original
