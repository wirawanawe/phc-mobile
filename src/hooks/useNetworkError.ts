import { useState, useCallback, useEffect } from 'react';
import { 
  NetworkErrorType, 
  NetworkErrorInfo, 
  handleNetworkError,
  checkNetworkStatus,
  withNetworkRetry 
} from '../utils/networkErrorHandler';

interface UseNetworkErrorReturn {
  currentError: any;
  errorInfo: NetworkErrorInfo | null;
  isNetworkError: boolean;
  isLoading: boolean;
  handleError: (error: any, options?: {
    showAlert?: boolean;
    onRetry?: () => void;
    onCancel?: () => void;
    context?: string;
  }) => NetworkErrorInfo;
  clearError: () => void;
  retryWithNetworkRetry: <T>(
    apiCall: () => Promise<T>,
    options?: {
      context?: string;
      showAlert?: boolean;
      onRetry?: () => void;
      onCancel?: () => void;
    }
  ) => Promise<T>;
  checkConnection: () => Promise<{
    isConnected: boolean;
    errorType?: NetworkErrorType;
    errorInfo?: NetworkErrorInfo;
  }>;
}

export const useNetworkError = (): UseNetworkErrorReturn => {
  const [currentError, setCurrentError] = useState<any>(null);
  const [errorInfo, setErrorInfo] = useState<NetworkErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((
    error: any,
    options: {
      showAlert?: boolean;
      onRetry?: () => void;
      onCancel?: () => void;
      context?: string;
    } = {}
  ) => {
    const networkErrorInfo = handleNetworkError(error, {
      ...options,
      onRetry: () => {
        if (options.onRetry) {
          options.onRetry();
        }
        clearError();
      },
      onCancel: () => {
        if (options.onCancel) {
          options.onCancel();
        }
        clearError();
      }
    });

    setCurrentError(error);
    setErrorInfo(networkErrorInfo);

    return networkErrorInfo;
  }, []);

  const clearError = useCallback(() => {
    setCurrentError(null);
    setErrorInfo(null);
  }, []);

  const retryWithNetworkRetry = useCallback(<T>(
    apiCall: () => Promise<T>,
    options: {
      context?: string;
      showAlert?: boolean;
      onRetry?: () => void;
      onCancel?: () => void;
    } = {}
  ): Promise<T> => {
    setIsLoading(true);
    
    return withNetworkRetry(apiCall, {
      ...options,
      onRetry: () => {
        if (options.onRetry) {
          options.onRetry();
        }
      },
      onCancel: () => {
        setIsLoading(false);
        if (options.onCancel) {
          options.onCancel();
        }
      }
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const checkConnection = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await checkNetworkStatus();
      if (!result.isConnected && result.errorInfo) {
        setCurrentError(new Error(result.errorInfo.message));
        setErrorInfo(result.errorInfo);
      } else {
        clearError();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Auto-clear error after a delay for certain error types
  useEffect(() => {
    if (errorInfo && errorInfo.type === NetworkErrorType.TIMEOUT) {
      const timer = setTimeout(() => {
        clearError();
      }, 10000); // Auto-clear timeout errors after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [errorInfo, clearError]);

  return {
    currentError,
    errorInfo,
    isNetworkError: !!currentError,
    isLoading,
    handleError,
    clearError,
    retryWithNetworkRetry,
    checkConnection
  };
};

export default useNetworkError;
