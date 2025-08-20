import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingError from '../components/LoadingError';
import { useFocusEffect } from '@react-navigation/native';

interface Consultation {
  id: number;
  consultation_id: string;
  consultation_type: string;
  scheduled_date: string;
  scheduled_time: string;
  price: number;
  status: string;
  payment_status: string;
  created_at: string;
  doctor: {
    id: number;
    name: string;
    specialization: string;
    avatar_url: string;
  };
  chat?: {
    id: number;
    chat_id: string;
  };
}

interface ConsultationHistoryScreenProps {
  navigation: any;
}

const ConsultationHistoryScreen: React.FC<ConsultationHistoryScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed'>('all');

  // Remove automatic focus refresh - manual refresh only
  // useFocusEffect(
  //   useCallback(() => {
  //     fetchConsultations();
  //   }, [])
  // );

  const fetchConsultations = async () => {
    try {
      setError(null);
      const response = await apiService.getConsultations();
      if (response.success) {
        setConsultations(response.data || []);
      } else {
        setError('Failed to fetch consultations');
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setError('Failed to fetch consultations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConsultations();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return '#F59E0B';
      case 'paid':
        return '#10B981';
      case 'confirmed':
        return '#3B82F6';
      case 'in_progress':
        return '#8B5CF6';
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#EF4444';
      case 'refunded':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'Menunggu Pembayaran';
      case 'paid':
        return 'Dibayar';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'in_progress':
        return 'Berlangsung';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      case 'refunded':
        return 'Dikembalikan';
      default:
        return status;
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return 'chat';
      case 'video_call':
        return 'video';
      case 'phone':
        return 'phone';
      default:
        return 'chat';
    }
  };

  const getConsultationTypeText = (type: string) => {
    switch (type) {
      case 'chat':
        return 'Chat';
      case 'video_call':
        return 'Video Call';
      case 'phone':
        return 'Telepon';
      default:
        return type;
    }
  };

  const filteredConsultations = consultations.filter((consultation) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return ['pending_payment', 'paid', 'confirmed', 'in_progress'].includes(consultation.status);
    }
    if (activeTab === 'completed') {
      return ['completed', 'cancelled'].includes(consultation.status);
    }
    return true;
  });

  const handleConsultationPress = (consultation: Consultation) => {
    if (consultation.status === 'pending_payment') {
      navigation.navigate('ConsultationPayment', {
        consultationId: consultation.id,
      });
    } else if (consultation.status === 'paid' && consultation.chat) {
      navigation.navigate('ChatDetail', {
        chatId: consultation.chat.chat_id,
      });
    } else {
      navigation.navigate('ConsultationDetail', {
        consultationId: consultation.id,
      });
    }
  };

  const renderConsultationCard = (consultation: Consultation) => (
    <TouchableOpacity
      key={consultation.id}
      style={styles.consultationCard}
      onPress={() => handleConsultationPress(consultation)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.consultationInfo}>
          <Text style={styles.consultationId}>{consultation.consultation_id}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(consultation.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusText(consultation.status)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.doctorSection}>
          <View style={styles.doctorAvatar}>
            <Icon name="doctor" size={24} color="#E22345" />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{consultation.doctor.name}</Text>
            <Text style={styles.doctorSpecialization}>{consultation.doctor.specialization}</Text>
          </View>
          <View style={styles.consultationTypeIcon}>
            <Icon
              name={getConsultationTypeIcon(consultation.consultation_type)}
              size={20}
              color="#6B7280"
            />
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.appointmentRow}>
            <Icon name="calendar" size={16} color="#6B7280" />
            <Text style={styles.appointmentText}>
              {new Date(consultation.scheduled_date).toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.appointmentRow}>
            <Icon name="clock" size={16} color="#6B7280" />
            <Text style={styles.appointmentText}>{consultation.scheduled_time}</Text>
          </View>
          <View style={styles.appointmentRow}>
            <Icon name={getConsultationTypeIcon(consultation.consultation_type)} size={16} color="#6B7280" />
            <Text style={styles.appointmentText}>
              {getConsultationTypeText(consultation.consultation_type)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.price}>
            Rp {consultation.price.toLocaleString('id-ID')}
          </Text>
          <Text style={styles.bookingDate}>
            {new Date(consultation.created_at).toLocaleDateString('id-ID')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingError loading={true} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#E22345" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Konsultasi</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('HEALTH')}
          style={styles.addButton}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'all', label: 'Semua' },
          { key: 'upcoming', label: 'Berlangsung' },
          { key: 'completed', label: 'Selesai' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? (
        <LoadingError error={error} onRetry={fetchConsultations} />
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {filteredConsultations.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="calendar-clock" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Belum ada konsultasi</Text>
              <Text style={styles.emptyDescription}>
                {activeTab === 'all'
                  ? 'Anda belum memiliki riwayat konsultasi'
                  : activeTab === 'upcoming'
                  ? 'Tidak ada konsultasi yang sedang berlangsung'
                  : 'Tidak ada konsultasi yang telah selesai'}
              </Text>
              <TouchableOpacity
                style={styles.bookConsultationButton}
                onPress={() => navigation.navigate('HEALTH')}
              >
                <Text style={styles.bookConsultationButtonText}>Book Konsultasi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.consultationsList}>
              {filteredConsultations.map(renderConsultationCard)}
            </View>
          )}
        </ScrollView>
      )}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#E22345',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  consultationsList: {
    paddingBottom: 16,
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
    marginBottom: 12,
  },
  consultationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consultationId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    gap: 12,
  },
  doctorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#6B7280',
  },
  consultationTypeIcon: {
    padding: 8,
  },
  appointmentDetails: {
    gap: 4,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appointmentText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E22345',
  },
  bookingDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  bookConsultationButton: {
    backgroundColor: '#E22345',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  bookConsultationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ConsultationHistoryScreen; 