import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AuthErrorModal from './AuthErrorModal';
import { AuthErrorType } from '../utils/authErrorHandler';

const AuthErrorModalTest: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentErrorType, setCurrentErrorType] = useState<AuthErrorType>('401');
  const [currentError, setCurrentError] = useState('');

  const testErrors = [
    {
      type: '401' as AuthErrorType,
      message: 'Email tidak terdaftar. Silakan daftar terlebih dahulu.',
      title: 'Test 401 - User Not Found'
    },
    {
      type: '401' as AuthErrorType,
      message: 'Password salah. Silakan periksa kembali password Anda.',
      title: 'Test 401 - Invalid Password'
    },
    {
      type: '403' as AuthErrorType,
      message: 'Akun Anda telah dinonaktifkan. Hubungi admin untuk bantuan.',
      title: 'Test 403 - Account Deactivated'
    },
    {
      type: 'network' as AuthErrorType,
      message: 'Koneksi gagal. Periksa koneksi internet Anda dan coba lagi.',
      title: 'Test Network Error'
    },
    {
      type: 'server' as AuthErrorType,
      message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
      title: 'Test Server Error'
    },
    {
      type: 'timeout' as AuthErrorType,
      message: 'Permintaan memakan waktu terlalu lama. Silakan coba lagi.',
      title: 'Test Timeout Error'
    },
    {
      type: 'rate_limit' as AuthErrorType,
      message: 'Terlalu banyak percobaan login. Silakan tunggu beberapa menit.',
      title: 'Test Rate Limit Error'
    },
    {
      type: 'general' as AuthErrorType,
      message: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
      title: 'Test General Error'
    }
  ];

  const handleTestError = (errorType: AuthErrorType, message: string) => {
    setCurrentErrorType(errorType);
    setCurrentError(message);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalRetry = () => {
    console.log('Retry button pressed');
    setShowModal(false);
  };

  const handleModalRegister = () => {
    console.log('Register button pressed');
    setShowModal(false);
  };

  const handleModalForgotPassword = () => {
    console.log('Forgot password button pressed');
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Error Modal Test</Text>
      <Text style={styles.subtitle}>Tap any button to test different error types</Text>
      
      {testErrors.map((testError, index) => (
        <TouchableOpacity
          key={index}
          style={styles.testButton}
          onPress={() => handleTestError(testError.type, testError.message)}
        >
          <Text style={styles.testButtonText}>{testError.title}</Text>
        </TouchableOpacity>
      ))}

      <AuthErrorModal
        visible={showModal}
        error={currentError}
        errorType={currentErrorType}
        onRetry={handleModalRetry}
        onClose={handleModalClose}
        onNavigateToRegister={handleModalRegister}
        onNavigateToForgotPassword={handleModalForgotPassword}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthErrorModalTest;
