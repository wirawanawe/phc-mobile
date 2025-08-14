import { Alert } from 'react-native';

// Alert types for consistent styling
export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirmation' | 'loading';

// Alert configuration interface
export interface AlertConfig {
  title: string;
  message: string;
  type: AlertType;
  buttonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
  onPress?: () => void;
  onCancel?: () => void;
}

// Common alert messages for consistency
export const ALERT_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: {
    title: 'Login Berhasil',
    message: 'Selamat datang kembali! Anda telah berhasil masuk ke aplikasi.',
    type: 'success' as AlertType,
  },
  LOGIN_FAILED: {
    title: 'Login Gagal',
    message: 'Email atau password salah. Silakan coba lagi.',
    type: 'error' as AlertType,
  },
  REGISTER_SUCCESS: {
    title: 'Pendaftaran Berhasil',
    message: 'Akun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.',
    type: 'success' as AlertType,
  },
  REGISTER_FAILED: {
    title: 'Pendaftaran Gagal',
    message: 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.',
    type: 'error' as AlertType,
  },
  LOGOUT_CONFIRMATION: {
    title: 'Konfirmasi Logout',
    message: 'Apakah Anda yakin ingin keluar dari aplikasi?',
    type: 'confirmation' as AlertType,
    showCancelButton: true,
    buttonText: 'Ya, Keluar',
    cancelButtonText: 'Batal',
  },

  // Network & Connection
  NETWORK_ERROR: {
    title: 'Koneksi Gagal',
    message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
    type: 'error' as AlertType,
  },
  SERVER_ERROR: {
    title: 'Kesalahan Server',
    message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    type: 'error' as AlertType,
  },
  TIMEOUT_ERROR: {
    title: 'Waktu Habis',
    message: 'Permintaan memakan waktu terlalu lama. Silakan coba lagi.',
    type: 'warning' as AlertType,
  },

  // Data Operations
  SAVE_SUCCESS: {
    title: 'Berhasil Disimpan',
    message: 'Data telah berhasil disimpan.',
    type: 'success' as AlertType,
    autoClose: true,
    autoCloseDelay: 2000,
  },
  SAVE_FAILED: {
    title: 'Gagal Menyimpan',
    message: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
    type: 'error' as AlertType,
  },
  DELETE_CONFIRMATION: {
    title: 'Konfirmasi Hapus',
    message: 'Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.',
    type: 'confirmation' as AlertType,
    showCancelButton: true,
    buttonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
  },
  DELETE_SUCCESS: {
    title: 'Berhasil Dihapus',
    message: 'Item telah berhasil dihapus.',
    type: 'success' as AlertType,
    autoClose: true,
    autoCloseDelay: 2000,
  },
  DELETE_FAILED: {
    title: 'Gagal Menghapus',
    message: 'Terjadi kesalahan saat menghapus item. Silakan coba lagi.',
    type: 'error' as AlertType,
  },

  // Form Validation
  VALIDATION_ERROR: {
    title: 'Data Tidak Lengkap',
    message: 'Mohon lengkapi semua field yang diperlukan.',
    type: 'warning' as AlertType,
  },
  EMAIL_INVALID: {
    title: 'Email Tidak Valid',
    message: 'Mohon masukkan alamat email yang valid.',
    type: 'warning' as AlertType,
  },
  PASSWORD_MISMATCH: {
    title: 'Password Tidak Cocok',
    message: 'Password dan konfirmasi password tidak sama.',
    type: 'warning' as AlertType,
  },
  PASSWORD_TOO_SHORT: {
    title: 'Password Terlalu Pendek',
    message: 'Password minimal 6 karakter.',
    type: 'warning' as AlertType,
  },

  // Health & Wellness
  HEALTH_DATA_SAVED: {
    title: 'Data Kesehatan Tersimpan',
    message: 'Data kesehatan Anda telah berhasil disimpan.',
    type: 'success' as AlertType,
    autoClose: true,
    autoCloseDelay: 2000,
  },
  MISSION_COMPLETED: {
    title: 'Misi Selesai!',
    message: 'Selamat! Anda telah berhasil menyelesaikan misi ini.',
    type: 'success' as AlertType,
    autoClose: true,
    autoCloseDelay: 3000,
  },
  MISSION_PROGRESS_UPDATED: {
    title: 'Progress Diperbarui',
    message: 'Progress misi Anda telah berhasil diperbarui.',
    type: 'success' as AlertType,
    autoClose: true,
    autoCloseDelay: 2000,
  },
  SLEEP_DATA_SAVED: {
    title: 'Data Tidur Tersimpan',
    message: 'Data tidur Anda telah berhasil disimpan.',
    type: 'success' as AlertType,
    autoClose: true,
    autoCloseDelay: 2000,
  },
  EXERCISE_LOGGED: {
    title: 'Latihan Tercatat',
    message: 'Data latihan Anda telah berhasil dicatat.',
    type: 'success' as AlertType,
    autoClose: true,
    autoCloseDelay: 2000,
  },

  // Consultation & Booking
  CONSULTATION_BOOKED: {
    title: 'Konsultasi Dipesan',
    message: 'Konsultasi Anda telah berhasil dipesan. Silakan lakukan pembayaran.',
    type: 'success' as AlertType,
  },
  BOOKING_FAILED: {
    title: 'Pemesanan Gagal',
    message: 'Terjadi kesalahan saat memesan konsultasi. Silakan coba lagi.',
    type: 'error' as AlertType,
  },
  PAYMENT_REQUIRED: {
    title: 'Pembayaran Diperlukan',
    message: 'Silakan lakukan pembayaran untuk melanjutkan konsultasi.',
    type: 'info' as AlertType,
  },

  // General
  FEATURE_COMING_SOON: {
    title: 'Fitur Segera Hadir',
    message: 'Fitur ini akan segera tersedia. Terima kasih atas kesabaran Anda.',
    type: 'info' as AlertType,
  },
  PERMISSION_REQUIRED: {
    title: 'Izin Diperlukan',
    message: 'Aplikasi memerlukan izin untuk mengakses fitur ini.',
    type: 'warning' as AlertType,
  },
  UPDATE_AVAILABLE: {
    title: 'Pembaruan Tersedia',
    message: 'Versi baru aplikasi tersedia. Silakan perbarui untuk mendapatkan fitur terbaru.',
    type: 'info' as AlertType,
  },
  MAINTENANCE_MODE: {
    title: 'Mode Pemeliharaan',
    message: 'Aplikasi sedang dalam pemeliharaan. Silakan coba lagi nanti.',
    type: 'warning' as AlertType,
  },
};

