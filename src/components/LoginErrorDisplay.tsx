import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface LoginErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onClearError?: () => void;
}

const LoginErrorDisplay: React.FC<LoginErrorDisplayProps> = ({
  error,
  onRetry,
  onClearError
}) => {
  if (!error) return null;

  const getErrorIcon = () => {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('password') || errorLower.includes('email') || errorLower.includes('kredensial')) {
      return 'account-alert';
    } else if (errorLower.includes('koneksi') || errorLower.includes('network') || errorLower.includes('internet')) {
      return 'wifi-off';
    } else if (errorLower.includes('terlalu banyak') || errorLower.includes('rate limit') || errorLower.includes('percobaan')) {
      return 'clock-alert';
    } else if (errorLower.includes('dinonaktifkan') || errorLower.includes('deactivated') || errorLower.includes('nonaktif')) {
      return 'account-lock';
    } else if (errorLower.includes('timeout') || errorLower.includes('waktu habis')) {
      return 'timer-sand';
    } else if (errorLower.includes('server') || errorLower.includes('gagal') || errorLower.includes('error')) {
      return 'server-off';
    } else if (errorLower.includes('format') || errorLower.includes('valid')) {
      return 'alert-circle';
    } else {
      return 'alert-circle';
    }
  };

  const getErrorColor = () => {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('password') || errorLower.includes('email') || errorLower.includes('kredensial')) {
      return '#F59E0B'; // Orange for credential errors
    } else if (errorLower.includes('koneksi') || errorLower.includes('network') || errorLower.includes('internet')) {
      return '#3B82F6'; // Blue for network errors
    } else if (errorLower.includes('terlalu banyak') || errorLower.includes('rate limit') || errorLower.includes('percobaan')) {
      return '#EF4444'; // Red for rate limit errors
    } else if (errorLower.includes('dinonaktifkan') || errorLower.includes('deactivated') || errorLower.includes('nonaktif')) {
      return '#8B5CF6'; // Purple for account issues
    } else if (errorLower.includes('timeout') || errorLower.includes('waktu habis')) {
      return '#F97316'; // Orange for timeout
    } else if (errorLower.includes('server') || errorLower.includes('gagal') || errorLower.includes('error')) {
      return '#DC2626'; // Dark red for server errors
    } else if (errorLower.includes('format') || errorLower.includes('valid')) {
      return '#059669'; // Green for validation errors
    } else {
      return '#EF4444'; // Default red
    }
  };

  const getErrorTitle = () => {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('password') || errorLower.includes('email') || errorLower.includes('kredensial')) {
      return 'Kredensial Salah';
    } else if (errorLower.includes('koneksi') || errorLower.includes('network') || errorLower.includes('internet')) {
      return 'Koneksi Gagal';
    } else if (errorLower.includes('terlalu banyak') || errorLower.includes('rate limit') || errorLower.includes('percobaan')) {
      return 'Terlalu Banyak Percobaan';
    } else if (errorLower.includes('dinonaktifkan') || errorLower.includes('deactivated') || errorLower.includes('nonaktif')) {
      return 'Akun Dinonaktifkan';
    } else if (errorLower.includes('timeout') || errorLower.includes('waktu habis')) {
      return 'Koneksi Timeout';
    } else if (errorLower.includes('server') || errorLower.includes('gagal') || errorLower.includes('error')) {
      return 'Server Error';
    } else if (errorLower.includes('format') || errorLower.includes('valid')) {
      return 'Format Tidak Valid';
    } else {
      return 'Login Gagal';
    }
  };

  const shouldShowRetry = () => {
    const errorLower = error.toLowerCase();
    
    // Don't show retry for validation errors or account deactivated
    if (errorLower.includes('format') || errorLower.includes('valid') || 
        errorLower.includes('dinonaktifkan') || errorLower.includes('deactivated') ||
        errorLower.includes('nonaktif')) {
      return false;
    }
    
    return true;
  };

  return (
    <View style={[styles.errorContainer, { borderLeftColor: getErrorColor() }]}>
      <View style={styles.errorContent}>
        <Icon 
          name={getErrorIcon()} 
          size={20} 
          color={getErrorColor()} 
          style={styles.errorIcon}
        />
        <View style={styles.errorTextContainer}>
          <Text style={styles.errorTitle}>{getErrorTitle()}</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
        {onClearError && (
          <TouchableOpacity onPress={onClearError} style={styles.closeButton}>
            <Icon name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      
      {onRetry && shouldShowRetry() && (
        <TouchableOpacity onPress={onRetry} style={[styles.retryButton, { backgroundColor: getErrorColor() }]}>
          <Icon name="refresh" size={16} color="#FFFFFF" />
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
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
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default LoginErrorDisplay; 