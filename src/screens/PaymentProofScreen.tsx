import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingError from '../components/LoadingError';
import { safeGoBack } from "../utils/safeNavigation";

interface PaymentProofScreenProps {
  navigation: any;
  route: {
    params: {
      consultationId: number;
      consultation?: any;
    };
  };
}

interface Consultation {
  id: number;
  consultation_id: string;
  doctor: {
    name: string;
    specialization: string;
  };
  scheduled_date: string;
  scheduled_time: string;
  price: number;
  status: string;
  payment_status: string;
}

const PaymentProofScreen: React.FC<PaymentProofScreenProps> = ({
  navigation,
  route,
}) => {
  const { user } = useAuth();
  const { consultationId } = route.params;
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingConsultation, setLoadingConsultation] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods = [
    { id: 'bank_transfer', name: 'Transfer Bank', icon: 'bank' },
    { id: 'e_wallet', name: 'E-Wallet', icon: 'wallet' },
    { id: 'credit_card', name: 'Kartu Kredit', icon: 'credit-card' },
    { id: 'virtual_account', name: 'Virtual Account', icon: 'account' },
  ];

  useEffect(() => {
    fetchConsultation();
  }, []);

  const fetchConsultation = async () => {
    try {
      setLoadingConsultation(true);
      setError(null);
      const response = await apiService.getConsultation(consultationId);
      if (response.success) {
        setConsultation(response.data);
      } else {
        setError('Failed to fetch consultation details');
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
      setError('Failed to fetch consultation details');
    } finally {
      setLoadingConsultation(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take a photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleUploadProof = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select or take a photo of payment proof');
      return;
    }

    if (!paymentMethod) {
      Alert.alert('Error', 'Please select payment method');
      return;
    }

    if (!paymentReference.trim()) {
      Alert.alert('Error', 'Please enter payment reference number');
      return;
    }

    try {
      setLoading(true);
      
      // In a real app, you would upload the image to a server first
      // For now, we'll use a placeholder URL
      const paymentProofUrl = selectedImage; // This should be the uploaded image URL
      
      const response = await apiService.uploadPaymentProof(consultationId, {
        payment_proof_url: paymentProofUrl,
        payment_method: paymentMethod,
        payment_reference: paymentReference.trim(),
        notes: notes.trim(),
      });

      if (response.success) {
        Alert.alert(
          'Upload Successful',
          'Bukti pembayaran berhasil diupload. Menunggu konfirmasi admin.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('ConsultationHistory');
              },
            },
          ]
        );
      } else {
        Alert.alert('Upload Failed', response.message || 'Failed to upload payment proof');
      }
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      Alert.alert('Upload Failed', 'Unable to upload payment proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        paymentMethod === method.id && styles.selectedPaymentMethod,
      ]}
      onPress={() => setPaymentMethod(method.id)}
    >
      <View style={styles.paymentMethodContent}>
        <View style={styles.paymentMethodIcon}>
          <Icon 
            name={method.icon} 
            size={24} 
            color={paymentMethod === method.id ? '#E22345' : '#6B7280'} 
          />
        </View>
        <View style={styles.paymentMethodDetails}>
          <Text style={styles.paymentMethodName}>{method.name}</Text>
        </View>
        <View style={styles.radioButton}>
          {paymentMethod === method.id && (
            <View style={styles.radioButtonSelected} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loadingConsultation) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingError loading={true} />
      </SafeAreaView>
    );
  }

  if (error || !consultation) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingError error={error || 'Consultation not found'} onRetry={fetchConsultation} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#E22345" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeGoBack(navigation, 'Main')}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Bukti Pembayaran</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Consultation Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Detail Konsultasi</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ID Konsultasi:</Text>
            <Text style={styles.summaryValue}>{consultation.consultation_id}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dokter:</Text>
            <Text style={styles.summaryValue}>{consultation.doctor.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tanggal:</Text>
            <Text style={styles.summaryValue}>{consultation.scheduled_date}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Waktu:</Text>
            <Text style={styles.summaryValue}>{consultation.scheduled_time}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryPrice}>
              Rp {consultation.price.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Payment Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nomor Referensi Pembayaran</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan nomor referensi pembayaran"
            value={paymentReference}
            onChangeText={setPaymentReference}
            keyboardType="numeric"
          />
        </View>

        {/* Payment Proof Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Bukti Pembayaran</Text>
          
          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.changeImageText}>Ganti Foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Icon name="image-plus" size={32} color="#6B7280" />
                <Text style={styles.uploadText}>Pilih dari Galeri</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                <Icon name="camera" size={32} color="#6B7280" />
                <Text style={styles.uploadText}>Ambil Foto</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catatan (Opsional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tambahkan catatan jika diperlukan"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Information */}
        <View style={styles.infoCard}>
          <Icon name="information" size={20} color="#0369A1" />
          <Text style={styles.infoText}>
            Bukti pembayaran akan dikonfirmasi oleh admin dalam waktu 1-2 jam kerja. 
            Setelah dikonfirmasi, Anda dapat langsung mulai konsultasi dengan dokter.
          </Text>
        </View>
      </ScrollView>

      {/* Upload Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.uploadProofButton,
            (!selectedImage || !paymentMethod || !paymentReference.trim() || loading) && styles.disabledButton,
          ]}
          onPress={handleUploadProof}
          disabled={!selectedImage || !paymentMethod || !paymentReference.trim() || loading}
        >
          {loading ? (
            <Text style={styles.uploadProofButtonText}>Uploading...</Text>
          ) : (
            <Text style={styles.uploadProofButtonText}>Upload Bukti Pembayaran</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E22345',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E22345',
  },
  paymentMethod: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedPaymentMethod: {
    borderColor: '#E22345',
    backgroundColor: '#FEF2F2',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E22345',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  uploadText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeImageButton: {
    backgroundColor: '#E22345',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  uploadProofButton: {
    backgroundColor: '#E22345',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  uploadProofButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PaymentProofScreen; 