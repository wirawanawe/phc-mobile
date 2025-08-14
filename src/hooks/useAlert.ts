import { useState, useCallback } from 'react';
import { AlertType } from '../utils/alertUtils';

interface AlertState {
  visible: boolean;
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

interface UseAlertReturn {
  alertState: AlertState;
  showAlert: (
    title: string,
    message: string,
    type: AlertType,
    options?: {
      buttonText?: string;
      cancelButtonText?: string;
      showCancelButton?: boolean;
      autoClose?: boolean;
      autoCloseDelay?: number;
      onPress?: () => void;
      onCancel?: () => void;
    }
  ) => void;
  hideAlert: () => void;
  showSuccessAlert: (title: string, message: string, onPress?: () => void) => void;
  showErrorAlert: (title: string, message: string, onPress?: () => void) => void;
  showWarningAlert: (title: string, message: string, onPress?: () => void) => void;
  showInfoAlert: (title: string, message: string, onPress?: () => void) => void;
  showConfirmationAlert: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void;
  showLoadingAlert: (title: string, message: string) => void;
}

const useAlert = (): UseAlertReturn => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = useCallback((
    title: string,
    message: string,
    type: AlertType,
    options: {
      buttonText?: string;
      cancelButtonText?: string;
      showCancelButton?: boolean;
      autoClose?: boolean;
      autoCloseDelay?: number;
      onPress?: () => void;
      onCancel?: () => void;
    } = {}
  ) => {
    const {
      buttonText = 'OK',
      cancelButtonText = 'Cancel',
      showCancelButton = false,
      autoClose = false,
      autoCloseDelay = 3000,
      onPress,
      onCancel,
    } = options;

    setAlertState({
      visible: true,
      title,
      message,
      type,
      buttonText,
      cancelButtonText,
      showCancelButton,
      autoClose,
      autoCloseDelay,
      onPress: onPress ? () => {
        hideAlert();
        onPress();
      } : hideAlert,
      onCancel: onCancel ? () => {
        hideAlert();
        onCancel();
      } : hideAlert,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  const showSuccessAlert = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert(title, message, 'success', {
      buttonText: 'OK',
      autoClose: true,
      autoCloseDelay: 2000,
      onPress,
    });
  }, [showAlert]);

  const showErrorAlert = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert(title, message, 'error', {
      buttonText: 'OK',
      onPress,
    });
  }, [showAlert]);

  const showWarningAlert = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert(title, message, 'warning', {
      buttonText: 'OK',
      onPress,
    });
  }, [showAlert]);

  const showInfoAlert = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert(title, message, 'info', {
      buttonText: 'OK',
      onPress,
    });
  }, [showAlert]);

  const showConfirmationAlert = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = 'Ya',
    cancelText = 'Batal'
  ) => {
    showAlert(title, message, 'confirmation', {
      buttonText: confirmText,
      cancelButtonText: cancelText,
      showCancelButton: true,
      onPress: onConfirm,
      onCancel,
    });
  }, [showAlert]);

  const showLoadingAlert = useCallback((title: string, message: string) => {
    showAlert(title, message, 'loading', {
      autoClose: false,
    });
  }, [showAlert]);

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showInfoAlert,
    showConfirmationAlert,
    showLoadingAlert,
  };
};

export default useAlert;
