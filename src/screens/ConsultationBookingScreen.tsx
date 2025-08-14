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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingError from '../components/LoadingError';
import { safeGoBack } from "../utils/safeNavigation";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  avatar_url: string;
  price_per_consultation: number;
  experience_years: number;
  rating: number;
}

interface ConsultationBookingScreenProps {
  navigation: any;
  route: {
    params?: {
      doctorId?: number;
      doctor?: any; // Data dokter dari halaman detail
      selectedTimeSlot?: string; // Waktu yang dipilih
    };
  };
}

const ConsultationBookingScreen: React.FC<ConsultationBookingScreenProps> = ({
  navigation,
  route,
}) => {
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [consultationType, setConsultationType] = useState<'chat' | 'video_call' | 'phone'>('chat');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [complaint, setComplaint] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have doctor data from detail page
    if (route.params?.doctor) {
      setSelectedDoctor(route.params.doctor);
      // Set the selected time if provided
      if (route.params.selectedTimeSlot) {
        setSelectedTime(route.params.selectedTimeSlot);
      }
      // Set today's date
      const today = new Date();
      setSelectedDate(today.toISOString().split('T')[0]);
    } else {
      // If no doctor data, redirect back
      Alert.alert('Error', 'Data dokter tidak ditemukan', [
        { text: 'OK', onPress: () => safeGoBack(navigation, 'Main') }
      ]);
    }
  }, [route.params?.doctor, route.params?.selectedTimeSlot]);

  // Simplified - no need to fetch doctors

  // Simplified - no need to generate date/time slots

  // Simplified - no need for date/time selection functions

  const handleBookConsultation = async () => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Data dokter tidak ditemukan');
      return;
    }

    if (!complaint.trim()) {
      Alert.alert('Error', 'Mohon isi keluhan Anda');
      return;
    }

    try {
      setLoading(true);
      
      const bookingData = {
        doctor_id: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        notes: complaint,
        consultation_type: consultationType
      };

      const response = await apiService.bookConsultation(bookingData);
      
      if (response.success) {
        Alert.alert(
          'Booking Successful',
          'Your consultation has been booked. Please proceed with payment.',
          [
            {
              text: 'Pay Now',
              onPress: () => {
                navigation.navigate('ConsultationPayment', {
                  consultationId: response.data.id,
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to book consultation');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to book consultation');
    } finally {
      setLoading(false);
    }
  };

  const renderDoctorCard = (doctor: Doctor) => (
    <View
      key={doctor.id}
      style={[
        styles.doctorCard,
        selectedDoctor?.id === doctor.id && styles.selectedDoctorCard,
      ]}
    >
      <View style={styles.doctorInfo}>
        <View style={styles.doctorAvatar}>
          <Icon name="doctor" size={30} color="#E22345" />
        </View>
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFA500" />
            <Text style={styles.rating}>{doctor.rating || 4.5}</Text>
            <Text style={styles.experience}>• {doctor.experience_years || 5} tahun</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            Rp {(doctor.price_per_consultation || 150000).toLocaleString('id-ID')}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderConsultationTypes = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Jenis Konsultasi</Text>
      <View style={styles.typeContainer}>
        {[
          { value: 'chat', label: 'Chat', icon: 'chat' },
          { value: 'video_call', label: 'Video Call', icon: 'video' },
          { value: 'phone', label: 'Telepon', icon: 'phone' },
        ].map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeButton,
              consultationType === type.value && styles.selectedTypeButton,
            ]}
            onPress={() => setConsultationType(type.value as any)}
          >
            <Icon 
              name={type.icon} 
              size={20} 
              color={consultationType === type.value ? '#FFFFFF' : '#E22345'} 
            />
            <Text
              style={[
                styles.typeText,
                consultationType === type.value && styles.selectedTypeText,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Simplified - no need for date/time selection rendering

  // No loading state needed since we always have doctor data from params

  // Only show error if we don't have doctor data and there's an error
  if (error && !route.params?.doctor) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingError error={error} onRetry={() => safeGoBack(navigation, 'Main')} />
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
        <Text style={styles.headerTitle}>Book Konsultasi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dokter yang Dipilih</Text>
          {selectedDoctor ? (
            renderDoctorCard(selectedDoctor)
          ) : (
            <View style={styles.noDoctorContainer}>
              <Icon name="doctor" size={48} color="#9CA3AF" />
              <Text style={styles.noDoctorText}>Tidak ada dokter yang dipilih</Text>
            </View>
          )}
        </View>

        {/* Consultation Types */}
        {renderConsultationTypes()}

        {/* Complaint Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keluhan</Text>
          <View style={styles.inputContainer}>
            <Icon name="clipboard-text" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.textArea}
              onChangeText={setComplaint}
              value={complaint}
              placeholder="Jelaskan keluhan Anda..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Summary */}
        {selectedDoctor && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Ringkasan Booking</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dokter:</Text>
              <Text style={styles.summaryValue}>{selectedDoctor.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tanggal:</Text>
              <Text style={styles.summaryValue}>
                {new Date(selectedDate).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Waktu:</Text>
              <Text style={styles.summaryValue}>{selectedTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Jenis:</Text>
              <Text style={styles.summaryValue}>
                {consultationType === 'chat' ? 'Chat' : 
                 consultationType === 'video_call' ? 'Video Call' : 'Telepon'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Biaya:</Text>
              <Text style={styles.summaryPrice}>
                Rp {selectedDoctor?.price_per_consultation != null
                  ? selectedDoctor.price_per_consultation.toLocaleString('id-ID')
                  : '-'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedDoctor || loading) && styles.disabledButton,
          ]}
          onPress={handleBookConsultation}
          disabled={!selectedDoctor || loading}
        >
          {loading ? (
            <Text style={styles.bookButtonText}>Memproses...</Text>
          ) : (
            <Text style={styles.bookButtonText}>Book Konsultasi</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedDoctorCard: {
    borderColor: '#E22345',
    borderWidth: 2,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  experience: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E22345',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E22345',
  },
  selectedTypeButton: {
    backgroundColor: '#E22345',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E22345',
    marginLeft: 8,
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  scrollContainer: {
    marginVertical: 8,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedDateButton: {
    backgroundColor: '#E22345',
    borderColor: '#E22345',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  timeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedTimeButton: {
    backgroundColor: '#E22345',
    borderColor: '#E22345',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedTimeText: {
    color: '#FFFFFF',
  },
  selectedTimeContainer: {
    marginTop: 12,
  },
  selectedTimeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  selectedTimeDisplay: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E22345',
    borderStyle: 'dashed',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
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
    flex: 1,
    textAlign: 'right',
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E22345',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookButton: {
    backgroundColor: '#E22345',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noDoctorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noDoctorText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default ConsultationBookingScreen; 