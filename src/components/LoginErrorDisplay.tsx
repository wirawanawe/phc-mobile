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
    
    if (errorLower.includes('password') || errorLower.includes('email')) {
      return 'account-alert';
    } else if (errorLower.includes('koneksi') || errorLower.includes('network')) {
      return 'wifi-off';
    } else if (errorLower.includes('terlalu banyak') || errorLower.includes('rate limit')) {
      return 'clock-alert';
    } else if (errorLower.includes('dinonaktifkan') || errorLower.includes('deactivated')) {
      return 'account-lock';
    } else {
      return 'alert-circle';
    }
  };

  const getErrorColor = () => {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('password') || errorLower.includes('email')) {
      return '#F59E0B'; // Orange for credential errors
    } else if (errorLower.includes('koneksi') || errorLower.includes('network')) {
      return '#3B82F6'; // Blue for network errors
    } else if (errorLower.includes('terlalu banyak') || errorLower.includes('rate limit')) {
      return '#EF4444'; // Red for rate limit errors
    } else if (errorLower.includes('dinonaktifkan') || errorLower.includes('deactivated')) {
      return '#8B5CF6'; // Purple for account issues
    } else {
      return '#EF4444'; // Default red
    }
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
          <Text style={styles.errorTitle}>Login Gagal</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
        {onClearError && (
          <TouchableOpacity onPress={onClearError} style={styles.closeButton}>
            <Icon name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
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
    backgroundColor: '#E22345',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default LoginErrorDisplay; 