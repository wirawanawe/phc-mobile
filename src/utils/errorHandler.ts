import { Alert } from 'react-native';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  CONFLICT = 'CONFLICT',
  UNKNOWN = 'UNKNOWN'
}

// Error categories
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  userMessage: string;
  shouldRetry: boolean;
  shouldLogout: boolean;
  shouldShowAlert: boolean;
}

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

// Parse error and return structured error info
export const parseError = (error: any): ErrorInfo => {
  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network request failed') || 
        message.includes('fetch') || 
        message.includes('enotfound') ||
        message.includes('koneksi gagal')) {
      return {
        type: ErrorType.NETWORK,
        ...ERROR_MESSAGES[ErrorType.NETWORK]
      };
    }

    // Authentication errors
    if (message.includes('authentication failed') || 
        message.includes('not authorized') ||
        message.includes('invalid token') ||
        message.includes('token expired')) {
      return {
        type: ErrorType.AUTHENTICATION,
        ...ERROR_MESSAGES[ErrorType.AUTHENTICATION]
      };
    }

    // Validation errors
    if (message.includes('validation') || 
        message.includes('invalid') ||
        message.includes('required') ||
        message.includes('must be')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message,
        userMessage: error.message,
        shouldRetry: false,
        shouldLogout: false,
        shouldShowAlert: true
      };
    }

    // Timeout errors
    if (message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        ...ERROR_MESSAGES[ErrorType.TIMEOUT]
      };
    }

    // Rate limit errors
    if (message.includes('too many requests') || 
        message.includes('429') ||
        message.includes('rate limit')) {
      return {
        type: ErrorType.RATE_LIMIT,
        ...ERROR_MESSAGES[ErrorType.RATE_LIMIT]
      };
    }

    // Server errors
    if (message.includes('server error') || 
        message.includes('internal server error') ||
        message.includes('500')) {
      return {
        type: ErrorType.SERVER,
        ...ERROR_MESSAGES[ErrorType.SERVER]
      };
    }

    // Not found errors
    if (message.includes('not found') || 
        message.includes('404')) {
      return {
        type: ErrorType.NOT_FOUND,
        ...ERROR_MESSAGES[ErrorType.NOT_FOUND]
      };
    }

    // Permission errors
    if (message.includes('permission') || 
        message.includes('forbidden') ||
        message.includes('403')) {
      return {
        type: ErrorType.PERMISSION,
        ...ERROR_MESSAGES[ErrorType.PERMISSION]
      };
    }

    // Conflict errors
    if (message.includes('mission sudah diterima') || 
        message.includes('sudah dalam progress') ||
        message.includes('sudah diselesaikan') ||
        message.includes('sudah dibatalkan') ||
        message.includes('tidak dapat ditinggalkan') ||
        message.includes('konflik data') ||
        message.includes('409') ||
        message.includes('conflict') ||
        message.includes('already exists') ||
        message.includes('has been processed')) {
      return {
        type: ErrorType.CONFLICT,
        message: error.message,
        userMessage: error.message,
        shouldRetry: false,
        shouldLogout: false,
        shouldShowAlert: true
      };
    }
  }

  // Handle HTTP status codes
  if (error.status) {
    switch (error.status) {
      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          ...ERROR_MESSAGES[ErrorType.AUTHENTICATION]
        };
      case 403:
        return {
          type: ErrorType.PERMISSION,
          ...ERROR_MESSAGES[ErrorType.PERMISSION]
        };
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          ...ERROR_MESSAGES[ErrorType.NOT_FOUND]
        };
      case 422:
        return {
          type: ErrorType.VALIDATION,
          message: error.message || 'Data tidak valid',
          userMessage: error.message || 'Mohon periksa kembali data yang Anda masukkan.',
          shouldRetry: false,
          shouldLogout: false,
          shouldShowAlert: true
        };
      case 409:
        return {
          type: ErrorType.CONFLICT,
          ...ERROR_MESSAGES[ErrorType.CONFLICT]
        };
      case 500:
        return {
          type: ErrorType.SERVER,
          ...ERROR_MESSAGES[ErrorType.SERVER]
        };
    }
  }

      // Default to unknown error
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'Unknown error',
      userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN].userMessage,
      shouldRetry: true,
      shouldLogout: false,
      shouldShowAlert: true
    };
};

// Show error alert with better user experience
export const showErrorAlert = (errorInfo: ErrorInfo, title: string = 'Error') => {
  if (errorInfo.shouldShowAlert) {
    Alert.alert(
      title, 
      errorInfo.userMessage,
      [
        {
          text: 'OK',
          style: 'default'
        }
      ],
      { cancelable: true }
    );
  }
};

