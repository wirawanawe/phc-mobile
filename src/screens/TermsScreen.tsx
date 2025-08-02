import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, Alert } from "react-native";
import {
  Text,
  Button,
  Card,
  Checkbox,
  useTheme,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import LogoPutih from "../components/LogoPutih";

const { width } = Dimensions.get("window");

const TermsScreen = ({ navigation, onTermsAccepted }: any) => {
  const theme = useTheme();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedDataConsent, setAcceptedDataConsent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (acceptedTerms && acceptedPrivacy && acceptedDataConsent && !isProcessing) {
      try {
        setIsProcessing(true);
        
        // Call the callback function passed from parent
        if (onTermsAccepted) {
          await onTermsAccepted();
        }
        
        // Navigate to main screen or next screen
        if (navigation) {
          navigation.replace("Main");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to accept terms. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const allAccepted = acceptedTerms && acceptedPrivacy && acceptedDataConsent;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#D32F2F", "#B71C1C"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LogoPutih size="medium" showText={true} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Terms & Conditions</Text>
              <Text style={styles.subtitle}>
                Baca dan setujui ketentuan kami sebelum menggunakan aplikasi
              </Text>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Terms Cards */}
            <View style={styles.cardsContainer}>
              <Card style={styles.termsCard}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.iconText}>📋</Text>
                    </View>
                    <Text style={styles.cardTitle}>Selamat Datang di PHC</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Platform kesehatan dan kebugaran terdepan untuk karyawan
                    Indonesia. Dengan menggunakan aplikasi ini, Anda menyetujui
                    ketentuan dan kondisi berikut.
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.termsCard}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.iconText}>🔒</Text>
                    </View>
                    <Text style={styles.cardTitle}>
                      Privasi & Keamanan Data
                    </Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Kami berkomitmen melindungi privasi dan keamanan informasi
                    pribadi dan kesehatan Anda. Semua data dienkripsi dan
                    disimpan dengan aman sesuai regulasi perlindungan data
                    kesehatan.
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.termsCard}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.iconText}>📊</Text>
                    </View>
                    <Text style={styles.cardTitle}>
                      Konsentrasi Data Kesehatan
                    </Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Dengan menggunakan aplikasi ini, Anda menyetujui untuk
                    berbagi data asesmen kesehatan, aktivitas kebugaran, dan
                    informasi wellness dengan platform kami untuk rekomendasi
                    kesehatan yang dipersonalisasi.
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.termsCard}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.iconText}>🎯</Text>
                    </View>
                    <Text style={styles.cardTitle}>Penggunaan Data</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Data kesehatan Anda akan digunakan untuk:
                    {"\n"}• Asesmen kesehatan dan rekomendasi yang
                    dipersonalisasi
                    {"\n"}• Pelacakan kemajuan dan analitik
                    {"\n"}• Penyampaian konten edukasi
                    {"\n"}• Koordinasi program wellness
                    {"\n"}• Penelitian dan peningkatan layanan kesehatan
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.termsCard}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.iconText}>⚖️</Text>
                    </View>
                    <Text style={styles.cardTitle}>Hak Anda</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Anda memiliki hak untuk:
                    {"\n"}• Mengakses data kesehatan pribadi Anda
                    {"\n"}• Meminta koreksi atau penghapusan data
                    {"\n"}• Menolak berbagi data
                    {"\n"}• Mencabut konsentrasi kapan saja
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.termsCard}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.iconText}>⚠️</Text>
                    </View>
                    <Text style={styles.cardTitle}>Pernyataan Medis</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Aplikasi ini bukan pengganti saran medis profesional,
                    diagnosis, atau perawatan. Selalu konsultasikan dengan
                    tenaga kesehatan yang berkualifikasi untuk masalah medis.
                  </Text>
                </Card.Content>
              </Card>
            </View>

            {/* Consent Section */}
            <View style={styles.consentContainer}>
              <Text style={styles.consentTitle}>Persetujuan Anda</Text>

              <View style={styles.checkboxContainer}>
                <View style={styles.checkboxRow}>
                  <Checkbox
                    status={acceptedTerms ? "checked" : "unchecked"}
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                    color="#FFFFFF"
                  />
                  <Text style={styles.checkboxLabel}>
                    Saya menyetujui Terms and Conditions
                  </Text>
                </View>

                <View style={styles.checkboxRow}>
                  <Checkbox
                    status={acceptedPrivacy ? "checked" : "unchecked"}
                    onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                    color="#FFFFFF"
                  />
                  <Text style={styles.checkboxLabel}>
                    Saya setuju dengan Kebijakan Privasi
                  </Text>
                </View>

                <View style={styles.checkboxRow}>
                  <Checkbox
                    status={acceptedDataConsent ? "checked" : "unchecked"}
                    onPress={() => setAcceptedDataConsent(!acceptedDataConsent)}
                    color="#FFFFFF"
                  />
                  <Text style={styles.checkboxLabel}>
                    Saya setuju berbagi data kesehatan untuk layanan yang
                    dipersonalisasi
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleAccept}
              disabled={!allAccepted || isProcessing}
              loading={isProcessing}
              style={[
                styles.acceptButton,
                {
                  backgroundColor: allAccepted && !isProcessing
                    ? "#FFFFFF"
                    : "rgba(255,255,255,0.3)",
                },
              ]}
              labelStyle={[
                styles.buttonLabel,
                {
                  color: allAccepted && !isProcessing ? "#D32F2F" : "#FFFFFF",
                },
              ]}
            >
              {isProcessing ? "Memproses..." : "Terima & Lanjutkan"}
            </Button>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  headerText: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  termsCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D32F2F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },
  consentContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  consentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  checkboxContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  acceptButton: {
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TermsScreen;
