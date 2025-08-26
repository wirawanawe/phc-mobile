import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { CustomTheme } from '../theme/theme';
import api from '../services/api';
import { safeGoBack } from '../utils/safeNavigation';

interface ResetPasswordScreenProps {
  navigation: any;
  route: any;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const theme = useTheme<CustomTheme>();
  const { email } = route.params || {};

  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.otp.trim()) {
      Alert.alert('Error', 'Kode OTP harus diisi');
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert('Error', 'Password harus diisi');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Password dan konfirmasi password tidak cocok');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        email: email,
        otp: formData.otp.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setIsSuccess(true);
        Alert.alert(
          'Berhasil',
          'Password berhasil direset. Silakan login dengan password baru Anda.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Terjadi kesalahan');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Email tidak ditemukan. Silakan kembali ke halaman lupa password.');
      return;
    }

    try {
      const response = await api.post('/auth/forgot-password', {
        email: email,
      });

      if (response.success) {
        Alert.alert('Berhasil', 'Kode OTP baru telah dikirim ke email Anda.');
        setFormData(prev => ({ ...prev, otp: '' }));
      } else {
        Alert.alert('Error', response.message || 'Gagal mengirim ulang OTP');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
      Alert.alert('Error', errorMessage);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E22345', '#C41E3A']} style={styles.container}>
          <View style={styles.successContainer}>
            <Icon name="check-circle" size={80} color="#FFFFFF" />
            <Text style={styles.successTitle}>Password Berhasil Direset!</Text>
            <Text style={styles.successDescription}>
              Password Anda telah berhasil diubah.{'\n'}
              Silakan login dengan password baru Anda.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.successButtonText}>Login Sekarang</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E22345', '#C41E3A']} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => safeGoBack(navigation)}
                >
                  <Icon name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reset Password</Text>
                <View style={styles.placeholder} />
              </View>

              {/* Icon */}
              <View style={styles.iconContainer}>
                <Icon name="lock" size={80} color="#FFFFFF" />
              </View>

              {/* Title */}
              <Text style={styles.title}>Reset Password</Text>

              {/* Description */}
              <Text style={styles.description}>
                Masukkan kode OTP yang telah dikirim{'\n'}
                ke email Anda dan password baru.
              </Text>

              {/* Email Display */}
              {email && (
                <View style={styles.emailContainer}>
                  <Text style={styles.emailLabel}>Email:</Text>
                  <Text style={styles.emailText}>{email}</Text>
                </View>
              )}

              {/* OTP Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Kode OTP</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="key" size={20} color="#FFFFFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan kode OTP"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={formData.otp}
                    onChangeText={(value) => handleInputChange('otp', value)}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password Baru</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="lock" size={20} color="#FFFFFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan password baru"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Icon
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Konfirmasi Password</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="lock" size={20} color="#FFFFFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Konfirmasi password baru"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Icon
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Icon name="loading" size={20} color="#E22345" />
                    <Text style={styles.submitButtonText}>Mengubah Password...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

              {/* Resend OTP Button */}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
              >
                <Text style={styles.resendButtonText}>Kirim Ulang Kode OTP</Text>
              </TouchableOpacity>

              {/* Tips */}
              <View style={styles.tipsContainer}>
                <Icon name="information" size={20} color="#FFFFFF" style={styles.tipsIcon} />
                <View style={styles.tipsContent}>
                  <Text style={styles.tipsTitle}>Tips:</Text>
                  <Text style={styles.tipsText}>• Kode OTP berlaku 10 menit</Text>
                  <Text style={styles.tipsText}>• Password minimal 6 karakter</Text>
                  <Text style={styles.tipsText}>• Pastikan password dan konfirmasi cocok</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9,
  },
  emailContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: '100%',
  },
  emailLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E22345',
  },
  resendButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 24,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  tipsIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  successDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.9,
  },
  successButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E22345',
  },
});

export default ResetPasswordScreen;
