import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AuthErrorModalProps {
  visible: boolean;
  error: string;
  errorType?: '401' | '403' | 'network' | 'server' | 'timeout' | 'rate_limit' | 'general';
  onRetry?: () => void;
  onClose?: () => void;
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
}

const { width } = Dimensions.get('window');

const AuthErrorModal: React.FC<AuthErrorModalProps> = ({
  visible,
  error,
  errorType = 'general',
  onRetry,
  onClose,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const getErrorConfig = () => {
    switch (errorType) {
      case '401':
        return {
          icon: 'account-alert',
          color: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          iconBackground: '#FEE2E2',
          title: 'Login Gagal',
          subtitle: 'Kredensial tidak valid',
          primaryAction: 'Coba Lagi',
          secondaryAction: 'Daftar Akun Baru',
          showSecondaryAction: true,
          showForgotPassword: true,
        };
      case '403':
        return {
          icon: 'account-lock',
          color: '#8B5CF6',
          backgroundColor: '#F3F4F6',
          borderColor: '#8B5CF6',
          iconBackground: '#E9D5FF',
          title: 'Akses Ditolak',
          subtitle: 'Akun Anda telah dinonaktifkan',
          primaryAction: 'Hubungi Admin',
          secondaryAction: null,
          showSecondaryAction: false,
          showForgotPassword: false,
        };
      case 'network':
        return {
          icon: 'wifi-off',
          color: '#3B82F6',
          backgroundColor: '#EFF6FF',
          borderColor: '#3B82F6',
          iconBackground: '#DBEAFE',
          title: 'Koneksi Gagal',
          subtitle: 'Periksa koneksi internet Anda',
          primaryAction: 'Coba Lagi',
          secondaryAction: null,
          showSecondaryAction: false,
          showForgotPassword: false,
        };
      case 'server':
        return {
          icon: 'server-off',
          color: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
          iconBackground: '#FEF3C7',
          title: 'Server Error',
          subtitle: 'Terjadi kesalahan pada server',
          primaryAction: 'Coba Lagi',
          secondaryAction: null,
          showSecondaryAction: false,
          showForgotPassword: false,
        };
      case 'timeout':
        return {
          icon: 'clock-alert',
          color: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
          iconBackground: '#FEF3C7',
          title: 'Waktu Habis',
          subtitle: 'Permintaan memakan waktu terlalu lama',
          primaryAction: 'Coba Lagi',
          secondaryAction: null,
          showSecondaryAction: false,
          showForgotPassword: false,
        };
      case 'rate_limit':
        return {
          icon: 'clock-alert',
          color: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          iconBackground: '#FEE2E2',
          title: 'Terlalu Banyak Percobaan',
          subtitle: 'Silakan tunggu beberapa menit',
          primaryAction: 'Tunggu & Coba Lagi',
          secondaryAction: null,
          showSecondaryAction: false,
          showForgotPassword: false,
        };
      default:
        return {
          icon: 'alert-circle',
          color: '#6B7280',
          backgroundColor: '#F9FAFB',
          borderColor: '#6B7280',
          iconBackground: '#F3F4F6',
          title: 'Terjadi Kesalahan',
          subtitle: 'Silakan coba lagi',
          primaryAction: 'Coba Lagi',
          secondaryAction: null,
          showSecondaryAction: false,
          showForgotPassword: false,
        };
    }
  };

  const config = getErrorConfig();

  const handlePrimaryAction = () => {
    if (onRetry) {
      onRetry();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleSecondaryAction = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleForgotPassword = () => {
    if (onNavigateToForgotPassword) {
      onNavigateToForgotPassword();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleContactAdmin = () => {
    Alert.alert(
      'Hubungi Admin',
      'Untuk bantuan lebih lanjut, silakan hubungi admin melalui:\n\nEmail: admin@doctorphc.id\nWhatsApp: +62 812-3456-7890',
      [
        { text: 'Salin Email', onPress: () => console.log('Copy email') },
        { text: 'Buka WhatsApp', onPress: () => console.log('Open WhatsApp') },
        { text: 'Tutup', style: 'cancel' }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.container, 
            { 
              backgroundColor: config.backgroundColor, 
              borderColor: config.borderColor,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.iconBackground }]}>
            <Icon name={config.icon} size={40} color={config.color} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: config.color }]}>{config.title}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>{config.subtitle}</Text>

          {/* Error Message */}
          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {config.showSecondaryAction && config.secondaryAction && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, { borderColor: config.color }]}
                onPress={handleSecondaryAction}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color: config.color }]}>
                  {config.secondaryAction}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: config.color }]}
              onPress={errorType === '403' ? handleContactAdmin : handlePrimaryAction}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{config.primaryAction}</Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link */}
          {config.showForgotPassword && (
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: config.color }]}>
                Lupa Password?
              </Text>
            </TouchableOpacity>
          )}

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.6}
          >
            <Icon name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  errorMessageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    color: '#374151',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButton: {
    borderWidth: 0,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
  },
  forgotPasswordContainer: {
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default AuthErrorModal;
