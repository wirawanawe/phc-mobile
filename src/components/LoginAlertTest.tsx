import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import LoginAlert from './LoginAlert';

const LoginAlertTest: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>('error');

  const testAlerts = [
    {
      type: 'error' as const,
      message: 'Email tidak terdaftar. Silakan daftar terlebih dahulu.',
      title: 'Test Error Alert'
    },
    {
      type: 'warning' as const,
      message: 'Terlalu banyak percobaan login. Silakan tunggu beberapa menit.',
      title: 'Test Warning Alert'
    },
    {
      type: 'info' as const,
      message: 'Koneksi internet Anda lambat. Silakan coba lagi.',
      title: 'Test Info Alert'
    }
  ];

  const handleTestAlert = (type: 'error' | 'warning' | 'info', message: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const handleAlertRetry = () => {
    console.log('Retry button pressed');
    setShowAlert(false);
  };

  const handleAlertRegister = () => {
    console.log('Register button pressed');
    setShowAlert(false);
  };

  const handleAlertForgotPassword = () => {
    console.log('Forgot password button pressed');
    setShowAlert(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Alert Test</Text>
      <Text style={styles.subtitle}>Tap any button to test different alert types</Text>
      
      {testAlerts.map((testAlert, index) => (
        <TouchableOpacity
          key={index}
          style={styles.testButton}
          onPress={() => handleTestAlert(testAlert.type, testAlert.message)}
        >
          <Text style={styles.testButtonText}>{testAlert.title}</Text>
        </TouchableOpacity>
      ))}

      <LoginAlert
        visible={showAlert}
        message={alertMessage}
        type={alertType}
        onRetry={handleAlertRetry}
        onRegister={handleAlertRegister}
        onForgotPassword={handleAlertForgotPassword}
        onClose={handleAlertClose}
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

export default LoginAlertTest;
