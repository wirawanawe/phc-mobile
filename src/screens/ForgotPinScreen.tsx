import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useNavigation } from '@react-navigation/native';
import { CustomTheme } from '../theme/theme';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { RootStackNavigationProp } from '../types/navigation';

interface ForgotPinScreenProps {
  navigation: any;
}

const ForgotPinScreen: React.FC<ForgotPinScreenProps> = ({ navigation }) => {
  const theme = useTheme<CustomTheme>();
  
  // Fallback navigation if not provided
  const safeNavigation = navigation || {
    navigate: (screen: string) => console.log('Navigate to:', screen),
    goBack: () => console.log('Go back'),
  };
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'newPin'>('email');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 30,
    },
    step: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 10,
    },
    stepActive: {
      backgroundColor: theme.colors.primary,
    },
    stepCompleted: {
      backgroundColor: theme.colors.success,
    },
    stepInactive: {
      backgroundColor: theme.colors.border,
    },
    stepText: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
    form: {
      flex: 1,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.card,
    },
    inputFocused: {
      borderColor: theme.colors.primary,
    },
    pinInput: {
      textAlign: 'center',
      letterSpacing: 8,
      fontSize: 18,
      fontWeight: 'bold',
    },
    otpInput: {
      textAlign: 'center',
      letterSpacing: 8,
      fontSize: 18,
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.border,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    resendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    resendText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    resendButton: {
      marginLeft: 5,
    },
    resendButtonText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    resendButtonDisabled: {
      color: theme.colors.textSecondary,
    },
    infoBox: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    infoText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    backButton: {
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 1,
    },
  });

  const handleRequestOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email harus diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/mobile/pin/forgot-pin', {
        email: email.trim(),
      });

      if (response.success) {
        setStep('otp');
        setTimeLeft(600); // 10 minutes
        setCanResend(false);
        
        // Start countdown timer
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        Alert.alert(
          'OTP Terkirim',
          'Kode OTP telah dikirim ke WhatsApp Anda. Silakan cek WhatsApp dan masukkan kode OTP.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Gagal mengirim OTP');
      }
    } catch (error: any) {
      console.error('Request OTP error:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Error', 'Masukkan kode OTP 6 digit');
      return;
    }

    setLoading(true);
    try {
      // For now, just proceed to next step
      // In real implementation, you might want to verify OTP first
      setStep('newPin');
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPIN = async () => {
    if (!newPin.trim() || newPin.length !== 6) {
      Alert.alert('Error', 'PIN harus 6 digit');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PIN dan konfirmasi PIN tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/mobile/pin/forgot-pin', {
        email: email.trim(),
        otp: otp.trim(),
        newPin: newPin.trim(),
      });

      if (response.success) {
        Alert.alert(
          'Berhasil',
          'PIN berhasil direset. Silakan login dengan PIN baru Anda.',
          [
            {
              text: 'OK',
              onPress: () => safeNavigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Gagal reset PIN');
      }
    } catch (error: any) {
      console.error('Reset PIN error:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      const response = await api.post('/mobile/pin/forgot-pin', {
        email: email.trim(),
      });

      if (response.success) {
        setTimeLeft(600);
        setCanResend(false);
        setOtp('');
        
        // Start countdown timer
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        Alert.alert('Berhasil', 'Kode OTP baru telah dikirim ke WhatsApp Anda.');
      } else {
        Alert.alert('Error', response.message || 'Gagal mengirim ulang OTP');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'email', label: '1' },
      { key: 'otp', label: '2' },
      { key: 'newPin', label: '3' },
    ];

    return (
      <View style={styles.stepIndicator}>
        {steps.map((stepItem, index) => {
          let stepStyle = styles.stepInactive;
          if (step === stepItem.key) {
            stepStyle = styles.stepActive;
          } else if (index < steps.findIndex(s => s.key === step)) {
            stepStyle = styles.stepCompleted;
          }

          return (
            <View key={stepItem.key} style={[styles.step, stepStyle]}>
              <Text style={styles.stepText}>{stepItem.label}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderEmailStep = () => (
    <View style={styles.form}>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Masukkan email yang terdaftar. Kami akan mengirim kode OTP ke WhatsApp Anda untuk reset PIN.
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Masukkan email Anda"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRequestOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Kirim OTP ke WhatsApp</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderOTPStep = () => (
    <View style={styles.form}>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Kode OTP telah dikirim ke WhatsApp Anda. Masukkan kode 6 digit untuk melanjutkan.
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Kode OTP</Text>
        <TextInput
          style={[styles.input, styles.otpInput]}
          value={otp}
          onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="000000"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, (loading || otp.length !== 6) && styles.buttonDisabled]}
        onPress={handleVerifyOTP}
        disabled={loading || otp.length !== 6}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Verifikasi OTP</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          Tidak menerima kode? {timeLeft > 0 ? `Tunggu ${formatTime(timeLeft)}` : ''}
        </Text>
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendOTP}
          disabled={!canResend || loading}
        >
          <Text style={[styles.resendButtonText, !canResend && styles.resendButtonDisabled]}>
            Kirim Ulang
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNewPinStep = () => (
    <View style={styles.form}>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Masukkan PIN baru 6 digit. PIN ini akan digunakan untuk mengakses aplikasi.
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>PIN Baru</Text>
        <TextInput
          style={[styles.input, styles.pinInput]}
          value={newPin}
          onChangeText={(text) => setNewPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="000000"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
          maxLength={6}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Konfirmasi PIN Baru</Text>
        <TextInput
          style={[styles.input, styles.pinInput]}
          value={confirmPin}
          onChangeText={(text) => setConfirmPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="000000"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
          maxLength={6}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          (loading || newPin.length !== 6 || confirmPin.length !== 6 || newPin !== confirmPin) &&
            styles.buttonDisabled,
        ]}
        onPress={handleResetPIN}
        disabled={
          loading ||
          newPin.length !== 6 ||
          confirmPin.length !== 6 ||
          newPin !== confirmPin
        }
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Reset PIN</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => safeNavigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Lupa PIN</Text>
            <Text style={styles.subtitle}>
              Reset PIN Anda dengan kode OTP yang dikirim ke WhatsApp
            </Text>
          </View>

          {renderStepIndicator()}

          {step === 'email' && renderEmailStep()}
          {step === 'otp' && renderOTPStep()}
          {step === 'newPin' && renderNewPinStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPinScreen;
