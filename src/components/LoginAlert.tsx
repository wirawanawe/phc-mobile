import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface LoginAlertProps {
  visible: boolean;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  onRegister?: () => void;
  onForgotPassword?: () => void;
  onClose?: () => void;
}

const { width } = Dimensions.get('window');

const LoginAlert: React.FC<LoginAlertProps> = ({
  visible,
  message,
  type = 'error',
  onRetry,
  onRegister,
  onForgotPassword,
  onClose,
}) => {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const getAlertConfig = () => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          iconColor: '#EF4444',
          icon: 'alert-circle',
        };
      case 'warning':
        return {
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
          iconColor: '#F59E0B',
          icon: 'alert',
        };
      case 'info':
        return {
          backgroundColor: '#EFF6FF',
          borderColor: '#3B82F6',
          iconColor: '#3B82F6',
          icon: 'information',
        };
      default:
        return {
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          iconColor: '#EF4444',
          icon: 'alert-circle',
        };
    }
  };

  const shouldShowRegister = () => {
    const messageLower = message.toLowerCase();
    return messageLower.includes('tidak terdaftar') || 
           messageLower.includes('daftar') ||
           messageLower.includes('register');
  };

  const shouldShowForgotPassword = () => {
    const messageLower = message.toLowerCase();
    return messageLower.includes('password') || 
           messageLower.includes('kredensial') ||
           messageLower.includes('salah');
  };

  const shouldShowRetry = () => {
    const messageLower = message.toLowerCase();
    // Don't show retry for account deactivated or validation errors
    return !messageLower.includes('dinonaktifkan') && 
           !messageLower.includes('deactivated') &&
           !messageLower.includes('format') &&
           !messageLower.includes('valid');
  };

  const config = getAlertConfig();

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Icon and Message */}
      <View style={styles.content}>
        <Icon name={config.icon} size={20} color={config.iconColor} style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {onRetry && shouldShowRetry() && (
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: config.iconColor }]} 
            onPress={onRetry}
          >
            <Icon name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        )}
        
        {onRegister && shouldShowRegister() && (
          <TouchableOpacity style={styles.registerButton} onPress={onRegister}>
            <Icon name="account-plus" size={16} color={config.iconColor} style={styles.buttonIcon} />
            <Text style={[styles.registerText, { color: config.iconColor }]}>
              Daftar Akun Baru
            </Text>
          </TouchableOpacity>
        )}
        
        {onForgotPassword && shouldShowForgotPassword() && (
          <TouchableOpacity style={styles.forgotButton} onPress={onForgotPassword}>
            <Icon name="lock-reset" size={16} color={config.iconColor} style={styles.buttonIcon} />
            <Text style={[styles.forgotText, { color: config.iconColor }]}>
              Lupa Password?
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 48,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  registerText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  forgotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  buttonIcon: {
    marginRight: 4,
  },
});

export default LoginAlert;
