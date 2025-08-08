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
import { useLanguage } from "../contexts/LanguageContext";
import apiService from "../services/api";

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
  const { t } = useLanguage();
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
          t("connection_error_title"),
          t("connection_error_message"),
          [{ text: t("ok") }]
        );
      }
    } catch (error) {
      console.error('❌ Error fetching contact data:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
      // Show error state instead of fallback data
      setContactData(null);
      Alert.alert(
        t("connection_error_title"),
        t("connection_error_message"),
        [{ text: t("ok") }]
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
      question: t("faq_tracking_question"),
      answer: t("faq_tracking_answer"),
      category: "general",
    },
    {
      id: "2",
      question: t("faq_booking_question"),
      answer: t("faq_booking_answer"),
      category: "booking",
    },
    {
      id: "3",
      question: t("faq_goals_question"),
      answer: t("faq_goals_answer"),
      category: "goals",
    },
    {
      id: "4",
      question: t("faq_history_question"),
      answer: t("faq_history_answer"),
      category: "history",
    },
    {
      id: "5",
      question: t("faq_password_question"),
      answer: t("faq_password_answer"),
      category: "security",
    },
    {
      id: "6",
      question: t("faq_forgot_password_question"),
      answer: t("faq_forgot_password_answer"),
      category: "security",
    },
    {
      id: "7",
      question: t("faq_wellness_question"),
      answer: t("faq_wellness_answer"),
      category: "wellness",
    },
    {
      id: "8",
      question: t("faq_support_question"),
      answer: t("faq_support_answer"),
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
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("help_support_title")}</Text>
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
              <Text style={styles.heroTitle}>{t("help_support_subtitle_1")}</Text>
              <Text style={styles.heroSubtitle}>
                {t("help_support_subtitle_2")}
              </Text>
              {contactData?.primaryContact && (
                <Text style={styles.debugText}>
                  📞 Data dari: {contactData.primaryContact.officeName}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("contact_us_title")}</Text>
          <View style={styles.contactContainer}>
            {loading ? (
              <Card style={styles.loadingCard}>
                <Card.Content>
                  <Text style={styles.loadingText}>{t("loading_contact_info")}</Text>
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
                    <Text style={styles.errorText}>{t("error_loading_contact")}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={fetchContactData}
                    >
                      <Text style={styles.retryButtonText}>{t("try_again")}</Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("quick_actions_title")}</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => {
                Alert.alert(
                  t("report_bug_title"),
                  t("report_bug_message"),
                  [{ text: t("ok") }]
                );
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#EF444420" }]}>
                <Icon name="bug" size={24} color="#EF4444" />
              </View>
              <Text style={styles.quickActionTitle}>{t("report_bug_title")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => {
                Alert.alert(
                  t("feature_suggestion_title"),
                  t("feature_suggestion_message"),
                  [{ text: t("ok") }]
                );
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#10B98120" }]}>
                <Icon name="lightbulb" size={24} color="#10B981" />
              </View>
              <Text style={styles.quickActionTitle}>{t("feature_suggestion_title")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => {
                Alert.alert(
                  t("tutorial_title"),
                  t("tutorial_message"),
                  [{ text: t("ok") }]
                );
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#3B82F620" }]}>
                <Icon name="play-circle" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionTitle}>{t("tutorial_title")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("faq_title")}</Text>
          <View style={styles.faqContainer}>
            {faqData.map(renderFAQItem)}
          </View>
        </View>

                {/* Support Hours */}
        {contactData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("support_hours_title")}</Text>
            <Card style={styles.hoursCard}>
              <Card.Content>
                <View style={styles.hoursItem}>
                  <Icon name="clock" size={20} color="#10B981" />
                  <View style={styles.hoursInfo}>
                    <Text style={styles.hoursTitle}>{t("customer_service_title")}</Text>
                    <Text style={styles.hoursTime}>{contactData.supportHours.customerService}</Text>
                  </View>
                </View>
                <View style={styles.hoursItem}>
                  <Icon name="calendar" size={20} color="#F59E0B" />
                  <View style={styles.hoursInfo}>
                    <Text style={styles.hoursTitle}>{t("booking_consultation_title")}</Text>
                    <Text style={styles.hoursTime}>{contactData.supportHours.bookingHours}</Text>
                  </View>
                </View>
                <View style={styles.hoursItem}>
                  <Icon name="medical-bag" size={20} color="#EF4444" />
                  <View style={styles.hoursInfo}>
                    <Text style={styles.hoursTitle}>{t("emergency_title")}</Text>
                    <Text style={styles.hoursTime}>{contactData.supportHours.emergency}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t("app_version")}</Text>
          <Text style={styles.versionText}>{t("copyright")}</Text>
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
  debugText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
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
