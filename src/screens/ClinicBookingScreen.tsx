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
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import apiService from "../services/api";
import { handleError } from "../utils/errorHandler";
import { safeGoBack } from "../utils/safeNavigation";

const { width } = Dimensions.get("window");

const ClinicBookingScreen = ({ navigation, route }: any) => {
  const theme = useTheme<CustomTheme>();
  const [selectedTab, setSelectedTab] = useState("book");
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  // API Data States
  const [clinics, setClinics] = useState<any[]>([]);
  const [servicesByClinic, setServicesByClinic] = useState<any>({});
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch data from API
  useEffect(() => {
    fetchClinics();
    fetchBookingHistory();
    fetchUserProfile();
  }, []);

  // Handle clinic data from navigation params
  useEffect(() => {
    if (route.params?.clinic) {
      const clinicFromParams = route.params.clinic;
      setSelectedClinic(clinicFromParams.id);
      
      // If this clinic is not in our clinics list, add it
      setClinics(prevClinics => {
        const clinicExists = prevClinics.find(c => c.id === clinicFromParams.id);
        if (!clinicExists) {
          return [...prevClinics, clinicFromParams];
        }
        return prevClinics;
      });

      // Set services for this clinic
      if (clinicFromParams.services) {
        const servicesData = clinicFromParams.services.map((service: any) => ({
          ...service,
          price: `Rp ${parseFloat(service.price).toLocaleString()}`,
          duration: `${service.duration} min`,
          doctors: clinicFromParams.doctors?.filter(
            (doctor: any) => doctor.service_id === service.id
          ) || [],
        }));
        setServicesByClinic((prev: any) => ({
          ...prev,
          [clinicFromParams.id]: servicesData
        }));
      }
    }
  }, [route.params?.clinic]);

  // Remove automatic focus refresh - manual refresh only
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("focus", () => {
  //     // Check if we need to refresh history (e.g., after payment confirmation)
  //     if (route.params?.refreshHistory) {
  //       fetchBookingHistory();
  //       // Clear the parameter
  //       navigation.setParams({ refreshHistory: undefined });
  //     }
  //   });

  //   return unsubscribe;
  // }, [navigation, route.params?.refreshHistory]);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getClinics();
      if (response.success && response.data && Array.isArray(response.data)) {
        // Transform clinic data to match the expected format
        const transformedClinics = response.data.map((clinic: any) => ({
          ...clinic,
          available: true, // Set all clinics as available
          color: "#E22345", // Default color
          image: "hospital-building", // Default icon
          distance: "2.5 km", // Default distance
        }));
        setClinics(transformedClinics);

        // Transform services data
        const servicesData: any = {};
        if (Array.isArray(response.data)) {
          response.data.forEach((clinic: any) => {
          if (clinic.services && clinic.services.length > 0) {
            servicesData[clinic.id] = clinic.services.map((service: any) => ({
              ...service,
              price: `Rp ${parseFloat(service.price).toLocaleString()}`,
              duration: `${service.duration} min`,
              doctors:
                clinic.doctors?.filter(
                  (doctor: any) => 
                    doctor.service_id === service.id && 
                    (doctor.doctor_type === 'clinic' || doctor.doctor_type === 'both')
                ) || [],
            }));
          }
        });
        }
        setServicesByClinic(servicesData);
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
      Alert.alert("Error", "Failed to load clinics");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      const response = await apiService.getMyBookings();
      if (response.success) {
        setBookingHistory(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching booking history:", error);
      // Don't show alert for authentication errors as they're handled by AuthContext
      if (!error.message?.includes("Authentication failed")) {
        Alert.alert("Error", "Failed to load booking history");
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.getUserProfile();
      if (response.success) {
        setUserProfile(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      // Don't show alert for authentication errors as they're handled by AuthContext
      if (!error.message?.includes("Authentication failed")) {
        handleError(error, {
          title: 'Load User Profile Error'
        });
      }
    }
  };

  const cancelBooking = async (bookingId: number) => {
    try {
      setLoading(true);
      const response = await apiService.cancelBooking(
        bookingId,
        "Dibatalkan oleh user"
      );

      if (response.success) {
        Alert.alert(
          "Booking Dibatalkan",
          "Booking Anda telah berhasil dibatalkan.",
          [
            {
              text: "OK",
              onPress: () => {
                // Refresh booking history
                fetchBookingHistory();
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", response.message || "Gagal membatalkan booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      handleError(error, {
        title: 'Cancel Booking Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayNames = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const dayName = dayNames[date.getDay()];

      // Weekend (Sabtu/Minggu) dan hari libur tidak tersedia
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isToday = i === 0;

      dates.push({
        date: date.toISOString().split("T")[0],
        day: dayName,
        dayNumber: date.getDate(),
        month: date.getMonth() + 1,
        available: !isWeekend && !isToday,
        isToday: isToday,
        isWeekend: isWeekend,
      });
    }

    return dates;
  };

  const availableDates = generateAvailableDates();

  const generateAvailableTimes = () => {
    const times = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour <= endHour; hour++) {
      // Skip lunch break (12:00-13:00)
      if (hour === 12) continue;

      const time = `${hour.toString().padStart(2, "0")}:00`;
      const isAvailable = Math.random() > 0.2; // 80% chance of being available

      times.push({
        time: time,
        available: isAvailable,
        period: hour < 12 ? "Pagi" : "Sore",
      });
    }

    return times;
  };

  const availableTimes = generateAvailableTimes();

  const renderClinicCard = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.clinicCard,
        selectedClinic === item.id && styles.clinicCardSelected,
        !item.available && styles.clinicCardDisabled,
      ]}
      onPress={() => item.available && setSelectedClinic(item.id)}
      disabled={!item.available}
    >
      <View style={styles.clinicCardHeader}>
        <View
          style={[styles.clinicIcon, { backgroundColor: item.color + "20" }]}
        >
          <Icon name={item.image} size={24} color={item.color} />
        </View>
        <View style={styles.clinicInfo}>
          <Text style={styles.clinicName}>{item.name}</Text>
          <Text style={styles.clinicAddress}>{item.address}</Text>
          <View style={styles.clinicMeta}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>
        {!item.available && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Tidak Tersedia</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderServiceCard = ({ item }: any) => {
    // Check if user has insurance
    const hasInsurance = userProfile?.has_insurance;

    return (
      <TouchableOpacity
        style={[
          styles.serviceCard,
          selectedService === item.id && styles.serviceCardSelected,
        ]}
        onPress={() => setSelectedService(item.id)}
      >
        <View
          style={[styles.serviceIcon, { backgroundColor: item.color + "20" }]}
        >
          <Icon name={item.icon} size={24} color={item.color} />
        </View>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDuration}>{item.duration}</Text>
        {hasInsurance ? (
          <View style={styles.insuranceContainer}>
            <Icon name="shield-check" size={16} color="#10B981" />
            <Text style={styles.insuranceText}>Ditanggung Asuransi</Text>
          </View>
        ) : (
          <Text style={styles.servicePrice}>{item.price}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderDateCard = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.dateCard,
        selectedDate === item.date && styles.dateCardSelected,
        !item.available && styles.dateCardDisabled,
      ]}
      onPress={() => item.available && setSelectedDate(item.date)}
      disabled={!item.available}
    >
      <Text style={styles.dateDay}>{item.day}</Text>
      <Text style={styles.dateNumber}>{new Date(item.date).getDate()}</Text>
    </TouchableOpacity>
  );

  const renderTimeCard = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.timeCard,
        selectedTime === item.time && styles.timeCardSelected,
        !item.available && styles.timeCardDisabled,
      ]}
      onPress={() => item.available && setSelectedTime(item.time)}
      disabled={!item.available}
    >
      <Text style={styles.timeText}>{item.time}</Text>
    </TouchableOpacity>
  );

  const handleBooking = async () => {
    if (
      selectedClinic &&
      selectedService &&
      selectedDoctor &&
      selectedDate &&
      selectedTime
    ) {
      try {
        setLoading(true);

        // Find the selected objects by ID
        const clinic = clinics.find((c: any) => c.id === selectedClinic);
        const service = servicesByClinic[selectedClinic]?.find(
          (s: any) => s.id === selectedService
        );
        const doctor = service?.doctors?.find(
          (d: any) => d.id === selectedDoctor
        );

        if (!clinic || !service || !doctor) {
          Alert.alert("Error", "Data tidak valid, silakan coba lagi");
          return;
        }

        // Prepare booking data for API
        const bookingData = {
          clinic_id: clinic.id,
          service_id: service.id,
          doctor_id: doctor.id,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          notes: `Booking untuk ${service.name} dengan ${doctor.name}`,
        };

        // Call API to create booking
        const response = await apiService.createBooking(bookingData);

        if (response.success) {
          Alert.alert(
            "Booking Berhasil",
            "Booking Anda telah berhasil dibuat!",
            [
              {
                text: "OK",
                onPress: () => {
                  // Refresh booking history
                  fetchBookingHistory();
                  // Navigate directly to ClinicsApp history tab
                  navigation.navigate("ClinicsApp", {
                    screen: "HISTORY",
                    params: {
                      refreshTrigger: Date.now(),
                    },
                  });
                },
              },
            ]
          );
        } else {
          console.error("❌ Booking failed:", response.message);
          Alert.alert("Error", response.message || "Gagal membuat booking");
        }
      } catch (error) {
        console.error("❌ Error creating booking:", error);
        Alert.alert("Error", "Terjadi kesalahan saat membuat booking");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          {/* <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => safeGoBack(navigation, 'Main')}
            >
              <Icon name="arrow-left" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Booking Klinik</Text>
            <View style={styles.headerRight} />
          </View> */}

          {/* Tab Navigation */}
          {/* <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === "book" && styles.tabButtonActive,
              ]}
              onPress={() => setSelectedTab("book")}
            >
              <Icon
                name="calendar-plus"
                size={20}
                color={selectedTab === "book" ? "#FFFFFF" : "#6B7280"}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "book" && styles.tabTextActive,
                ]}
              >
                Booking Baru
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === "history" && styles.tabButtonActive,
              ]}
              onPress={() => setSelectedTab("history")}
            >
              <Icon
                name="history"
                size={20}
                color={selectedTab === "history" ? "#FFFFFF" : "#6B7280"}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "history" && styles.tabTextActive,
                ]}
              >
                Riwayat
              </Text>
            </TouchableOpacity>
          </View> */}

          {selectedTab === "book" ? (
            <>
              {/* Select Clinic */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pilih Klinik</Text>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Memuat klinik...</Text>
                  </View>
                ) : clinics.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      Tidak ada klinik tersedia
                    </Text>
                  </View>
                ) : (
                  <View style={styles.clinicsList}>
                    {clinics.map((clinic) => (
                      <TouchableOpacity
                        key={clinic.id}
                        style={[
                          styles.clinicCard,
                          selectedClinic === clinic.id &&
                            styles.clinicCardSelected,
                          !clinic.available && styles.clinicCardDisabled,
                        ]}
                        onPress={() =>
                          clinic.available && setSelectedClinic(clinic.id)
                        }
                        disabled={!clinic.available}
                      >
                        <View style={styles.clinicCardHeader}>
                          <View
                            style={[
                              styles.clinicIcon,
                              { backgroundColor: clinic.color + "20" },
                            ]}
                          >
                            <Icon
                              name={clinic.image}
                              size={24}
                              color={clinic.color}
                            />
                          </View>
                          <View style={styles.clinicInfo}>
                            <Text style={styles.clinicName}>{clinic.name}</Text>
                            <Text style={styles.clinicAddress}>
                              {clinic.address}
                            </Text>
                            <View style={styles.clinicMeta}>
                              <View style={styles.ratingContainer}>
                                <Icon name="star" size={14} color="#F59E0B" />
                                <Text style={styles.ratingText}>
                                  {clinic.rating}
                                </Text>
                              </View>
                              <Text style={styles.distanceText}>
                                {clinic.distance}
                              </Text>
                            </View>
                          </View>
                          {!clinic.available && (
                            <View style={styles.unavailableBadge}>
                              <Text style={styles.unavailableText}>
                                Tidak Tersedia
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Select Service */}
              {selectedClinic && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Pilih Layanan</Text>
                  {servicesByClinic[
                    selectedClinic as keyof typeof servicesByClinic
                  ]?.length > 0 ? (
                    <View style={styles.servicesGrid}>
                      {servicesByClinic[
                        selectedClinic as keyof typeof servicesByClinic
                      ]?.map((service: any) => (
                        <TouchableOpacity
                          key={service.id}
                          style={[
                            styles.serviceCard,
                            selectedService === service.id &&
                              styles.serviceCardSelected,
                          ]}
                          onPress={() => {
                            setSelectedService(service.id);
                            setSelectedDoctor(null); // Reset doctor selection when service changes
                          }}
                        >
                          <View
                            style={[
                              styles.serviceIcon,
                              { backgroundColor: service.color + "20" },
                            ]}
                          >
                            <Icon
                              name={service.icon}
                              size={24}
                              color={service.color}
                            />
                          </View>
                          <Text style={styles.serviceName}>{service.name}</Text>
                          <Text style={styles.serviceDuration}>
                            {service.duration}
                          </Text>
                          <Text style={styles.servicePrice}>
                            {service.price}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        Tidak ada layanan tersedia untuk klinik ini
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Select Doctor */}
              {selectedService && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Pilih Dokter</Text>
                  {servicesByClinic[
                    selectedClinic as keyof typeof servicesByClinic
                  ]?.find((s: any) => s.id === selectedService)?.doctors
                    ?.length > 0 ? (
                    <View style={styles.doctorsList}>
                      {servicesByClinic[
                        selectedClinic as keyof typeof servicesByClinic
                      ]
                        ?.find((s: any) => s.id === selectedService)
                        ?.doctors?.map((doctor: any) => (
                          <TouchableOpacity
                            key={doctor.id}
                            style={[
                              styles.doctorCard,
                              selectedDoctor === doctor.id &&
                                styles.doctorCardSelected,
                            ]}
                            onPress={() => setSelectedDoctor(doctor.id)}
                          >
                            <View style={styles.doctorInfo}>
                              <View style={styles.doctorAvatar}>
                                <Icon
                                  name="account"
                                  size={24}
                                  color="#6B7280"
                                />
                              </View>
                              <View style={styles.doctorDetails}>
                                <Text style={styles.doctorName}>
                                  {doctor.name}
                                </Text>
                                <Text style={styles.doctorSpecialization}>
                                  {doctor.specialization}
                                </Text>
                                <View style={styles.doctorRating}>
                                  <Icon name="star" size={14} color="#F59E0B" />
                                  <Text style={styles.doctorRatingText}>
                                    {doctor.rating}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        Tidak ada dokter tersedia untuk layanan ini
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Select Date */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pilih Tanggal</Text>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderText}>
                    {new Date().toLocaleDateString("id-ID", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.datesContainer}>
                    {availableDates.map((date) => (
                      <TouchableOpacity
                        key={date.date}
                        style={[
                          styles.dateCard,
                          selectedDate === date.date && styles.dateCardSelected,
                          !date.available && styles.dateCardDisabled,
                          date.isToday && styles.dateCardToday,
                        ]}
                        onPress={() =>
                          date.available && setSelectedDate(date.date)
                        }
                        disabled={!date.available}
                      >
                        <Text
                          style={[
                            styles.dateDay,
                            date.isToday && styles.dateDayToday,
                            !date.available && styles.dateDayDisabled,
                          ]}
                        >
                          {date.day}
                        </Text>
                        <Text
                          style={[
                            styles.dateNumber,
                            date.isToday && styles.dateNumberToday,
                            !date.available && styles.dateNumberDisabled,
                          ]}
                        >
                          {date.dayNumber}
                        </Text>
                        {date.isToday && (
                          <View style={styles.todayIndicator}>
                            <Text style={styles.todayText}>Hari Ini</Text>
                          </View>
                        )}
                        {date.isWeekend && (
                          <View style={styles.weekendIndicator}>
                            <Text style={styles.weekendText}>Libur</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <View style={styles.dateLegend}>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#E22345" }]}
                    />
                    <Text style={styles.legendText}>Hari Ini</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#6B7280" }]}
                    />
                    <Text style={styles.legendText}>Libur</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#10B981" }]}
                    />
                    <Text style={styles.legendText}>Tersedia</Text>
                  </View>
                </View>
              </View>

              {/* Select Time */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pilih Waktu</Text>
                <View style={styles.timePeriodsContainer}>
                  {/* Morning Period */}
                  <View style={styles.timePeriod}>
                    <Text style={styles.timePeriodTitle}>Pagi</Text>
                    <View style={styles.timesGrid}>
                      {availableTimes
                        .filter((time) => time.period === "Pagi")
                        .map((time) => (
                          <TouchableOpacity
                            key={time.time}
                            style={[
                              styles.timeCard,
                              selectedTime === time.time &&
                                styles.timeCardSelected,
                              !time.available && styles.timeCardDisabled,
                            ]}
                            onPress={() =>
                              time.available && setSelectedTime(time.time)
                            }
                            disabled={!time.available}
                          >
                            <Text
                              style={[
                                styles.timeText,
                                !time.available && styles.timeTextDisabled,
                              ]}
                            >
                              {time.time}
                            </Text>
                            {!time.available && (
                              <Text style={styles.timeUnavailableText}>
                                Penuh
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))}
                    </View>
                  </View>

                  {/* Afternoon Period */}
                  <View style={styles.timePeriod}>
                    <Text style={styles.timePeriodTitle}>Sore</Text>
                    <View style={styles.timesGrid}>
                      {availableTimes
                        .filter((time) => time.period === "Sore")
                        .map((time) => (
                          <TouchableOpacity
                            key={time.time}
                            style={[
                              styles.timeCard,
                              selectedTime === time.time &&
                                styles.timeCardSelected,
                              !time.available && styles.timeCardDisabled,
                            ]}
                            onPress={() =>
                              time.available && setSelectedTime(time.time)
                            }
                            disabled={!time.available}
                          >
                            <Text
                              style={[
                                styles.timeText,
                                !time.available && styles.timeTextDisabled,
                              ]}
                            >
                              {time.time}
                            </Text>
                            {!time.available && (
                              <Text style={styles.timeUnavailableText}>
                                Penuh
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))}
                    </View>
                  </View>
                </View>
              </View>

              {/* Booking Button */}
              <View style={styles.bookingButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.bookingButton,
                    (!selectedClinic ||
                      !selectedService ||
                      !selectedDoctor ||
                      !selectedDate ||
                      !selectedTime) &&
                      styles.bookingButtonDisabled,
                  ]}
                  onPress={handleBooking}
                  disabled={
                    !selectedClinic ||
                    !selectedService ||
                    !selectedDoctor ||
                    !selectedDate ||
                    !selectedTime
                  }
                >
                  <LinearGradient
                    colors={["#E22345", "#B71C1C"]}
                    style={styles.bookingButtonGradient}
                  >
                    <Text style={styles.bookingButtonText}>
                      Konfirmasi Booking
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Booking History */
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Riwayat Pemeriksaan</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>
                    Memuat riwayat booking...
                  </Text>
                </View>
              ) : bookingHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="calendar-remove" size={64} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>
                    Belum Ada Riwayat Booking
                  </Text>
                  <Text style={styles.emptyText}>
                    Anda belum memiliki riwayat pemeriksaan. Silakan buat
                    booking baru untuk memulai.
                  </Text>
                </View>
              ) : (
                <View style={styles.historyList}>
                  {bookingHistory.map((booking) => (
                    <View key={booking.id} style={styles.historyCard}>
                      {/* Booking ID and Status */}
                      <View style={styles.historyHeader}>
                        <View style={styles.bookingIdContainer}>
                          <Text style={styles.bookingId}>
                            #{booking.booking_id}
                          </Text>
                          <Text style={styles.bookingDate}>
                            {new Date(booking.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                booking.status === "completed"
                                  ? "#10B981"
                                  : booking.status === "cancelled"
                                  ? "#EF4444"
                                  : booking.status === "confirmed"
                                  ? "#3B82F6"
                                  : "#F59E0B",
                            },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {booking.status === "completed"
                              ? "Selesai"
                              : booking.status === "cancelled"
                              ? "Dibatalkan"
                              : booking.status === "confirmed"
                              ? "Dikonfirmasi"
                              : "Menunggu"}
                          </Text>
                        </View>
                      </View>

                      {/* Clinic and Service Info */}
                      <View style={styles.clinicServiceInfo}>
                        <Text style={styles.historyClinic}>
                          {booking.clinic?.name || "Unknown Clinic"}
                        </Text>
                        <Text style={styles.historyService}>
                          {booking.service?.name || "Unknown Service"}
                        </Text>
                        <Text style={styles.historyDoctor}>
                          Dokter: {booking.doctor?.name || "Unknown Doctor"}
                        </Text>
                        {booking.doctor?.specialization && (
                          <Text style={styles.doctorSpecialization}>
                            Spesialisasi: {booking.doctor.specialization}
                          </Text>
                        )}
                      </View>

                      {/* Appointment Date and Time */}
                      <View style={styles.historyDateTime}>
                        <View style={styles.dateTimeItem}>
                          <Icon name="calendar" size={16} color="#6B7280" />
                          <Text style={styles.historyDate}>
                            {new Date(
                              booking.appointment_date
                            ).toLocaleDateString("id-ID", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Text>
                        </View>
                        <View style={styles.dateTimeItem}>
                          <Icon
                            name="clock-outline"
                            size={16}
                            color="#6B7280"
                          />
                          <Text style={styles.historyTime}>
                            {booking.appointment_time}
                          </Text>
                        </View>
                      </View>

                      {/* Price and Payment Status */}
                      <View style={styles.pricePaymentContainer}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceLabel}>Total Biaya:</Text>
                          {userProfile?.has_insurance ? (
                            <View style={styles.insuranceContainer}>
                              <Icon
                                name="shield-check"
                                size={16}
                                color="#10B981"
                              />
                              <Text style={styles.insuranceText}>
                                Ditanggung Asuransi
                              </Text>
                            </View>
                          ) : (
                            <Text style={styles.priceAmount}>
                              Rp{" "}
                              {parseFloat(booking.total_price).toLocaleString()}
                            </Text>
                          )}
                        </View>
                        <View
                          style={[
                            styles.paymentStatusBadge,
                            {
                              backgroundColor:
                                booking.payment_status === "paid"
                                  ? "#10B981"
                                  : booking.payment_status === "pending"
                                  ? "#F59E0B"
                                  : booking.payment_status === "canceled"
                                  ? "#EF4444"
                                  : "#6B7280",
                            },
                          ]}
                        >
                          <Text style={styles.paymentStatusText}>
                            {booking.payment_status === "paid"
                              ? "Lunas"
                              : booking.payment_status === "pending"
                              ? "Menunggu"
                              : booking.payment_status === "canceled"
                              ? "Dibatalkan"
                              : booking.payment_status}
                          </Text>
                        </View>
                      </View>

                      {/* Notes if available */}
                      {booking.notes && (
                        <View style={styles.notesContainer}>
                          <Icon name="note-text" size={16} color="#6B7280" />
                          <Text style={styles.notesText}>{booking.notes}</Text>
                        </View>
                      )}

                      {/* Cancellation info if cancelled */}
                      {booking.status === "cancelled" &&
                        booking.cancellation_reason && (
                          <View style={styles.cancellationContainer}>
                            <Icon name="cancel" size={16} color="#EF4444" />
                            <Text style={styles.cancellationText}>
                              Alasan: {booking.cancellation_reason}
                            </Text>
                          </View>
                        )}

                      {/* Action Buttons for pending bookings */}
                      {booking.status === "pending" && (
                        <View style={styles.actionContainer}>
                          <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={() => {
                              // Navigate to booking confirmation screen
                              navigation.navigate("BookingConfirmation", {
                                bookingData: booking,
                                isExistingBooking: true,
                              });
                            }}
                          >
                            <Icon
                              name="check-circle"
                              size={16}
                              color="#FFFFFF"
                            />
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
                                  {
                                    text: "Tidak",
                                    style: "cancel",
                                  },
                                  {
                                    text: "Ya",
                                    style: "destructive",
                                    onPress: () => cancelBooking(booking.id),
                                  },
                                ]
                              );
                            }}
                          >
                            <Icon
                              name="close-circle"
                              size={16}
                              color="#FFFFFF"
                            />
                            <Text style={styles.cancelButtonText}>
                              Batalkan Booking
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
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
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#E22345",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 8,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  clinicsList: {
    gap: 12,
  },
  clinicCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  clinicCardSelected: {
    borderColor: "#E22345",
    backgroundColor: "#FEF2F2",
  },
  clinicCardDisabled: {
    opacity: 0.5,
  },
  clinicCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  clinicIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  clinicMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 14,
    color: "#6B7280",
  },
  unavailableBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  serviceCard: {
    width: (width - 60) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  serviceCardSelected: {
    borderColor: "#E22345",
    backgroundColor: "#FEF2F2",
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E22345",
  },
  insuranceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  insuranceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  dateHeader: {
    marginBottom: 16,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  datesContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
  },
  dateCard: {
    width: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 80,
    position: "relative",
  },
  dateCardSelected: {
    borderColor: "#E22345",
    backgroundColor: "#FEF2F2",
  },
  dateCardDisabled: {
    opacity: 0.5,
  },
  dateCardToday: {
    borderColor: "#E22345",
    backgroundColor: "#FEF2F2",
  },
  dateDay: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  dateDayToday: {
    color: "#E22345",
    fontWeight: "600",
  },
  dateDayDisabled: {
    color: "#9CA3AF",
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  dateNumberToday: {
    color: "#E22345",
  },
  dateNumberDisabled: {
    color: "#9CA3AF",
  },
  todayIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#E22345",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  todayText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  weekendIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#6B7280",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  weekendText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dateLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  timePeriodsContainer: {
    gap: 20,
  },
  timePeriod: {
    gap: 12,
  },
  timePeriodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  timesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeCard: {
    width: (width - 80) / 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 50,
  },
  timeCardSelected: {
    borderColor: "#E22345",
    backgroundColor: "#FEF2F2",
  },
  timeCardDisabled: {
    opacity: 0.5,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  timeTextDisabled: {
    color: "#9CA3AF",
  },
  timeUnavailableText: {
    fontSize: 10,
    color: "#EF4444",
    fontWeight: "500",
    marginTop: 2,
  },
  doctorsList: {
    gap: 12,
  },
  doctorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  doctorCardSelected: {
    borderColor: "#E22345",
    backgroundColor: "#FEF2F2",
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
  },
  doctorRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorRatingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 4,
  },
  bookingButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  bookingButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  bookingButtonDisabled: {
    opacity: 0.5,
  },
  bookingButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  bookingButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyClinic: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  historyService: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  historyDoctor: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  historyDateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyDate: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 16,
  },
  historyTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  bookingIdContainer: {
    flex: 1,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  bookingDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  clinicServiceInfo: {
    marginBottom: 12,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
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
    fontWeight: "700",
    color: "#E22345",
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  notesText: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
    fontStyle: "italic",
  },
  cancellationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancellationText: {
    fontSize: 14,
    color: "#EF4444",
    flex: 1,
    fontStyle: "italic",
  },
  actionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    gap: 12,
  },
  confirmButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});

export default ClinicBookingScreen;
