import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import apiService from "../services/api";

const BookingConfirmationScreen = ({ navigation, route }: any) => {
  const theme = useTheme<CustomTheme>();
  const { bookingData, isExistingBooking, onBookingUpdate } = route.params || {};
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.getUserProfile();
      if (response.success) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const clinics = [
    {
      id: "1",
      name: "Klinik PHC Jakarta Pusat",
      address: "Jl. Sudirman No. 123, Jakarta Pusat",
      rating: 4.8,
      distance: "2.5 km",
      image: "hospital-building",
      color: "#E22345",
      available: true,
    },
    {
      id: "2",
      name: "Klinik PHC Bandung",
      address: "Jl. Asia Afrika No. 45, Bandung",
      rating: 4.6,
      distance: "5.2 km",
      image: "hospital-building",
      color: "#3B82F6",
      available: true,
    },
    {
      id: "3",
      name: "Klinik PHC Surabaya",
      address: "Jl. Tunjungan No. 67, Surabaya",
      rating: 4.7,
      distance: "3.8 km",
      image: "hospital-building",
      color: "#10B981",
      available: true,
    },
    {
      id: "4",
      name: "Klinik PHC Medan",
      address: "Jl. Sudirman No. 89, Medan",
      rating: 4.5,
      distance: "7.1 km",
      image: "hospital-building",
      color: "#F59E0B",
      available: false,
    },
  ];

  const servicesByClinic = {
    "1": [
      // Klinik PHC Jakarta Pusat
      {
        id: "1",
        name: "Pemeriksaan Umum",
        duration: "30 min",
        price: "Rp 150.000",
        icon: "stethoscope",
        color: "#E22345",
        doctors: [
          {
            id: "1",
            name: "Dr. Sarah Johnson",
            specialization: "Dokter Umum",
            rating: 4.8,
          },
          {
            id: "2",
            name: "Dr. Ahmad Rahman",
            specialization: "Dokter Umum",
            rating: 4.6,
          },
          {
            id: "3",
            name: "Dr. Maria Garcia",
            specialization: "Dokter Umum",
            rating: 4.7,
          },
        ],
      },
      {
        id: "2",
        name: "Pemeriksaan Gigi",
        duration: "45 min",
        price: "Rp 200.000",
        icon: "tooth",
        color: "#3B82F6",
        doctors: [
          {
            id: "4",
            name: "Dr. Budi Santoso",
            specialization: "Dokter Gigi",
            rating: 4.9,
          },
          {
            id: "5",
            name: "Dr. Siti Aminah",
            specialization: "Dokter Gigi",
            rating: 4.7,
          },
        ],
      },
      {
        id: "3",
        name: "Pemeriksaan Mata",
        duration: "40 min",
        price: "Rp 180.000",
        icon: "eye",
        color: "#10B981",
        doctors: [
          {
            id: "6",
            name: "Dr. Robert Chen",
            specialization: "Dokter Mata",
            rating: 4.8,
          },
        ],
      },
      {
        id: "4",
        name: "Pemeriksaan Jantung",
        duration: "60 min",
        price: "Rp 300.000",
        icon: "heart-pulse",
        color: "#EF4444",
        doctors: [
          {
            id: "7",
            name: "Dr. Lisa Wong",
            specialization: "Kardiolog",
            rating: 4.9,
          },
          {
            id: "8",
            name: "Dr. David Kim",
            specialization: "Kardiolog",
            rating: 4.7,
          },
        ],
      },
    ],
    "2": [
      // Klinik PHC Bandung
      {
        id: "1",
        name: "Pemeriksaan Umum",
        duration: "30 min",
        price: "Rp 140.000",
        icon: "stethoscope",
        color: "#E22345",
        doctors: [
          {
            id: "9",
            name: "Dr. Rina Kartika",
            specialization: "Dokter Umum",
            rating: 4.7,
          },
          {
            id: "10",
            name: "Dr. Hendra Wijaya",
            specialization: "Dokter Umum",
            rating: 4.5,
          },
        ],
      },
      {
        id: "2",
        name: "Pemeriksaan Gigi",
        duration: "45 min",
        price: "Rp 190.000",
        icon: "tooth",
        color: "#3B82F6",
        doctors: [
          {
            id: "11",
            name: "Dr. Dian Purnama",
            specialization: "Dokter Gigi",
            rating: 4.8,
          },
        ],
      },
      {
        id: "5",
        name: "Pemeriksaan Kulit",
        duration: "35 min",
        price: "Rp 160.000",
        icon: "hand",
        color: "#F59E0B",
        doctors: [
          {
            id: "12",
            name: "Dr. Maya Sari",
            specialization: "Dermatolog",
            rating: 4.6,
          },
        ],
      },
    ],
    "3": [
      // Klinik PHC Surabaya
      {
        id: "1",
        name: "Pemeriksaan Umum",
        duration: "30 min",
        price: "Rp 145.000",
        icon: "stethoscope",
        color: "#E22345",
        doctors: [
          {
            id: "13",
            name: "Dr. Bambang Sutejo",
            specialization: "Dokter Umum",
            rating: 4.6,
          },
          {
            id: "14",
            name: "Dr. Nita Purnama",
            specialization: "Dokter Umum",
            rating: 4.8,
          },
        ],
      },
      {
        id: "3",
        name: "Pemeriksaan Mata",
        duration: "40 min",
        price: "Rp 175.000",
        icon: "eye",
        color: "#10B981",
        doctors: [
          {
            id: "15",
            name: "Dr. Agus Setiawan",
            specialization: "Dokter Mata",
            rating: 4.7,
          },
        ],
      },
      {
        id: "6",
        name: "Pemeriksaan Laboratorium",
        duration: "20 min",
        price: "Rp 250.000",
        icon: "test-tube",
        color: "#8B5CF6",
        doctors: [
          {
            id: "16",
            name: "Dr. Ratna Dewi",
            specialization: "Patolog Klinik",
            rating: 4.9,
          },
        ],
      },
    ],
    "4": [
      // Klinik PHC Medan
      {
        id: "1",
        name: "Pemeriksaan Umum",
        duration: "30 min",
        price: "Rp 135.000",
        icon: "stethoscope",
        color: "#E22345",
        doctors: [
          {
            id: "17",
            name: "Dr. Irfan Hakim",
            specialization: "Dokter Umum",
            rating: 4.5,
          },
        ],
      },
      {
        id: "2",
        name: "Pemeriksaan Gigi",
        duration: "45 min",
        price: "Rp 185.000",
        icon: "tooth",
        color: "#3B82F6",
        doctors: [
          {
            id: "18",
            name: "Dr. Yuni Safitri",
            specialization: "Dokter Gigi",
            rating: 4.4,
          },
        ],
      },
    ],
  };

  // Get clinic details based on selected clinic
  const selectedClinicData = clinics.find(
    (c: any) => c.id === bookingData?.clinic_id || bookingData?.clinic
  );
  const selectedServiceData = servicesByClinic[
    (bookingData?.clinic_id ||
      bookingData?.clinic) as keyof typeof servicesByClinic
  ]?.find((s: any) => s.id === bookingData?.service_id || bookingData?.service);

  // Get doctor details
  const selectedDoctorData = selectedServiceData?.doctors?.find(
    (d: any) => d.id === bookingData?.doctor_id || bookingData?.doctor
  );

  const bookingDetails = {
    bookingId: isExistingBooking
      ? bookingData?.booking_id
      : "BK" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    clinic: isExistingBooking
      ? bookingData?.clinic?.name
      : selectedClinicData?.name || "Klinik PHC Jakarta Pusat",
    service: isExistingBooking
      ? bookingData?.service?.name
      : selectedServiceData?.name || "Pemeriksaan Umum",
    date: isExistingBooking
      ? new Date(bookingData.appointment_date).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : bookingData?.date
      ? new Date(bookingData.date).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "15 Januari 2024",
    time: isExistingBooking
      ? bookingData?.appointment_time
      : bookingData?.time || "10:00",
    doctor: isExistingBooking
      ? bookingData?.doctor?.name
      : selectedDoctorData?.name || "Dr. Sarah Johnson",
    price: isExistingBooking
      ? `Rp ${parseFloat(bookingData.total_price).toLocaleString()}`
      : selectedServiceData?.price || "Rp 150.000",
    duration: selectedServiceData?.duration || "30 menit",
    address: isExistingBooking
      ? bookingData?.clinic?.address
      : selectedClinicData?.address || "Jl. Sudirman No. 123, Jakarta Pusat",
  };

  const handleConfirmBooking = async () => {
    try {
      if (isExistingBooking) {
        // For existing bookings, update payment status
        const response = await apiService.updatePaymentStatus(bookingData.id, {
          payment_status: "paid",
          payment_method: "cash", // Default payment method
        });

        if (response.success) {
          Alert.alert(
            "Pembayaran Berhasil",
            "Status pembayaran telah berhasil dikonfirmasi!",
            [
              {
                text: "OK",
                onPress: () => {
                  // Call refresh callback if provided
                  if (onBookingUpdate) {
                    onBookingUpdate();
                  }
                  navigation.goBack();
                },
              },
            ]
          );
        } else {
          console.error("❌ Payment status update failed:", response.message);
          Alert.alert(
            "Error",
            response.message || "Gagal mengkonfirmasi pembayaran"
          );
        }
      } else {
        // For new bookings, navigate to success screen
        navigation.navigate("BookingSuccess", { bookingDetails });
      }
    } catch (error) {
      console.error("❌ Error confirming booking/payment:", error);
      Alert.alert("Error", "Terjadi kesalahan saat mengkonfirmasi pembayaran");
    }
  };

  const handleCancelBooking = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isExistingBooking
                ? "Konfirmasi Pembayaran"
                : "Konfirmasi Booking"}
            </Text>
            <View style={styles.headerRight} />
          </View>

          {/* Booking ID */}
          <View style={styles.bookingIdContainer}>
            <View style={styles.bookingIdCard}>
              <Icon name="ticket-confirmation" size={32} color="#E22345" />
              <Text style={styles.bookingIdLabel}>Booking ID</Text>
              <Text style={styles.bookingIdValue}>
                {bookingDetails.bookingId}
              </Text>
            </View>
          </View>

          {/* Booking Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Detail Pemeriksaan</Text>

            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Icon name="hospital-building" size={20} color="#E22345" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Klinik</Text>
                  <Text style={styles.detailValue}>
                    {bookingDetails.clinic}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Icon name="stethoscope" size={20} color="#3B82F6" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Layanan</Text>
                  <Text style={styles.detailValue}>
                    {bookingDetails.service}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Icon name="account" size={20} color="#10B981" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Dokter</Text>
                  <Text style={styles.detailValue}>
                    {bookingDetails.doctor}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Icon name="calendar" size={20} color="#F59E0B" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Tanggal</Text>
                  <Text style={styles.detailValue}>{bookingDetails.date}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Icon name="clock-outline" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Waktu</Text>
                  <Text style={styles.detailValue}>{bookingDetails.time}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Icon name="map-marker" size={20} color="#EF4444" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Alamat</Text>
                  <Text style={styles.detailValue}>
                    {bookingDetails.address}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Price Information */}
          <View style={styles.priceContainer}>
            <Text style={styles.sectionTitle}>Informasi Biaya</Text>
            <View style={styles.priceCard}>
              {userProfile?.has_insurance ? (
                <View style={styles.insuranceInfoContainer}>
                  <View style={styles.insuranceIconContainer}>
                    <Icon name="shield-check" size={32} color="#10B981" />
                  </View>
                  <Text style={styles.insuranceTitle}>Ditanggung Asuransi</Text>
                  <Text style={styles.insuranceSubtitle}>
                    Biaya pemeriksaan akan ditanggung oleh asuransi Anda
                  </Text>
                  {userProfile?.insurance_provider && (
                    <Text style={styles.insuranceProvider}>
                      Provider: {userProfile.insurance_provider}
                    </Text>
                  )}
                </View>
              ) : (
                <>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Biaya Pemeriksaan</Text>
                    <Text style={styles.priceValue}>
                      {bookingDetails.price}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Durasi</Text>
                    <Text style={styles.priceValue}>
                      {bookingDetails.duration}
                    </Text>
                  </View>
                  <View style={styles.priceDivider} />
                  <View style={styles.priceRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      {bookingDetails.price}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Important Notes */}
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Penting untuk Diperhatikan</Text>
            <View style={styles.notesCard}>
              <View style={styles.noteItem}>
                <Icon name="information" size={16} color="#3B82F6" />
                <Text style={styles.noteText}>
                  Datang 15 menit sebelum jadwal pemeriksaan
                </Text>
              </View>
              <View style={styles.noteItem}>
                <Icon name="information" size={16} color="#3B82F6" />
                <Text style={styles.noteText}>
                  Bawa kartu identitas dan kartu asuransi (jika ada)
                </Text>
              </View>
              <View style={styles.noteItem}>
                <Icon name="information" size={16} color="#3B82F6" />
                <Text style={styles.noteText}>
                  Pembayaran dilakukan di klinik setelah pemeriksaan
                </Text>
              </View>
              <View style={styles.noteItem}>
                <Icon name="information" size={16} color="#3B82F6" />
                <Text style={styles.noteText}>
                  Dapat membatalkan booking maksimal 2 jam sebelum jadwal
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelBooking}
            >
              <Text style={styles.cancelButtonText}>Batalkan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmBooking}
            >
              <LinearGradient
                colors={["#E22345", "#B71C1C"]}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>
                  {isExistingBooking
                    ? "Konfirmasi Pembayaran"
                    : "Konfirmasi Booking"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerRight: {
    width: 40,
  },
  bookingIdContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  bookingIdCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  bookingIdLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
    marginBottom: 4,
  },
  bookingIdValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E22345",
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  priceContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  priceDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E22345",
  },
  notesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  notesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  confirmButton: {
    flex: 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  insuranceInfoContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  insuranceIconContainer: {
    marginBottom: 12,
  },
  insuranceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 8,
    textAlign: "center",
  },
  insuranceSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  insuranceProvider: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});

export default BookingConfirmationScreen;
