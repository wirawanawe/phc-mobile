import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import apiService from "../services/api";
import { safeGoBack } from "../utils/safeNavigation";

const BookingDetailScreen = ({ navigation, route }: any) => {
  const { bookingData } = route.params;

  // Callback untuk refresh data di halaman riwayat
  const handleBookingAction = () => {
    // Trigger refresh di halaman riwayat
    navigation.setParams({ refreshTrigger: Date.now() });
  };

  const cancelBooking = async (bookingId: number) => {
    try {
      const response = await apiService.cancelBooking(bookingId);
      if (response.success) {
        Alert.alert("Success", "Booking berhasil dibatalkan");
        handleBookingAction(); // Trigger refresh
        safeGoBack(navigation, 'Main');
      }
    } catch (error: any) {
      console.error("Error canceling booking:", error);
      Alert.alert("Error", "Gagal membatalkan booking: " + (error?.message || "Unknown error"));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#E22345", "#FF6B8A"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => safeGoBack(navigation, 'Main')}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Detail Booking</Text>
            <Text style={styles.headerSubtitle}>
              Booking #{bookingData.booking_id || bookingData.id}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.card}>
          <View style={styles.historyHeader}>
            <View style={styles.bookingIdContainer}>
              <Text style={styles.bookingId}>
                Booking #{bookingData.booking_id || bookingData.id}
              </Text>
              <Text style={styles.bookingDate}>
                {new Date(bookingData.createdAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    bookingData.status === "completed"
                      ? "#10B981"
                      : bookingData.status === "cancelled"
                      ? "#EF4444"
                      : bookingData.status === "confirmed"
                      ? "#3B82F6"
                      : "#F59E0B",
                },
              ]}
            >
              <Text style={styles.statusText}>
                {bookingData.status === "completed"
                  ? "Selesai"
                  : bookingData.status === "cancelled"
                  ? "Dibatalkan"
                  : bookingData.status === "confirmed"
                  ? "Dikonfirmasi"
                  : "Menunggu"}
              </Text>
            </View>
          </View>
        </View>

        {/* Clinic Information Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi Klinik</Text>
          <View style={styles.clinicServiceInfo}>
            <View style={styles.clinicHeader}>
              <Icon name="hospital-building" size={20} color="#E22345" />
              <Text style={styles.historyClinic}>
                {bookingData.clinic?.name || "Unknown Clinic"}
              </Text>
            </View>
            <View style={styles.serviceHeader}>
              <Icon name="stethoscope" size={16} color="#6B7280" />
              <Text style={styles.historyService}>
                {bookingData.service?.name || "Unknown Service"}
              </Text>
            </View>
            <View style={styles.doctorHeader}>
              <Icon name="account-tie" size={16} color="#6B7280" />
              <Text style={styles.historyDoctor}>
                {bookingData.doctor?.name || "Unknown Doctor"}
              </Text>
              {bookingData.doctor?.specialization && (
                <Text style={styles.doctorSpecialization}>
                  {bookingData.doctor.specialization}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Appointment Details Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detail Appointment</Text>
          <View style={styles.historyDateTime}>
            <View style={styles.dateTimeItem}>
              <Icon name="calendar" size={16} color="#6B7280" />
              <Text style={styles.historyDate}>
                {new Date(bookingData.appointment_date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Icon name="clock-outline" size={16} color="#6B7280" />
              <Text style={styles.historyTime}>
                {bookingData.appointment_time}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Information Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi Pembayaran</Text>
          <View style={styles.pricePaymentContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Total Biaya:</Text>
              <Text style={styles.priceAmount}>
                Rp {parseFloat(bookingData.total_price || "0").toLocaleString()}
              </Text>
            </View>
            <View
              style={[
                styles.paymentStatusBadge,
                {
                  backgroundColor:
                    bookingData.payment_status === "paid"
                      ? "#10B981"
                      : bookingData.payment_status === "pending"
                      ? "#F59E0B"
                      : bookingData.payment_status === "canceled"
                      ? "#EF4444"
                      : "#6B7280",
                },
              ]}
            >
              <Text style={styles.paymentStatusText}>
                {bookingData.payment_status === "paid"
                  ? "Lunas"
                  : bookingData.payment_status === "pending"
                  ? "Menunggu"
                  : bookingData.payment_status === "canceled"
                  ? "Dibatalkan"
                  : bookingData.payment_status || "Belum Bayar"}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Information Section */}
        {(bookingData.notes || (bookingData.status === "cancelled" && bookingData.cancellation_reason)) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Informasi Tambahan</Text>
            
            {/* Notes if available */}
            {bookingData.notes && (
              <View style={styles.notesContainer}>
                <Icon name="note-text" size={16} color="#6B7280" />
                <Text style={styles.notesText}>{bookingData.notes}</Text>
              </View>
            )}

            {/* Cancellation info if cancelled */}
            {bookingData.status === "cancelled" && bookingData.cancellation_reason && (
              <View style={styles.cancellationContainer}>
                <Icon name="cancel" size={16} color="#EF4444" />
                <Text style={styles.cancellationText}>
                  Alasan: {bookingData.cancellation_reason}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons for pending bookings */}
        {bookingData.status === "pending" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Aksi</Text>
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  navigation.navigate("BookingConfirmation", {
                    bookingData: bookingData,
                    isExistingBooking: true,
                    onBookingUpdate: handleBookingAction, // Pass callback
                  });
                }}
              >
                <Icon name="check-circle" size={16} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>
                  Konfirmasi Pembayaran
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  Alert.alert(
                    "Batalkan Booking",
                    "Apakah Anda yakin ingin membatalkan booking ini?",
                    [
                      { text: "Tidak", style: "cancel" },
                      {
                        text: "Ya",
                        style: "cancel",
                        onPress: () => cancelBooking(bookingData.id),
                      },
                    ]
                  );
                }}
              >
                <Icon name="close-circle" size={16} color="#FFFFFF" />
                <Text style={styles.cancelButtonText}>
                  Batalkan Booking
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bookingIdContainer: {
    flex: 1,
  },
  bookingId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  clinicServiceInfo: {
    marginTop: 8,
  },
  clinicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  historyClinic: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  historyService: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 8,
  },
  historyDoctor: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 8,
  },
  doctorSpecialization: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 8,
    marginTop: 2,
  },
  historyDateTime: {
    marginTop: 8,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    color: "#1F2937",
    marginLeft: 8,
  },
  historyTime: {
    fontSize: 14,
    color: "#1F2937",
    marginLeft: 8,
  },
  pricePaymentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E22345",
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  notesText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
  cancellationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
  },
  cancellationText: {
    fontSize: 12,
    color: "#EF4444",
    marginLeft: 8,
    flex: 1,
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E22345",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default BookingDetailScreen; 