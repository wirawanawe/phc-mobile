import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from "react-native";
import {
  Text,
  Card,
  Button,
  Chip,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CustomTheme } from "../theme/theme";

const { width } = Dimensions.get("window");

const DetailDoctor = ({ navigation, route }: any) => {
  const theme = useTheme<CustomTheme>();
  const { doctor } = route.params;
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Handle booking consultation
  const handleBookConsultation = () => {
    if (!selectedTimeSlot) {
      Alert.alert(
        "Pilih Waktu",
        "Silakan pilih waktu konsultasi terlebih dahulu",
        [{ text: "OK" }]
      );
      return;
    }

    // Validate time format (should be HH:MM)
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(selectedTimeSlot)) {
      Alert.alert(
        "Format Waktu Salah",
        "Format waktu harus dalam bentuk HH:MM (contoh: 17:00)",
        [{ text: "OK" }]
      );
      return;
    }

    // Navigate immediately to consultation booking screen with doctor data
    navigation.navigate("ConsultationBooking", {
      doctor: doctor,
      selectedTimeSlot: selectedTimeSlot,
    });
  };

  // Handle chat with doctor
  const handleChatDoctor = () => {
    Alert.alert(
      "Chat Dokter",
      "Fitur chat dengan dokter akan segera tersedia",
      [{ text: "OK" }]
    );
  };

  // Sample available time slots
  const availableSlots = [
    { id: "1", time: "09:00", label: "09:00 WIB" },
    { id: "2", time: "10:30", label: "10:30 WIB" },
    { id: "3", time: "13:00", label: "13:00 WIB" },
    { id: "4", time: "15:30", label: "15:30 WIB" },
    { id: "5", time: "17:00", label: "17:00 WIB" },
  ];

  // Sample patient reviews
  const reviews = [
    {
      id: "1",
      patient: "Andi S.",
      rating: 5,
      date: "2 hari lalu",
      comment: "Dokter sangat profesional dan memberikan penjelasan yang mudah dipahami. Sangat membantu untuk program wellness saya.",
    },
    {
      id: "2",
      patient: "Sari M.",
      rating: 5,
      date: "1 minggu lalu",
      comment: "Konsultasi yang sangat bermanfaat. Dokter memberikan saran olahraga yang sesuai dengan kondisi saya.",
    },
    {
      id: "3",
      patient: "Budi R.",
      rating: 4,
      date: "2 minggu lalu",
      comment: "Pelayanan baik, waktu konsultasi tepat. Terima kasih atas sarannya dokter.",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'busy': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Sibuk';
      default: return 'Offline';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color="#F59E0B"
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
        </View>

        {/* Doctor Profile Card */}
        <View style={styles.profileContainer}>
          <LinearGradient
            colors={[doctor.color, doctor.color + "80"]}
            style={styles.profileGradient}
          >
            <View style={styles.profileContent}>
              <View style={styles.doctorAvatarLarge}>
                <Text style={styles.doctorAvatarTextLarge}>{doctor.avatar}</Text>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(doctor.status) }]} />
              </View>
              <View style={styles.doctorMainInfo}>
                <Text style={styles.doctorNameLarge}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialtyLarge}>{doctor.specialty}</Text>
                <Text style={styles.doctorHospitalLarge}>{doctor.hospital}</Text>
                
                <View style={styles.doctorStats}>
                  <View style={styles.statItem}>
                    <Icon name="star" size={16} color="#FCD34D" />
                    <Text style={styles.statText}>{doctor.rating}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Icon name="account-group" size={16} color="#FFFFFF" />
                    <Text style={styles.statText}>{doctor.reviews} ulasan</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Icon name="clock" size={16} color="#FFFFFF" />
                    <Text style={styles.statText}>{doctor.experience}</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Status and Price */}
        <View style={styles.statusPriceContainer}>
          <View style={styles.statusCard}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(doctor.status) }]} />
            <Text style={styles.statusText}>{getStatusText(doctor.status)}</Text>
          </View>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Biaya Konsultasi</Text>
            <Text style={styles.priceValue}>{doctor.price}</Text>
          </View>
        </View>

        {/* About Doctor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tentang Dokter</Text>
          <Card style={styles.aboutCard}>
            <Card.Content>
              <Text style={styles.aboutText}>
                {doctor.name} adalah seorang {doctor.specialty.toLowerCase()} berpengalaman {doctor.experience} 
                di {doctor.hospital}. Beliau memiliki keahlian khusus dalam menangani program wellness 
                dan memberikan konsultasi kesehatan yang komprehensif.
              </Text>
              <View style={styles.specializations}>
                <Text style={styles.specializationTitle}>Spesialisasi:</Text>
                <View style={styles.specializationTags}>
                  <Chip style={styles.specializationChip}>Wellness Program</Chip>
                  <Chip style={styles.specializationChip}>Konseling Kesehatan</Chip>
                  <Chip style={styles.specializationChip}>Program Diet</Chip>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Available Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jam Tersedia Hari Ini</Text>
          <View style={styles.timeSlotsContainer}>
            {availableSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  selectedTimeSlot === slot.time && styles.selectedTimeSlot
                ]}
                onPress={() => setSelectedTimeSlot(slot.time)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTimeSlot === slot.time && styles.selectedTimeSlotText
                ]}>
                  {slot.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Consultation Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opsi Konsultasi</Text>
          <View style={styles.consultationOptions}>
            <TouchableOpacity style={styles.optionCard}>
              <LinearGradient colors={["#3182CE", "#2563EB"]} style={styles.optionGradient}>
                <Icon name="video" size={28} color="#FFFFFF" />
                <Text style={styles.optionTitle}>Video Call</Text>
                <Text style={styles.optionSubtitle}>Konsultasi langsung</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionCard}>
              <LinearGradient colors={["#059669", "#10B981"]} style={styles.optionGradient}>
                <Icon name="message-text" size={28} color="#FFFFFF" />
                <Text style={styles.optionTitle}>Chat</Text>
                <Text style={styles.optionSubtitle}>Pesan teks</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionCard}>
              <LinearGradient colors={["#DC2626", "#EF4444"]} style={styles.optionGradient}>
                <Icon name="share-variant" size={28} color="#FFFFFF" />
                <Text style={styles.optionTitle}>Share Data</Text>
                <Text style={styles.optionSubtitle}>Wellness program</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Patient Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Ulasan Pasien</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          
          {reviews.map((review) => (
            <Card key={review.id} style={styles.reviewCard}>
              <Card.Content>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.patient}</Text>
                    <View style={styles.reviewRating}>
                      {renderStars(review.rating)}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Bottom spacing for buttons */}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <SafeAreaView style={styles.bottomButtonsContainer} edges={['bottom']}>
        <View style={styles.bottomButtons}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={handleChatDoctor}
        >
          <Icon name="message-text" size={20} color="#FFFFFF" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bookButton, isBooking && styles.bookButtonDisabled]} 
          onPress={handleBookConsultation}
          disabled={isBooking}
        >
          <LinearGradient colors={[doctor.color, doctor.color + "CC"]} style={styles.bookButtonGradient}>
            {isBooking ? (
              <Text style={styles.bookButtonText}>Memproses...</Text>
            ) : (
              <Text style={styles.bookButtonText}>Book Konsultasi</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileGradient: {
    padding: 24,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    position: "relative",
  },
  doctorAvatarTextLarge: {
    fontSize: 40,
    color: "#FFFFFF",
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  doctorMainInfo: {
    flex: 1,
  },
  doctorNameLarge: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  doctorSpecialtyLarge: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  doctorHospitalLarge: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  doctorStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "#FFFFFF",
    marginLeft: 4,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 12,
  },
  statusPriceContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statusCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  priceCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  aboutCard: {
    elevation: 2,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
    marginBottom: 16,
  },
  specializations: {
    marginTop: 8,
  },
  specializationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  specializationTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specializationChip: {
    backgroundColor: "#FEF2F2",
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedTimeSlot: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  selectedTimeSlotText: {
    color: "#FFFFFF",
  },
  consultationOptions: {
    flexDirection: "row",
    gap: 12,
  },
  optionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
  },
  optionGradient: {
    padding: 16,
    alignItems: "center",
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
  },
  optionSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
  },
  reviewCard: {
    marginBottom: 12,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: "row",
  },
  reviewDate: {
    fontSize: 12,
    color: "#64748B",
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 20,
    color: "#374151",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bottomButtonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#374151",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bookButton: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  bookButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
});

export default DetailDoctor;
