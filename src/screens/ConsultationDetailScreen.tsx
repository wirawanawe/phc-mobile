import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, useTheme, Card, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

interface Consultation {
  id: number;
  consultation_id: string;
  consultation_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  price: number;
  status: string;
  payment_status: string;
  complaint?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  rating?: number;
  review?: string;
  created_at: string;
  paid_at?: string;
  started_at?: string;
  ended_at?: string;
  doctor: {
    id: number;
    name: string;
    specialization: string;
    avatar_url?: string;
  };
  chat?: {
    id: number;
    chat_id: string;
  };
}

interface ConsultationDetailScreenProps {
  navigation: any;
  route: any;
}

const ConsultationDetailScreen: React.FC<ConsultationDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const { consultationId } = route.params;
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConsultation();
  }, [consultationId]);

  const fetchConsultation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getConsultation(consultationId);
      
      if (response.success) {
        setConsultation(response.data);
      } else {
        setError(response.message || 'Failed to fetch consultation details');
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
      setError('Failed to fetch consultation details');
    } finally {
      setLoading(false);
    }
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
        return 'Sudah Dibayar';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'in_progress':
        return 'Sedang Berlangsung';
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
        return 'stethoscope';
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

  const handleStartConsultation = () => {
    if (consultation?.chat) {
      navigation.navigate('ChatDetail', {
        chatId: consultation.chat.chat_id,
        chatType: 'doctor',
        title: `Konsultasi dengan ${consultation.doctor.name}`,
        doctor: consultation.doctor,
      });
    }
  };

  const handleRateConsultation = () => {
    Alert.prompt(
      'Beri Rating',
      'Berikan rating 1-5 untuk konsultasi ini:',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kirim',
          onPress: (rating) => {
            if (rating && !isNaN(Number(rating)) && Number(rating) >= 1 && Number(rating) <= 5) {
              // TODO: Implement rating submission
              Alert.alert('Terima Kasih', 'Rating Anda telah dikirim');
            } else {
              Alert.alert('Error', 'Rating harus berupa angka 1-5');
            }
          },
        },
      ],
      'plain-text',
      '5'
    );
  };

  const handleCancelConsultation = () => {
    Alert.alert(
      'Batalkan Konsultasi',
      'Apakah Anda yakin ingin membatalkan konsultasi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.cancelConsultation(consultationId, 'Dibatalkan oleh user');
              if (response.success) {
                Alert.alert('Berhasil', 'Konsultasi telah dibatalkan');
                fetchConsultation(); // Refresh data
              } else {
                Alert.alert('Error', response.message || 'Gagal membatalkan konsultasi');
              }
            } catch (error) {
              console.error('Error cancelling consultation:', error);
              Alert.alert('Error', 'Gagal membatalkan konsultasi');
            }
          },
        },
      ]
    );
  };

  const handleEndConsultation = () => {
    Alert.alert(
      'Akhiri Konsultasi',
      'Apakah Anda yakin ingin mengakhiri konsultasi ini? Konsultasi akan ditandai sebagai selesai.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Akhiri',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.endConsultation(consultationId, {
                diagnosis: '',
                prescription: '',
                notes: 'Konsultasi diakhiri oleh user'
              });
              if (response.success) {
                Alert.alert('Berhasil', 'Konsultasi telah diakhiri');
                fetchConsultation(); // Refresh data
              } else {
                Alert.alert('Error', response.message || 'Gagal mengakhiri konsultasi');
              }
            } catch (error) {
              console.error('Error ending consultation:', error);
              Alert.alert('Error', 'Gagal mengakhiri konsultasi');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detail Konsultasi</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error || !consultation) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detail Konsultasi</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorText}>
              {error || 'Konsultasi tidak ditemukan'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchConsultation}
            >
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Konsultasi</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Card */}
          <Card style={styles.statusCard}>
            <Card.Content>
              <View style={styles.statusHeader}>
                <Text style={styles.consultationId}>{consultation.consultation_id}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(consultation.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{getStatusText(consultation.status)}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Doctor Info */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Informasi Dokter</Text>
              <View style={styles.doctorSection}>
                <View style={styles.doctorAvatar}>
                  <Icon name="doctor" size={32} color="#E22345" />
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{consultation.doctor.name}</Text>
                  <Text style={styles.doctorSpecialization}>{consultation.doctor.specialization}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Appointment Details */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Detail Janji Temu</Text>
              <View style={styles.detailRow}>
                <Icon name="calendar" size={20} color="#6B7280" />
                <Text style={styles.detailText}>
                  {new Date(consultation.scheduled_date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="clock" size={20} color="#6B7280" />
                <Text style={styles.detailText}>{consultation.scheduled_time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name={getConsultationTypeIcon(consultation.consultation_type)} size={20} color="#6B7280" />
                <Text style={styles.detailText}>
                  {getConsultationTypeText(consultation.consultation_type)} ({consultation.duration} menit)
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="currency-usd" size={20} color="#6B7280" />
                <Text style={styles.detailText}>
                  Rp {consultation.price.toLocaleString('id-ID')}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Complaint */}
          {consultation.complaint && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Keluhan</Text>
                <Text style={styles.complaintText}>{consultation.complaint}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Diagnosis */}
          {consultation.diagnosis && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Diagnosis</Text>
                <Text style={styles.diagnosisText}>{consultation.diagnosis}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Prescription */}
          {consultation.prescription && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Resep</Text>
                <Text style={styles.prescriptionText}>{consultation.prescription}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Notes */}
          {consultation.notes && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Catatan</Text>
                <Text style={styles.notesText}>{consultation.notes}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Rating */}
          {consultation.rating && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Rating</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name={star <= consultation.rating! ? "star" : "star-outline"}
                      size={24}
                      color="#F59E0B"
                    />
                  ))}
                </View>
                {consultation.review && (
                  <Text style={styles.reviewText}>{consultation.review}</Text>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {consultation.status === 'paid' && consultation.chat && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleStartConsultation}
              >
                <LinearGradient
                  colors={["#E22345", "#C41E3A"]}
                  style={styles.primaryButtonGradient}
                >
                  <Icon name="chat" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>Mulai Chat</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {consultation.status === 'completed' && !consultation.rating && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRateConsultation}
              >
                <Text style={styles.secondaryButtonText}>Beri Rating</Text>
              </TouchableOpacity>
            )}

            {(consultation.status === 'pending_payment' || consultation.status === 'paid') && (
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleCancelConsultation}
              >
                <Text style={styles.dangerButtonText}>Batalkan Konsultasi</Text>
              </TouchableOpacity>
            )}

            {consultation.status === 'in_progress' && (
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleEndConsultation}
              >
                <Text style={styles.dangerButtonText}>Akhiri Konsultasi</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#E22345",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  statusCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  consultationId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  doctorSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  doctorSpecialization: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
    flex: 1,
  },
  complaintText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  diagnosisText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  prescriptionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  notesText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    fontStyle: "italic",
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 32,
  },
  primaryButton: {
    marginBottom: 12,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ConsultationDetailScreen; 