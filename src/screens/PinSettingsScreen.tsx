import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePin } from '../contexts/PinContext';
import PinScreen from './PinScreen';

const PinSettingsScreen = ({ navigation }: any) => {
  const { 
    isPinEnabled, 
    enablePin, 
    disablePin, 
    setPinCode,
    pinCode,
    isLoading 
  } = usePin();
  
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTogglePin = async (value: boolean) => {
    if (isLoading || isProcessing) return;

    if (value) {
      // Enable PIN - show setup screen
      setShowPinSetup(true);
    } else {
      // Disable PIN
      Alert.alert(
        'Nonaktifkan PIN',
        'Apakah Anda yakin ingin menonaktifkan PIN keamanan? Aplikasi tidak akan memerlukan PIN untuk dibuka.',
        [
          {
            text: 'Batal',
            style: 'cancel',
          },
          {
            text: 'Nonaktifkan',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsProcessing(true);
                await disablePin();
                Alert.alert('Berhasil', 'PIN keamanan telah dinonaktifkan.');
              } catch (error) {
                console.error('Error disabling PIN:', error);
                Alert.alert('Error', 'Gagal menonaktifkan PIN. Silakan coba lagi.');
              } finally {
                setIsProcessing(false);
              }
            },
          },
        ]
      );
    }
  };

  const handlePinSetupComplete = async (pin: string) => {
    try {
      setIsProcessing(true);
      await enablePin(pin);
      setShowPinSetup(false);
      Alert.alert('Berhasil', 'PIN keamanan telah diaktifkan.');
    } catch (error) {
      console.error('Error enabling PIN:', error);
      Alert.alert('Error', 'Gagal mengaktifkan PIN. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangePin = () => {
    if (!isPinEnabled) {
      Alert.alert('PIN Belum Diaktifkan', 'Aktifkan PIN terlebih dahulu untuk mengubah PIN.');
      return;
    }
    setShowPinChange(true);
  };

  const handlePinChangeComplete = async (newPin: string) => {
    try {
      setIsProcessing(true);
      await setPinCode(newPin);
      setShowPinChange(false);
      setIsChangingPin(false);
      Alert.alert('Berhasil', 'PIN telah berhasil diubah.');
    } catch (error) {
      console.error('Error changing PIN:', error);
      Alert.alert('Error', 'Gagal mengubah PIN. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePinChangeSuccess = () => {
    setIsChangingPin(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E22345', '#C41E3A']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pengaturan PIN</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* PIN Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Icon 
                name={isPinEnabled ? 'lock-check' : 'lock-open'} 
                size={32} 
                color={isPinEnabled ? '#10B981' : '#6B7280'} 
              />
              <View style={styles.statusText}>
                <Text style={styles.statusTitle}>
                  {isLoading ? 'Memuat...' : (isPinEnabled ? 'PIN Aktif' : 'PIN Nonaktif')}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {isLoading 
                    ? 'Mengambil pengaturan PIN dari server...'
                    : (isPinEnabled 
                      ? 'Aplikasi dilindungi dengan PIN keamanan' 
                      : 'Aplikasi tidak memerlukan PIN untuk dibuka'
                    )
                  }
                </Text>
              </View>
            </View>
            {(isLoading || isProcessing) && (
              <View style={styles.loadingIndicator}>
                <Icon name="loading" size={16} color="#3B82F6" />
                <Text style={styles.loadingText}>
                  {isLoading ? 'Memuat...' : 'Memproses...'}
                </Text>
              </View>
            )}
          </View>

          {/* Settings */}
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Pengaturan Keamanan</Text>
            
            {/* Enable/Disable PIN */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="shield-lock" size={24} color="#3B82F6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Aktifkan PIN</Text>
                  <Text style={styles.settingSubtitle}>
                    Minta PIN setiap kali aplikasi dibuka
                  </Text>
                </View>
              </View>
              <Switch
                value={isPinEnabled}
                onValueChange={handleTogglePin}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor={isPinEnabled ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E7EB"
                disabled={isLoading || isProcessing}
              />
            </View>

            {/* Change PIN */}
            <TouchableOpacity 
              style={[styles.settingItem, !isPinEnabled && styles.disabledItem]}
              onPress={handleChangePin}
              disabled={!isPinEnabled}
            >
              <View style={styles.settingInfo}>
                <Icon 
                  name="key-change" 
                  size={24} 
                  color={isPinEnabled ? '#F59E0B' : '#9CA3AF'} 
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, !isPinEnabled && styles.disabledText]}>
                    Ubah PIN
                  </Text>
                  <Text style={[styles.settingSubtitle, !isPinEnabled && styles.disabledText]}>
                    Ganti PIN keamanan Anda
                  </Text>
                </View>
              </View>
              <Icon 
                name="chevron-right" 
                size={20} 
                color={isPinEnabled ? '#9CA3AF' : '#9CA3AF'} 
              />
            </TouchableOpacity>

            {/* PIN Info */}
            {isPinEnabled && (
              <View style={styles.infoCard}>
                <Icon name="information" size={20} color="#3B82F6" />
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>Informasi PIN</Text>
                  <Text style={styles.infoSubtitle}>
                    • PIN terdiri dari 6 digit angka{'\n'}
                    • Maksimal 5 percobaan yang salah{'\n'}
                    • PIN akan diminta setiap kali aplikasi dibuka{'\n'}
                    • Jika lupa PIN, hubungi admin untuk reset
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Security Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.sectionTitle}>Tips Keamanan</Text>
            <View style={styles.tipItem}>
              <Icon name="lightbulb" size={20} color="#F59E0B" />
              <Text style={styles.tipText}>
                Gunakan kombinasi angka yang mudah diingat tapi sulit ditebak
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="lightbulb" size={20} color="#F59E0B" />
              <Text style={styles.tipText}>
                Jangan bagikan PIN Anda kepada siapapun
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="lightbulb" size={20} color="#F59E0B" />
              <Text style={styles.tipText}>
                Aktifkan PIN untuk melindungi data kesehatan Anda
              </Text>
            </View>
          </View>
        </View>

        {/* PIN Setup Modal */}
        <Modal
          visible={showPinSetup}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <PinScreen
            isSetup={true}
            onSetupComplete={handlePinSetupComplete}
            onSuccess={() => setShowPinSetup(false)}
          />
        </Modal>

        {/* PIN Change Modal */}
        <Modal
          visible={showPinChange}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          {isChangingPin ? (
            <PinScreen
              isSetup={true}
              onSetupComplete={handlePinChangeComplete}
              onSuccess={() => setShowPinChange(false)}
            />
          ) : (
            <PinScreen
              onSuccess={handlePinChangeSuccess}
            />
          )}
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  settingsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledItem: {
    opacity: 0.6,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  tipsContainer: {
    marginBottom: 24,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default PinSettingsScreen;
