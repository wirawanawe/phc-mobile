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
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingError from '../components/LoadingError';

interface AdminPaymentConfirmationScreenProps {
  navigation: any;
  route: any;
}

interface Consultation {
  id: number;
  consultation_id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  doctor: {
    name: string;
    specialization: string;
  };
  scheduled_date: string;
  scheduled_time: string;
  price: number;
  payment_method: string;
  payment_reference: string;
  payment_proof_url: string;
  payment_notes: string;
  payment_proof_uploaded_at: string;
}

const AdminPaymentConfirmationScreen: React.FC<AdminPaymentConfirmationScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingConfirmations();
  }, []);

  const fetchPendingConfirmations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getPendingPaymentConfirmations();
      if (response.success) {
        setConsultations(response.data || []);
      } else {
        setError('Failed to fetch pending confirmations');
      }
    } catch (error) {
      console.error('Error fetching pending confirmations:', error);
      setError('Failed to fetch pending confirmations');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (isApproved: boolean) => {
    if (!selectedConsultation) return;

    try {
      setProcessing(true);
      
      const response = await apiService.confirmPayment(selectedConsultation.id, {
        is_approved: isApproved,
        admin_notes: adminNotes.trim(),
      });

      if (response.success) {
        Alert.alert(
          'Success',
          isApproved ? 'Payment confirmed successfully.' : 'Payment rejected.',
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedConsultation(null);
                setAdminNotes('');
                fetchPendingConfirmations();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to process confirmation');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      Alert.alert('Error', 'Failed to process confirmation');
    } finally {
      setProcessing(false);
    }
  };

  const renderConsultationCard = (consultation: Consultation) => (
    <TouchableOpacity
      key={consultation.id}
      style={styles.consultationCard}
      onPress={() => setSelectedConsultation(consultation)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.consultationId}>{consultation.consultation_id}</Text>
        <Text style={styles.uploadTime}>
          {new Date(consultation.payment_proof_uploaded_at).toLocaleString('id-ID')}
        </Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{consultation.user.name}</Text>
          <Text style={styles.userEmail}>{consultation.user.email}</Text>
          <Text style={styles.userPhone}>{consultation.user.phone}</Text>
        </View>
        
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{consultation.doctor.name}</Text>
          <Text style={styles.doctorSpecialization}>{consultation.doctor.specialization}</Text>
        </View>
        
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentMethod}>
            {consultation.payment_method} - {consultation.payment_reference}
          </Text>
          <Text style={styles.paymentAmount}>
            Rp {consultation.price.toLocaleString('id-ID')}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.viewProofButton}
          onPress={() => setSelectedConsultation(consultation)}
        >
          <Icon name="eye" size={16} color="#E22345" />
          <Text style={styles.viewProofText}>Lihat Bukti</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderPaymentProofModal = () => {
    if (!selectedConsultation) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Konfirmasi Pembayaran</Text>
            <TouchableOpacity
              onPress={() => setSelectedConsultation(null)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Consultation Details */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Detail Konsultasi</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>ID:</Text>
                <Text style={styles.modalValue}>{selectedConsultation.consultation_id}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Pasien:</Text>
                <Text style={styles.modalValue}>{selectedConsultation.user.name}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Dokter:</Text>
                <Text style={styles.modalValue}>{selectedConsultation.doctor.name}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Tanggal:</Text>
                <Text style={styles.modalValue}>
                  {selectedConsultation.scheduled_date} {selectedConsultation.scheduled_time}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Total:</Text>
                <Text style={styles.modalValue}>
                  Rp {selectedConsultation.price.toLocaleString('id-ID')}
                </Text>
              </View>
            </View>

            {/* Payment Details */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Detail Pembayaran</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Metode:</Text>
                <Text style={styles.modalValue}>{selectedConsultation.payment_method}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Referensi:</Text>
                <Text style={styles.modalValue}>{selectedConsultation.payment_reference}</Text>
              </View>
              {selectedConsultation.payment_notes && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Catatan:</Text>
                  <Text style={styles.modalValue}>{selectedConsultation.payment_notes}</Text>
                </View>
              )}
            </View>

            {/* Payment Proof */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Bukti Pembayaran</Text>
              {selectedConsultation.payment_proof_url && (
                <Image
                  source={{ uri: selectedConsultation.payment_proof_url }}
                  style={styles.proofImage}
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Admin Notes */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Catatan Admin</Text>
              <TextInput
                style={styles.adminNotesInput}
                placeholder="Tambahkan catatan (opsional)"
                value={adminNotes}
                onChangeText={setAdminNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleConfirmPayment(false)}
              disabled={processing}
            >
              <Text style={styles.rejectButtonText}>Tolak</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleConfirmPayment(true)}
              disabled={processing}
            >
              <Text style={styles.approveButtonText}>Terima</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingError loading={true} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingError error={error} onRetry={fetchPendingConfirmations} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#E22345" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Konfirmasi Pembayaran</Text>
        <TouchableOpacity onPress={fetchPendingConfirmations}>
          <Icon name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {consultations.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="check-circle" size={64} color="#10B981" />
            <Text style={styles.emptyStateTitle}>Tidak Ada Konfirmasi Tertunda</Text>
            <Text style={styles.emptyStateText}>
              Semua bukti pembayaran telah diproses.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Menunggu Konfirmasi</Text>
              <Text style={styles.statsCount}>{consultations.length}</Text>
            </View>
            
            {consultations.map(renderConsultationCard)}
          </>
        )}
      </ScrollView>

      {renderPaymentProofModal()}
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
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statsCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E22345',
  },
  consultationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  consultationId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  uploadTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardContent: {
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  userPhone: {
    fontSize: 12,
    color: '#6B7280',
  },
  doctorInfo: {
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  doctorSpecialization: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E22345',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  viewProofButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  viewProofText: {
    fontSize: 14,
    color: '#E22345',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  adminNotesInput: {
    backgroundColor: '#F9FAFB',
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
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  rejectButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  approveButton: {
    backgroundColor: '#E22345',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdminPaymentConfirmationScreen; 