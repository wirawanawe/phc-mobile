import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Button, Card, Checkbox, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import LogoPutih from "../components/LogoPutih";

const TermsScreen = ({ navigation, onTermsAccepted }: any) => {
  const theme = useTheme();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedDataConsent, setAcceptedDataConsent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
        Alert.alert("Error", "Gagal menyimpan persetujuan. Silakan coba lagi.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const allAccepted = acceptedTerms && acceptedPrivacy && acceptedDataConsent;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={(theme as any).customColors?.primaryGradient || ["#D32F2F", "#B71C1C"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LogoPutih size={400} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Syarat & Ketentuan</Text>
              <Text style={styles.subtitle}>
                Silakan baca dan setujui syarat & ketentuan berikut
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardsContainer}>
              <Card style={styles.termsCard} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.iconText}>📋</Text>
                    </View>
                    <Text style={styles.cardTitle}>Selamat Datang</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Terima kasih telah memilih Wellness WeCare sebagai partner kesehatan Anda. Aplikasi ini dirancang untuk membantu Anda menjalani gaya hidup yang lebih sehat.
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.termsCard} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.iconText}>🔒</Text>
                    </View>
                    <Text style={styles.cardTitle}>Privasi & Keamanan</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Kami berkomitmen melindungi privasi dan keamanan data pribadi Anda. Data kesehatan Anda akan dienkripsi dan hanya digunakan untuk memberikan layanan terbaik.
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.termsCard} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.iconText}>📊</Text>
                    </View>
                    <Text style={styles.cardTitle}>Penggunaan Data</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Data yang Anda berikan akan digunakan untuk memberikan rekomendasi kesehatan yang personal dan meningkatkan kualitas layanan kami.
                  </Text>
                </Card.Content>
              </Card>
            </View>

            <View style={styles.checkboxContainer}>
              <View style={styles.checkboxItem}>
                <Checkbox
                  status={acceptedTerms ? "checked" : "unchecked"}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  color="#FFFFFF"
                />
                <Text style={styles.checkboxText}>
                  Saya menyetujui Syarat & Ketentuan
                </Text>
              </View>

              <View style={styles.checkboxItem}>
                <Checkbox
                  status={acceptedPrivacy ? "checked" : "unchecked"}
                  onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                  color="#FFFFFF"
                />
                <Text style={styles.checkboxText}>
                  Saya menyetujui Kebijakan Privasi
                </Text>
              </View>

              <View style={styles.checkboxItem}>
                <Checkbox
                  status={acceptedDataConsent ? "checked" : "unchecked"}
                  onPress={() => setAcceptedDataConsent(!acceptedDataConsent)}
                  color="#FFFFFF"
                />
                <Text style={styles.checkboxText}>
                  Saya memberikan persetujuan penggunaan data
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <Button
              mode="contained"
              onPress={handleAccept}
              disabled={!allAccepted || isProcessing}
              loading={isProcessing}
              style={styles.acceptButton}
              labelStyle={styles.acceptButtonLabel}
            >
              {isProcessing ? "Memproses..." : "Setuju & Lanjutkan"}
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
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  logoContainer: {
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
    paddingBottom: 120,
  },
  cardsContainer: {
    paddingHorizontal: 20,
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
  checkboxContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  acceptButton: {
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 6,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  acceptButtonLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default TermsScreen;
