import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";

const BookingSuccessScreen = ({ navigation, route }: any) => {
  const theme = useTheme<CustomTheme>();
  const { bookingDetails } = route.params || {};

  const bookingInfo = {
    bookingId:
      bookingDetails?.bookingId ||
      "BK" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    clinic: bookingDetails?.clinic || "Klinik PHC Jakarta Pusat",
    service: bookingDetails?.service || "Pemeriksaan Umum",
    date: bookingDetails?.date || "15 Januari 2024",
    time: bookingDetails?.time || "10:00",
    doctor: bookingDetails?.doctor || "Dr. Sarah Johnson",
    address: bookingDetails?.address || "Jl. Sudirman No. 123, Jakarta Pusat",
  };

  const handleViewBooking = () => {
    navigation.navigate("ClinicBooking", { tab: "history" });
  };

  const handleBackToHome = () => {
    navigation.navigate("Main");
  };

  const handleShareBooking = () => {
    // Here you would implement sharing functionality
  };

  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Success Header */}
          <View style={styles.successHeader}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <Icon name="check" size={40} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.successTitle}>Booking Berhasil!</Text>
            <Text style={styles.successSubtitle}>
              Pemeriksaan Anda telah berhasil dijadwalkan
            </Text>
          </View>

          {/* Booking ID */}
          <View style={styles.bookingIdContainer}>
            <View style={styles.bookingIdCard}>
              <Icon name="ticket-confirmation" size={24} color="#E22345" />
              <Text style={styles.bookingIdLabel}>Booking ID</Text>
              <Text style={styles.bookingIdValue}>{bookingInfo.bookingId}</Text>
              <Text style={styles.bookingIdNote}>
                Simpan ID ini untuk referensi Anda
              </Text>
            </View>
          </View>

          {/* Booking Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Ringkasan Booking</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Icon name="hospital-building" size={20} color="#E22345" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryLabel}>Klinik</Text>
                  <Text style={styles.summaryValue}>{bookingInfo.clinic}</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Icon name="stethoscope" size={20} color="#3B82F6" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryLabel}>Layanan</Text>
                  <Text style={styles.summaryValue}>{bookingInfo.service}</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Icon name="account" size={20} color="#10B981" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryLabel}>Dokter</Text>
                  <Text style={styles.summaryValue}>{bookingInfo.doctor}</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Icon name="calendar" size={20} color="#F59E0B" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryLabel}>Tanggal & Waktu</Text>
                  <Text style={styles.summaryValue}>
                    {bookingInfo.date} • {bookingInfo.time}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Icon name="map-marker" size={20} color="#EF4444" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryLabel}>Alamat</Text>
                  <Text style={styles.summaryValue}>{bookingInfo.address}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Next Steps */}
          <View style={styles.nextStepsContainer}>
            <Text style={styles.sectionTitle}>Langkah Selanjutnya</Text>
            <View style={styles.nextStepsCard}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Terima Notifikasi</Text>
                  <Text style={styles.stepDescription}>
                    Anda akan menerima notifikasi 1 jam sebelum jadwal
                    pemeriksaan
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Datang ke Klinik</Text>
                  <Text style={styles.stepDescription}>
                    Datang 15 menit sebelum jadwal dengan membawa kartu
                    identitas
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Lakukan Pemeriksaan</Text>
                  <Text style={styles.stepDescription}>
                    Ikuti instruksi dokter dan lakukan pemeriksaan sesuai jadwal
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Pembayaran</Text>
                  <Text style={styles.stepDescription}>
                    Lakukan pembayaran di klinik setelah pemeriksaan selesai
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Important Reminders */}
          <View style={styles.remindersContainer}>
            <Text style={styles.sectionTitle}>Pengingat Penting</Text>
            <View style={styles.remindersCard}>
              <View style={styles.reminderItem}>
                <Icon name="clock-alert" size={16} color="#F59E0B" />
                <Text style={styles.reminderText}>
                  Dapat membatalkan booking maksimal 2 jam sebelum jadwal
                </Text>
              </View>
              <View style={styles.reminderItem}>
                <Icon name="phone" size={16} color="#3B82F6" />
                <Text style={styles.reminderText}>
                  Hubungi klinik jika ada perubahan jadwal
                </Text>
              </View>
              <View style={styles.reminderItem}>
                <Icon name="card-account-details" size={16} color="#10B981" />
                <Text style={styles.reminderText}>
                  Bawa kartu identitas dan kartu asuransi (jika ada)
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareBooking}
            >
              <Icon name="share-variant" size={20} color="#6B7280" />
              <Text style={styles.shareButtonText}>Bagikan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewBookingButton}
              onPress={handleViewBooking}
            >
              <LinearGradient
                colors={["#3B82F6", "#1D4ED8"]}
                style={styles.viewBookingGradient}
              >
                <Text style={styles.viewBookingText}>Lihat Booking</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={handleBackToHome}
            >
              <LinearGradient
                colors={["#E22345", "#B71C1C"]}
                style={styles.homeButtonGradient}
              >
                <Text style={styles.homeButtonText}>Kembali ke Beranda</Text>
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
  successHeader: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
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
    marginBottom: 8,
  },
  bookingIdNote: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  summaryCard: {
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
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  nextStepsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  nextStepsCard: {
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
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E22345",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  remindersContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  remindersCard: {
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
  reminderItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reminderText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  viewBookingButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  viewBookingGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  viewBookingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  homeButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  homeButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default BookingSuccessScreen;
