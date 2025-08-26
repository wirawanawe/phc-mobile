import { Alert } from 'react-native';
import { showErrorAlert, showWarningAlert, showInfoAlert } from './alertUtils';

// Network error types
export enum NetworkErrorType {
  NO_INTERNET = 'NO_INTERNET',
  SERVER_UNREACHABLE = 'SERVER_UNREACHABLE',
  SERVER_DOWN = 'SERVER_DOWN',
  TIMEOUT = 'TIMEOUT',
  DNS_ERROR = 'DNS_ERROR',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
  SSL_ERROR = 'SSL_ERROR',
  UNKNOWN_NETWORK = 'UNKNOWN_NETWORK'
}

// Network error information
export interface NetworkErrorInfo {
  type: NetworkErrorType;
  message: string;
  userMessage: string;
  shouldRetry: boolean;
  retryDelay: number;
  maxRetries: number;
  showAlert: boolean;
  alertTitle: string;
  troubleshootingSteps: string[];
}

// Network error messages in Indonesian
const NETWORK_ERROR_MESSAGES: Record<NetworkErrorType, NetworkErrorInfo> = {
  [NetworkErrorType.NO_INTERNET]: {
    type: NetworkErrorType.NO_INTERNET,
    message: 'No internet connection available',
    userMessage: 'Tidak ada koneksi internet. Silakan periksa koneksi WiFi atau data seluler Anda.',
    shouldRetry: true,
    retryDelay: 2000,
    maxRetries: 3,
    showAlert: true,
    alertTitle: 'Koneksi Internet Gagal',
    troubleshootingSteps: [
      'Periksa apakah WiFi atau data seluler Anda aktif',
      'Coba matikan dan nyalakan kembali WiFi/data seluler',
      'Pastikan Anda berada dalam jangkauan sinyal yang baik',
      'Coba restart aplikasi'
    ]
  },
  [NetworkErrorType.SERVER_UNREACHABLE]: {
    type: NetworkErrorType.SERVER_UNREACHABLE,
    message: 'Server is unreachable',
    userMessage: 'Tidak dapat terhubung ke server. Server mungkin sedang dalam pemeliharaan atau ada masalah koneksi.',
    shouldRetry: true,
    retryDelay: 5000,
    maxRetries: 5,
    showAlert: true,
    alertTitle: 'Server Tidak Dapat Diakses',
    troubleshootingSteps: [
      'Periksa koneksi internet Anda',
      'Coba lagi dalam beberapa menit',
      'Server mungkin sedang dalam pemeliharaan',
      'Hubungi tim support jika masalah berlanjut'
    ]
  },
  [NetworkErrorType.SERVER_DOWN]: {
    type: NetworkErrorType.SERVER_DOWN,
    message: 'Server is down or not responding',
    userMessage: 'Server sedang tidak tersedia. Silakan coba lagi dalam beberapa menit atau hubungi tim support.',
    shouldRetry: true,
    retryDelay: 10000,
    maxRetries: 3,
    showAlert: true,
    alertTitle: 'Server Sedang Tidak Tersedia',
    troubleshootingSteps: [
      'Server mungkin sedang dalam pemeliharaan',
      'Coba lagi dalam 10-15 menit',
      'Periksa status server di website resmi',
      'Hubungi tim support untuk informasi lebih lanjut'
    ]
  },
  [NetworkErrorType.TIMEOUT]: {
    type: NetworkErrorType.TIMEOUT,
    message: 'Request timeout',
    userMessage: 'Permintaan memakan waktu terlalu lama. Koneksi internet Anda mungkin lambat.',
    shouldRetry: true,
    retryDelay: 3000,
    maxRetries: 3,
    showAlert: true,
    alertTitle: 'Koneksi Timeout',
    troubleshootingSteps: [
      'Periksa kecepatan internet Anda',
      'Coba pindah ke area dengan sinyal yang lebih baik',
      'Matikan VPN jika Anda menggunakannya',
      'Coba lagi dalam beberapa menit'
    ]
  },
  [NetworkErrorType.DNS_ERROR]: {
    type: NetworkErrorType.DNS_ERROR,
    message: 'DNS resolution failed',
    userMessage: 'Gagal menemukan server. Ada masalah dengan koneksi internet Anda.',
    shouldRetry: true,
    retryDelay: 2000,
    maxRetries: 3,
    showAlert: true,
    alertTitle: 'Gagal Menemukan Server',
    troubleshootingSteps: [
      'Periksa koneksi internet Anda',
      'Coba restart router WiFi',
      'Ganti ke jaringan WiFi yang berbeda',
      'Coba gunakan data seluler'
    ]
  },
  [NetworkErrorType.CONNECTION_REFUSED]: {
    type: NetworkErrorType.CONNECTION_REFUSED,
    message: 'Connection refused by server',
    userMessage: 'Server menolak koneksi. Server mungkin sedang overload atau dalam pemeliharaan.',
    shouldRetry: true,
    retryDelay: 8000,
    maxRetries: 4,
    showAlert: true,
    alertTitle: 'Koneksi Ditolak Server',
    troubleshootingSteps: [
      'Server mungkin sedang sibuk',
      'Coba lagi dalam beberapa menit',
      'Server mungkin sedang dalam pemeliharaan',
      'Hubungi tim support jika masalah berlanjut'
    ]
  },
  [NetworkErrorType.SSL_ERROR]: {
    type: NetworkErrorType.SSL_ERROR,
    message: 'SSL/TLS connection error',
    userMessage: 'Ada masalah dengan keamanan koneksi. Silakan coba lagi atau hubungi tim support.',
    shouldRetry: true,
    retryDelay: 2000,
    maxRetries: 2,
    showAlert: true,
    alertTitle: 'Error Keamanan Koneksi',
    troubleshootingSteps: [
      'Periksa apakah aplikasi Anda sudah versi terbaru',
      'Coba restart aplikasi',
      'Periksa pengaturan waktu di perangkat Anda',
      'Hubungi tim support jika masalah berlanjut'
    ]
  },
  [NetworkErrorType.UNKNOWN_NETWORK]: {
    type: NetworkErrorType.UNKNOWN_NETWORK,
    message: 'Unknown network error',
    userMessage: 'Terjadi kesalahan koneksi yang tidak diketahui. Silakan coba lagi.',
    shouldRetry: true,
    retryDelay: 3000,
    maxRetries: 3,
    showAlert: true,
    alertTitle: 'Error Koneksi',
    troubleshootingSteps: [
      'Periksa koneksi internet Anda',
      'Coba restart aplikasi',
      'Coba lagi dalam beberapa menit',
      'Hubungi tim support jika masalah berlanjut'
    ]
  }
};

