import React from "react";
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

import { safeGoBack } from "../utils/safeNavigation";

const AboutAppScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user } = useAuth();


  const appInfo = {
    name: "DOCTOR PHC Indonesia",
    version: "0.0.1",
    buildNumber: "2025.08.25",
    description: "Aplikasi kesehatan dan wellness komprehensif yang membantu Anda mengelola kesehatan harian, melacak aktivitas, dan mencapai tujuan kesehatan pribadi.",
    features: [
      "Pelacakan Nutrisi & Makanan",
      "Pelacakan Aktivitas & Olahraga",
      "Pelacakan Tidur & Kualitas Tidur",
      "Pelacakan Air Minum",
      "Pelacakan Mood & Kesehatan Mental",
      "Program Wellness & Tantangan Harian",
      "Pelacakan Antropometri & Berat Badan",
      "Riwayat Kesehatan & Aktivitas",
      "Grafik & Analisis Data Kesehatan",
      "Konsultasi Dokter & Booking Klinik",
      "Artikel Kesehatan & Edukasi",
      "Kalkulator Kesehatan",
      "Notifikasi & Pengingat Sehat",
    ],
    team: [
      {
        name: "Tim Pengembangan PHC",
        role: "Mobile Development",
        description: "Mengembangkan aplikasi mobile yang inovatif dan user-friendly",
      },
      {
        name: "Tim Kesehatan",
        role: "Medical Advisory",
        description: "Memastikan konten kesehatan yang akurat dan berbasis bukti",
      },
      {
        name: "Tim UI/UX",
        role: "Design & Experience",
        description: "Menciptakan antarmuka yang intuitif dan pengalaman pengguna yang optimal",
      },
      {
        name: "Tim Dukungan",
        role: "Customer Care",
        description: "Memberikan dukungan teknis dan bantuan pengguna 24/7",
      },
    ],
    contact: {
      email: "support@phc-indonesia.com",
      website: "https://phc-indonesia.com",
      phone: "+62 21-1234-5678",
      address: "Jakarta, Indonesia",
    },
  };

  const handleContactPress = (type: string) => {
    switch (type) {
      case "email":
        Linking.openURL(`mailto:${appInfo.contact.email}`);
        break;
      case "website":
        Linking.openURL(appInfo.contact.website);
        break;
      case "phone":
        Linking.openURL(`tel:${appInfo.contact.phone}`);
        break;
      case "address":
        Alert.alert("Alamat", appInfo.contact.address);
        break;
    }
  };

  const handleShareApp = () => {
    Alert.alert(
      "Bagikan Aplikasi",
      "Bagikan aplikasi Doctor PHC dengan teman dan keluarga Anda!",
      [{ text: "OK" }]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      "Beri Rating",
      "Bantu kami meningkatkan aplikasi dengan memberikan rating dan ulasan!",
      [{ text: "OK" }]
    );
  };

  const renderFeatureItem = (feature: string, index: number) => (
    <View key={index} style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: "#10B98120" }]}>
        <Icon name="check" size={16} color="#10B981" />
      </View>
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  const renderTeamMember = (member: any, index: number) => (
    <View key={index} style={styles.teamMember}>
      <View style={[styles.memberIcon, { backgroundColor: "#667eea20" }]}>
        <Icon name="account-group" size={20} color="#667eea" />
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
        <Text style={styles.memberDescription}>{member.description}</Text>
      </View>
    </View>
  );

  const renderContactItem = (title: string, value: string, icon: string, type: string) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(type)}
    >
      <View style={styles.contactContent}>
        <View style={[styles.contactIcon, { backgroundColor: "#3B82F620" }]}>
          <Icon name={icon} size={20} color="#3B82F6" />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>{title}</Text>
          <Text style={styles.contactValue}>{value}</Text>
        </View>
        <Icon name="chevron-right" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
          <View style={styles.headerRight} />
        </View>

        {/* App Info Hero */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View style={styles.appIcon}>
              <Icon name="heart-pulse" size={48} color="#FFFFFF" />
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{appInfo.name}</Text>
              <Text style={styles.appVersion}>Versi {appInfo.version}</Text>
              <Text style={styles.appDescription}>{appInfo.description}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitur Utama</Text>
          <Card style={styles.card}>
            <Card.Content>
              {appInfo.features.map(renderFeatureItem)}
            </Card.Content>
          </Card>
        </View>

        {/* Mission & Vision */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Misi & Visi</Text>
          <View style={styles.missionContainer}>
            <Card style={styles.missionCard}>
              <Card.Content>
                <View style={styles.missionHeader}>
                  <Icon name="target" size={24} color="#10B981" />
                  <Text style={styles.missionTitle}>Misi</Text>
                </View>
                <Text style={styles.missionText}>
                  Memberikan akses mudah ke layanan kesehatan berkualitas dan mempromosikan gaya hidup sehat melalui teknologi digital yang inovatif
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.missionCard}>
              <Card.Content>
                <View style={styles.missionHeader}>
                  <Icon name="eye" size={24} color="#3B82F6" />
                  <Text style={styles.missionTitle}>Visi</Text>
                </View>
                <Text style={styles.missionText}>
                  Menjadi platform kesehatan digital terdepan di Indonesia yang memberdayakan masyarakat untuk mengelola kesehatan secara proaktif dan berkelanjutan
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tim Kami</Text>
          <Card style={styles.card}>
            <Card.Content>
              {appInfo.team.map(renderTeamMember)}
            </Card.Content>
          </Card>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hubungi Kami</Text>
          <Card style={styles.card}>
            <Card.Content>
              {renderContactItem("Email", appInfo.contact.email, "email", "email")}
              <View style={styles.divider} />
              {renderContactItem("Website", appInfo.contact.website, "web", "website")}
              <View style={styles.divider} />
              {renderContactItem("Telepon", appInfo.contact.phone, "phone", "phone")}
              <View style={styles.divider} />
              {renderContactItem("Alamat", appInfo.contact.address, "map-marker", "address")}
            </Card.Content>
          </Card>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aksi</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShareApp}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#10B98120" }]}>
                <Icon name="share" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionTitle}>Bagikan App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRateApp}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#F59E0B20" }]}>
                <Icon name="star" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionTitle}>Beri Rating</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Card style={styles.card}>
            <Card.Content>
              <TouchableOpacity style={styles.legalItem}>
                <View style={styles.legalContent}>
                  <Icon name="file-document" size={20} color="#6B7280" />
                  <Text style={styles.legalTitle}>Syarat & Ketentuan</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.legalItem}>
                <View style={styles.legalContent}>
                  <Icon name="shield-check" size={20} color="#6B7280" />
                  <Text style={styles.legalTitle}>Kebijakan Privasi</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.legalItem}>
                <View style={styles.legalContent}>
                  <Icon name="cookie" size={20} color="#6B7280" />
                  <Text style={styles.legalTitle}>Kebijakan Cookie</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 DOCTOR PHC Indonesia</Text>
          <Text style={styles.footerText}>Dibuat dengan ❤️ di Indonesia</Text>
          <Text style={styles.footerText}>Build: {appInfo.buildNumber}</Text>
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
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
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
  card: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  missionContainer: {
    gap: 12,
  },
  missionCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  missionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  missionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  teamMember: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  memberIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
  },
  memberDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 18,
  },
  contactItem: {
    paddingVertical: 8,
  },
  contactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
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
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  legalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  legalContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginLeft: 12,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
});

export default AboutAppScreen;
