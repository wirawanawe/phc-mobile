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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingError from '../components/LoadingError';
import { safeGoBack } from "../utils/safeNavigation";
import { ConsultationPaymentScreenProps } from "../types/navigation";

interface Consultation {
  id: number;
  consultation_id: string;
  consultation_type: string;
  scheduled_date: string;
  scheduled_time: string;
  price: number;
  complaint: string;
  status: string;
  doctor: {
    id: number;
    name: string;
    specialization: string;
    avatar_url: string;
  };
}

const ConsultationPaymentScreen: React.FC<ConsultationPaymentScreenProps> = ({
  navigation,
  route,
}) => {
  const { user } = useAuth();
  const { consultationId } = route.params;
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingConsultation, setLoadingConsultation] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: 'bank_transfer',
      name: 'Transfer Bank',
      icon: 'bank',
      description: 'Transfer melalui rekening bank',
    },
    {
      id: 'e_wallet',
      name: 'E-Wallet',
      icon: 'wallet',
      description: 'GoPay, OVO, DANA, LinkAja',
    },
    {
      id: 'credit_card',
      name: 'Kartu Kredit',
      icon: 'credit-card',
      description: 'Visa, Mastercard, JCB',
    },
    {
      id: 'virtual_account',
      name: 'Virtual Account',
      icon: 'account',
      description: 'VA Bank (BCA, BRI, BNI, Mandiri)',
    },
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

  const handlePayment = async () => {
    if (!selectedPayment) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (!consultation) {
      Alert.alert('Error', 'Consultation data not available');
      return;
    }

    try {
      setLoading(true);
      
      // Generate payment reference
      const paymentReference = `PAY${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const response = await apiService.payConsultation(consultationId, {
        payment_method: selectedPayment,
        payment_reference: paymentReference,
      });

      if (response.success) {
        Alert.alert(
          'Payment Successful',
          'Your payment has been processed successfully. You can now start chatting with the doctor.',
          [
            {
              text: 'Start Chat',
              onPress: () => {
                navigation.navigate('ChatDetail', {
                  chatId: response.data.chat_id,
                });
              },
            },
          ]
        );
      } else {
        // If payment fails, redirect to payment proof upload
        Alert.alert(
          'Payment Processing',
          'Please upload proof of payment for admin confirmation.',
          [
            {
              text: 'Upload Proof',
              onPress: () => {
                navigation.navigate('PaymentProof', {
                  consultationId: consultationId,
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Payment Failed', 'Unable to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        selectedPayment === method.id && styles.selectedPaymentMethod,
      ]}
      onPress={() => setSelectedPayment(method.id)}
    >
      <View style={styles.paymentMethodContent}>
        <View style={styles.paymentMethodIcon}>
          <Icon 
            name={method.icon} 
            size={24} 
            color={selectedPayment === method.id ? '#E22345' : '#6B7280'} 
          />
        </View>
        <View style={styles.paymentMethodDetails}>
          <Text style={styles.paymentMethodName}>{method.name}</Text>
          <Text style={styles.paymentMethodDescription}>{method.description}</Text>
        </View>
        <View style={styles.radioButton}>
          {selectedPayment === method.id && (
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
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Consultation Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Consultation Details</Text>
          
          <View style={styles.doctorInfo}>
            <View style={styles.doctorAvatar}>
              <Icon name="doctor" size={30} color="#E22345" />
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>{consultation.doctor.name}</Text>
              <Text style={styles.doctorSpecialization}>{consultation.doctor.specialization}</Text>
            </View>
          </View>

          <View style={styles.consultationDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Consultation ID:</Text>
              <Text style={styles.detailValue}>{consultation.consultation_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>
                {consultation.consultation_type === 'chat' ? 'Chat' : 
                 consultation.consultation_type === 'video_call' ? 'Video Call' : 'Phone'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(consultation.scheduled_date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{consultation.scheduled_time}</Text>
            </View>
          </View>

          <View style={styles.pricingSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Consultation Fee:</Text>
              <Text style={styles.priceValue}>
                Rp {consultation.price.toLocaleString('id-ID')}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                Rp {consultation.price.toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Payment Information */}
        <View style={styles.infoCard}>
          <Icon name="information" size={20} color="#0369A1" />
          <Text style={styles.infoText}>
            After payment is confirmed, you will be able to start chatting with the doctor immediately. 
            The consultation session will remain active until completed.
          </Text>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <View style={styles.totalSummary}>
          <Text style={styles.payTotalLabel}>Total Payment</Text>
          <Text style={styles.payTotalValue}>
            Rp {consultation.price.toLocaleString('id-ID')}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!selectedPayment || loading) && styles.disabledButton,
          ]}
          onPress={handlePayment}
          disabled={!selectedPayment || loading}
        >
          {loading ? (
            <Text style={styles.payButtonText}>Processing...</Text>
          ) : (
            <Text style={styles.payButtonText}>Pay Now</Text>
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
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
    marginBottom: 16,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#6B7280',
  },
  consultationDetails: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  pricingSection: {
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E22345',
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
  paymentMethod: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  selectedPaymentMethod: {
    borderColor: '#E22345',
    borderWidth: 2,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E22345',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#0369A1',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  totalSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  payTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  payTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E22345',
  },
  payButton: {
    backgroundColor: '#E22345',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ConsultationPaymentScreen; 