// Helper function to determine network error type
export const getNetworkErrorType = (error: any): NetworkErrorType => {
  const message = error.message?.toLowerCase() || '';
  const name = error.name?.toLowerCase() || '';

  // Check for specific error patterns
  if (message.includes('network request failed') || 
      message.includes('fetch') || 
      message.includes('enotfound') ||
      message.includes('koneksi gagal')) {
    return NetworkErrorType.SERVER_UNREACHABLE;
  }

  if (message.includes('timeout') || 
      message.includes('etimedout') ||
      name === 'aborterror') {
    return NetworkErrorType.TIMEOUT;
  }

  if (message.includes('connection refused') ||
      message.includes('econnrefused')) {
    return NetworkErrorType.CONNECTION_REFUSED;
  }

  if (message.includes('dns') || 
      message.includes('enotfound') ||
      message.includes('getaddrinfo')) {
    return NetworkErrorType.DNS_ERROR;
  }

  if (message.includes('ssl') || 
      message.includes('tls') ||
      message.includes('certificate')) {
    return NetworkErrorType.SSL_ERROR;
  }

  if (message.includes('no internet') ||
      message.includes('network disconnected') ||
      message.includes('offline')) {
    return NetworkErrorType.NO_INTERNET;
  }

  if (message.includes('server error') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')) {
    return NetworkErrorType.SERVER_DOWN;
  }

  return NetworkErrorType.UNKNOWN_NETWORK;
};

