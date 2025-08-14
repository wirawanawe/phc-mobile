import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Text, useTheme, Button, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";

import apiService from "../services/api";
import { handleError } from "../utils/errorHandler";
import { safeGoBack } from "../utils/safeNavigation";

const { width } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

// Home Tab Component
const HomeTab = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();

  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getClinics();
      
      if (response.success) {
        const transformedClinics = response.data.map((clinic: any) => ({
          ...clinic,
          available: true,
          color: "#E22345",
          image: "hospital-building",
          distance: "2.5 km",
          rating: 4.5,
          reviewCount: 128,
        }));
        setClinics(transformedClinics);
      } else {
        Alert.alert("Error", "Failed to load clinics: " + (response.message || "Unknown error"));
      }
    } catch (error: any) {
      handleError(error, {
        title: 'Load Clinics Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderClinicCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.clinicCard}
      onPress={() => navigation.navigate("ClinicBooking", { clinic: item })}
    >
      <LinearGradient
        colors={["#FFFFFF", "#F8FAFC"]}
        style={styles.clinicCardGradient}
      >
        <View style={styles.clinicHeader}>
          <View style={styles.clinicIcon}>
            <Icon name="hospital-building" size={32} color="#E22345" />
          </View>
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>{item.name}</Text>
            <Text style={styles.clinicAddress}>{item.address}</Text>
            <View style={styles.clinicRating}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewText}>({item.reviewCount} ulasan)</Text>
            </View>
          </View>
          <View style={styles.clinicStatus}>
            <Chip
              mode="flat"
              textStyle={{ color: "#FFFFFF", fontSize: 12 }}
              style={{ backgroundColor: "#10B981" }}
            >
              Buka
            </Chip>
          </View>
        </View>
        
        <View style={styles.clinicServices}>
          <Text style={styles.servicesTitle}>
            Layanan Tersedia:
          </Text>
          <View style={styles.serviceChips}>
            {item.services?.slice(0, 3).map((service: any, index: number) => (
              <Chip
                key={index}
                mode="outlined"
                textStyle={{ fontSize: 10 }}
                style={styles.serviceChip}
              >
                {service.name}
              </Chip>
            ))}
            {item.services?.length > 3 && (
              <Chip
                mode="outlined"
                textStyle={{ fontSize: 10 }}
                style={styles.serviceChip}
              >
                +{item.services.length - 3} lagi
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.clinicFooter}>
          <View style={styles.distanceInfo}>
            <Icon name="map-marker-distance" size={16} color="#64748B" />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("ClinicBooking", { clinic: item })}
            style={styles.bookButton}
            buttonColor="#E22345"
          >
            Booking Sekarang
          </Button>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Text style={styles.headerTitle}>Klinik & Rumah Sakit</Text>
            <Text style={styles.headerSubtitle}>Temukan layanan kesehatan terbaik</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="magnify" size={20} color="#64748B" />
          <TextInput
            placeholder="Cari klinik atau layanan..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.quickActions}>
          {/* <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate("ClinicBooking")}
          >
            <LinearGradient
              colors={["#E22345", "#FF6B8A"]}
              style={styles.quickActionGradient}
            >
              <Icon name="calendar-plus" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Booking Baru</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate("ClinicBooking")}
          >
            <LinearGradient
              colors={["#4ECDC4", "#96CEB4"]}
              style={styles.quickActionGradient}
            >
              <Icon name="history" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Riwayat</Text>
            </LinearGradient>
          </TouchableOpacity> */}
        </View>

        <View style={styles.clinicsSection}>
          <Text style={styles.sectionTitle}>Klinik Terdekat</Text>
          {filteredClinics.map((clinic, index) => (
            <View key={clinic.id}>
              {renderClinicCard({ item: clinic })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// History Tab Component
const HistoryTab = ({ navigation, route }: any) => {
  const theme = useTheme<CustomTheme>();
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchBookingHistory();
    }, [])
  );

  // Handle refresh trigger from navigation params
  useEffect(() => {
    if (route.params?.refreshTrigger) {
      fetchBookingHistory();
      // Clear the parameter
      navigation.setParams({ refreshTrigger: undefined });
    }
  }, [route.params?.refreshTrigger]);

  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyBookings();
      if (response.success) {
        setBookingHistory(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching booking history:", error);
      Alert.alert("Error", "Failed to load booking history: " + (error?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: number) => {
    try {
      const response = await apiService.cancelBooking(bookingId);
      if (response.success) {
        fetchBookingHistory();
        Alert.alert("Success", "Booking berhasil dibatalkan");
      }
    } catch (error: any) {
      console.error("Error canceling booking:", error);
      Alert.alert("Error", "Gagal membatalkan booking: " + (error?.message || "Unknown error"));
    }
  };

  const handleContinueChat = async (booking: any) => {
    try {
      const response = await apiService.createDoctorChat(booking.booking_id);
      
      if (response.success) {
        navigation.navigate("ChatDetail", {
          chatId: response.data.chat_id,
          chatType: "doctor",
          title: `Konsultasi dengan ${booking.doctor?.name || "Dokter"}`,
          doctor: booking.doctor,
        });
      } else {
        Alert.alert("Error", response.message || "Gagal membuat chat dengan dokter");
      }
    } catch (error) {
      console.error("Error creating doctor chat:", error);
      Alert.alert("Error", "Gagal membuat chat dengan dokter");
    }
  };

  const renderBookingCard = ({ item }: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.historyCard}
      onPress={() => {
        // Navigate to booking detail screen
        navigation.navigate("BookingDetail", { bookingData: item });
      }}
    >
      {/* Simple List View */}
      <View style={styles.historyHeader}>
        <View style={styles.bookingIdContainer}>
          <Text style={styles.bookingId}>
            Booking #{item.booking_id || item.id}
          </Text>
          <Text style={styles.bookingDate}>
            {new Date(item.createdAt).toLocaleDateString("id-ID", {
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
                item.status === "completed"
                  ? "#10B981"
                  : item.status === "cancelled"
                  ? "#EF4444"
                  : item.status === "confirmed"
                  ? "#3B82F6"
                  : "#F59E0B",
            },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === "completed"
              ? "Selesai"
              : item.status === "cancelled"
              ? "Dibatalkan"
              : item.status === "confirmed"
              ? "Dikonfirmasi"
              : "Menunggu"}
          </Text>
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.basicInfoContainer}>
        <View style={styles.clinicInfoRow}>
          <Icon name="hospital-building" size={16} color="#E22345" />
          <Text style={styles.clinicNameText}>
            {item.clinic?.name || "Unknown Clinic"}
          </Text>
        </View>
        <View style={styles.serviceInfoRow}>
          <Icon name="stethoscope" size={14} color="#6B7280" />
          <Text style={styles.serviceNameText}>
            {item.service?.name || "Unknown Service"}
          </Text>
        </View>
        <View style={styles.doctorInfoRow}>
          <Icon name="account-tie" size={14} color="#6B7280" />
          <Text style={styles.doctorNameText}>
            {item.doctor?.name || "Unknown Doctor"}
          </Text>
        </View>
        <View style={styles.appointmentInfoRow}>
          <Icon name="calendar" size={14} color="#6B7280" />
          <Text style={styles.appointmentText}>
            {new Date(item.appointment_date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })} • {item.appointment_time}
          </Text>
        </View>
      </View>

      {/* Price Info */}
      <View style={styles.priceRow}>
        <Text style={styles.priceText}>
          Rp {parseFloat(item.total_price || "0").toLocaleString()}
        </Text>
        <View
          style={[
            styles.paymentStatusBadge,
            {
              backgroundColor:
                item.payment_status === "paid"
                  ? "#10B981"
                  : item.payment_status === "pending"
                  ? "#F59E0B"
                  : item.payment_status === "canceled"
                  ? "#EF4444"
                  : "#6B7280",
            },
          ]}
        >
          <Text style={styles.paymentStatusText}>
            {item.payment_status === "paid"
              ? "Lunas"
              : item.payment_status === "pending"
              ? "Menunggu"
              : item.payment_status === "canceled"
              ? "Dibatalkan"
              : item.payment_status || "Belum Bayar"}
          </Text>
        </View>
      </View>

      {/* Action Buttons for pending bookings */}
      {item.status === "pending" && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("BookingConfirmation", {
                bookingData: item,
                isExistingBooking: true,
                onBookingUpdate: () => {
                  // Refresh data after booking update
                  fetchBookingHistory();
                },
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
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert(
                "Batalkan Booking",
                "Apakah Anda yakin ingin membatalkan booking ini?",
                [
                  { text: "Tidak", style: "cancel" },
                  {
                    text: "Ya",
                    style: "cancel",
                    onPress: () => {
                      cancelBooking(item.id);
                      // Refresh data after cancellation
                      setTimeout(() => {
                        fetchBookingHistory();
                      }, 1000);
                    },
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
      )}

      {/* Chat Button for confirmed bookings */}
      {item.status === "confirmed" && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={(e) => {
              e.stopPropagation();
              handleContinueChat(item);
            }}
          >
            <Icon name="message-text" size={16} color="#FFFFFF" />
            <Text style={styles.chatButtonText}>
              Lanjutkan Chat
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

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
            <Text style={styles.headerTitle}>Riwayat Booking</Text>
            <Text style={styles.headerSubtitle}>Lihat semua booking Anda</Text>
          </View>
        </View>
      </LinearGradient>
      
      <FlatList
        data={bookingHistory}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.historyList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchBookingHistory} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="history" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>Belum ada riwayat booking</Text>
            <Text style={styles.emptySubtext}>Booking pertama Anda akan muncul di sini</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// Main Clinics App Component
const ClinicsApp = ({ navigation, route }: any) => {
  const theme = useTheme<CustomTheme>();


  return (
    <SafeAreaView style={styles.safeArea}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = "home";

            if (route.name === "HOME") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "BOOKING") {
              iconName = focused ? "calendar-plus" : "calendar-plus-outline";
            } else if (route.name === "HISTORY") {
              iconName = focused ? "history" : "history";
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#E22345",
          tabBarInactiveTintColor: "#6B7280",
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E5E7EB",
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 70,
            elevation: 0,
            shadowOpacity: 0,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="HOME"
          component={HomeTab}
          options={{ tabBarLabel: "Beranda" }}
        />
        <Tab.Screen
          name="HISTORY"
          component={HistoryTab}
          options={{ tabBarLabel: "Riwayat" }}
          initialParams={route.params}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  profileButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  quickActionGradient: {
    padding: 16,
    alignItems: "center",
  },
  quickActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  clinicsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  clinicCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  clinicCardGradient: {
    padding: 20,
  },
  clinicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  clinicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  clinicRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },
  clinicStatus: {
    marginLeft: 12,
  },
  clinicServices: {
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  serviceChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceChip: {
    marginRight: 8,
  },
  clinicFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 4,
  },
  bookButton: {
    borderRadius: 8,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyClinicName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  historyService: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  historyDateTime: {
    marginBottom: 12,
  },
  historyStatus: {
    marginLeft: 12,
  },

  detailButton: {
    borderRadius: 8,
    borderColor: "#E22345",
    borderWidth: 1,
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    borderRadius: 8,
    backgroundColor: "#E22345",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  historyList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
  },
  // New styles for enhanced history card
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingIdContainer: {
    flex: 1,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 12,
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
    marginBottom: 12,
  },
  historyClinic: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  historyDoctor: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  doctorSpecialization: {
    fontSize: 12,
    color: "#6B7280",
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
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
    fontSize: 16,
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
    marginTop: 12,
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
    marginTop: 12,
    padding: 12,
    backgroundColor: "#E22345",
    borderRadius: 8,
  },
  cancellationText: {
    fontSize: 12,
    color: "#FFFFFF",
    marginLeft: 8,
    flex: 1,
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
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Enhanced styles for better organization
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
  appointmentSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  paymentSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  additionalInfoSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  // New styles for simplified list view
  basicInfoContainer: {
    marginTop: 12,
  },
  clinicInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  clinicNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  serviceInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  serviceNameText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 8,
  },
  doctorInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  doctorNameText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 8,
  },
  appointmentInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  appointmentText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E22345",
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ClinicsApp; 