// Custom alert hook for React Native's built-in Alert
export const showNativeAlert = (config: AlertConfig) => {
  const buttons = [];
  
  if (config.showCancelButton && config.onCancel) {
    buttons.push({
      text: config.cancelButtonText || 'Cancel',
      style: 'cancel',
      onPress: config.onCancel,
    });
  }
  
  buttons.push({
    text: config.buttonText || 'OK',
    style: config.type === 'error' ? 'destructive' : 'default',
    onPress: config.onPress,
  });

  Alert.alert(config.title, config.message, buttons, {
    cancelable: true,
  });
};

// Helper functions for common alert scenarios
export const showSuccessAlert = (title: string, message: string, onPress?: () => void) => {
  showNativeAlert({
    title,
    message,
    type: 'success',
    onPress,
  });
};

export const showErrorAlert = (title: string, message: string, onPress?: () => void) => {
  showNativeAlert({
    title,
    message,
    type: 'error',
    onPress,
  });
};

export const showWarningAlert = (title: string, message: string, onPress?: () => void) => {
  showNativeAlert({
    title,
    message,
    type: 'warning',
    onPress,
  });
};

export const showInfoAlert = (title: string, message: string, onPress?: () => void) => {
  showNativeAlert({
    title,
    message,
    type: 'info',
    onPress,
  });
};

export const showConfirmationAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText = 'Ya',
  cancelText = 'Batal'
) => {
  showNativeAlert({
    title,
    message,
    type: 'confirmation',
    showCancelButton: true,
    buttonText: confirmText,
    cancelButtonText: cancelText,
    onPress: onConfirm,
    onCancel,
  });
};

// Specific alert functions for common use cases
export const showNetworkError = (onRetry?: () => void) => {
  showNativeAlert({
    ...ALERT_MESSAGES.NETWORK_ERROR,
    buttonText: onRetry ? 'Coba Lagi' : 'OK',
    onPress: onRetry,
  });
};

export const showValidationError = (message?: string) => {
  showNativeAlert({
    ...ALERT_MESSAGES.VALIDATION_ERROR,
    message: message || ALERT_MESSAGES.VALIDATION_ERROR.message,
  });
};

export const showFeatureComingSoon = () => {
  showNativeAlert(ALERT_MESSAGES.FEATURE_COMING_SOON);
};

export const showLogoutConfirmation = (onConfirm: () => void) => {
  showNativeAlert({
    ...ALERT_MESSAGES.LOGOUT_CONFIRMATION,
    onPress: onConfirm,
  });
};

export const showDeleteConfirmation = (itemName: string, onConfirm: () => void) => {
  showNativeAlert({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus ${itemName}? Tindakan ini tidak dapat dibatalkan.`,
    type: 'confirmation',
    showCancelButton: true,
    buttonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    onPress: onConfirm,
  });
};

// Error handling with automatic alert display
export const handleErrorWithAlert = (error: any, context: string = '') => {
  console.error(`Error in ${context}:`, error);
  
  let errorMessage = 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';
  
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('connection')) {
      errorMessage = 'Koneksi gagal. Periksa internet Anda dan coba lagi.';
    } else if (message.includes('timeout')) {
      errorMessage = 'Permintaan memakan waktu terlalu lama. Silakan coba lagi.';
    } else if (message.includes('unauthorized') || message.includes('401')) {
      errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
    } else if (message.includes('forbidden') || message.includes('403')) {
      errorMessage = 'Anda tidak memiliki izin untuk melakukan tindakan ini.';
    } else if (message.includes('not found') || message.includes('404')) {
      errorMessage = 'Data yang Anda cari tidak ditemukan.';
    } else if (message.includes('server error') || message.includes('500')) {
      errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
    } else {
      errorMessage = error.message;
    }
  }
  
  showErrorAlert('Error', errorMessage);
};

export default {
  showNativeAlert,
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showInfoAlert,
  showConfirmationAlert,
  showNetworkError,
  showValidationError,
  showFeatureComingSoon,
  showLogoutConfirmation,
  showDeleteConfirmation,
  handleErrorWithAlert,
  ALERT_MESSAGES,
};
