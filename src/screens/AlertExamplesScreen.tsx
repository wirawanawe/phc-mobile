import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomTheme } from '../theme/theme';
import CustomAlert from '../components/CustomAlert';
import useAlert from '../hooks/useAlert';
import { safeGoBack } from '../utils/safeNavigation';

const { width } = Dimensions.get('window');

const AlertExamplesScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { alertState, showAlert, showSuccessAlert, showErrorAlert, showWarningAlert, showInfoAlert, showConfirmationAlert, showLoadingAlert } = useAlert();

  const alertExamples = [
    {
      id: 'success',
      title: 'Success Alert',
      description: 'Menampilkan pesan sukses dengan auto-close',
      icon: 'check-circle',
      color: '#10B981',
      onPress: () => {
        showSuccessAlert(
          'Berhasil Disimpan',
          'Data Anda telah berhasil disimpan ke dalam sistem.',
          () => console.log('Success alert closed')
        );
      }
    },
    {
      id: 'error',
      title: 'Error Alert',
      description: 'Menampilkan pesan error dengan detail',
      icon: 'close-circle',
      color: '#EF4444',
      onPress: () => {
        showErrorAlert(
          'Terjadi Kesalahan',
          'Tidak dapat menyimpan data. Silakan periksa koneksi internet Anda dan coba lagi.',
          () => console.log('Error alert closed')
        );
      }
    },
    {
      id: 'warning',
      title: 'Warning Alert',
      description: 'Menampilkan peringatan untuk user',
      icon: 'alert-circle',
      color: '#F59E0B',
      onPress: () => {
        showWarningAlert(
          'Peringatan',
          'Data yang Anda masukkan mungkin tidak lengkap. Apakah Anda yakin ingin melanjutkan?',
          () => console.log('Warning alert closed')
        );
      }
    },
    {
      id: 'info',
      title: 'Info Alert',
      description: 'Menampilkan informasi penting',
      icon: 'information',
      color: '#3B82F6',
      onPress: () => {
        showInfoAlert(
          'Informasi',
          'Fitur ini akan segera tersedia dalam pembaruan mendatang. Terima kasih atas kesabaran Anda.',
          () => console.log('Info alert closed')
        );
      }
    },
    {
      id: 'confirmation',
      title: 'Confirmation Alert',
      description: 'Meminta konfirmasi dari user',
      icon: 'help-circle',
      color: '#8B5CF6',
      onPress: () => {
        showConfirmationAlert(
          'Konfirmasi Hapus',
          'Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.',
          () => {
            console.log('User confirmed deletion');
            showSuccessAlert('Berhasil Dihapus', 'Item telah berhasil dihapus.');
          },
          () => console.log('User cancelled deletion'),
          'Ya, Hapus',
          'Batal'
        );
      }
    },
    {
      id: 'loading',
      title: 'Loading Alert',
      description: 'Menampilkan loading state',
      icon: 'loading',
      color: '#6B7280',
      onPress: () => {
        showLoadingAlert(
          'Memproses Data',
          'Mohon tunggu sebentar, data sedang diproses...'
        );
        
        // Simulate loading for 3 seconds
        setTimeout(() => {
          showSuccessAlert(
            'Selesai',
            'Data telah berhasil diproses!'
          );
        }, 3000);
      }
    },
    {
      id: 'custom',
      title: 'Custom Alert',
      description: 'Alert dengan konfigurasi khusus',
      icon: 'cog',
      color: '#059669',
      onPress: () => {
        showAlert(
          'Alert Khusus',
          'Ini adalah contoh alert dengan konfigurasi khusus yang dapat disesuaikan sesuai kebutuhan.',
          'info',
          {
            buttonText: 'Mengerti',
            autoClose: true,
            autoCloseDelay: 4000,
            onPress: () => console.log('Custom alert closed')
          }
        );
      }
    },
    {
      id: 'network',
      title: 'Network Error',
      description: 'Simulasi error koneksi',
      icon: 'wifi-off',
      color: '#DC2626',
      onPress: () => {
        showErrorAlert(
          'Koneksi Gagal',
          'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
          () => console.log('Network error alert closed')
        );
      }
    },
    {
      id: 'validation',
      title: 'Validation Error',
      description: 'Error validasi form',
      icon: 'form-select',
      color: '#EA580C',
      onPress: () => {
        showWarningAlert(
          'Data Tidak Lengkap',
          'Mohon lengkapi semua field yang diperlukan sebelum melanjutkan.',
          () => console.log('Validation error alert closed')
        );
      }
    },
    {
      id: 'permission',
      title: 'Permission Alert',
      description: 'Meminta izin akses',
      icon: 'shield-check',
      color: '#7C3AED',
      onPress: () => {
        showInfoAlert(
          'Izin Diperlukan',
          'Aplikasi memerlukan izin untuk mengakses kamera untuk fitur ini.',
          () => console.log('Permission alert closed')
        );
      }
    },
    {
      id: 'update',
      title: 'Update Available',
      description: 'Notifikasi pembaruan',
      icon: 'update',
      color: '#0891B2',
      onPress: () => {
        showInfoAlert(
          'Pembaruan Tersedia',
          'Versi baru aplikasi tersedia. Silakan perbarui untuk mendapatkan fitur terbaru.',
          () => console.log('Update alert closed')
        );
      }
    },
    {
      id: 'maintenance',
      title: 'Maintenance Mode',
      description: 'Mode pemeliharaan',
      icon: 'wrench',
      color: '#B45309',
      onPress: () => {
        showWarningAlert(
          'Mode Pemeliharaan',
          'Aplikasi sedang dalam pemeliharaan. Silakan coba lagi dalam beberapa menit.',
          () => console.log('Maintenance alert closed')
        );
      }
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#F8FAFF", "#E8EAFF"]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => safeGoBack(navigation, 'Main')}
          >
            <Icon name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contoh Alert</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Berikut adalah contoh-contoh alert yang tersedia dalam aplikasi. 
            Setiap alert memiliki desain dan fungsi yang berbeda sesuai dengan konteksnya.
          </Text>

          <View style={styles.examplesContainer}>
            {alertExamples.map((example) => (
              <TouchableOpacity
                key={example.id}
                style={styles.exampleCard}
                onPress={example.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.exampleIcon, { backgroundColor: example.color + '20' }]}>
                  <Icon name={example.icon} size={24} color={example.color} />
                </View>
                <View style={styles.exampleContent}>
                  <Text style={styles.exampleTitle}>{example.title}</Text>
                  <Text style={styles.exampleDescription}>{example.description}</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Fitur Alert</Text>
            <View style={styles.infoItems}>
              <View style={styles.infoItem}>
                <Icon name="check" size={16} color="#10B981" />
                <Text style={styles.infoText}>6 jenis alert berbeda</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="check" size={16} color="#10B981" />
                <Text style={styles.infoText}>Auto-close untuk alert sukses</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="check" size={16} color="#10B981" />
                <Text style={styles.infoText}>Konfirmasi dengan 2 tombol</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="check" size={16} color="#10B981" />
                <Text style={styles.infoText}>Desain yang konsisten</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="check" size={16} color="#10B981" />
                <Text style={styles.infoText}>Animasi yang smooth</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Custom Alert Modal */}
        <CustomAlert
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          type={alertState.type}
          onPress={alertState.onPress}
          onCancel={alertState.onCancel}
          buttonText={alertState.buttonText}
          cancelButtonText={alertState.cancelButtonText}
          showCancelButton={alertState.showCancelButton}
          autoClose={alertState.autoClose}
          autoCloseDelay={alertState.autoCloseDelay}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  examplesContainer: {
    gap: 12,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  exampleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exampleContent: {
    flex: 1,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  exampleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  infoSection: {
    marginTop: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoItems: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
});

export default AlertExamplesScreen;
