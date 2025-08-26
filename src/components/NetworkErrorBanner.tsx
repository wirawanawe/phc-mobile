import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomTheme } from '../theme/theme';
import { 
  NetworkErrorType, 
  NetworkErrorInfo, 
  handleNetworkError,
  showNetworkErrorAlert 
} from '../utils/networkErrorHandler';

interface NetworkErrorBannerProps {
  error?: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  showTroubleshooting?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const NetworkErrorBanner: React.FC<NetworkErrorBannerProps> = ({
  error,
  onRetry,
  onDismiss,
  showTroubleshooting = true,
  autoHide = false,
  autoHideDelay = 5000,
}) => {
  const theme = useTheme<CustomTheme>();
  const [errorInfo, setErrorInfo] = useState<NetworkErrorInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (error) {
      const networkErrorInfo = handleNetworkError(error, {
        showAlert: false, // Don't show alert since we're using banner
        context: 'Network Error Banner'
      });
      setErrorInfo(networkErrorInfo);
      setIsVisible(true);
      showBanner();

      if (autoHide) {
        setTimeout(() => {
          hideBanner();
        }, autoHideDelay);
      }
    } else {
      hideBanner();
    }
  }, [error, autoHide, autoHideDelay]);

  const showBanner = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideBanner = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleTroubleshooting = () => {
    if (errorInfo) {
      showNetworkErrorAlert(errorInfo, handleRetry, hideBanner);
    }
  };

  const getErrorIcon = (errorType: NetworkErrorType) => {
    switch (errorType) {
      case NetworkErrorType.NO_INTERNET:
        return 'wifi-off';
      case NetworkErrorType.SERVER_UNREACHABLE:
      case NetworkErrorType.SERVER_DOWN:
        return 'server-off';
      case NetworkErrorType.TIMEOUT:
        return 'clock-outline';
      case NetworkErrorType.DNS_ERROR:
        return 'dns';
      case NetworkErrorType.CONNECTION_REFUSED:
        return 'connection';
      case NetworkErrorType.SSL_ERROR:
        return 'shield-alert';
      default:
        return 'alert-circle';
    }
  };

  const getErrorColor = (errorType: NetworkErrorType) => {
    switch (errorType) {
      case NetworkErrorType.NO_INTERNET:
        return '#F59E0B'; // Amber
      case NetworkErrorType.SERVER_UNREACHABLE:
      case NetworkErrorType.SERVER_DOWN:
        return '#DC2626'; // Red
      case NetworkErrorType.TIMEOUT:
        return '#EA580C'; // Orange
      case NetworkErrorType.DNS_ERROR:
        return '#7C3AED'; // Purple
      case NetworkErrorType.CONNECTION_REFUSED:
        return '#DC2626'; // Red
      case NetworkErrorType.SSL_ERROR:
        return '#B45309'; // Amber
      default:
        return '#6B7280'; // Gray
    }
  };

  if (!isVisible || !errorInfo) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getErrorColor(errorInfo.type),
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Icon
          name={getErrorIcon(errorInfo.type)}
          size={20}
          color="white"
          style={styles.icon}
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{errorInfo.alertTitle}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {errorInfo.userMessage}
          </Text>
        </View>

        <View style={styles.actions}>
          {onRetry && errorInfo.shouldRetry && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRetry}
            >
              <Icon name="refresh" size={16} color="white" />
              <Text style={styles.actionText}>Coba Lagi</Text>
            </TouchableOpacity>
          )}

          {showTroubleshooting && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTroubleshooting}
            >
              <Icon name="help-circle" size={16} color="white" />
              <Text style={styles.actionText}>Bantuan</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.dismissButton}
            onPress={hideBanner}
          >
            <Icon name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  dismissButton: {
    padding: 4,
  },
});

export default NetworkErrorBanner;