// Handle error with custom logic and better retry mechanism
export const handleError = (
  error: any, 
  options: {
    title?: string;
    onRetry?: () => void;
    onLogout?: () => void;
    showAlert?: boolean;
    maxRetries?: number;
  } = {}
) => {
  const errorInfo = parseError(error);
  const { 
    title = 'Error', 
    onRetry, 
    onLogout, 
    showAlert = true,
    maxRetries = 3
  } = options;

  // Show alert if needed
  if (showAlert && errorInfo.shouldShowAlert) {
    showErrorAlert(errorInfo, title);
  }

  // Handle retry with exponential backoff
  if (errorInfo.shouldRetry && onRetry) {
    let retryCount = 0;
    const retryWithBackoff = () => {
      if (retryCount < maxRetries) {
        retryCount++;
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000); // Max 10 seconds
        
        setTimeout(() => {
          console.log(`🔄 Retrying operation (attempt ${retryCount}/${maxRetries})`);
          onRetry();
        }, delay);
      }
    };
    
    retryWithBackoff();
  }

  // Handle logout
  if (errorInfo.shouldLogout && onLogout) {
    console.log('🔐 Authentication error detected, logging out user');
    onLogout();
  }

  return errorInfo;
};

// Specific error handlers for common scenarios with better context
export const handleApiError = (error: any, context: string = 'API') => {
  console.error(`❌ ${context} Error:`, error);
  return handleError(error, { 
    title: `${context} Error`,
    maxRetries: 2
  });
};

export const handleValidationError = (error: any) => {
  console.error('❌ Validation Error:', error);
  return handleError(error, { 
    title: 'Validation Error',
    showAlert: true
  });
};

export const handleNetworkError = (error: any) => {
  console.error('❌ Network Error:', error);
  return handleError(error, { 
    title: 'Connection Error',
    maxRetries: 3
  });
};

export const handleAuthError = (error: any, onLogout?: () => void) => {
  console.error('❌ Authentication Error:', error);
  return handleError(error, { 
    title: 'Authentication Error',
    onLogout,
    showAlert: true
  });
};

export const handleConflictError = (error: any) => {
  console.error('❌ Conflict Error:', error);
  return handleError(error, { 
    title: 'Conflict Error',
    showAlert: true,
    maxRetries: 0 // Don't retry conflict errors
  });
};

export const handleMissionError = (error: unknown) => {
  console.error('❌ Mission Error:', error);
  
  // Cast error to any for message access
  const errorAny = error as any;
  
  // Provide specific messages for mission-related conflicts
  let userMessage = errorAny.message || 'Mission error occurred';
  if (errorAny.message && errorAny.message.includes('sudah diselesaikan')) {
    userMessage = 'Mission ini sudah diselesaikan sebelumnya.';
  } else if (errorAny.message && errorAny.message.includes('sudah dalam progress')) {
    userMessage = 'Mission ini sedang dalam progress.';
  } else if (errorAny.message && errorAny.message.includes('sudah diterima')) {
    userMessage = 'Mission ini sudah diterima sebelumnya.';
  } else if (errorAny.message && errorAny.message.includes('sudah dibatalkan')) {
    userMessage = 'Mission ini sudah dibatalkan.';
  }
  
  return handleError(error, { 
    title: 'Mission Error',
    showAlert: true,
    maxRetries: 0 // Don't retry mission conflicts
  });
};

// Enhanced retry mechanism with better error handling
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  onRetry?: (attempt: number, error: any) => void
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
      return await fn();
    } catch (error) {
      lastError = error;
      const errorInfo = parseError(error);

      console.log(`❌ Attempt ${attempt} failed:`, error.message);

      if (onRetry) {
        onRetry(attempt, error);
      }

      if (!errorInfo.shouldRetry || attempt === maxRetries) {
        console.log(`❌ All ${maxRetries} attempts failed`);
        throw error;
      }

      // Special handling for rate limiting
      if (errorInfo.type === ErrorType.RATE_LIMIT) {
        const rateLimitDelay = Math.min(delay * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
        console.log(`⏳ Rate limited, waiting ${rateLimitDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
      } else {
        const currentDelay = delay * Math.pow(2, attempt - 1);
        console.log(`⏳ Waiting ${currentDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
    }
  }

  throw lastError;
};

// New utility for handling async operations with better error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  options: {
    context?: string;
    onSuccess?: (result: T) => void;
    onError?: (error: any) => void;
    showAlert?: boolean;
    retryCount?: number;
  } = {}
): Promise<T | null> => {
  const {
    context = 'Operation',
    onSuccess,
    onError,
    showAlert = true,
    retryCount = 1
  } = options;

  try {
    console.log(`🔍 ${context}: Starting operation...`);
    const result = await withRetry(operation, retryCount, 1000);
    
    console.log(`✅ ${context}: Operation successful`);
    if (onSuccess) {
      onSuccess(result);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ ${context}: Operation failed:`, error);
    
    const errorInfo = handleError(error, {
      title: `${context} Error`,
      showAlert
    });
    
    if (onError) {
      onError(error);
    }
    
    return null;
  }
}; 