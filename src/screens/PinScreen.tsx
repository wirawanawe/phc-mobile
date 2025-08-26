import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Vibration,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { usePin } from '../contexts/PinContext';
import { useAuth } from '../contexts/AuthContext';
import { RootStackNavigationProp } from '../types/navigation';

const { width } = Dimensions.get('window');

interface PinScreenProps {
  navigation?: any;
  onSuccess?: () => void;
  isSetup?: boolean;
  onSetupComplete?: (pin: string) => void;
}

const PinScreen: React.FC<PinScreenProps> = ({ 
  navigation, 
  onSuccess, 
  isSetup = false,
  onSetupComplete 
}) => {
  // Use navigation hook as primary, fallback to props if provided
  let navigationHook;
  try {
    navigationHook = useNavigation<RootStackNavigationProp>();
  } catch (error) {
    // Navigation hook is not available (component is outside NavigationContainer)
    console.log('PinScreen: Navigation hook not available, using fallback');
  }
  
  const safeNavigation = navigation || navigationHook || {
    navigate: (screen: string) => console.log('Navigate to:', screen),
    goBack: () => console.log('Go back'),
  };
  const { validatePin, incrementPinAttempts, pinAttempts, isPinLocked, resetPinAttempts } = usePin();
  const { logout } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  const PIN_LENGTH = 6;

  useEffect(() => {
    if (isPinLocked) {
      Alert.alert(
        'PIN Terkunci',
        'Terlalu banyak percobaan yang salah. PIN telah terkunci untuk keamanan.',
        [
          {
            text: 'Reset PIN',
            onPress: () => {
              resetPinAttempts();
              setPin('');
              setConfirmPin('');
              setIsConfirming(false);
              setError('');
            },
          },
          {
            text: 'Logout',
            onPress: () => logout(),
            style: 'destructive',
          },
        ]
      );
    }
  }, [isPinLocked]);

  const animateShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateFade = () => {
    Animated.sequence([
      Animated.timing(fadeAnimation, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNumberPress = (number: string) => {
    if (isPinLocked) return;

    Vibration.vibrate(50);
    setError('');

    if (isSetup) {
      if (!isConfirming) {
        if (pin.length < PIN_LENGTH) {
          const newPin = pin + number;
          setPin(newPin);
          
          if (newPin.length === PIN_LENGTH) {
            setIsConfirming(true);
          }
        }
      } else {
        if (confirmPin.length < PIN_LENGTH) {
          const newConfirmPin = confirmPin + number;
          setConfirmPin(newConfirmPin);
          
          if (newConfirmPin.length === PIN_LENGTH) {
            if (newConfirmPin === pin) {
              // PIN setup successful
              if (onSetupComplete) {
                onSetupComplete(pin);
              }
            } else {
              // PINs don't match
              setError('PIN tidak cocok. Silakan coba lagi.');
              setPin('');
              setConfirmPin('');
              setIsConfirming(false);
              animateShake();
            }
          }
        }
      }
    } else {
      // Normal PIN verification
      if (pin.length < PIN_LENGTH) {
        const newPin = pin + number;
        setPin(newPin);
        
        if (newPin.length === PIN_LENGTH) {
          // Handle async PIN validation
          const handlePinValidation = async () => {
            try {
              const isValid = await validatePin(newPin);
              if (isValid) {
                // PIN is correct
                resetPinAttempts();
                animateFade();
                setTimeout(() => {
                  if (onSuccess) {
                    onSuccess();
                  } else if (safeNavigation) {
                    safeNavigation.goBack();
                  }
                }, 300);
              } else {
                // PIN is incorrect
                incrementPinAttempts();
                setError(`PIN salah. Sisa percobaan: ${5 - pinAttempts - 1}`);
                setPin('');
                animateShake();
                Vibration.vibrate(200);
              }
            } catch (error) {
              console.error('Error validating PIN:', error);
              setError('Gagal memvalidasi PIN. Silakan coba lagi.');
              setPin('');
              animateShake();
              Vibration.vibrate(200);
            }
          };
          
          handlePinValidation();
        }
      }
    }
  };

  const handleDelete = () => {
    if (isPinLocked) return;

    Vibration.vibrate(50);
    setError('');

    if (isSetup) {
      if (isConfirming) {
        setConfirmPin(confirmPin.slice(0, -1));
      } else {
        setPin(pin.slice(0, -1));
      }
    } else {
      setPin(pin.slice(0, -1));
    }
  };

  const handleBiometric = () => {
    // Placeholder for biometric authentication
    Alert.alert('Fitur Biometric', 'Fitur biometric akan segera tersedia.');
  };

  const renderPinDots = () => {
    const currentPin = isSetup && isConfirming ? confirmPin : pin;
    const dots = [];

    for (let i = 0; i < PIN_LENGTH; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            i < currentPin.length && styles.dotFilled,
            showPin && i < currentPin.length && styles.dotVisible,
          ]}
        >
          {showPin && i < currentPin.length && (
            <Text style={styles.dotText}>{currentPin[i]}</Text>
          )}
        </View>
      );
    }

    return dots;
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete'],
    ];

    return numbers.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.numberRow}>
        {row.map((item, colIndex) => {
          if (item === '') {
            return <View key={colIndex} style={styles.emptyButton} />;
          }

          if (item === 'delete') {
            return (
              <TouchableOpacity
                key={colIndex}
                style={[styles.numberButton, styles.deleteButton]}
                onPress={handleDelete}
                disabled={isPinLocked || (isSetup && isConfirming ? confirmPin.length === 0 : pin.length === 0)}
              >
                <Icon name="backspace-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={colIndex}
              style={[styles.numberButton, isPinLocked && styles.disabledButton]}
              onPress={() => handleNumberPress(item)}
              disabled={isPinLocked}
            >
              <Text style={styles.numberText}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E22345', '#C41E3A']} style={styles.container}>
        <Animated.View 
          style={[
            styles.content,
            {
              transform: [{ translateX: shakeAnimation }],
              opacity: fadeAnimation,
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Icon name="lock" size={48} color="#FFFFFF" />
            <Text style={styles.title}>
              {isSetup ? 'Atur PIN Keamanan' : 'Masukkan PIN'}
            </Text>
            <Text style={styles.subtitle}>
              {isSetup 
                ? isConfirming 
                  ? 'Konfirmasi PIN Anda' 
                  : 'Buat PIN 6 digit untuk keamanan'
                : 'Masukkan PIN 6 digit untuk membuka aplikasi'
              }
            </Text>
          </View>

          {/* PIN Dots */}
          <View style={styles.pinContainer}>
            <View style={styles.dotsContainer}>
              {renderPinDots()}
            </View>
            
            {/* Show/Hide PIN Toggle */}
            <TouchableOpacity
              style={styles.showPinButton}
              onPress={() => setShowPin(!showPin)}
            >
              <Icon 
                name={showPin ? 'eye-off' : 'eye'} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.showPinText}>
                {showPin ? 'Sembunyikan' : 'Tampilkan'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color="#FFFFFF" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Biometric Button */}
          {/* {!isSetup && (
            <TouchableOpacity style={styles.biometricButton} onPress={handleBiometric}>
              <Icon name="fingerprint" size={24} color="#FFFFFF" />
              <Text style={styles.biometricText}>Gunakan Biometric</Text>
            </TouchableOpacity>
          )}   */}

          {/* Number Pad */}
          <View style={styles.numberPad}>
            {renderNumberPad()}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isSetup 
                ? 'PIN akan digunakan untuk mengamankan aplikasi'
                : 'Lupa PIN? Hubungi admin untuk reset'
              }
            </Text>
            {/* {!isSetup && (
              <TouchableOpacity
                style={styles.forgotPinButton}
                onPress={() => safeNavigation.navigate('ForgotPin')}
              >
                <Text style={styles.forgotPinText}>Lupa PIN? Reset via WhatsApp</Text>
              </TouchableOpacity>
            )} */}
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  pinContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  dotVisible: {
    backgroundColor: 'transparent',
    borderColor: '#FFFFFF',
  },
  dotText: {
    color: '#E22345',
    fontSize: 12,
    fontWeight: 'bold',
  },
  showPinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  showPinText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 40,
  },
  biometricText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  numberPad: {
    marginBottom: 40,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  numberButton: {
    width: (width - 120) / 3,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyButton: {
    width: (width - 120) / 3,
    height: 60,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  forgotPinButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  forgotPinText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PinScreen;
