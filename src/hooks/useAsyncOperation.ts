import { useState, useCallback } from 'react';
import { handleError, ErrorInfo } from '../utils/errorHandler';

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ErrorInfo) => void;
  showAlert?: boolean;
  title?: string;
  onRetry?: () => void;
  onLogout?: () => void;
}

interface UseAsyncOperationReturn {
  execute: (operation: () => Promise<any>) => Promise<any>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  retry: () => void;
}

export const useAsyncOperation = (options: UseAsyncOperationOptions = {}): UseAsyncOperationReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOperation, setLastOperation] = useState<(() => Promise<any>) | null>(null);

  const {
    onSuccess,
    onError,
    showAlert = true,
    title = 'Operation Error',
    onRetry,
    onLogout
  } = options;

  const execute = useCallback(async (operation: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(null);
      setLastOperation(() => operation);

      const result = await operation();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorInfo = handleError(err, {
        title,
        showAlert,
        onRetry,
        onLogout
      });
      
      setError(errorInfo.userMessage);
      
      if (onError) {
        onError(errorInfo);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError, showAlert, title, onRetry, onLogout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(() => {
    if (lastOperation) {
      execute(lastOperation);
    }
  }, [lastOperation, execute]);

  return {
    execute,
    loading,
    error,
    clearError,
    retry
  };
};

// Specialized hooks for common operations
export const useApiCall = (options: UseAsyncOperationOptions = {}) => {
  return useAsyncOperation({
    showAlert: true,
    title: 'API Error',
    ...options
  });
};

export const useAuthOperation = (onLogout?: () => void, options: UseAsyncOperationOptions = {}) => {
  return useAsyncOperation({
    showAlert: true,
    title: 'Authentication Error',
    onLogout,
    ...options
  });
};

export const useDataFetch = (options: UseAsyncOperationOptions = {}) => {
  return useAsyncOperation({
    showAlert: true,
    title: 'Data Loading Error',
    ...options
  });
};

export const useFormSubmit = (options: UseAsyncOperationOptions = {}) => {
  return useAsyncOperation({
    showAlert: true,
    title: 'Form Submission Error',
    ...options
  });
}; 