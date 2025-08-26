export type AuthErrorType = '401' | '403' | 'network' | 'server' | 'timeout' | 'rate_limit' | 'general';

export interface AuthErrorInfo {
  type: AuthErrorType;
  message: string;
  userMessage: string;
  shouldRetry: boolean;
  shouldShowModal: boolean;
}

/**
 * Parse authentication error and return structured error information
 */
export const parseAuthError = (error: any): AuthErrorInfo => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  const messageLower = errorMessage.toLowerCase();
  
  // Check for specific error patterns
  if (messageLower.includes('email tidak terdaftar') || 
      messageLower.includes('user not found') ||
      messageLower.includes('user_not_found')) {
    return {
      type: '401',
      message: errorMessage,
      userMessage: 'Email tidak terdaftar. Silakan daftar terlebih dahulu.',
      shouldRetry: false,
      shouldShowModal: true,
    };
  }
  
  if (messageLower.includes('password salah') || 
      messageLower.includes('invalid password') ||
      messageLower.includes('invalid_password')) {
    return {
      type: '401',
      message: errorMessage,
      userMessage: 'Password salah. Silakan periksa kembali password Anda.',
      shouldRetry: true,
      shouldShowModal: true,
    };
  }
  
  if (messageLower.includes('invalid credentials') || 
      messageLower.includes('email atau password salah') ||
      messageLower.includes('kredensial tidak valid') ||
      messageLower.includes('unauthorized') ||
      messageLower.includes('401')) {
    return {
      type: '401',
      message: errorMessage,
      userMessage: 'Email atau password salah. Silakan periksa kembali kredensial Anda.',
      shouldRetry: true,
      shouldShowModal: true,
    };
  }
  
  if (messageLower.includes('account is deactivated') || 
      messageLower.includes('akun dinonaktifkan') ||
      messageLower.includes('account_deactivated') ||
      messageLower.includes('forbidden') ||
      messageLower.includes('403')) {
    return {
      type: '403',
      message: errorMessage,
      userMessage: 'Akun Anda telah dinonaktifkan. Hubungi admin untuk bantuan lebih lanjut.',
      shouldRetry: false,
      shouldShowModal: true,
    };
  }
  
  if (messageLower.includes('too many attempts') || 
      messageLower.includes('terlalu banyak percobaan') ||
      messageLower.includes('rate limit') ||
      messageLower.includes('429')) {
    return {
      type: 'rate_limit',
      message: errorMessage,
      userMessage: 'Terlalu banyak percobaan login. Silakan tunggu beberapa menit sebelum mencoba lagi.',
      shouldRetry: false,
      shouldShowModal: true,
    };
  }
  
  if (messageLower.includes('network') || 
      messageLower.includes('koneksi') ||
      messageLower.includes('connection') ||
      messageLower.includes('fetch')) {
    return {
      type: 'network',
      message: errorMessage,
      userMessage: 'Koneksi gagal. Periksa koneksi internet Anda dan coba lagi.',
      shouldRetry: true,
      shouldShowModal: true,
    };
  }
  
  if (messageLower.includes('timeout') || 
      messageLower.includes('waktu habis')) {
    return {
      type: 'timeout',
      message: errorMessage,
      userMessage: 'Permintaan memakan waktu terlalu lama. Silakan coba lagi.',
      shouldRetry: true,
      shouldShowModal: true,
    };
  }
  
  if (messageLower.includes('server error') || 
      messageLower.includes('database error') ||
      messageLower.includes('500') ||
      messageLower.includes('internal server error')) {
    return {
      type: 'server',
      message: errorMessage,
      userMessage: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
      shouldRetry: true,
      shouldShowModal: true,
    };
  }
  
  // Default case for unknown errors
  return {
    type: 'general',
    message: errorMessage,
    userMessage: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
    shouldRetry: true,
    shouldShowModal: true,
  };
};

/**
 * Check if error is a 401 authentication error
 */
export const isAuthError = (error: any): boolean => {
  const errorInfo = parseAuthError(error);
  return errorInfo.type === '401';
};

/**
 * Check if error should trigger a modal display
 */
export const shouldShowAuthModal = (error: any): boolean => {
  const errorInfo = parseAuthError(error);
  return errorInfo.shouldShowModal;
};

/**
 * Get user-friendly error message
 */
export const getAuthErrorMessage = (error: any): string => {
  const errorInfo = parseAuthError(error);
  return errorInfo.userMessage;
};

/**
 * Check if error should allow retry
 */
export const canRetryAuth = (error: any): boolean => {
  const errorInfo = parseAuthError(error);
  return errorInfo.shouldRetry;
};

/**
 * Enhanced error handler specifically for authentication flows
 */
export const handleAuthError = (
  error: any,
  options: {
    onRetry?: () => void;
    onShowModal?: (errorInfo: AuthErrorInfo) => void;
    onNavigateToRegister?: () => void;
    onNavigateToForgotPassword?: () => void;
    showModal?: boolean;
  } = {}
) => {
  const errorInfo = parseAuthError(error);
  const { 
    onRetry, 
    onShowModal, 
    onNavigateToRegister, 
    onNavigateToForgotPassword,
    showModal = true 
  } = options;

  console.error('🔐 Auth Error:', {
    type: errorInfo.type,
    message: errorInfo.message,
    userMessage: errorInfo.userMessage,
    shouldRetry: errorInfo.shouldRetry,
    shouldShowModal: errorInfo.shouldShowModal
  });

  // Show modal if requested and error supports it
  if (showModal && errorInfo.shouldShowModal && onShowModal) {
    onShowModal(errorInfo);
  }

  // Auto-retry for certain error types
  if (errorInfo.shouldRetry && onRetry) {
    // Add delay before retry for better UX
    setTimeout(() => {
      onRetry();
    }, 1000);
  }

  return errorInfo;
};

/**
 * Create a standardized error object for consistent handling
 */
export const createAuthError = (
  type: AuthErrorType,
  message: string,
  userMessage?: string
): AuthErrorInfo => {
  return {
    type,
    message,
    userMessage: userMessage || message,
    shouldRetry: type === '401' || type === 'network' || type === 'timeout' || type === 'server',
    shouldShowModal: true,
  };
};

export default {
  parseAuthError,
  isAuthError,
  shouldShowAuthModal,
  getAuthErrorMessage,
  canRetryAuth,
  handleAuthError,
  createAuthError,
};
