import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Use development service for now
import socialAuthService from '../services/socialAuthDev';

interface OTPVerificationProps {
  email: string;
  authMethod: 'google' | 'apple' | 'facebook';
  onVerificationSuccess: (data: any) => void;
  onVerificationError: (error: string) => void;
  onResendOTP: () => void;
  onCancel: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  authMethod,
  onVerificationSuccess,
  onVerificationError,
  onResendOTP,
  onCancel,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await socialAuthService.verifyOTP(email, otp, authMethod);
      if (result.success) {
        onVerificationSuccess(result.data);
      } else {
        onVerificationError('OTP verification failed');
      }
    } catch (error) {
      onVerificationError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await onResendOTP();
      setTimeLeft(300);
      setCanResend(false);
      setOtp('');
      Alert.alert('Success', 'New OTP has been sent to your WhatsApp/Email');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformName = () => {
    switch (authMethod) {
      case 'google':
        return 'Google';
      case 'apple':
        return 'Apple';
      case 'facebook':
        return 'Facebook';
      default:
        return 'Social';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Verifikasi OTP</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.iconContainer}>
          <Ionicons
            name={
              authMethod === 'google'
                ? 'logo-google'
                : authMethod === 'apple'
                ? 'logo-apple'
                : 'logo-facebook'
            }
            size={48}
            color={
              authMethod === 'google'
                ? '#DB4437'
                : authMethod === 'apple'
                ? '#000000'
                : '#4267B2'
            }
          />
        </View>

        <Text style={styles.subtitle}>
          Masuk dengan {getPlatformName()}
        </Text>
        <Text style={styles.email}>{email}</Text>

        <Text style={styles.description}>
          Kami telah mengirimkan kode verifikasi 6 digit ke WhatsApp dan email Anda
        </Text>

        <View style={styles.otpContainer}>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            placeholder="Masukkan kode OTP"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading || otp.length !== 6}
        >
          <Text style={[styles.verifyButtonText, loading && styles.verifyButtonTextDisabled]}>
            {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
          </Text>
        </TouchableOpacity>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            Kode berlaku dalam: {formatTime(timeLeft)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
          onPress={handleResendOTP}
          disabled={!canResend || loading}
        >
          <Text style={[styles.resendButtonText, !canResend && styles.resendButtonTextDisabled]}>
            Kirim ulang kode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
    marginBottom: 30,
  },
  otpContainer: {
    marginBottom: 30,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: '#F8F8F8',
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCC',
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButtonTextDisabled: {
    color: '#999',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default OTPVerification; 