// Main network error handler
export const handleNetworkError = (
  error: any,
  options: {
    showAlert?: boolean;
    onRetry?: () => void;
    onCancel?: () => void;
    context?: string;
  } = {}
): NetworkErrorInfo => {
  const {
    showAlert = true,
    onRetry,
    onCancel,
    context = 'Network'
  } = options;

  const errorType = getNetworkErrorType(error);
  const errorInfo = NETWORK_ERROR_MESSAGES[errorType];

  console.error(`🌐 ${context} Error:`, {
    type: errorType,
    originalError: error.message,
    userMessage: errorInfo.userMessage,
    shouldRetry: errorInfo.shouldRetry,
    retryDelay: errorInfo.retryDelay
  });

  if (showAlert) {
    showNetworkErrorAlert(errorInfo, onRetry, onCancel);
  }

  return errorInfo;
};

// Show network error alert with retry option
export const showNetworkErrorAlert = (
  errorInfo: NetworkErrorInfo,
  onRetry?: () => void,
  onCancel?: () => void
) => {
  const buttons = [];

  if (onRetry && errorInfo.shouldRetry) {
    buttons.push({
      text: 'Coba Lagi',
      onPress: () => {
        console.log(`🔄 Retrying network operation after ${errorInfo.retryDelay}ms`);
        setTimeout(onRetry, errorInfo.retryDelay);
      }
    });
  }

  if (onCancel) {
    buttons.push({
      text: 'Batal',
      onPress: onCancel,
      style: 'cancel'
    });
  }

  buttons.push({
    text: 'Troubleshooting',
    onPress: () => showTroubleshootingAlert(errorInfo)
  });

  buttons.push({
    text: 'OK',
    style: 'default'
  });

  Alert.alert(
    errorInfo.alertTitle,
    errorInfo.userMessage,
    buttons,
    { cancelable: true }
  );
};

// Show troubleshooting steps
export const showTroubleshootingAlert = (errorInfo: NetworkErrorInfo) => {
  const troubleshootingText = errorInfo.troubleshootingSteps
    .map((step, index) => `${index + 1}. ${step}`)
    .join('\n\n');

  Alert.alert(
    'Langkah Troubleshooting',
    troubleshootingText,
    [
      {
        text: 'Hubungi Support',
        onPress: () => {
          // You can implement support contact logic here
          console.log('Opening support contact...');
        }
      },
      {
        text: 'OK',
        style: 'default'
      }
    ]
  );
};

// Enhanced retry mechanism with exponential backoff
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  errorInfo: NetworkErrorInfo,
  onProgress?: (attempt: number, maxRetries: number) => void
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= errorInfo.maxRetries; attempt++) {
    try {
      if (onProgress) {
        onProgress(attempt, errorInfo.maxRetries);
      }

      console.log(`🔄 Network retry attempt ${attempt}/${errorInfo.maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error;
      const newErrorType = getNetworkErrorType(error);
      const newErrorInfo = NETWORK_ERROR_MESSAGES[newErrorType];

      console.warn(`❌ Network retry ${attempt} failed:`, error.message);

      if (attempt < errorInfo.maxRetries && newErrorInfo.shouldRetry) {
        const delay = newErrorInfo.retryDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before next retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  throw lastError;
};

// Network status checker
export const checkNetworkStatus = async (): Promise<{
  isConnected: boolean;
  errorType?: NetworkErrorType;
  errorInfo?: NetworkErrorInfo;
}> => {
  try {
    // Simple connectivity test
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      timeout: 5000
    });
    
    return { isConnected: response.ok };
  } catch (error) {
    const errorType = getNetworkErrorType(error);
    const errorInfo = NETWORK_ERROR_MESSAGES[errorType];
    
    return {
      isConnected: false,
      errorType,
      errorInfo
    };
  }
};

// Auto-retry wrapper for API calls
export const withNetworkRetry = <T>(
  apiCall: () => Promise<T>,
  options: {
    context?: string;
    showAlert?: boolean;
    onRetry?: () => void;
    onCancel?: () => void;
  } = {}
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await apiCall();
      resolve(result);
    } catch (error) {
      const errorInfo = handleNetworkError(error, {
        showAlert: options.showAlert ?? true,
        onRetry: () => {
          // Retry the API call
          withNetworkRetry(apiCall, options)
            .then(resolve)
            .catch(reject);
        },
        onCancel: () => {
          reject(error);
        },
        context: options.context
      });

      if (!errorInfo.shouldRetry) {
        reject(error);
      }
    }
  });
};

export default {
  handleNetworkError,
  showNetworkErrorAlert,
  retryWithBackoff,
  checkNetworkStatus,
  withNetworkRetry,
  getNetworkErrorType
};
