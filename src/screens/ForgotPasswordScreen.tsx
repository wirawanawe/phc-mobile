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
import apiService from '../services/api';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const theme = useTheme<CustomTheme>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email harus diisi');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      if (response.success) {
        setIsSubmitted(true);
        Alert.alert(
          'Email Terkirim',
          'Kode OTP telah dikirim ke email Anda. Silakan cek email dan masukkan kode OTP.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ResetPassword', { email: email.trim() }),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Terjadi kesalahan');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    setIsSubmitted(false);
    setEmail('');
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E22345', '#C41E3A']} style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.content}>
                {/* Success Icon */}
                <View style={styles.successIconContainer}>
                  <Icon name="check-circle" size={80} color="#FFFFFF" />
                </View>

                {/* Title */}
                <Text style={styles.title}>Email Terkirim!</Text>

                {/* Description */}
                <Text style={styles.description}>
                  Kami telah mengirim kode OTP ke email Anda.{'\n'}
                  Silakan cek email dan ikuti instruksi yang diberikan.
                </Text>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('ResetPassword', { email: email.trim() })}
                  >
                    <Text style={styles.primaryButtonText}>Lanjutkan ke Reset Password</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleResendEmail}
                  >
                    <Text style={styles.secondaryButtonText}>Kirim Ulang Email</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={styles.backButtonText}>Kembali ke Login</Text>
                  </TouchableOpacity>
                </View>

                {/* Tips */}
                <View style={styles.tipsContainer}>
                  <Icon name="information" size={20} color="#FFFFFF" style={styles.tipsIcon} />
                  <View style={styles.tipsContent}>
                    <Text style={styles.tipsTitle}>Tips:</Text>
                    <Text style={styles.tipsText}>• Pastikan email yang dimasukkan sudah terdaftar</Text>
                    <Text style={styles.tipsText}>• Cek folder spam jika email tidak masuk</Text>
                    <Text style={styles.tipsText}>• Kode OTP berlaku 10 menit</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
                  onPress={() => navigation.goBack()}
                >
                  <Icon name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lupa Password</Text>
                <View style={styles.placeholder} />
              </View>

              {/* Icon */}
              <View style={styles.iconContainer}>
                <Icon name="lock-reset" size={80} color="#FFFFFF" />
              </View>

              {/* Title */}
              <Text style={styles.title}>Lupa Password?</Text>

              {/* Description */}
              <Text style={styles.description}>
                Masukkan email Anda dan kami akan mengirim{'\n'}
                kode OTP untuk reset password.
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon name="email" size={20} color="#FFFFFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan email Anda"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
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
                    <Text style={styles.submitButtonText}>Mengirim...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Kirim Kode OTP</Text>
                )}
              </TouchableOpacity>

              {/* Tips */}
              <View style={styles.tipsContainer}>
                <Icon name="information" size={20} color="#FFFFFF" style={styles.tipsIcon} />
                <View style={styles.tipsContent}>
                  <Text style={styles.tipsTitle}>Tips:</Text>
                  <Text style={styles.tipsText}>• Pastikan email yang dimasukkan sudah terdaftar</Text>
                  <Text style={styles.tipsText}>• Cek folder spam jika email tidak masuk</Text>
                  <Text style={styles.tipsText}>• Kode OTP berlaku 10 menit</Text>
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
    justifyContent: 'center',
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
  successIconContainer: {
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
    marginBottom: 32,
    opacity: 0.9,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
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
  submitButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
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
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E22345',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
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
});

export default ForgotPasswordScreen;
