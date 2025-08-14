import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirmation' | 'loading';
  onPress?: () => void;
  onCancel?: () => void;
  buttonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const { width } = Dimensions.get('window');

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type,
  onPress,
  onCancel,
  buttonText = 'OK',
  cancelButtonText = 'Cancel',
  showCancelButton = false,
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle',
          color: '#10B981',
          backgroundColor: '#ECFDF5',
          borderColor: '#10B981',
          iconBackground: '#D1FAE5'
        };
      case 'error':
        return {
          icon: 'close-circle',
          color: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          iconBackground: '#FEE2E2'
        };
      case 'warning':
        return {
          icon: 'alert-circle',
          color: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
          iconBackground: '#FEF3C7'
        };
      case 'info':
        return {
          icon: 'information',
          color: '#3B82F6',
          backgroundColor: '#EFF6FF',
          borderColor: '#3B82F6',
          iconBackground: '#DBEAFE'
        };
      case 'confirmation':
        return {
          icon: 'help-circle',
          color: '#8B5CF6',
          backgroundColor: '#F3F4F6',
          borderColor: '#8B5CF6',
          iconBackground: '#E9D5FF'
        };
      case 'loading':
        return {
          icon: 'loading',
          color: '#6B7280',
          backgroundColor: '#F9FAFB',
          borderColor: '#6B7280',
          iconBackground: '#F3F4F6'
        };
      default:
        return {
          icon: 'information',
          color: '#6B7280',
          backgroundColor: '#F9FAFB',
          borderColor: '#6B7280',
          iconBackground: '#F3F4F6'
        };
    }
  };

  const { icon, color, backgroundColor, borderColor, iconBackground } = getIconAndColor();

  // Auto-close functionality
  React.useEffect(() => {
    if (visible && autoClose && onPress) {
      const timer = setTimeout(() => {
        onPress();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, autoCloseDelay, onPress]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onPress}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor, borderColor }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: iconBackground }]}>
            {type === 'loading' ? (
              <View style={styles.loadingSpinner}>
                <Icon name="loading" size={32} color={color} />
              </View>
            ) : (
              <Icon name={icon} size={32} color={color} />
            )}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color }]}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {showCancelButton && onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: color }]}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color }]}>{cancelButtonText}</Text>
              </TouchableOpacity>
            )}
            
            {onPress && (
              <TouchableOpacity
                style={[styles.button, styles.confirmButton, { backgroundColor: color }]}
                onPress={onPress}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{buttonText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingSpinner: {
    transform: [{ rotate: '0deg' }],
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  confirmButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
  },
});

export default CustomAlert;
