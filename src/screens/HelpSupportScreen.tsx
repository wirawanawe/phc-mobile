import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Text, useTheme, Card, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";

import apiService from "../services/api";
import { safeGoBack } from "../utils/safeNavigation";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ContactMethod {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  value: string;
  action: string;
}

interface ContactData {
  contacts: any[];
  primaryContact: any;
  contactMethods: ContactMethod[];
  supportHours: {
    customerService: string;
    bookingHours: string;
    emergency: string;
  };
}

const HelpSupportScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user } = useAuth();

  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch contact data from API
  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      setLoading(true);
      console.log('📞 Fetching contact data from API...');
      
      // Initialize API service if needed
      if (!apiService.isInitialized) {
        console.log('🔄 Initializing API service...');
        await apiService.initialize();
      }
      
      console.log('🌐 API Base URL:', apiService.baseURL);
      const response = await apiService.request('/help/contact');
      
      console.log('📊 API Response:', response);
      
      if (response.success) {
        console.log('✅ Contact data fetched successfully');
        console.log('📞 Contact methods:', response.data.contactMethods);
        console.log('📞 Primary contact:', response.data.primaryContact);
        setContactData(response.data);
      } else {
        console.error('❌ Failed to fetch contact data:', response.message);
        // Show error state instead of fallback data
        setContactData(null);
        Alert.alert(
          "Kesalahan Koneksi",
          "Gagal memuat informasi kontak. Periksa koneksi internet Anda.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('❌ Error fetching contact data:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
      // Show error state instead of fallback data
      setContactData(null);
      Alert.alert(
        "Kesalahan Koneksi",
        "Gagal memuat informasi kontak. Periksa koneksi internet Anda.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };



  const handleContactAction = (contact: ContactMethod) => {
    switch (contact.action) {
      case "whatsapp":
        const whatsappUrl = `https://wa.me/${contact.value.replace(/[^0-9]/g, '')}?text=Halo, saya butuh bantuan dengan aplikasi PHC Mobile`;
        Linking.openURL(whatsappUrl);
        break;
      case "email":
        const emailUrl = `mailto:${contact.value}?subject=Bantuan Aplikasi PHC Mobile`;
        Linking.openURL(emailUrl);
        break;
      case "phone":
        const phoneUrl = `tel:${contact.value}`;
        Linking.openURL(phoneUrl);
        break;
      default:
        Alert.alert("Error", "Aksi tidak dikenali");
    }
  };

  const faqData: FAQItem[] = [
    {
      id: "1",
      question: "Bagaimana cara melacak aktivitas harian saya?",
      answer: "Anda dapat melacak aktivitas harian melalui fitur Activity Tracking di aplikasi. Masuk ke menu Wellness dan pilih aktivitas yang ingin Anda lacak.",
      category: "general",
    },
    {
      id: "2",
      question: "Bagaimana cara booking konsultasi dokter?",
      answer: "Untuk booking konsultasi, masuk ke menu Klinik, pilih dokter yang Anda inginkan, dan ikuti langkah-langkah booking yang tersedia.",
      category: "booking",
    },
    {
      id: "3",
      question: "Bagaimana cara mengatur tujuan kesehatan?",
      answer: "Masuk ke menu Profile, pilih 'Tujuan Kesehatan', dan atur target yang ingin Anda capai seperti berat badan, langkah harian, dll.",
      category: "goals",
    },
    {
      id: "4",
      question: "Di mana saya bisa melihat riwayat medis?",
      answer: "Riwayat medis dapat diakses melalui menu Profile > Riwayat Medis. Di sana Anda dapat melihat semua catatan kesehatan Anda.",
      category: "history",
    },
    {
      id: "5",
      question: "Bagaimana cara mengubah password?",
      answer: "Masuk ke menu Profile > Pengaturan Privasi > Ubah Password. Masukkan password lama dan password baru Anda.",
      category: "security",
    },
    {
      id: "6",
      question: "Lupa password, bagaimana cara reset?",
      answer: "Di halaman login, klik 'Lupa Password', masukkan email Anda, dan ikuti instruksi yang dikirim ke email untuk reset password.",
      category: "security",
    },
    {
      id: "7",
      question: "Apa itu program wellness?",
      answer: "Program wellness adalah fitur yang membantu Anda menjalani gaya hidup sehat melalui misi harian, tracking aktivitas, dan edukasi kesehatan.",
      category: "wellness",
    },
    {
      id: "8",
      question: "Bagaimana cara menghubungi customer support?",
      answer: "Anda dapat menghubungi customer support melalui email, telepon, atau fitur chat yang tersedia di aplikasi.",
      category: "support",
    },
  ];

  const renderFAQItem = (faq: FAQItem) => (
    <Card key={faq.id} style={styles.faqCard}>
      <TouchableOpacity onPress={() => handleFAQPress(faq.id)}>
        <Card.Content>
          <View style={styles.faqHeader}>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Icon
              name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6B7280"
            />
          </View>
          {expandedFAQ === faq.id && (
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          )}
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const renderContactMethod = (contact: ContactMethod) => (
    <TouchableOpacity
      key={contact.id}
      style={styles.contactCard}
      onPress={() => handleContactAction(contact)}
    >
      <View style={styles.contactContent}>
        <View style={[styles.contactIcon, { backgroundColor: `${contact.color}20` }]}>
          <Icon name={contact.icon} size={24} color={contact.color} />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>{contact.title}</Text>
          <Text style={styles.contactSubtitle}>{contact.subtitle}</Text>
        </View>
        <Icon name="chevron-right" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  const handleFAQPress = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => safeGoBack(navigation, 'Main')}
          >
            <Icon name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bantuan & Dukungan</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIcon}>
              <Icon name="help-circle" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle}>Butuh Bantuan?</Text>
              <Text style={styles.heroSubtitle}>
                Kami siap membantu Anda 24/7
              </Text>

            </View>
          </View>
        </LinearGradient>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hubungi Kami</Text>
          <View style={styles.contactContainer}>
            {loading ? (
              <Card style={styles.loadingCard}>
                <Card.Content>
                  <Text style={styles.loadingText}>Memuat informasi kontak...</Text>
                </Card.Content>
              </Card>
            ) : contactData ? (
              (() => {
                console.log('📱 Rendering contact methods:', contactData.contactMethods);
                console.log('📱 Contact data source: API');
                return contactData.contactMethods.map(renderContactMethod);
              })()
            ) : (
              <Card style={styles.errorCard}>
                <Card.Content>
                  <View style={styles.errorContent}>
                    <Icon name="wifi-off" size={24} color="#EF4444" />
                    <Text style={styles.errorText}>Gagal memuat informasi kontak</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={fetchContactData}
                    >
                      <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => {
                Alert.alert(
                  "Laporkan Bug",
                  "Terima kasih! Laporan bug Anda akan membantu kami meningkatkan aplikasi.",
                  [{ text: "OK" }]
                );
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#EF444420" }]}>
                <Icon name="bug" size={24} color="#EF4444" />
              </View>
              <Text style={styles.quickActionTitle}>Laporkan Bug</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => {
                Alert.alert(
                  "Saran Fitur",
                  "Terima kasih! Saran Anda sangat berharga untuk pengembangan aplikasi.",
                  [{ text: "OK" }]
                );
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#10B98120" }]}>
                <Icon name="lightbulb" size={24} color="#10B981" />
              </View>
              <Text style={styles.quickActionTitle}>Saran Fitur</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => {
                Alert.alert(
                  "Tutorial",
                  "Tutorial akan segera tersedia untuk membantu Anda menggunakan aplikasi.",
                  [{ text: "OK" }]
                );
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#3B82F620" }]}>
                <Icon name="play-circle" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionTitle}>Tutorial</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pertanyaan yang Sering Diajukan</Text>
          <View style={styles.faqContainer}>
            {faqData.map(renderFAQItem)}
          </View>
        </View>

                {/* Support Hours */}
        {contactData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jam Layanan</Text>
            <Card style={styles.hoursCard}>
              <Card.Content>
                <View style={styles.hoursItem}>
                  <Icon name="clock" size={20} color="#10B981" />
                  <View style={styles.hoursInfo}>
                    <Text style={styles.hoursTitle}>Layanan Pelanggan</Text>
                    <Text style={styles.hoursTime}>{contactData.supportHours.customerService}</Text>
                  </View>
                </View>
                <View style={styles.hoursItem}>
                  <Icon name="calendar" size={20} color="#F59E0B" />
                  <View style={styles.hoursInfo}>
                    <Text style={styles.hoursTitle}>Booking Konsultasi</Text>
                    <Text style={styles.hoursTime}>{contactData.supportHours.bookingHours}</Text>
                  </View>
                </View>
                <View style={styles.hoursItem}>
                  <Icon name="medical-bag" size={20} color="#EF4444" />
                  <View style={styles.hoursInfo}>
                    <Text style={styles.hoursTitle}>Darurat</Text>
                    <Text style={styles.hoursTime}>{contactData.supportHours.emergency}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versi Aplikasi 0.0.1</Text>
          <Text style={styles.versionText}>© 2025 Doctor PHC</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerRight: {
    width: 40,
  },
  heroCard: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  heroInfo: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  contactContainer: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  faqContainer: {
    gap: 8,
  },
  faqCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  hoursCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hoursItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  hoursInfo: {
    marginLeft: 12,
    flex: 1,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  hoursTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  loadingCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
  },

  errorCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderColor: "#EF4444",
    borderWidth: 1,
  },
  errorContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default HelpSupportScreen;
