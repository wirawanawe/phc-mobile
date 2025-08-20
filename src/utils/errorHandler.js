import { Alert } from 'react-native';

// Error types
export const ErrorType = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  PERMISSION: 'PERMISSION',
  NOT_FOUND: 'NOT_FOUND',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMIT: 'RATE_LIMIT',
  CONFLICT: 'CONFLICT',
  UNKNOWN: 'UNKNOWN'
};

// Error messages in Indonesian
const ERROR_MESSAGES = {
  [ErrorType.NETWORK]: {
    message: 'Koneksi gagal. Pastikan internet Anda terhubung.',
    userMessage: 'Koneksi gagal. Periksa koneksi internet Anda dan coba lagi.',
    shouldRetry: true,
    shouldLogout: false,
    shouldShowAlert: true
  },
  [ErrorType.AUTHENTICATION]: {
    message: 'Sesi Anda telah berakhir. Silakan login kembali.',
    userMessage: 'Sesi Anda telah berakhir. Silakan login kembali.',
    shouldRetry: false,
    shouldLogout: true,
    shouldShowAlert: true
  },
  [ErrorType.VALIDATION]: {
    message: 'Data yang dimasukkan tidak valid.',
    userMessage: 'Mohon periksa kembali data yang Anda masukkan.',
    shouldRetry: false,
    shouldLogout: false,
    shouldShowAlert: true
  },
  [ErrorType.SERVER]: {
    message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    userMessage: 'Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa menit.',
    shouldRetry: true,
    shouldLogout: false,
    shouldShowAlert: true
  },
  [ErrorType.PERMISSION]: {
    message: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
    userMessage: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
    shouldRetry: false,
    shouldLogout: false,
    shouldShowAlert: true
  },
  [ErrorType.NOT_FOUND]: {
    message: 'Data yang Anda cari tidak ditemukan.',
    userMessage: 'Data yang Anda cari tidak ditemukan.',
    shouldRetry: false,
    shouldLogout: false,
    shouldShowAlert: true
  },
  [ErrorType.TIMEOUT]: {
    message: 'Koneksi timeout. Silakan coba lagi.',
    userMessage: 'Koneksi timeout. Silakan coba lagi.',
    shouldRetry: true,
    shouldLogout: false,
    shouldShowAlert: true
  },
  [ErrorType.RATE_LIMIT]: {
    message: 'Terlalu banyak permintaan. Silakan tunggu sebentar.',
    userMessage: 'Terlalu banyak permintaan. Silakan tunggu beberapa menit dan coba lagi.',
    shouldRetry: true,
    shouldLogout: false,
    shouldShowAlert: true
  },
  [ErrorType.CONFLICT]: {
    message: 'Data yang Anda coba ubah sudah ada. Silakan coba lagi.',
    userMessage: 'Data yang Anda coba ubah sudah ada. Silakan coba lagi.',
    shouldRetry: false,
    shouldLogout: false,
    shouldShowAlert: true
  },
  [ErrorType.UNKNOWN]: {
    message: 'Terjadi kesalahan yang tidak diketahui.',
    userMessage: 'Koneksi ke server gagal. Periksa koneksi internet Anda dan coba lagi.',
    shouldRetry: true,
    shouldLogout: false,
    shouldShowAlert: true
  }
};

// Helper function to determine error type
function getErrorType(error) {
  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.response?.status;

  if (status === 401) return ErrorType.AUTHENTICATION;
  if (status === 403) return ErrorType.PERMISSION;
  if (status === 404) return ErrorType.NOT_FOUND;
  if (status === 409) return ErrorType.CONFLICT;
  if (status === 422) return ErrorType.VALIDATION;
  if (status === 429) return ErrorType.RATE_LIMIT;
  if (status >= 500) return ErrorType.SERVER;
  
  if (message.includes('timeout') || message.includes('etimedout')) return ErrorType.TIMEOUT;
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) return ErrorType.NETWORK;
  
  return ErrorType.UNKNOWN;
}

// Main error handler function
export function handleError(error, options = {}) {
  const {
    title = 'Error',
    showAlert = true,
    maxRetries = 3
  } = options;

  const errorType = getErrorType(error);
  const errorInfo = ERROR_MESSAGES[errorType];

  console.error(`🚨 Error Handler: ${title}`, {
    type: errorType,
    message: error.message,
    status: error.status || error.response?.status,
    userMessage: errorInfo.userMessage
  });

  if (showAlert && errorInfo.shouldShowAlert) {
    Alert.alert(title, errorInfo.userMessage);
  }

  return {
    type: errorType,
    message: error.message,
    userMessage: errorInfo.userMessage,
    shouldRetry: errorInfo.shouldRetry,
    shouldLogout: errorInfo.shouldLogout,
    shouldShowAlert: errorInfo.shouldShowAlert
  };
}

// API error handler (legacy function)
export function handleApiError(error, options = {}) {
  return handleError(error, options);
}

// Retry wrapper function
export function withRetry(fn, maxRetries = 3, delay = 1000) {
  return async (...args) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        const errorInfo = handleError(error, { showAlert: false });
        
        if (!errorInfo.shouldRetry || attempt === maxRetries) {
          break;
        }
        
        console.log(`🔄 Retrying... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError;
  };
}
